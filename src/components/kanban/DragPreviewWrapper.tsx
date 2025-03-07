
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
  
  const handleDragStart = () => {
    setIsDragging(true);
    
    // Add a class to the body to prevent text selection while dragging
    if (typeof document !== 'undefined') {
      document.body.classList.add('dragging');
    }
  };
  
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    
    // Remove the class when drag ends
    if (typeof document !== 'undefined') {
      document.body.classList.remove('dragging');
    }
    
    onDragEnd(result, provided);
  };
  
  return (
    <DragDropContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DragDropContext>
  );
}
