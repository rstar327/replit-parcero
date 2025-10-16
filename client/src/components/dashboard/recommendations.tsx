import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Coins, ChevronRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useQuery<{
    recommendations: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      difficulty: string;
      duration: number;
      tokenReward: string;
    }>;
    reason: string;
  }>({
    queryKey: ["/api/users/user-1/recommendations"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
    <Card data-testid="recommendations-card">
      <CardHeader>
        <CardTitle className="flex items-center" data-testid="recommendations-title">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          AI Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground" data-testid="recommendations-reason">
          {recommendations?.reason || "Personalized courses just for you"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations?.recommendations.slice(0, 3).map((course) => (
          <div 
            key={course.id} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            data-testid={`recommendation-${course.id}`}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm" data-testid={`recommendation-title-${course.id}`}>
                  {course.title}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {course.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.duration}min
                </div>
                <div className="flex items-center">
                  <Coins className="w-3 h-3 mr-1 text-primary" />
                  {Math.floor(parseFloat(course.tokenReward)).toLocaleString()} PARCERO
                </div>
              </div>
            </div>
            <Link href={`/courses/${course.id}`}>
              <Button size="sm" variant="ghost" data-testid={`button-view-course-${course.id}`}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ))}
        
        <Link href="/courses">
          <Button variant="outline" className="w-full" data-testid="button-view-all-courses">
            <BookOpen className="w-4 h-4 mr-2" />
            View All Courses
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}