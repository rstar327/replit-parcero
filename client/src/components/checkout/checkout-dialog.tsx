import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StripeCheckout } from "./stripe-checkout";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanDetails {
  name: string;
  price: number;
  priceId: string;
  features: PlanFeature[];
  popular?: boolean;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planDetails: PlanDetails | null;
  userId: string;
  onSuccess: () => void;
}

export const CheckoutDialog = ({ 
  isOpen, 
  onClose, 
  planDetails, 
  userId, 
  onSuccess 
}: CheckoutDialogProps) => {
  if (!planDetails) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {planDetails.name}</DialogTitle>
          <DialogDescription>
            Complete your subscription to unlock all premium features
          </DialogDescription>
        </DialogHeader>
        
        <StripeCheckout
          planDetails={planDetails}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};