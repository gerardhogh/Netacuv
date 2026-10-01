import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function deleteUserFiles(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        talentProfile: {
          include: {
            interviewSessions: true
          }
        },
        recruiterProfile: true
      }
    });

    if (!user) return;

    const urlsToDelete: string[] = [];

    // Collect avatar
    if (user.image?.startsWith("/uploads/")) {
      urlsToDelete.push(user.image);
    }

    // Collect talent files
    if (user.talentProfile) {
      if (user.talentProfile.cvUrl?.startsWith("/uploads/")) {
        urlsToDelete.push(user.talentProfile.cvUrl);
      }
      if (user.talentProfile.videoUrl?.startsWith("/uploads/")) {
        urlsToDelete.push(user.talentProfile.videoUrl);
      }
      
      // Collect interview session videos
      if (user.talentProfile.interviewSessions) {
        for (const session of user.talentProfile.interviewSessions) {
          if (session.videoRecordings?.startsWith("/uploads/")) {
            urlsToDelete.push(session.videoRecordings);
          }
        }
      }
    }

    // Collect recruiter files
    if (user.recruiterProfile) {
      if (user.recruiterProfile.companyLogo?.startsWith("/uploads/")) {
        urlsToDelete.push(user.recruiterProfile.companyLogo);
      }
    }

    // Delete files from filesystem
    for (const url of urlsToDelete) {
      try {
        const filePath = path.join(process.cwd(), "public", url);
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err: any) {
        // Ignore if file already doesn't exist
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting file ${url}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error in deleteUserFiles:", error);
  }
}
