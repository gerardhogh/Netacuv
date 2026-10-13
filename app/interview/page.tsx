"use client";

import { saveVideoToDB, getVideoFromDB } from "../../lib/indexedDB";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import NetacuvVideoPlayer from "@/components/NetacuvVideoPlayer";
import {
  Bell,
  ChevronDown,
  Menu,
  MoreHorizontal,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  SkipForward,
  Check,
  Home,
  FileText,
  History,
  Video,
  Briefcase,
  Star,
  Share2,
  Settings,
  X,
  LogOut,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  text: string;
  subtitle?: string;
  duration: number;
}

type Phase = "pre_start" | "countdown" | "recording" | "finished";

// ─── Question bank ────────────────────────────────────────────────────────────
const QUESTION_BANK: Question[] = [
  { text: "Présentez-vous en 2 minutes maximum.", duration: 120 },
  { text: "Pourquoi devrions-nous vous recruter ?", duration: 120 },
  { text: "Parlez-nous d'un défi professionnel que vous avez surmonté.", duration: 120 },
  { text: "Quels sont vos points forts et vos points faibles ?", duration: 90 },
  { text: "Où vous voyez-vous dans 5 ans ?", duration: 90 },
  { text: "Décrivez une situation où vous avez travaillé en équipe.", duration: 120 },
  { text: "Comment gérez-vous les conflits au travail ?", duration: 90 },
  { text: "Qu'est-ce qui vous motive dans votre travail ?", duration: 90 },
  { text: "Comment réagissez-vous face à la pression ?", duration: 90 },
  {
    text: "Quel type de management vous convient le mieux ?",
    subtitle:
      "(Comment vous aimez être encadré(e) ou dirigé(e) au travail. En d'autres termes, quel style de gestion vous motive, vous rend productif(ve) et à l'aise dans votre environnement professionnel.)",
    duration: 90,
  },
  { text: "Quelle est votre plus grande qualité ?", duration: 60 },
  { text: "Quels outils utilisez-vous au quotidien dans votre métier ?", duration: 90 },
  {
    text: "Qu'est-ce qui selon vous va vous poser des difficultés dans ce poste ?",
    duration: 90,
  },
  {
    text: "Que faites-vous si vous êtes en désaccord avec votre manager ?",
    duration: 90,
  },
  {
    text: "Comment utilisez-vous l'intelligence artificielle",
    subtitle: "(ex : ChatGPT, Notion AI, etc.) dans votre métier ?",
    duration: 90,
  },
];

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Format time ──────────────────────────────────────────────────────────────
const fmt = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// ─── Beep ─────────────────────────────────────────────────────────────────────
function playBeep(ctx: AudioContext, freq = 440, duration = 0.3, vol = 0.1) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(vol, ctx.currentTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("AudioContext playBeep error:", e);
  }
}

// ─── Current TTS audio element (for cancellation) ────────────────────────────
let currentTtsAudio: HTMLAudioElement | null = null;

// ─── Stop any in-progress AI speech ──────────────────────────────────────────
function stopCurrentTts() {
  if (currentTtsAudio) {
    try {
      currentTtsAudio.pause();
      currentTtsAudio.src = "";
    } catch (_) {}
    currentTtsAudio = null;
  }
}

import { StartInterviewModal, CancelInterviewModal } from "../components/modals/InterviewModals";

// ─── Component ────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const lang = useLocale();
  const t = useTranslations();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  // Randomised questions (stable per session, randomised on mount)
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Shared AudioContext + mixer destination (mic + TTS mixed into one track)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mixerDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<Phase>("pre_start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef(0);
  const handleNextQuestionRef = useRef<() => void>(() => {});
  const [triesLeft, setTriesLeft] = useState(3);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const recognitionRef = useRef<any>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recordedVideoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordedCurrentTime, setRecordedCurrentTime] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const totalRecordedSecondsRef = useRef(0);
  const hasFinalizedRef = useRef(false);
  const interviewHistoryRef = useRef<Array<{ question: string; transcript: string; duration?: number }>>([]);
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAiFollowUp, setIsAiFollowUp] = useState(false);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Camera/mic states
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [voiceLevel, setVoiceLevel] = useState(0); // 0-1

  const sidebarItems = [
    { key: "dashboard", icon: Home, label: "Tableau de bord" },
    { key: "profil", icon: FileText, label: "Mon profil" },
    { key: "transactions", icon: History, label: "Mes transactions" },
    { key: "video", icon: Video, label: "Entretien vidéo" },
    { key: "emplois", icon: Briefcase, label: "Offres d'emploi" },
    { key: "premium", icon: Star, label: "Talents Premium" },
    { key: "affiliation", icon: Share2, label: "Affiliation" },
    { key: "parametres", icon: Settings, label: "Paramètres" },
  ];

  // ── Stop all tracks & release webcam/audio ─────────────────────────────────
  const stopAllMediaTracks = useCallback(() => {
    stopCurrentTts();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) { console.warn("Track stop error:", e); }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) { console.warn("videoRef clear error:", e); }
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try { audioCtxRef.current.close(); } catch (e) { console.warn("AudioContext close error:", e); }
      audioCtxRef.current = null;
      mixerDestRef.current = null;
      mixedStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) { console.warn("MediaRecorder stop error:", e); }
    }
    setIsAiSpeaking(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { console.warn("SpeechRecognition stop error:", e); }
    }
  }, []);

  const stopAllMediaTracksRef = useRef(stopAllMediaTracks);
  useEffect(() => {
    stopAllMediaTracksRef.current = stopAllMediaTracks;
  }, [stopAllMediaTracks]);

  const handleNavigate = (tabKey: string) => {
    stopAllMediaTracks();
    setMenuDrawerOpen(false);
    router.push(`/dashboard/talent?tab=${tabKey}#${tabKey}`);
  };

  // ── Shuffle on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    setQuestions(shuffleArray(QUESTION_BANK));
  }, []);

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;

  // ── Audio analyser + shared AudioContext with mixer destination ───────────────
  // The mixer destination receives both the mic track AND the Gemini TTS audio.
  // MediaRecorder records from this merged stream so the final video has both.
  const startVoiceAnalyser = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    // Mixer destination: mic + TTS will both be connected here
    const mixerDest = ctx.createMediaStreamDestination();
    const micSource = ctx.createMediaStreamSource(stream);

    // Analyser for the voice-level animation (mic only is fine)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    micSource.connect(analyser);
    // Mic also goes into the mixer so talent voice is recorded
    micSource.connect(mixerDest);

    audioCtxRef.current = ctx;
    mixerDestRef.current = mixerDest;
    analyserRef.current = analyser;

    // Build the mixed stream: video from webcam + audio from mixer
    const videoTracks = stream.getVideoTracks();
    const mixedStream = new MediaStream([
      ...videoTracks,
      ...mixerDest.stream.getAudioTracks(),
    ]);
    mixedStreamRef.current = mixedStream;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVoiceLevel(Math.min(avg / 80, 1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Speak question via Gemini TTS and mix audio into the recording ────────────
  const speakCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    const text = currentQuestion.text;
    const subtitle = currentQuestion.subtitle;

    setIsAiSpeaking(true);
    stopCurrentTts();

    fetch("/api/ai/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, subtitle, lang }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`TTS API ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.crossOrigin = "anonymous";
        currentTtsAudio = audio;

        // Route TTS audio through the shared AudioContext mixer so it gets recorded
        if (audioCtxRef.current && mixerDestRef.current) {
          try {
            // Resume context if suspended (browser autoplay policy)
            if (audioCtxRef.current.state === "suspended") {
              await audioCtxRef.current.resume();
            }
            const ttsSource = audioCtxRef.current.createMediaElementSource(audio);
            ttsSource.connect(mixerDestRef.current);
            // Also connect to speakers so talent can hear the question live
            ttsSource.connect(audioCtxRef.current.destination);
          } catch (e) {
            console.warn("TTS audio routing error:", e);
          }
        }

        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentTtsAudio = null;
          setIsAiSpeaking(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          currentTtsAudio = null;
          setIsAiSpeaking(false);
        };

        await audio.play();
      })
      .catch((err) => {
        console.warn("Gemini TTS failed, falling back to Web Speech API:", err);
        // ── Fallback: browser SpeechSynthesis ────────────────────────────────
        setIsAiSpeaking(false);
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        const cleanText = text.replace(/[*_#]/g, "").trim();
        const cleanSub = subtitle ? subtitle.replace(/[()_#]/g, "").trim() : "";
        const fullText = cleanSub ? `${cleanText}. ${cleanSub}` : cleanText;
        const utter = new SpeechSynthesisUtterance(fullText);
        utter.lang = { fr: "fr-FR", en: "en-US", es: "es-ES", pt: "pt-PT", zh: "zh-CN" }[lang] || "fr-FR";
        utter.rate = 0.95;
        utter.onstart = () => setIsAiSpeaking(true);
        utter.onend = () => setIsAiSpeaking(false);
        utter.onerror = () => setIsAiSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      });
  }, [currentQuestion, lang]);

  // ── Webcam & Exit Cleanups ──────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        startVoiceAnalyser(stream);
      })
      .catch((err) => {
        console.warn("Webcam with audio error, retrying video only:", err);
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            if (!active) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
          })
          .catch((e2) => console.error("Webcam error:", e2));
      });

    const handleExit = () => {
      stopAllMediaTracks();
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);
    window.addEventListener("popstate", handleExit);

    return () => {
      active = false;
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("popstate", handleExit);
      stopAllMediaTracks();
    };
  }, [startVoiceAnalyser, stopAllMediaTracks]);

  // ── Toggle camera ────────────────────────────────────────────────────────────
  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !cameraOn;
    });
    setCameraOn((v) => !v);
  };

  // ── Toggle mic ───────────────────────────────────────────────────────────────
  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !micOn;
    });
    setMicOn((v) => !v);
  };

  // ── Countdown timer + beeps + TTS ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(10);
    const ctx = audioCtxRef.current ?? new AudioContext();
    if (!audioCtxRef.current) audioCtxRef.current = ctx;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        // Beep seulement sur les 3 dernières secondes pour que la voix de l'IA soit audible
        if (next <= 3 && next >= 0) {
          playBeep(ctx, next === 0 ? 1320 : 880, 0.15, 0.05);
        }
        if (next <= 0) {
          clearInterval(timer);
          setPhase("recording");
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, questionIndex]);

  // ── Auto-speak question when countdown starts ────────────────────────────────
  // We wait 500ms so the AudioContext has time to initialise after user gesture
  useEffect(() => {
    if (phase === "countdown" && currentQuestion) {
      const t = setTimeout(() => {
        speakCurrentQuestion();
      }, 500);
      return () => {
        clearTimeout(t);
        stopCurrentTts();
      };
    }
  }, [phase, questionIndex, currentQuestion, speakCurrentQuestion]);

  // ── Speech Recognition setup per question ────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
      
      const recognition = recognitionRef.current;
      // Set recognition language based on app language
      const langMap: Record<string, string> = { fr: "fr-FR", en: "en-US", es: "es-ES", pt: "pt-PT", zh: "zh-CN" };
      recognition.lang = langMap[lang] || "fr-FR";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
        transcriptRef.current = finalTranscript;
      };
    }
  }, [lang]);

  // ── Intelligent Next Question & AI Relance ─────────────────────────────────
  const handleNextQuestion = useCallback(async () => {
    stopCurrentTts();
    setIsAiSpeaking(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { console.warn(e); }
    }

    const currentText = currentQuestion ? currentQuestion.text : "";
    const answerTranscript = transcriptRef.current || "";
    const recordedDurationForQuestion = recordingTimeRef.current;

    interviewHistoryRef.current.push({
      question: currentText,
      transcript: answerTranscript,
      duration: recordedDurationForQuestion,
    });

    setRecordingTime(0);
    recordingTimeRef.current = 0;

    const answeredCount = interviewHistoryRef.current.length;
    const maxInterviewQuestions = 5;

    if (answeredCount >= maxInterviewQuestions) {
      setPhase("finished");
      return;
    }

    try {
      const res = await fetch("/api/interview/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: "",
          candidateTranscript: answerTranscript,
          history: interviewHistoryRef.current,
          maxQuestions: maxInterviewQuestions,
          currentQuestionIndex: questionIndex,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isFinished) {
          setPhase("finished");
          return;
        }
        if (data.question) {
          setIsAiFollowUp(Boolean(data.isFollowUp));
          const dynamicQuestion: Question = {
            text: data.question,
            subtitle: data.subtitle || (data.isFollowUp ? "(Relance adaptative de l'IA)" : undefined),
            duration: data.duration || 90,
          };
          setQuestions((prev) => {
            const nextList = [...prev];
            nextList[questionIndex + 1] = dynamicQuestion;
            return nextList;
          });
          setQuestionIndex((prev) => prev + 1);
          setPhase("countdown");
          return;
        }
      }
    } catch (err) {
      console.warn("Erreur next-question dynamique Gemini:", err);
    }

    // Repli de secours sur le catalogue existant
    const nextIndex = questionIndex + 1;
    if (nextIndex < totalQuestions && nextIndex < maxInterviewQuestions) {
      setIsAiFollowUp(false);
      setQuestionIndex(nextIndex);
      setPhase("countdown");
    } else {
      setPhase("finished");
    }
  }, [currentQuestion, questionIndex, totalQuestions]);

  useEffect(() => {
    handleNextQuestionRef.current = handleNextQuestion;
  }, [handleNextQuestion]);

  // ── Recording timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "recording" && currentQuestion) {
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      setTranscript("");
      transcriptRef.current = "";
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) { console.warn(e); }
      }

      const maxDuration = currentQuestion.duration || 90;
      const timer = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          totalRecordedSecondsRef.current += 1;
          if (next >= maxDuration) {
            clearInterval(timer);
            handleNextQuestionRef.current();
            return maxDuration;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, questionIndex]);

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") return undefined;
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      return "video/webm;codecs=vp9";
    }
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      return "video/mp4";
    }
    if (MediaRecorder.isTypeSupported("video/webm")) {
      return "video/webm";
    }
    return undefined;
  };

  // ── Start/Restart MediaRecorder on mixed stream (mic + TTS) ─────────────────
  const startMediaRecorder = useCallback(() => {
    // Prefer the mixed stream (video + mic + TTS), fall back to raw webcam stream
    const targetStream = mixedStreamRef.current ?? streamRef.current;
    if (!targetStream) return;
    chunksRef.current = [];
    try {
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mr = new MediaRecorder(targetStream, options);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(1000);
      mediaRecorderRef.current = mr;
    } catch (err) {
      console.warn("MediaRecorder creation error", err);
    }
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleStart = () => {
    totalRecordedSecondsRef.current = 0;
    hasFinalizedRef.current = false;
    interviewHistoryRef.current = [];
    setAiEvaluation(null);
    setIsAiFollowUp(false);
    setIsPlayingRecorded(false);
    setRecordedCurrentTime(0);
    setRecordedDuration(0);
    setQuestionIndex(0);
    setPhase("countdown");
    startMediaRecorder();
  };

  const handleSkip = () => {
    handleNextQuestion();
  };

  const handleRestart = () => {
    if (triesLeft <= 0) return;
    setTriesLeft((prev) => prev - 1);
    stopCurrentTts();
    setIsAiSpeaking(false);
    hasFinalizedRef.current = false;
    interviewHistoryRef.current = [];
    setAiEvaluation(null);
    setIsAiFollowUp(false);
    totalRecordedSecondsRef.current = 0;
    setIsPlayingRecorded(false);
    setRecordedCurrentTime(0);
    setRecordedDuration(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) { console.warn(e); }
    }
    setQuestions(shuffleArray(QUESTION_BANK));
    setQuestionIndex(0);
    setPhase("countdown");
    startMediaRecorder();
  };

  const togglePlayRecordedVideo = () => {
    const video = recordedVideoPlayerRef.current;
    if (!video) return;
    if (video.paused) {
      video.scrollIntoView({ behavior: "smooth", block: "center" });
      video.play().catch((err) => {
        console.warn("Autoplay recorded video error:", err);
      });
    } else {
      video.pause();
    }
  };

  // ── Progress ─────────────────────────────────────────────────────────────────
  const progressPercent =
    phase === "recording" && currentQuestion
      ? (recordingTime / currentQuestion.duration) * 100
      : 0;

  const isFirstQuestion = questionIndex === 0;
  const countdownTitle =
    phase === "countdown" && isFirstQuestion ? "Soyez prêt !" : "Temps écoulé.";
  const countdownSub =
    phase === "countdown" && isFirstQuestion
      ? "Première Question dans"
      : "Question suivante dans";

  const rightLabel =
    phase === "pre_start"
      ? ""
      : phase === "finished"
      ? "Entretien Terminé"
      : `Question ${questionIndex + 1}`;

  const rightText =
    phase === "countdown"
      ? "..."
      : phase === "recording" && currentQuestion
      ? currentQuestion.text
      : phase === "finished"
      ? "Vos réponses ont été enregistrées avec succès."
      : "";

  const rightSubtitle =
    phase === "recording" ? (currentQuestion?.subtitle ?? null) : null;

  // ── Voice ring size ────────────────────────────────────────────────────────
  const ringScale = 1 + voiceLevel * 0.6;
  const ringOpacity = micOn && phase === "recording" ? Math.min(voiceLevel * 2, 1) : 0;

  // ── Set recorded flag when finished ─────────────────────────────────────────
  const recordedVideoUrlRef = useRef<string | null>(null);
  useEffect(() => {
    recordedVideoUrlRef.current = recordedVideoUrl;
  }, [recordedVideoUrl]);

  useEffect(() => {
    if (phase !== "finished") {
      hasFinalizedRef.current = false;
      return;
    }
    if (hasFinalizedRef.current) return;
    hasFinalizedRef.current = true;

    if (typeof window !== "undefined") {
      localStorage.setItem("interview_recorded", "true");
      const currentUserId = (userRef.current as any)?.id;
      if (currentUserId) localStorage.setItem(`interview_recorded_${currentUserId}`, "true");
    }

    const finalizeAndSave = async () => {
      setIsSavingVideo(true);
      try {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = null;
          if (mediaRecorderRef.current.state !== "inactive") {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {
              console.warn("MediaRecorder stop error:", e);
            }
          }
        }

        // Determine the effective MIME type from the recorder or fallback
        const recorderMime = mediaRecorderRef.current?.mimeType;
        const mimeType = recorderMime && recorderMime.length > 0
          ? recorderMime
          : (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/mp4")
            ? "video/mp4"
            : "video/webm");

        if (chunksRef.current.length > 0) {
          const videoBlob = new Blob(chunksRef.current, { type: mimeType });
          const localVideoUrl = URL.createObjectURL(videoBlob);
          setRecordedVideoUrl(localVideoUrl);

          // 1. Save to IndexedDB first (local backup)
          try {
            await saveVideoToDB(videoBlob);
          } catch (idbErr) {
            console.error("Erreur sauvegarde IndexedDB:", idbErr);
          }

          // 2. Upload to Netacuv server with 15s timeout
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const formData = new FormData();
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            formData.append("video", videoBlob, `interview.${ext}`);
            const currentUserId = (userRef.current as any)?.id;
            if (currentUserId) {
              formData.append("userId", currentUserId);
            }
            const uploadRes = await fetch("/api/talents/video", {
              method: "POST",
              body: formData,
              credentials: "include",
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (uploadRes.ok) {
              const result = await uploadRes.json();
              if (result.videoUrl && typeof window !== "undefined") {
                localStorage.setItem("interview_video_url", result.videoUrl);
                setRecordedVideoUrl(result.videoUrl);
                window.dispatchEvent(new Event("dashboardProfileUpdated"));
              }
            } else {
              console.warn("Échec upload vidéo serveur:", uploadRes.status);
            }
          } catch (e) {
            console.warn("Erreur ou timeout upload vidéo serveur:", e);
          }
        } else {
          // Chunks vides : tenter de récupérer depuis IndexedDB ou localStorage
          try {
            const savedBlob = await getVideoFromDB();
            if (savedBlob && savedBlob.size > 0) {
              const fallbackUrl = URL.createObjectURL(savedBlob);
              setRecordedVideoUrl(fallbackUrl);
            } else {
              const storedUrl = typeof window !== "undefined" ? localStorage.getItem("interview_video_url") : null;
              if (storedUrl) {
                setRecordedVideoUrl(storedUrl);
              }
            }
          } catch (fallbackErr) {
            console.warn("Fallback IndexedDB error:", fallbackErr);
          }
        }
        // 3. Évaluation complète par Gemini 1.5 Pro
        try {
          setIsEvaluating(true);
          const evalRes = await fetch("/api/interview/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobDescription: "",
              history: interviewHistoryRef.current,
              candidateName: (userRef.current as any)?.name || "Candidat",
            }),
          });
          if (evalRes.ok) {
            const evalJson = await evalRes.json();
            if (evalJson.evaluation) {
              setAiEvaluation(evalJson.evaluation);
              if (typeof window !== "undefined") {
                localStorage.setItem("interview_evaluation", JSON.stringify(evalJson.evaluation));
                window.dispatchEvent(new Event("dashboardProfileUpdated"));
              }
            }
          }
        } catch (evalErr) {
          console.warn("Évaluation finale IA non bloquante:", evalErr);
        } finally {
          setIsEvaluating(false);
        }
      } catch (err) {
        console.error("Erreur finalizeAndSave:", err);
      } finally {
        setIsSavingVideo(false);
        // Release camera/mic AFTER everything is processed
        stopAllMediaTracksRef.current();
      }
    };

    // Stop the MediaRecorder first to flush the last data chunk,
    // then finalize in the onstop callback
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {
        finalizeAndSave().catch(console.error);
      };
      try {
        mr.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error", e);
        finalizeAndSave().catch(console.error);
      }
    } else {
      finalizeAndSave().catch(console.error);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      if (recordedVideoUrlRef.current && recordedVideoUrlRef.current.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(recordedVideoUrlRef.current);
        } catch (e) {}
      }
    };
  }, []);

  // ── Guard: wait for questions to load ─────────────────────────────────────
  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#061017] flex flex-col font-sans">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-5 border-b border-white/10 bg-[#061017]">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setMenuDrawerOpen(true)}
            className="p-1.5 -ml-1.5 sm:-ml-2 rounded-xl text-[#008de4] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#008de4]/50 cursor-pointer"
            title="Menu de navigation"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={2.5} />
          </button>
          <div
            onClick={() => handleNavigate("profil")}
            className="text-white text-lg sm:text-2xl flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none"
          >
            <span className="font-light">Profil</span>
            <span className="font-bold">talent</span>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <Bell className="text-white cursor-pointer hover:text-[#008de4] transition-colors w-5 h-5 sm:w-6 sm:h-6" />
          <div
            onClick={() => handleNavigate("profil")}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-blue-100 relative border-2 border-transparent group-hover:border-[#008de4] transition-colors">
              <Image 
                src={user?.avatar || "/assets/avatar_africain.jpg"} 
                alt="Avatar" 
                fill 
                sizes="(max-width: 640px) 32px, 40px"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                }}
                className="object-cover object-center w-full h-full" 
              />
            </div>
            <ChevronDown className="text-white opacity-80 group-hover:opacity-100 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto p-3.5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 lg:gap-12 mt-2 sm:mt-4 lg:mt-6">

        {/* LEFT */}
        <div className="flex flex-col gap-3.5 sm:gap-5">

          {/* Video container */}
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#061527] shadow-2xl border border-sky-400/20">
            {/* Background Netacuv avec symbole N de la page de maintenance */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none bg-gradient-to-b from-[#0b223d] via-[#061527] to-[#030b14]">
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#32A8D7]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#1e8ae9]/20 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0c3e70]/30 rounded-full blur-3xl" />
              <div className="w-[320px] h-[320px] max-w-[80vw] max-h-[80vw] opacity-[0.08] transform -rotate-12 scale-110">
                <Image
                  src="/Logo/SVG/Asset 14.svg"
                  alt="Netacuv Logo"
                  width={320}
                  height={320}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            {phase === "finished" ? (
              recordedVideoUrl ? (
                <NetacuvVideoPlayer
                  src={recordedVideoUrl}
                  videoRef={recordedVideoPlayerRef}
                  aspectRatio="aspect-[16/10]"
                  showBorder={false}
                  className="w-full h-full"
                  onPlay={() => setIsPlayingRecorded(true)}
                  onPause={() => setIsPlayingRecorded(false)}
                  onEnded={() => setIsPlayingRecorded(false)}
                  onTimeUpdate={(e) => {
                    setRecordedCurrentTime(e.currentTarget.currentTime);
                  }}
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    const d = v.duration;
                    if (d && !isNaN(d) && isFinite(d) && d > 0) {
                      setRecordedDuration(d);
                    } else if (totalRecordedSecondsRef.current > 0) {
                      setRecordedDuration(totalRecordedSecondsRef.current);
                    }
                  }}
                />
              ) : (
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#008de4]/20 border border-[#008de4]/30 flex items-center justify-center mb-3 text-[#32A8D7]">
                    <Video className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-white font-bold text-sm sm:text-base">Préparation de votre vidéo enregistrée...</p>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Votre vidéo est en cours de traitement pour le visionnage.</p>
                </div>
              )
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`relative z-1 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${cameraOn ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              />
            )}

            {/* Camera off placeholder */}
            {!cameraOn && phase !== "finished" && (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <CameraOff className="w-7 h-7 text-white/60" />
                </div>
                <p className="text-white font-bold text-sm">Caméra désactivée</p>
                <p className="text-white/50 text-xs mt-1">Activez votre caméra ci-dessous pour reprendre le flux vidéo</p>
              </div>
            )}

            {/* Countdown overlay */}
            {phase === "countdown" && (
              <div className="absolute inset-0 bg-[#061017]/75 flex flex-col items-center justify-center z-10 px-4 text-center">
                <h2 className="text-white text-2xl sm:text-4xl lg:text-[46px] font-black mb-1 sm:mb-2 drop-shadow-lg tracking-tight">
                  {countdownTitle}
                </h2>
                <p className="text-white/90 text-xs sm:text-lg lg:text-[22px] mb-2 sm:mb-3 font-medium drop-shadow-md">
                  {countdownSub}
                </p>
                <div className="text-[#32A8D7] text-6xl sm:text-8xl lg:text-[130px] font-black leading-none drop-shadow-2xl">
                  {countdown}
                </div>
              </div>
            )}

            {/* ── Camera / Mic buttons (bottom-left) ── */}
            {(phase === "recording" || phase === "countdown") && (
              <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 flex gap-2 sm:gap-3 z-20">
                {/* Mic button with voice animation */}
                <div className="relative">
                  {/* Animated ring */}
                  <div
                    className="absolute inset-0 rounded-full bg-[#32A8D7]/40 transition-all duration-75"
                    style={{
                      transform: `scale(${ringScale})`,
                      opacity: ringOpacity,
                    }}
                  />
                  <button
                    onClick={toggleMic}
                    title={micOn ? "Désactiver le micro" : "Activer le micro"}
                    className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border sm:border-2 backdrop-blur-sm transition-all duration-200 shadow-lg ${
                      micOn
                        ? "bg-white/15 border-white/30 hover:bg-white/25"
                        : "bg-red-600/80 border-red-500 hover:bg-red-700"
                    }`}
                  >
                    {micOn ? (
                      <Mic className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                    )}
                  </button>
                </div>

                {/* Camera button */}
                <button
                  onClick={toggleCamera}
                  title={cameraOn ? "Désactiver la caméra" : "Activer la caméra"}
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border sm:border-2 backdrop-blur-sm transition-all duration-200 shadow-lg ${
                    cameraOn
                      ? "bg-white/15 border-white/30 hover:bg-white/25"
                      : "bg-red-600/80 border-red-500 hover:bg-red-700"
                  }`}
                >
                  {cameraOn ? (
                    <Camera className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                  ) : (
                    <CameraOff className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* ── Passer & Terminer buttons (bottom-right) ── */}
            {(phase === "recording" || phase === "countdown") && (
              <div className="absolute bottom-2.5 sm:bottom-4 right-2.5 sm:right-4 z-20 flex gap-1.5 sm:gap-3">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm hover:bg-white/25 active:scale-95 transition-all duration-200 text-white text-[11px] sm:text-[13px] font-medium shadow-lg"
                >
                  <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Passer
                </button>
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setPhase("finished");
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#008de4] hover:bg-blue-600 active:scale-95 transition-all duration-200 text-white text-[11px] sm:text-[13px] font-medium shadow-lg"
                >
                  Terminer
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar / Player Bar */}
          <div className="bg-[#03090e] rounded-full px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-5 border border-white/5 shadow-inner">
            {/* Play/Pause or Voice / Status Icon */}
            {phase === "finished" ? (
              <button
                type="button"
                onClick={togglePlayRecordedVideo}
                title={isPlayingRecorded ? "Mettre en pause" : "Lire la vidéo"}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#008de4] hover:bg-blue-600 flex items-center justify-center flex-shrink-0 text-white cursor-pointer transition-all active:scale-95 shadow-md"
              >
                {isPlayingRecorded ? (
                  <Pause size={15} className="fill-white" />
                ) : (
                  <Play size={15} className="fill-white ml-0.5" />
                )}
              </button>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#008de4] flex items-center justify-center flex-shrink-0">
                {phase === "recording" ? (
                  <div className="flex gap-0.5 sm:gap-1 items-center justify-center">
                    <div className="w-[4px] sm:w-[5px] h-[4px] sm:h-[5px] bg-white rounded-full transition-transform duration-75" style={{ transform: `scale(${1 + voiceLevel * 1.5})` }}></div>
                    <div className="w-[4px] sm:w-[5px] h-[4px] sm:h-[5px] bg-white rounded-full transition-transform duration-75 delay-[50ms]" style={{ transform: `scale(${1 + voiceLevel * 2.5})` }}></div>
                    <div className="w-[4px] sm:w-[5px] h-[4px] sm:h-[5px] bg-white rounded-full transition-transform duration-75 delay-100" style={{ transform: `scale(${1 + voiceLevel * 1.5})` }}></div>
                  </div>
                ) : (
                  <MoreHorizontal size={18} className="text-white" />
                )}
              </div>
            )}

            {/* Elapsed */}
            <span className="font-bold text-white text-xs sm:text-[15px] tracking-wide w-[42px] sm:w-[52px] flex-shrink-0 tabular-nums">
              {phase === "recording"
                ? fmt(recordingTime)
                : phase === "finished"
                ? fmt(Math.floor(recordedCurrentTime))
                : "00:00"}
            </span>

            {/* Track */}
            <div
              className={`flex-1 h-2 sm:h-2.5 bg-slate-800 rounded-full relative overflow-hidden ${
                phase === "finished" ? "cursor-pointer" : ""
              }`}
              onClick={(e) => {
                if (phase === "finished" && recordedVideoPlayerRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  const dur = recordedDuration || totalRecordedSecondsRef.current || 1;
                  recordedVideoPlayerRef.current.currentTime = ratio * dur;
                }
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#008de4] rounded-full transition-all duration-200 ease-linear"
                style={{
                  width: `${
                    phase === "finished"
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            (recordedCurrentTime /
                              (recordedDuration || totalRecordedSecondsRef.current || 1)) *
                              100
                          )
                        )
                      : Math.max(progressPercent, 1)
                  }%`,
                }}
              />
            </div>

            {/* Thumb indicator */}
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 bg-[#008de4] rounded-sm shadow-[0_0_8px_rgba(0,141,228,0.6)] flex-shrink-0 transition-opacity duration-300 hidden sm:block"
              style={{ opacity: phase === "recording" || phase === "finished" ? 1 : 0.3 }}
            />

            {/* Max duration */}
            <span className="font-bold text-[#008de4] text-xs sm:text-[15px] tracking-wide flex-shrink-0 w-[42px] sm:w-[52px] text-right tabular-nums">
              {phase === "recording" || phase === "countdown"
                ? fmt(currentQuestion?.duration ?? 0)
                : phase === "finished"
                ? fmt(Math.ceil(recordedDuration || totalRecordedSecondsRef.current || 0))
                : "00:00"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col pt-1 sm:pt-2">
          {/* Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-8">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#008de4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#008de4]">Entretien Vidéo</h1>
          </div>

          {/* Question label with TTS audio button */}
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3 min-h-[30px]">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-[#008de4] text-sm sm:text-lg lg:text-[20px] font-medium truncate">
                {rightLabel}
              </h3>
              {isAiFollowUp && (phase === "countdown" || phase === "recording") && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-semibold shrink-0">
                  Relance IA
                </span>
              )}
            </div>
            {(phase === "countdown" || phase === "recording") && currentQuestion && (
              <button
                type="button"
                onClick={speakCurrentQuestion}
                disabled={isAiSpeaking}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isAiSpeaking
                    ? "bg-[#32A8D7]/20 border-[#32A8D7] text-[#32A8D7] animate-pulse"
                    : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:text-white"
                }`}
                title="Écouter la question posée par l'IA"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isAiSpeaking ? "text-[#32A8D7] animate-bounce" : ""}`} />
                <span>{isAiSpeaking ? "L'IA lit la question..." : "Écouter la question"}</span>
              </button>
            )}
          </div>

          {/* Question text */}
          <div className="text-white text-base sm:text-xl lg:text-[22px] font-bold mb-3 sm:mb-4 leading-snug min-h-[50px] sm:min-h-[80px]">
            {rightText}
            {rightSubtitle && (
              <span className="block text-xs sm:text-[13px] font-normal italic text-white/60 mt-1.5 sm:mt-2 leading-relaxed">
                {rightSubtitle}
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* NB Box & Tries (Hidden when finished) */}
          {phase !== "finished" && (
            <>
              <div className="bg-[#0a1e2d] rounded-lg p-3.5 sm:p-5 border border-white/5 mb-3 sm:mb-6 text-xs sm:text-[13.5px] text-[#94a3b8] leading-[1.6] shadow-lg">
                <p className="mb-2 sm:mb-4">
                  <span className="font-bold text-white">NB : </span>
                  Vous disposez de 3 tentatives. En cas d&apos;annulation, l&apos;entretien recommence depuis le début.
                </p>
                <p>
                  Si vous utilisez vos 3 tentatives sans succès, vous devrez attendre 3 jours avant de pouvoir réessayer.
                </p>
              </div>

              <div className="bg-[#121919] rounded-lg p-3 sm:p-5 border border-white/5 mb-4 sm:mb-8 shadow-lg flex items-center justify-between">
                <p className="text-white font-bold text-xs sm:text-[15px]">
                  Essais restants : <span className="text-[#008de4] font-extrabold">{triesLeft}</span>
                </p>
              </div>
            </>
          )}

          {/* Success Checkmark Modal in Right Panel */}
          {phase === "finished" && (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4 shadow-xl">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-500 flex items-center justify-center mb-2.5 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                <Check className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={3} />
              </div>
              <h3 className="text-white text-base sm:text-lg font-bold text-center">Félicitations !</h3>
              <p className="text-green-400 text-xs sm:text-[13px] text-center mt-1 font-medium">Votre entretien a été validé et enregistré.</p>
            </div>
          )}

          {/* AI Evaluation Report Summary */}
          {phase === "finished" && isEvaluating && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-sky-300 text-xs mb-4 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#32A8D7]" />
              <span>Génération du rapport d&apos;évaluation IA par Gemini 1.5 Pro...</span>
            </div>
          )}

          {phase === "finished" && aiEvaluation && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 text-xs space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-white font-bold text-xs sm:text-sm">Rapport IA Netacuv</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300 text-[11px]">Score :</span>
                  <span className="text-sm font-extrabold text-[#32A8D7]">{aiEvaluation.overallScore}/100</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      aiEvaluation.recommendation === "SHORTLIST"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : aiEvaluation.recommendation === "REVIEW"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {aiEvaluation.recommendation}
                  </span>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed text-[11px]">
                {aiEvaluation.summary}
              </p>
              {aiEvaluation.strengths && aiEvaluation.strengths.length > 0 && (
                <div className="pt-1">
                  <span className="text-emerald-400 font-bold block mb-1 text-[11px]">Points forts :</span>
                  <div className="flex flex-wrap gap-1">
                    {aiEvaluation.strengths.slice(0, 3).map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {phase === "finished" ? (
              <div className="flex flex-col gap-2.5">
                {/* Sync badge — only visible while saving */}
                {isSavingVideo && (
                  <div className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-medium animate-in fade-in duration-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>Synchronisation et enregistrement de votre vidéo en cours...</span>
                  </div>
                )}

                <div className="flex flex-row gap-2.5">
                  {/* Visualiser la vidéo */}
                  <button
                    type="button"
                    onClick={togglePlayRecordedVideo}
                    className="flex-1 h-11 px-3 sm:px-4 rounded-full bg-[#008de4] hover:bg-blue-600 text-white active:scale-95 transition-all text-[11px] sm:text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 overflow-hidden"
                  >
                    {isPlayingRecorded ? (
                      <>
                        <Pause className="w-4 h-4 fill-white flex-shrink-0" />
                        <span className="truncate">Pause vidéo</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white flex-shrink-0" />
                        <span className="truncate">Visualiser la vidéo</span>
                      </>
                    )}
                  </button>

                  {/* Retour au profil */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("video")}
                    className="flex-1 h-11 px-3 sm:px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all text-[11px] sm:text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 overflow-hidden"
                  >
                    <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Retour au profil</span>
                  </button>
                </div>

                {/* Accéder à mon tableau de bord */}
                <button
                  type="button"
                  onClick={() => {
                    stopAllMediaTracks();
                    router.push("/dashboard/talent");
                  }}
                  className="w-full px-4 py-2.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all text-xs sm:text-[13px] font-medium text-center cursor-pointer"
                >
                  Accéder à mon tableau de bord
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
                {/* Cancel button only during test */}
                <button 
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 sm:px-5 py-2.5 rounded-full border border-red-500/80 text-red-500 hover:bg-red-500/10 transition-colors text-xs sm:text-[14px] font-medium whitespace-nowrap text-center cursor-pointer"
                >
                  Annuler le test
                </button>

                {phase === "pre_start" && (
                  <button
                    onClick={() => setIsStartModalOpen(true)}
                    className="flex-1 px-4 sm:px-5 py-2.5 rounded-full bg-[#008de4] text-white hover:bg-blue-600 active:scale-95 transition-all text-xs sm:text-[14px] font-medium text-center cursor-pointer shadow-md"
                  >
                    Commencer le test
                  </button>
                )}

                {(phase === "recording" || phase === "countdown") && (
                  <button
                    onClick={handleRestart}
                    disabled={triesLeft <= 0}
                    className="flex-1 px-4 sm:px-5 py-2.5 rounded-full bg-[#008de4] text-white hover:bg-blue-600 active:scale-95 transition-all text-xs sm:text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed text-center cursor-pointer shadow-md"
                  >
                    Recommencer le test
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── SIDEBAR DRAWER (Dashboard Navigation) ── */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#091522] border-r border-white/10 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="relative h-6 w-24">
                <Image
                  src="/Logo/PNG/Logo%20white.png"
                  alt="Netacuv Logo"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMenuDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {sidebarItems.map(({ key, icon: Icon, label }) => {
                const isActive = key === "video";
                return (
                  <button
                    key={key}
                    onClick={() => handleNavigate(key)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? "bg-[#008de4] text-white shadow-lg shadow-blue-500/25 translate-x-1"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-[#008de4]"} />
                    <span className="whitespace-nowrap text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile Card & Logout */}
            <div className="p-4 border-t border-white/10 bg-[#061017]/60">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/20 flex-shrink-0">
                  <Image
                    src={user?.avatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    width={40}
                    height={40}
                    priority
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                    }}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || "Candidat"}
                  </p>
                  <p className="text-[11px] text-white/50 truncate">
                    {user?.email || "candidat@email.com"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    stopAllMediaTracks();
                    logout();
                    router.push("/connexion");
                  }}
                  className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StartInterviewModal 
        isOpen={isStartModalOpen} 
        onClose={() => setIsStartModalOpen(false)} 
        onConfirm={handleStart} 
      />

      <CancelInterviewModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={() => {
          stopAllMediaTracks();
          router.push("/dashboard/talent");
        }} 
      />
    </div>
  );
}
