import { Bell, Wallet, Loader2, User, LogOut, Settings, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import parceroLogo from "@/assets/parcero-logo-rectangle_1756574770152.png";

interface HeaderProps {
  tokenBalance?: string;
}

export default function Header({ tokenBalance = "1,247" }: HeaderProps) {
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  
  // Check if user is logged out from localStorage
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  // Listen for localStorage changes and update state immediately
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user_data');
      const loggedOut = localStorage.getItem('userLoggedOut') === 'true';
      
      // Update user data state immediately
      if (userData && !loggedOut) {
        try {
          const parsed = JSON.parse(userData);
          setCurrentUserData(parsed);
          setIsLoggedOut(false);
        } catch (e) {
          setCurrentUserData(null);
        }
      } else {
        setCurrentUserData(null);
        setIsLoggedOut(loggedOut);
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Check on mount and set up interval to check periodically for consistency
    handleStorageChange();
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Get current user data from localStorage with immediate state updates
  const [currentUserData, setCurrentUserData] = useState(() => {
    const userData = localStorage.getItem('user_data');
    if (userData && !localStorage.getItem('userLoggedOut')) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const currentUserId = currentUserData?.id;
  
  // Fetch user profile for avatar - only if we don't have local data
  const { data: apiProfileData, isError, isLoading } = useQuery({
    queryKey: ["/api/profile", currentUserId],
    enabled: !!currentUserId && !isLoggedOut && !currentUserData,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use localStorage data first, then API data as fallback
  const profileData = currentUserData || apiProfileData;

  // Debug logging to understand state
  useEffect(() => {
    console.log('Header State:', { 
      isLoggedOut, 
      hasProfileData: !!profileData,
      hasLocalData: !!currentUserData,
      hasApiData: !!apiProfileData,
      isError 
    });
  }, [isLoggedOut, profileData, currentUserData, apiProfileData, isError]);
  
  // Update localStorage when we get new profile data from API
  useEffect(() => {
    if (apiProfileData && (apiProfileData as any)?.id && !currentUserData) {
      localStorage.setItem('user_data', JSON.stringify(apiProfileData));
      localStorage.removeItem('userLoggedOut');
      setCurrentUserData(apiProfileData);
      setIsLoggedOut(false);
    }
  }, [apiProfileData, currentUserData]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint (if it exists)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (e) {
        // Logout endpoint might not exist, continue anyway
      }
      
      // Clear any local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('userLoggedOut');
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Set logged out state persistently and clear user data immediately
      setCurrentUserData(null);
      setIsLoggedOut(true);
      localStorage.setItem('userLoggedOut', 'true');
      
      // Clear query cache for profile data immediately
      queryClient.setQueryData(["/api/profile", currentUserId], null);
      queryClient.removeQueries({ queryKey: ["/api/profile"] });
      queryClient.clear();
      
      // Disconnect wallet to clear authentication state
      await disconnectWallet();
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to home page
      setLocation('/');  
      setMobileMenuOpen(false);
      
      // Force page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, still redirect
      setLocation('/');
      setMobileMenuOpen(false);
    }
  };

  const isLoggedIn = !isLoggedOut && profileData && (profileData as any)?.id;

  return (
    <>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-6 h-16" data-testid="header">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-8">
            {/* Logo - Show on all public pages and checkout */}
            {(!location?.startsWith('/dashboard') && !location?.startsWith('/courses') && !location?.startsWith('/community') && !location?.startsWith('/tokens') && !location?.startsWith('/settings') && !location?.startsWith('/profile') && !location?.startsWith('/cms')) && (
              <Link href="/">
                <img 
                  src={parceroLogo} 
                  alt="Parcero.eco" 
                  className="rounded object-contain cursor-pointer"
                  style={{ height: '42px', width: 'auto' }}
                  onError={(e) => {
                    // Fallback if logo fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.textContent = 'PARCERO';
                    fallback.className = 'text-xl font-bold text-primary';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </Link>
            )}
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Link href="/public-courses">
                <Button variant="ghost" className={`hover:bg-[#CDEDF6] ${location === '/public-courses' || location?.startsWith('/course/') ? 'bg-[#CDEDF6]' : ''}`} data-testid="nav-courses">
                  {language === "en" ? "Courses" : "Cursos"}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className={`hover:bg-[#CDEDF6] ${location === '/pricing' ? 'bg-[#CDEDF6]' : ''}`} data-testid="nav-pricing">
                  {language === "en" ? "Pricing" : "Precios"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            
            {/* PARCERO Balance - Only show when logged in */}
            {isLoggedIn && (
              <Link href="/tokens">
                <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors" data-testid="header-balance">
                  <span className="text-sm font-bold text-primary">
                    {(profileData as any)?.tokenBalance ? Math.floor(parseFloat((profileData as any).tokenBalance)).toLocaleString() : "0"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PARCERO
                  </span>
                </div>
              </Link>
            )}
            
            {/* Notifications - Only show when logged in */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-[#CDEDF6]"
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-[#CDEDF6]" data-testid="button-language-switcher">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "EN" : "ES"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="language-english">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="language-spanish">
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile Dropdown/Mobile Menu */}
            {isLoggedIn ? (
              <>
                {/* Desktop Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all" data-testid="profile-photo">
                        {(profileData as any)?.avatar && (
                          <AvatarImage 
                            src={(profileData as any).avatar} 
                            alt="Profile" 
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{language === "en" ? "Dashboard" : "Panel"}</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]">
                          <User className="mr-2 h-4 w-4" />
                          <span>{language === "en" ? "Profile" : "Perfil"}</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{language === "en" ? "Log out" : "Cerrar sesión"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Side Drawer */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all" data-testid="profile-photo-mobile">
                        {(profileData as any)?.avatar && (
                          <AvatarImage 
                            src={(profileData as any).avatar} 
                            alt="Profile" 
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                      <div className="flex flex-col space-y-4 mt-8">
                        <Link href="/dashboard">
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#CDEDF6] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                            <BarChart3 className="h-5 w-5" />
                            <span>{language === "en" ? "Dashboard" : "Panel"}</span>
                          </div>
                        </Link>
                        <Link href="/profile">
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#CDEDF6] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-5 w-5" />
                            <span>{language === "en" ? "Profile" : "Perfil"}</span>
                          </div>
                        </Link>
                        <div className="border-t pt-4">
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#CDEDF6] cursor-pointer" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                            <span>{language === "en" ? "Log out" : "Cerrar sesión"}</span>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hover:bg-[#CDEDF6] hover:text-foreground" data-testid="button-login">
                    {language === "en" ? "Log In" : "Iniciar Sesión"}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#2f6a75] text-[#fff] hover:opacity-90" size="sm" data-testid="button-signup">
                    {language === "en" ? "Sign Up" : "Registrarse"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
