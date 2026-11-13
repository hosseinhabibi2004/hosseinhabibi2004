import { FileText, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  href: string;
  /** Key in the `shell` namespace. */
  labelKey: "nav.dashboard" | "nav.posts";
  icon: LucideIcon;
}

/** The one list the sidebar, the bottom bar and the header title all read. */
export const navItems: NavItem[] = [
  { id: "dashboard", href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { id: "posts", href: "/posts", labelKey: "nav.posts", icon: FileText },
];

/** The item whose page `pathname` is on: sections match nested paths, the dashboard only `/`. */
export function findNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
