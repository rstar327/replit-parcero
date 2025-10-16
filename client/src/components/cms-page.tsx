import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useWeb3 } from "@/hooks/use-web3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu, 
  X, 
  ArrowLeft,
  Globe,
  Bell,
  User,
  LogOut,
  BarChart3,
  Wallet,
  Loader2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { YouTubeVideo } from "@/components/ui/youtube-video";

interface CMSPageProps {
  slug: string;
  defaultTitle?: string;
  defaultContent?: string;
  showBackButton?: boolean;
  backTo?: string;
}

export function CMSPage({ slug, defaultTitle = "Page", defaultContent = "", showBackButton = false, backTo = "/pricing" }: CMSPageProps) {
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("en");

  // Fetch user profile for avatar - only when connected
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected,
  });

  // Fetch CMS content for the specified page
  const { data: cmsPages } = useQuery({
    queryKey: ["/api/cms/pages"],
    enabled: true,
  });

  // Get page content from CMS
  const page = Array.isArray(cmsPages) ? cmsPages.find((page: any) => page.slug === slug && page.language === language) : null;
  const pageContent = page?.content;

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
      
      // Disconnect wallet to clear authentication state
      await disconnectWallet();
      
      // Redirect to home page
      setLocation('/');  
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, still redirect
      setLocation('/');
      setMobileMenuOpen(false);
    }
  };

  const handleBack = () => {
    setLocation(backTo);
  };

  // Parse content for videos
  const renderContent = (content: any) => {
    if (!content) return null;

    const text = content.text || defaultContent;
    const videos = content.videos || [];

    return (
      <div className="space-y-6">
        {text && (
          <div className="prose prose-lg max-w-none">
            {text.split('\n').map((paragraph: string, index: number) => {
              if (!paragraph.trim()) return null;
              
              // Check if paragraph contains a YouTube URL
              const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#\s]+)/;
              const match = paragraph.match(youtubePattern);
              
              if (match) {
                return (
                  <div key={index} className="mb-4">
                    <YouTubeVideo url={paragraph.trim()} />
                  </div>
                );
              }
              
              return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
            })}
          </div>
        )}
        
        {videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((videoUrl: string, index: number) => (
              <YouTubeVideo key={index} url={videoUrl} />
            ))}
          </div>
        )}

        {/* Render structured content like policy points */}
        {content.policy && Array.isArray(content.policy) && (
          <Card>
            <CardHeader>
              <CardTitle>Policy Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.policy.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b sticky top-0 z-50 bg-[#fff]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <img 
                src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
                alt="Parcero.eco" 
                className="rounded object-contain cursor-pointer"
                style={{ height: '42px', width: 'auto' }}
              />
            </Link>
            
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            {/* Search Bar and Navigation */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-9 bg-white dark:bg-background"
                  data-testid="input-search-courses"
                />
              </div>
              <Link href="/public-courses">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-courses">Courses</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-pricing">Pricing</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* PARCERO Balance */}
            <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg" data-testid="header-balance">
              <span className="text-sm font-bold text-primary">
                {tokenInfo?.balance ? Math.floor(parseFloat(tokenInfo.balance)).toLocaleString() : "0"}
              </span>
              <span className="text-xs text-muted-foreground">
                PARCERO
              </span>
            </div>
            

            {/* User Profile or Sign Up */}
            {profileData ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:inline-flex relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </Button>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all" data-testid="profile-photo">
                        {(profileData as any)?.avatar && (
                          <AvatarImage 
                            src={`/objects/${(profileData as any).avatar.replace('/objects/', '')}`} 
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
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#CDEDF6]">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-[#CDEDF6]">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Sheet */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="mobile-menu-button">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <nav className="flex flex-col space-y-4">
                        <Link href="/public-courses">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            Courses
                          </Button>
                        </Link>
                        <Link href="/pricing">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            Pricing
                          </Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-button">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && !profileData && (
          <div className="md:hidden py-4 border-t bg-white">
            <div className="container mx-auto px-4 flex flex-col space-y-2">
              <Link href="/public-courses">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-courses">
                  Courses
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-nav-pricing">
                  Pricing
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{page?.title || defaultTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{page?.excerpt || pageContent?.text || defaultContent}</p>
        </div>

        {/* Page Content */}
        <div className="max-w-4xl mx-auto">
          {renderContent(pageContent)}
        </div>
      </main>

      {/* WhatsApp Widget */}
      <a
        href="https://wa.me/1234567890?text=Hi%2C%20I%27m%20interested%20in%20learning%20more%20about%20Parcero.eco"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20b456] rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        data-testid="whatsapp-widget"
      >
        <FaWhatsapp className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}