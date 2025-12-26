# 🎨 Workshop UI - Guide d'Intégration

Interface professionnelle complète pour le système de Design Thinking collaboratif avec agents IA.

## 📁 Structure des Fichiers

```
app/home/designer/
├── _components/                          # Composants réutilisables
│   ├── workshop-theme.ts                 # Design system (couleurs, agents)
│   ├── phase-progress.tsx                # Barre de progression des phases
│   ├── agent-card.tsx                    # Affichage d'un agent IA
│   ├── workshop-sidebar.tsx              # Sidebar avec liste agents
│   ├── workshop-header.tsx               # Header avec infos workshop
│   ├── multi-agent-chat.tsx              # Chat conversationnel multi-agents
│   ├── phase-1-empathy.tsx               # Interface Phase 1
│   ├── phase-2-ideation.tsx              # Interface Phase 2
│   ├── phase-3-convergence.tsx           # Interface Phase 3
│   └── index.ts                          # Export centralisé
│
├── workshops/
│   ├── page.tsx                          # Liste des workshops
│   ├── new/
│   │   └── page.tsx                      # Créer un nouveau workshop
│   └── [id]/
│       └── page.tsx                      # Détail + phases du workshop
│
├── _components/                          # (Existant) Composants page accueil
└── page.tsx                              # (Existant) Page designer

lib/
└── api/
    └── generative-designer.ts            # API Client TypeScript complet
```

## 🎯 Intégration Backend

### Variables d'Environnement

Ajouter à `.env.local`:

```env
# Backend API
NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL=http://localhost:8000/api/generative-designer
```

### Endpoints API Requis

Le backend doit fournir ces endpoints:

```
# Workshops CRUD
POST   /workshops                         # Créer
GET    /workshops                         # Liste utilisateur
GET    /workshops/{id}                    # Détail
PATCH  /workshops/{id}                    # Modifier
DELETE /workshops/{id}                    # Supprimer

# Agents
GET    /workshops/{id}/agents             # Liste agents
POST   /workshops/{id}/agents             # Ajouter agent
DELETE /workshops/{id}/agents/{agent_id}  # Supprimer agent

# Phases
POST   /workshops/{id}/phases/{phase}/start      # Démarrer
GET    /workshops/{id}/phases/{phase}/status     # Status
POST   /workshops/{id}/phases/{phase}/complete   # Compléter
GET    /workshops/{id}/phases/{phase}/data       # Récupérer données
PUT    /workshops/{id}/phases/{phase}/data       # Sauver données

# Messages/Chat
GET    /workshops/{id}/messages           # Liste messages
POST   /workshops/{id}/messages           # Envoyer message
GET    /workshops/{id}/stream             # SSE stream

# Idées
GET    /workshops/{id}/ideas              # Liste idées
POST   /workshops/{id}/ideas              # Ajouter
POST   /workshops/{id}/ideas/generate     # Générer (agents)
PATCH  /workshops/{id}/ideas/{idea_id}    # Modifier
DELETE /workshops/{id}/ideas/{idea_id}    # Supprimer
GET    /workshops/{id}/ideas/top          # Top idées

# Votes
POST   /workshops/{id}/votes              # Voter
GET    /workshops/{id}/votes/summary      # Résumé votes
```

## 🔧 Implémentation des Pages

### 1. Page Liste (workshops/page.tsx)

Affiche tous les workshops avec:
- ✅ Grid responsive
- ✅ Recherche (À ajouter)
- ✅ Tri par date/status (À ajouter)
- ✅ Actions rapides (Continuer, Supprimer)

**TODO - Ajouter:**
```tsx
// Dans useEffect - Fetch data
const response = await generativeDesignerApi.workshop.list();
setWorkshops(response.data);
```

### 2. Page Configuration (workshops/new/page.tsx)

Création pas à pas:
- ✅ Step 1: Titre + problème
- ✅ Step 2: Sélection agents (2-6)
- ✅ Step 3: Configuration avancée

**TODO - Ajouter:**
```tsx
// handleSubmit
const workshop = await generativeDesignerApi.workshop.create({
  title,
  initial_problem: problem,
  config: {
    nb_agents: selectedAgents.size,
    target_ideas_count: targetIdeas,
    enabled_techniques: enabledTechniques,
    agent_personalities: Array.from(selectedAgents),
  },
});
router.push(`/home/designer/workshops/${workshop.id}`);
```

### 3. Page Détail (workshops/[id]/page.tsx)

Interface principale avec:
- ✅ Header avec progress
- ✅ Sidebar agents
- ✅ Phases 1-5 (Phase 6 existante)
- ✅ Navigation phases

**TODO - Ajouter:**
```tsx
// Dans useEffect
const workshop = await generativeDesignerApi.workshop.get(workshopId);
const agents = await generativeDesignerApi.agent.list(workshopId);
const ideas = await generativeDesignerApi.idea.list(workshopId);
```

### 4. Phases (phase-X-Y.tsx)

Chaque phase a son UI:

**Phase 1 - Empathie** ✅
- Empathy Map (4 quadrants)
- Customer Journey
- HMW Questions
- Customer Segment

**Phase 2 - Idéation** ✅
- Technique selector (SCAMPER, Random, Worst)
- Idea stream avec agent info
- Sélection multiple
- Ajout manuel

**Phase 3 - Convergence** ✅
- Dot voting
- Impact/Effort Matrix
- Sélection top idées

**Phase 4 - TRIZ** (À compléter)
- Intégrer l'existant `TRIZService`
- Chat avec suggestion TRIZ

**Phase 5 - Sélection** (À compléter)
- Assumption mapping
- Génération cahier de charge (existant)

## 🎨 Design System

### Couleurs Agents (Predefined)

| Agent | Couleur | Hex |
|-------|---------|-----|
| Léa (Creative) | Rose | #ec4899 |
| Marco (Pragmatic) | Bleu | #3b82f6 |
| Thomas (Technical) | Vert | #10b981 |
| Sofia (Empathetic) | Ambre | #f59e0b |
| Nina (Critic) | Rouge | #ef4444 |
| Alex (Facilitator) | Violet | #8b5cf6 |

### Palette Générale

- **Primaire**: Bleu (#3b82f6, #2563eb)
- **Secondaire**: Gris (#6b7280, #9ca3af)
- **Success**: Vert (#10b981)
- **Warning**: Ambre (#f59e0b)
- **Error**: Rouge (#ef4444)

### Dark Mode

✅ Supporté avec MakerKit `next-themes`
- Couleurs adaptées pour fond sombre
- Contraste optimal en mode clair/sombre

## 📡 API Client

Le fichier `lib/api/generative-designer.ts` fournit un client TypeScript complet:

```tsx
import { generativeDesignerApi } from '~/lib/api/generative-designer';

// Workshops
const workshop = await generativeDesignerApi.workshop.get(id);
const list = await generativeDesignerApi.workshop.list();
await generativeDesignerApi.workshop.create(data);

// Agents
const agents = await generativeDesignerApi.agent.list(workshopId);
await generativeDesignerApi.agent.add(workshopId, personality);

// Idées
const ideas = await generativeDesignerApi.idea.list(workshopId);
await generativeDesignerApi.idea.generate(workshopId, technique, phase);

// Votes
await generativeDesignerApi.vote.cast(workshopId, ideaId, voteType, value);
const summary = await generativeDesignerApi.vote.getSummary(workshopId);
```

## 🚀 Next Steps

### Immédiat (High Priority)

1. **Implémenter les appels API** dans chaque page/composant
2. **Tester la connexion** avec le backend
3. **Gestion des erreurs** et loading states
4. **Validation des formulaires**

### Court terme

1. **Phase 4 & 5** - Complémenter interface TRIZ & Sélection
2. **Real-time streaming** - SSE ou WebSocket pour messages agents
3. **Export PDF** - Cahier de charge + rapport complet
4. **Search & Filter** - Dans liste workshops

### Moyen terme

1. **Collaboration temps réel** - Multi-users sur même workshop
2. **Mobile responsive** - Adapter pour tablettes/phones
3. **Analytics** - Dashboard avec stats
4. **Customization** - Thème per-workspace

## 📋 Checklist Implémentation

- [ ] Ajouter les appels API dans les composants
- [ ] Tester chaque page individuellement
- [ ] Implémenter error boundaries
- [ ] Ajouter loading skeletons
- [ ] Implémenter real-time updates (SSE)
- [ ] Tests E2E des flows complets
- [ ] Documentation utilisateur
- [ ] Optimisation performance (lazy loading)
- [ ] Accessibilité (a11y)
- [ ] SEO meta tags

## 🎓 Resources

- **Design**: Tailwind CSS + shadcn/ui
- **Framework**: Next.js 15.5 + React 18
- **State**: React hooks + TanStack Query
- **API**: TypeScript fetch client
- **Theme**: next-themes pour dark mode

## 📞 Support

Pour les questions d'intégration:
1. Vérifier structure API dans `generative-designer/modules/api/`
2. Consulter les types dans `models/workshop.py`
3. Tester manuellement les endpoints avec Postman/curl

---

**Status**: Interface v1.0 complète, en attente intégration backend ✅
