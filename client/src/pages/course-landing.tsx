import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Star, 
  Users, 
  Play,
  CheckCircle,
  Target,
  BookOpen,
  Award,
  FileText,
  Loader2,
  Infinity,
  Building2,
  Volume2,
  FileType,
  TrendingUp,
  UserCheck,
  Monitor,
  Wifi,
  GraduationCap,
  Heart
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useLocation } from "wouter";
import courseImage from "@assets/business-english_1756656372652.webp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { useLanguage } from "@/contexts/language-context";
import Header from "@/components/layout/header";
import { useCourseWithTranslation } from "@/lib/course-utils";
import { CourseReviewSidebar } from "@/components/course-review-sidebar";
import { CourseCompletionPrompt } from "@/components/course-completion-prompt";

export default function CourseLanding() {
  const { id } = useParams<{ id: string }>();
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();
  const [location, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
  
  // Check if user is logged out from localStorage
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });
  
  // Fetch user profile for avatar - only when not logged out
  const { data: profileData, isError } = useQuery({
    queryKey: ["/api/profile/user-1"],
    retry: false,
    staleTime: 0,
    enabled: !isLoggedOut,
  });
  
  // Check if profile data fails to load and user should be logged out
  useEffect(() => {
    if (isError && !isLoggedOut) {
      setIsLoggedOut(true);
      localStorage.setItem('userLoggedOut', 'true');
    }
  }, [isError, isLoggedOut]);
  
  // Reset logout state when profile data is successfully loaded
  useEffect(() => {
    if (profileData && isLoggedOut) {
      setIsLoggedOut(false);
      localStorage.removeItem('userLoggedOut');
    }
  }, [profileData, isLoggedOut]);
  
  const handleLogout = async () => {
    try {
      // Set logout state
      setIsLoggedOut(true);
      localStorage.setItem('userLoggedOut', 'true');
      
      // Disconnect wallet to clear authentication state
      await disconnectWallet();
      
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: language === "en" ? "Logged out" : "Sesión cerrada",
        description: language === "en" ? "You have been successfully logged out." : "Has cerrado sesión exitosamente.",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const { data: course, isLoading } = useQuery<{
    id: string;
    title: string;
    description: string;
    content: {
      overview?: string;
      objectives?: string[];
      prerequisites?: string;
    };
    category: string;
    difficulty: string;
    duration: number;
    tokenReward: string;
    completionReward: string;
    quizReward: string;
    instructorId: string;
  }>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  // Fetch course modules
  const { data: modules } = useQuery<Array<{
    id: string;
    title: string;
    content: any;
    orderIndex: number;
    duration: number;
    tokenReward: string;
  }>>({
    queryKey: [`/api/courses/${id}/modules`],
    enabled: !!id,
  });

  // Check enrollment status
  const { data: enrollmentStatus } = useQuery<{ isEnrolled: boolean }>({
    queryKey: [`/api/enrollment/user-1/${id}`],
    enabled: !!id && !!profileData,
    retry: false,
  });

  const isEnrolled = enrollmentStatus?.isEnrolled || false;

  // Enrollment mutation
  const enrollmentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/enroll", {
        userId: (profileData as any)?.id,
        courseId: id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Enrollment Successful!",
          description: data.message,
        });
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/profile/user-1"] });
        queryClient.invalidateQueries({ queryKey: [`/api/enrollment/user-1/${id}`] });
      } else {
        if (data.message.includes("Insufficient tokens")) {
          toast({
            title: "Insufficient Tokens",
            description: data.message + " Redirecting to pricing...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/pricing";
          }, 2000);
        } else {
          toast({
            title: "Enrollment Failed",
            description: data.message,
            variant: "destructive",
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Enrollment Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEnrollment = () => {
    if (!profileData) {
      // Redirect to signup if not logged in
      window.location.href = "/signup";
      return;
    }

    // Always show confirmation modal
    setShowEnrollConfirm(true);
  };

  const confirmEnrollment = () => {
    setShowEnrollConfirm(false);
    enrollmentMutation.mutate();
  };

  // Calculate total duration from modules
  const totalDuration = modules ? modules.reduce((total, module) => total + module.duration, 0) : 0;
  const totalWithExercises = totalDuration;

  // Extract course data (API returns array, take first item)
  const courseData = Array.isArray(course) ? course[0] : course;
  
  // Get localized course content based on user's language preference
  const { getLocalizedCourse } = useCourseWithTranslation(id, language);
  const localizedCourse = courseData ? getLocalizedCourse(courseData) : undefined;
  
  // Calculate enrollment button state
  const userBalance = parseFloat((profileData as any)?.tokenBalance || "0");
  const coursePrice = parseFloat(courseData?.price || "0");
  const hasInsufficientTokens = profileData && courseData && userBalance < coursePrice;
  
  // Calculate total possible tokens (1 token per module + 10 tokens for completion)
  const moduleTokens = modules ? modules.length : 0;
  const completionTokens = 10;
  const totalTokens = moduleTokens + completionTokens;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      finance: "bg-green-500",
      business: "bg-blue-500",
      communication: "bg-purple-500",
      marketing: "bg-[#2F6A75]",
      wellness: "bg-pink-500",
      leadership: "bg-indigo-500",
      productivity: "bg-yellow-500"
    };
    return colors[category?.toLowerCase()] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || (Array.isArray(course) && course.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist.</p>
          <Link href="/public-courses">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        
        
        {/* Course Title */}
        <div className="mb-8">
          <h2 className="font-semibold text-[42px]">{localizedCourse?.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Course Preview */}
            <div className="aspect-video rounded-lg relative overflow-hidden bg-muted/30">
              <img 
                src={courseImage}
                alt={localizedCourse?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col items-start space-y-2">
                <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold text-[12px]">
                  {Math.floor(parseFloat(courseData?.price || "0")).toLocaleString()} tokens
                </div>
                <Badge variant="secondary" className="px-2 py-1 bg-white/90 text-foreground border border-[#eaf8fb]/50 text-[12px]">
                  {(() => {
                    const categoryKey = courseData?.category?.toLowerCase() || "";
                    const translatedCategory = language === "en" 
                      ? categoryTranslations[categoryKey]?.en || categoryKey
                      : categoryTranslations[categoryKey]?.es || categoryKey;
                    return translatedCategory.charAt(0).toUpperCase() + translatedCategory.slice(1);
                  })()}
                </Badge>
              </div>
            </div>

            {/* Course Description */}
            {localizedCourse?.description && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{language === "en" ? "About This Course" : "Acerca de este Curso"}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {localizedCourse.description}
                </p>
              </div>
            )}


            {/* Prerequisites */}
            {courseData?.content?.prerequisites && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Prerequisites</h2>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-muted-foreground">{courseData.content.prerequisites}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Course Curriculum */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{language === "en" ? "Course Modules" : "Módulos del Curso"}</h2>
              {modules && modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((module, index) => {
                    const isFreeModule = index < 3; // First 3 modules are free
                    const isAccessible = isEnrolled || isFreeModule;
                    const isLocked = !isAccessible;
                    
                    return (
                      <Card 
                        key={module.id} 
                        className={`transition-all ${
                          (!profileData || isLoggedOut) || isAccessible || isLocked
                            ? "hover:shadow-md cursor-pointer border-border" 
                            : "opacity-60 cursor-not-allowed border-muted-foreground/20"
                        }`}
                        onClick={() => {
                          if (!profileData || isLoggedOut) {
                            // Redirect to signup for non-logged-in users
                            setLocation('/signup');
                          } else if (isAccessible) {
                            setLocation(`/course/${id}/module/${module.id}`);
                          } else if (isLocked) {
                            // Trigger enrollment modal for locked modules
                            handleEnrollment();
                          }
                        }}
                      >
                        <CardContent className="p-4 relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-100 border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                {index + 1}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-foreground">
                                    {module.title}
                                  </h3>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{module.duration} min</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Award className="w-3 h-3 mr-1" />
                                    <span>+1 token</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isFreeModule && !isEnrolled && profileData && !isLoggedOut && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 absolute bottom-2 right-2">
                              {language === "en" ? "Free" : "Gratis"}
                            </Badge>
                          )}
                          {(!profileData || isLoggedOut) && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 absolute bottom-2 right-2">
                              {language === "en" ? "Sign up to access" : "Regístrate para acceder"}
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 absolute bottom-2 right-2">
                              {language === "en" ? "Upgrade to access" : "Actualizar para acceder"}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* More modules coming statement */}
                  <div className="py-8 border-t border-dashed border-muted-foreground/30 mt-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <Button 
                        variant="default" 
                        size="lg"
                        onClick={handleEnrollment}
                        className="bg-[#2f6a75] text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-base font-semibold"
                        data-testid="button-upgrade-preview"
                      >
                        {language === "en" ? "Upgrade for full access" : "Actualiza para acceso total"}
                      </Button>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{language === "en" ? "This is just a preview" : "Esto es solo una vista previa"}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">{language === "en" ? "100+ modules coming" : "100+ módulos próximamente"}</p>
                        <p className="text-xs text-muted-foreground">{language === "en" ? "New modules added continuously" : "Módulos nuevos agregados continuamente"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Course modules will be available soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="space-y-4 p-6">
                {isEnrolled ? (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      {language === "en" ? "Enrolled!" : "¡Inscrito!"}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      {language === "en" ? "You have access to all modules" : "Tienes acceso a todos los módulos"}
                    </p>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="w-full h-12 text-lg bg-[#2f6a75] text-[#fff] hover:opacity-90" 
                      onClick={handleEnrollment}
                      disabled={enrollmentMutation.isPending}
                      data-testid="button-enroll-course"
                    >
                      {enrollmentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === "en" ? "Enrolling..." : "Inscribiendo..."}
                        </>
                      ) : (
                        <>
                          {language === "en" ? "Enroll for" : "Inscribirse por"} {parseFloat(courseData?.price || "0").toLocaleString()} tokens
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>{language === "en" ? "First 3 modules free" : "Primeros 3 módulos gratis"}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">{language === "en" ? "This course includes:" : "Este curso incluye:"}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span>{language === "en" ? `${Math.floor(totalWithExercises / 60)}h ${totalWithExercises % 60}m of content` : `${Math.floor(totalWithExercises / 60)}h ${totalWithExercises % 60}m de contenido`}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span>{language === "en" ? "Certificate of completion" : "Certificado de finalización"}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span>{language === "en" ? "Practical exercises" : "Ejercicios prácticos"}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span>{language === "en" ? "Community access" : "Acceso a la comunidad"}</span>
                    </div>
                    <div className="flex items-center">
                      <Infinity className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span>{language === "en" ? "Lifetime access" : "Acceso de por vida"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Rewards Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Token Rewards" : "Recompensas de Tokens"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{language === "en" ? "Course completion" : "Finalización del curso"}</span>
                  <span className="font-semibold text-accent">+{completionTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{language === "en" ? "Module completions" : "Finalización de módulos"}</span>
                  <span className="font-semibold text-accent">+{moduleTokens}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{language === "en" ? "Total token rewards" : "Total de recompensas de tokens"}</span>
                  <span className="text-accent">
                    +{totalTokens.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* What you'll learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "What you'll learn" : "Qué aprenderás"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Business expressions" : "Expresiones de negocios"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Industry specific vocabulary" : "Vocabulario específico de la industria"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <FileType className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Common abbreviations" : "Abreviaciones comunes"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Who this course is for */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Who this course is for" : "Para quién es este curso"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Entrepreneurs and startup founders" : "Emprendedores y fundadores de startups"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <UserCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Executives and professionals" : "Ejecutivos y profesionales"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Jobseekers and recruiters" : "Buscadores de empleo y reclutadores"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{language === "en" ? "Requirements" : "Requisitos"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Access to a computer or mobile device" : "Acceso a una computadora o dispositivo móvil"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Wifi className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Internet connection for streaming" : "Conexión a internet para streaming"}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{language === "en" ? "Enthusiasm to learn and practice new skills" : "Entusiasmo para aprender y practicar nuevas habilidades"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Course Completion Prompt */}
            {id && !isLoggedOut && (
              <CourseCompletionPrompt 
                courseId={id} 
                userId={(profileData as any)?.id || "user-1"}
                onReviewClick={() => {
                  // TODO: Open review modal or scroll to review section
                  const reviewSection = document.querySelector('[data-testid="course-review-sidebar"]');
                  if (reviewSection) {
                    reviewSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="mb-6"
              />
            )}

            {/* Course Reviews */}
            {id && (
              <CourseReviewSidebar 
                courseId={id} 
                userId={(profileData as any)?.id || "user-1"}
              />
            )}
          </div>
        </div>
      </div>
      {/* Enrollment Confirmation Modal */}
      <AlertDialog open={showEnrollConfirm} onOpenChange={setShowEnrollConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasInsufficientTokens 
                ? (language === "en" ? "Insufficient Balance" : "Saldo Insuficiente")
                : (language === "en" ? "Confirm Enrollment" : "Confirmar Inscripción")
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                {language === "en" 
                  ? `You're about to enroll in "${courseData?.title}" for ${parseFloat(courseData?.price || "0").toLocaleString()} tokens.`
                  : `Estás a punto de inscribirte en "${courseData?.title}" por ${parseFloat(courseData?.price || "0").toLocaleString()} tokens.`
                }
              </div>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{language === "en" ? "Current balance:" : "Saldo actual:"}</span>
                    {hasInsufficientTokens && (
                      <Badge variant="destructive" className="text-xs">
                        {language === "en" ? "Insufficient Balance" : "Saldo Insuficiente"}
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold">
                    {(profileData as any)?.tokenBalance ? Math.floor(parseFloat((profileData as any).tokenBalance)).toLocaleString() : "0"} tokens
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{language === "en" ? "Course price:" : "Precio del curso:"}</span>
                  <span className="font-semibold text-orange-600">
                    -{parseFloat(courseData?.price || "0").toLocaleString()} tokens
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>{language === "en" ? "Balance after enrollment:" : "Saldo después de la inscripción:"}</span>
                  <span className="text-green-600">
                    {((parseFloat((profileData as any)?.tokenBalance || "0")) - (parseFloat(courseData?.price || "0"))).toLocaleString()} tokens
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "en" 
                  ? "After enrollment, you'll have lifetime access to all course modules and earn tokens for completing them."
                  : "Después de la inscripción, tendrás acceso de por vida a todos los módulos del curso y ganarás tokens por completarlos."
                }
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enrollment">
              {language === "en" ? "Cancel" : "Cancelar"}
            </AlertDialogCancel>
            {hasInsufficientTokens ? (
              <AlertDialogAction 
                onClick={() => {
                  setShowEnrollConfirm(false);
                  window.location.href = "/pricing";
                }}
                data-testid="button-upgrade-tokens"
              >
                {language === "en" ? "Upgrade for Tokens" : "Actualizar por Tokens"}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction 
                onClick={confirmEnrollment}
                data-testid="button-confirm-enrollment"
                disabled={enrollmentMutation.isPending}
              >
                {enrollmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Processing..." : "Procesando..."}
                  </>
                ) : (
                  language === "en" ? "Confirm Enrollment" : "Confirmar Inscripción"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}