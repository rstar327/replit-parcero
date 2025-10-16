import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Star,
  Users,
  BookOpen,
  Award,
  Zap,
  Shield,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

import { FaWhatsapp } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckoutDialog } from "@/components/checkout/checkout-dialog";
import { useLanguage } from "@/contexts/language-context";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";
export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { language } = useLanguage();

  // Check if user is logged out via localStorage
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  // Fetch user profile to check authentication status
  const { data: profileData, isError } = useQuery({
    queryKey: ["/api/profile/user-1"],
    retry: false,
    staleTime: 0,
  });

  // Determine if user is logged in
  const isLoggedIn = profileData && (profileData as any)?.id && !isLoggedOut;

  // Fetch CMS content for pricing page
  const { data: cmsPages } = useQuery({
    queryKey: ["/api/cms/pages"],
    enabled: true,
  });

  // Get pricing page content from CMS
  const pricingPage = (cmsPages as any[])?.find((page: any) => page.slug === 'pricing' && page.language === language);
  const heroText = pricingPage?.content?.text || (language === "en" ? "Master any skill through peer exchange. Join the revolution, earn while you learn." : "Domina cualquier habilidad a través del intercambio entre pares. Únete a la revolución, gana mientras aprendes.");


  const handlePlanSelect = (plan: any) => {
    const selectedPriceId = isYearly ? plan.yearlyPriceId : plan.priceId;
    console.log('🛒 Plan selected:', {
      planName: plan.name,
      priceId: selectedPriceId,
      isYearly,
      isLoggedIn
    });

    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('🔐 User not logged in, redirecting to signup');
      // Redirect to signup page for unauthenticated users
      window.location.href = '/signup';
      return;
    }

    // Navigate to checkout page with plan parameter for authenticated users
    window.location.href = `/checkout?plan=${selectedPriceId}`;
  };



  const plans = [
    {
      name: language === "en" ? "Apprentice" : "Aprendiz",
      price: 15,
      yearlyPrice: 150, // 12 months for the price of 10
      period: language === "en" ? "per month" : "al mes",
      yearlyPeriod: language === "en" ? "per year" : "al año",
      description: language === "en" ? "100 learning tokens included" : "100 tokens de aprendizaje incluidos",
      priceId: "apprentice", // Monthly Stripe price ID
      yearlyPriceId: "apprentice-yearly", // Yearly Stripe price ID (handled by backend)
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
      popular: false,
      cta: language === "en" ? "Continue with Apprentice" : "Continuar con Aprendiz"
    },
    {
      name: language === "en" ? "Expert" : "Experto",
      price: 30,
      yearlyPrice: 300, // 12 months for the price of 10
      period: language === "en" ? "per month" : "al mes",
      yearlyPeriod: language === "en" ? "per year" : "al año", 
      description: language === "en" ? "250 learning tokens included" : "250 tokens de aprendizaje incluidos",
      priceId: "expert", // Monthly Stripe price ID
      yearlyPriceId: "expert-yearly", // Yearly Stripe price ID (handled by backend)
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
      popular: false,
      cta: language === "en" ? "Continue with Expert" : "Continuar con Experto"
    },
    {
      name: language === "en" ? "Guru" : "Gurú",
      price: 42,
      yearlyPrice: 420, // 12 months for the price of 10
      period: language === "en" ? "per month" : "al mes",
      yearlyPeriod: language === "en" ? "per year" : "al año",
      description: language === "en" ? "500 learning tokens included" : "500 tokens de aprendizaje incluidos",
      priceId: "guru", // Monthly Stripe price ID
      yearlyPriceId: "guru-yearly", // Yearly Stripe price ID (handled by backend)
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
      popular: true,
      cta: language === "en" ? "Continue with Guru" : "Continuar con Gurú"
    }
  ];

  const faqs = [
    {
      question: language === "en" ? "How does the token reward system work?" : "¿Cómo funciona el sistema de recompensas con tokens?",
      answer: language === "en" 
        ? "Complete courses and earn PARCERO tokens on the Polygon blockchain. These tokens can be used for advanced courses, exclusive content, or traded on supported exchanges."
        : "Completa cursos y gana tokens PARCERO en la blockchain de Polygon. Estos tokens pueden usarse para cursos avanzados, contenido exclusivo o intercambiarse en exchanges compatibles."
    },
    {
      question: language === "en" ? "Can I cancel my subscription anytime?" : "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer: language === "en"
        ? "Yes, you can cancel your subscription at any time. You'll retain access to the features in your plan until the end of your billing cycle."
        : "Sí, puedes cancelar tu suscripción en cualquier momento. Mantendrás acceso a las funciones de tu plan hasta el final de tu ciclo de facturación."
    },
    {
      question: language === "en" ? "Do you offer refunds?" : "¿Ofrecen reembolsos?",
      answer: language === "en"
        ? "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund. You can find more information on our refund policy page."
        : "Ofrecemos una garantía de devolución de dinero de 30 días. Si no estás satisfecho, contacta a nuestro equipo de soporte para un reembolso completo. Puedes encontrar más información en nuestra página de política de reembolso."
    },
    {
      question: language === "en" ? "Do you have Enterprise pricing?" : "¿Tienen precios para empresas?",
      answer: language === "en"
        ? "Enterprise pricing is customized based on your team size, specific needs, and required integrations. Contact our sales team for a detailed quote."
        : "Los precios para empresas se personalizan según el tamaño de tu equipo, necesidades específicas e integraciones requeridas. Contacta a nuestro equipo de ventas para una cotización detallada."
    },
    {
      question: language === "en" ? "Are the certificates recognized?" : "¿Los certificados son reconocidos?",
      answer: language === "en"
        ? "Our certificates are blockchain-verified and designed to demonstrate practical skills completion. We're establishing PARCERO as a trusted credential that is gaining recognition as more professionals join our peer-to-peer learning community."
        : "Nuestros certificados están verificados en blockchain y diseñados para demostrar la finalización de habilidades prácticas. Estamos estableciendo PARCERO como una credencial confiable que está ganando reconocimiento a medida que más profesionales se unen a nuestra comunidad de aprendizaje entre pares."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card pt-[60px] pb-[60px]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">{language === "en" ? "From zero to Parcero" : "De cero a Parcero"}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">{heroText}</p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Pricing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-muted p-1 rounded-lg">
              <div 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  !isYearly 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsYearly(false)}
                data-testid="pricing-monthly"
              >
                {language === "en" ? "Monthly" : "Mensual"}
              </div>
              <div 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  isYearly 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsYearly(true)}
                data-testid="pricing-yearly"
              >
                {language === "en" ? "Annual" : "Anual"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative hover:shadow-lg transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-lg scale-105' 
                    : 'border border-border hover:border-primary/50'
                }`}
                data-testid={`pricing-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      {language === "en" ? "Best Value" : "Mejor Valor"}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold mb-2 text-primary">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /{isYearly ? plan.yearlyPeriod : plan.period}
                    </span>
                    {isYearly && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {language === "en" ? "Save 2 months!" : "¡Ahorra 2 meses!"}
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
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
                  
                  <Button 
                    className="w-full bg-[#2F6A75] hover:opacity-90 text-[#ffffff]"
                    onClick={() => handlePlanSelect(plan)}
                    data-testid={`button-${plan.name.toLowerCase()}-plan`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{language === "en" ? "Frequently Asked Questions" : "Preguntas Frecuentes"}</h2>
            <p className="text-xl text-muted-foreground">
              {language === "en" ? "Got questions? We've got answers." : "¿Tienes preguntas? Tenemos respuestas."}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {(faq.question === "Do you offer refunds?" || faq.question === "¿Ofrecen reembolsos?") ? (
                      <>
                        {language === "en" 
                          ? "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund. You can find more information on our "
                          : "Ofrecemos una garantía de devolución de dinero de 30 días. Si no estás satisfecho, contacta a nuestro equipo de soporte para un reembolso completo. Puedes encontrar más información en nuestra "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary underline" 
                          onClick={() => window.location.href = '/refund-policy'}
                          data-testid="link-refund-policy"
                        >
                          {language === "en" ? "refund policy page" : "página de política de reembolso"}
                        </Button>
                        .
                      </>
                    ) : (
                      faq.answer
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#000]">
              {language === "en" ? "Ready to Start Earning While Learning?" : "¿Listo para Empezar a Ganar Mientras Aprendes?"}
            </h2>
            <p className="text-xl opacity-90 mb-8 text-[#000]">{language === "en" ? "Join the community of learners earning crypto tokens while building practical skills for the modern world." : "Únete a la comunidad de estudiantes que ganan tokens cripto mientras desarrollan habilidades prácticas para el mundo moderno."}</p>
            <div className="flex justify-center">
              <Link href="/public-courses">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" data-testid="button-start-learning-cta">
                  {language === "en" ? "Start Learning Today" : "Empieza a Aprender Hoy"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />

    </div>
  );
}