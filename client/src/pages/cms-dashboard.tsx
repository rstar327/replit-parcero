import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CMSLayout from "@/components/layout/cms-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Globe,
  Save,
  ArrowLeft,
  Video,
  Users,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Search,
  DollarSign,
  Coins,
  TrendingUp,
  Activity,
  Calendar,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";

// Language Editor Component
function LanguageEditor({ language, page, slug, onSave }: { 
  language: string; 
  page: any; 
  slug: string;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: page?.title || "",
    content: page?.content?.text || "",
    excerpt: page?.excerpt || "",
    status: page?.status || "draft"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: async () => {
      const requestData = {
        title: formData.title,
        slug: slug,
        content: { text: formData.content },
        excerpt: formData.excerpt,
        status: formData.status,
        language: language
      };
      
      if (page?.id) {
        return await apiRequest("PUT", `/api/cms/pages/${page.id}`, requestData);
      } else {
        return await apiRequest("POST", "/api/cms/pages", requestData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${language.toUpperCase()} content saved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      onSave();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    },
  });
  
  // Smart autosave with proper debouncing and duplicate prevention
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Silent autosave mutation (no toast notifications)
  const autosaveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/cms/pages/${page?.id}`, {
        ...formData,
        lastModified: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      // Silent invalidation - no toast for autosave
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      setAutosaveStatus('saved');
      // Hide saved indicator after 2 seconds
      setTimeout(() => setAutosaveStatus('idle'), 2000);
    },
    onError: () => {
      // Silent error handling for autosave
      isSavingRef.current = false;
      setAutosaveStatus('idle');
    },
    onSettled: () => {
      isSavingRef.current = false;
    }
  });

  const debouncedAutosave = useCallback(() => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      const dataString = JSON.stringify(formData);
      
      // Only save if data changed, has content, and not already saving
      if (dataString !== lastSavedDataRef.current && 
          !isSavingRef.current && 
          formData.title?.trim() && 
          page?.id) {
        isSavingRef.current = true;
        lastSavedDataRef.current = dataString;
        setAutosaveStatus('saving');
        autosaveMutation.mutate();
      }
    }, 2000); // 2 second delay for pages
  }, [formData, page?.id, autosaveMutation]);

  // Autosave when form data changes
  useEffect(() => {
    if (page && formData.title?.trim() && !updateMutation.isPending && !autosaveMutation.isPending) {
      debouncedAutosave();
    }
  }, [formData, debouncedAutosave, page, updateMutation.isPending, autosaveMutation.isPending]);

  // Update last saved data when page loads
  useEffect(() => {
    if (page) {
      lastSavedDataRef.current = JSON.stringify(formData);
    }
  }, [page]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-4">
      {!page && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This language version doesn't exist yet. Fill out the form below to create it.
          </p>
        </div>
      )}
      
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          placeholder="Page title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          data-testid={`input-${language}-title`}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Content</label>
        <Textarea
          placeholder="Page content... You can paste YouTube URLs directly and they will be embedded automatically"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="min-h-32"
          data-testid={`textarea-${language}-content`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          <Video className="h-3 w-3 inline mr-1" />
          Tip: Paste YouTube URLs directly (e.g., https://youtu.be/VIDEO_ID)
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">Excerpt</label>
        <Textarea
          placeholder="Brief description of the page"
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          data-testid={`textarea-${language}-excerpt`}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger data-testid={`select-${language}-status`}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Autosave Status Indicator */}
      <div className="flex justify-end items-center space-x-2 text-sm">
        {autosaveStatus === 'saving' && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Auto-saving...
          </div>
        )}
        {autosaveStatus === 'saved' && (
          <div className="flex items-center text-green-600">
            <div className="h-3 w-3 bg-green-600 rounded-full mr-2"></div>
            Auto-saved
          </div>
        )}
        {autosaveStatus === 'idle' && page && (
          <div className="text-muted-foreground">
            Changes auto-save as you type
          </div>
        )}
      </div>
    </div>
  );
}

export default function CMSDashboard() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("pages");
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [editingLanguage, setEditingLanguage] = useState<string>("en");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [pageFormData, setPageFormData] = useState({
    title: "",
    slug: "",
    content: {},
    excerpt: "",
    status: "draft",
    language: "en",
    metaTitle: "",
    metaDescription: ""
  });
  const [contentText, setContentText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const section = urlParams.get('section');
    if (section) {
      // Map section parameter to tab values
      const sectionMap: Record<string, string> = {
        'pages': 'pages',
        'courses': 'courses', 
        'analytics': 'analytics',
        'users': 'users',
        'logs': 'activity',
        'settings': 'settings'
      };
      const mappedTab = sectionMap[section] || 'pages';
      setActiveTab(mappedTab);
    }
  }, [location]);

  // Fetch CMS pages
  const { data: cmsPages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/cms/pages"],
  });

  // Fetch courses for CMS management
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const coursesResponse = await apiRequest("GET", "/api/courses");
      const coursesData = await coursesResponse.json();
      // Fetch modules for each course
      const coursesWithModules = await Promise.all(
        coursesData.map(async (course: any) => {
          const modulesResponse = await apiRequest("GET", `/api/courses/${course.id}/modules`);
          const modules = await modulesResponse.json();
          return { ...course, modules };
        })
      );
      return coursesWithModules;
    }
  });

  // Utility functions
  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      en: "🇺🇸",
      es: "🇪🇸"
    };
    return flags[lang] || "🌐";
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const extractYouTubeUrls = (text: string): string[] => {
    const youtubeUrlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)\w+)/g;
    const matches = text.match(youtubeUrlPattern);
    return matches || [];
  };

  const handleTitleChange = (title: string) => {
    setPageFormData(prev => ({
      ...prev,
      title,
      slug: generateSlugFromTitle(title)
    }));
  };

  // Mutations
  const createPageMutation = useMutation({
    mutationFn: async (pageData: any) => {
      const response = await apiRequest("POST", "/api/cms/pages", pageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Success",
        description: "Page created successfully",
      });
      resetPageForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive",
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/cms/pages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
      setSelectedPage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive",
      });
    },
  });

  const syncExistingPagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cms/sync-existing-pages");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Success",
        description: `Imported ${data.count} existing pages into CMS`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync existing pages",
        variant: "destructive",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await apiRequest("DELETE", `/api/cms/pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    },
  });

  const resetPageForm = () => {
    setPageFormData({
      title: "",
      slug: "",
      content: {},
      excerpt: "",
      status: "draft",
      language: "en",
      metaTitle: "",
      metaDescription: ""
    });
    setContentText("");
    setSelectedPage(null);
  };

  const handleCreatePage = () => {
    createPageMutation.mutate({
      ...pageFormData,
      content: { text: contentText, videos: extractYouTubeUrls(contentText) }
    });
  };

  const handleUpdatePage = () => {
    if (selectedPage) {
      updatePageMutation.mutate({ 
        id: selectedPage.id, 
        ...pageFormData,
        content: { text: contentText, videos: extractYouTubeUrls(contentText) }
      });
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };


  return (
    <CMSLayout activeSection={activeTab}>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">
            Create and manage your website pages and courses with multi-language support
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Update URL when tab changes
          const sectionParam = value === 'pages' ? '' : `?section=${value}`;
          setLocation(`/cms${sectionParam}`);
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pages" data-testid="tab-pages">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Manage Pages</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => syncExistingPagesMutation.mutate()}
                  disabled={syncExistingPagesMutation.isPending}
                  data-testid="button-sync-pages"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Import Existing Pages
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-page">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Page</DialogTitle>
                      <DialogDescription>
                        Create a new page for your website
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          placeholder="Page title"
                          value={pageFormData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          data-testid="input-page-title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                          placeholder="page-url-slug"
                          value={pageFormData.slug}
                          onChange={(e) => setPageFormData(prev => ({ ...prev, slug: e.target.value }))}
                          data-testid="input-page-slug"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        <Select 
                          value={pageFormData.language} 
                          onValueChange={(value) => setPageFormData(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger data-testid="select-page-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                          placeholder="Page content... You can paste YouTube URLs directly and they will be embedded automatically"
                          value={contentText}
                          onChange={(e) => setContentText(e.target.value)}
                          className="min-h-32"
                          data-testid="textarea-page-content"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          <Video className="h-3 w-3 inline mr-1" />
                          Tip: Paste YouTube URLs directly (e.g., https://youtu.be/VIDEO_ID)
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Excerpt</label>
                        <Textarea
                          placeholder="Brief description of the page"
                          value={pageFormData.excerpt}
                          onChange={(e) => setPageFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                          data-testid="textarea-page-excerpt"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select 
                          value={pageFormData.status} 
                          onValueChange={(value) => setPageFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger data-testid="select-page-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={resetPageForm}
                          data-testid="button-cancel-page"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePage}
                          disabled={createPageMutation.isPending}
                          data-testid="button-save-page"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Create Page
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Pages List - Grouped by Slug */}
            <div className="grid gap-4">
              {pagesLoading ? (
                <div className="text-center py-8">Loading pages...</div>
              ) : (cmsPages as any[]).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pages yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first page or import existing pages to get started
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (() => {
                  // Group pages by base slug (remove language suffix)
                  const groupedPages = (cmsPages as any[]).reduce((acc: any, page: any) => {
                    // Remove language suffix from slug (e.g., "refund-policy-es" -> "refund-policy")
                    const baseSlug = page.slug.replace(/-es$/, '').replace(/-en$/, '');
                    if (!acc[baseSlug]) {
                      acc[baseSlug] = {};
                    }
                    acc[baseSlug][page.language || 'en'] = page;
                    return acc;
                  }, {});

                  return Object.entries(groupedPages).map(([baseSlug, languages]: [string, any]) => (
                    <Card key={baseSlug}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {languages.en?.title || languages.es?.title || 'Untitled Page'}
                              <Badge variant={(languages.en?.status || languages.es?.status) === 'published' ? 'default' : 'secondary'}>
                                {languages.en?.status || languages.es?.status || 'draft'}
                              </Badge>
                            </CardTitle>
                            <CardDescription>/{baseSlug}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPage({ slug: baseSlug, languages })}
                              data-testid={`button-edit-page-${baseSlug}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Delete all language versions of this page
                                Object.values(languages).forEach((page: any) => {
                                  deletePageMutation.mutate(page.id);
                                });
                              }}
                              data-testid={`button-delete-page-${baseSlug}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-2">
                          {languages.en && <Badge variant="outline">🇺🇸 English</Badge>}
                          {languages.es && <Badge variant="outline">🇪🇸 Spanish</Badge>}
                        </div>
                        {(languages.en?.excerpt || languages.es?.excerpt) && (
                          <p className="text-sm text-muted-foreground">
                            {languages.en?.excerpt || languages.es?.excerpt}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ));
                })()
              )}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Manage Courses</h3>
              <Button data-testid="button-create-course">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Completion Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading courses...
                        </TableCell>
                      </TableRow>
                    ) : (courses as any[]).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Create your first course to get started
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (courses as any[]).flatMap((course: any) => {
                        const isExpanded = expandedCourses.has(course.id);
                        const rows = [
                          <TableRow key={course.id}>
                            <TableCell>
                              <div 
                                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => toggleCourseExpansion(course.id)}
                                data-testid={`title-course-${course.id}`}
                              >
                                <div className="flex-shrink-0">
                                  {course.modules && course.modules.length > 0 ? (
                                    isExpanded ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    )
                                  ) : (
                                    <div className="w-4 h-4"></div>
                                  )}
                                </div>
                                {course.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{course.category}</Badge>
                            </TableCell>
                            <TableCell>{course.price || 0} tokens</TableCell>
                            <TableCell>+{course.completionReward || 0}</TableCell>
                            <TableCell>
                              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                                {course.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-edit-course-${course.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-delete-course-${course.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ];

                        // Add module rows if expanded
                        if (isExpanded && course.modules && course.modules.length > 0) {
                          course.modules.forEach((module: any, index: number) => {
                            rows.push(
                              <TableRow key={`${course.id}-module-${module.id}`} className="bg-muted/30">
                                <TableCell className="pl-12">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full text-xs">
                                      {index + 1}
                                    </div>
                                    {module.title}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">Module</Badge>
                                </TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>+{module.tokenReward || 1}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">Module</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      data-testid={`button-edit-module-${module.id}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      data-testid={`button-delete-module-${module.id}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        }

                        return rows;
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h3 className="text-lg font-medium">Content Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Total Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(cmsPages as any[]).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {(cmsPages as any[]).filter((p: any) => p.status === 'published').length} published
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Total Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(courses as any[]).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {(courses as any[]).filter((c: any) => c.isPublished).length} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Content Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Published</span>
                      <span>{(cmsPages as any[]).filter((p: any) => p.status === 'published').length + (courses as any[]).filter((c: any) => c.isPublished).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Draft</span>
                      <span>{(cmsPages as any[]).filter((p: any) => p.status === 'draft').length + (courses as any[]).filter((c: any) => !c.isPublished).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Database Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        Export Database
                      </CardTitle>
                      <CardDescription>
                        Download a complete backup of your database including users, courses, modules, pages, and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/database/export', { 
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `parcero-database-${new Date().toISOString().split('T')[0]}.json`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              
                              toast({
                                title: "Export successful",
                                description: "Your database backup has been downloaded",
                              });
                            } else {
                              throw new Error('Export failed');
                            }
                          } catch (error) {
                            toast({
                              title: "Export failed",
                              description: "Unable to create database backup. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        data-testid="button-export-database"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Database
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        </div>
                        Import Database
                      </CardTitle>
                      <CardDescription>
                        Restore data from a previous database backup. This will merge the backup data with existing data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept=".json"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              const text = await file.text();
                              const importData = JSON.parse(text);
                              
                              const response = await fetch('/api/database/import', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(importData)
                              });

                              const result = await response.json();
                              
                              if (response.ok) {
                                // Handle different response formats safely
                                const importCount = result.results ? 
                                  Object.values(result.results).reduce((sum: number, count: number) => sum + count, 0) :
                                  result.imported ? 
                                  Object.values(result.imported).reduce((sum: number, count: number) => sum + count, 0) :
                                  0;
                                
                                toast({
                                  title: "Import successful",
                                  description: result.message || `Imported ${importCount} items`,
                                });
                                // Refresh the page data
                                queryClient.invalidateQueries();
                              } else {
                                throw new Error(result.error || result.message || 'Import failed');
                              }
                            } catch (error) {
                              toast({
                                title: "Import failed",
                                description: error instanceof Error ? error.message : "Unable to import database backup. Please check the file format.",
                                variant: "destructive"
                              });
                            }
                            
                            // Reset file input
                            e.target.value = '';
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          data-testid="input-import-database"
                        />
                        <p className="text-xs text-muted-foreground">
                          Select a JSON database backup file to import
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <Trash2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        Clean Up Users
                      </CardTitle>
                      <CardDescription className="text-orange-600 dark:text-orange-400">
                        Remove duplicate users and keep only admin@parcero.eco as the sole admin user
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900" 
                        onClick={async () => {
                          if (!confirm('This will delete all users except admin@parcero.eco. Are you sure?')) {
                            return;
                          }
                          
                          try {
                            const response = await fetch('/api/database/cleanup-users', { 
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              toast({
                                title: "Cleanup successful",
                                description: result.message,
                              });
                            } else {
                              const error = await response.json();
                              throw new Error(error.error || 'Cleanup failed');
                            }
                          } catch (error) {
                            toast({
                              title: "Cleanup failed",
                              description: error instanceof Error ? error.message : "Failed to cleanup users",
                              variant: "destructive",
                            });
                          }
                        }}
                        data-testid="button-cleanup-users"
                      >
                        Clean Up Users
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{(cmsPages as any[]).length}</div>
                      <p className="text-xs text-muted-foreground">CMS Pages</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{(courses as any[]).length}</div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {(courses as any[]).reduce((total, course) => total + (course.modules?.length || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Modules</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Page Dialog with Language Tabs */}
      {selectedPage && (
        <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Page: {selectedPage.slug}</DialogTitle>
              <DialogDescription>
                Manage content for different languages
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={editingLanguage} onValueChange={setEditingLanguage} className="space-y-6">
              <TabsList>
                <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                <TabsTrigger value="es">🇪🇸 Spanish</TabsTrigger>
              </TabsList>
              
              {/* English Tab */}
              <TabsContent value="en" className="space-y-4">
                <LanguageEditor
                  language="en"
                  page={selectedPage.languages?.en}
                  slug={selectedPage.slug}
                  onSave={() => {}}
                />
              </TabsContent>
              
              {/* Spanish Tab */}
              <TabsContent value="es" className="space-y-4">
                <LanguageEditor
                  language="es"
                  page={selectedPage.languages?.es}
                  slug={selectedPage.slug}
                  onSave={() => {}}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedPage(null)}
                data-testid="button-close-edit-page"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </CMSLayout>
  );
}