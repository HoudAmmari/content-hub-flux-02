
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count?: number;
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isDeleting,
  count = 1
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("general.delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1 
              ? t("content.deleteConfirm")
              : `Tem certeza que deseja excluir ${count} cards?`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("general.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting 
              ? t("general.loading") 
              : count === 1 
                ? t("general.delete")
                : `Excluir ${count} cards`
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
