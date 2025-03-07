
import { useState, useRef, RefObject } from "react";

interface UseSelectionBoxProps {
  boardRef: RefObject<HTMLDivElement>;
  onSelectionComplete: (selectedIds: string[]) => void;
}

export function useSelectionBox({ boardRef, onSelectionComplete }: UseSelectionBoxProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStartPoint, setSelectionStartPoint] = useState({ x: 0, y: 0 });
  const [selectionEndPoint, setSelectionEndPoint] = useState({ x: 0, y: 0 });
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());

  const registerCardPosition = (cardId: string, element: HTMLElement) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      cardPositionsRef.current.set(cardId, rect);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.kanban-card')) {
      return;
    }
    
    setIsSelecting(true);
    
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const startX = e.clientX - boardRect.left;
      const startY = e.clientY - boardRect.top;
      
      setSelectionStartPoint({ x: startX, y: startY });
      setSelectionEndPoint({ x: startX, y: startY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const currentX = e.clientX - boardRect.left;
    const currentY = e.clientY - boardRect.top;
    
    setSelectionEndPoint({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    if (selectionBoxRef.current) {
      const selectionRect = selectionBoxRef.current.getBoundingClientRect();
      
      // Only select if the selection box has a minimum size
      const hasMinimumSize = 
        Math.abs(selectionEndPoint.x - selectionStartPoint.x) > 5 && 
        Math.abs(selectionEndPoint.y - selectionStartPoint.y) > 5;
      
      if (hasMinimumSize) {
        const newSelectedCards: string[] = [];
        cardPositionsRef.current.forEach((cardRect, cardId) => {
          if (
            cardRect.right >= selectionRect.left &&
            cardRect.left <= selectionRect.right &&
            cardRect.bottom >= selectionRect.top &&
            cardRect.top <= selectionRect.bottom
          ) {
            newSelectedCards.push(cardId);
          }
        });
        
        if (newSelectedCards.length > 0) {
          onSelectionComplete(newSelectedCards);
        }
      }
    }
  };

  return {
    isSelecting,
    selectionStartPoint,
    selectionEndPoint,
    selectionBoxRef,
    registerCardPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
