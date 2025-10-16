import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Users, ExternalLink, Wallet, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/use-web3";
import { useLanguage } from "@/contexts/language-context";

type TokenTransaction = {
  id: string;
  type: string;
  amount: string;
  reason: string;
  createdAt: string;
};

export default function TokenRewards() {
  const { isConnected, connectWallet, disconnectWallet, isLoading: web3Loading } = useWeb3();
  const { language } = useLanguage();
  const contractAddress = "0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f";
  const shortAddress = `${contractAddress.slice(0, 8)}...${contractAddress.slice(-4)}`;

  const openPolygonScan = () => {
    window.open(`https://polygonscan.com/token/${contractAddress}`, '_blank');
  };

  return (
    <Card data-testid="token-rewards-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle data-testid="token-rewards-title">Token Rewards</CardTitle>
        <Link href="/tokens">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-token-history">
            View History
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            No token rewards yet
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Complete courses and activities to earn PARCERO tokens
          </p>
          
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Contract Address:</span>
            <span className="text-xs font-mono text-foreground" data-testid="contract-address">
              {shortAddress}
            </span>
          </div>
          <Button 
            onClick={openPolygonScan}
            variant="outline"
            size="sm"
            className="w-full hover:bg-muted/50 hover:text-foreground"
            data-testid="button-open-polygonscan"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on PolygonScan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
