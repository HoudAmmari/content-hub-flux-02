
import { ReactNode } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
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
      onClick={onClick}
    >
      {children}
    </RouterNavLink>
  );
}
