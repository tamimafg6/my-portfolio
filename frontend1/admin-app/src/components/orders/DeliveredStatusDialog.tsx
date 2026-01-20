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

interface DeliveredStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber?: string;
}

export function DeliveredStatusDialog({
  open,
  onClose,
  onConfirm,
  orderNumber,
}: DeliveredStatusDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t("Mark as Delivered", "Marquer comme livré")}
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
              "This action will mark the order as DELIVERED. This status change CANNOT be reverted. Are you sure you want to proceed?",
              "Cette action marquera la commande comme LIVRÉE. Ce changement de statut NE PEUT PAS être annulé. Êtes-vous sûr de vouloir continuer ?"
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Cancel", "Annuler")}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {t("Confirm Delivery", "Confirmer la livraison")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
