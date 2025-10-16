import { Link, useLocation } from "wouter";
import { 
  GraduationCap, 
  BarChart3, 
  BookOpen, 
  Edit, 
  Coins, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import parceroLogo from "@/assets/parcero-logo-rectangle_1756574770152.png";

const getNavigation = (language: string) => [
  { name: language === "en" ? "Dashboard" : "Panel", href: "/dashboard", icon: BarChart3 },
  { name: language === "en" ? "My Courses" : "Mis Cursos", href: "/courses", icon: BookOpen },
  { name: language === "en" ? "Community" : "Comunidad", href: "/community", icon: Users },
  { name: language === "en" ? "My Tokens" : "Mis Tokens", href: "/tokens", icon: Coins },
  { name: language === "en" ? "Settings" : "Configuración", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language } = useLanguage();
  const navigation = getNavigation(language);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={cn(
      "border-r border-border flex flex-col text-[#000] bg-[#ebf4f7] transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )} data-testid="sidebar">
      <div className="h-16 border-b border-border">
        <div className="flex items-center justify-between h-full pl-4 pr-2">
          {!isCollapsed && (
            <Link href="/">
              <img 
                src={parceroLogo} 
                alt="Parcero.eco" 
                className="rounded object-contain hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: '42px', width: 'auto', minHeight: '42px', maxHeight: '42px' }}
                data-testid="logo-icon" 
              />
            </Link>
          )}
          
          <button
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-md hover:bg-[#e1eff2] transition-all duration-200 flex items-center justify-center"
            data-testid="sidebar-toggle"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-black" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-black" />
            )}
          </button>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2" data-testid="nav-menu">
        {navigation.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center rounded-lg transition-colors space-x-3 px-4 py-3 pt-[6px] pb-[6px] pl-[6px] pr-[6px] mt-[6px] mb-[6px]",
                isCollapsed ? "justify-center" : "",
                isActive
                  ? "bg-[#e1eff2] text-foreground"
                  : "text-muted-foreground hover:bg-[#e1eff2] hover:text-foreground"
              )} data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span className="text-[#042A2B] text-[15px] ml-[6px] mr-[6px] mt-[2px] mb-[2px]">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
