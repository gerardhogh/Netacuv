import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { image: true }
    });

    if (!user || !user.image) {
      return NextResponse.redirect(new URL('/assets/avatar_africain.jpg', req.url));
    }

    if (user.image.startsWith("http")) {
      return NextResponse.redirect(user.image);
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
          'Cache-Control': 'no-cache, max-age=0',
        },
      });
    }

    return NextResponse.redirect(new URL('/assets/avatar_africain.jpg', req.url));

  } catch (error) {
    console.error("Avatar API error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
