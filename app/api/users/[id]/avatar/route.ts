import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if client sent If-None-Match
    const ifNoneMatch = req.headers.get("if-none-match");

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { image: true, updatedAt: true }
    });

    if (!user || !user.image) {
      return NextResponse.redirect(new URL('/assets/avatar_africain.jpg', req.url), {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        }
      });
    }

    // Generate strong ETag based on user update timestamp and id
    const etag = `"${id}-${user.updatedAt ? user.updatedAt.getTime() : 'default'}"`;

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    if (user.image.startsWith("http")) {
      return NextResponse.redirect(user.image, {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        }
      });
    }

    if (user.image.startsWith("data:image")) {
      const matches = user.image.match(/^data:(image\/\w+);base64,(.*)$/);
      if (!matches || matches.length !== 3) {
        return new NextResponse(null, { status: 400 });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'ETag': etag,
        },
      });
    }

    return NextResponse.redirect(new URL('/assets/avatar_africain.jpg', req.url), {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      }
    });

  } catch (error) {
    console.error("Avatar API error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

