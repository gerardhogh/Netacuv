import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId(req: Request): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).id) {
    return (session.user as any).id;
  }
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET }).catch(() => null);
  return token?.sub || null;
}

// GET /api/favorites - Récupérer les favoris de l'utilisateur connecté
export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à vos favoris." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("type"); // JOB_OFFER | TALENT | RECRUITER
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (targetType) {
      where.targetType = targetType;
    }

    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where }),
    ]);

    // Enrichir avec les données fraîches si possible
    const enriched = await Promise.all(
      favorites.map(async (fav) => {
        let liveData: any = null;
        try {
          if (fav.targetType === "JOB_OFFER") {
            liveData = await prisma.jobOffer.findUnique({
              where: { id: fav.targetId },
              include: { recruiter: true },
            });
          } else if (fav.targetType === "TALENT") {
            liveData = await prisma.user.findUnique({
              where: { id: fav.targetId },
              include: { talentProfile: true, role: true },
            });
          } else if (fav.targetType === "RECRUITER") {
            liveData = await prisma.user.findUnique({
              where: { id: fav.targetId },
              include: { recruiterProfile: true, role: true },
            });
          }
        } catch {
          // Fallback sur les données du favori
        }

        let parsedMeta = null;
        try {
          if (fav.metadata) parsedMeta = JSON.parse(fav.metadata);
        } catch {
          parsedMeta = null;
        }

        return {
          ...fav,
          metadataParsed: parsedMeta,
          liveData,
        };
      })
    );

    return NextResponse.json({
      favorites: enriched,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      page,
      limit,
    });
  } catch (error) {
    console.error("[FAVORITES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des favoris." },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Ajouter ou retirer un favori (Toggle)
export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour gérer vos favoris." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetType, targetId, title, subtitle, location, metadata } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType et targetId sont requis." },
        { status: 400 }
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId: String(targetId),
        },
      },
    });

    if (existing) {
      // Toggle OFF : Supprimer
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        action: "removed",
        isFavorite: false,
        targetId,
        targetType,
      });
    }

    // Toggle ON : Créer
    const metaStr = metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null;

    const newFav = await prisma.favorite.create({
      data: {
        userId,
        targetType,
        targetId: String(targetId),
        title: title || null,
        subtitle: subtitle || null,
        location: location || null,
        metadata: metaStr,
      },
    });

    return NextResponse.json({
      action: "added",
      isFavorite: true,
      favorite: newFav,
    }, { status: 201 });
  } catch (error) {
    console.error("[FAVORITES_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des favoris." },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Supprimer un favori
export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (id) {
      await prisma.favorite.deleteMany({
        where: { id, userId },
      });
      return NextResponse.json({ success: true, id });
    }

    if (targetType && targetId) {
      await prisma.favorite.deleteMany({
        where: {
          userId,
          targetType,
          targetId,
        },
      });
      return NextResponse.json({ success: true, targetType, targetId });
    }

    return NextResponse.json(
      { error: "Paramètres manquants pour la suppression." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[FAVORITES_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du favori." },
      { status: 500 }
    );
  }
}
