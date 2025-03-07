
import { CSSProperties } from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export function SelectionBox({ isSelecting, startPoint, endPoint }: SelectionBoxProps) {
  if (!isSelecting) return null;
  
  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  
  const style: CSSProperties = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    zIndex: 10
  };
  
  return <div style={style} />;
}
