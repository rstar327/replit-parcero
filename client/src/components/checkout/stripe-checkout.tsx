import React, { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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

interface CheckoutFormProps {
  planDetails: PlanDetails;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ planDetails, userId, onSuccess, onCancel }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinueToStripe = async () => {
    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        userId,
        planType: planDetails.priceId // Plan type (apprentice, expert, guru)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe's hosted checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Plan Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{planDetails.name}</CardTitle>
            {planDetails.popular && (
              <Badge className="bg-[#2F6A75] text-[#ffffff]">Most Popular</Badge>
            )}
          </div>
          <CardDescription>
            ${planDetails.price}/month - billed monthly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planDetails.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check 
                  className={`h-4 w-4 ${
                    feature.included ? "text-green-500" : "text-gray-300"
                  }`} 
                />
                <span className={feature.included ? "" : "text-gray-400 line-through"}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checkout Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Subscribe?</CardTitle>
          <CardDescription>
            You'll be redirected to Stripe's secure checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ✓ Secure payment processing by Stripe<br/>
                ✓ Multiple payment methods accepted<br/>
                ✓ Cancel anytime from your dashboard
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-subscription"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinueToStripe}
                disabled={isProcessing}
                className="flex-1 bg-[#2F6A75] hover:opacity-90 text-[#ffffff]"
                data-testid="button-confirm-subscription"
              >
                {isProcessing ? "Creating checkout..." : `Continue to Stripe - $${planDetails.price}/month`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StripeCheckoutProps {
  planDetails: PlanDetails;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripeCheckout = ({ planDetails, userId, onSuccess, onCancel }: StripeCheckoutProps) => {
  // Directly render the checkout form since we no longer need Stripe Elements wrapper
  return (
    <CheckoutForm
      planDetails={planDetails}
      userId={userId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};