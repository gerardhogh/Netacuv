/**
 * Utilitaire pour extraire la profession réelle d'un profil Talent
 * sans jamais retomber sur "Talent" comme intitulé de métier.
 */
export function extractProfession(profile?: {
  degree?: string | null;
  skills?: string | null;
  bio?: string | null;
} | null): string {
  if (!profile) return "Profession non renseignée";

  // 1. Titre professionnel / Poste renseigné dans le champ degree
  if (profile.degree && profile.degree.trim()) {
    const deg = profile.degree.trim();
    if (deg.toLowerCase() !== "talent" && deg.toLowerCase() !== "candidat") {
      return deg;
    }
  }

  // 2. Première compétence principale si renseignée
  if (profile.skills && profile.skills.trim()) {
    try {
      const skillsArray =
        profile.skills.startsWith("[")
          ? JSON.parse(profile.skills)
          : profile.skills.split(",").map((s: string) => s.trim());
      if (Array.isArray(skillsArray) && skillsArray.length > 0) {
        const first = skillsArray.find(
          (s: any) =>
            typeof s === "string" &&
            s.trim() &&
            s.trim().toLowerCase() !== "talent" &&
            s.trim().toLowerCase() !== "candidat"
        );
        if (first && first.trim()) {
          return first.trim();
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }

  // 3. Extraction depuis le début de la bio (ex: "Product Designer - Spécialisé en UI...")
  if (profile.bio && profile.bio.trim()) {
    const cleanBio = profile.bio.trim();
    const firstPart = cleanBio.split(/[-–—|•\n,]/)[0].trim();
    if (
      firstPart &&
      firstPart.length >= 3 &&
      firstPart.length <= 50 &&
      firstPart.toLowerCase() !== "talent" &&
      firstPart.toLowerCase() !== "candidat"
    ) {
      return firstPart;
    }
  }

  return "Profession non renseignée";
}
