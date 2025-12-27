/**
 * Workshop Theme - Agent Personalities
 * Définitions des personnalités d'agents IA disponibles
 */

export interface AgentPersonality {
  name: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  strengths: string[];
}

export const agentPersonalities: Record<string, AgentPersonality> = {
  creative: {
    name: 'Léa',
    title: 'Creative Designer',
    emoji: '🎨',
    color: '#8B5CF6', // Purple
    description: 'Génère des idées innovantes et pousse les limites créatives.',
    strengths: ['Innovation', 'Design', 'Vision'],
  },
  pragmatic: {
    name: 'Marco',
    title: 'Business Analyst',
    emoji: '📊',
    color: '#3B82F6', // Blue
    description: 'Évalue la faisabilité et l\'impact business des solutions.',
    strengths: ['Faisabilité', 'ROI', 'Stratégie'],
  },
  technical: {
    name: 'Thomas',
    title: 'Tech Lead',
    emoji: '⚙️',
    color: '#10B981', // Green
    description: 'Analyse les contraintes techniques et propose des architectures.',
    strengths: ['Architecture', 'Performance', 'Scalabilité'],
  },
  empathetic: {
    name: 'Sophie',
    title: 'UX Researcher',
    emoji: '💜',
    color: '#EC4899', // Pink
    description: 'Se concentre sur les besoins et émotions des utilisateurs.',
    strengths: ['Empathie', 'User Research', 'Accessibilité'],
  },
  critical: {
    name: 'Victor',
    title: 'Quality Analyst',
    emoji: '🔍',
    color: '#F59E0B', // Amber
    description: 'Identifie les risques et points faibles des solutions.',
    strengths: ['Analyse', 'Risques', 'Qualité'],
  },
  facilitator: {
    name: 'Emma',
    title: 'Workshop Facilitator',
    emoji: '🎯',
    color: '#6366F1', // Indigo
    description: 'Organise les discussions et synthétise les contributions.',
    strengths: ['Synthèse', 'Organisation', 'Consensus'],
  },
};

export const phaseColors: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  1: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  3: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  4: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  5: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  6: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
};

export const phaseNames: Record<number, string> = {
  0: 'Setup',
  1: 'Empathy',
  2: 'Ideation',
  3: 'Convergence',
  4: 'TRIZ Analysis',
  5: 'Selection',
  6: 'Prototype',
};
