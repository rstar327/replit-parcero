import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Plus, BookOpen, Clock, Users, Star, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { language } = useLanguage();

  const { data: courses, isLoading } = useQuery<Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    tokenReward: string;
    instructorId: string;
  }>>({
    queryKey: ["/api/users/user-1/enrolled-courses"],
  });

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || course.category.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  const categories = ["all", "technology", "finance", "design", "marketing", "wellness", "languages"];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title={language === "en" ? "My Courses" : "Mis Cursos"} 
          subtitle={language === "en" ? "Explore and manage your learning journey" : "Explora y gestiona tu viaje de aprendizaje"}
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="stat-enrolled-courses">
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Enrolled" : "Inscritos"}</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-in-progress-courses">
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "In Progress" : "En Progreso"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-completed-courses">
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Completed" : "Completados"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-total-hours">
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">{language === "en" ? "Total Hours" : "Horas Totales"}</p>
                </div>
              </CardContent>
            </Card>
            
            
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{language === "en" ? "No courses found" : "No se encontraron cursos"}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filter !== "all" 
                      ? (language === "en" ? "Try adjusting your search or filter criteria." : "Intenta ajustar tus criterios de búsqueda o filtro.")
                      : (language === "en" ? "Start your learning journey by enrolling in a course." : "Comienza tu viaje de aprendizaje inscribiéndote en un curso.")
                    }
                  </p>
                  <Link href="/public-courses">
                    <Button className="bg-[#CDEDF6] hover:bg-[#CDEDF6]/80 text-[#000000]" data-testid="button-browse-courses">{language === "en" ? "Browse Courses" : "Explorar Cursos"}</Button>
                  </Link>
                </div>
              ) : (
                filteredCourses.map((course: any) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden" data-testid={`course-card-${course.id}`}>
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" data-testid={`course-category-${course.id}`}>
                            {course.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight" data-testid={`course-title-${course.id}`}>
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`course-description-${course.id}`}>
                          {course.description}
                        </p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span data-testid={`course-duration-${course.id}`}>
                              {Math.floor((course.duration || 0) / 60)}h {(course.duration || 0) % 60}m
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-foreground">0%</span>
                          </div>
                          <Progress value={0} className="h-2" data-testid={`course-progress-${course.id}`} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reward: </span>
                            <span className="font-semibold text-primary" data-testid={`course-reward-${course.id}`}>
                              {course.completionReward} PARCERO
                            </span>
                          </div>
                          <Button size="sm" data-testid={`button-continue-course-${course.id}`}>
                            Continue
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
