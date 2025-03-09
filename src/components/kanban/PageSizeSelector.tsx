
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export function PageSizeSelector({ pageSize, onPageSizeChange, isLoading = false }: PageSizeSelectorProps) {
  const { t } = useTranslation();
  const [internalLoading, setInternalLoading] = useState(false);
  
  const handleSizeChange = (value: string) => {
    // Set internal loading state to show feedback
    setInternalLoading(true);
    
    // Change page size
    onPageSizeChange(parseInt(value, 10));
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setInternalLoading(false);
    }, 500);
  };
  
  const showLoading = isLoading || internalLoading;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("kanban.cardsPerPage")}:
      </span>
      <Select value={pageSize.toString()} onValueChange={handleSizeChange} disabled={showLoading}>
        <SelectTrigger className={`w-[80px] h-8 ${showLoading ? 'opacity-70' : ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
