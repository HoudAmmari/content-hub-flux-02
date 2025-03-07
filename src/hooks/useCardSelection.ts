
import { useState, useCallback, useRef } from "react";
import { Content } from "@/models/types";

export function useCardSelection(cards: Content[], epics: Content[]) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [lastSelectedCard, setLastSelectedCard] = useState<string | null>(null);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const multiSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getColumnCardsFromId = useCallback((cardId: string) => {
    const card = [...cards, ...epics].find(c => c.id === cardId);
    if (!card) return [];
    
    return getColumnCards(card.status);
  }, [cards, epics]);

  const getColumnCards = useCallback((status: string) => {
    const columnCards = cards
      .filter((card) => card.status === status)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
    const epicCards = epics
      .filter((epic) => epic.status === status)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
    return [...columnCards, ...epicCards];
  }, [cards, epics]);

  const startMultiSelectMode = useCallback(() => {
    setIsMultiSelecting(true);
    
    // Clear any existing timeout
    if (multiSelectTimeoutRef.current) {
      clearTimeout(multiSelectTimeoutRef.current);
    }
    
    // Set a longer timeout for multi-select mode
    multiSelectTimeoutRef.current = setTimeout(() => {
      setIsMultiSelecting(false);
    }, 1000); // Increased from 500ms to 1000ms for better multi-select experience
  }, []);

  const handleCardSelect = useCallback((cardId: string, event: React.MouseEvent) => {
    // Handle comma-separated list of IDs (from selection box)
    if (cardId.includes(',')) {
      const newSelectedIds = cardId.split(',');
      startMultiSelectMode();
      
      if (event.ctrlKey || event.metaKey) {
        // Add to existing selection
        setSelectedCards(prev => {
          const combined = [...prev, ...newSelectedIds];
          // Remove duplicates
          return [...new Set(combined)];
        });
      } else {
        // Replace selection
        setSelectedCards(newSelectedIds);
      }
      
      if (newSelectedIds.length > 0) {
        setLastSelectedCard(newSelectedIds[newSelectedIds.length - 1]);
      }
      
      return;
    }
    
    // Start multi-select mode for any selection action to prevent immediate deselection
    startMultiSelectMode();
    
    // Normal single card selection
    if (event.ctrlKey || event.metaKey) {
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId) 
          : [...prev, cardId]
      );
      setLastSelectedCard(cardId);
    } else if (event.shiftKey && lastSelectedCard) {
      const allColumnCards = getColumnCardsFromId(cardId);
      const currentIndex = allColumnCards.findIndex(card => card.id === cardId);
      const lastIndex = allColumnCards.findIndex(card => card.id === lastSelectedCard);
      
      if (currentIndex >= 0 && lastIndex >= 0) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        
        const rangeIds = allColumnCards
          .slice(start, end + 1)
          .map(card => card.id);
        
        setSelectedCards(prev => {
          const newSelection = [...new Set([...prev, ...rangeIds])];
          return newSelection;
        });
      }
    } else {
      // Regular click - deselect others if not the same card
      setSelectedCards(cardId === lastSelectedCard && selectedCards.length === 1 ? [] : [cardId]);
      setLastSelectedCard(cardId);
    }
  }, [selectedCards, lastSelectedCard, getColumnCardsFromId, startMultiSelectMode]);

  const clearSelection = useCallback(() => {
    if (!isMultiSelecting) {
      setSelectedCards([]);
      setLastSelectedCard(null);
    }
  }, [isMultiSelecting]);

  return {
    selectedCards,
    lastSelectedCard,
    handleCardSelect,
    setSelectedCards,
    setLastSelectedCard,
    clearSelection,
    isMultiSelecting
  };
}
