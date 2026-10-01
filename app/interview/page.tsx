"use client";

import { saveVideoToDB } from "../../lib/indexedDB";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
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
  { text: "Quels sont vos points forts et vos points faibles ?", duration: 80 },
  { text: "Où vous voyez-vous dans 5 ans ?", duration: 80 },
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
  { text: "Quelle est votre plus grande qualité ?", duration: 30 },
  { text: "Quels outils utilisez-vous au quotidien dans votre métier ?", duration: 90 },
  {
    text: "Qu'est-ce qui selon vous va vous poser des difficultés dans ce poste ?",
    duration: 80,
  },
  {
    text: "Que faites-vous si vous êtes en désaccord avec votre manager ?",
    duration: 80,
  },
  {
    text: "Comment utilisez-vous l'intelligence artificielle",
    subtitle: "(ex : ChatGPT, Notion AI, etc.) dans votre métier ?",
    duration: 80,
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
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  
  // 50ms fade in / fade out for smooth sound
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(vol, ctx.currentTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// ─── Speak question ───────────────────────────────────────────────────────────
async function speakText(text: string, subtitle?: string) {
  const fullText = subtitle ? `${text}. ${subtitle}` : text;
  
  // // Structure modulaire pour provider externe (ex: ElevenLabs / OpenAI)
  // const useExternalTTS = false;
  // if (useExternalTTS) {
  //   try {
  //     const audioUrl = await fetchExternalTTS(fullText);
  //     const audio = new Audio(audioUrl);
  //     audio.play();
  //     return;
  //   } catch (e) {
  //     console.error("External TTS failed, fallback to native", e);
  //   }
  // }

  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const utter = new SpeechSynthesisUtterance(fullText);
  utter.lang = "fr-FR";
  // Pitch and rate adjusted slightly for a more grounded, calm (natural) tone
  utter.rate = 0.95;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const frVoices = voices.filter((v) => v.lang.startsWith("fr"));
  
  // Priorité : Neural2, Natural, Google (sans Thomas), puis Hortense/Denise/Amélie
  let selectedVoice = frVoices.find(v => v.name.includes("Neural2") && v.name.includes("Female"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.includes("Neural2"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.toLowerCase().includes("natural") && v.name.toLowerCase().includes("female"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.includes("Google") && !v.name.includes("Thomas"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.includes("Hortense"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.includes("Denise"));
  if (!selectedVoice) selectedVoice = frVoices.find(v => v.name.includes("Amélie"));
  if (!selectedVoice) selectedVoice = frVoices[0]; // fallback
  
  if (selectedVoice) utter.voice = selectedVoice;

  window.speechSynthesis.speak(utter);
}

import { StartInterviewModal, CancelInterviewModal } from "../components/modals/InterviewModals";

// ─── Component ────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  // Randomised questions (stable per session, randomised on mount)
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<Phase>("pre_start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [recordingTime, setRecordingTime] = useState(0);
  const [triesLeft, setTriesLeft] = useState(3);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Track stop error:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {
        console.warn("videoRef clear error:", e);
      }
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.warn("AudioContext close error:", e);
      }
      audioCtxRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleNavigate = (tabKey: string) => {
    stopAllMediaTracks();
    setMenuDrawerOpen(false);
    router.push(`/dashboard/talent?tab=${tabKey}`);
  };

  // ── Shuffle on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    setQuestions(shuffleArray(QUESTION_BANK));
  }, []);

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;

  // ── Audio analyser for voice animation ──────────────────────────────────────
  const startVoiceAnalyser = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVoiceLevel(Math.min(avg / 80, 1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

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
        // Beep on every tick
        playBeep(ctx, next === 0 ? 1320 : 880);
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

  // ── Speak question when recording starts ─────────────────────────────────────
  useEffect(() => {
    if (phase === "recording" && currentQuestion) {
      // Small delay so beep finishes
      const t = setTimeout(() => {
        speakText(currentQuestion.text, currentQuestion.subtitle);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, questionIndex]);

  // ── Recording timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "recording" || !currentQuestion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecordingTime(0);
    const maxDuration = currentQuestion.duration;
    const timer = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= maxDuration) {
          clearInterval(timer);
          window.speechSynthesis?.cancel();
          const nextIndex = questionIndex + 1;
          if (nextIndex < totalQuestions) {
            setQuestionIndex(nextIndex);
            setPhase("countdown");
          } else {
            setPhase("finished");
          }
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, questionIndex, questions]);

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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleStart = () => {
    setQuestionIndex(0);
    setPhase("countdown");
    if (streamRef.current) {
      chunksRef.current = [];
      try {
        const mimeType = getSupportedMimeType();
        const options = mimeType ? { mimeType } : undefined;
        const mr = new MediaRecorder(streamRef.current, options);
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start(1000);
        mediaRecorderRef.current = mr;
      } catch (err) {
        console.warn("MediaRecorder creation error", err);
      }
    }
  };

  const handleSkip = () => {
    window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecordingTime(0);
    const nextIndex = questionIndex + 1;
    if (nextIndex < totalQuestions) {
      setQuestionIndex(nextIndex);
      setPhase("countdown");
    } else {
      setPhase("finished");
    }
  };

  const handleRestart = () => {
    if (triesLeft <= 0) return;
    setTriesLeft((prev) => prev - 1);
    window.speechSynthesis?.cancel();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setQuestions(shuffleArray(QUESTION_BANK));
    setQuestionIndex(0);
    setPhase("countdown");
    if (streamRef.current) {
      chunksRef.current = [];
      try {
        const mimeType = getSupportedMimeType();
        const options = mimeType ? { mimeType } : undefined;
        const mr = new MediaRecorder(streamRef.current, options);
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start(1000);
        mediaRecorderRef.current = mr;
      } catch (err) {
        console.warn("MediaRecorder restart error", err);
      }
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
  useEffect(() => {
    if (phase === "finished") {
      if (user?.id) localStorage.setItem(`interview_recorded_${user.id}`, "true");
      
      const finalizeAndSave = async () => {
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : (mediaRecorderRef.current?.mimeType || "video/webm");

        if (chunksRef.current.length > 0) {
          const videoBlob = new Blob(chunksRef.current, { type: mimeType });
          const videoUrl = URL.createObjectURL(videoBlob);
          setRecordedVideoUrl(videoUrl);
          await saveVideoToDB(videoBlob);
          
          // Upload to Supabase so recruiter/admin can view it
          try {
            const formData = new FormData();
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            formData.append("video", videoBlob, `interview.${ext}`);
            // Pass userId explicitly so the API can identify the user even without session cookie
            if ((user as any)?.id) {
              formData.append("userId", (user as any).id);
            }
            const uploadRes = await fetch("/api/talents/video", {
              method: "POST",
              body: formData,
              credentials: "include", // Pass auth session cookies
            });
            if (!uploadRes.ok) {
              const errData = await uploadRes.json().catch(() => ({}));
              console.error("Video upload failed:", uploadRes.status, errData);
            } else {
              const result = await uploadRes.json();
              console.log("Video uploaded successfully:", result.videoUrl);
            }
          } catch (e) {
            console.error("Failed to upload video to Supabase", e);
          }
        }
        // Stop media tracks now that the interview is done
        stopAllMediaTracks();
      };

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          finalizeAndSave().catch(console.error);
        };
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn("MediaRecorder stop error", e);
          finalizeAndSave().catch(console.error);
        }
      } else {
        finalizeAndSave().catch(console.error);
      }
    }
  }, [phase, stopAllMediaTracks]);

  useEffect(() => {
    return () => {
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  }, [recordedVideoUrl]);

  // ── Guard: wait for questions to load ─────────────────────────────────────
  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#061017] flex flex-col font-sans">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#061017]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMenuDrawerOpen(true)}
            className="p-1.5 -ml-2 rounded-xl text-[#008de4] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#008de4]/50 cursor-pointer"
            title="Menu de navigation"
            aria-label="Ouvrir le menu"
          >
            <Menu size={36} strokeWidth={2.5} />
          </button>
          <div
            onClick={() => handleNavigate("profil")}
            className="text-white text-2xl flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="font-light">Profil</span>
            <span className="font-bold">talent</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Bell className="text-white cursor-pointer hover:text-[#008de4] transition-colors" size={24} />
          <div
            onClick={() => handleNavigate("profil")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 relative border-2 border-transparent group-hover:border-[#008de4] transition-colors">
              <Image src={user?.avatar || "/assets/avatar_africain.jpg"} alt="Avatar" fill className="object-cover object-center w-full h-full" />
            </div>
            <ChevronDown className="text-white opacity-80 group-hover:opacity-100" size={16} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 mt-6">

        {/* LEFT */}
        <div className="flex flex-col gap-5">

          {/* Video container */}
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black shadow-2xl">
            {phase === "finished" && recordedVideoUrl ? (
              <video
                src={recordedVideoUrl}
                controls
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (!isFinite(v.duration) || v.duration === 0) {
                    v.currentTime = 1e101;
                    v.ontimeupdate = () => {
                      v.ontimeupdate = null;
                      v.currentTime = 0.001;
                    };
                  } else {
                    if (v.currentTime === 0) {
                      v.currentTime = 0.001;
                    }
                  }
                }}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${cameraOn ? "opacity-100" : "opacity-0"}`}
              />
            )}

            {/* Camera off placeholder */}
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1629]">
                <CameraOff size={56} className="text-white/30 mb-3" />
                <p className="text-white/40 text-sm">Caméra désactivée</p>
              </div>
            )}

            {/* Countdown overlay */}
            {phase === "countdown" && (
              <div className="absolute inset-0 bg-[#061017]/65 flex flex-col items-center justify-center z-10">
                <h2 className="text-white text-[52px] font-black mb-1 drop-shadow-lg">
                  {countdownTitle}
                </h2>
                <p className="text-white/90 text-[24px] mb-2 font-medium drop-shadow-md">
                  {countdownSub}
                </p>
                <div className="text-[#32A8D7] text-[160px] font-black leading-none drop-shadow-2xl">
                  {countdown}
                </div>
              </div>
            )}

            {/* ── Camera / Mic buttons (bottom-left) ── */}
            {(phase === "recording" || phase === "countdown") && (
              <div className="absolute bottom-4 left-4 flex gap-3 z-20">
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
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 backdrop-blur-sm transition-all duration-200 shadow-lg ${
                      micOn
                        ? "bg-white/10 border-white/30 hover:bg-white/20"
                        : "bg-red-600/80 border-red-500 hover:bg-red-700"
                    }`}
                  >
                    {micOn ? (
                      <Mic size={18} className="text-white" />
                    ) : (
                      <MicOff size={18} className="text-white" />
                    )}
                  </button>
                </div>

                {/* Camera button */}
                <button
                  onClick={toggleCamera}
                  title={cameraOn ? "Désactiver la caméra" : "Activer la caméra"}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-2 backdrop-blur-sm transition-all duration-200 shadow-lg ${
                    cameraOn
                      ? "bg-white/10 border-white/30 hover:bg-white/20"
                      : "bg-red-600/80 border-red-500 hover:bg-red-700"
                  }`}
                >
                  {cameraOn ? (
                    <Camera size={18} className="text-white" />
                  ) : (
                    <CameraOff size={18} className="text-white" />
                  )}
                </button>
              </div>
            )}

            {/* ── Passer & Terminer buttons (bottom-right) ── */}
            {(phase === "recording" || phase === "countdown") && (
              <div className="absolute bottom-4 right-4 z-20 flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm hover:bg-white/20 active:scale-95 transition-all duration-200 text-white text-[13px] font-medium shadow-lg"
                >
                  <SkipForward size={15} />
                  Passer
                </button>
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setPhase("finished");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#008de4] hover:bg-blue-600 active:scale-95 transition-all duration-200 text-white text-[13px] font-medium shadow-lg"
                >
                  Terminer et enregistrer
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-[#03090e] rounded-full px-6 py-4 flex items-center gap-5 border border-white/5 shadow-inner">
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-[#008de4] flex items-center justify-center flex-shrink-0">
              {phase === "recording" ? (
                <div className="flex gap-1 items-center justify-center">
                  <div className="w-[5px] h-[5px] bg-white rounded-full transition-transform duration-75" style={{ transform: `scale(${1 + voiceLevel * 1.5})` }}></div>
                  <div className="w-[5px] h-[5px] bg-white rounded-full transition-transform duration-75 delay-[50ms]" style={{ transform: `scale(${1 + voiceLevel * 2.5})` }}></div>
                  <div className="w-[5px] h-[5px] bg-white rounded-full transition-transform duration-75 delay-100" style={{ transform: `scale(${1 + voiceLevel * 1.5})` }}></div>
                </div>
              ) : (
                <MoreHorizontal size={20} className="text-white" />
              )}
            </div>

            {/* Elapsed */}
            <span className="font-bold text-white text-[15px] tracking-wide w-[52px] flex-shrink-0 tabular-nums">
              {phase === "recording" ? fmt(recordingTime) : "00:00"}
            </span>

            {/* Track */}
            <div className="flex-1 h-2.5 bg-slate-800 rounded-full relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#008de4] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.max(progressPercent, 1)}%` }}
              />
            </div>

            {/* Thumb indicator */}
            <div
              className="w-4 h-4 bg-[#008de4] rounded-sm shadow-[0_0_8px_rgba(0,141,228,0.6)] flex-shrink-0 transition-opacity duration-300"
              style={{ opacity: phase === "recording" ? 1 : 0.3 }}
            />

            {/* Max duration */}
            <span className="font-bold text-[#008de4] text-[15px] tracking-wide flex-shrink-0 w-[52px] text-right tabular-nums">
              {phase === "recording" || phase === "countdown"
                ? fmt(currentQuestion?.duration ?? 0)
                : "00:00"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col pt-2">
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#008de4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <h1 className="text-[26px] font-bold text-[#008de4]">Entretien Vidéo</h1>
          </div>

          {/* Question label */}
          <h3 className="text-[#008de4] text-[20px] font-medium mb-3 min-h-[28px]">
            {rightLabel}
          </h3>

          {/* Question text */}
          <div className="text-white text-[22px] font-bold mb-3 leading-snug min-h-[80px]">
            {rightText}
            {rightSubtitle && (
              <span className="block text-[13px] font-normal italic text-white/60 mt-2 leading-relaxed">
                {rightSubtitle}
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* NB Box & Tries (Hidden when finished) */}
          {phase !== "finished" && (
            <>
              <div className="bg-[#0a1e2d] rounded-lg p-5 border border-white/5 mb-6 text-[13.5px] text-[#94a3b8] leading-[1.6] shadow-lg">
                <p className="mb-4">
                  <span className="font-bold text-white">NB : </span>
                  Vous disposez de 3 tentatives. En cas d&apos;annulation, l&apos;entretien recommence depuis le début.
                </p>
                <p>
                  Si vous utilisez vos 3 tentatives sans succès, vous devrez attendre 3 jours avant de pouvoir réessayer.
                </p>
              </div>

              <div className="bg-[#121919] rounded-lg p-5 border border-white/5 mb-8 shadow-lg">
                <p className="text-white font-bold text-[15px]">
                  Essais restants : {triesLeft}
                </p>
              </div>
            </>
          )}

          {/* Success Checkmark Modal in Right Panel */}
          {phase === "finished" && (
            <div className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/20 rounded-2xl mb-8 animate-in fade-in zoom-in duration-500 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="text-white text-xl font-bold text-center">Félicitations !</h3>
              <p className="text-green-400 text-[14px] text-center mt-2 font-medium">Votre entretien a été validé et enregistré.</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 items-center">
            {/* Cancel always visible */}
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="px-5 py-2.5 rounded-full border border-red-500/80 text-red-500 hover:bg-red-500/10 transition-colors text-[14px] font-medium whitespace-nowrap"
            >
              Annuler le test
            </button>

            {phase === "pre_start" && (
              <button
                onClick={() => setIsStartModalOpen(true)}
                className="flex-1 px-5 py-2.5 rounded-full bg-[#008de4] text-white hover:bg-blue-600 active:scale-95 transition-all text-[14px] font-medium"
              >
                Commencer le test
              </button>
            )}

            {(phase === "recording" || phase === "countdown") && (
              <button
                onClick={handleRestart}
                disabled={triesLeft <= 0}
                className="flex-1 px-5 py-2.5 rounded-full bg-[#008de4] text-white hover:bg-blue-600 active:scale-95 transition-all text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Recommencer le test
              </button>
            )}

            {phase === "finished" && (
              <button
                onClick={() => handleNavigate("video")}
                className="flex-1 w-full px-5 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all text-[14px] font-medium"
              >
                Retour au profil
              </button>
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
        onConfirm={() => {
          handleStart();
        }} 
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
