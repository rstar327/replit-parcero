import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Zap, 
  Users, 
  BookOpen, 
  Coins, 
  Shield,
  Mail
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { useLanguage } from "@/contexts/language-context";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: "",
    agreeToTerms: false
  });
  
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send test email");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test email sent!",
        description: `Test email sent successfully. Message ID: ${data.messageId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "There was an error sending the test email.",
        variant: "destructive",
      });
    },
  });

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/register", {
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
        title: "Magic link sent!",
        description: "Check your email for a secure login link. Click it to access your account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send magic link",
        description: error.message || "There was an error sending the magic link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms of service",
        description: "Please agree to the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }
    
    magicLinkMutation.mutate(formData.email);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResendMagicLink = () => {
    magicLinkMutation.mutate(formData.email);
  };

  const benefits = [
    {
      icon: Coins,
      title: "Earn PARCERO Tokens",
      description: "Get rewarded with cryptocurrency for completing courses and achieving milestones"
    },
    {
      icon: BookOpen,
      title: "Access Premium Courses",
      description: "Learn practical skills in finance, business, communication, and more"
    },
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with thousands of learners and share your knowledge"
    },
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "All your achievements are secured and verified on the Polygon blockchain"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={language === "en" ? "Join Parcero.eco" : "Únete a Parcero.eco"} 
        subtitle={language === "en" ? "Join the community of learners mastering practical skills while earning cryptocurrency rewards" : "Únete a la comunidad de estudiantes que dominan habilidades prácticas mientras ganan recompensas en criptomonedas"} 
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's get to know you</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">Join the community of learners mastering practical skills while earning cryptocurrency rewards.</p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-4" data-testid={`benefit-${index}`}>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            
          </div>
          
          {/* Right Side - Signup Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{magicLinkSent ? "Check Your Email" : "Join Parcero.eco"}</CardTitle>
                <p className="text-muted-foreground">
                  {magicLinkSent ? "We sent you a secure login link" : "Enter your email for a passwordless login"}
                </p>
              </CardHeader>
              
              <CardContent>
                {magicLinkSent ? (
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        We sent a secure login link to:
                      </p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Click the link in your email to instantly access your account. No password needed!
                      </p>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          onClick={handleResendMagicLink}
                          variant="outline"
                          disabled={magicLinkMutation.isPending}
                          data-testid="button-resend-magic-link"
                        >
                          {magicLinkMutation.isPending ? "Sending..." : "Resend Link"}
                        </Button>
                        <Button 
                          onClick={() => setMagicLinkSent(false)}
                          variant="ghost"
                          size="sm"
                          data-testid="button-change-email"
                        >
                          Change Email Address
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10"
                          data-testid="input-email"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Terms Agreement */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                        data-testid="checkbox-terms"
                      />
                      <div className="text-sm leading-5">
                        <Label htmlFor="agreeToTerms" className="cursor-pointer">
                          I agree to the{" "}
                          <Button variant="link" className="p-0 h-auto text-primary" data-testid="link-terms">
                            Terms of Service
                          </Button>{" "}
                          and{" "}
                          <Button variant="link" className="p-0 h-auto text-primary" data-testid="link-privacy">
                            Privacy Policy
                          </Button>
                        </Label>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg"
                      disabled={magicLinkMutation.isPending}
                      data-testid="button-send-magic-link"
                    >
                      {magicLinkMutation.isPending ? "Sending Magic Link..." : "Send Magic Link"}
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>✨ No password required - we'll send you a secure login link</p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}