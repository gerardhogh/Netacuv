import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      userId = null,
      locale = "fr",
    } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "Historique d'entretien vide ou manquant" },
        { status: 400 }
      );
    }

    const isEn = locale === "en";
    const systemPrompt = isEn
      ? `You are an Executive Recruitment Director & Senior HR Headhunter for the Netacuv platform.
Your task is to analyze the entire video interview completed by the candidate and produce a rigorous, objective, insightful HR and technical evaluation immediately actionable by hiring executives and recruiters.

JOB SPECIFICATION / EVALUATION CRITERIA:
"""
${jobDescription || "Versatile professional profile: domain mastery, autonomy, concrete problem-solving ability (STAR method), clear spoken communication, teamwork adaptability, and professional maturity."}
"""

CANDIDATE: ${candidateName}

INTERVIEW PROCEEDINGS (Questions asked, duration, and candidate's transcribed answers):
${JSON.stringify(history, null, 2)}

EVALUATION RUBRIC:
1. CLARITY & COMMUNICATION (Pitch, eloquence, synthesis capability, structured expression).
2. SUBSTANCE & ADDED VALUE (Real-world examples, tangible facts, STAR method: Situation, Task, Action, Result). Penalize vague, generic, or hollow answers.
3. ADAPTABILITY & SOFT SKILLS (Team spirit, conflict resolution, awareness of weaknesses, stress management).
4. OVERALL SCORE CALIBRATION (overallScore out of 100):
   - 85 to 100: Outstanding performance, concrete examples, structured speech -> "SHORTLIST".
   - 65 to 84: Solid and promising profile, but some answers lack depth or specifics -> "REVIEW".
   - 45 to 64: Hesitant, overly generic or incomplete answers -> "REVIEW" or "REJECT".
   - < 45: Missing, inaudible, extremely brief, or irrelevant answers -> "REJECT".

OUTPUT REQUIREMENTS (ALL TEXT MUST BE IN ENGLISH):
- overallScore: Integer score out of 100.
- summary: Impactful 3-5 sentence summary written by a senior recruiter, highlighting the candidate's strengths and market fit.
- strengths: 2 to 4 specific, demonstrated strengths from the interview.
- areasForImprovement: 2 to 4 actionable, constructive areas for improvement.
- skillMatching: 3 to 5 key competencies (e.g., Communication & Pitch, Problem Solving, Teamwork, etc.) with a score (0-100) and targeted comment.
- recommendation: Must be strictly "SHORTLIST", "REVIEW", or "REJECT".`
      : `Tu es un Directeur du Recrutement & Senior Headhunter RH Expert pour la plateforme Netacuv.
Ton rôle est d'analyser l'intégralité de l'entretien vidéo passé par le talent et de produire une évaluation RH et technique rigoureuse, objective, perspicace et immédiatement exploitable par un comité de direction ou des recruteurs exigeants.

FICHE DE POSTE / CRITÈRES D'ÉVALUATION :
"""
${jobDescription || "Profil professionnel polyvalent : maîtrise de son domaine d'expertise, autonomie, capacité de résolution de problèmes concrets (méthode STAR), clarté d'expression orale, adaptabilité d'équipe et maturité professionnelle."}
"""

CANDIDAT : ${candidateName}

DÉROULÉ DE L'ENTRETIEN (Questions posées, durées et transcriptions des réponses) :
${JSON.stringify(history, null, 2)}

GRILLE D'ÉVALUATION D'UN RECRUTEUR EXPERT :
1. CLARTÉ & COMMUNICATION (Pitch, éloquence, capacité de synthèse, structuration des propos).
2. FOND & VALEUR AJOUTÉE (Exemples réels vécus, faits tangibles, méthode STAR : Situation, Tâche, Action, Résultat). Attention aux réponses vagues, génériques ou creuses.
3. ADAPTABILITÉ & SOFT SKILLS (Esprit d'équipe, gestion des désaccords, lucidité sur ses faiblesses, réaction sous pression).
4. CALIBRATION DU SCORE GLOBAL (overallScore sur 100) :
   - 85 à 100 : Prestation remarquable, exemples concrets, discours structuré et pertinent -> "SHORTLIST".
   - 65 à 84 : Profil solide et prometteur, mais quelques réponses manquent de profondeur ou de précision -> "REVIEW".
   - 45 à 64 : Réponses hésitantes, trop génériques ou lacunaires -> "REVIEW" ou "REJECT".
   - < 45 : Réponses absentes, inaudibles, extrêmement brèves ou hors-sujet -> "REJECT".

DIRECTIVES DE RESTITUTION :
- overallScore : Note entière sur 100.
- summary : Synthèse percutante de 3 à 5 phrases rédigée par un recruteur senior, mettant en exergue le positionnement du candidat et son adéquation avec les attentes du marché.
- strengths : 2 à 4 points forts précis et étayés démontrés pendant l'échange.
- areasForImprovement : 2 à 4 axes d'amélioration constructifs et actionnables pour progresser.
- skillMatching : Évalue 3 à 5 compétences clés (ex: Communication & Pitch, Résolution de problème, Esprit d'équipe, etc.) avec un score (0-100) et un commentaire ciblé.
- recommendation : Obligatoirement "SHORTLIST", "REVIEW", ou "REJECT".`;

    // Appel à Gemini avec Structured Outputs
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
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-1.5-pro",
    ];
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

    // Identifier l'utilisateur pour sauvegarder l'évaluation et la vidéo dans son profil
    let targetUserId = userId || null;
    if (!targetUserId) {
      try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (token?.sub) targetUserId = token.sub;
      } catch (e) {}
    }
    if (!targetUserId) {
      try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.id) targetUserId = (session?.user as any).id;
      } catch (e) {}
    }

    if (targetUserId) {
      try {
        const talentProf = await prisma.talentProfile.findUnique({
          where: { userId: targetUserId },
          include: {
            interviewSessions: {
              orderBy: { createdAt: "desc" },
              take: 1,
            }
          }
        });
        if (talentProf) {
          if (videoUrl) {
            await prisma.talentProfile.update({
              where: { id: talentProf.id },
              data: { videoUrl }
            });
          }

          const existingSessionId = interviewSessionId || talentProf.interviewSessions?.[0]?.id;
          if (existingSessionId) {
            await prisma.interviewSession.update({
              where: { id: existingSessionId },
              data: {
                aiScore: evaluationResult.overallScore,
                aiFeedback: JSON.stringify(evaluationResult),
                ...(videoUrl ? { videoRecordings: videoUrl } : {}),
                status: "COMPLETED",
              },
            });
          } else {
            const defaultInterview = await prisma.aIInterview.findFirst();
            if (defaultInterview) {
              await prisma.interviewSession.create({
                data: {
                  interviewId: defaultInterview.id,
                  talentId: talentProf.id,
                  aiScore: evaluationResult.overallScore,
                  aiFeedback: JSON.stringify(evaluationResult),
                  videoRecordings: videoUrl || "",
                  status: "COMPLETED",
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync talentProfile and interviewSession in evaluate:", err);
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
