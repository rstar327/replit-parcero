import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Course = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  category: string;
  difficulty: string;
  duration: number;
};

export default function RecentCourses() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/users/user-1/enrolled-courses"],
  });

  return (
    <Card data-testid="recent-courses-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle data-testid="recent-courses-title">My Courses</CardTitle>
        <Link href="/courses">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-all-courses">
            View All
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          courses.slice(0, 3).map((course) => (
            <div key={course.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg" data-testid={`course-${course.id}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate" data-testid={`course-title-${course.id}`}>
                  {course.title}
                </h4>
                <p className="text-sm text-muted-foreground" data-testid={`course-category-${course.id}`}>
                  {course.category} • {course.difficulty}
                </p>
                <div className="mt-2 w-full">
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-muted-foreground/20 rounded-full w-0" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  0%
                </p>
                <p className="text-xs text-muted-foreground">
                  Not started
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No courses available yet
            </p>
            <p className="text-xs text-muted-foreground">
              Check back later for new learning opportunities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
