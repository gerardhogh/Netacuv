"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, Clock, Send, Paperclip } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "talent",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Votre message a été envoyé avec succès ! Nous vous répondrons sous 24h.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Contactez l'équipe <span className="text-blue-600">Netacuv</span></h1>
          <p className="text-slate-600 text-lg">
            Une question, un problème technique ou un partenariat ? Nous sommes là pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Contact Info */}
          <div className="space-y-10">
            <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden shadow-2xl mb-8">
              <img 
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop" 
                alt="Équipe Netacuv" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">E-mail Support Talents</h3>
                <a href="mailto:gerardhounnou.gh@gmail.com" className="text-blue-600 hover:underline text-sm font-medium">gerardhounnou.gh@gmail.com</a>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">E-mail Entreprises</h3>
                <a href="mailto:recruteurs@netacuv.com" className="text-blue-600 hover:underline text-sm font-medium">recruteurs@netacuv.com</a>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Assistance WhatsApp / Tél</h3>
                <a href="tel:+2290198738127" className="text-slate-600 hover:text-blue-600 text-sm font-medium">+229 01 98 73 81 27</a>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Horaires</h3>
                <p className="text-slate-600 text-sm">Lun - Ven, 8h00 - 18h00 (GMT+1)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 hover:scale-110 hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 hover:scale-110 hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 hover:scale-110 hover:shadow-md transition-all text-slate-600 hover:text-blue-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Envoyez-nous un message</h2>
            <p className="text-sm text-green-600 font-medium mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Réponse garantie sous 24 heures
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Adresse E-mail *</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" placeholder="jean@exemple.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vous êtes *</label>
                <CustomSelect
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  options={[
                    { label: "Un Talent / Candidat", value: "talent" },
                    { label: "Un Recruteur / Entreprise", value: "recruteur" },
                    { label: "Autre", value: "autre" },
                  ]}
                  buttonClassName="py-3 bg-slate-50 border-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sujet de votre message *</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Problème avec mon test vidéo, Question sur l'abonnement..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message *</label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors resize-none" placeholder="Détaillez votre demande ici..."></textarea>
              </div>

              <div>
                <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center">
                    <Paperclip className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm font-medium text-slate-600">Joindre une capture d'écran (optionnel)</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF (Max 5MB)</span>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>

              <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                <Send size={18} /> Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
