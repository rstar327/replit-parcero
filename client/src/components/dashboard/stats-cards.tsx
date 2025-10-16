import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { useWeb3 } from "@/hooks/use-web3";

export default function StatsCards() {
  const { language } = useLanguage();
  const { isConnected } = useWeb3();
  
  const { data: stats, isLoading } = useQuery<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
    revenue: string;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch user profile to get actual token balance
  const { data: profileData } = useQuery<{
    id: string;
    username: string;
    fullName: string;
    email: string;
    tokenBalance: string;
    role: string;
    avatar?: string;
  }>({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected,
  });

  if (isLoading || !stats) {
    return null;
  }

  const statsData = [
    {
      title: language === "en" ? "Courses Completed" : "Cursos Completados",
      value: "0",
      testId: "stat-completed-courses"
    },
    {
      title: language === "en" ? "Courses In Progress" : "Cursos en Progreso",
      value: "0",
      testId: "stat-courses-in-progress"
    },
    {
      title: language === "en" ? "Tokens Earned" : "Tokens Ganados",
      value: profileData?.tokenBalance ? Math.floor(parseFloat(profileData.tokenBalance)).toLocaleString() : "0",
      testId: "stat-tokens-earned"
    },
    {
      title: language === "en" ? "Study Streak" : "Racha de Estudio",
      value: language === "en" ? "0 days" : "0 días",
      testId: "stat-study-streak"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsData.map((stat) => {
        return (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid={`${stat.testId}-value`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`${stat.testId}-label`}>
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
