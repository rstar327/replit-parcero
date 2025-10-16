import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Mail,
  Zap,
  Shield,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import Header from "@/components/layout/header";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send magic link");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setMagicLinkSent(true);
      toast({
        title: language === "en" ? "Magic link sent!" : "¡Enlace mágico enviado!",
        description: language === "en" 
          ? "Check your email and click the link to log in."
          : "Revisa tu email y haz clic en el enlace para iniciar sesión.",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "en" ? "Failed to send magic link" : "Error al enviar enlace",
        description: error.message || (language === "en" 
          ? "There was an error sending the magic link."
          : "Hubo un error al enviar el enlace mágico."),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: language === "en" ? "Email required" : "Email requerido",
        description: language === "en" 
          ? "Please enter your email address."
          : "Por favor ingresa tu dirección de email.",
        variant: "destructive",
      });
      return;
    }
    magicLinkMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={language === "en" ? "Welcome Back" : "Bienvenido de Nuevo"} 
        subtitle={language === "en" ? "Enter your email to receive a magic login link" : "Ingresa tu email para recibir un enlace de acceso"} 
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              {language === "en" ? "Welcome Back" : "Bienvenido de Nuevo"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === "en" 
                ? "Enter your email to receive a magic login link"
                : "Ingresa tu email para recibir un enlace de acceso"}
            </p>
          </div>

          {/* Login Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {language === "en" ? "Magic Link Login" : "Acceso con Enlace"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!magicLinkSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === "en" ? "Email Address" : "Dirección de Email"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={language === "en" ? "Enter your email" : "Ingresa tu email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={magicLinkMutation.isPending}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#CDEDF6] hover:bg-[#A5D6E8] text-black"
                    disabled={magicLinkMutation.isPending}
                  >
                    {magicLinkMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        {language === "en" ? "Sending..." : "Enviando..."}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {language === "en" ? "Send Magic Link" : "Enviar Enlace"}
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {language === "en" ? "Check your email!" : "¡Revisa tu email!"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {language === "en" 
                        ? "We've sent a magic link to your email address. Click the link to log in."
                        : "Hemos enviado un enlace mágico a tu email. Haz clic en el enlace para acceder."}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMagicLinkSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    {language === "en" ? "Send Another Link" : "Enviar Otro Enlace"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm">
                  {language === "en" ? "Secure & Passwordless" : "Seguro y Sin Contraseñas"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" 
                    ? "No passwords to remember - just click the link in your email"
                    : "Sin contraseñas que recordar - solo haz clic en el enlace"}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Don't have an account?" : "¿No tienes una cuenta?"}{" "}
              <Link href="/signup">
                <Button variant="link" className="p-0 h-auto text-primary">
                  {language === "en" ? "Sign Up" : "Registrarse"}
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}