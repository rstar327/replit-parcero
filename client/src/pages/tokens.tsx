import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  Coins, 
  Trophy, 
  Star, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useLocation } from "wouter";

export default function Tokens() {
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  
  const {
    isConnected,
    account,
    tokenInfo,
    isLoading: web3Loading,
    error: web3Error,
    connectWallet,
    disconnectWallet,
    openPolygonScan,
    refreshBalance
  } = useWeb3();

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/users/user-1/tokens"],
    enabled: isConnected,
  });

  const { data: contractInfo } = useQuery<{
    address: string;
    symbol: string;
    network: string;
  }>({
    queryKey: ["/api/token/contract"],
  });

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const getEarningIcon = (type: string) => {
    switch (type) {
      case "earned":
        return Trophy;
      case "quiz_perfect":
        return Star;
      case "community_help":
        return Users;
      case "module_completion":
        return CheckCircle;
      default:
        return Coins;
    }
  };

  const getEarningColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-primary";
      case "quiz_perfect":
        return "text-accent";
      case "community_help":
        return "text-primary";
      case "module_completion":
        return "text-muted-foreground";
      default:
        return "text-primary";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-accent" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title={language === "en" ? "Token Rewards" : "Recompensas en Tokens"} 
          subtitle={language === "en" ? "Manage your PARCERO tokens and track your earnings" : "Gestiona tus tokens PARCERO y rastrea tus ganancias"}
          tokenBalance={tokenInfo?.balance || "0"}
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Earning Opportunities */}
          <Card data-testid="earning-opportunities-card">
            <CardHeader>
              <CardTitle data-testid="earning-opportunities-title">{language === "en" ? "How to Earn PARCERO Tokens" : "Cómo Ganar Tokens PARCERO"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center" data-testid="earn-course-completion">
                  <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{language === "en" ? "Complete Courses" : "Completa Cursos"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{language === "en" ? "Finish entire courses" : "Termina cursos completos"}</p>
                  <Badge variant="outline">10-20 PARCERO</Badge>
                </div>
                
                
                
                <div className="p-4 bg-primary/10 rounded-lg text-center" data-testid="earn-community-help">
                  <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{language === "en" ? "Help Community" : "Ayuda a la Comunidad"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{language === "en" ? "Practice with others" : "Practica con otros"}</p>
                  <Badge variant="outline">1-20 PARCERO</Badge>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg text-center" data-testid="earn-module-completion">
                  <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{language === "en" ? "Complete Modules" : "Completa Módulos"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{language === "en" ? "Each completed module" : "Cada módulo completado"}</p>
                  <Badge variant="outline">1 PARCERO</Badge>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg text-center" data-testid="earn-create-courses">
                  <Star className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{language === "en" ? "Create Courses" : "Crear Cursos"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{language === "en" ? "Author new courses" : "Crea nuevos cursos"}</p>
                  <Badge variant="outline">100-200 PARCERO</Badge>
                </div>

                
                
                
              </div>
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card data-testid="recent-earnings-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle data-testid="recent-earnings-title">{language === "en" ? "Recent Earnings" : "Ganancias Recientes"}</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-muted-foreground">{language === "en" ? "Loading earnings..." : "Cargando ganancias..."}</span>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.filter((transaction: any) => transaction.type === "earned").map((earning: any) => {
                    const Icon = getEarningIcon(earning.type);
                    const color = getEarningColor(earning.type);
                    return (
                      <div 
                        key={earning.id} 
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        data-testid={`earning-${earning.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 bg-background rounded-full ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-foreground" data-testid={`earning-title-${earning.id}`}>
                              <span className="font-medium" data-testid={`earning-description-${earning.id}`}>{earning.reason || "Token Earned"}</span>
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`earning-time-${earning.id}`}>
                              {formatTimestamp(earning.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 justify-end">
                              <p className={`font-bold ${color}`} data-testid={`earning-amount-${earning.id}`}>
                                +{Math.floor(parseFloat(earning.amount || "0"))} PARCERO
                              </p>
                              {getStatusIcon(earning.blockchainStatus || "confirmed")}
                              <Badge 
                                variant={earning.blockchainStatus === "confirmed" ? "default" : earning.blockchainStatus === "pending" ? "secondary" : "destructive"}
                                className="text-xs"
                                data-testid={`earning-status-${earning.id}`}
                              >
                                {earning.blockchainStatus || "confirmed"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="no-earnings-message">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{language === "en" ? "No earnings yet" : "Aún no hay ganancias"}</h3>
                  <p className="text-muted-foreground mb-4">
                    {language === "en" ? "Start learning to earn your first PARCERO tokens!" : "¡Empieza a aprender para ganar tus primeros tokens PARCERO!"}
                  </p>
                  <Button 
                    className="bg-[#CDEDF6] hover:bg-[#CDEDF6]/80 text-[#000000]" 
                    onClick={() => setLocation("/public-courses")}
                    data-testid="button-start-learning"
                  >
                    {language === "en" ? "Start Learning" : "Empieza a Aprender"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
