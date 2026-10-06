# Netacuv - Projet et Spécifications

Ce document fournit un résumé complet de l'application **Netacuv** (également connue sous le nom de Check CV / Netacuv-Antigravity) pour aider les futurs modèles d'IA à comprendre le contexte, l'architecture et les spécifications du projet.

## 1. Description du Projet

Netacuv est une plateforme de recrutement innovante qui met en relation des **Talents** et des **Recruteurs**. Sa particularité réside dans l'intégration de l'Intelligence Artificielle pour mener des entretiens vidéo asynchrones, évaluer les candidats, et proposer un vivier de talents qualifiés et "certifiés IA" aux recruteurs.

### Fonctionnalités Principales :
*   **Espace Talent** : Création de profil professionnel, gestion des compétences, ajout de CV, candidature aux offres d'emploi, et passage d'entretiens vidéo assistés par l'IA.
*   **Espace Recruteur** : Création d'offres d'emploi, recherche dans le "Vivier de Talents Certifiés" avec des filtres avancés, visualisation des profils (notes IA, vidéos validées), et gestion des candidatures.
*   **Entretiens IA (AI Interviews)** : Génération de questions par l'IA pour une offre spécifique, enregistrement vidéo du candidat, puis évaluation automatique par l'IA (attribution d'un score `aiScore` et d'un retour `aiFeedback`).
*   **Espace Admin** : Tableau de bord de gestion globale de la plateforme, des rôles et des permissions.
*   **Monétisation** : Système de transactions (comptes premium, paiements).

---

## 2. Technologies Utilisées

La stack technique est résolument moderne (React 19 / Next 16) :

*   **Framework Frontend/Fullstack** : Next.js 16.3.5 (App Router).
*   **Interface Utilisateur** : React 19.2.8.
*   **Stylisation** : Tailwind CSS v4 (via `@tailwindcss/postcss`).
*   **Base de Données et ORM** : PostgreSQL avec Prisma (`@prisma/client` v5).
*   **Authentification** : Next-Auth v4 avec `@auth/prisma-adapter`.
*   **Stockage/Backend Complémentaire** : Supabase (`@supabase/supabase-js`).
*   **Intelligence Artificielle** : Google GenAI SDK (`@google/genai`).
*   **Animations et Graphiques** : Framer Motion, Recharts.
*   **Outils Formulaires / Validation** : Zod, React Hot Toast.

---

## 3. Structure du Projet

L'application suit la structure standard de Next.js App Router :

*   `/app` : Contient toutes les routes de l'application.
    *   `/app/admin`, `/app/dashboard`, `/app/recruteurs`, `/app/talents` : Les tableaux de bord et espaces dédiés aux différents rôles.
    *   `/app/api` : Routes backend (API Routes de Next.js).
    *   `/app/auth`, `/app/connexion`, `/app/inscription` : Flux d'authentification.
    *   `/app/interview` : Module de passage d'entretien vidéo avec l'IA.
    *   `/app/components` : Composants React spécifiques ou partagés liés aux routes.
*   `/components` : Composants UI réutilisables (Layouts, Boutons, Cartes).
*   `/lib` : Fonctions utilitaires, configuration Prisma, configuration IA.
*   `/prisma` : Contient le `schema.prisma` définissant tous les modèles de données.
*   `/public` : Fichiers statiques et assets graphiques.

---

## 4. Architecture de la Base de Données (Prisma)

Le `schema.prisma` articule la plateforme autour des entités suivantes :

*   **Gestion des Utilisateurs** : Modèles `User`, `Account`, `Session`, `Role`, `Permission`.
*   **Profils** : `TalentProfile` (bio, compétences, lien vidéo, etc.) et `RecruiterProfile` (entreprise, secteur, etc.).
*   **Recrutement** :
    *   `JobOffer` : Offres d'emploi postées par les recruteurs.
    *   `Application` : Liens de candidature entre un Talent et une JobOffer.
*   **Évaluation IA** :
    *   `AIInterview` : Modèle de questions d'entretien généré pour une offre.
    *   `InterviewSession` : Passage réel de l'entretien par un talent (inclut les liens vidéos, le `aiScore` et le `aiFeedback`).
*   **Divers** : `Transaction` (paiements), `AuditLog` (traçabilité), `SystemSetting`.

---

## 5. Charte Graphique et Design Decisions

Le design vise un rendu "Premium", moderne et fluide (cf. `/app/globals.css`).

### Couleurs Principales :
*   **Primaire (Bleu Netacuv)** : `#1e8ae9` (hover `#0071a2`, primary light `#bfdfff`). Le design inclut une surcharge explicite demandée : `#32A8D7` et `#4bbced`.
*   **Gradients** : Utilisation de dégradés légers et épurés (ex: `linear-gradient(135deg, #c8e0f4 0%, #e8f4fd 40%...)`).
*   **Succès/Alerte** : Vert (`#22c55e`), Orange/Warning (`#f59e0b`), Rouge/Danger (`#ef4444`).

### Esthétique et Composants :
*   **Glassmorphism** : Forte utilisation d'effets de verre (`.glass-bg`, `.glass-card`) avec `backdrop-filter: blur(12px)` et des bordures semi-transparentes.
*   **Typographie** : `Open Sans` comme police principale, avec Next.js `Geist` utilisé par endroits. Des titres nets (`.section-title` en `36px` gras).
*   **Animations (Micro-interactions)** :
    *   `fadeInUp`, `slideInLeft` pour les entrées d'éléments.
    *   `.animate-float` pour faire flotter les cartes ou illustrations.
    *   Animations spécifiques à l'interview : `.animate-rec-blink` (clignotement de l'enregistrement), `.animate-wave-bar` (ondes sonores).
*   **UI Elements** :
    *   Boutons arrondis (`border-radius: 8px`), avec des effets de soulèvement au survol (`transform: translateY(-1px)`).
    *   Badges dynamiques pour les statuts.
    *   Cartes stylisées avec des ombres légères s'intensifiant au survol.
    *   Tables propres avec bordures discrètes et espacements aérés (`.table-custom`).

---

## 6. Historique d'Implémentation & Décisions Ouvertes

*   **Refonte du Layout Recruteur** : L'espace recruteur (`/app/dashboard/recruteur`) a été refactorisé pour utiliser les layouts Next.js (`layout.tsx`) et le routage natif plutôt que des onglets basés sur des states React, assurant une meilleure navigation.
*   **Vivier de Talents** : Une page de recherche (`/app/dashboard/recruteur/recherche-profil/page.tsx`) permet d'explorer les talents directement via la DB. Les cartes affichent la note IA, et une icône certifiant la "Vidéo IA validée".
*   **Point d'Attention (Schéma de données)** : Lors de refontes UI récentes, il a été noté que certains champs (comme la note agrégée ou le titre exact du poste) peuvent nécessiter des adaptations dans le schéma Prisma (`TalentProfile`) ou être dérivés de l'historique des `InterviewSession`.

Ce fichier servira de référence pour toute nouvelle modification apportée par un modèle IA afin d'assurer la cohérence avec la vision architecturale et graphique de Netacuv.
