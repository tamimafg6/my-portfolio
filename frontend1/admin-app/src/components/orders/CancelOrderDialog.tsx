"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber?: string;
}

export function CancelOrderDialog({
  open,
  onClose,
  onConfirm,
  orderNumber,
}: CancelOrderDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t("Cancel Order", "Annuler la commande")}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-base">
            {orderNumber && (
              <>
                <span className="font-semibold">#{orderNumber}</span>
                <br />
              </>
            )}
            {t(
              "This action will mark the order as CANCELLED. This status change CANNOT be reverted. Are you sure you want to proceed?",
              "Cette action marquera la commande comme ANNULÉE. Ce changement de statut NE PEUT PAS être annulé. Êtes-vous sûr de vouloir continuer ?"
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Cancel", "Annuler")}
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {t("Confirm Cancellation", "Confirmer l'annulation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
