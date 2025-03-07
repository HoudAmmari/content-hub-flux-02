
import { useState, useEffect } from "react";
import { Content } from "@/models/types";

export function useCardSelection(cards: Content[], epics: Content[]) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [lastSelectedCard, setLastSelectedCard] = useState<string | null>(null);
  const [lastSelectionTime, setLastSelectionTime] = useState<number>(0);

  const getColumnCardsFromId = (cardId: string) => {
    const card = [...cards, ...epics].find(c => c.id === cardId);
    if (!card) return [];
    
    return getColumnCards(card.status);
  };

  const getColumnCards = (status: string) => {
    const columnCards = cards
      .filter((card) => card.status === status)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
    const epicCards = epics
      .filter((epic) => epic.status === status)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      
    return [...columnCards, ...epicCards];
  };

  const handleCardSelect = (cardId: string, event: React.MouseEvent) => {
    const now = Date.now();
    const multiSelectThreshold = 1000; // Increase timeout for multiselection to 1 second
    const isMultiselect = now - lastSelectionTime < multiSelectThreshold;
    setLastSelectionTime(now);
    
    // Handle comma-separated list of IDs (from selection box)
    if (cardId.includes(',')) {
      const newSelectedIds = cardId.split(',');
      
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
      // If it's a rapid click on the same card, don't deselect
      if (isMultiselect && cardId === lastSelectedCard && selectedCards.length === 1) {
        return;
      }
      
      setSelectedCards(cardId === lastSelectedCard && selectedCards.length === 1 ? [] : [cardId]);
      setLastSelectedCard(cardId);
    }
  };

  // Function to clear selection when clicking outside cards
  const clearSelectionOnOutsideClick = () => {
    setSelectedCards([]);
    setLastSelectedCard(null);
  };

  // Clear selection when cards change
  useEffect(() => {
    setSelectedCards([]);
    setLastSelectedCard(null);
  }, [cards, epics]);

  return {
    selectedCards,
    lastSelectedCard,
    handleCardSelect,
    setSelectedCards,
    setLastSelectedCard,
    clearSelectionOnOutsideClick
  };
}
