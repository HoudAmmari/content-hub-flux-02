
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

interface EpicToggleProps {
  showEpics: boolean;
  onShowEpicsChange: (show: boolean) => void;
  epicCount: number;
  channelName?: string;
}

export function EpicToggle({ 
  showEpics, 
  onShowEpicsChange, 
  epicCount,
  channelName 
}: EpicToggleProps) {
  const { t } = useTranslation();
  
  if (!channelName || channelName.toLowerCase() !== "youtube") {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="show-epics"
        checked={showEpics}
        onCheckedChange={onShowEpicsChange}
      />
      <Label htmlFor="show-epics" className="flex items-center gap-1">
        <Layers className="h-4 w-4" />
        <span>
          {showEpics ? t("content.hideEpics") : t("content.showEpics")}
        </span>
        <Badge className="ml-1 bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
          {epicCount}
        </Badge>
      </Label>
    </div>
  );
}
