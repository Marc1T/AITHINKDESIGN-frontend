/**
 * Workshop Theme Configuration
 * Design System professionnel: Bleu/Gris avec support Light/Dark
 */

export const workshopTheme = {
  // Palette couleurs principale
  colors: {
    // Primaire - Bleu professionnel
    primary: {
      light: 'rgb(59, 130, 246)', // blue-500
      dark: 'rgb(96, 165, 250)', // blue-400
      lighter: 'rgb(219, 234, 254)', // blue-100
      darkest: 'rgb(30, 58, 138)', // blue-900
    },

    // Secondaire - Gris sophistiqué
    secondary: {
      light: 'rgb(107, 114, 128)', // gray-500
      dark: 'rgb(156, 163, 175)', // gray-400
      lighter: 'rgb(243, 244, 246)', // gray-100
      darkest: 'rgb(31, 41, 55)', // gray-800
    },

    // Statuts & Actions
    success: 'rgb(16, 185, 129)', // emerald-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    info: 'rgb(59, 130, 246)', // blue-500

    // Agents - Couleurs distinctes
    agents: {
      creative: 'rgb(236, 72, 153)', // pink-500
      pragmatic: 'rgb(59, 130, 246)', // blue-500
      technical: 'rgb(16, 185, 129)', // emerald-500
      empathetic: 'rgb(245, 158, 11)', // amber-500
      critic: 'rgb(239, 68, 68)', // red-500
      facilitator: 'rgb(139, 92, 246)', // violet-500
    },

    // Surfaces
    surface: {
      background: 'var(--background)',
      card: 'var(--card)',
      hover: 'var(--muted)',
      border: 'var(--border)',
    },
  },

  // Typographie
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Monaco", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },

  // Espacement
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },

  // Breakpoints responsive
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Phases & Progression
  phases: [
    { id: 1, label: 'Empathie', icon: '👥', color: 'bg-blue-500' },
    { id: 2, label: 'Idéation', icon: '💡', color: 'bg-blue-600' },
    { id: 3, label: 'Convergence', icon: '🎯', color: 'bg-blue-700' },
    { id: 4, label: 'TRIZ', icon: '⚙️', color: 'bg-emerald-600' },
    { id: 5, label: 'Sélection', icon: '✨', color: 'bg-amber-600' },
    { id: 6, label: 'Prototype', icon: '🚀', color: 'bg-violet-600' },
  ],
};

export const agentPersonalities = {
  creative: {
    name: 'Léa',
    emoji: '👩‍🎨',
    title: 'Créatrice',
    color: '#ec4899',
    description: 'Génère des idées folles et novatrices',
    strengths: ['SCAMPER', 'Idées radicales', 'Analogies créatives'],
  },
  pragmatic: {
    name: 'Marco',
    emoji: '👨‍💼',
    title: 'Pragmatique',
    color: '#3b82f6',
    description: 'Focus sur la faisabilité et le ROI',
    strengths: ['MVP design', 'Économie', 'Viabilité'],
  },
  technical: {
    name: 'Thomas',
    emoji: '👨‍🔧',
    title: 'Technique',
    color: '#10b981',
    description: 'Maîtrise TRIZ et les contraintes techniques',
    strengths: ['TRIZ', 'Matériaux', 'Mécanique'],
  },
  empathetic: {
    name: 'Sofia',
    emoji: '👩‍⚕️',
    title: 'Empathique',
    color: '#f59e0b',
    description: 'Comprend les besoins utilisateurs profonds',
    strengths: ['UX', 'Empathy Maps', 'Human-centered'],
  },
  critic: {
    name: 'Nina',
    emoji: '🔍',
    title: 'Critique',
    color: '#ef4444',
    description: 'Identifie les risques et blocages',
    strengths: ['Quality', 'Risk Analysis', "Devil's advocate"],
  },
  facilitator: {
    name: 'Alex',
    emoji: '🎯',
    title: 'Facilitatrice',
    color: '#8b5cf6',
    description: 'Synthétise et guide vers le consensus',
    strengths: ['Synthèse', 'Décision', 'Structuration'],
  },
};
