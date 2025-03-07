
import { ReactNode } from "react";
import { CardDragPreview } from "./CardDragPreview";

interface DragPreviewWrapperProps {
  isDraggingSelected: boolean;
  draggedItem: string | null;
  selectedCards: string[];
  children: ReactNode;
}

export function DragPreviewWrapper({ 
  isDraggingSelected, 
  draggedItem, 
  selectedCards,
  children 
}: DragPreviewWrapperProps) {
  // Render drag preview for multiple selected cards
  const renderDragPreview = () => {
    if (isDraggingSelected && draggedItem && selectedCards.includes(draggedItem)) {
      return (
        <div className="fixed pointer-events-none z-50" 
             style={{ 
               left: '50%', 
               top: '50%', 
               transform: 'translate(-50%, -50%)',
               filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))'
             }}>
          <CardDragPreview count={selectedCards.length} />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderDragPreview()}
      {children}
    </>
  );
}
