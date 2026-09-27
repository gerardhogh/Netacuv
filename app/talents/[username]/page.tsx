import { notFound, redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Briefcase, Lock, UserPlus, LogIn } from "lucide-react";

const prisma = new PrismaClient();

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Récupérer le talent via le nom d'utilisateur
  const talentProfile = await prisma.talentProfile.findUnique({
    where: { username },
    include: { user: true },
  });

  if (!talentProfile || !talentProfile.user) {
    notFound();
  }

  // Vérifier la session de l'utilisateur qui consulte
  const session = await getServerSession(authOptions);

  // Si l'utilisateur est un recruteur connecté, on le redirige directement vers sa vue détaillée
  if (session?.user?.role === "RECRUTEUR") {
    redirect(`/dashboard/recruteur/talents/${talentProfile.userId}`);
  }

  // Sinon (non connecté ou pas recruteur), on affiche la page de restriction bleue/orange
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-10 h-10 text-orange-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Profil Privé
          </h1>
          
          <p className="text-slate-300 mb-8 leading-relaxed">
            Pour consulter le profil détaillé de <strong className="text-white">@{username}</strong>, vous devez être connecté avec un compte Recruteur.
          </p>

          <div className="w-full space-y-4">
            <Link
              href="/connexion"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </Link>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">ou</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <Link
              href="/inscription"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              S'inscrire en tant que recruteur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
