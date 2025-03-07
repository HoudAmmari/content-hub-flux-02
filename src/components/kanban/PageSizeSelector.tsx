
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function PageSizeSelector({ pageSize, onPageSizeChange }: PageSizeSelectorProps) {
  const { t } = useTranslation();
  
  const handleSizeChange = (value: string) => {
    onPageSizeChange(parseInt(value, 10));
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("kanban.cardsPerPage")}:
      </span>
      <Select value={pageSize.toString()} onValueChange={handleSizeChange}>
        <SelectTrigger className="w-[80px] h-8">
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
