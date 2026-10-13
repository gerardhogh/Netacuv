"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export interface NetacuvVideoPlayerProps {
  src: string;
  className?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
  controls?: boolean;
  blurSensitive?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  showBorder?: boolean;
}

export default function NetacuvVideoPlayer({
  src,
  className = "",
  aspectRatio = "aspect-video",
  autoPlay = false,
  controls = true,
  blurSensitive = false,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadedMetadata,
  videoRef: externalVideoRef,
  showBorder = true,
}: NetacuvVideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = externalVideoRef || internalVideoRef;

  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Gérer la lecture via le bouton Play du poster
  const handleStartPlay = () => {
    if (blurSensitive) return;
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setHasStartedPlaying(true);
          setIsPlaying(true);
          if (onPlay) onPlay();
        })
        .catch((err) => {
          console.warn("Échec du démarrage de la vidéo:", err);
        });
    }
  };

  const handleVideoPlay = () => {
    setHasStartedPlaying(true);
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    if (onPause) onPause();
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasStartedPlaying(false);
    if (onEnded) onEnded();
  };

  // Réinitialiser si le src change
  useEffect(() => {
    setHasStartedPlaying(false);
    setIsPlaying(false);
  }, [src]);

  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none bg-[#061527] ${
        showBorder ? "border border-sky-400/20" : ""
      } ${className}`}
    >
      {/* ── Balise Vidéo Réelle ── */}
      <video
        ref={videoRef}
        src={src}
        controls={controls && hasStartedPlaying && !blurSensitive}
        playsInline
        preload="auto"
        controlsList="nodownload"
        disablePictureInPicture
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          hasStartedPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${blurSensitive ? "blur-xl select-none" : ""}`}
      />

      {/* ── Poster de fond avec dégradé et logo Netacuv 'N' (Page Maintenance) ── */}
      {!hasStartedPlaying && (
        <div
          onClick={handleStartPlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-b from-[#0b223d] via-[#061527] to-[#030b14] overflow-hidden transition-all duration-300 group"
        >
          {/* Ambient Lighting & Glows bleu nuit teintés Netacuv */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-[#32A8D7]/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-[#1e8ae9]/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0c3e70]/30 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-1/4 right-1/4 w-60 h-60 bg-[#f97316]/10 rounded-full blur-3xl" />

          {/* Netacuv 'N' Symbol Watermark en arrière-plan */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
            <div className="w-[320px] h-[320px] max-w-[80vw] max-h-[80vw] opacity-[0.08] transform -rotate-12 scale-110 transition-transform duration-700 group-hover:scale-125">
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

          {/* Bouton Play Central Stylisé */}
          {!blurSensitive ? (
            <div className="relative z-20 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <button
                type="button"
                aria-label="Lire la vidéo"
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#1e8ae9] to-[#32A8D7] flex items-center justify-center text-white shadow-[0_0_35px_rgba(50,168,215,0.45)] group-hover:shadow-[0_0_50px_rgba(50,168,215,0.75)] transition-all duration-300 border border-white/30 cursor-pointer active:scale-95"
              >
                {/* Anneau lumineux pulsant */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30 pointer-events-none" />
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1 transition-transform duration-300 group-hover:scale-110" />
              </button>
              <span className="mt-3 text-xs sm:text-sm font-bold text-white/90 tracking-wide drop-shadow-md">
                Cliquer pour lancer la vidéo
              </span>
            </div>
          ) : (
            <div className="relative z-20 flex flex-col items-center justify-center text-white/80 p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Play className="w-6 h-6 text-white/40" />
              </div>
              <span className="text-sm font-bold text-white">Vidéo masquée (Compte Premium requis)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
