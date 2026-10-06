'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Beaker, Shield, Users, Database, Globe, Scale, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const TEST_PLAN = [
  {
    id: 'sec-auth',
    title: '1. 🛡️ Authentification, Sécurité & Red Limits',
    icon: Shield,
    subcategories: [
      {
        title: '1.1 Limitation des Tentatives de Connexion (Rate Limiting)',
        tests: [
          {
            id: '1.1.1',
            title: 'Blocage par IP sur échecs répétés',
            procedure: 'Saisir un e-mail existant et tenter de se connecter avec un mauvais mot de passe 6 fois d\'affilée en moins de 5 minutes.',
            expected: 'À la 6ᵉ tentative, le système refuse la requête et affiche une erreur claire (HTTP 429 - Trop de tentatives).'
          },
          {
            id: '1.1.2',
            title: 'Réinitialisation après le délai d\'attente',
            procedure: 'Attendre la fin de la fenêtre de blocage (5 minutes) puis effectuer une tentative avec le bon mot de passe.',
            expected: 'La connexion réussit sans blocage persistant.'
          },
          {
            id: '1.1.3',
            title: 'Isolation des comptes',
            procedure: 'Tenter une connexion échouée répétée sur un Compte A, puis essayer immédiatement de se connecter avec des identifiants valides d\'un Compte B depuis un autre appareil/IP.',
            expected: 'Le Compte B parvient à se connecter normalement (pas de blocage global du service).'
          }
        ]
      },
      {
        title: '1.2 Inscription & Gestion des Sessions',
        tests: [
          {
            id: '1.2.1',
            title: 'Inscription d\'un nouvel utilisateur',
            procedure: 'Créer un compte avec un e-mail valide et un mot de passe robuste.',
            expected: 'Un e-mail de confirmation est envoyé et le compte est créé dans la base de données.'
          },
          {
            id: '1.2.2',
            title: 'Validation des critères de mot de passe',
            procedure: 'Tenter de créer un compte avec un mot de passe trop court (< 8 caractères) ou sans caractère spécial.',
            expected: 'Le formulaire bloque la soumission et affiche les critères manquants.'
          },
          {
            id: '1.2.3',
            title: 'Persistance de la session JWT / Cookie',
            procedure: 'Se connecter, fermer l\'onglet puis rouvrir l\'application.',
            expected: 'L\'utilisateur reste connecté sans repasser par la page de login.'
          },
          {
            id: '1.2.4',
            title: 'Déconnexion sécurisée',
            procedure: 'Cliquer sur "Déconnexion" puis tenter d\'accéder à une page protégée via le bouton "Précédent" du navigateur.',
            expected: 'La session est détruite et l\'utilisateur est redirigé vers /login.'
          }
        ]
      }
    ]
  },
  {
    id: 'rbac',
    title: '2. 🔐 Contrôle d\'Accès Basé sur les Rôles (RBAC - 5 Rôles)',
    icon: Users,
    subcategories: [
      {
        title: '2.1 Rôle 1 : Super Admin',
        tests: [
          { id: '2.1.1', title: 'Accès complet au back-office', procedure: 'Se connecter en Super Admin et naviguer sur l\'ensemble des modules.', expected: 'Accès en lecture/écriture autorisé sur 100% des ressources.' },
          { id: '2.1.2', title: 'Attribution des rôles', procedure: 'Modifier le rôle d\'un membre de l\'équipe d\'une entreprise.', expected: 'Les modifications sont immédiatement répercutées en base de données.' }
        ]
      },
      {
        title: '2.2 Rôle 2 : Admin Entreprise (Recruiter Admin)',
        tests: [
          { id: '2.2.1', title: 'Accès à la gestion de l\'organisation', procedure: 'Inviter un collègue, modifier les informations de l\'entreprise et consulter les factures.', expected: 'Opérations réussies.' },
          { id: '2.2.2', title: 'Restriction d\'accès système', procedure: 'Tenter d\'accéder directement à l\'URL /admin réservée au Super Admin.', expected: 'Redirection vers la page 403 (Accès Refusé) ou vers le tableau de bord entreprise.' }
        ]
      },
      {
        title: '2.3 Rôle 3 : Recruteur (Recruiter Member)',
        tests: [
          { id: '2.3.1', title: 'Création et gestion d\'offres d\'emploi', procedure: 'Publier une offre d\'emploi, évaluer des candidatures, déplacer un candidat dans le pipeline.', expected: 'Toutes les actions de recrutement fonctionnent correctement.' },
          { id: '2.3.2', title: 'Restriction de paramètres de facturation', procedure: 'Tenter d\'accéder à l\'onglet /settings/billing.', expected: 'Accès bloqué ou onglet masqué.' }
        ]
      },
      {
        title: '2.4 Rôle 4 : Évaluateur / Reviewer (Guest / Interviewer)',
        tests: [
          { id: '2.4.1', title: 'Évaluation limitée des candidats', procedure: 'Se connecter en Évaluateur et laisser une note/commentaire sur un candidat assigné.', expected: 'Le commentaire est enregistré.' },
          { id: '2.4.2', title: 'Interdiction de suppression', procedure: 'Tenter de supprimer une offre ou de rejeter définitivement un candidat.', expected: 'Les boutons d\'action critique sont désactivés ou absents.' }
        ]
      },
      {
        title: '2.5 Rôle 5 : Candidat (Candidate)',
        tests: [
          { id: '2.5.1', title: 'Postulation et suivi de candidature', procedure: 'Consulter une offre publique, déposer un CV et suivre l\'état de la candidature.', expected: 'Le dossier est transmis et visible côté recruteur.' },
          { id: '2.5.2', title: 'Isolation des données candidats', procedure: 'Tenter d\'accéder à l\'URL de candidature d\'un autre candidat via son ID.', expected: 'Accès strictement refusé (seules ses propres données sont retournées).' }
        ]
      }
    ]
  },
  {
    id: 'db',
    title: '3. 🗄️ Intégrité de la Base de Données',
    icon: Database,
    subcategories: [
      {
        title: 'Tests globaux Base de Données',
        tests: [
          { id: '3.1', title: 'Exécution des migrations Prisma', procedure: 'Exécuter npx prisma migrate deploy sur l\'environnement de production.', expected: 'Aucune erreur de schéma ou de clé étrangère n\'est levée.' },
          { id: '3.2', title: 'Validation du Seeding', procedure: 'Exécuter le script de seed.', expected: 'Les rôles administratifs par défaut et les paramètres initiaux sont correctement insérés.' },
          { id: '3.3', title: 'Row Level Security (RLS) Supabase', procedure: 'Tenter d\'exécuter une requête SQL directe côté client via Supabase sans passer par l\'API Authentifiée.', expected: 'Supabase bloque la requête si le token JWT ne correspond pas.' }
        ]
      }
    ]
  },
  {
    id: 'perf',
    title: '4. 🌐 Performance & Intégration Vercel',
    icon: Globe,
    subcategories: [
      {
        title: 'Tests globaux de Déploiement',
        tests: [
          { id: '4.1', title: 'En-têtes HTTP de sécurité (Headers)', procedure: 'Analyser le site via Chrome DevTools ou un scanner de sécurité HTTP.', expected: 'Présence des en-têtes X-Frame-Options, X-Content-Type-Options et Strict-Transport-Security.' },
          { id: '4.2', title: 'Transmission de l\'IP Réelle (x-forwarded-for)', procedure: 'Vérifier dans les logs Vercel/Next.js qu\'une requête entrante contient la véritable IP client.', expected: 'L\'IP récupérée est correcte et n\'est pas celle du reverse proxy.' },
          { id: '4.3', title: 'Chargement des pages protégées', procedure: 'Naviguer rapidement entre les pages du Dashboard.', expected: 'Les re-routages s\'effectuent sans scintillement (flash) ni boucle de redirection.' }
        ]
      }
    ]
  },
  {
    id: 'compliance',
    title: '5. ⚖️ Conformité & Métier (RGPD & Anti-discrimination)',
    icon: Scale,
    subcategories: [
      {
        title: 'Tests Conformité',
        tests: [
          { id: '5.1', title: 'Suppression des données (Droit à l\'oubli)', procedure: 'Déclencher la suppression d\'un compte candidat depuis l\'interface.', expected: 'Les CV, coordonnées et logs associés sont purgés ou anonymisés.' },
          { id: '5.2', title: 'Masquage des critères discriminatoires', procedure: 'Activer l\'option "Recrutement à l\'aveugle" si elle est configurée.', expected: 'La photo, le genre et l\'âge du candidat sont masqués pour l\'évaluateur.' }
        ]
      }
    ]
  }
];

export default function TestPlanPage() {
  const [checkedTests, setCheckedTests] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem('netacuv_test_plan');
    if (saved) {
      try {
        setCheckedTests(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse test plan progress');
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleTest = (id: string) => {
    const newChecked = { ...checkedTests, [id]: !checkedTests[id] };
    setCheckedTests(newChecked);
    localStorage.setItem('netacuv_test_plan', JSON.stringify(newChecked));
  };

  const resetProgress = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la progression des tests ?')) {
      setCheckedTests({});
      localStorage.removeItem('netacuv_test_plan');
    }
  };

  // Calculate progress
  let totalTests = 0;
  let passedTests = 0;

  TEST_PLAN.forEach(category => {
    category.subcategories.forEach(sub => {
      sub.tests.forEach(test => {
        totalTests++;
        if (checkedTests[test.id]) passedTests++;
      });
    });
  });

  const progressPercentage = Math.round((passedTests / totalTests) * 100) || 0;

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8 bg-blue-600 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Beaker size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Plan de Test & Recette</h1>
                <p className="text-blue-100 mt-1">Netacuv SaaS - Suivi de validation de production</p>
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Progression</span>
                <span>{passedTests} / {totalTests} ({progressPercentage}%)</span>
              </div>
              <div className="w-full bg-blue-900/40 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-100 flex justify-between items-center border-b border-slate-200">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              &larr; Retour à l'accueil
            </Link>
            <button 
              onClick={resetProgress}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
            >
              <RefreshCw size={16} />
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {TEST_PLAN.map((category) => {
            const Icon = category.icon;
            
            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{category.title}</h2>
                </div>
                
                <div className="p-6 space-y-8">
                  {category.subcategories.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-700 pb-2 border-b border-slate-100">
                        {sub.title}
                      </h3>
                      
                      <div className="space-y-4">
                        {sub.tests.map((test) => {
                          const isChecked = !!checkedTests[test.id];
                          return (
                            <div 
                              key={test.id} 
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                              }`}
                              onClick={() => toggleTest(test.id)}
                            >
                              <div className="flex gap-4 items-start">
                                <button className="mt-1 flex-shrink-0 focus:outline-none">
                                  {isChecked ? (
                                    <CheckCircle2 size={24} className="text-blue-500" />
                                  ) : (
                                    <Circle size={24} className="text-slate-300" />
                                  )}
                                </button>
                                
                                <div className="flex-1">
                                  <h4 className={`font-bold text-base ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                                    Test {test.id} : {test.title}
                                  </h4>
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                      <span className="font-semibold text-slate-700 block mb-1">Procédure :</span>
                                      <span className="text-slate-600">{test.procedure}</span>
                                    </div>
                                    <div className={`p-3 rounded-lg border ${isChecked ? 'bg-blue-50 border-blue-100' : 'bg-green-50/50 border-green-100'}`}>
                                      <span className={`font-semibold block mb-1 ${isChecked ? 'text-blue-700' : 'text-green-700'}`}>Résultat attendu :</span>
                                      <span className={isChecked ? 'text-blue-600' : 'text-green-600'}>{test.expected}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
