import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

// Initialisation du client Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { interviewSessionId, questionIndex, videoUrl, transcript } = await req.json();

    if (!interviewSessionId || questionIndex === undefined || (!videoUrl && !transcript)) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // 1. Récupérer la session d'interview depuis la BDD
    const session = await prisma.interviewSession.findUnique({
      where: { id: interviewSessionId },
      include: {
        interview: {
          include: { jobOffer: true }
        },
        talent: true,
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    // 2. Récupérer la question posée
    // Les questions sont stockées sous forme de texte ou JSON dans session.interview.questions
    let questionsList: string[] = [];
    try {
      questionsList = JSON.parse(session.interview.questions);
    } catch {
      // Si c'est juste un texte séparé par des sauts de ligne
      questionsList = session.interview.questions.split('\n').filter(q => q.trim().length > 0);
    }

    const currentQuestion = questionsList[questionIndex];
    if (!currentQuestion) {
      return NextResponse.json({ error: "Question introuvable à cet index" }, { status: 400 });
    }

    // 3. Préparer le prompt système pour Gemini
    // On utilise le mode texte si on a la transcription, sinon on pourrait passer la vidéo
    const t = await getTranslations("aiInterview");
    
    let prompt = t("prompt", {
      title: session.interview.jobOffer.title,
      question: currentQuestion,
      transcript: transcript || t("noTranscript")
    });


    // 4. Appel à Gemini 1.5 Pro
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const aiResponseText = response.text;
    let aiEvaluation;
    try {
      aiEvaluation = JSON.parse(aiResponseText!);
    } catch (e) {
      console.error("Erreur parsing JSON de Gemini:", aiResponseText);
      return NextResponse.json({ error: "Erreur de génération IA" }, { status: 500 });
    }

    // 5. Sauvegarder l'évaluation dans la base de données 
    // (Pour l'instant, on peut accumuler les feedbacks ou mettre à jour le score global)
    // Ici on met à jour le champ aiFeedback avec le retour (on pourrait aussi le stocker dans un tableau JSON)
    const existingFeedback = session.aiFeedback ? JSON.parse(session.aiFeedback) : {};
    existingFeedback[`question_${questionIndex}`] = {
      questionText: currentQuestion,
      transcript: transcript || "",
      evaluation: aiEvaluation
    };

    await prisma.interviewSession.update({
      where: { id: interviewSessionId },
      data: {
        aiFeedback: JSON.stringify(existingFeedback),
        // On pourrait faire une moyenne des scores à la fin
        aiScore: aiEvaluation.score 
      }
    });

    return NextResponse.json({
      success: true,
      evaluation: aiEvaluation,
    });

  } catch (error) {
    console.error("Erreur IA Interview:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
