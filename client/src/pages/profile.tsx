import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Camera,
  RefreshCw,
  Check,
  Globe
} from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

// Countries with their flags and codes
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

const CountryFlag = ({ countryCode, className = "" }: { countryCode: string; className?: string }) => {
  const country = countries.find(c => c.code === countryCode);
  if (!country) return <Globe className={`h-4 w-4 ${className}`} />;
  
  return (
    <span className={`text-base ${className}`}>
      {country.flag}
    </span>
  );
};

// Inline editing components
const InlineEditText = ({ value, onSave, placeholder, className = "", multiline = false }: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const fixedHeight = multiline ? 'h-[4.5rem]' : 'h-[2rem]';

  return (
    <div className={`relative px-2 py-1 rounded transition-colors cursor-text hover:bg-gray-50 ${fixedHeight} ${className}`}>
      {isEditing ? (
        multiline ? (
          <textarea
            ref={inputRef as any}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="bg-transparent border-none outline-none resize-none p-0 m-0 w-auto min-w-[200px]"
            style={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit'
            }}
          />
        ) : (
          <input
            ref={inputRef as any}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="bg-transparent border-none outline-none p-0 m-0 w-auto min-w-[100px]"
            style={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit',
              width: `${Math.max(editValue.length * 0.6, 6)}ch`
            }}
          />
        )
      ) : (
        <div onClick={() => setIsEditing(true)} className="inline-block">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      )}
    </div>
  );
};

const InlineEditCountry = ({ value, onSave }: {
  value: string | null;
  onSave: (value: string | null) => void;
}) => {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const filteredCountries = useMemo(() => {
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      country.code.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const selectedCountry = countries.find(c => c.code === value);

  if (isEditing) {
    return (
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger asChild>
          <div className="inline-flex items-center justify-center w-8 h-8">
            {selectedCountry ? (
              <div className="cursor-pointer hover:bg-gray-50 p-1 rounded">
                <CountryFlag countryCode={selectedCountry.code} />
              </div>
            ) : (
              <div className="cursor-pointer hover:bg-gray-50 p-1 rounded text-gray-400">
                <Globe className="h-4 w-4" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput 
              placeholder={language === "en" ? "Search countries..." : "Buscar países..."} 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>{language === "en" ? "No country found." : "No se encontró el país."}</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-auto">
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onSave(country.code);
                    setIsEditing(false);
                    setSearchValue("");
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <CountryFlag countryCode={country.code} />
                    <span>{country.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-50 rounded transition-colors"
    >
      {selectedCountry ? (
        <CountryFlag countryCode={selectedCountry.code} />
      ) : (
        <Globe className="h-4 w-4 text-gray-400" />
      )}
    </div>
  );
};

interface ProfileData {
  id: string;
  fullName?: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  country?: string;
  role: string;
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    avatar: null as string | null,
    country: null as string | null,
    role: ""
  });
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { isConnected, disconnectWallet } = useWeb3();
  
  // State to track if user is logged out
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  // Get current user ID from localStorage
  const [currentUserId, setCurrentUserId] = useState(() => {
    const userData = localStorage.getItem('user_data');
    const loggedOut = localStorage.getItem('userLoggedOut');
    console.log('🔍 PROFILE INIT: userData in localStorage:', userData);
    console.log('🔍 PROFILE INIT: userLoggedOut flag:', loggedOut);
    
    if (userData && loggedOut !== 'true') {
      try {
        const parsed = JSON.parse(userData);
        console.log('🔍 PROFILE INIT: Parsed user data:', parsed);
        console.log('🔍 PROFILE INIT: User ID from localStorage:', parsed?.id);
        return parsed?.id;
      } catch (e) {
        console.error('🔍 PROFILE INIT: Error parsing user data:', e);
        return null;
      }
    }
    console.log('🔍 PROFILE INIT: No valid user data found, returning null');
    return null;
  });

  // Listen for localStorage changes to update current user ID
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user_data');
      const loggedOut = localStorage.getItem('userLoggedOut') === 'true';
      
      console.log('🔍 PROFILE STORAGE: Storage change detected');
      console.log('🔍 PROFILE STORAGE: userData:', userData);
      console.log('🔍 PROFILE STORAGE: loggedOut:', loggedOut);
      
      if (userData && !loggedOut) {
        try {
          const parsed = JSON.parse(userData);
          console.log('🔍 PROFILE STORAGE: Parsed user data:', parsed);
          console.log('🔍 PROFILE STORAGE: Setting userId to:', parsed?.id);
          setCurrentUserId(parsed?.id);
          setIsLoggedOut(false);
        } catch (e) {
          console.error('🔍 PROFILE STORAGE: Error parsing user data:', e);
          setCurrentUserId(null);
        }
      } else {
        console.log('🔍 PROFILE STORAGE: No valid user data, setting userId to null');
        setCurrentUserId(null);
        setIsLoggedOut(loggedOut);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch profile data for the actual logged-in user
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile", currentUserId],
    enabled: !!currentUserId && !isLoggedOut,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging for profile data fetching
  useEffect(() => {
    console.log('🔍 PROFILE QUERY: currentUserId:', currentUserId);
    console.log('🔍 PROFILE QUERY: isLoggedOut:', isLoggedOut);
    console.log('🔍 PROFILE QUERY: profileData:', profileData);
    console.log('🔍 PROFILE QUERY: profileLoading:', profileLoading);
    console.log('🔍 PROFILE QUERY: Query enabled:', !!currentUserId && !isLoggedOut);
  }, [currentUserId, isLoggedOut, profileData, profileLoading]);

  // Update profile state when data is fetched
  useEffect(() => {
    if (profileData) {
      const data = profileData as ProfileData;
      setProfile({
        name: data.fullName || data.username,
        email: data.email,
        username: data.username,
        bio: data.bio || "",
        avatar: data.avatar || null,
        country: data.country || null,
        role: data.role
      });
    }
  }, [profileData]);

  // Autosave functionality
  useEffect(() => {
    if (!profileData || !currentUserId) return; // Don't autosave until initial data is loaded and we have user ID
    
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      profileUpdateMutation.mutate(profile);
    }, 1000); // Autosave after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [profile.name, profile.email, profile.bio, profile.country]); // Only watch fields that can be edited

  // Avatar upload mutation
  const avatarUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!currentUserId) {
        throw new Error("User not logged in");
      }

      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/avatar/upload-url");
      const uploadData = await uploadResponse.json();

      // Upload file to object storage
      const uploadResult = await fetch(uploadData.uploadURL, {
        method: "PUT",
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file");
      }

      // Save avatar URL to profile
      const saveResponse = await apiRequest("POST", "/api/avatar/save", {
        userId: currentUserId,
        avatarURL: uploadData.uploadURL,
      });

      return await saveResponse.json();
    },
    onSuccess: (userData: any) => {
      setProfile(prev => ({
        ...prev,
        avatar: userData.avatar
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/profile", currentUserId] });
      toast({
        title: language === "en" ? "Photo uploaded" : "Foto subida",
        description: language === "en" ? "Your profile photo has been updated successfully." : "Tu foto de perfil ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Avatar upload error:", error);
      toast({
        title: language === "en" ? "Upload failed" : "Error al subir",
        description: language === "en" ? "Failed to upload your photo. Please try again." : "Error al subir tu foto. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!currentUserId) {
        throw new Error("User not logged in");
      }

      const response = await apiRequest("PATCH", `/api/profile/${currentUserId}`, {
        fullName: profileData.name,
        username: profileData.username,
        email: profileData.email,
        bio: profileData.bio,
        country: profileData.country,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", currentUserId] });
      setAutoSaveStatus('saved');
      // Clear saved status after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      setAutoSaveStatus('idle');
      toast({
        title: language === "en" ? "Autosave failed" : "Error al guardar",
        description: language === "en" ? "Failed to save profile changes. Please try again." : "Error al guardar los cambios del perfil. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      avatarUploadMutation.mutate(file);
    }
  };

  // Removed manual save - now using autosave

  const isLoading = profileUpdateMutation.isPending || avatarUploadMutation.isPending;

  if (profileLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header 
            title={language === "en" ? "Profile" : "Perfil"} 
            subtitle={language === "en" ? "Manage your personal information and account details" : "Gestiona tu información personal y detalles de cuenta"}
          />
          <div className="p-6 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Profile" 
          subtitle="Manage your personal information and account details"
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Profile Settings */}
          <Card data-testid="profile-settings-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" data-testid="profile-settings-title">
                <User className="h-5 w-5" />
                <span>{language === "en" ? "Profile Settings" : "Configuración del Perfil"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Avatar className="w-20 h-20" data-testid="profile-avatar">
                      {profile.avatar && <AvatarImage src={`/objects/${profile.avatar.replace('/objects/', '')}`} alt={profile.name} />}
                      <AvatarFallback className="bg-gray-100 text-gray-400">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    {/* Hover overlay with camera icon */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    {/* Hidden file input */}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      data-testid="input-avatar-upload"
                    />
                  </div>
                  {/* Country flag under profile photo */}
                  <InlineEditCountry
                    value={profile.country}
                    onSave={(value) => setProfile(prev => ({ ...prev, country: value }))}
                  />
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Inline editable name */}
                  <InlineEditText
                    value={profile.name}
                    onSave={(value) => setProfile(prev => ({ ...prev, name: value }))}
                    placeholder={language === "en" ? "Enter your name" : "Ingresa tu nombre"}
                    className="text-lg font-semibold text-foreground"
                  />
                  
                  {/* Inline editable email */}
                  <InlineEditText
                    value={profile.email}
                    onSave={(value) => setProfile(prev => ({ ...prev, email: value }))}
                    placeholder={language === "en" ? "Enter your email" : "Ingresa tu correo electrónico"}
                    className="text-sm text-cyan-600"
                  />
                  
                  {/* Inline editable bio */}
                  {profile.bio ? (
                    <InlineEditText
                      value={profile.bio}
                      onSave={(value) => setProfile(prev => ({ ...prev, bio: value }))}
                      placeholder={language === "en" ? "Tell us about yourself..." : "Cuéntanos sobre ti..."}
                      className="text-sm text-muted-foreground"
                      multiline={true}
                    />
                  ) : (
                    <InlineEditText
                      value={profile.bio}
                      onSave={(value) => setProfile(prev => ({ ...prev, bio: value }))}
                      placeholder={language === "en" ? "Enter your bio here" : "Ingresa tu biografía aquí"}
                      className="text-sm text-muted-foreground"
                      multiline={true}
                    />
                  )}
                </div>
              </div>


              {/* Autosave status indicator */}
              <div className="flex items-center justify-center py-2">
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{language === "en" ? "Saving changes..." : "Guardando cambios..."}</span>
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">{language === "en" ? "Changes saved automatically" : "Cambios guardados automáticamente"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}