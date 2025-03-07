
interface SelectionIndicatorProps {
  selectedCount: number;
}

export function SelectionIndicator({ selectedCount }: SelectionIndicatorProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2 animate-fade-in">
      <span>{selectedCount} cards selecionados</span>
    </div>
  );
}
