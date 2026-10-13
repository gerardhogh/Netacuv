import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Questions de référence existantes chez Netacuv (socle permanent complet)
export const NETACUV_DEFAULT_QUESTIONS = [
  { text: "Présentez-vous en 2 minutes maximum.", duration: 120, skill: "Pitch & Communication" },
  { text: "Pourquoi devrions-nous vous recruter ?", duration: 120, skill: "Proposition de valeur" },
  { text: "Parlez-nous d'un défi professionnel que vous avez surmonté.", duration: 120, skill: "Résolution de problèmes" },
  { text: "Quels sont vos points forts et vos points faibles ?", duration: 80, skill: "Auto-évaluation & Honnêteté" },
  { text: "Où vous voyez-vous dans 5 ans ?", duration: 80, skill: "Vision de carrière" },
  { text: "Décrivez une situation où vous avez travaillé en équipe.", duration: 120, skill: "Collaboration" },
  { text: "Comment gérez-vous les conflits au travail ?", duration: 90, skill: "Intelligence relationnelle" },
  { text: "Qu'est-ce qui vous motive dans votre travail ?", duration: 90, skill: "Motivation intrinsèque" },
  { text: "Comment réagissez-vous face à la pression ?", duration: 90, skill: "Gestion du stress" },
  {
    text: "Quel type de management vous convient le mieux ?",
    subtitle: "(Comment vous aimez être encadré(e) ou dirigé(e) au travail. Quel style de gestion vous rend productif(ve).)",
    duration: 90,
    skill: "Alignement managérial",
  },
  { text: "Quelle est votre plus grande qualité ?", duration: 30, skill: "Atout distinctif" },
  { text: "Quels outils utilisez-vous au quotidien dans votre métier ?", duration: 90, skill: "Maîtrise technique et outils" },
  { text: "Qu'est-ce qui selon vous va vous poser des difficultés dans ce poste ?", duration: 80, skill: "Lucidité & Anticipation" },
  { text: "Que faites-vous si vous êtes en désaccord avec votre manager ?", duration: 80, skill: "Communication hiérarchique" },
  {
    text: "Comment utilisez-vous l'intelligence artificielle",
    subtitle: "(ex : ChatGPT, Notion AI, assistants de code, etc.) dans votre métier ?",
    duration: 80,
    skill: "Adoption de l'IA & Productivité moderne",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobDescription = "",
      candidateTranscript = "",
      history = [],
      maxQuestions = 5,
      currentQuestionIndex = 0,
    } = body;

    const answeredCount = Array.isArray(history) ? history.length : 0;

    // 1. Vérifier si la limite maximale de questions est atteinte
    if (answeredCount >= maxQuestions) {
      return NextResponse.json({
        question: "Merci beaucoup pour cet entretien. Vos réponses ont été enregistrées avec succès.",
        subtitle: "L'entretien est maintenant terminé.",
        duration: 0,
        isFollowUp: false,
        isFinished: true,
        feedbackOnPreviousAnswer: "Entretien complet.",
        targetedSkill: "Fin d'entretien",
      });
    }

    // 2. Si aucune réponse précédente n'a été donnée (première question)
    if (answeredCount === 0 && !candidateTranscript) {
      const firstQuestion = NETACUV_DEFAULT_QUESTIONS[0];
      return NextResponse.json({
        question: firstQuestion.text,
        subtitle: "Prenez quelques secondes pour structurer votre pitch.",
        duration: firstQuestion.duration,
        isFollowUp: false,
        isFinished: false,
        feedbackOnPreviousAnswer: "Début de l'entretien.",
        targetedSkill: firstQuestion.skill,
      });
    }

    // 3. Appel intelligent à Gemini 1.5 Flash pour générer la relance ou question suivante
    const systemPrompt = `Tu es un Recruteur Senior Expert chez Netacuv, une plateforme RH SaaS de premier plan.
Tu conduis un entretien d'embauche vidéo interactif et bienveillant mais très rigoureux.

Fiche de poste ou profil recherché :
"""
${jobDescription || "Profil professionnel polyvalent : autonomie, rigueur, compétences techniques et communication d'équipe."}
"""

Questions socles de la plateforme Netacuv :
${JSON.stringify(NETACUV_DEFAULT_QUESTIONS, null, 2)}

Historique des échanges précédents :
${JSON.stringify(history, null, 2)}

Dernière transcription de la réponse du candidat :
"""
${candidateTranscript || "(Le candidat n'a pas répondu ou sa réponse était inaudible/vide)"}
"""

Nombre de questions déjà posées et répondues : ${answeredCount}
Nombre maximum de questions pour cet entretien : ${maxQuestions}

RÈGLES D'ÉVALUATION ET DE DÉCISION :
1. ANALYSE DE LA DERNIÈRE RÉPONSE :
   - Si la réponse est vide, trop courte (moins de 20 mots), évasive ou superficielle (manque d'exemples concrets, d'indicateurs de succès, de détails techniques ou de contexte STAR) :
     => Génère une QUESTION DE RELANCE ADAPTATIVE (isFollowUp: true). Exemple : "Pouvez-vous me donner un exemple concret de projet où vous avez appliqué cette méthode et quel a été l'impact mesurable ?"
   - Si la réponse est satisfaisante et complète :
     => Passe à la compétence suivante selon la fiche de poste ou sélectionne la question socle suivante la plus pertinente (isFollowUp: false).
2. DURÉE DE RÉPONSE ESTIMÉE (duration) :
   - Entre 60 et 120 secondes selon la complexité de la question.
3. TON ET LANGUE :
   - Professionnel, concis, direct et engageant en Français.
4. FIN D'ENTRETIEN :
   - Si cette question est la dernière avant d'atteindre ${maxQuestions}, prépare une question de synthèse ou de conclusion.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "Le texte de la prochaine question ou relance posée au candidat.",
            },
            subtitle: {
              type: Type.STRING,
              description: "Conseil court ou indication pour aider le candidat à orienter sa réponse.",
            },
            duration: {
              type: Type.INTEGER,
              description: "Temps alloué en secondes (ex: 60, 90, 120).",
            },
            isFollowUp: {
              type: Type.BOOLEAN,
              description: "True s'il s'agit d'une relance adaptative sur la réponse précédente, False si c'est une nouvelle compétence.",
            },
            isFinished: {
              type: Type.BOOLEAN,
              description: "True si l'entretien doit prendre fin, sinon False.",
            },
            feedbackOnPreviousAnswer: {
              type: Type.STRING,
              description: "Brève analyse interne de la qualité de la réponse précédente.",
            },
            targetedSkill: {
              type: Type.STRING,
              description: "Compétence évaluée par cette question.",
            },
          },
          required: ["question", "duration", "isFollowUp", "isFinished"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Réponse vide de Gemini");
    }

    const parsed = JSON.parse(outputText);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Erreur next-question API:", err?.message || err);

    // Fallback gracieux et résilient sur les questions existantes de Netacuv
    const fallbackIdx = Math.min(
      Math.max(0, req.headers ? 1 : 0),
      NETACUV_DEFAULT_QUESTIONS.length - 1
    );
    const fallbackQ = NETACUV_DEFAULT_QUESTIONS[fallbackIdx] || NETACUV_DEFAULT_QUESTIONS[0];

    return NextResponse.json({
      question: fallbackQ.text,
      subtitle: "Répondez avec précision et structurez votre propos.",
      duration: fallbackQ.duration,
      isFollowUp: false,
      isFinished: false,
      feedbackOnPreviousAnswer: "Génération automatique par défaut.",
      targetedSkill: fallbackQ.skill,
    });
  }
}
