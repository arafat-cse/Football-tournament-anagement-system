import { CreditCard, FileDown, Gavel, LayoutDashboard, ShieldCheck, Trophy } from "lucide-react";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard/registrations", label: "Registrations", icon: ShieldCheck },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/auction", label: "Auction", icon: Gavel },
  { href: "/dashboard/reports", label: "Reports", icon: FileDown },
];
