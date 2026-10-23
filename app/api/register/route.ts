import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// Zod schema for strong password validation
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[\W_]/, "Le mot de passe doit contenir au moins un caractère spécial");

const registerSchema = z.object({
  name: z.string().min(2, "Le nom est trop court"),
  email: z.string().email("Adresse email invalide"),
  password: passwordSchema,
  roleName: z.enum(["TALENT", "RECRUTEUR"]).default("TALENT"),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = registerSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Erreur de validation", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { name, email, password, roleName, referralCode } = validatedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Find or create the specified role
    let role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName,
          description: `Rôle par défaut pour les ${roleName.toLowerCase()}s`,
          isSystem: true,
        },
      });
    }

    // Handle referral code if provided
    let referredById = undefined;
    if (referralCode) {
      const { findReferrer } = await import("@/lib/referral");
      const referrer = await findReferrer(referralCode);
      if (referrer) {
        referredById = referrer.id;

        // Récupérer le bonus configuré
        // Notification au parrain de la nouvelle inscription (étape 1 sur 2 validée)
        try {
          const { createNotification } = await import("@/lib/notifications");
          await createNotification({
            userId: referrer.id,
            title: "Nouveau filleul inscrit ! 👥",
            message: `${name} s'est inscrit avec votre code de parrainage. Dès qu'il aura complété son profil à 100%, votre prime de 25 FCFA sera automatiquement débloquée.`,
            type: "SYSTEM_ALERT",
            link: (referrer as any)?.role?.name === "RECRUTEUR" ? "/dashboard/recruteur?tab=affiliation" : "/dashboard/talent?tab=affiliation",
          });
        } catch (notifErr) {
          console.error("[Affiliation] Erreur notification parrain:", notifErr);
        }
      }
    }

    // Create user and profile
    const generatedReferralCode = `REF-${name.replace(/\s+/g, '').substring(0, 4).toUpperCase() || 'USR'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: role.id,
        referralCode: generatedReferralCode,
        referredById,
        // Créer le profil associé de façon atomique
        talentProfile: roleName === "TALENT" ? { create: {} } : undefined,
        recruiterProfile: roleName === "RECRUTEUR" ? { create: {} } : undefined,
      },
    });

    // Si c'est un recruteur / entreprise, notifier les administrateurs
    if (roleName === "RECRUTEUR") {
      try {
        const { notifyNewCompanyPending } = await import("@/lib/notifications");
        notifyNewCompanyPending({
          companyName: name,
          email,
        }).catch(() => {});
      } catch (notifErr) {
        console.error("[Register] Erreur notification admin:", notifErr);
      }
    }

    return NextResponse.json(
      { message: "Inscription réussie", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
