
import { DragDropContext, ResponderProvided } from "react-beautiful-dnd";
import { ReactNode } from "react";
import { DropResult } from "react-beautiful-dnd";

interface DragPreviewWrapperProps {
  children: ReactNode;
  selectedCards: string[];
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
}

export function DragPreviewWrapper({ 
  children, 
  selectedCards, 
  onDragEnd 
}: DragPreviewWrapperProps) {
  console.log("DragPreviewWrapper rendering with selectedCards:", selectedCards);
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}
