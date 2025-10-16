import { useState, useEffect } from "react";
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
import CourseManagement from "@/components/cms/course-management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Pencil,
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

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title ({language.toUpperCase()})</label>
        <Input
          placeholder="Page title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          data-testid={`input-${language}-title`}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Content ({language.toUpperCase()})</label>
        <Textarea
          placeholder="Page content..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={6}
          data-testid={`textarea-${language}-content`}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Excerpt ({language.toUpperCase()})</label>
        <Textarea
          placeholder="Brief description..."
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={2}
          data-testid={`textarea-${language}-excerpt`}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger data-testid={`select-${language}-status`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={() => updateMutation.mutate()} 
        disabled={updateMutation.isPending}
        data-testid={`button-save-${language}`}
      >
        <Save className="h-4 w-4 mr-2" />
        {updateMutation.isPending ? "Saving..." : `Save ${language.toUpperCase()}`}
      </Button>
    </div>
  );
}

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [activeSection, setActiveSection] = useState(() => {
    // Initialize activeSection from URL on first load
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    return (section && ['pages', 'courses', 'analytics', 'users', 'logs', 'settings'].includes(section)) ? section : 'pages';
  });
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  
  // Listen for URL changes
  useEffect(() => {
    const updateSection = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section && ['pages', 'courses', 'analytics', 'users', 'logs', 'settings'].includes(section)) {
        setActiveSection(section);
      } else {
        setActiveSection('pages');
      }
    };

    // Initial check
    updateSection();

    // Listen for navigation events
    window.addEventListener('popstate', updateSection);
    
    return () => {
      window.removeEventListener('popstate', updateSection);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<{id: string, title: string} | null>(null);

  // Fetch CMS pages
  const { data: cmsPages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/cms/pages"],
    enabled: true,
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      const data = await response.json();
      return data;
    },
    staleTime: 0, // Force fresh data
    enabled: true,
  });


  // Fetch modules for each course separately
  const { data: allModules = {} } = useQuery({
    queryKey: ["/api/courses/modules", courses.map((c: any) => c.id).join(",")],
    queryFn: async () => {
      if (!courses || courses.length === 0) return {};
      
      const modulesMap: { [courseId: string]: any[] } = {};
      await Promise.all(
        courses.map(async (course: any) => {
          try {
            const response = await apiRequest("GET", `/api/courses/${course.id}/modules`);
            const modules = await response.json();
            modulesMap[course.id] = modules || [];
          } catch (error) {
            console.error(`Failed to fetch modules for course ${course.id}:`, error);
            modulesMap[course.id] = [];
          }
        })
      );
      return modulesMap;
    },
    enabled: courses && courses.length > 0,
    staleTime: 0,
  });

  // Fetch analytics summary
  const { data: analyticsSummary, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/superadmin/analytics/summary"],
  });

  // Fetch users with pagination
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/superadmin/users", currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      const response = await apiRequest("GET", `/api/superadmin/users?${params}`);
      return response.json();
    },
  });

  // Fetch admin logs
  const { data: adminLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/superadmin/logs"],
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/superadmin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setIsUserDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/superadmin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  // Delete page mutation
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    },
  });


  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPageFormData(prev => ({
      ...prev,
      title,
      slug: generateSlugFromTitle(title)
    }));
  };

  const resetForm = () => {
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
    setSelectedPage(null);
  };


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
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

  const handleModuleEdit = (module: any) => {
    setLocation(`/cms/module/${module.id}`);
  };

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: { courseId: string }) => {
      const moduleData = {
        title: "New Module",
        content: { html: "" },
        orderIndex: ((allModules[data.courseId] || []).length + 1),
        duration: 30,
        tokenReward: "1"
      };
      
      const response = await apiRequest("POST", `/api/courses/${data.courseId}/modules`, moduleData);
      return response.json();
    },
    onSuccess: (newModule, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${variables.courseId}/modules`] });
      toast({
        title: "Module Created",
        description: "New module has been created successfully.",
      });
      // Navigate to edit the new module
      setLocation(`/cms/module/${newModule.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddModule = (courseId: string) => {
    createModuleMutation.mutate({ courseId });
  };

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      return await apiRequest("DELETE", `/api/modules/${moduleId}`);
    },
    onSuccess: () => {
      // Invalidate all course-related queries to ensure immediate UI update
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/modules"] });
      Object.keys(allModules).forEach(courseId => {
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/modules`] });
      });
      
      setShowDeleteDialog(false);
      setModuleToDelete(null);
      
      toast({
        title: "Module deleted",
        description: "Module has been removed successfully."
      });
    },
    onError: (error: any) => {
      console.error('Delete module error:', error);
      setShowDeleteDialog(false);
      setModuleToDelete(null);
      
      toast({
        title: "Error deleting module",
        description: error?.message || "Failed to delete module. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteModule = (module: {id: string, title: string}) => {
    setModuleToDelete(module);
    setShowDeleteDialog(true);
  };

  const confirmDeleteModule = () => {
    if (moduleToDelete) {
      deleteModuleMutation.mutate(moduleToDelete.id);
    }
  };

  return (
    <CMSLayout activeSection={activeSection}>
      {/* Pages Section */}
      {activeSection === "pages" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Manage Pages</h3>
            <Button data-testid="button-create-page">
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>

          <div className="grid gap-4">
            {pagesLoading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p>Loading pages...</p>
                </CardContent>
              </Card>
            ) : (cmsPages as any[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first page to get started
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
        </div>
      )}
      {/* Courses Section */}
      {activeSection === "courses" && (
        <div className="space-y-6">
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
                    <TableHead>Reward</TableHead>
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
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (courses as any[]).flatMap((course: any) => {
                      const isExpanded = expandedCourses.has(course.id);
                      const courseModules = allModules[course.id] || [];
                      const rows = [
                        <TableRow key={course.id}>
                          <TableCell>
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors font-medium"
                              onClick={() => toggleCourseExpansion(course.id)}
                              data-testid={`title-course-${course.id}`}
                            >
                              <div className="flex-shrink-0">
                                {courseModules && courseModules.length > 0 ? (
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
                            <Badge variant="secondary">{course.category}</Badge>
                          </TableCell>
                          <TableCell>{parseFloat(course.price || "0").toLocaleString()} tokens</TableCell>
                          <TableCell>+{parseFloat(course.completionReward || "0").toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={course.isPublished ? "default" : "secondary"}>
                              {course.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/cms/course/${course.id}`)}
                                data-testid={`button-edit-course-${course.id}`}
                              >
                                <Pencil className="h-4 w-4" />
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
                      if (isExpanded) {
                        // Add "Add Module" button row first
                        rows.push(
                          <TableRow key={`${course.id}-add-module`} className="bg-muted/20 hover:bg-muted/40 transition-colors">
                            <TableCell className="pl-12">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddModule(course.id)}
                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                data-testid={`button-add-module-${course.id}`}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Module
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">New</Badge>
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                          </TableRow>
                        );

                        // Add existing module rows
                        if (courseModules && courseModules.length > 0) {
                          courseModules.forEach((module: any, index: number) => {
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
                                <TableCell>+{Math.floor(parseFloat(module.tokenReward) || 1)}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">Module</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleModuleEdit(module)}
                                      data-testid={`button-edit-module-${module.id}`}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteModule({id: module.id, title: module.title})}
                                      disabled={deleteModuleMutation.isPending}
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
                      }

                      return rows;
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Analytics Section */}
      {activeSection === "analytics" && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Analytics Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsLoading ? "..." : (analyticsSummary as any)?.totalRevenue || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly: ${analyticsLoading ? "..." : (analyticsSummary as any)?.monthlyRevenue || "0"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Distributed</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : (analyticsSummary as any)?.totalTokensDistributed || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly: {analyticsLoading ? "..." : (analyticsSummary as any)?.monthlyTokensDistributed || "0"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : (analyticsSummary as any)?.activeUsers || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : (analyticsSummary as any)?.courseCompletions || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Users Section */}
      {activeSection === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">User Management</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-users"
                />
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : usersData?.users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData?.users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback>
                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.email
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {formatRole(user.role || 'student')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.banned ? 'destructive' : 'default'}>
                            {user.banned ? 'Banned' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserDialogOpen(true);
                              }}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Activity Logs Section */}
      {activeSection === "logs" && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Activity Logs</h3>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading logs...
                      </TableCell>
                    </TableRow>
                  ) : (adminLogs as any[]).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (adminLogs as any[]).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>{log.adminId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {JSON.stringify(log.details)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Settings Section */}
      {activeSection === "settings" && (
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
                            toast({
                              title: "Import successful",
                              description: `Imported ${Object.values(result.imported).reduce((sum: number, count: number) => sum + count, 0)} items`,
                            });
                            // Refresh the page data
                            queryClient.invalidateQueries();
                          } else {
                            throw new Error(result.error || 'Import failed');
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
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{(cmsPages as any[])?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">CMS Pages</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{(courses as any[])?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {(courses as any[])?.reduce((total, course) => total + (course.modules?.length || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Modules</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      {/* Page Editor Dialog */}
      {selectedPage && (
        <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Page: {selectedPage.slug}</DialogTitle>
              <DialogDescription>
                Manage content for different languages
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                <TabsTrigger value="es">🇪🇸 Spanish</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-4">
                <LanguageEditor
                  language="en"
                  page={selectedPage.languages?.en}
                  slug={selectedPage.slug}
                  onSave={() => {}}
                />
              </TabsContent>
              <TabsContent value="es" className="space-y-4">
                <LanguageEditor
                  language="es"
                  page={selectedPage.languages?.es}
                  slug={selectedPage.slug}
                  onSave={() => {}}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setSelectedPage(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* User Edit Dialog */}
      {selectedUser && (
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Manage user role and permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profileImageUrl} />
                  <AvatarFallback>
                    {selectedUser.firstName?.[0] || selectedUser.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : selectedUser.email
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                  <div>Joined: {formatDate(selectedUser.createdAt)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={selectedUser.role || 'student'} 
                  onValueChange={(role) => updateRoleMutation.mutate({ userId: selectedUser.id, role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Delete Module Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the module "{moduleToDelete?.title}"? 
              This action cannot be undone and will also remove all associated progress records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteModuleMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteModule}
              disabled={deleteModuleMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteModuleMutation.isPending ? "Deleting..." : "Delete Module"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}