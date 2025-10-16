import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/contexts/language-context";
import { useQuery } from "@tanstack/react-query";
import parceroLogo from "@/assets/parcero-logo-rectangle_1756574770152.png";

export function Footer() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  // Fetch courses to get available categories
  const { data: courses } = useQuery<Array<{
    id: string;
    title: string;
    category: string;
    isPublished: boolean;
  }>>({
    queryKey: ["/api/courses"],
  });

  // Get unique categories from published courses
  const availableCategories = courses ? 
    Array.from(new Set(courses.filter(course => course.isPublished !== false).map(course => course.category))) : 
    [];

  return (
    <>
      {/* Footer */}
      <footer className="py-12 text-[#cbecf6] bg-[#042125]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={parceroLogo} 
                  alt="Parcero.eco" 
                  className="rounded object-contain"
                  style={{ height: '42px', width: 'auto' }}
                />
              </div>
              <p className="text-[#cbecf6]">{language === "en" ? "Unconventional Unschooling" : "Educación No Convencional"}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{language === "en" ? "Courses" : "Cursos"}</h3>
              <ul className="space-y-2 text-[#cbecf6]">
                {availableCategories.map((category) => {
                  // Map category names to translated versions
                  const categoryTranslations = {
                    "Finance": language === "en" ? "Finance" : "Finanzas",
                    "finance": language === "en" ? "Finance" : "Finanzas",
                    "Business": language === "en" ? "Business" : "Negocios",
                    "business": language === "en" ? "Business" : "Negocios",
                    "Communication": language === "en" ? "Communication" : "Comunicación",
                    "communication": language === "en" ? "Communication" : "Comunicación",
                    "Marketing": language === "en" ? "Marketing" : "Marketing",
                    "marketing": language === "en" ? "Marketing" : "Marketing",
                    "Languages": language === "en" ? "Languages" : "Idiomas",
                    "languages": language === "en" ? "Languages" : "Idiomas",
                    "Wellness": language === "en" ? "Wellness" : "Bienestar",
                    "wellness": language === "en" ? "Wellness" : "Bienestar",
                    "Technology": language === "en" ? "Technology" : "Tecnología",
                    "technology": language === "en" ? "Technology" : "Tecnología"
                  };
                  
                  const displayName = categoryTranslations[category as keyof typeof categoryTranslations] || category;
                  
                  return (
                    <li key={category}>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-[#cbecf6] font-normal"
                        onClick={() => setLocation(`/public-courses?category=${encodeURIComponent(category.toLowerCase())}`)}
                        data-testid={`footer-category-${category.toLowerCase()}`}
                      >
                        {displayName}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{language === "en" ? "Platform" : "Plataforma"}</h3>
              <ul className="space-y-2 text-[#cbecf6]">
                <li><Button variant="link" className="p-0 h-auto text-[#cbecf6] font-normal" onClick={() => setLocation('/refund-policy')} data-testid="footer-refund-policy">{language === "en" ? "Refund Policy" : "Política de Reembolso"}</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{language === "en" ? "About" : "Acerca de"}</h3>
              <ul className="space-y-2 text-[#cbecf6]">
                <li>
                  <a 
                    href="https://polygonscan.com/token/0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block p-0 h-auto text-[#cbecf6] font-normal hover:underline"
                    data-testid="footer-parcero-token"
                  >
                    {language === "en" ? "PARCERO Token" : "Token PARCERO"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#063137] mt-8 pt-8 text-center text-[#cbecf6]">
            <p>&copy; 2024 Parcero. {language === "en" ? "All rights reserved. Powered by " : "Todos los derechos reservados. Impulsado por "}<a href="https://polygonscan.com/token/0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f" target="_blank" rel="noopener noreferrer" className="underline hover:text-white" data-testid="footer-polygon-link">Polygon</a>.</p>
          </div>
        </div>
      </footer>
      {/* WhatsApp Floating Widget */}
      <a
        href="https://wa.me/573151177633"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20b456] rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        data-testid="whatsapp-widget"
      >
        <FaWhatsapp className="w-7 h-7 text-white" />
      </a>
    </>
  );
}