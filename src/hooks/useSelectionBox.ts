
import { useState, useRef, RefObject } from "react";

interface UseSelectionBoxProps {
  boardRef: RefObject<HTMLDivElement>;
  onSelectionComplete: (selectedIds: string[]) => void;
}

export function useSelectionBox({ boardRef, onSelectionComplete }: UseSelectionBoxProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStartPoint, setSelectionStartPoint] = useState({ x: 0, y: 0 });
  const [selectionEndPoint, setSelectionEndPoint] = useState({ x: 0, y: 0 });
  const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());

  const registerCardPosition = (cardId: string, element: HTMLElement) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      cardPositionsRef.current.set(cardId, rect);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start selection if clicking on a card
    if ((e.target as HTMLElement).closest('.kanban-card')) {
      return;
    }
    
    setIsSelecting(true);
    
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const startX = e.clientX - boardRect.left + boardRef.current.scrollLeft;
      const startY = e.clientY - boardRect.top + boardRef.current.scrollTop;
      
      setSelectionStartPoint({ x: startX, y: startY });
      setSelectionEndPoint({ x: startX, y: startY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const currentX = e.clientX - boardRect.left + boardRef.current.scrollLeft;
    const currentY = e.clientY - boardRect.top + boardRef.current.scrollTop;
    
    setSelectionEndPoint({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    // Calculate selection box coordinates
    const left = Math.min(selectionStartPoint.x, selectionEndPoint.x);
    const top = Math.min(selectionStartPoint.y, selectionEndPoint.y);
    const right = Math.max(selectionStartPoint.x, selectionEndPoint.x);
    const bottom = Math.max(selectionStartPoint.y, selectionEndPoint.y);
    
    // Only select if the selection box has a minimum size
    const hasMinimumSize = 
      Math.abs(selectionEndPoint.x - selectionStartPoint.x) > 5 && 
      Math.abs(selectionEndPoint.y - selectionStartPoint.y) > 5;
    
    if (hasMinimumSize) {
      const newSelectedCards: string[] = [];
      
      // Check each card to see if it intersects with the selection box
      cardPositionsRef.current.forEach((cardRect, cardId) => {
        if (boardRef.current) {
          const boardRect = boardRef.current.getBoundingClientRect();
          
          // Convert card coordinates to be relative to the board
          const cardLeft = cardRect.left - boardRect.left + boardRef.current.scrollLeft;
          const cardTop = cardRect.top - boardRect.top + boardRef.current.scrollTop;
          const cardRight = cardLeft + cardRect.width;
          const cardBottom = cardTop + cardRect.height;
          
          // Check for intersection
          if (
            cardRight >= left &&
            cardLeft <= right &&
            cardBottom >= top &&
            cardTop <= bottom
          ) {
            newSelectedCards.push(cardId);
          }
        }
      });
      
      if (newSelectedCards.length > 0) {
        onSelectionComplete(newSelectedCards);
      }
    }
    
    setIsSelecting(false);
  };

  return {
    isSelecting,
    selectionStartPoint,
    selectionEndPoint,
    registerCardPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
