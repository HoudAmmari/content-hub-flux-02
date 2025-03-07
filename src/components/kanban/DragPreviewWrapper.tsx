
import { DragDropContext } from "react-beautiful-dnd";
import { ReactNode } from "react";
import { DropResult } from "react-beautiful-dnd";

interface DragPreviewWrapperProps {
  children: ReactNode;
  selectedCards: string[];
  onDragEnd: (result: DropResult) => void;
}

export function DragPreviewWrapper({ 
  children, 
  selectedCards, 
  onDragEnd 
}: DragPreviewWrapperProps) {
  return (
    <DragDropContext 
      onDragEnd={onDragEnd}
    >
      {children}
    </DragDropContext>
  );
}
