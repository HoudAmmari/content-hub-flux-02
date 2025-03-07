
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";

interface SelectionIndicatorProps {
  selectedCount: number;
}

export function SelectionIndicator({ selectedCount }: SelectionIndicatorProps) {
  const { t } = useTranslation();
  
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2">
      <Layers className="h-4 w-4 text-muted-foreground" />
      <span>{selectedCount} {t("kanban.selectedCards")}</span>
    </div>
  );
}
