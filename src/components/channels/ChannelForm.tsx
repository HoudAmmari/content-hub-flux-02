
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Channel, ChannelStatus } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { StatusForm } from "./status/StatusForm";
import { StatusList } from "./status/StatusList";

interface ChannelFormProps {
  channel?: Channel;
  onSave: (channel: Omit<Channel, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ChannelForm({ channel, onSave, onCancel, isSubmitting }: ChannelFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState(channel?.name || "");
  const [description, setDescription] = useState(channel?.description || "");
  const [statuses, setStatuses] = useState<ChannelStatus[]>(
    channel?.statuses && channel.statuses.length > 0
      ? [...channel.statuses]
      : [
          { index: 0, name: "Backlog", type: "backlog" },
          { index: 1, name: "In Progress", type: "in_progress" },
          { index: 2, name: "Pending Review", type: "pending" },
          { index: 3, name: "Done", type: "done" }
        ]
  );
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  const handleAddStatus = (newStatus: ChannelStatus) => {
    setStatuses([...statuses, newStatus]);
    setIsAddingStatus(false);
  };

  const handleRemoveStatus = (statusName: string) => {
    setStatuses(statuses.filter(status => status.name !== statusName));
  };

  const handleReorderStatuses = (reorderedStatuses: ChannelStatus[]) => {
    setStatuses(reorderedStatuses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: t("channels.nameRequired"),
        description: t("channels.nameRequiredDescription"),
        variant: "destructive",
      });
      return;
    }
    
    if (statuses.length === 0) {
      toast({
        title: t("channels.statusRequired"),
        description: t("channels.statusRequiredDescription"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Make sure indexes are updated before saving
      const updatedStatuses = statuses.map((status, index) => ({
        ...status,
        index
      }));
      
      await onSave({
        name,
        description,
        statuses: updatedStatuses
      });
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error saving channel:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("channels.name")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("channels.name")}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t("channels.description")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("channels.description")}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>{t("channels.statuses")}</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddingStatus(true)}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("channels.addStatus")}
          </Button>
        </div>
        
        {isAddingStatus && (
          <StatusForm 
            onAddStatus={handleAddStatus}
            onCancel={() => setIsAddingStatus(false)}
            existingStatuses={statuses}
          />
        )}
        
        <StatusList 
          statuses={statuses} 
          onRemoveStatus={handleRemoveStatus}
          onReorderStatuses={handleReorderStatuses}
        />
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("general.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("general.loading") : t("general.save")}
        </Button>
      </div>
    </form>
  );
}
