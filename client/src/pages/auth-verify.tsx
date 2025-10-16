import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Zap } from "lucide-react";
import { Link } from "wouter";

export default function AuthVerify() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token and email from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link. Missing token or email.');
          return;
        }

        // Call backend verification endpoint
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          // Store user data in localStorage for session management
          localStorage.setItem('user_data', JSON.stringify(result.user));
          localStorage.removeItem('userLoggedOut'); // Clear logout flag
          
          setStatus('success');
          setMessage('Email verified successfully! Welcome to Parcero.eco');
          
          toast({
            title: "Email verified!",
            description: `Welcome back, ${result.user.username || result.user.fullName}!`,
          });

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            setLocation('/dashboard');
          }, 1500);
        } else {
          throw new Error(result.error || 'Verification failed');
        }

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify your email. Please try again or request a new magic link.');
        
        toast({
          title: "Verification failed",
          description: "There was an error verifying your email. Please try again.",
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 border-b border-[#eaf8fb] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <img 
              src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
              alt="Parcero.eco" 
              className="rounded object-contain hover:opacity-80 transition-opacity cursor-pointer"
              style={{ height: '42px', width: 'auto' }}
            />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24 max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {status === 'verifying' && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              {status === 'success' && <CheckCircle className="w-6 h-6 text-primary" />}
              {status === 'error' && <XCircle className="w-6 h-6 text-destructive" />}
              <span>
                {status === 'verifying' && 'Verifying Your Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {message || 'Please wait while we verify your email address...'}
            </p>
            
            {status === 'verifying' && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    🎉 You're all set! Redirecting to your dashboard...
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation('/dashboard')}
                  className="w-full"
                  data-testid="button-go-to-dashboard"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">
                    Don't worry, you can request a new magic link to try again.
                  </p>
                </div>
                <Link href="/signup">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-try-again"
                  >
                    Try Again
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}