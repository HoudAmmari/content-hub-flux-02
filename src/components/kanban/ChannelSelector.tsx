
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Channel } from "@/models/types";

interface ChannelSelectorProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
}

export function ChannelSelector({ channels, onChannelSelect }: ChannelSelectorProps) {
  const { channelId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (channels.length === 0) return;

    if (channelId) {
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        onChannelSelect(channel);
      } else {
        // Only navigate if there are channels available
        if (channels.length > 0) {
          navigate(`/channels/${channels[0].id}`);
        }
      }
    } else if (channels.length > 0) {
      // Default to first channel
      onChannelSelect(channels[0]);
      navigate(`/channels/${channels[0].id}`);
    }
  }, [channels, channelId, navigate, onChannelSelect]);

  return null; // This is a logic-only component
}
