import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Coins, 
  Star, 
  Clock, 
  TrendingUp, 
  Shield, 
  Zap,
  ChevronRight,
  Play,
  Award
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";
import courseImage from "@assets/business-english_1756656117282.webp";

// Custom hook to fetch course modules and calculate duration
function useCourseDuration(courseId: string) {
  const { data: modules } = useQuery({
    queryKey: [`/api/courses/${courseId}/modules`],
  });
  
  const totalDuration = (modules as any[])?.reduce((total: number, module: any) => total + (module.duration || 0), 0) || 0;
  const exerciseTime = Math.ceil(totalDuration * 0.3); // Add 30% for exercises and practice
  
  return totalDuration + exerciseTime;
}

// Component to display calculated course duration
function CourseDuration({ courseId }: { courseId: string }) {
  const duration = useCourseDuration(courseId);
  
  if (duration === 0) {
    return <span>TBD</span>;
  }
  
  return <span>{Math.floor(duration / 60)}h {duration % 60}m</span>;
}

export default function PublicLanding() {
  const { language } = useLanguage();

  const { data: courses } = useQuery<Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    tokenReward: string;
    completionReward: string;
  }>>({
    queryKey: ["/api/courses", { published: true }],
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const featuredCourses = courses?.slice(0, 6) || [];

  const features = [
    {
      icon: Coins,
      title: language === "en" ? "Earn Crypto Rewards" : "Gana Recompensas Cripto",
      description: language === "en" 
        ? "Earn crypto tokens for finished courses and use towards further learning."
        : "Gana tokens cripto por cursos completados y úsalos para seguir aprendiendo."
    },
    {
      icon: BookOpen,
      title: language === "en" ? "Practical Skills" : "Habilidades Prácticas",
      description: language === "en"
        ? "Master real-world skills that they don't teach you in traditional education."
        : "Domina habilidades del mundo real que no te enseñan en la educación tradicional."
    },
    {
      icon: Users,
      title: language === "en" ? "Community Learning" : "Aprendizaje en Comunidad",
      description: language === "en"
        ? "Get help from the community, and give help in return, learn together."
        : "Recibe ayuda de la comunidad y ayuda a otros, aprendan juntos."
    },
    {
      icon: Shield,
      title: language === "en" ? "Blockchain Verified" : "Verificado en Blockchain",
      description: language === "en"
        ? "All course certificates are secured on the Polygon blockchain."
        : "Todos los certificados de cursos están asegurados en la blockchain de Polygon."
    }
  ];

  // Get available categories from published courses
  const availableCategories = courses ? 
    Array.from(new Set(courses.map(course => course.category.toLowerCase()))) : 
    [];

  // Create category translations mapping
  const categoryTranslations: Record<string, { en: string; es: string }> = {
    "finance": { en: "Finance", es: "Finanzas" },
    "business": { en: "Business", es: "Negocios" },
    "communication": { en: "Communication", es: "Comunicación" },
    "marketing": { en: "Marketing", es: "Marketing" },
    "wellness": { en: "Wellness", es: "Bienestar" },
    "leadership": { en: "Leadership", es: "Liderazgo" },
    "productivity": { en: "Productivity", es: "Productividad" },
    "languages": { en: "Languages", es: "Idiomas" },
    "technology": { en: "Technology", es: "Tecnología" }
  };

  const categoryColors: Record<string, string> = {
    "finance": "bg-green-500",
    "business": "bg-blue-500",
    "communication": "bg-purple-500",
    "marketing": "bg-[#2F6A75]",
    "wellness": "bg-pink-500",
    "leadership": "bg-indigo-500",
    "productivity": "bg-yellow-500",
    "languages": "bg-purple-500",
    "technology": "bg-gray-500"
  };

  // Only show categories that have published courses
  const categories = availableCategories.map(category => {
    const categoryKey = category.toLowerCase();
    const count = courses?.filter(c => c.category.toLowerCase() === categoryKey).length || 0;
    const displayName = language === "en" 
      ? categoryTranslations[categoryKey]?.en || category
      : categoryTranslations[categoryKey]?.es || category;
    
    return {
      name: displayName,
      count,
      color: categoryColors[categoryKey] || "bg-gray-500"
    };
  }).filter(category => category.count > 0); // Only include categories with courses

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">{language === "en" ? "Real Skills, Real Practice, Zero Boredom" : "Habilidades Reales, Práctica Real, Cero Aburrimiento"}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">{language === "en" ? "Master real-life, practical skills with the community while earning crypto tokens." : "Domina habilidades prácticas de la vida real con la comunidad mientras ganas tokens cripto."}</p>
            
            <div className="flex justify-center mb-16">
              <Link href="/public-courses">
                <Button size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md text-lg px-8 py-4 h-14 hover:opacity-90 text-[#ffffff] bg-[#2F6A75]" data-testid="button-browse-courses">
                  {language === "en" ? "Start Learning Today" : "Empieza a Aprender Hoy"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{language === "en" ? "Learn together, earn together" : "Aprendan juntos, ganen juntos"}
</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{language === "en" ? "Exchange your skills with others and get rewarded for it" : "Intercambia tus habilidades con otros y recibe recompensas por ello"}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow" data-testid={`feature-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* Featured Courses */}
      <section className="py-20 bg-[#ffffff] text-[#042A2B]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#042A2B]">{language === "en" ? "Featured Courses" : "Cursos Destacados"}</h2>
            <p className="text-xl opacity-90 text-[#042A2B]">
              {language === "en" ? "Start your journey with our most popular courses" : "Comienza tu viaje con nuestros cursos más populares"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredCourses.slice(0, 3).map((course) => (
              <Link href={`/course/${course.id}`} key={course.id}>
                <Card 
                  className="hover:shadow-md transition-all duration-200 border-[#eaf8fb]/50 bg-card cursor-pointer h-full"
                  data-testid={`featured-course-${course.id}`}
                >
                  {/* Preview Image */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={courseImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 flex flex-col items-start space-y-2">
                      <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold text-[12px]">
                        {Math.floor(parseFloat(course.tokenReward)).toLocaleString()} tokens
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 bg-white/90 text-foreground border border-[#eaf8fb]/50 text-[12px]">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-semibold leading-tight text-foreground" data-testid={`course-title-${course.id}`}>
                      {course.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2" data-testid={`course-description-${course.id}`}>
                      {course.description}
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
          
          <div className="text-center">
            <Link href="/public-courses">
              <Button size="lg" className="bg-[#042A2B] hover:bg-[#042A2B]/90 text-white" data-testid="button-view-all-courses">
                {language === "en" ? "View All Courses" : "Ver Todos los Cursos"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{language === "en" ? "Explore by Category" : "Explora por Categoría"}</h2>
            <p className="text-xl text-muted-foreground">
              {language === "en" ? "Find courses that match your interests and career goals" : "Encuentra cursos que coincidan con tus intereses y metas profesionales"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link href={`/public-courses?category=${category.name.toLowerCase()}`} key={index}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`category-${category.name.toLowerCase()}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} {language === "en" ? "courses" : "cursos"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#000]">
              {language === "en" ? "Ready to Start Earning While Learning?" : "¿Listo para Empezar a Ganar Mientras Aprendes?"}
            </h2>
            <p className="text-xl opacity-90 mb-8 text-[#000]">{language === "en" ? "Join the community of learners earning crypto tokens while building practical skills for the modern world." : "Únete a la comunidad de estudiantes que ganan tokens cripto mientras desarrollan habilidades prácticas para el mundo moderno."}</p>
            <div className="flex justify-center">
              <Link href="/public-courses">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" data-testid="button-start-learning-cta">
                  {language === "en" ? "Start Learning Today" : "Empieza a Aprender Hoy"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}