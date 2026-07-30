import {
  Search, User, ShoppingCart, Menu, X, ArrowRight, Heart, Star, Check,
  ShieldCheck, Leaf, MapPin, Sparkles, HandHeart, Award, FlaskConical,
  Users, Droplet, Smile, Clock, ChevronDown, Plus, Minus, Trash2,
  Dog, Cat, Bone, SprayCan, Facebook, Instagram, Music2,
  AlertCircle, LogOut, Package, MapPinned, Settings, LayoutDashboard,
  Boxes, ShoppingBag, Edit, Save, ArrowLeft, Eye, EyeOff,
  Mail, Crown, Lightbulb, Home, LayoutGrid, Image,
  type LucideIcon,
} from "lucide-react";

/**
 * Central icon registry so data files can reference icons by string name.
 * Spec: all icons come from lucide-react.
 */
export const icons: Record<string, LucideIcon> = {
  search: Search,
  user: User,
  cart: ShoppingCart,
  menu: Menu,
  close: X,
  arrowRight: ArrowRight,
  heart: Heart,
  star: Star,
  check: Check,
  shield: ShieldCheck,
  leaf: Leaf,
  pin: MapPin,
  sparkle: Sparkles,
  heartHand: HandHeart,
  award: Award,
  batch: FlaskConical,
  users: Users,
  droplet: Droplet,
  smile: Smile,
  clock: Clock,
  chevDown: ChevronDown,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  dog: Dog,
  cat: Cat,
  bone: Bone,
  spray: SprayCan,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  "alert-circle": AlertCircle,
  "log-out": LogOut,
  package: Package,
  pinned: MapPinned,
  settings: Settings,
  dashboard: LayoutDashboard,
  boxes: Boxes,
  bag: ShoppingBag,
  edit: Edit,
  save: Save,
  "arrow-left": ArrowLeft,
  eye: Eye,
  "eye-off": EyeOff,
  paw: Dog,
  mail: Mail,
  crown: Crown,
  lightbulb: Lightbulb,
  home: Home,
  grid: LayoutGrid,
  image: Image,
};

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = icons[name] ?? Sparkles;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
