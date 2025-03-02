
import { ModeToggle } from "@/components/app/ModeToggle";
import { LanguageSelector } from "@/components/app/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  currentView: string;
}

export function AppHeader() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<string>();

  useEffect(() => {
    if (!currentView) {
      setCurrentView(window.location.pathname.replace("/", ""));
    }

  }, []);
  
  const getTitle = () => {
    switch (currentView) {
      case "dashboard":
        return t("navigation.dashboard");
      case "kanban":
        return t("navigation.content");
      case "calendar":
        return t("navigation.calendar");
      case "projects":
        return t("navigation.projects");
      case "channels":
        return t("navigation.channels");
      default:
        return t("navigation.dashboard");
    }
  };
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1">
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ModeToggle />
      </div>
    </header>
  );
}
