import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { data: leaderboard, isLoading } = useQuery<Array<{
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
    tokenBalance: number;
    role: string;
  }>>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/20";
      default:
        return "bg-muted/30 border-border";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            {language === "en" ? "Leaderboard" : "Tabla de Clasificación"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="leaderboard-card">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="leaderboard-title">
          <Trophy className="w-5 h-5 mr-2 text-primary" />
          Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "Top token earners this month" : "Principales ganadores de tokens este mes"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard && leaderboard.length > 0 ? (
          <>
            {leaderboard.slice(0, 5).map((user, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${getRankColor(rank)}`}
                  data-testid={`leaderboard-user-${rank}`}
                >
                  <div 
                    className="flex items-center justify-center w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setLocation(`/profile/${user.id}`)}
                    data-testid={`avatar-${rank}`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.fullName || user.username} />
                      <AvatarFallback className="text-xs">
                        {(user.fullName || user.username)?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-sm truncate" data-testid={`username-${rank}`}>
                        {user.fullName || user.username}
                      </p>
                      {user.role === 'instructor' && (
                        <Badge variant="secondary" className="text-xs">
                          {language === "en" ? "Instructor" : "Instructor"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Coins className="w-3 h-3 mr-1 text-primary" />
                      <span data-testid={`tokens-${rank}`}>
                        {user.tokenBalance.toLocaleString()} PARCERO
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-muted-foreground" data-testid={`rank-${rank}`}>
                      #{rank}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Complete courses and earn tokens to climb the leaderboard!" : "¡Completa cursos y gana tokens para subir en la tabla de clasificación!"}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "No users on the leaderboard yet" : "Aún no hay usuarios en la tabla de clasificación"}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "Be the first to earn PARCERO tokens!" : "¡Sé el primero en ganar tokens PARCERO!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}