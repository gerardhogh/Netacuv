import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { Country, City } from "country-state-city";
import { useAuth } from "../../../context/AuthContext";
import {
  Star,
  FileText,
  Video,
  CheckCircle,
  Globe,
  FileDown,
  Eye,
  Trash2,
  RefreshCw,
  Camera,
  Upload,
  X,
  ExternalLink,
  Copy,
  Download
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getVideoFromDB, deleteVideoFromDB, saveCvToDB, getCvFromDB } from "../../../../lib/indexedDB";
import { QRCodeSVG } from "qrcode.react";

type SubTab = "informations" | "reseaux" | "video";

function ProfilTalentContent({ initialTab = "informations" }: { initialTab?: SubTab }) {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<SubTab>(initialTab);
  
  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // CV states
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [selectedCvName, setSelectedCvName] = useState<string>("");
  const [cvName, setCvName] = useState<string>("Aucun CV ajouté");
  const [cvDate, setCvDate] = useState<string>("");
  const [cvBlobUrl, setCvBlobUrl] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [stars, setStars] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string>(user?.avatar || "/assets/avatar_africain.jpg");
  const [userName, setUserName] = useState<string>(user?.name || "Candidat");
  const [userTitle, setUserTitle] = useState<string>("Aucun profil");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProfile = () => {
    fetch("/api/talents/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          if (data.avatar) setUserAvatar(data.avatar);
          if (data.name) setUserName(data.name);
          if (data.talentProfile?.degree) setUserTitle(data.talentProfile.degree);
          
          if (data.talentProfile?.cvUrl) {
            setCvBlobUrl(data.talentProfile.cvUrl);
            const rawFileName = data.talentProfile.cvUrl.split('/').pop()?.split('?')[0] || "CV.pdf";
            const decodedName = decodeURIComponent(rawFileName);
            const nameParts = decodedName.split('-');
            if (nameParts.length > 2) {
              setCvName(nameParts.slice(2).join('-').replace(/_/g, ' '));
              
              const timestamp = parseInt(nameParts[1], 10);
              if (!isNaN(timestamp) && timestamp > 1000000000000) {
                const date = new Date(timestamp);
                setCvDate(date.toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                }).replace(':', 'h'));
              } else {
                setCvDate(new Date(data.talentProfile.updatedAt || Date.now()).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                }).replace(':', 'h'));
              }
            } else {
              setCvName(decodedName.replace(/_/g, ' '));
              setCvDate(new Date(data.talentProfile.updatedAt || Date.now()).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              }).replace(':', 'h'));
            }
          }

          const isInfoComplete = !!(
            data.name?.trim() &&
            data.talentProfile?.degree?.trim() &&
            data.talentProfile?.gender?.trim() &&
            data.talentProfile?.country?.trim() &&
            data.talentProfile?.city?.trim() &&
            data.talentProfile?.phone?.trim() &&
            data.talentProfile?.bio?.trim() &&
            data.talentProfile?.skills?.trim()
          );

          let pct = 0;
          if (isInfoComplete) pct += 25;
          if (data.avatar) pct += 10;
          
          const hasCv = !!(data.talentProfile?.cvUrl) || localStorage.getItem("check_cv_has_pdf") === "true";
          if (hasCv) pct += 25;

          const hasVid = !!(data.talentProfile?.videoUrl) || (user?.id && localStorage.getItem(`interview_recorded_${user.id}`) === "true");
          if (hasVid) pct += 40;

          setCompletionPercent(pct);

          if (pct === 100) setStars(5);
          else if (pct >= 80) setStars(4);
          else if (pct >= 60) setStars(3);
          else if (pct >= 40) setStars(2);
          else if (pct >= 1) setStars(1);
          else setStars(0);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (searchParams.get("tab") === "video") {
      setActiveTab("video");
    }

    // Plus besoin de charger le CV depuis IndexedDB/localStorage,
    // on va utiliser l'URL du backend récupérée via fetchProfile()
    


    fetchProfile();
  }, [searchParams]);

  // Handle Avatar Change
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Veuillez sélectionner un fichier image valide.");
      return;
    }

    try {
      showToast("Mise à jour de la photo en cours...");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/talents/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload");

      showToast("Photo de profil mise à jour avec succès !");
      fetchProfile();
      if (updateUser) {
        updateUser({ user: { image: data.avatarUrl } });
      }
    } catch (err: any) {
      console.error("Erreur sauvegarde avatar", err);
      showToast(err.message || "Une erreur s'est produite lors de la sauvegarde de la photo.");
    }
  };

  // Handle CV Selection
  const handleCvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedCvFile(file);
    setSelectedCvName(file.name);
  };

  // Handle CV Update
  const handleCvUpdate = async () => {
    if (!selectedCvFile) {
      cvInputRef.current?.click();
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(':', 'h');

    try {
      const formData = new FormData();
      formData.append("cv", selectedCvFile);

      const res = await fetch("/api/talents/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload");

      setCvBlobUrl(data.cvUrl);
      setCvName(data.fileName);
      setCvDate(formattedDate);

      localStorage.setItem("check_cv_name", data.fileName);
      localStorage.setItem("check_cv_date", formattedDate);
      localStorage.setItem("check_cv_has_pdf", "true");

      setSelectedCvFile(null);
      setSelectedCvName("");
      showToast("CV mis à jour avec succès !");
      fetchProfile();
    } catch (err: any) {
      console.error("Erreur sauvegarde CV", err);
      showToast(err.message || "Une erreur s'est produite lors de la sauvegarde du CV.");
    }
  };

  // Handle Download PDF
  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = cvBlobUrl;
    link.download = cvName || "CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Téléchargement du CV démarré.");
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cvInputRef}
        onChange={handleCvFileSelect}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* Breadcrumbs */}
      <div className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
        <span>Accueil</span>
        <span>&rsaquo;</span>
        <span>Profil</span>
        <span>&rsaquo;</span>
        <span className="text-slate-700">
          {activeTab === "informations"
            ? "Informations personnelles"
            : activeTab === "reseaux"
            ? "Réseaux sociaux"
            : "Video Entretien"}
        </span>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-[#08304c] mb-4">
            Complétion du profil
          </h3>
          <div className="w-full bg-[#e2e8f0] rounded-full h-[14px] mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                completionPercent === 0
                  ? "bg-red-400"
                  : completionPercent === 100
                  ? "bg-green-500"
                  : "bg-[#007cc0]"
              }`}
              style={{ width: `${Math.max(completionPercent, 2)}%` }}
            />
          </div>
          <p className={`text-sm font-medium ${
            completionPercent === 100 ? "text-green-600" : completionPercent === 0 ? "text-red-500" : "text-[#007cc0]"
          }`}>{completionPercent}% complété</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-[#08304c] mb-4">
            Niveau de certification
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={26}
                className={s <= stars ? "text-amber-400 fill-amber-400" : "text-amber-200 fill-amber-100"}
              />
            ))}
          </div>
          <p className="text-sm text-[#007cc0] font-medium">
            {stars === 0 ? "Aucune étoile" : stars === 1 ? "1 étoile obtenue" : `${stars} étoiles obtenues`}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm text-center flex flex-col items-center">
            {/* Avatar Cliquable */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-28 h-28 rounded-full bg-blue-50 border-4 border-white shadow-md mb-4 relative cursor-pointer group transition-all"
              title="Cliquer pour modifier la photo de profil"
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={userAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Overlay hover */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold">
                <Camera size={20} className="mb-0.5" />
                <span>Modifier</span>
              </div>

              {/* Badge Camera Icon */}
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#008de4] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-blue-600 transition-colors">
                <Camera size={14} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              {userName}
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-4">
              {userTitle || "Talent"}
            </p>

            <div className="flex items-center gap-3 mb-8">
              <span className="bg-[#22c55e] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                Actif
              </span>
              <span className="bg-[#e0f2fe] text-[#0284c7] text-xs font-bold px-4 py-1.5 rounded-full">
                Certifié
              </span>
            </div>

            {/* CV Upload */}
            <div className="w-full text-left">
              <h4 className="text-[15px] font-bold text-[#08304c] mb-3">
                CV (Curriculum Vitae)
              </h4>
              <div 
                onClick={() => cvInputRef.current?.click()}
                className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden mb-4 cursor-pointer hover:border-blue-400 transition-colors"
              >
                <div className="bg-slate-50 px-3 py-2 text-sm text-slate-600 border-r border-slate-200 hover:bg-slate-100 whitespace-nowrap font-medium">
                  Parcourir...
                </div>
                <div className="px-3 py-2 text-sm text-slate-500 truncate flex-1">
                  {selectedCvName || "Aucun fichier sélectionné."}
                </div>
              </div>
              <button
                onClick={handleCvUpdate}
                className="w-full flex items-center justify-center gap-2 bg-[#008de4] hover:bg-blue-600 text-white font-bold py-2.5 rounded-md text-sm transition-colors shadow-sm"
              >
                <FileText size={16} />
                Mettre à jour
              </button>
            </div>
          </div>

          {/* CV Preview Card */}
          <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
            <h4 className="text-[13px] text-slate-800 font-bold mb-4">
              CV actualisé le {cvDate}
            </h4>
            
            {/* Visual Real CV Preview */}
            <div 
              onClick={() => setIsPreviewOpen(true)}
              className="border border-slate-200 rounded-lg mb-4 shadow-sm bg-white p-1 h-[350px] overflow-hidden flex items-center justify-center relative cursor-pointer group hover:border-[#008de4] transition-all"
              title="Cliquer pour prévisualiser le document complet"
            >
              {cvBlobUrl ? (
                <iframe
                  src={`${cvBlobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full rounded border-0 bg-white pointer-events-none"
                  title="Aperçu du CV"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded p-4">
                  <div className="w-16 h-20 bg-white shadow-sm border border-slate-200 rounded-sm mb-3 flex flex-col p-2 gap-1.5 opacity-60">
                    <div className="w-1/2 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1"></div>
                    <div className="w-5/6 h-1 bg-slate-100 rounded-full"></div>
                    <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                    <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Aucun CV disponible</p>
                  <p className="text-[10px] text-slate-400 mt-1 text-center px-4">Uploadez votre CV pour qu'il s'affiche ici</p>
                </div>
              )}

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-blue-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[0.5px]">
                <span className="bg-white text-[#008de4] px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                  <Eye size={14} /> Prévisualiser le CV
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-md text-[11px] transition-colors"
                title="Télécharger le fichier PDF"
              >
                <FileDown size={14} className="text-red-500" />
                Télécharger le pdf
              </button>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-[#008de4] hover:bg-blue-600 text-white font-bold py-2 rounded-md text-[11px] transition-colors shadow-sm"
                title="Prévisualiser le document"
              >
                <Eye size={14} />
                Prévisualiser
              </button>
            </div>
          </div>
        </div>

      {/* ── MODALE DE PRÉVISUALISATION DU CV ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#008de4] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Prévisualisation du CV - {user?.name || "Candidat"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {cvName} • Actualisé le {cvDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-[#008de4] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <FileDown size={15} /> Télécharger
                </button>
                <a
                  href={cvBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex items-center justify-center">
              {cvBlobUrl ? (
                <iframe
                  src={`${cvBlobUrl}#toolbar=0`}
                  className="w-full h-full bg-white rounded-lg shadow-inner border border-slate-300"
                  title="Prévisualisation PDF"
                />
              ) : (
                <div className="w-full max-w-2xl h-full bg-white rounded-lg shadow-inner border border-slate-300 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col p-12 gap-6 opacity-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 bg-slate-400 rounded-full"></div>
                      <div className="space-y-4 flex-1">
                        <div className="h-6 bg-slate-400 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-400 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-400 rounded w-full"></div>
                    <div className="h-4 bg-slate-400 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-400 rounded w-full"></div>
                    <div className="h-4 bg-slate-400 rounded w-4/5"></div>
                    <div className="h-4 bg-slate-400 rounded w-full mt-8"></div>
                    <div className="h-4 bg-slate-400 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-400 rounded w-3/4"></div>
                  </div>
                  <FileText size={64} className="text-slate-300 mb-4 z-10" />
                  <h3 className="text-xl font-bold text-slate-600 z-10">Aucun CV disponible</h3>
                  <p className="text-sm text-slate-500 z-10">Veuillez d'abord uploader un document PDF.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Right Content */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col h-full">
          {/* Custom Tabs Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex bg-[#f4f8fb] rounded-lg p-1 w-full max-w-[500px]">
              <button
                onClick={() => setActiveTab("informations")}
                className={`flex-1 text-[13px] font-bold py-2 rounded-md text-center transition-colors ${
                  activeTab === "informations"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Informations
              </button>
              <button
                onClick={() => setActiveTab("reseaux")}
                className={`flex-1 text-[13px] font-bold py-2 rounded-md text-center transition-colors ${
                  activeTab === "reseaux"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Réseaux
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`flex-1 text-[13px] font-bold py-2 rounded-md text-center transition-colors ${
                  activeTab === "video"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Vidéo Entretien
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "informations" && <InformationsTab onUpdate={fetchProfile} />}
            {activeTab === "reseaux" && <ReseauxTab />}
            {activeTab === "video" && <VideoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilTalent({ initialTab = "informations" }: { initialTab?: SubTab }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <ProfilTalentContent initialTab={initialTab} />
    </Suspense>
  );
}

/* ─── Onglet: Informations ─── */
function InformationsTab({ onUpdate }: { onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    degree: "",
    username: "",
    gender: "",
    country: "",
    city: "",
    phone: "",
    email: "",
    skills: "",
    searchType: "Emploi"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showTabToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/talents/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            bio: data.talentProfile?.bio || "",
            degree: data.talentProfile?.degree || "",
            username: data.talentProfile?.username || data.email?.split("@")[0] || "",
            gender: data.talentProfile?.gender || "",
            country: data.talentProfile?.country || "",
            city: data.talentProfile?.city || "",
            phone: data.talentProfile?.phone || "",
            skills: data.talentProfile?.skills ? JSON.parse(data.talentProfile.skills).join(", ") : "",
            searchType: "Emploi"
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === "country") {
        next.city = ""; // Reset city when country changes
      }
      return next;
    });
  };

  const countriesList = Country.getAllCountries();
  const citiesList = formData.country ? City.getCitiesOfCountry(formData.country) : [];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        degree: formData.degree,
        gender: formData.gender,
        skills: formData.skills ? JSON.stringify(formData.skills.split(",").map(s => s.trim())) : undefined
      };
      
      const res = await fetch("/api/talents/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showTabToast("Informations mises à jour avec succès ✓", "success");
        if (onUpdate) onUpdate();
      } else {
        showTabToast("Erreur lors de la mise à jour", "error");
      }
    } catch (e) {
      console.error(e);
      showTabToast("Erreur lors de la mise à jour", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const profileLink = typeof window !== "undefined" && formData.username ? `https://netacuv.com/talents/${formData.username}` : "";

  const handleCopyLink = () => {
    if (!profileLink) return;
    navigator.clipboard.writeText(profileLink);
    showTabToast("Lien de profil copié !");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("profile-qrcode");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `qrcode-${formData.username || "profil"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="p-4 text-center text-slate-500">Chargement...</div>;

  return (
    <div className="space-y-6 relative">
      {/* In-app toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">Nom Complet</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Titre professionnel
          </label>
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            placeholder="ex: Développeur Frontend"
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            disabled
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-500 outline-none opacity-70"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Sexe H/F
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sélectionnez</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Types d'opportunités recherchées
          </label>
          <input
            type="text"
            name="searchType"
            value={formData.searchType}
            onChange={handleChange}
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Pays/Nationalité
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sélectionnez un pays</option>
            {countriesList.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">Ville</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!formData.country}
            className={`w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-blue-100 ${!formData.country ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-800'}`}
          >
            <option value="">Sélectionnez une ville</option>
            {citiesList?.map((city, index) => (
              <option key={`${city.name}-${index}`} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">
            Numéro de téléphone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="ex: +229 01 02 03 04"
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#475569] font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-500 outline-none opacity-70"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-[#475569] font-semibold">
          Biographie
        </label>
        <textarea
          rows={3}
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Parlez-nous de vous..."
          className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-[#475569] font-semibold">
          Compétences clés
        </label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Ajoutez vos compétences séparées par des virgules (ex: React, Node, SQL)"
          className="w-full bg-[#f8fafc] border-none rounded-md px-4 py-3 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#008de4] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-md text-[14px] transition-colors mt-2"
      >
        {isSaving ? "Enregistrement..." : "Modifier les informations"}
      </button>

      {/* Section Lien de Profil & QR Code */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-lg flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-3">
          <h4 className="text-[15px] font-bold text-[#08304c]">
            Partagez votre profil public
          </h4>
          <p className="text-[13px] text-slate-600">
            Augmentez votre visibilité en partageant ce lien et ce code QR sur vos réseaux sociaux ou directement avec des recruteurs.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-500 font-medium flex-1 truncate select-all" title={profileLink}>
              {profileLink || "Génération du lien..."}
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-white border border-slate-200 p-2 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-600 shadow-sm"
              title="Copier le lien"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          {profileLink ? (
            <QRCodeSVG 
              id="profile-qrcode"
              value={profileLink} 
              size={110} 
              level="M" 
              includeMargin={false} 
            />
          ) : (
            <div className="w-[110px] h-[110px] bg-slate-100 rounded animate-pulse" />
          )}
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#008de4] hover:text-blue-600 transition-colors"
          >
            <Download size={14} />
            Télécharger QR
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─── Onglet: Réseaux ─── */
function ReseauxTab() {
  const [formData, setFormData] = useState({
    facebook: "",
    linkedin: "",
    twitter: "",
    pinterest: "",
    behance: "",
    other1: "",
    other2: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showTabToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/talents/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            facebook: data.talentProfile?.facebook || "",
            linkedin: data.talentProfile?.linkedin || "",
            twitter: data.talentProfile?.twitter || "",
            pinterest: data.talentProfile?.pinterest || "",
            behance: data.talentProfile?.behance || "",
            other1: data.talentProfile?.other1 || "",
            other2: data.talentProfile?.other2 || ""
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/talents/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showTabToast("Réseaux sociaux mis à jour avec succès ✓", "success");
      } else {
        showTabToast("Erreur lors de la mise à jour", "error");
      }
    } catch (e) {
      console.error(e);
      showTabToast("Erreur lors de la mise à jour", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center text-slate-500">Chargement...</div>;

  return (
    <div className="space-y-5 relative">
      {/* In-app toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        {[
          {
            name: "facebook", label: "Facebook",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-blue-600"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>)
          },
          {
            name: "linkedin", label: "LinkedIn",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-sky-600"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>)
          },
          {
            name: "twitter", label: "Twitter / X",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>)
          },
          {
            name: "pinterest", label: "Pinterest",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-red-600"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.17c-.038.156-.128.188-.291.111-1.092-.516-1.776-2.13-1.776-3.432 0-2.796 2.032-5.364 5.864-5.364 3.084 0 5.482 2.196 5.482 5.132 0 3.067-1.933 5.535-4.618 5.535-1.127 0-2.188-.585-2.55-1.275l-.693 2.645c-.25.952-.924 2.142-1.378 2.871 1.098.341 2.261.523 3.46.523 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z" /></svg>)
          },
          {
            name: "behance", label: "Behance",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V3.98h7.366c3.121 0 5.028 1.074 5.028 3.411 0 1.76-1.073 2.537-2.074 2.924 1.343.344 2.457 1.332 2.457 3.344 0 2.92-2.348 3.329-5.11 3.329zm-1.898-10.999H2.82v4h1.748c1.375 0 2.234-.355 2.234-1.921 0-1.493-.848-2.079-2.234-2.079zm.344 6h-2.091v4.394h2.091c1.554 0 2.65-.453 2.65-2.221 0-1.767-1.157-2.173-2.65-2.173z" /></svg>)
          },
          {
            name: "other1", label: "Autres",
            customPlaceholder: "Lien portfolio ou autre",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-slate-500"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>)
          },
          {
            name: "other2", label: "Autres",
            customPlaceholder: "Lien portfolio ou autre",
            icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-slate-500"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>)
          },
        ].map((net) => (
          <div key={net.name} className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5 w-32 shrink-0">
              <div className="flex items-center gap-2">
                {net.icon}
                <span className="text-[13px] text-slate-700 font-semibold">
                  {net.label} <span className="text-slate-400 font-normal">:</span>
                </span>
              </div>
            </div>
            <input
              type="url"
              name={net.name}
              value={(formData as any)[net.name]}
              onChange={handleChange}
              placeholder={(net as any).customPlaceholder || `Lien vers votre profil ${net.label}`}
              className="flex-1 bg-white border border-slate-300 rounded-md px-4 py-2 text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        ))}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#008de4] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-md text-[14px] transition-colors"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les informations"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Onglet: Video Entretien ─── */
import { DeleteVideoModal, ReplaceVideoModal } from "../../../components/modals/InterviewModals";

function VideoTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasVideo, setHasVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      setIsLoading(true);
      try {
        // 1. Check if video URL exists in DB (Supabase) via API
        const res = await fetch("/api/talents/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const dbVideoUrl = data.talentProfile?.videoUrl;
          if (dbVideoUrl && isMounted) {
            setVideoUrl(dbVideoUrl);
            setHasVideo(true);
            setIsLoading(false);
            return; // Supabase URL found — no need to check IndexedDB
          }
        }
      } catch (e) {
        console.warn("Could not fetch profile videoUrl from API", e);
      }

      // 2. Fallback: check IndexedDB (local blob)
      const isRecorded = typeof window !== "undefined" && user?.id && localStorage.getItem(`interview_recorded_${user.id}`) === "true";
      if (isRecorded) {
        try {
          const blob = await getVideoFromDB();
          if (!isMounted) return;
          if (blob && blob.size > 0) {
            setVideoBlob(blob);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setHasVideo(true);
          } else {
            setHasVideo(false);
            setVideoUrl(null);
          }
        } catch (err) {
          console.error("Error loading video from DB:", err);
          if (isMounted) setHasVideo(false);
        }
      } else {
        setHasVideo(false);
        setVideoUrl(null);
      }

      if (isMounted) setIsLoading(false);
    };

    loadVideo();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleDelete = () => {
    if (user?.id) localStorage.removeItem(`interview_recorded_${user.id}`);
    deleteVideoFromDB()
      .then(() => {
        setHasVideo(false);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
        setVideoBlob(null);
      })
      .catch(console.error);
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const ext = videoBlob?.type?.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `entretien-video-netacuv.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStartOrRestartClick = () => {
    if (hasVideo) {
      setIsReplaceModalOpen(true);
    } else {
      router.push("/interview");
    }
  };

  const handleConfirmReplace = () => {
    setIsReplaceModalOpen(false);
    handleDelete();
    router.push("/interview");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="text-[#008de4]" size={22} />
        <h3 className="text-[18px] font-bold text-[#008de4]">
          Lancer l'entretien vidéo
        </h3>
      </div>

      <p className="text-[14px] text-slate-700 font-medium">
        Passe chaque étape d'entretien pour certifier ton profil :
      </p>

      <ol className="list-decimal pl-5 space-y-1 text-[14px] text-slate-700">
        <li>Lire la question affichée à l'écran.</li>
        <li>Se préparer en 20 secondes maximum.</li>
        <li>Enregistrer une réponse vidéo de 1 min ou plus maximum.</li>
        <li>Choisir entre continuer ou recommencer (max 3 tentatives).</li>
        <li>Envoyer la réponse finale pour validation Netacuv.</li>
        <li>Une fois validée, la vidéo apparaîtra ici sous forme de vignette.</li>
      </ol>

      <h3 className="text-[18px] font-bold text-[#008de4] pt-2">
        Conseils pour réussir votre entretien vidéo
      </h3>

      <ul className="list-disc pl-5 space-y-2 text-[14px] text-slate-700 marker:text-[#008de4]">
        <li>
          <span className="font-bold text-[#008de4]">Préparation : </span>
          Assurez-vous d'avoir un environnement calme et bien éclairé.
        </li>
        <li>
          <span className="font-bold text-[#008de4]">Technique : </span>
          Testez votre caméra et votre microphone avant l'enregistrement.
        </li>
        <li>
          <span className="font-bold text-[#008de4]">Présentation : </span>
          Habillez-vous de manière professionnelle et regardez la caméra pour établir un contact visuel.
        </li>
        <li>
          <span className="font-bold text-[#008de4]">Clarté : </span>
          Parlez distinctement et structurez vos réponses pour être compris facilement.
        </li>
      </ul>

      <div className="bg-[#f0f9ff] rounded-lg p-5 my-6 text-[14px] text-slate-700 leading-relaxed border border-blue-50">
        <p className="mb-4">
          Ce test est constitué de 20 questions. Vous aurez une variation de temps pour
          répondre. Vous disposez de 3 tentatives. En cas d'annulation, l'entretien recommence
          depuis le début.
        </p>
        <p className="mb-4">
          Si vous utilisez vos 3 tentatives sans succès, vous devrez attendre 3 jours avant de
          pouvoir réessayer.
        </p>
        <p className="font-bold italic text-[15px]">Êtes-vous prêt à commencer ?</p>
      </div>

      <button
        onClick={handleStartOrRestartClick}
        className="flex items-center justify-center w-full bg-[#008de4] hover:bg-blue-600 text-white font-bold py-3.5 rounded-md text-[14px] transition-colors cursor-pointer"
      >
        Commencer mon entretien vidéo maintenant
      </button>

      <div className="pt-6">
        <p className="text-[14px] text-slate-700 font-medium mb-4">
          Votre vidéo enregistrée :
        </p>
        {isLoading ? (
          <div className="bg-slate-900/90 rounded-xl aspect-[16/9] flex flex-col items-center justify-center gap-3 border border-slate-800 shadow-inner">
            <div className="w-8 h-8 border-3 border-blue-400/30 border-t-[#008de4] rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Chargement de votre vidéo enregistrée...</p>
          </div>
        ) : hasVideo && videoUrl ? (
          <div className="space-y-4">
            <div className="w-full bg-black rounded-xl aspect-[16/9] overflow-hidden shadow-md relative border border-slate-200">
              <video 
                src={videoUrl} 
                controls 
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  // Fix WebM 0:00 / Infinity duration in Chromium and paint first frame
                  if (!isFinite(v.duration) || v.duration === 0) {
                    v.currentTime = 1e101;
                    v.ontimeupdate = () => {
                      v.ontimeupdate = null;
                      v.currentTime = 0.001;
                    };
                  } else {
                    if (v.currentTime === 0) {
                      v.currentTime = 0.001;
                    }
                  }
                }}
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(true)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-md text-[13px] font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                <Trash2 size={16} />
                Supprimer la vidéo
              </button>
              {videoUrl && (
                <button 
                  onClick={handleDownloadVideo}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-md text-[13px] font-bold hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <Download size={16} />
                  Télécharger la vidéo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="text-[#008de4]" size={20} />
            </div>
            <p className="text-[14px] text-slate-600 font-medium">Aucune vidéo enregistrée</p>
            <p className="text-[13px] text-slate-400 mt-1">Commencez l'entretien pour enregistrer votre vidéo.</p>
          </div>
        )}
      </div>

      <DeleteVideoModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={() => {
          handleDelete();
          setIsDeleteModalOpen(false);
        }} 
      />

      <ReplaceVideoModal 
        isOpen={isReplaceModalOpen} 
        onClose={() => setIsReplaceModalOpen(false)} 
        onConfirm={handleConfirmReplace} 
      />
    </div>
  );
}
