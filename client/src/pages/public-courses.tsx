import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Coins, 
  Star, 
  ChevronRight,
  ArrowLeft,
  Users,
  ChevronDown
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { useLanguage } from "@/contexts/language-context";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";
import courseImage from "@assets/business-english_1756656117282.webp";
import { CourseTranslation } from "@/lib/course-utils";

// Custom hook to fetch course modules and calculate duration
function useCourseDuration(courseId: string) {
  const { data: modules } = useQuery({
    queryKey: [`/api/courses/${courseId}/modules`],
  });
  
  const totalDuration = (modules as any[])?.reduce((total: number, module: any) => total + (module.duration || 0), 0) || 0;
  
  return totalDuration;
}

// Component to display calculated course duration
function CourseDuration({ courseId }: { courseId: string }) {
  const duration = useCourseDuration(courseId);
  
  if (duration === 0) {
    return <span>TBD</span>;
  }
  
  return <span>{Math.floor(duration / 60)}h {duration % 60}m</span>;
}

export default function PublicCourses() {
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    // Check if user is logged out from localStorage
    return localStorage.getItem('userLoggedOut') === 'true';
  });
  const { language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Handle URL parameters for category filtering and search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);
  
  // Clear logout state when wallet is connected (user wants to log back in)
  useEffect(() => {
    if (isConnected && isLoggedOut) {
      setIsLoggedOut(false);
      localStorage.removeItem('userLoggedOut');
    }
  }, [isConnected, isLoggedOut]);
  
  // Fetch user profile for avatar - only when connected and not logged out
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected && !isLoggedOut,
  });

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear any local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Set logged out state persistently
      setIsLoggedOut(true);
      localStorage.setItem('userLoggedOut', 'true');
      
      // Clear query cache for profile data
      await queryClient.invalidateQueries({ queryKey: ["/api/profile/user-1"] });
      queryClient.removeQueries({ queryKey: ["/api/profile/user-1"] });
      
      // Disconnect wallet to clear authentication state
      await disconnectWallet();
      
      toast({
        title: language === "en" ? "Logged out" : "Sesión cerrada",
        description: language === "en" ? "You have been successfully logged out." : "Has cerrado sesión exitosamente.",
      });
      
      // Redirect to home page
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, still redirect
      setLocation('/');
    }
  };

  // Fetch ALL courses and filter on frontend to debug the issue
  const { data: allCourses, isLoading } = useQuery<Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    price: string;
    tokenReward: string;
    completionReward: string;
    instructorId: string;
    isPublished: boolean;
    modules?: Array<{ duration: number }>;
  }>>({
    queryKey: ["/api/courses"],
  });

  // Filter published courses on frontend
  const courses = allCourses?.filter(course => {
    return course.isPublished === true;
  }) || [];

  // Fetch all course translations if user prefers Spanish
  const { data: allTranslations } = useQuery<CourseTranslation[]>({
    queryKey: ["/api/course-translations"],
    enabled: language !== 'en' && !!courses?.length,
  });

  // Helper function to get localized course data
  const getLocalizedCourse = (course: any) => {
    if (language === 'en' || !allTranslations) {
      return course;
    }

    const translation = allTranslations.find(t => t.courseId === course.id && t.language === language);
    
    return {
      ...course,
      title: translation?.title || course.title,
      description: translation?.description || course.description,
    };
  };

  // Filter courses based on search and filters with localized content
  const filteredCourses = courses?.filter((course) => {
    const localizedCourse = getLocalizedCourse(course);
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === "" || 
                         localizedCourse.title.toLowerCase().includes(searchLower) ||
                         localizedCourse.description.toLowerCase().includes(searchLower) ||
                         localizedCourse.category.toLowerCase().includes(searchLower) ||
                         localizedCourse.difficulty.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(localizedCourse.category.toLowerCase());
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Generate autocomplete suggestions with localized content
  const suggestions = courses?.filter((course) => {
    const localizedCourse = getLocalizedCourse(course);
    const searchLower = searchTerm.toLowerCase().trim();
    if (searchLower.length < 2) return false;
    
    return localizedCourse.title.toLowerCase().includes(searchLower) ||
           localizedCourse.category.toLowerCase().includes(searchLower) ||
           localizedCourse.difficulty.toLowerCase().includes(searchLower);
  }).slice(0, 5) || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (courseId: string) => {
    setShowSuggestions(false);
    setLocation(`/course/${courseId}`);
  };

  // Get available categories from published courses
  const availableCategories = courses ? 
    Array.from(new Set(courses.map(course => course.category.toLowerCase()))) : 
    [];

  // Create category translations mapping
  const categoryTranslations: Record<string, { en: string; es: string }> = {
    "finance": { en: "finance", es: "finanzas" },
    "business": { en: "business", es: "negocios" },
    "communication": { en: "communication", es: "comunicación" },
    "marketing": { en: "marketing", es: "marketing" },
    "wellness": { en: "wellness", es: "bienestar" },
    "leadership": { en: "leadership", es: "liderazgo" },
    "productivity": { en: "productivity", es: "productividad" },
    "languages": { en: "languages", es: "idiomas" },
    "technology": { en: "technology", es: "tecnología" }
  };

  // Map available categories to translated versions
  const allCategories = availableCategories.map(category => {
    const categoryKey = category.toLowerCase();
    return language === "en" 
      ? categoryTranslations[categoryKey]?.en || categoryKey
      : categoryTranslations[categoryKey]?.es || categoryKey;
  });
  const difficulties = language === "en"
    ? ["all", "beginner", "intermediate", "advanced"]
    : ["todos", "principiante", "intermedio", "avanzado"];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      finance: "bg-green-500",
      business: "bg-blue-500",
      communication: "bg-purple-500",
      marketing: "bg-[#2F6A75]",
      wellness: "bg-pink-500",
      leadership: "bg-indigo-500",
      productivity: "bg-yellow-500",
      languages: "bg-orange-500"
    };
    return colors[category.toLowerCase()] || "bg-gray-500";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">{language === "en" ? "Courses" : "Cursos"}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{language === "en" ? "Discover practical skills that will transform your personal and professional life." : "Descubre habilidades prácticas que transformarán tu vida personal y profesional."}</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder={language === "en" ? "Search courses..." : "Buscar cursos..."}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 h-12 bg-white dark:bg-background"
                data-testid="input-search-courses"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-background border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {suggestions.map((course) => (
                    <div
                      key={course.id}
                      className="px-4 py-3 hover:bg-muted cursor-pointer border-b border-border/50 last:border-b-0"
                      onClick={() => handleSuggestionClick(course.id)}
                      data-testid={`suggestion-${course.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{getLocalizedCourse(course).title}</div>
                          <div className="text-xs text-muted-foreground">{course.category}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {parseFloat(course.price).toLocaleString()} tokens
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Category Dropdown Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-12 px-4 min-w-44 justify-between hover:bg-[#CDEDF6] hover:text-foreground"
                  data-testid="dropdown-category-filter"
                >
                  <span>
                    {selectedCategories.length === 0 
                      ? (language === "en" ? "All Categories" : "Todas las Categorías")
                      : language === "en" ? `${selectedCategories.length} selected` : `${selectedCategories.length} seleccionadas`
                    }
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                {allCategories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="capitalize hover:bg-[#CDEDF6] hover:text-foreground data-[highlighted]:bg-[#CDEDF6] data-[highlighted]:text-foreground"
                    data-testid={`dropdown-item-${category}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Selected Category Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{language === "en" ? "Categories:" : "Categorías:"}</span>
              {selectedCategories.map(category => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors bg-accent/10 text-accent border-accent/20"
                  onClick={() => removeCategory(category)}
                  data-testid={`selected-category-${category}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
              >
                {language === "en" ? "Clear all" : "Limpiar todo"}
              </Button>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="results-count">
              {isLoading ? (language === "en" ? "Loading..." : "Cargando...") : language === "en" ? `${filteredCourses.length} courses found` : `${filteredCourses.length} cursos encontrados`}
            </span>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>
                {selectedCategories.length > 0 
                  ? language === "en" ? `${selectedCategories.length} filters active` : `${selectedCategories.length} filtros activos`
                  : language === "en" ? "No filters applied" : "Sin filtros aplicados"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-6 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{language === "en" ? "No courses found" : "No se encontraron cursos"}</h3>
            <p className="text-muted-foreground mb-4">
              {language === "en" ? "Try adjusting your search terms or filters to find more courses." : "Intenta ajustar tus términos de búsqueda o filtros para encontrar más cursos."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link href={`/course/${course.id}`} key={course.id}>
                <Card 
                  className="hover:shadow-md transition-all duration-200 border-[#eaf8fb]/50 bg-card cursor-pointer h-full"
                  data-testid={`course-card-${course.id}`}
                >
                  {/* Preview Image */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={courseImage}
                      alt={getLocalizedCourse(course).title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 flex flex-col items-start space-y-2">
                      <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold text-[12px]">
                        {parseFloat(course.price).toLocaleString()} tokens
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 bg-white/90 text-foreground border border-[#eaf8fb]/50 text-[12px]">
                        {(() => {
                          const categoryKey = course.category.toLowerCase();
                          const translatedCategory = language === "en" 
                            ? categoryTranslations[categoryKey]?.en || categoryKey
                            : categoryTranslations[categoryKey]?.es || categoryKey;
                          return translatedCategory.charAt(0).toUpperCase() + translatedCategory.slice(1);
                        })()}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-semibold leading-tight text-foreground" data-testid={`course-title-${course.id}`}>
                      {getLocalizedCourse(course).title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2" data-testid={`course-description-${course.id}`}>
                      {getLocalizedCourse(course).description}
                    </p>
                    
                    {/* Course Details */}
                    <div className="flex items-center text-sm text-muted-foreground pt-2 border-t border-[#eaf8fb]/30">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <CourseDuration courseId={course.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="text-center mt-16 py-12 bg-muted/30 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">{language === "en" ? "Ready to Start Learning?" : "¿Listo para Empezar a Aprender?"}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === "en" ? "Create your free account and start earning PARCERO tokens for every course you complete." : "Crea tu cuenta gratuita y empieza a ganar tokens PARCERO por cada curso que completes."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" data-testid="button-signup-bottom">
                  {language === "en" ? "Create Free Account" : "Crear Cuenta Gratuita"}
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" data-testid="button-learn-more">
                  {language === "en" ? "Learn More About Rewards" : "Aprende Más Sobre Recompensas"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}