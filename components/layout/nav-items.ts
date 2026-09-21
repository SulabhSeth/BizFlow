import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ClipboardList, Users, Package, FileText, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Full nav, used by the desktop sidebar. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** The 3 items that get their own slot in the mobile bottom nav; the rest live under "More". */
export const mobilePrimaryItems: NavItem[] = [navItems[0], navItems[1], navItems[2]];
export const mobileMoreItems: NavItem[] = [navItems[3], navItems[4], navItems[5]];