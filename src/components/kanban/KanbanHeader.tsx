
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Channel } from "@/models/types";
import { EpicToggle } from "./EpicToggle";

interface KanbanHeaderProps {
  selectedChannel: Channel | null;
  showEpics: boolean;
  onShowEpicsChange: (show: boolean) => void;
  epicCount: number;
  onNewContent: () => void;
}

export function KanbanHeader({ 
  selectedChannel, 
  showEpics, 
  onShowEpicsChange, 
  epicCount,
  onNewContent 
}: KanbanHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-semibold">{selectedChannel?.name || t("kanban.board")}</h1>
      </div>

      <div className="flex gap-4 items-center">
        <EpicToggle 
          showEpics={showEpics} 
          onShowEpicsChange={onShowEpicsChange}
          epicCount={epicCount}
          channelName={selectedChannel?.name}
        />

        <Button onClick={onNewContent} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>{t("content.newContent")}</span>
        </Button>
      </div>
    </div>
  );
}
