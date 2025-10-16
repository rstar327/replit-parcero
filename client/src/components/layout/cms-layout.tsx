import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  FileText,
  BookOpen,
  BarChart3,
  Users,
  Activity,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import parceroLogo from "@/assets/parcero-logo-rectangle_1756574770152.png";

interface CMSLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  headerActions?: React.ReactNode;
}

const sidebarItems = [
  { id: "pages", label: "Pages", icon: FileText, href: "/cms?section=pages" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/cms?section=courses" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/cms?section=analytics" },
  { id: "users", label: "Users", icon: Users, href: "/cms?section=users" },
  { id: "logs", label: "Activity Logs", icon: Activity, href: "/cms?section=logs" },
  { id: "settings", label: "Settings", icon: Settings, href: "/cms?section=settings" },
];

export default function CMSLayout({ children, activeSection, headerActions }: CMSLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setLocation('/')}
              className="flex items-center hover:opacity-80 transition-opacity"
              data-testid="logo-home-link"
            >
              <img 
                src={parceroLogo} 
                alt="Parcero.eco" 
                className="rounded object-contain"
                style={{ height: '32px', width: 'auto' }}
              />
            </button>
          </div>
          
          {/* Header Actions (like Save button) */}
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-card min-h-full">
          <nav className="sticky top-16 flex-1 p-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto" data-testid="desktop-sidebar">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || 
                (item.id === "pages" && !activeSection);
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    window.history.pushState({}, '', item.href);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r bg-card shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  onClick={() => {
                    setLocation('/');
                    setSidebarOpen(false);
                  }}
                  className="flex items-center hover:opacity-80 transition-opacity"
                  data-testid="mobile-logo-home-link"
                >
                  <img 
                    src={parceroLogo} 
                    alt="Parcero.eco" 
                    className="rounded object-contain"
                    style={{ height: '28px', width: 'auto' }}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  data-testid="button-close-mobile-menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-2" data-testid="mobile-sidebar">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id || 
                    (item.id === "pages" && !activeSection);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        window.history.pushState({}, '', item.href);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                      data-testid={`mobile-nav-${item.id}`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}