import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save } from "lucide-react";
import CMSLayout from "@/components/layout/cms-layout";

export default function CourseEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingLanguage, setEditingLanguage] = useState<'en' | 'es'>('en');

  // Fetch course data
  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  const courseData = Array.isArray(course) ? course[0] : course;

  // Separate form data for each language
  const [formDataEn, setFormDataEn] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    price: "0",
    completionReward: "0",
    isPublished: false,
  });
  
  const [formDataEs, setFormDataEs] = useState({
    title: "",
    description: "",
  });

  // Fetch course translations
  const { data: translations } = useQuery({
    queryKey: [`/api/course-translations/${id}`],
    enabled: !!id,
  });

  // Update form data when course loads
  useEffect(() => {
    if (courseData) {
      // Load English version (primary course data)
      setFormDataEn({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "",
        difficulty: courseData.difficulty || "",
        price: courseData.price || "0",
        completionReward: courseData.completionReward || "0",
        isPublished: courseData.isPublished || false,
      });
      
      // Load Spanish translation if it exists
      const spanishTranslation = Array.isArray(translations) ? translations.find((t: any) => t.language === "es") : null;
      if (spanishTranslation) {
        setFormDataEs({
          title: spanishTranslation.title || "",
          description: spanishTranslation.description || "",
        });
      }
    }
  }, [courseData, translations]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      // Save English version (updates main course record)
      const enResponse = await apiRequest("PATCH", `/api/courses/${id}`, {
        ...formDataEn,
        language: "en"
      });
      
      // Save Spanish translation
      const esResponse = await apiRequest("POST", `/api/course-translations`, {
        courseId: id,
        language: "es",
        title: formDataEs.title,
        description: formDataEs.description
      });
      
      return { en: await enResponse.json(), es: await esResponse.json() };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      // Invalidate both courses and course translations caches
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: [`/api/course-translations/${id}`] });
      // Don't navigate away - stay on the edit page to see changes immediately
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading course...</div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  return (
    <CMSLayout activeSection="courses">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">Update course information and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <p className="text-sm text-muted-foreground">Manage course content for different languages</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={editingLanguage} onValueChange={(value) => setEditingLanguage(value as 'en' | 'es')} className="space-y-6">
            <TabsList>
              <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
              <TabsTrigger value="es">🇪🇸 Spanish</TabsTrigger>
            </TabsList>
            
            {/* English Tab */}
            <TabsContent value="en" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-en">Title (EN)</Label>
                  <Input
                    id="title-en"
                    value={formDataEn.title}
                    onChange={(e) => setFormDataEn(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-course-title-en"
                  />
                </div>
                <div>
                  <Label htmlFor="category-en">Category</Label>
                  <Select value={formDataEn.category} onValueChange={(value) => setFormDataEn(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger data-testid="select-course-category-en">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description-en">Description (EN)</Label>
                <Textarea
                  id="description-en"
                  value={formDataEn.description}
                  onChange={(e) => setFormDataEn(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  data-testid="textarea-course-description-en"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty-en">Difficulty</Label>
                  <Select value={formDataEn.difficulty} onValueChange={(value) => setFormDataEn(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger data-testid="select-course-difficulty-en">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price-en">Price (tokens)</Label>
                  <Input
                    id="price-en"
                    type="number"
                    value={parseFloat(formDataEn.price)}
                    onChange={(e) => setFormDataEn(prev => ({ ...prev, price: e.target.value }))}
                    data-testid="input-course-price-en"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="completionReward-en">Completion Reward (tokens)</Label>
                  <Input
                    id="completionReward-en"
                    type="number"
                    value={parseFloat(formDataEn.completionReward)}
                    onChange={(e) => setFormDataEn(prev => ({ ...prev, completionReward: e.target.value }))}
                    data-testid="input-completion-reward-en"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published-en"
                    checked={formDataEn.isPublished}
                    onCheckedChange={(checked) => setFormDataEn(prev => ({ ...prev, isPublished: checked }))}
                    data-testid="switch-course-published-en"
                  />
                  <Label htmlFor="published-en">Published</Label>
                </div>
              </div>
            </TabsContent>
            
            {/* Spanish Tab - Only translatable fields */}
            <TabsContent value="es" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Spanish Translation:</strong> Only the title and description can be translated. 
                  System settings (category, price, difficulty, etc.) are shared across all languages.
                </p>
              </div>
              
              <div>
                <Label htmlFor="title-es">Title (ES)</Label>
                <Input
                  id="title-es"
                  value={formDataEs.title}
                  onChange={(e) => setFormDataEs(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter Spanish title..."
                  data-testid="input-course-title-es"
                />
              </div>

              <div>
                <Label htmlFor="description-es">Description (ES)</Label>
                <Textarea
                  id="description-es"
                  value={formDataEs.description}
                  onChange={(e) => setFormDataEs(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Ingrese la descripción en español..."
                  data-testid="textarea-course-description-es"
                />
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Shared Settings (from English version):</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Category:</strong> {formDataEn.category}</div>
                  <div><strong>Difficulty:</strong> {formDataEn.difficulty}</div>
                  <div><strong>Price:</strong> {formDataEn.price} tokens</div>
                  <div><strong>Completion Reward:</strong> {formDataEn.completionReward} tokens</div>
                  <div><strong>Published:</strong> {formDataEn.isPublished ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setLocation("/cms?section=courses")}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              data-testid="button-save-course"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </CMSLayout>
  );
}