import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Book,
  Plus,
  Edit,
  Trash2,
  Save,
  FileText,
  Clock,
  Trophy,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Grip,
  BookOpen,
  X
} from "lucide-react";

// Course Language Editor Component
function CourseLanguageEditor({ language, course, courseForm, setCourseForm }: {
  language: string;
  course: Course | null;
  courseForm: any;
  setCourseForm: (form: any) => void;
}) {
  return (
    <div className="space-y-4">
      {!course && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {language === 'es' ? 'Esta versión en español no existe aún. Completa el formulario para crearla.' : 'This language version doesn\'t exist yet. Fill out the form below to create it.'}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`course-title-${language}`}>Course Title</Label>
          <Input
            id={`course-title-${language}`}
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            placeholder="Enter course title"
            data-testid={`input-course-title-${language}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`course-category-${language}`}>Category</Label>
          <Input
            id={`course-category-${language}`}
            value={courseForm.category}
            onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
            placeholder="e.g., Business, Technology"
            data-testid={`input-course-category-${language}`}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`course-description-${language}`}>Description</Label>
        <Textarea
          id={`course-description-${language}`}
          value={courseForm.description}
          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
          placeholder="Course description..."
          rows={3}
          data-testid={`textarea-course-description-${language}`}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`course-difficulty-${language}`}>Difficulty</Label>
          <Select 
            value={courseForm.difficulty} 
            onValueChange={(value) => setCourseForm({ ...courseForm, difficulty: value })}
          >
            <SelectTrigger data-testid={`select-course-difficulty-${language}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`course-duration-${language}`}>Duration (minutes)</Label>
          <Input
            id={`course-duration-${language}`}
            type="number"
            value={courseForm.duration}
            onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) || 0 })}
            data-testid={`input-course-duration-${language}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`course-price-${language}`}>Price ({parseFloat(courseForm.price || '0') === 1 ? 'token' : 'tokens'})</Label>
          <Input
            id={`course-price-${language}`}
            value={courseForm.price}
            onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
            data-testid={`input-course-price-${language}`}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`course-token-reward-${language}`}>Token Reward</Label>
          <Input
            id={`course-token-reward-${language}`}
            type="number"
            value={courseForm.tokenReward}
            onChange={(e) => setCourseForm({ ...courseForm, tokenReward: parseInt(e.target.value) || 0 })}
            data-testid={`input-course-token-reward-${language}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`course-completion-reward-${language}`}>Completion Reward</Label>
          <Input
            id={`course-completion-reward-${language}`}
            type="number"
            value={courseForm.completionReward}
            onChange={(e) => setCourseForm({ ...courseForm, completionReward: parseInt(e.target.value) || 0 })}
            data-testid={`input-course-completion-reward-${language}`}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`course-published-${language}`}
          checked={courseForm.isPublished}
          onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
          className="h-4 w-4"
          data-testid={`checkbox-course-published-${language}`}
        />
        <Label htmlFor={`course-published-${language}`}>Publish course</Label>
      </div>
    </div>
  );
}

// Exercise Preview Component
const ExercisePreview: React.FC<{ exercise: { text: string; blanks: { position: number; correctAnswer: string; placeholder?: string; }[] } }> = ({ exercise }) => {
  const parts = exercise.text.split('__');
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">How it will appear to students:</p>
      <div className="flex flex-wrap items-center gap-1">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                className="inline-block w-20 px-2 py-1 text-sm border rounded"
                placeholder={exercise.blanks[index]?.placeholder || "..."}
                disabled
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {exercise.blanks.length} blank{exercise.blanks.length !== 1 ? 's' : ''} to fill
      </div>
    </div>
  );
};

interface Course {
  id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  difficulty: string;
  duration: number;
  price: string;
  tokenReward: number;
  completionReward: number;
  isPublished: boolean;
  modules?: Module[];
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  content: any;
  orderIndex: number;
  duration: number;
  tokenReward: number;
}

export default function CourseManagement() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [editingLanguage, setEditingLanguage] = useState<'en' | 'es'>('en');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses with modules
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const coursesResponse = await apiRequest("GET", "/api/courses");
      const coursesData = await coursesResponse.json() as Course[];
      // Fetch modules for each course
      const coursesWithModules = await Promise.all(
        coursesData.map(async (course: Course) => {
          const modulesResponse = await apiRequest("GET", `/api/courses/${course.id}/modules`);
          const modules = await modulesResponse.json() as Module[];
          return { ...course, modules };
        })
      );
      return coursesWithModules;
    }
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner",
    duration: 0,
    price: "0",
    tokenReward: 0,
    completionReward: 0,
    isPublished: false
  });

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: "",
    content: { text: "", sections: [] },
    exercise: undefined as { text: string; blanks: { position: number; correctAnswer: string; placeholder?: string; }[] } | undefined,
    duration: 0,
    tokenReward: 1,
    orderIndex: 0
  });

  // Create/Update Course
  const courseMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: any }) => {
      if (id) {
        return await apiRequest("PUT", `/api/courses/${id}`, data);
      } else {
        return await apiRequest("POST", "/api/courses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowCourseDialog(false);
      resetCourseForm();
      toast({
        title: "Course saved successfully",
        description: selectedCourse ? "Course updated" : "New course created"
      });
    }
  });

  // Create/Update Module
  const moduleMutation = useMutation({
    mutationFn: async ({ courseId, moduleId, data }: { courseId: string; moduleId?: string; data: any }) => {
      if (moduleId) {
        return await apiRequest("PUT", `/api/modules/${moduleId}`, data);
      } else {
        return await apiRequest("POST", `/api/courses/${courseId}/modules`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowModuleDialog(false);
      resetModuleForm();
      toast({
        title: "Module saved successfully",
        description: selectedModule ? "Module updated" : "New module created"
      });
    }
  });

  // Delete Course
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "Course and all its modules have been removed"
      });
    }
  });

  // Delete Module
  const deleteModule = useMutation({
    mutationFn: async (moduleId: string) => {
      console.log('Mutation function called for module:', moduleId);
      const result = await apiRequest("DELETE", `/api/modules/${moduleId}`);
      console.log('API request completed, result:', result);
      return result;
    },
    onSuccess: (data, moduleId) => {
      console.log('Delete module onSuccess called:', { data, moduleId });
      // Invalidate both courses and any module-specific queries
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.refetchQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Module deleted",
        description: "Module has been removed from the course"
      });
    },
    onError: (error: any, moduleId) => {
      console.error('Delete module onError called:', { error, moduleId });
      toast({
        title: "Error deleting module",
        description: error?.message || "Failed to delete module. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      duration: 0,
      price: "0",
      tokenReward: 0,
      completionReward: 0,
      isPublished: false
    });
    setSelectedCourse(null);
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: "",
      content: { text: "", sections: [] },
      exercise: undefined,
      duration: 0,
      tokenReward: 1,
      orderIndex: 0
    });
    setSelectedModule(null);
  };

  // Smart autosave with proper debouncing and duplicate prevention
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const debouncedAutosave = useCallback((courseId: string, courseData: any) => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      const dataString = JSON.stringify(courseData);
      
      // Only save if data changed and not already saving
      if (dataString !== lastSavedDataRef.current && !isSavingRef.current && courseData.title?.trim()) {
        isSavingRef.current = true;
        lastSavedDataRef.current = dataString;
        
        setAutosaveStatus('saving');
        courseMutation.mutate({ id: courseId, data: courseData }, {
          onSuccess: () => {
            setAutosaveStatus('saved');
            // Hide saved indicator after 2 seconds
            setTimeout(() => setAutosaveStatus('idle'), 2000);
          },
          onError: () => {
            setAutosaveStatus('idle');
          },
          onSettled: () => {
            isSavingRef.current = false;
          }
        });
      }
    }, 1000); // 1 second delay
  }, [courseMutation]);

  // Autosave when course form changes
  useEffect(() => {
    if (selectedCourse && courseForm.title?.trim() && !courseMutation.isPending) {
      debouncedAutosave(selectedCourse.id, courseForm);
    }
  }, [courseForm, selectedCourse, debouncedAutosave, courseMutation.isPending]);

  // Update last saved data when course loads
  useEffect(() => {
    if (selectedCourse) {
      lastSavedDataRef.current = JSON.stringify(courseForm);
    }
  }, [selectedCourse]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      difficulty: course.difficulty,
      duration: course.duration || 0,
      price: course.price || "0",
      tokenReward: course.tokenReward || 0,
      completionReward: course.completionReward || 0,
      isPublished: course.isPublished
    });
    setShowCourseDialog(true);
  };

  const handleEditModule = (module: Module, courseId: string) => {
    setSelectedModule(module);
    setSelectedCourse({ id: courseId } as Course);
    setModuleForm({
      title: module.title,
      content: module.content || { text: "", sections: [] },
      exercise: (module as any).exercise || undefined,
      duration: module.duration || 0,
      tokenReward: module.tokenReward || 1,
      orderIndex: module.orderIndex
    });
    setShowModuleDialog(true);
  };

  const handleAddModule = (courseId: string) => {
    const course = courses.find((c: Course) => c.id === courseId);
    const nextOrderIndex = course?.modules?.length || 0;
    
    setSelectedCourse({ id: courseId } as Course);
    setModuleForm({
      ...moduleForm,
      orderIndex: nextOrderIndex
    });
    setShowModuleDialog(true);
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

  if (isLoading) {
    return <div className="p-6">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="course-management-title">
            Course Management
          </h2>
          <p className="text-muted-foreground">
            Manage courses and their modules in a nested structure
          </p>
        </div>
        
        <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetCourseForm} data-testid="button-add-course">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCourse ? "Edit Course" : "Create New Course"}
              </DialogTitle>
              <DialogDescription>
                Manage course content for different languages
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={editingLanguage} onValueChange={(value) => setEditingLanguage(value as 'en' | 'es')} className="space-y-6">
              <TabsList>
                <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                <TabsTrigger value="es">🇪🇸 Spanish</TabsTrigger>
              </TabsList>
              
              {/* English Tab */}
              <TabsContent value="en" className="space-y-4">
                <CourseLanguageEditor
                  language="en"
                  course={selectedCourse}
                  courseForm={courseForm}
                  setCourseForm={setCourseForm}
                />
              </TabsContent>
              
              {/* Spanish Tab */}
              <TabsContent value="es" className="space-y-4">
                <CourseLanguageEditor
                  language="es"
                  course={selectedCourse}
                  courseForm={courseForm}
                  setCourseForm={setCourseForm}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between items-center">
              {/* Autosave Status Indicator */}
              <div className="flex items-center space-x-2 text-sm">
                {autosaveStatus === 'saving' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </div>
                )}
                {autosaveStatus === 'saved' && (
                  <div className="flex items-center text-green-600">
                    <div className="h-3 w-3 bg-green-600 rounded-full mr-2"></div>
                    Auto-saved
                  </div>
                )}
                {autosaveStatus === 'idle' && selectedCourse && (
                  <div className="text-muted-foreground">
                    Changes auto-save as you type
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowCourseDialog(false)}
                data-testid="button-close-course"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course List with Nested Modules */}
      <div className="space-y-4">
        {courses.map((course: Course) => {
          const isExpanded = expandedCourses.has(course.id);
          return (
            <Card key={course.id} data-testid={`course-card-${course.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCourseExpansion(course.id)}
                      data-testid={`button-toggle-course-${course.id}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Book className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div>
                      <CardTitle 
                        className="text-lg cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => toggleCourseExpansion(course.id)}
                        data-testid={`title-course-${course.id}`}
                      >
                        {course.title}
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-primary rounded-full">
                          {course.modules?.length || 0}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {course.modules?.length || 0} modules • {course.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">
                      {course.difficulty}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                      data-testid={`button-edit-course-${course.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCourse.mutate(course.id)}
                      disabled={deleteCourse.isPending}
                      data-testid={`button-delete-course-${course.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">Course Modules</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddModule(course.id)}
                        data-testid={`button-add-module-${course.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {course.modules?.map((module: Module, index: number) => (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          data-testid={`module-item-${module.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded text-xs font-medium">
                              {index + 1}
                            </div>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{module.title}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {module.duration} min
                                </span>
                                <span className="flex items-center">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {module.tokenReward} {Number(module.tokenReward) === 1 ? 'token' : 'tokens'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditModule(module, course.id)}
                              data-testid={`button-edit-module-${module.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('Delete button clicked for module:', module.id);
                                deleteModule.mutate(module.id);
                              }}
                              disabled={deleteModule.isPending}
                              data-testid={`button-delete-module-${module.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {(!course.modules || course.modules.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No modules yet</p>
                          <p className="text-xs">Add modules to start building your course</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? "Edit Module" : "Create New Module"}
            </DialogTitle>
            <DialogDescription>
              Add module content and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Enter module title"
                data-testid="input-module-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module-content">Module Content</Label>
              <Textarea
                id="module-content"
                value={moduleForm.content.text || ""}
                onChange={(e) => setModuleForm({ 
                  ...moduleForm, 
                  content: { ...moduleForm.content, text: e.target.value }
                })}
                placeholder="Module content and instructions..."
                rows={6}
                data-testid="textarea-module-content"
              />
            </div>
            
            {/* Exercise Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Fill-in-the-Blank Exercise</Label>
                {!moduleForm.exercise && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModuleForm({ 
                      ...moduleForm, 
                      exercise: { text: "My name __ ___", blanks: [{ position: 0, correctAnswer: "is", placeholder: "verb" }, { position: 1, correctAnswer: "John", placeholder: "name" }] }
                    })}
                    data-testid="button-add-exercise"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                )}
                {moduleForm.exercise && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModuleForm({ ...moduleForm, exercise: undefined })}
                    data-testid="button-remove-exercise"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Exercise
                  </Button>
                )}
              </div>
              
              {moduleForm.exercise && (
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-text">Exercise Text</Label>
                    <Input
                      id="exercise-text"
                      value={moduleForm.exercise.text}
                      onChange={(e) => setModuleForm({ 
                        ...moduleForm, 
                        exercise: { ...moduleForm.exercise!, text: e.target.value }
                      })}
                      placeholder="Enter text with blanks (use __ for each blank)"
                      data-testid="input-exercise-text"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use __ (double underscore) to mark where blanks should appear. Example: "My name __ ___"
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Blank Answers</Label>
                    {moduleForm.exercise.blanks.map((blank, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Correct answer"
                            value={blank.correctAnswer}
                            onChange={(e) => {
                              const newBlanks = [...moduleForm.exercise!.blanks];
                              newBlanks[index] = { ...newBlanks[index], correctAnswer: e.target.value };
                              setModuleForm({ 
                                ...moduleForm, 
                                exercise: { ...moduleForm.exercise!, blanks: newBlanks }
                              });
                            }}
                            data-testid={`input-blank-answer-${index}`}
                          />
                          <Input
                            placeholder="Placeholder (optional)"
                            value={blank.placeholder || ""}
                            onChange={(e) => {
                              const newBlanks = [...moduleForm.exercise!.blanks];
                              newBlanks[index] = { ...newBlanks[index], placeholder: e.target.value };
                              setModuleForm({ 
                                ...moduleForm, 
                                exercise: { ...moduleForm.exercise!, blanks: newBlanks }
                              });
                            }}
                            data-testid={`input-blank-placeholder-${index}`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newBlanks = moduleForm.exercise!.blanks.filter((_, i) => i !== index);
                            setModuleForm({ 
                              ...moduleForm, 
                              exercise: { ...moduleForm.exercise!, blanks: newBlanks }
                            });
                          }}
                          data-testid={`button-remove-blank-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newBlanks = [...moduleForm.exercise!.blanks, { position: moduleForm.exercise!.blanks.length, correctAnswer: "", placeholder: "" }];
                        setModuleForm({ 
                          ...moduleForm, 
                          exercise: { ...moduleForm.exercise!, blanks: newBlanks }
                        });
                      }}
                      data-testid="button-add-blank"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blank
                    </Button>
                  </div>
                  
                  {/* Exercise Preview */}
                  <div className="space-y-2 border-t pt-3">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="p-3 bg-background rounded border">
                      <ExercisePreview exercise={moduleForm.exercise} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module-duration">Duration (minutes)</Label>
                <Input
                  id="module-duration"
                  type="number"
                  value={moduleForm.duration}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration: parseInt(e.target.value) || 0 })}
                  data-testid="input-module-duration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-token-reward">Token Reward</Label>
                <Input
                  id="module-token-reward"
                  type="number"
                  value={moduleForm.tokenReward}
                  onChange={(e) => setModuleForm({ ...moduleForm, tokenReward: parseInt(e.target.value) || 1 })}
                  data-testid="input-module-token-reward"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-order">Order Index</Label>
                <Input
                  id="module-order"
                  type="number"
                  value={moduleForm.orderIndex}
                  onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) || 0 })}
                  data-testid="input-module-order"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              For detailed module editing, use the module editor with auto-save
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowModuleDialog(false)}
              data-testid="button-close-module"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}