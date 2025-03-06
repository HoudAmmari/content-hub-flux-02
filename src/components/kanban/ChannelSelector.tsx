
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
        navigate("/");
      }
    } else if (channels.length > 0) {
      onChannelSelect(channels[0]);
      navigate(`/channels/${channels[0].id}`);
    }
  }, [channels, channelId, navigate, onChannelSelect]);

  return null; // This is a logic-only component
}
