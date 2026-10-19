"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ShieldCheck, Video, Database, Trash2, Clock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="bg-blue-600 text-white py-16 px-6" style={{ background: "linear-gradient(135deg, #0076a8 0%, #005a82 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck size={48} className="mx-auto mb-6 text-blue-200" />
          <h1 className="text-3xl md:text-5xl font-black mb-4">Politique de Confidentialité</h1>
          <p className="text-blue-100 text-lg">Nous protégeons vos données personnelles avec la plus grande rigueur.</p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full py-16 px-6">
        <div className="space-y-8">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">1. Données collectées</h2>
            </div>
            <p className="text-slate-600 mb-4">Nous collectons les données suivantes :</p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> <strong>Données d&apos;identité :</strong> Nom, prénom, adresse e-mail, numéro de téléphone, photo de profil.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> <strong>Données professionnelles :</strong> Parcours, compétences, diplômes, fichiers CV (PDF, Word).</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> <strong>Données audiovisuelles :</strong> Enregistrements vidéo et audio des simulations d&apos;entretien IA.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> <strong>Données de paiement :</strong> Historique des transactions (les coordonnées bancaires/Mobile Money sont traitées de manière chiffrée par nos prestataires de paiement certifiés PCI-DSS).</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl shadow-md border border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Video size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Video size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">2. Traitement spécifique des Vidéos et de l&apos;IA</h2>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Les enregistrements vidéo réalisés lors des tests sont analysés par nos modèles d&apos;IA à la seule fin d&apos;évaluer la structure du discours, la clarté d&apos;expression et l&apos;adéquation avec les compétences déclarées.
              </p>
              <div className="bg-white p-5 rounded-2xl border border-blue-100 font-medium text-blue-900 shadow-sm">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✓ Vos vidéos ne sont jamais vendues à des tiers.</li>
                  <li className="flex items-center gap-2">✓ Elles ne sont accessibles qu&apos;aux recruteurs dûment vérifiés et abonnés.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">3. Durée de conservation</h2>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> Les données de profil et CV sont conservées tant que le compte est actif.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> Les séquences vidéo peuvent être archivées ou supprimées par le candidat à tout moment depuis son espace personnel.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span> En cas d&apos;inactivité supérieure à 2 ans, le compte et les données associées sont supprimés.</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">4. Vos droits (Droit à l&apos;oubli)</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Conformément aux réglementations sur la protection des données personnelles, vous disposez d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression de vos données. Vous pouvez exercer ce droit directement dans vos réglages ou en écrivant à <a href="mailto:contact@netacuv.com" className="text-blue-600 font-medium hover:underline">contact@netacuv.com</a>.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
