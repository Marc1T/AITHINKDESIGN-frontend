# 🎨 AIThinkDesign - Application Web

Application frontend de la plateforme **AIThinkDesign** - Design Thinking et Prototypage IA.

## 🚀 Fonctionnalités

### Designer Module (`/home/designer`)
- **🎯 Workshops Design Thinking** - Phases Empathie → Idéation → Sélection → Convergence
- **🔄 Analyse TRIZ** - Contradictions techniques et principes inventifs
- **🤖 Agents IA** - Brainstorming avec personas multi-personnalités

### Prototypage (`/home/designer/prototype`)
- **✨ Studio Autonome** - Génération sans workshop
- **🎨 Génération 2D** - Visuels réalistes ou techniques (FLUX Schnell)
- **✏️ Édition IA** - Modification par instructions (Qwen)
- **📋 Nomenclature BOM** - Liste des composants (Gemini)
- **💬 Assistant IA** - Chat contextuel sur les prototypes

## 📁 Structure

```
apps/web/
├── app/
│   ├── (marketing)/           # Pages publiques
│   ├── auth/                  # Authentification
│   └── home/
│       └── designer/          # Module Designer
│           ├── page.tsx       # Hub principal
│           ├── workshops/     # Gestion workshops
│           ├── prototype/     # Hub prototypage
│           │   ├── page.tsx   # Choix Studio/Workshop
│           │   └── studio/    # Studio autonome
│           └── prototyping/   # Prototypage lié workshop
│               └── [workshopId]/
│                   ├── page.tsx      # Configuration
│                   ├── results/      # Résultats
│                   └── assistant/    # Chat IA
├── lib/
│   └── replicate/             # Client Replicate + Gemini
├── api/
│   └── prototyping/           # APIs prototypage
│       ├── generate/          # Génération images
│       ├── edit/              # Édition Qwen
│       ├── bom/               # Nomenclature
│       └── assistant/         # Chat Gemini
└── public/
    └── images/
        └── favicon/
            └── logoAITHINKDESIGN.svg
```

## 🛠️ Technologies

- **Next.js 15** - React framework avec App Router
- **Tailwind CSS v4** - Styling utilitaire
- **Shadcn/ui** - Composants UI
- **Replicate API** - FLUX Schnell, Qwen, Gemini
- **Supabase** - Auth & Database

## 🚀 Démarrage

```bash
# Depuis la racine du projet
pnpm install
pnpm run dev
```

Application disponible sur http://localhost:3000

## 📍 Routes Principales

| Route | Description |
|-------|-------------|
| `/home/designer` | Hub Designer avec logo AIThinkDesign |
| `/home/designer/workshops` | Liste des workshops |
| `/home/designer/prototype` | Hub prototypage |
| `/home/designer/prototype/studio` | Studio autonome (sans workshop) |
| `/home/designer/prototyping/[id]` | Prototypage lié à un workshop |
| `/home/designer/prototyping/[id]/results` | Résultats avec édition/BOM |
| `/home/designer/prototyping/[id]/assistant` | Chat IA sur prototypes |

## 🔗 APIs Backend

Le frontend communique avec :
- **FastAPI Backend** (`localhost:8000`) - Workshops & LLM
- **Replicate API** - Génération d'images (FLUX, Qwen, Gemini)

---

**AIThinkDesign - PFE 2025**
