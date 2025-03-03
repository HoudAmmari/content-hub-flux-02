
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Channel } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import { ChannelForm } from "./ChannelForm";

interface ChannelDialogProps {
  channel?: Channel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (channel: Omit<Channel, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function ChannelDialog({ channel, open, onOpenChange, onSave }: ChannelDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (channelData: Omit<Channel, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    
    try {
      await onSave(channelData);
      
      toast({
        title: t("general.success"),
        description: channel ? t("channels.channelUpdated") : t("channels.channelCreated"),
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving channel:", error);
      toast({
        title: t("general.error"),
        description: t("channels.saveError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? t("channels.editChannel") : t("channels.newChannel")}
          </DialogTitle>
        </DialogHeader>
        
        <ChannelForm
          channel={channel}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
