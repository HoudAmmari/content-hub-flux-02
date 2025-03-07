
import { DragDropContext, ResponderProvided } from "react-beautiful-dnd";
import { ReactNode, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  
  console.log("DragPreviewWrapper rendering with selectedCards:", selectedCards);
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    onDragEnd(result, provided);
  };

  // Add a class to the body when dragging to prevent unwanted text selection
  if (typeof document !== 'undefined') {
    if (isDragging) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
  }
  
  return (
    <DragDropContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DragDropContext>
  );
}
