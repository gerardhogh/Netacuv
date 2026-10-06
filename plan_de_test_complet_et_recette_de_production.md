# 🧪 Cahier de Recette & Plan de Test Production - Netacuv SaaS

Ce document contient l'ensemble des procédures de test requises pour valider le bon fonctionnement, la sécurité et la conformité du SaaS de recrutement **Netacuv** avant et pendant son déploiement en production.

---

## 1. 🛡️ Authentification, Sécurité & Red Limits

### 1.1 Limitation des Tentatives de Connexion (Rate Limiting / Anti-Brute Force)
- [ ] **Test 1.1.1 : Blocage par IP sur échecs répétés**
  - **Procédure :** Saisir un e-mail existant et tenter de se connecter avec un mauvais mot de passe 6 fois d'affilée en moins de 5 minutes.
  - **Résultat attendu :** À la 6ᵉ tentative, le système refuse la requête et affiche une erreur claire (`HTTP 429 - Trop de tentatives. Veuillez patienter 5 minutes`).
- [ ] **Test 1.1.2 : Réinitialisation après le délai d'attente**
  - **Procédure :** Attendre la fin de la fenêtre de blocage (5 minutes) puis effectuer une tentative avec le bon mot de passe.
  - **Résultat attendu :** La connexion réussit sans blocage persistant.
- [ ] **Test 1.1.3 : Isolation des comptes**
  - **Procédure :** Tenter une connexion échouée répétée sur un Compte A, puis essayer immédiatement de se connecter avec des identifiants valides d'un Compte B depuis un autre appareil/IP.
  - **Résultat attendu :** Le Compte B parvient à se connecter normalement (pas de blocage global du service).

### 1.2 Inscription & Gestion des Sessions
- [ ] **Test 1.2.1 : Inscription d'un nouvel utilisateur**
  - **Procédure :** Créer un compte avec un e-mail valide et un mot de passe robuste.
  - **Résultat attendu :** Un e-mail de confirmation est envoyé et le compte est créé dans la base de données.
- [ ] **Test 1.2.2 : Validation des critères de mot de passe**
  - **Procédure :** Tenter de créer un compte avec un mot de passe trop court (< 8 caractères) ou sans caractère spécial.
  - **Résultat attendu :** Le formulaire bloque la soumission et affiche les critères manquants.
- [ ] **Test 1.2.3 : Persistance de la session JWT / Cookie**
  - **Procédure :** Se connecter, fermer l'onglet puis rouvrir l'application.
  - **Résultat attendu :** L'utilisateur reste connecté sans repasser par la page de login.
- [ ] **Test 1.2.4 : Déconnexion sécurisée**
  - **Procédure :** Cliquer sur "Déconnexion" puis tenter d'accéder à une page protégée via le bouton "Précédent" du navigateur.
  - **Résultat attendu :** La session est détruite et l'utilisateur est redirigé vers `/login`.

---

## 2. 🔐 Contrôle d'Accès Basé sur les Rôles (RBAC - 5 Rôles)

### 2.1 Rôle 1 : Super Admin
- [ ] **Test 2.1.1 : Accès complet au back-office**
  - **Procédure :** Se connecter en Super Admin et naviguer sur l'ensemble des modules (Gestion des entreprises, Facturation, Logs, Paramètres globaux).
  - **Résultat attendu :** Accès en lecture/écriture autorisé sur 100% des ressources.
- [ ] **Test 2.1.2 : Attribution des rôles**
  - **Procédure :** Modifier le rôle d'un membre de l'équipe d'une entreprise.
  - **Résultat attendu :** Les modifications sont immédiatement répercutées en base de données et appliquées à la prochaine requête de l'utilisateur.

### 2.2 Rôle 2 : Admin Entreprise (Recruiter Admin)
- [ ] **Test 2.2.1 : Accès à la gestion de l'organisation**
  - **Procédure :** Inviter un collègue, modifier les informations de l'entreprise et consulter les factures.
  - **Résultat attendu :** Opérations réussies.
- [ ] **Test 2.2.2 : Restriction d'accès système**
  - **Procédure :** Tenter d'accéder directement à l'URL `/admin/system` réservée au Super Admin.
  - **Résultat attendu :** Redirection vers la page 403 (Accès Refusé) ou vers le tableau de bord entreprise.

### 2.3 Rôle 3 : Recruteur (Recruiter Member)
- [ ] **Test 2.3.1 : Création et gestion d'offres d'emploi**
  - **Procédure :** Publier une offre d'emploi, évaluer des candidatures, déplacer un candidat dans le pipeline.
  - **Résultat attendu :** Toutes les actions de recrutement fonctionnent correctement.
- [ ] **Test 2.3.2 : Restriction de paramètres de facturation**
  - **Procédure :** Tenter d'accéder à l'onglet `/settings/billing`.
  - **Résultat attendu :** Accès bloqué ou onglet masqué.

### 2.4 Rôle 4 : Évaluateur / Reviewer (Guest / Interviewer)
- [ ] **Test 2.4.1 : Évaluation limitée des candidats**
  - **Procédure :** Se connecter en Évaluateur et laisser une note/commentaire sur un candidat assigné.
  - **Résultat attendu :** Le commentaire est enregistré.
- [ ] **Test 2.4.2 : Interdiction de suppression**
  - **Procédure :** Tenter de supprimer une offre ou de rejeter définitivement un candidat.
  - **Résultat attendu :** Les boutons d'action critique sont désactivés ou absents.

### 2.5 Rôle 5 : Candidat (Candidate)
- [ ] **Test 2.5.1 : Postulation et suivi de candidature**
  - **Procédure :** Consulter une offre publique, déposer un CV et suivre l'état de la candidature.
  - **Résultat attendu :** Le dossier est transmis et visible côté recruteur.
- [ ] **Test 2.5.2 : Isolation des données candidats**
  - **Procédure :** Tenter d'accéder à l'URL de candidature d'un autre candidat via son ID (`/candidate/dashboard?id=XYZ`).
  - **Résultat attendu :** Accès strictement refusé (seules ses propres données sont retournées par l'API).

---

## 3. 🗄️ Intégrité de la Base de Données Prisma & Supabase

- [ ] **Test 3.1 : Exécution des migrations Prisma**
  - **Procédure :** Exécuter `npx prisma migrate deploy` sur l'environnement de production.
  - **Résultat attendu :** Aucune erreur de schéma ou de clé étrangère n'est levée.
- [ ] **Test 3.2 : Validation du Seeding**
  - **Procédure :** Exécuter le script de seed `prisma/seed.ts` sur une base de test ou de staging.
  - **Résultat attendu :** Les 5 rôles administratifs par défaut et les paramètres initiaux sont correctement insérés.
- [ ] **Test 3.3 : Row Level Security (RLS) Supabase**
  - **Procédure :** Tenter d'exécuter une requête SQL directe côté client via Supabase sans passer par l'API Authentifiée.
  - **Résultat attendu :** Supabase bloque la requête si le token JWT ne correspond pas au propriétaire de la donnée.

---

## 4. 🌐 Performance & Intégration Vercel (Next.js App Router)

- [ ] **Test 4.1 : En-têtes HTTP de sécurité (Headers)**
  - **Procédure :** Analyser le site via Chrome DevTools ou un scanner de sécurité HTTP.
  - **Résultat attendu :** Présence des en-têtes `X-Frame-Options`, `X-Content-Type-Options` et `Strict-Transport-Security`.
- [ ] **Test 4.2 : Transmission de l'IP Réelle (`x-forwarded-for`)**
  - **Procédure :** Vérifier dans les logs Vercel/Next.js qu'une requête entrante contient la véritable IP client et non celle du reverse proxy.
  - **Résultat attendu :** L'IP récupérée par `headers().get('x-forwarded-for')` est correcte.
- [ ] **Test 4.3 : Chargement des pages protégées (Server Components)**
  - **Procédure :** Naviguer rapidement entre les pages du Dashboard.
  - **Résultat attendu :** Les re-routages basés sur le middleware / Server Actions s'effectuent sans scintillement (flash) ni boucle de redirection.

---

## 5. ⚖️ Conformité & Red Limits Métier (RGPD & Anti-discrimination)

- [ ] **Test 5.1 : Suppression des données personnelles (Droit à l'oubli)**
  - **Procédure :** Déclencher la suppression d'un compte candidat depuis l'interface ou sur demande.
  - **Résultat attendu :** Les CV, coordonnées et logs associés sont purgés ou anonymisés conformément aux règles RGPD.
- [ ] **Test 5.2 : Masquage des critères discriminatoires**
  - **Procédure :** Activer l'option "Recrutement à l'aveugle" si elle est configurée.
  - **Résultat attendu :** La photo, le genre et l'âge du candidat sont masqués pour l'évaluateur.