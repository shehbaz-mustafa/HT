import React from 'react';
import {
  Droplets,
  BookOpen,
  Dumbbell,
  Activity,
  Moon,
  Sun,
  Target,
  PenTool,
  Compass,
  Heart,
  Zap,
  Shield,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

export const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  droplets: Droplets,
  water: Droplets,
  '💧': Droplets,
  book: BookOpen,
  reading: BookOpen,
  '📖': BookOpen,
  dumbbell: Dumbbell,
  training: Dumbbell,
  '🏋️': Dumbbell,
  '🏋': Dumbbell,
  activity: Activity,
  fitness: Activity,
  '🏃': Activity,
  moon: Moon,
  sleep: Moon,
  '🌙': Moon,
  sun: Sun,
  morning: Sun,
  '☀️': Sun,
  target: Target,
  focus: Target,
  '🎯': Target,
  pen: PenTool,
  journal: PenTool,
  '✍️': PenTool,
  '✍': PenTool,
  compass: Compass,
  meditation: Compass,
  '🧘': Compass,
  heart: Heart,
  health: Heart,
  '🍎': Heart,
  zap: Zap,
  energy: Zap,
  '⚡': Zap,
  shield: Shield,
  discipline: Shield,
  '🌿': Shield,
  '💻': Target,
};

export const AVAILABLE_HABIT_ICONS = [
  { id: 'droplets', label: 'Hydration', icon: Droplets },
  { id: 'book', label: 'Reading', icon: BookOpen },
  { id: 'dumbbell', label: 'Strength', icon: Dumbbell },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'compass', label: 'Mindfulness', icon: Compass },
  { id: 'moon', label: 'Sleep', icon: Moon },
  { id: 'sun', label: 'Morning Routine', icon: Sun },
  { id: 'target', label: 'Target Focus', icon: Target },
  { id: 'pen', label: 'Journaling', icon: PenTool },
  { id: 'heart', label: 'Wellness', icon: Heart },
  { id: 'zap', label: 'Sprint', icon: Zap },
  { id: 'shield', label: 'Protocol', icon: Shield },
];

export function HabitIcon({
  name,
  className = 'h-4 w-4',
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = HABIT_ICON_MAP[name] || Target;
  return <IconComponent className={className} />;
}
