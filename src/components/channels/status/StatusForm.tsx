
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChannelStatus } from "@/models/types";

interface StatusFormProps {
  onAddStatus: (status: ChannelStatus) => void;
  onCancel: () => void;
  existingStatuses: ChannelStatus[];
}

export function StatusForm({ onAddStatus, onCancel, existingStatuses }: StatusFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusType, setNewStatusType] = useState<"backlog" | "in_progress" | "pending" | "done">("pending");

  const handleAddStatus = () => {
    if (newStatusName.trim()) {
      const statusExists = existingStatuses.some(status => 
        status.name.toLowerCase() === newStatusName.trim().toLowerCase()
      );
      
      if (!statusExists) {
        const newStatusObj: ChannelStatus = {
          index: existingStatuses.length,
          name: newStatusName.trim(),
          type: newStatusType
        };
        
        onAddStatus(newStatusObj);
        setNewStatusName("");
        setNewStatusType("pending");
      } else {
        toast({
          title: t("channels.statusExists"),
          description: t("channels.statusExistsDescription"),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md mb-3">
      <Label htmlFor="newStatusName">{t("channels.statusName")}</Label>
      <Input
        id="newStatusName"
        value={newStatusName}
        onChange={(e) => setNewStatusName(e.target.value)}
        placeholder={t("channels.statusNamePlaceholder")}
        className="mb-2"
      />
      
      <Label htmlFor="newStatusType">{t("channels.statusType")}</Label>
      <Select 
        value={newStatusType} 
        onValueChange={(value) => setNewStatusType(value as "backlog" | "in_progress" | "pending" | "done")}
      >
        <SelectTrigger id="newStatusType">
          <SelectValue placeholder={t("channels.selectStatusType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="pending">Pending Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex gap-2 mt-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          {t("general.cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAddStatus}
        >
          {t("channels.addStatus")}
        </Button>
      </div>
    </div>
  );
}
