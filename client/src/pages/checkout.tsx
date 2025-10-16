import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Shield, 
  CreditCard, 
  CheckCircle, 
  Loader2,
  Lock,
  Star,
  Check,
  X,
  Globe
} from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";

// Load Stripe outside component to avoid recreating on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('❌ Missing VITE_STRIPE_PUBLIC_KEY environment variable');
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

console.log('🔑 Loading Stripe with public key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY?.substring(0, 12) + '...');

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  .then(stripe => {
    if (stripe) {
      console.log('✅ Stripe loaded successfully');
    } else {
      console.error('❌ Failed to load Stripe - check your public key');
    }
    return stripe;
  })
  .catch(error => {
    console.error('❌ Stripe loading error:', error);
    throw error;
  });

// Plan details mapping with translations
const getPlanDetails = (language: string) => ({
  apprentice: {
    name: language === "en" ? "Apprentice" : "Aprendiz",
    price: 15,
    period: language === "en" ? "per month" : "al mes",
    description: language === "en" ? "100 learning tokens included" : "100 tokens de aprendizaje incluidos",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: false },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: false },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: false },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: false }
    ],
    popular: false
  },
  expert: {
    name: language === "en" ? "Expert" : "Experto", 
    price: 30,
    period: language === "en" ? "per month" : "al mes",
    description: language === "en" ? "250 learning tokens included" : "250 tokens de aprendizaje incluidos",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: true },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: true },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: false },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: false }
    ],
    popular: false
  },
  guru: {
    name: language === "en" ? "Guru" : "Gurú",
    price: 42, 
    period: language === "en" ? "per month" : "al mes",
    description: language === "en" ? "500 learning tokens included" : "500 tokens de aprendizaje incluidos",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: true },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: true },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: true },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: true }
    ],
    popular: true
  },
  "apprentice-yearly": {
    name: language === "en" ? "Apprentice (Yearly)" : "Aprendiz (Anual)",
    price: 150,
    period: language === "en" ? "per year" : "al año",
    description: language === "en" ? "100 learning tokens included monthly + 2 months FREE" : "100 tokens de aprendizaje incluidos mensualmente + 2 meses GRATIS",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: false },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: false },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: false },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: false }
    ],
    popular: false
  },
  "expert-yearly": {
    name: language === "en" ? "Expert (Yearly)" : "Experto (Anual)",
    price: 300,
    period: language === "en" ? "per year" : "al año",
    description: language === "en" ? "250 learning tokens included monthly + 2 months FREE" : "250 tokens de aprendizaje incluidos mensualmente + 2 meses GRATIS",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: true },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: true },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: false },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: false }
    ],
    popular: false
  },
  "guru-yearly": {
    name: language === "en" ? "Guru (Yearly)" : "Gurú (Anual)",
    price: 420,
    period: language === "en" ? "per year" : "al año",
    description: language === "en" ? "500 learning tokens included monthly + 2 months FREE" : "500 tokens de aprendizaje incluidos mensualmente + 2 meses GRATIS",
    features: [
      { name: language === "en" ? "Access to all courses" : "Acceso a todos los cursos", included: true },
      { name: language === "en" ? "Community forums access" : "Acceso a foros de la comunidad", included: true },
      { name: language === "en" ? "Progress tracking" : "Seguimiento de progreso", included: true },
      { name: language === "en" ? "Token rewards system" : "Sistema de recompensas con tokens", included: true },
      { name: language === "en" ? "Expert seminars" : "Seminarios de expertos", included: true },
      { name: language === "en" ? "Exclusive networking events" : "Eventos exclusivos de networking", included: true },
      { name: language === "en" ? "Mastermind groups" : "Grupos mastermind", included: true },
      { name: language === "en" ? "One-on-one mentoring" : "Mentoría uno a uno", included: true }
    ],
    popular: true
  }
});

interface CheckoutFormProps {
  clientSecret: string;
  planType: string;
  onSuccess: () => void;
}

function CheckoutForm({ clientSecret, planType, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("en");
  const [, setLocation] = useLocation();

  const planDetails = getPlanDetails(language);
  const plan = planDetails[planType as keyof typeof planDetails];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?success=true`,
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Payment Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa]">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-[#fff]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <img 
              src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
              alt="Parcero.eco" 
              className="rounded object-contain"
              style={{ height: '42px', width: 'auto' }}
              data-testid="logo"
            />
            
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/pricing')}
              className="hover:bg-[#CDEDF6]"
              data-testid="button-back-to-pricing"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "en" ? "Back to Pricing" : "Volver a Precios"}
            </Button>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-[#CDEDF6]" data-testid="button-language-switcher">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "EN" : "ES"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="language-english">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="language-spanish">
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "en" ? "Start Learning in the Next 60 Seconds" : "Empieza a Aprender en los Próximos 60 Segundos"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "en" 
                ? "Complete payment and instantly access courses, community, and your first tokens"
                : "Completa el pago y accede al instante a cursos, comunidad y tus primeros tokens"
              }
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Summary - Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card className={`relative ${
                plan.popular 
                  ? 'border-2 border-primary shadow-lg' 
                  : 'border border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      {language === "en" ? "Most Popular" : "Más Popular"}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold mb-2 text-primary">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{language === "en" ? plan.period : "al mes"}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'font-medium' : 'text-muted-foreground line-through opacity-60'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{language === "en" ? "30-day money-back guarantee" : "Garantía de devolución de 30 días"}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{language === "en" ? "SSL encrypted payments" : "Pagos encriptados con SSL"}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{language === "en" ? "Cancel anytime" : "Cancela cuando quieras"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form - Right Columns */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>{language === "en" ? "Payment Information" : "Información de Pago"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-muted/20 p-6 rounded-lg">
                      <PaymentElement 
                        options={{
                          layout: "tabs",
                          fields: {
                            billingDetails: {
                              address: {
                                country: "never"
                              }
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-semibold mb-1">
                            {language === "en" ? "Secure Payment" : "Pago Seguro"}
                          </p>
                          <p>
                            {language === "en" 
                              ? "Your payment information is encrypted, secured and processed by stripe."
                              : "Tu información de pago está encriptada y procesada de forma segura por Stripe."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!stripe || isProcessing}
                      className="w-full bg-[#2F6A75] hover:opacity-90 text-[#ffffff] py-6 text-lg font-semibold"
                      data-testid="button-complete-payment"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {language === "en" ? "Processing Payment..." : "Procesando Pago..."}
                        </>
                      ) : (
                        <>
                          {language === "en" 
                            ? `Complete Payment - $${plan.price}/month`
                            : `Completar Pago - $${plan.price} al mes`
                          }
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {language === "en" 
                        ? "By completing this purchase, you agree to our Terms of Service and Privacy Policy. Your subscription will auto-renew monthly until cancelled."
                        : "Al completar esta compra, aceptas nuestros Términos de Servicio y Política de Privacidad. Tu suscripción se renovará automáticamente cada mes hasta que la canceles."
                      }
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [planType, setPlanType] = useState("");
  const { language } = useLanguage();

  // Get plan type from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const tempPlanDetails = getPlanDetails("en");
    if (!plan || !tempPlanDetails[plan as keyof typeof tempPlanDetails]) {
      toast({
        title: "Invalid Plan",
        description: "Please select a valid plan from our pricing page.",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }
    setPlanType(plan);
  }, [setLocation, toast]);

  // State to track if user is logged out
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  const { isConnected, disconnectWallet } = useWeb3();

  // Fetch user profile to get user ID - only when connected and not logged out
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected && !isLoggedOut,
  });

  // Create payment intent when plan is selected
  useEffect(() => {
    if (planType) {
      console.log('Creating payment intent for plan:', planType);
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest("POST", "/api/create-subscription-payment", {
            userId: "user-1", // In real app, get from auth context
            planType: planType
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Payment intent creation failed:', errorData);
            // Use the detailed error message if available
            throw new Error(errorData.details || errorData.error || "Failed to create payment intent");
          }

          const data = await response.json();
          console.log('Payment intent created successfully:', data);
          setClientSecret(data.clientSecret);
        } catch (error: any) {
          console.error('Error creating payment intent:', error);
          // Parse error response
          let errorMessage = error.message || "Failed to initialize payment. Please try again.";
          
          // Check if it's a configuration error
          if (error.message?.includes("not fully configured") || error.message?.includes("Payment processing")) {
            errorMessage = language === "en" 
              ? "Payment processing is being set up. Please try again later or contact support."
              : "El procesamiento de pagos está siendo configurado. Por favor intenta más tarde o contacta soporte.";
          }
          
          toast({
            title: language === "en" ? "Payment Error" : "Error de Pago",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Delay redirect to let user read the error
          setTimeout(() => {
            setLocation('/pricing');
          }, 3000);
        }
      };

      createPaymentIntent();
    }
  }, [planType, setLocation, toast, language]);

  const handleSuccess = () => {
    toast({
      title: language === "en" ? "Payment Successful!" : "¡Pago Exitoso!",
      description: language === "en" 
        ? "Welcome to Parcero.eco! Your subscription is now active."
        : "¡Bienvenido a Parcero.eco! Tu suscripción está activa.",
    });
    setLocation('/dashboard?success=true');
  };

  if (!planType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "en" ? "Preparing your checkout..." : "Preparando tu pago..."}
          </p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#00BFA5',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance
      }}
    >
      <CheckoutForm 
        clientSecret={clientSecret}
        planType={planType}
        onSuccess={handleSuccess}
      />
    </Elements>
  );
}