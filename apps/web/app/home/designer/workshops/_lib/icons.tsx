/**
 * Icon components for Workshop UI
 * Using Lucide React icons instead of emojis for professional look
 */

import React from 'react';
import {
  // General
  Settings,
  Settings2,
  Check,
  CheckCircle,
  CheckCircle2,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Clock,
  Timer,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  ExternalLink,
  Share2,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  
  // Workshop & Phases
  Lightbulb,
  Sparkles,
  Rocket,
  Target,
  Flag,
  Trophy,
  Award,
  Medal,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  PartyPopper,
  
  // People & Agents
  User,
  Users,
  UserCircle,
  UserPlus,
  Bot,
  
  // Design & Creative
  Palette,
  Paintbrush,
  PenTool,
  Compass,
  Layers,
  Layout,
  LayoutGrid,
  Grid3X3,
  Shapes,
  
  // Technical
  Wrench,
  Hammer,
  Cog,
  Zap,
  Cpu,
  Code,
  Terminal,
  Database,
  
  // Business
  Briefcase,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  LineChart,
  
  // Communication
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Send,
  Mail,
  AtSign,
  
  // Documents
  FileText,
  File,
  FilePlus,
  FileCheck,
  FileX,
  Folder,
  FolderOpen,
  ClipboardList,
  ClipboardCheck,
  Notebook,
  BookOpen,
  
  // Navigation & Maps
  Map,
  MapPin,
  Navigation,
  Compass as CompassNav,
  Route,
  
  // Emotions & Feedback
  Smile,
  Frown,
  Meh,
  HeartHandshake,
  Handshake,
  
  // Actions
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Shuffle,
  Repeat,
  
  // Voting
  Vote,
  CircleDot,
  Circle,
  
  // Analysis
  FlaskConical,
  Microscope,
  Beaker,
  TestTube2,
  Brain,
  Network,
  GitBranch,
  Split,
  Merge,
  
  // Image & Media
  Image,
  ImagePlus,
  Camera,
  Video,
  Play as PlayMedia,
  
  // Status
  Power,
  Activity,
  Wifi,
  WifiOff,
  Signal,
} from 'lucide-react';

// =============================================================================
// Icon Size Types
// =============================================================================

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const ICON_SIZES: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

// =============================================================================
// Phase Icons
// =============================================================================

export const PhaseIcons = {
  setup: Settings2,
  empathy: HeartHandshake,
  ideation: Lightbulb,
  convergence: Target,
  triz: FlaskConical,
  selection: Trophy,
  prototype: Image,
} as const;

// =============================================================================
// Agent Icons - Professional alternatives to emojis
// =============================================================================

export const AgentIcons = {
  creative: Palette,
  pragmatic: Briefcase,
  technical: Wrench,
  empathetic: HeartHandshake,
  critical: Search,
  facilitator: Target,
} as const;

export const AgentColors = {
  creative: 'text-pink-500',
  pragmatic: 'text-blue-500',
  technical: 'text-emerald-500',
  empathetic: 'text-amber-500',
  critical: 'text-red-500',
  facilitator: 'text-violet-500',
} as const;

// =============================================================================
// Status Icons
// =============================================================================

export const StatusIcons = {
  idle: Circle,
  pending: Clock,
  working: Loader2,
  completed: CheckCircle2,
  error: XCircle,
  success: CheckCircle,
} as const;

// =============================================================================
// Action Icons
// =============================================================================

export const ActionIcons = {
  start: Play,
  stop: Square,
  pause: Pause,
  restart: RotateCcw,
  refresh: RefreshCw,
  next: ArrowRight,
  back: ArrowLeft,
  add: Plus,
  remove: Minus,
  delete: Trash2,
  edit: Edit3,
  copy: Copy,
  download: Download,
  upload: Upload,
  share: Share2,
  view: Eye,
  hide: EyeOff,
  search: Search,
  filter: Filter,
  more: MoreHorizontal,
} as const;

// =============================================================================
// Technique Icons (for Ideation)
// =============================================================================

export const TechniqueIcons = {
  scamper: RefreshCw,
  random_word: Shuffle,
  worst_idea: Zap,
  brainstorm: Brain,
} as const;

// =============================================================================
// Voting Method Icons
// =============================================================================

export const VotingIcons = {
  dot_voting: CircleDot,
  now_how_wow: Grid3X3,
  impact_effort: BarChart2,
} as const;

// =============================================================================
// Empathy Map Icons
// =============================================================================

export const EmpathyIcons = {
  says: MessageCircle,
  thinks: Brain,
  does: Activity,
  feels: Heart,
} as const;

// =============================================================================
// Journey Icons
// =============================================================================

export const JourneyIcons = {
  touchpoint: MapPin,
  emotion: Smile,
  painPoint: AlertTriangle,
  stage: Route,
} as const;

// =============================================================================
// TRIZ Icons
// =============================================================================

export const TRIZIcons = {
  contradiction: Split,
  principle: Lightbulb,
  analysis: Microscope,
  brief: FileText,
} as const;

// =============================================================================
// Document Icons
// =============================================================================

export const DocumentIcons = {
  cahier: ClipboardList,
  pdf: FileText,
  spec: FileCheck,
  export: Download,
} as const;

// =============================================================================
// Feedback Icons
// =============================================================================

export const FeedbackIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  help: HelpCircle,
} as const;

// =============================================================================
// Icon Component Helper
// =============================================================================

interface IconProps {
  icon: React.ComponentType<{ className?: string }>;
  size?: IconSize;
  className?: string;
}

export function Icon({ icon: IconComponent, size = 'md', className = '' }: IconProps) {
  return <IconComponent className={`${ICON_SIZES[size]} ${className}`} />;
}

// =============================================================================
// Rank Badge Component
// =============================================================================

interface RankBadgeProps {
  rank: number;
  size?: IconSize;
  className?: string;
}

export function RankBadge({ rank, size = 'lg', className = '' }: RankBadgeProps) {
  if (rank === 1) return <Trophy className={`${ICON_SIZES[size]} text-yellow-500 ${className}`} />;
  if (rank === 2) return <Medal className={`${ICON_SIZES[size]} text-gray-400 ${className}`} />;
  if (rank === 3) return <Award className={`${ICON_SIZES[size]} text-amber-600 ${className}`} />;
  return <span className={`font-bold ${className}`}>#{rank}</span>;
}

// =============================================================================
// Loading Spinner Component
// =============================================================================

interface SpinnerProps {
  size?: IconSize;
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return <Loader2 className={`${ICON_SIZES[size]} animate-spin ${className}`} />;
}

// =============================================================================
// Agent Avatar Component
// =============================================================================

interface AgentAvatarIconProps {
  personality: string;
  size?: IconSize;
  showBorder?: boolean;
  className?: string;
}

export function AgentAvatarIcon({ 
  personality, 
  size = 'lg', 
  showBorder = false,
  className = '' 
}: AgentAvatarIconProps) {
  const IconComponent = AgentIcons[personality as keyof typeof AgentIcons] || User;
  const colorClass = AgentColors[personality as keyof typeof AgentColors] || 'text-gray-500';
  
  return (
    <div className={`
      inline-flex items-center justify-center rounded-full
      ${showBorder ? 'border-2 border-current p-1' : ''}
      ${colorClass}
      ${className}
    `}>
      <IconComponent className={ICON_SIZES[size]} />
    </div>
  );
}

// =============================================================================
// Phase Header Icon Component
// =============================================================================

interface PhaseIconProps {
  phase: number;
  size?: IconSize;
  className?: string;
}

const PHASE_MAP: (keyof typeof PhaseIcons)[] = [
  'setup',
  'empathy', 
  'ideation',
  'convergence',
  'triz',
  'selection',
  'prototype',
];

export function PhaseIcon({ phase, size = 'lg', className = '' }: PhaseIconProps) {
  const phaseName = PHASE_MAP[phase] || 'setup';
  const IconComponent = PhaseIcons[phaseName];
  
  return <IconComponent className={`${ICON_SIZES[size]} ${className}`} />;
}

// =============================================================================
// Re-export commonly used icons for convenience
// =============================================================================

export {
  // Core icons
  Lightbulb,
  Sparkles,
  Rocket,
  Target,
  Trophy,
  Settings,
  Settings2,
  Check,
  CheckCircle,
  CheckCircle2,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Clock,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Share2,
  Eye,
  Search,
  
  // People
  User,
  Users,
  Bot,
  
  // Design
  Palette,
  Wrench,
  Briefcase,
  
  // Communication
  MessageCircle,
  MessageSquare,
  Send,
  
  // Documents
  FileText,
  ClipboardList,
  
  // Analysis
  FlaskConical,
  Brain,
  Split,
  
  // Status
  Heart,
  HeartHandshake,
  Activity,
  
  // Charts
  BarChart2,
  Grid3X3,
  CircleDot,
  TrendingUp,
  
  // Actions
  Play,
  RefreshCw,
  Shuffle,
  Zap,
  
  // Navigation
  Map,
  MapPin,
  Route,
  Home,
  ChevronDown,
  
  // Emotions
  Smile,
  Frown,
  Meh,
  
  // Voting & Selection
  Vote,
  Circle,
  LayoutGrid,
  Award,
  Medal,
  PartyPopper,
};
