import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Voice mapping: Gemini voices chosen for professional tone per language
const VOICE_MAP: Record<string, string> = {
  fr: "Aoede",   // Warm, professional French-compatible voice
  en: "Kore",    // Clear, articulate English voice
  es: "Charon",  // Professional Spanish-compatible voice
  pt: "Fenrir",  // Portuguese-compatible voice
  zh: "Leda",    // Chinese-compatible voice
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const { text, subtitle, lang = "fr" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texte manquant" }, { status: 400 });
    }

    // Limit text length to avoid denial of wallet / memory abuse
    if (text.length > 1000) {
      return NextResponse.json({ error: "Texte trop long (maximum 1000 caractères)" }, { status: 400 });
    }

    // Combine main question text + subtitle for full pronunciation
    const cleanText = text.replace(/[*_#]/g, "").trim();
    const cleanSub = subtitle ? String(subtitle).slice(0, 300).replace(/[()_#]/g, "").trim() : "";
    const fullText = cleanSub ? `${cleanText}. ${cleanSub}` : cleanText;

    const voiceName = VOICE_MAP[lang] || "Aoede";

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: fullText,
              // @ts-ignore – speechMetadata is part of the TTS API
              speechMetadata: { style: "professional and clear" },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      },
    });

    // Extract the base64 WAV audio data
    const inlineData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inlineData?.data) {
      console.error("TTS: No audio data in response", response);
      return NextResponse.json({ error: "Aucun audio généré" }, { status: 500 });
    }

    const audioBuffer = Buffer.from(inlineData.data, "base64");
    const mimeType = inlineData.mimeType || "audio/wav";

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("TTS API error:", err?.message ?? err);
    return NextResponse.json(
      { error: "Erreur de synthèse vocale" },
      { status: 500 }
    );
  }
}
