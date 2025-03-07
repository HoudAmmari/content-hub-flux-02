
import { useState } from "react";
import { Content } from "@/models/types";

export function useCardSelection(cards: Content[], epics: Content[]) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [lastSelectedCard, setLastSelectedCard] = useState<string | null>(null);

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
      setSelectedCards(cardId === lastSelectedCard && selectedCards.length === 1 ? [] : [cardId]);
      setLastSelectedCard(cardId);
    }
  };

  return {
    selectedCards,
    lastSelectedCard,
    handleCardSelect,
    setSelectedCards,
    setLastSelectedCard
  };
}
