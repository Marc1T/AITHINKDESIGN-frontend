/**
 * Tailwind Configuration Enhancements
 * À ajouter à la config existante si nécessaire
 */

// ============================================================================
// Exemple d'extension pour tailwind.config.ts (si applicable)
// ============================================================================

/*
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Agents IA
        agent: {
          creative: 'rgb(236, 72, 153)',
          pragmatic: 'rgb(59, 130, 246)',
          technical: 'rgb(16, 185, 129)',
          empathetic: 'rgb(245, 158, 11)',
          critic: 'rgb(239, 68, 68)',
          facilitator: 'rgb(139, 92, 246)',
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out',
        'fade-down': 'fade-down 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
*/

// ============================================================================
// CSS Custom Properties (à ajouter à globals.css si absent)
// ============================================================================

/*
:root {
  --primary-500: rgb(59, 130, 246);
  --primary-600: rgb(37, 99, 235);
  --primary-700: rgb(29, 78, 216);

  --secondary-500: rgb(107, 114, 128);
  --secondary-600: rgb(75, 85, 99);
  --secondary-700: rgb(55, 65, 81);

  --agent-creative: rgb(236, 72, 153);
  --agent-pragmatic: rgb(59, 130, 246);
  --agent-technical: rgb(16, 185, 129);
  --agent-empathetic: rgb(245, 158, 11);
  --agent-critic: rgb(239, 68, 68);
  --agent-facilitator: rgb(139, 92, 246);

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
*/

// ============================================================================
// Utility Classes (à ajouter à theme.utilities.css si absent)
// ============================================================================

/*
/* Animations */
.animate-fade-in {
  @apply animate-fade-up;
}

.animate-fade-in-slow {
  animation: fade-up 1s ease-out;
}

/* Card utilities */
.card-primary {
  @apply rounded-lg border border-border bg-card shadow-md hover:shadow-lg transition-shadow;
}

.card-elevated {
  @apply card-primary shadow-lg hover:shadow-xl;
}

/* Agent color utilities */
.agent-creative {
  @apply text-agent-creative;
}

.agent-pragmatic {
  @apply text-agent-pragmatic;
}

.agent-technical {
  @apply text-agent-technical;
}

.agent-empathetic {
  @apply text-agent-empathetic;
}

.agent-critic {
  @apply text-agent-critic;
}

.agent-facilitator {
  @apply text-agent-facilitator;
}

.agent-badge-creative {
  @apply bg-agent-creative/10 text-agent-creative border border-agent-creative/30;
}

.agent-badge-pragmatic {
  @apply bg-agent-pragmatic/10 text-agent-pragmatic border border-agent-pragmatic/30;
}

/* Phase utilities */
.phase-active {
  @apply bg-blue-500 text-white shadow-lg scale-105;
}

.phase-completed {
  @apply bg-emerald-500 text-white;
}

.phase-upcoming {
  @apply bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300;
}

/* Grid utilities */
.grid-layout {
  @apply grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

/* Flex utilities */
.flex-center {
  @apply flex items-center justify-center;
}

.flex-between {
  @apply flex items-center justify-between;
}

.flex-col-center {
  @apply flex flex-col items-center justify-center;
}

/* Text utilities */
.text-truncate {
  @apply truncate;
}

.text-clamp-2 {
  @apply line-clamp-2;
}

.text-clamp-3 {
  @apply line-clamp-3;
}

/* Responsive utilities */
.hidden-sm {
  @apply hidden sm:block;
}

.hidden-md {
  @apply hidden md:block;
}

.hidden-lg {
  @apply hidden lg:block;
}
*/

// ============================================================================
// PostCSS Configuration Example
// ============================================================================

/*
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    // Pour dark mode avancé si nécessaire:
    // 'postcss-dark-mode': {},
  },
};
*/

// ============================================================================
// Notes d'Implémentation
// ============================================================================

/*

1. MakerKit utilise déjà Tailwind et shadcn/ui configuré
   → Pas besoin de modifier la config de base
   
2. Les couleurs personnalisées sont dans workshop-theme.ts
   → Elles peuvent être utilisées via inline styles si besoin
   
3. Dark mode fonctionne via next-themes
   → Classes automatiquement inversées en mode sombre
   
4. Les couleurs sont prédéfinies dans:
   - styles/theme.css (variables CSS)
   - _components/workshop-theme.ts (objets TS)
   
5. Si vous voulez ajouter plus de customisation:
   - Modifier apps/web/styles/theme.css
   - OU ajouter des variables CSS au :root
   - OU utiliser des classes Tailwind habituelles

6. Pour tester les couleurs en dark mode:
   - Ajouter 'dark' class à <html> ou parent
   - Ou utiliser le toggle theme de MakerKit

*/

export const tailwindGuide = {
  description: 'Guide de configuration Tailwind pour Workshop',
  status: 'MakerKit déjà configuré ✅',
  customizationPath: 'styles/theme.css ou workshop-theme.ts',
  darkModeProvider: 'next-themes',
};
