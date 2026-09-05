import {
  Search,
  PenTool,
  Target,
  Palette,
  CalendarDays,
  BarChart3,
  ShoppingCart,
  Clapperboard,
  Workflow,
  Film,
  MessageCircle,
  Mail,
  Share2,
  PenLine,
  TrendingUp,
  Sparkles,
  Rocket,
  Megaphone,
  Crown,
  Building2,
  Globe,
  Bot,
  type LucideIcon,
} from "lucide-react";

export const EMPLOYEE_ICONS: Record<string, LucideIcon> = {
  Search,
  PenTool,
  Target,
  Palette,
  CalendarDays,
  BarChart3,
  ShoppingCart,
  Clapperboard,
  Workflow,
  Film,
  MessageCircle,
  Mail,
  Share2,
  PenLine,
  TrendingUp,
  Sparkles,
  Rocket,
  Megaphone,
  Crown,
  Building2,
  Globe,
  Bot,
};

export const EMPLOYEE_ICON_NAMES = Object.keys(EMPLOYEE_ICONS);

export function employeeIcon(name: string | null | undefined): LucideIcon {
  return (name && EMPLOYEE_ICONS[name]) || Bot;
}
