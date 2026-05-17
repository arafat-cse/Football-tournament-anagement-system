import { CreditCard, FileDown, Gavel, LayoutDashboard, ShieldCheck, Trophy, Users, Shield, Award, Image } from "lucide-react";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard/registrations", label: "Registrations", icon: ShieldCheck },
  { href: "/dashboard/players", label: "Player List", icon: Users },
  { href: "/dashboard/teams", label: "Team List", icon: Shield },
  { href: "/dashboard/sponsors", label: "Sponsors", icon: Award },
  { href: "/dashboard/photo-card", label: "Photo Card", icon: Image },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/auction", label: "Auction", icon: Gavel },
  { href: "/dashboard/reports", label: "Reports", icon: FileDown },
];
