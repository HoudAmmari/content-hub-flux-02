
import { Channel } from "@/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface ChannelSelectorProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  selectedChannelId?: string;
}

export function ChannelSelector({ 
  channels, 
  onChannelSelect,
  selectedChannelId 
}: ChannelSelectorProps) {
  const { t } = useTranslation();

  const handleChannelChange = (channelId: string) => {
    const selectedChannel = channels.find((channel) => channel.id === channelId);
    if (selectedChannel) {
      onChannelSelect(selectedChannel);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <Select 
        value={selectedChannelId || ''} 
        onValueChange={handleChannelChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("channels.selectChannel")} />
        </SelectTrigger>
        <SelectContent>
          {channels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              {channel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
