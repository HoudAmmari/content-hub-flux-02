
import { Channel } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EpicToggle } from "./EpicToggle";
import { PageSizeSelector } from "./PageSizeSelector";

interface KanbanHeaderProps {
  selectedChannel: Channel | null;
  showEpics: boolean;
  onShowEpicsChange: (show: boolean) => void;
  epicCount: number;
  onNewContent: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function KanbanHeader({ 
  selectedChannel, 
  showEpics, 
  onShowEpicsChange, 
  epicCount,
  onNewContent,
  pageSize,
  onPageSizeChange 
}: KanbanHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          {selectedChannel ? (
            <h2 className="text-2xl font-semibold">{selectedChannel.name}</h2>
          ) : (
            <h2 className="text-2xl font-semibold">{t("kanban.selectChannel")}</h2>
          )}
        </div>
        <div className="flex items-center gap-4">
          <PageSizeSelector 
            pageSize={pageSize} 
            onPageSizeChange={onPageSizeChange} 
          />
          
          {epicCount > 0 && (
            <div className="flex items-center gap-2">
              <EpicToggle
                showEpics={showEpics}
                onShowEpicsChange={onShowEpicsChange}
                epicCount={epicCount}
                channelName={selectedChannel?.name}
              />
            </div>
          )}

          <Button onClick={onNewContent} className="gap-2">
            <Plus size={16} />
            {t("content.new")}
          </Button>
        </div>
      </div>
    </div>
  );
}
