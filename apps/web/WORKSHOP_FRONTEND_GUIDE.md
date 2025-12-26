# 🎨 Generative Designer v2.0 - Guide Complet Frontend

## 📊 Vue d'Ensemble

Interface professionnelle complète pour le système de Design Thinking collaboratif avec agents IA. 
Supporté par **MakerKit**, utilisant **Next.js 15.5**, **React 18**, **TypeScript**, et **Tailwind CSS**.

---

## 🗂️ Structure du Projet

### Répertoire Frontend

```
apps/web/
├── app/
│   └── home/
│       └── designer/
│           ├── _components/                    # Composants Workshop
│           │   ├── workshop-theme.ts           # Design system
│           │   ├── phase-progress.tsx          # Progress bar
│           │   ├── agent-card.tsx              # Carte agent
│           │   ├── workshop-sidebar.tsx        # Sidebar avec agents
│           │   ├── workshop-header.tsx         # Header workshop
│           │   ├── multi-agent-chat.tsx        # Chat conversationnel
│           │   ├── phase-1-empathy.tsx         # Phase 1
│           │   ├── phase-2-ideation.tsx        # Phase 2
│           │   ├── phase-3-convergence.tsx     # Phase 3
│           │   └── index.ts                    # Export centralisé
│           │
│           ├── workshops/
│           │   ├── page.tsx                    # Liste workshops
│           │   ├── new/page.tsx                # Créer workshop
│           │   └── [id]/page.tsx               # Détail + phases
│           │
│           ├── WORKSHOP_INTEGRATION.md         # Guide intégration
│           └── page.tsx                        # Designer homepage
│
├── lib/
│   ├── api/
│   │   └── generative-designer.ts             # API Client complet
│   └── hooks/
│       └── use-workshop.ts                    # Custom hooks
│
├── types/
│   └── workshop.ts                            # TypeScript types
│
├── styles/
│   ├── globals.css                           # Global styles
│   ├── theme.css                             # Shadcn theme
│   ├── theme.utilities.css                   # Utilities
│   └── shadcn-ui.css                         # ShadcnUI config
│
└── components/
    └── (composants partagés MakerKit)
```

---

## 🎯 Fonctionnalités Principales

### ✅ Implémentées

#### 1. **Workshop Management**
- [x] Créer un nouveau workshop (formulaire 3 étapes)
- [x] Liste des workshops de l'utilisateur
- [x] Affichage détail workshop
- [x] Navigation entre phases
- [x] Export/Archive/Delete (UI seulement)

#### 2. **Agent Visualization**
- [x] 6 personnalités d'agents avec avatars uniques
- [x] Couleurs distinctes pour chaque agent
- [x] Sidebar avec liste agents
- [x] Stats (contributions, tokens utilisés)
- [x] Selection d'agents lors de la configuration

#### 3. **Phase Interfaces**

**Phase 1 - Empathie** ✅
- Empathy Map (4 quadrants: Says, Thinks, Does, Feels)
- Customer Journey mapping
- How Might We (HMW) questions
- Customer segment description
- Onglets pour navigation entre sections

**Phase 2 - Idéation** ✅
- Sélecteur de techniques (SCAMPER, Random Word, Worst Idea)
- Flux d'idées en temps réel
- Affichage avec info agent
- Sélection multiple avec checkbox
- Ajout d'idées manuelles
- Loading states

**Phase 3 - Convergence** ✅
- Dot Voting (vote illimité avec barre de progression)
- Impact/Effort Matrix (4 quadrants)
- Sliders pour positionnement
- Sélection top idées
- Vue résumé des votes

#### 4. **UI/UX**
- [x] Design system complet (couleurs, spacing, typography)
- [x] Dark mode support avec next-themes
- [x] Responsive design (desktop-first)
- [x] Loading states avec spinners
- [x] Error boundaries et messages
- [x] Navigation intuitive

#### 5. **API Integration**
- [x] Client TypeScript complet (`generativeDesignerApi`)
- [x] Custom hooks pour state management
- [x] Error handling standardisé
- [x] Types complètement typés

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp apps/web/.env.example apps/web/.env.local

# Démarrer le dev server
pnpm dev
```

### Variables d'Environnement

Ajouter à `apps/web/.env.local`:

```env
# Backend API
NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL=http://localhost:8000/api/generative-designer

# Supabase (existant)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Navigation Routes

```
/home/designer                    # Page accueil designer
/home/designer/workshops          # Liste workshops
/home/designer/workshops/new      # Créer workshop
/home/designer/workshops/{id}     # Détail + phases
```

---

## 💡 Utilisation des Composants

### Importer et Utiliser les Composants

```tsx
import {
  PhaseProgress,
  AgentCard,
  WorkshopSidebar,
  Phase1Empathy,
  workshopTheme,
  agentPersonalities,
} from '~/app/home/designer/_components';

// Utiliser dans une page
export default function MyPage() {
  return (
    <div>
      <PhaseProgress currentPhase={2} totalPhases={6} />
      <AgentCard personality="creative" contributions={5} />
    </div>
  );
}
```

### Utiliser les API Client

```tsx
import { generativeDesignerApi } from '~/lib/api/generative-designer';

// Créer workshop
const workshop = await generativeDesignerApi.workshop.create({
  title: 'Mon Workshop',
  initial_problem: 'Résoudre X',
  config: { ... },
});

// Récupérer ideas
const ideas = await generativeDesignerApi.idea.list(workshopId);

// Voter
await generativeDesignerApi.vote.cast(
  workshopId,
  ideaId,
  'dot_voting',
  1
);
```

### Utiliser les Hooks Personnalisés

```tsx
import { useWorkshop, useIdeas, useMessages } from '~/lib/hooks/use-workshop';

export default function WorkshopPage() {
  const workshop = useWorkshop({ workshopId: 'abc123' });
  const ideas = useIdeas('abc123');
  const messages = useMessages('abc123');

  if (workshop.isLoading) return <Spinner />;

  return (
    <div>
      <h1>{workshop.workshop?.title}</h1>
      {ideas.ideas.map((idea) => (
        <div key={idea.id}>{idea.title}</div>
      ))}
      <button onClick={() => workshop.nextPhase()}>
        Next Phase
      </button>
    </div>
  );
}
```

---

## 🎨 Design System

### Couleurs Agents

```ts
const agentColors = {
  creative: '#ec4899',      // Pink
  pragmatic: '#3b82f6',     // Blue
  technical: '#10b981',     // Emerald
  empathetic: '#f59e0b',    // Amber
  critic: '#ef4444',        // Red
  facilitator: '#8b5cf6',   // Violet
};
```

### Palette Principale

- **Primaire**: Bleu (#3b82f6)
- **Secondaire**: Gris (#6b7280)
- **Success**: Émeraude (#10b981)
- **Warning**: Ambre (#f59e0b)
- **Error**: Rouge (#ef4444)

### Spacing Scale

```ts
xs: '0.25rem'   // 4px
sm: '0.5rem'    // 8px
md: '1rem'      // 16px
lg: '1.5rem'    // 24px
xl: '2rem'      // 32px
```

---

## 📦 Dépendances Principales

```json
{
  "next": "15.5.7",
  "react": "18.2.0",
  "typescript": "5.3.0",
  "@kit/ui": "workspace:*",
  "@radix-ui/*": "^1.3.x",
  "lucide-react": "^0.545.0",
  "@tanstack/react-query": "5.90.2",
  "next-themes": "^0.2.x"
}
```

---

## 🔌 Intégration Backend

### Endpoints Requis

Le backend doit fournir (voir `WORKSHOP_INTEGRATION.md` pour détails):

```
POST   /workshops
GET    /workshops
GET    /workshops/{id}
PATCH  /workshops/{id}
DELETE /workshops/{id}

GET    /workshops/{id}/agents
POST   /workshops/{id}/agents
DELETE /workshops/{id}/agents/{id}

POST   /workshops/{id}/phases/{phase}/start
GET    /workshops/{id}/phases/{phase}/status
POST   /workshops/{id}/phases/{phase}/complete
GET/PUT /workshops/{id}/phases/{phase}/data

GET    /workshops/{id}/messages
POST   /workshops/{id}/messages
GET    /workshops/{id}/stream (SSE)

GET    /workshops/{id}/ideas
POST   /workshops/{id}/ideas
POST   /workshops/{id}/ideas/generate
GET    /workshops/{id}/ideas/top

POST   /workshops/{id}/votes
GET    /workshops/{id}/votes/summary
```

---

## 📝 Checklist Implémentation

### Phase 1: Foundation ✅
- [x] Design system & theme
- [x] Components de base
- [x] Pages principales
- [x] API Client
- [x] Custom hooks
- [x] Types TypeScript

### Phase 2: Integration 🔄
- [ ] Connecter workshops list avec API
- [ ] Connecter formulaire création avec API
- [ ] Connecter detail page avec API
- [ ] Implement phase transitions
- [ ] Real-time message streaming

### Phase 3: Phases 4-5
- [ ] Phase 4 UI (TRIZ)
- [ ] Phase 5 UI (Sélection)
- [ ] Phase 6 UI (Prototype) - lier existant
- [ ] Export PDF

### Phase 4: Polish
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Optimistic updates
- [ ] Offline support
- [ ] Mobile responsiveness
- [ ] Accessibility (a11y)
- [ ] Performance (lazy loading)

### Phase 5: Advanced
- [ ] Real-time collaboration
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

---

## 🧪 Testing

### Test des Components

```tsx
import { render, screen } from '@testing-library/react';
import { PhaseProgress } from '~/app/home/designer/_components';

describe('PhaseProgress', () => {
  it('renders all phases', () => {
    render(<PhaseProgress currentPhase={2} />);
    expect(screen.getByText('Empathie')).toBeInTheDocument();
    expect(screen.getByText('Idéation')).toBeInTheDocument();
  });
});
```

### Test des API Calls

```tsx
import { generativeDesignerApi } from '~/lib/api/generative-designer';

jest.mock('~/lib/api/generative-designer');

describe('Workshop API', () => {
  it('creates workshop', async () => {
    const data = { title: 'Test', initial_problem: 'Problem' };
    await generativeDesignerApi.workshop.create(data);
    // Assert...
  });
});
```

---

## 🔐 Sécurité

- ✅ JWT authentification via MakerKit
- ✅ Row-level security (RLS) sur Supabase
- ✅ Validation des inputs côté client + serveur
- ✅ CORS configuré
- ✅ Rate limiting (à implémenter)

---

## 📊 Performance

### Optimisations Appliquées

- ✅ Code splitting automatique (Next.js)
- ✅ Image optimization
- ✅ CSS-in-JS minimisé (Tailwind)
- ✅ API calls optimisés (cache, deduping)
- ✅ React Query pour data fetching

### À Faire

- [ ] Virtual scrolling pour longues listes
- [ ] Pagination des ideas
- [ ] Service worker pour offline
- [ ] Asset compression

---

## 📚 Documentation

### Files de Référence

- `WORKSHOP_INTEGRATION.md` - Guide d'intégration backend
- `workshop-theme.ts` - Design system complet
- `workshop.ts` (types) - Toutes les interfaces TypeScript
- `generative-designer.ts` (API) - Client avec exemples

### Code Comments

Tous les fichiers incluent des JSDoc comments:

```tsx
/**
 * Phase 1 - Empathie & Cadrage
 * 
 * @component
 * @param {Phase1Props} props
 * @returns {JSX.Element}
 */
export const Phase1Empathy: React.FC<Phase1Props> = ({ ... }) => {
```

---

## 🤝 Contributing

### Conventions de Code

- **Nommage**: camelCase pour variables, PascalCase pour composants
- **Imports**: Utiliser `~` alias pour imports depuis root
- **Styles**: Tailwind classes, pas de CSS inline
- **Comments**: JSDoc pour fonctions/composants
- **Types**: Typer tous les props et retours

### Exemple Bon Code

```tsx
/**
 * Affiche une carte d'idée avec options de sélection
 */
interface IdeaCardProps {
  idea: Idea;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Content */}
    </Card>
  );
};
```

---

## 🐛 Debugging

### Browser DevTools

1. **React DevTools** - Inspecter composants & props
2. **Network tab** - Vérifier appels API
3. **Console** - Logs et erreurs
4. **Storage** - Vérifier localStorage/cookies

### Logs Útiles

```tsx
console.log('Workshop:', workshop.workshop);
console.log('Ideas:', ideas.ideas);
console.log('Agents:', workshop.agents);
```

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "401 Unauthorized" | JWT invalide | Vérifier auth/cookies |
| "404 Not Found" | Endpoint inexistant | Vérifier API URL |
| "CORS error" | Headers missing | Vérifier backend CORS |
| "State undefined" | Fetch pas complétée | Vérifier isLoading |

---

## 📞 Support & Questions

### Documentation Externe

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [MakerKit Docs](https://makerkit.dev)

### Fichiers Clés à Consulter

1. `generative-designer/modules/api/main.py` - Endpoints backend
2. `generative-designer/modules/models/workshop.py` - Schema DB
3. `generative-designer/modules/core/` - Services métier

---

## 📈 Roadmap

### v2.1 (Court terme)
- [ ] Real-time collaboration
- [ ] Voice interaction
- [ ] Mobile app (React Native)

### v2.2 (Moyen terme)
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Integration marketplace

### v3.0 (Long terme)
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Enterprise features

---

## 📄 License

Proprietary - Generative Designer Project

---

**Dernière mise à jour**: Décembre 2025
**Status**: Interface v1.0 ✅ Prête pour intégration backend
**Contact**: [À définir]
