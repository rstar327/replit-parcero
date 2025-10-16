import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Menu, 
  X, 
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Globe,
  Bell,
  User,
  LogOut,
  BarChart3,
  Wallet,
  Loader2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { YouTubeVideo } from "@/components/ui/youtube-video";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-context";

export default function RefundPolicy() {
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { language, setLanguage } = useLanguage();

  // State to track if user is logged out
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  // Fetch user profile for avatar - only when connected and not logged out
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected && !isLoggedOut,
  });

  // Fetch CMS content for refund policy page
  const { data: cmsPages } = useQuery({
    queryKey: ["/api/cms/pages"],
    enabled: true,
  });

  // Get refund policy page content from CMS
  const refundPage = Array.isArray(cmsPages) ? cmsPages.find((page: any) => page.slug === 'refund-policy' && page.language === language) : null;
  const pageContent = refundPage?.content;

  const handleLogout = async () => {
    try {
      // Set logout state
      setIsLoggedOut(true);
      localStorage.setItem('userLoggedOut', 'true');
      
      // Disconnect wallet to clear authentication state
      await disconnectWallet();
      
      // Redirect to home page
      setLocation('/');  
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToPricing = () => {
    setLocation('/pricing');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b sticky top-0 z-50 bg-[#fff]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <img 
                src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
                alt="Parcero.eco" 
                className="rounded object-contain cursor-pointer"
                style={{ height: '42px', width: 'auto' }}
              />
            </Link>
            
            {/* Search Bar and Navigation */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "en" ? "Search courses..." : "Buscar cursos..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-9 bg-white dark:bg-background"
                  data-testid="input-search-courses"
                />
              </div>
              <Link href="/public-courses">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-courses">{language === "en" ? "Courses" : "Cursos"}</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-pricing">{language === "en" ? "Pricing" : "Precios"}</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* PARCERO Balance */}
            <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg" data-testid="header-balance">
              <span className="text-sm font-bold text-primary">
                {tokenInfo?.balance ? Math.floor(parseFloat(tokenInfo.balance)).toLocaleString() : "0"}
              </span>
              <span className="text-xs text-muted-foreground">
                PARCERO
              </span>
            </div>
            
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#CDEDF6]"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
            
            {/* Language Switcher */}
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
            
            {/* Profile Dropdown/Mobile Menu */}
            {profileData ? (
              <>
                {/* Desktop Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all" data-testid="profile-photo">
                        {(profileData as any)?.avatar && (
                          <AvatarImage 
                            src={`/objects/${(profileData as any).avatar.replace('/objects/', '')}`} 
                            alt="Profile" 
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{language === "en" ? "Dashboard" : "Panel"}</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]">
                          <User className="mr-2 h-4 w-4" />
                          <span>{language === "en" ? "Profile" : "Perfil"}</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-[#CDEDF6]">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{language === "en" ? "Log out" : "Cerrar sesión"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Sheet */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="mobile-menu-button">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <nav className="flex flex-col space-y-4">
                        <Link href="/public-courses">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            {language === "en" ? "Courses" : "Cursos"}
                          </Button>
                        </Link>
                        <Link href="/pricing">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            {language === "en" ? "Pricing" : "Precios"}
                          </Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            {language === "en" ? "Dashboard" : "Panel"}
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            {language === "en" ? "Profile" : "Perfil"}
                          </Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          {language === "en" ? "Log out" : "Cerrar sesión"}
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-button">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && !profileData && (
          <div className="md:hidden py-4 border-t bg-white">
            <div className="container mx-auto px-4 flex flex-col space-y-2">
              <Link href="/public-courses">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-courses">
                  {language === "en" ? "Courses" : "Cursos"}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-pricing">
                  {language === "en" ? "Pricing" : "Precios"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* Header - CMS Connected */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{refundPage?.title || (language === "en" ? "Refund & Return Policy" : "Política de Reembolso y Devolución")}</h1>
          <div className="max-w-3xl mx-auto">
            {pageContent?.text ? (
              <div className="prose prose-lg max-w-none">
                {pageContent.text.split('\n').map((paragraph: string, index: number) => {
                  if (!paragraph.trim()) return null;
                  
                  // Check if paragraph contains a YouTube URL
                  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#\s]+)/;
                  const match = paragraph.match(youtubePattern);
                  
                  if (match) {
                    return (
                      <div key={index} className="mb-4">
                        <YouTubeVideo url={paragraph.trim()} />
                      </div>
                    );
                  }
                  
                  return <p key={index} className="text-xl text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
                })}
              </div>
            ) : (
              <p className="text-xl text-muted-foreground">{language === "en" ? "We want you to be completely satisfied with your subscription so here's everything you need to know about our refund and return policy." : "Queremos que estés completamente satisfecho con tu suscripción, así que aquí está todo lo que necesitas saber sobre nuestra política de reembolso y devolución."}</p>
            )}
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 30-Day Money Back Guarantee */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{language === "en" ? "30-Day Money-Back Guarantee" : "Garantía de Devolución de 30 Días"}</CardTitle>
                  <CardDescription>{language === "en" ? "Try our platform risk-free" : "Prueba nuestra plataforma sin riesgo"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {language === "en" 
                  ? "We offer a full 30-day money-back guarantee for all new subscriptions. If you're not completely satisfied with your Parcero.eco experience, you can request a full refund within 30 days of your initial subscription date."
                  : "Ofrecemos una garantía completa de devolución de dinero de 30 días para todas las nuevas suscripciones. Si no estás completamente satisfecho con tu experiencia en Parcero.eco, puedes solicitar un reembolso completo dentro de los 30 días posteriores a tu fecha de suscripción inicial."}
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>{language === "en" ? "What's included:" : "Qué incluye:"}</strong> {language === "en" 
                    ? "Full access to all courses, community features, and token rewards during your trial period. If you're not happy, get 100% of your money back."
                    : "Acceso completo a todos los cursos, funciones de la comunidad y recompensas de tokens durante tu período de prueba. Si no estás satisfecho, recupera el 100% de tu dinero."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{language === "en" ? "How to Request a Refund" : "Cómo Solicitar un Reembolso"}</CardTitle>
                  <CardDescription>{language === "en" ? "Simple 3-step process" : "Proceso simple de 3 pasos"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">{language === "en" ? "Contact Support" : "Contactar Soporte"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Reach out via WhatsApp, email, or our dashboard support system" : "Contáctanos vía WhatsApp, correo electrónico o nuestro sistema de soporte del panel"}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">{language === "en" ? "Provide Details" : "Proporcionar Detalles"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Share your subscription details and reason for refund request" : "Comparte los detalles de tu suscripción y el motivo de tu solicitud de reembolso"}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">{language === "en" ? "Get Refunded" : "Recibir Reembolso"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Receive your full refund within 5-7 business days" : "Recibe tu reembolso completo en 5-7 días hábiles"}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{language === "en" ? "Contact Information:" : "Información de Contacto:"}</strong><br/>
                  • WhatsApp: +57 315 117 7633
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Cancellation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2F6A75]/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#2F6A75]" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{language === "en" ? "Subscription Cancellation" : "Cancelación de Suscripción"}</CardTitle>
                  <CardDescription>{language === "en" ? "Cancel anytime, no questions asked" : "Cancela en cualquier momento, sin preguntas"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {language === "en" ? "You can cancel your subscription at any time from your dashboard. When you cancel:" : "Puedes cancelar tu suscripción en cualquier momento desde tu panel. Cuando canceles:"}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{language === "en" ? "You'll continue to have access until the end of your current billing period" : "Continuarás teniendo acceso hasta el final de tu período de facturación actual"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{language === "en" ? "No additional charges will be made" : "No se realizarán cargos adicionales"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{language === "en" ? "You can reactivate your subscription anytime" : "Puedes reactivar tu suscripción en cualquier momento"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{language === "en" ? "Your progress and tokens earned are preserved" : "Tu progreso y los tokens ganados se conservan"}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Special Cases */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{language === "en" ? "Important Notes" : "Notas Importantes"}</CardTitle>
                  <CardDescription>{language === "en" ? "Special circumstances and conditions" : "Circunstancias y condiciones especiales"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{language === "en" ? "Token Rewards" : "Recompensas de Tokens"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Any PARCERO tokens earned during your subscription period remain yours to keep, even after cancellation or refund. These are stored on the blockchain and cannot be revoked."
                      : "Cualquier token PARCERO ganado durante tu período de suscripción sigue siendo tuyo, incluso después de la cancelación o reembolso. Estos están almacenados en la blockchain y no pueden ser revocados."}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{language === "en" ? "Course Progress" : "Progreso del Curso"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Your learning progress and certificates earned are permanently saved to your account. If you resubscribe later, you'll pick up exactly where you left off."
                      : "Tu progreso de aprendizaje y los certificados obtenidos se guardan permanentemente en tu cuenta. Si te vuelves a suscribir más tarde, continuarás exactamente donde lo dejaste."}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{language === "en" ? "Refund Processing Time" : "Tiempo de Procesamiento del Reembolso"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Refunds are processed back to your original payment method. Credit card refunds typically take 5-7 business days to appear, while other payment methods may vary."
                      : "Los reembolsos se procesan a tu método de pago original. Los reembolsos de tarjeta de crédito generalmente tardan de 5 a 7 días hábiles en aparecer, mientras que otros métodos de pago pueden variar."}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{language === "en" ? "Fair Use Policy" : "Política de Uso Justo"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Our refund policy is designed for genuine dissatisfaction. Abuse of the refund system (such as repeatedly subscribing and requesting refunds) may result in account restrictions."
                      : "Nuestra política de reembolso está diseñada para casos de insatisfacción genuina. El abuso del sistema de reembolso (como suscribirse repetidamente y solicitar reembolsos) puede resultar en restricciones de cuenta."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{language === "en" ? "Need Help?" : "¿Necesitas Ayuda?"}</CardTitle>
              <CardDescription>
                {language === "en" ? "Our support team is here to help you with any questions about refunds or cancellations" : "Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta sobre reembolsos o cancelaciones"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Before requesting a refund, consider reaching out to our support team. We're often able to resolve issues and help you get the most out of your subscription."
                  : "Antes de solicitar un reembolso, considera contactar a nuestro equipo de soporte. A menudo podemos resolver problemas y ayudarte a aprovechar al máximo tu suscripción."}
              </p>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => window.open('https://wa.me/573151177633', '_blank')}
                  className="bg-[#25D366] hover:bg-[#20b456] text-white"
                  data-testid="button-whatsapp-support"
                >
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  {language === "en" ? "WhatsApp Support" : "Soporte por WhatsApp"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
}