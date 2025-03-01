
import { ReactNode } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <RouterNavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "flex items-center text-sm font-medium transition-colors rounded-md hover:text-foreground hover:bg-accent",
          isActive 
            ? "text-foreground bg-accent" 
            : "text-muted-foreground",
          className
        )
      }
    >
      {children}
    </RouterNavLink>
  );
}
