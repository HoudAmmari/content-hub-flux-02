
import { useState, useRef, useCallback } from "react";

interface Point {
  x: number;
  y: number;
}

interface SelectionBoxStyle {
  display: string;
  position: 'absolute';
  left: string;
  top: string;
  width: string;
  height: string;
  background: string;
  border: string;
  zIndex: number;
}

export function useSelectionBox() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStartPoint, setSelectionStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [selectionEndPoint, setSelectionEndPoint] = useState<Point>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());

  const registerCardPosition = useCallback((cardId: string, element: HTMLElement) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      cardPositionsRef.current.set(cardId, rect);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection if clicking on the board and not on a card or other UI element
    if (!(e.target as HTMLElement).closest('.kanban-card') && 
        !(e.target as HTMLElement).closest('.droppable-area') &&
        !(e.target as HTMLElement).closest('button')) {
      
      setIsSelecting(true);
      
      if (boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const startX = e.clientX - boardRect.left;
        const startY = e.clientY - boardRect.top;
        
        setSelectionStartPoint({ x: startX, y: startY });
        setSelectionEndPoint({ x: startX, y: startY });
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const currentX = e.clientX - boardRect.left;
    const currentY = e.clientY - boardRect.top;
    
    setSelectionEndPoint({ x: currentX, y: currentY });
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  const getSelectedCardIds = useCallback((): string[] => {
    if (!selectionBoxRef.current || !isSelecting) return [];
    
    const selectionRect = selectionBoxRef.current.getBoundingClientRect();
    const selectedIds: string[] = [];
    
    cardPositionsRef.current.forEach((cardRect, cardId) => {
      if (
        cardRect.right >= selectionRect.left &&
        cardRect.left <= selectionRect.right &&
        cardRect.bottom >= selectionRect.top &&
        cardRect.top <= selectionRect.bottom
      ) {
        selectedIds.push(cardId);
      }
    });
    
    return selectedIds;
  }, [isSelecting]);

  const getSelectionBoxStyle = useCallback((): SelectionBoxStyle => {
    if (!isSelecting) {
      return { 
        display: 'none',
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px',
        background: 'rgba(59, 130, 246, 0.2)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        zIndex: 10
      };
    }
    
    const left = Math.min(selectionStartPoint.x, selectionEndPoint.x);
    const top = Math.min(selectionStartPoint.y, selectionEndPoint.y);
    const width = Math.abs(selectionEndPoint.x - selectionStartPoint.x);
    const height = Math.abs(selectionEndPoint.y - selectionStartPoint.y);
    
    return {
      display: 'block',
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      background: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      zIndex: 10
    };
  }, [isSelecting, selectionStartPoint, selectionEndPoint]);

  return {
    boardRef,
    selectionBoxRef,
    isSelecting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getSelectionBoxStyle,
    registerCardPosition,
    getSelectedCardIds
  };
}
