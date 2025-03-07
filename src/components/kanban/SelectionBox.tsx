
import { CSSProperties } from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  style: CSSProperties;
}

export function SelectionBox({ isSelecting, style }: SelectionBoxProps) {
  if (!isSelecting) return null;
  
  return (
    <div 
      className="absolute bg-primary/20 border border-primary/50 z-10"
      style={style}
    />
  );
}
