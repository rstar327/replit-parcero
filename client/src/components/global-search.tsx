import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  // Fetch courses with their modules to calculate real duration
  const { data: courses, isLoading } = useQuery<Array<{
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
    modules?: Array<{ duration: number }>;
  }>>({
    queryKey: ["/api/courses", { published: true }],
  });

  // Generate autocomplete suggestions
  const suggestions = courses?.filter((course) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (searchLower.length < 2) return false;
    
    return course.title.toLowerCase().includes(searchLower) ||
           course.category.toLowerCase().includes(searchLower) ||
           course.difficulty.toLowerCase().includes(searchLower);
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

  return (
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder={language === "en" ? "Search courses..." : "Buscar cursos..."}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="pl-10 h-9 bg-white dark:bg-background"
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
                  <div className="font-medium text-sm">{course.title}</div>
                  <div className="text-xs text-muted-foreground">{course.category}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {parseFloat(course.price).toLocaleString()} {parseFloat(course.price) === 1 ? 'token' : 'tokens'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}