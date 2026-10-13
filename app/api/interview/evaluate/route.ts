import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobDescription = "",
      history = [],
      candidateName = "Candidat",
      interviewSessionId = null,
      videoUrl = null,
    } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "Historique d'entretien vide ou manquant" },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es le Directeur du Recrutement & Évaluateur IA Principal de la plateforme Netacuv.
Ton rôle est d'analyser l'intégralité d'un entretien vidéo passé par un talent et de fournir un rapport d'évaluation impartial, approfondi et directement exploitable par les recruteurs.

FICHE DE POSTE / CRITÈRES D'ÉVALUATION :
"""
${jobDescription || "Développeur Fullstack / Profil SaaS Tech polyvalent : maîtrise de Next.js/React, TypeScript, bases de données, capacité de résolution de problèmes et clarté d'expression."}
"""

CANDIDAT : ${candidateName}

DÉROULÉ COMPLET DE L'ENTRETIEN (Questions posées et réponses transcrites) :
${JSON.stringify(history, null, 2)}

DIRECTIVES D'ÉVALUATION :
1. Évalue la cohérence, la précision technique, les exemples concrets apportés et la communication globale.
2. overallScore : Note globale sur 100 reflétant le niveau d'adéquation et la maturité professionnelle.
3. strengths : 2 à 4 points forts majeurs observés lors des réponses.
4. areasForImprovement : 2 à 4 axes d'amélioration précis et constructifs.
5. skillMatching : Évalue individuellement les compétences clés identifiées dans la fiche de poste avec un score (0-100) et un commentaire concis.
6. recommendation : Choisis obligatoirement l'une des 3 valeurs :
   - "SHORTLIST" : Profil solide, pertinent, recommandé pour la phase finale d'embauche.
   - "REVIEW" : Profil intéressant mais nécessitant une vérification complémentaire ou un test pratique.
   - "REJECT" : Profil ne correspondant pas aux exigences du poste ou réponses trop incomplètes.`;

    // Appel à Gemini 1.5 Pro avec Structured Outputs
    const evaluationSchema = {
      type: Type.OBJECT,
      properties: {
        overallScore: {
          type: Type.INTEGER,
          description: "Note globale sur 100 du candidat pour ce poste.",
        },
        summary: {
          type: Type.STRING,
          description: "Résumé global et synthèse de la prestation du candidat.",
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Liste des points forts démontrés par le candidat.",
        },
        areasForImprovement: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Axes d'amélioration identifiés.",
        },
        skillMatching: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING, description: "Nom de la compétence évaluée" },
              score: { type: Type.INTEGER, description: "Score de 0 à 100 pour cette compétence" },
              comment: { type: Type.STRING, description: "Commentaire spécifique sur cette compétence" },
            },
            required: ["skill", "score", "comment"],
          },
          description: "Matching détaillé par compétence.",
        },
        recommendation: {
          type: Type.STRING,
          description: "Recommandation finale : SHORTLIST, REVIEW, ou REJECT.",
        },
      },
      required: [
        "overallScore",
        "summary",
        "strengths",
        "areasForImprovement",
        "skillMatching",
        "recommendation",
      ],
    };

    // Modèles testés par ordre de priorité
    const candidateModels = ["gemini-flash-latest", "gemini-1.5-pro", "gemini-3-flash-preview"];
    let responseText = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: evaluationSchema,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Tentative d'évaluation avec ${model} en échec:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw new Error("Aucune réponse générée par Gemini");
    }

    const evaluationResult = JSON.parse(responseText);

    // Si un interviewSessionId Prisma est fourni, mettre à jour la session dans PostgreSQL
    if (interviewSessionId) {
      try {
        await prisma.interviewSession.update({
          where: { id: interviewSessionId },
          data: {
            aiScore: evaluationResult.overallScore,
            aiFeedback: JSON.stringify(evaluationResult),
            ...(videoUrl ? { videoUrl } : {}),
          },
        });
      } catch (dbErr) {
        console.warn("Avertissement: Impossible de synchroniser la session Prisma:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
    });
  } catch (error: any) {
    console.error("Erreur evaluate API:", error?.message || error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'évaluation par l'IA",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
