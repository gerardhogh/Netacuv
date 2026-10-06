"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit2, Eye, X, ChevronLeft, ChevronRight, Shield, ChevronDown } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  rolePermissions: { permission: { code: string } }[];
  active: boolean;
  _count?: { users: number };
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roleId: string | null;
  role: Role | null;
  createdAt: string;
  updatedAt: string;
};

type AuditLog = {
  id: string;
  action: string;
  by: string;
  createdAt: string;
};

const permissionsCategories = [
  { id: "*:*", label: "Accès total (bypass rules)", category: "System" },
  { id: "roles:read", label: "Voir les rôles", category: "System" },
  { id: "roles:write", label: "Gérer les rôles", category: "System" },
  { id: "roles:delete", label: "Supprimer les rôles", category: "System" },
  { id: "jobs:approve", label: "Approuver les offres", category: "Jobs" },
  { id: "jobs:delete", label: "Supprimer les offres", category: "Jobs" },
  { id: "users:read", label: "Voir les utilisateurs", category: "Users" },
  { id: "users:moderate", label: "Modérer les utilisateurs", category: "Users" },
  { id: "reviews:read", label: "Lire les avis", category: "Reviews" },
  { id: "ai:configure", label: "Configurer l'IA", category: "AI" },
  { id: "ai:audit", label: "Auditer l'IA", category: "AI" },
  { id: "questions:manage", label: "Gérer les questions", category: "Questions" },
  { id: "certifications:read", label: "Voir les certifications", category: "Certifications" },
  { id: "subscriptions:read", label: "Voir les abonnements", category: "Finance" },
  { id: "payments:refund", label: "Rembourser les paiements", category: "Finance" },
  { id: "metrics:view", label: "Voir les métriques", category: "Finance" },
  { id: "premium:toggle", label: "Activer/Désactiver Premium", category: "Finance" },
  { id: "tickets:manage", label: "Gérer les tickets", category: "Tickets" },
  { id: "emails:resend", label: "Renvoyer les emails", category: "Emails" }
];

export default function AdminPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchPR, setSearchPR] = useState("");
  const [searchGU, setSearchGU] = useState("");
  const [searchHM, setSearchHM] = useState("");

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentRole, setCurrentRole] = useState<Partial<Role>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'logs'>('users');

  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<User | null>(null);
  const [selectedRoleIdForUser, setSelectedRoleIdForUser] = useState<string>("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleId: "none" });

  // Pagination for logs
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRoles, resUsers, resLogs] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/users"),
        fetch("/api/audit-logs")
      ]);
      const dataRoles = await resRoles.json();
      const dataUsers = await resUsers.json();
      const dataLogs = await resLogs.json();
      
      if (resRoles.ok) setRoles(dataRoles);
      if (resUsers.ok) setUsers(dataUsers);
      if (resLogs.ok) setLogs(dataLogs);
    } catch (err) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRoleModal = (mode: "create" | "edit" | "view", role?: Role) => {
    setRoleModalMode(mode);
    if (role) {
      setCurrentRole(role);
      setSelectedPermissions(role.rolePermissions?.map(rp => rp.permission.code) || []);
    } else {
      setCurrentRole({ name: "", description: "", isSystem: false });
      setSelectedPermissions([]);
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!currentRole.name) {
      toast.error("Le nom du rôle est obligatoire");
      return;
    }

    const payload = {
      name: currentRole.name,
      description: currentRole.description,
      permissions: selectedPermissions
    };

    const url = roleModalMode === "create" ? "/api/roles" : `/api/roles/${currentRole.id}`;
    const method = roleModalMode === "create" ? "POST" : "PUT";

    const tid = toast.loading("Enregistrement en cours...");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'enregistrement");
      }
      
      toast.success(`Rôle ${roleModalMode === "create" ? "créé" : "modifié"} avec succès !`, { id: tid });
      setIsRoleModalOpen(false);
      fetchData(); // Reload everything to update logs and roles
    } catch (err: any) {
      toast.error(err.message || "Une erreur s'est produite", { id: tid });
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    if (role.name === "Super Admin") return;
    const tid = toast.loading("Mise à jour...");
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !role.active })
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`Le rôle a été ${!role.active ? 'activé' : 'suspendu'}`, { id: tid });
      fetchData();
    } catch (err) {
      toast.error("Impossible de mettre à jour le rôle", { id: tid });
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    const tid = toast.loading("Suppression en cours...");
    try {
      const res = await fetch(`/api/roles/${roleToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur de suppression", { id: tid });
        return;
      }
      toast.success("Rôle supprimé avec succès", { id: tid });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Impossible de supprimer le rôle", { id: tid });
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const tid = toast.loading("Mise à jour de l'utilisateur...");
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active })
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`L'utilisateur a été ${!user.active ? 'activé' : 'suspendu'}`, { id: tid });
      fetchData();
    } catch (err) {
      toast.error("Impossible de mettre à jour l'utilisateur", { id: tid });
    }
  };

  const handleAssignRole = async () => {
    if (!userToAssign) return;
    const tid = toast.loading("Attribution du rôle...");
    try {
      const res = await fetch(`/api/users/${userToAssign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRoleIdForUser === "none" ? null : selectedRoleIdForUser })
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Rôle attribué avec succès", { id: tid });
      setIsAssignRoleModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Impossible d'attribuer le rôle", { id: tid });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (newUser.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const tid = toast.loading("Création de l'utilisateur...");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          roleId: newUser.roleId === "none" ? null : newUser.roleId
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }
      
      toast.success("Utilisateur créé avec succès", { id: tid });
      setIsAddUserModalOpen(false);
      setNewUser({ name: "", email: "", password: "", roleId: "none" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Impossible de créer l'utilisateur", { id: tid });
    }
  };

  // Filtered lists
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchPR.toLowerCase()));
  const filteredUsers = users.filter(u => (u.name || "").toLowerCase().includes(searchGU.toLowerCase()) || (u.email || "").toLowerCase().includes(searchGU.toLowerCase()));
  const filteredLogs = logs.filter(l => l.action.toLowerCase().includes(searchHM.toLowerCase()));
  
  // Paginated logs
  const totalLogsPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-[#32A8D7]" /> Permissions & Rôles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les rôles, attribuez des permissions aux utilisateurs et consultez l'historique d'audit.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'users' ? 'text-[#32A8D7]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#32A8D7] rounded-t-full" />}
        </button>
        <button
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'roles' ? 'text-[#32A8D7]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('roles')}
        >
          Rôles
          {activeTab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#32A8D7] rounded-t-full" />}
        </button>
        <button
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'logs' ? 'text-[#32A8D7]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('logs')}
        >
          Historique
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#32A8D7] rounded-t-full" />}
        </button>
      </div>

      {/* Gestion des Utilisateurs */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#0c2f4a]">Gestion des Utilisateurs et Attribution de Rôles</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchGU}
                  onChange={e => setSearchGU(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-48"
                />
              </div>
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-5 py-2 bg-[#009FE3] text-white font-bold text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Ajouter un utilisateur
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Email</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Dernière mise à jour</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Rôle actuel</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chargement des utilisateurs...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun utilisateur trouvé</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-[#1e4869] font-medium align-top pt-6">{u.name}</td>
                      <td className="px-6 py-4 text-[#1e4869] align-top pt-6">{u.email}</td>
                      <td className="px-6 py-4 text-[#1e4869] align-top pt-6">{formatDate(u.updatedAt)}</td>
                      <td className="px-6 py-4 text-[#1e4869] align-top pt-6">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {u.role ? u.role.name : (
                            (u as any).talentProfile ? "TALENT" :
                            (u as any).recruiterProfile ? "RECRUTEUR" :
                            "Aucun rôle"
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top pt-6">
                        <div className="flex flex-col gap-1 items-start text-xs font-semibold">
                          <div className="relative w-full max-w-[140px]">
                            <select 
                              value={u.roleId || "none"}
                              onChange={(e) => {
                                setUserToAssign(u);
                                setSelectedRoleIdForUser(e.target.value);
                                setIsAssignRoleModalOpen(true);
                              }}
                              className="w-full bg-[#f4f9fd] border border-slate-200 text-[#0c2f4a] rounded-lg pl-2 pr-6 py-1.5 text-xs focus:ring-[#32A8D7] focus:outline-none cursor-pointer appearance-none"
                            >
                              <option value="none">Aucun rôle</option>
                              {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2" onClick={() => handleToggleUserStatus(u)}>
                            <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${u.active ? 'bg-[#10b981]' : 'bg-slate-300'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${u.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className={u.active ? 'text-[#10b981]' : 'text-slate-500 cursor-pointer'}>
                              {u.active ? 'Activé' : 'Suspendu'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions et Rôles */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#0c2f4a]">Permissions et Rôles</h2>
            <div className="flex items-center gap-3">
              <span className="text-[#32A8D7] text-sm font-semibold bg-[#eaf6fc] px-4 py-2 rounded-lg">
                {roles.length} rôles au total
              </span>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchPR}
                  onChange={e => setSearchPR(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-48"
                />
              </div>
              <button 
                onClick={() => handleOpenRoleModal("create")}
                className="px-5 py-2 bg-[#009FE3] text-white font-bold text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Créer un rôle
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Nom du rôle</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Description</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Utilisateurs</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Dernière mise à jour</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chargement des rôles...</td></tr>
                ) : filteredRoles.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun rôle trouvé</td></tr>
                ) : (
                  filteredRoles.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-[#1e4869] font-medium flex items-center gap-2">
                        {p.name}
                        {p.isSystem && <span title="Rôle Système"><Shield size={14} className="text-amber-500" /></span>}
                      </td>
                      <td className="px-6 py-4 text-[#1e4869] max-w-xs truncate">{p.description}</td>
                      <td className="px-6 py-4 text-[#1e4869]">{p._count?.users || 0}</td>
                      <td className="px-6 py-4 text-[#1e4869]">{formatDate(p.updatedAt)}</td>
                      <td className="px-6 py-4">
                        {!p.isSystem && p.name !== "Super Admin" ? (
                          <div className="flex flex-col gap-1 items-start text-xs font-semibold">
                            <button onClick={() => handleOpenRoleModal("view", p)} className="text-[#32A8D7] hover:underline flex items-center gap-1"><Eye size={12}/> Voir</button>
                            <button onClick={() => handleOpenRoleModal("edit", p)} className="text-[#32A8D7] hover:underline flex items-center gap-1"><Edit2 size={12}/> Modifier</button>
                            <div className="flex items-center gap-1.5 mt-1" onClick={() => handleToggleRoleStatus(p)}>
                              <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${p.active ? 'bg-[#10b981]' : 'bg-slate-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${p.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                              <span className={p.active ? 'text-[#10b981]' : 'text-slate-500 cursor-pointer'}>
                                {p.active ? 'Activé' : 'Suspendu'}
                              </span>
                            </div>
                            <button onClick={() => { setRoleToDelete(p); setIsDeleteModalOpen(true); }} className="text-red-500 hover:underline mt-1 flex items-center gap-1"><Trash2 size={12}/> Supprimer</button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Action non permise</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historique des Modifications */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#0c2f4a]">Historique des Modifications (Logs d'Audit)</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={searchHM}
                  onChange={e => setSearchHM(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-48"
                />
              </div>
              <span className="text-[#32A8D7] text-sm font-semibold bg-[#eaf6fc] px-4 py-2 rounded-lg">
                {logs.length} modifications au total
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Action</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Effectué Par</th>
                  <th className="px-6 py-4 font-semibold text-[#1e4869]">Date & Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500">Chargement de l'historique...</td></tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500">Aucun log trouvé</td></tr>
                ) : (
                  paginatedLogs.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-[#1e4869] font-medium">{h.action}</td>
                      <td className="px-6 py-4 text-[#1e4869] whitespace-pre-line text-xs">{h.by}</td>
                      <td className="px-6 py-4 text-[#1e4869]">{formatDate(h.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination logs */}
          {totalLogsPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Page {logsPage} sur {totalLogsPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setLogsPage(p => Math.min(totalLogsPages, p + 1))}
                  disabled={logsPage === totalLogsPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALES --- */}

      {/* Role Create/Edit/View Modal */}
      {isRoleModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0c2f4a]">
                {roleModalMode === "create" ? "Créer un nouveau rôle" : roleModalMode === "edit" ? "Modifier le rôle" : "Détails du rôle"}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom du rôle</label>
                <input 
                  type="text" 
                  value={currentRole.name || ""}
                  onChange={e => setCurrentRole({...currentRole, name: e.target.value})}
                  disabled={roleModalMode === "view"}
                  placeholder="Ex: Rédacteur, Superviseur..."
                  className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#32A8D7] disabled:opacity-70"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  value={currentRole.description || ""}
                  onChange={e => setCurrentRole({...currentRole, description: e.target.value})}
                  disabled={roleModalMode === "view"}
                  placeholder="Décrivez les responsabilités liées à ce rôle..."
                  className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-[#32A8D7] disabled:opacity-70"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 block">Permissions</label>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  {/* Regrouping by category */}
                  {Array.from(new Set(permissionsCategories.map(c => c.category))).map(category => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissionsCategories.filter(p => p.category === category).map(perm => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'border-[#32A8D7] bg-[#eaf6fc]' : 'border-slate-200 bg-white hover:border-[#32A8D7]/30'} ${roleModalMode === "view" ? "cursor-default" : ""}`}>
                              <input 
                                type="checkbox"
                                disabled={roleModalMode === "view"}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (roleModalMode === "view") return;
                                  if (e.target.checked) setSelectedPermissions([...selectedPermissions, perm.id]);
                                  else setSelectedPermissions(selectedPermissions.filter(id => id !== perm.id));
                                }}
                                className="custom-checkbox"
                              />
                              <span className="text-sm text-slate-700">{perm.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                {roleModalMode === "view" ? "Fermer" : "Annuler"}
              </button>
              {roleModalMode !== "view" && (
                <button 
                  onClick={handleSaveRole}
                  className="px-6 py-2.5 rounded-lg bg-[#32A8D7] text-white font-bold text-sm hover:bg-[#1e8ae9] transition-colors"
                >
                  Enregistrer
                </button>
              )}
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Supprimer le rôle</h3>
            <p className="text-slate-500 text-sm mb-8">
              Êtes-vous sûr de vouloir supprimer le rôle "{roleToDelete?.name}" ? Cette action est irréversible. Si des utilisateurs possèdent ce rôle, la suppression sera bloquée.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors w-full"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteRole}
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors w-full"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Assign Role Modal */}
      {isAssignRoleModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0c2f4a]">Gérer le rôle de l'utilisateur</h3>
              <button onClick={() => setIsAssignRoleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Voulez-vous vraiment assigner le rôle <strong>{selectedRoleIdForUser === "none" ? "Aucun rôle" : roles.find(r => r.id === selectedRoleIdForUser)?.name}</strong> à <strong>{userToAssign?.name}</strong> ({userToAssign?.email}) ?
              </p>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsAssignRoleModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleAssignRole}
                className="px-6 py-2.5 rounded-lg bg-[#32A8D7] text-white font-bold text-sm hover:bg-[#1e8ae9] transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0c2f4a]">Ajouter un Utilisateur</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom complet</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#32A8D7]"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#32A8D7]"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mot de passe (temporaire)</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#32A8D7]"
                  placeholder="Min 6 caractères"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rôle</label>
                <div className="relative">
                  <select 
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#32A8D7] appearance-none cursor-pointer"
                  >
                    <option value="none">Aucun rôle</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleCreateUser}
                className="px-6 py-2.5 rounded-lg bg-[#32A8D7] text-white font-bold text-sm hover:bg-[#1e8ae9] transition-colors"
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

    </div>
  );
}
