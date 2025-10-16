import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Save,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Plus,
} from "lucide-react";
import CMSLayout from "@/components/layout/cms-layout";
import ExerciseEditor from "@/components/exercise/exercise-editor";

export default function ModuleEdit() {
  const { moduleId } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    duration: 30,
    tokenReward: 1,
    orderIndex: 1
  });

  // Simple exercises state - no refs, no complex logic
  const [exercises, setExercises] = useState<any[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Track if we're still initializing to prevent immediate autosave
  const isInitializingRef = useRef(true);


  // Fetch module data
  const { data: module, isLoading } = useQuery({
    queryKey: ["/api/modules", moduleId],
    queryFn: async () => {
      // First find which course this module belongs to
      const courses = await apiRequest("GET", "/api/courses");
      const coursesData = await courses.json();
      
      for (const course of coursesData) {
        try {
          const modulesResponse = await apiRequest("GET", `/api/courses/${course.id}/modules`);
          const modules = await modulesResponse.json();
          const foundModule = modules.find((m: any) => m.id === moduleId);
          if (foundModule) {
            return { ...foundModule, courseId: course.id };
          }
        } catch (error) {
          console.error(`Error fetching modules for course ${course.id}:`, error);
        }
      }
      throw new Error("Module not found");
    },
    enabled: !!moduleId,
  });

  // Initialize editor with content
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 bg-white',
      },
    },
  });

  // Initialize form data when module loads
  useEffect(() => {
    if (module && formData.title === "") {
      const initialExercises = (module as any).exercises || ((module as any).exercise ? [(module as any).exercise] : []);
      
      setFormData({
        title: module.title || "",
        duration: module.duration || 30,
        tokenReward: Math.floor(parseFloat(module.tokenReward) || 1),
        orderIndex: module.orderIndex || 1
      });
      setExercises(initialExercises);
      
      // Set editor content
      if (editor && module.content) {
        if (typeof module.content === 'object') {
          if (module.content.html) {
            // Content saved as HTML from WYSIWYG editor
            editor.commands.setContent(module.content.html);
          } else if (module.content.sections) {
            // Convert sections to HTML for WYSIWYG editing
            const htmlContent = module.content.sections
              .map((section: any) => `<h3>${section.title}</h3><p>${section.content}</p>`)
              .join('');
            editor.commands.setContent(htmlContent);
          }
        } else if (typeof module.content === 'string') {
          editor.commands.setContent(module.content);
        }
      }
      
    }
  }, [module, editor]); // Only depend on module and editor

  // Update module mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const editorContent = editor?.getHTML() || '';
      
      const requestData = {
        title: formData.title,
        content: { html: editorContent },
        duration: formData.duration,
        tokenReward: formData.tokenReward,
        orderIndex: formData.orderIndex,
        // Send as 'exercise' for backward compatibility, using the first exercise if multiple exist
        exercise: exercises.length > 0 ? exercises[0] : undefined,
        // Also send the full exercises array for future use
        exercises: exercises
      };
      
      const response = await apiRequest("PUT", `/api/modules/${moduleId}`, requestData);
      return response.json();
    },
    onSuccess: () => {
      // Only invalidate the specific module query, not all courses
      queryClient.invalidateQueries({ queryKey: ["/api/modules", moduleId] });
      toast({
        title: "Success",
        description: "Module updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update module",
        variant: "destructive",
      });
    },
  });

  // Simple editor content state
  const [editorContent, setEditorContent] = useState('');

  
  // Update editor content when editor changes
  useEffect(() => {
    if (editor) {
      const updateContent = () => {
        const newContent = editor.getHTML();
        setEditorContent(newContent);
      };
      
      editor.on('update', updateContent);
      // Set initial content
      setEditorContent(editor.getHTML());
      
      return () => {
        editor.off('update', updateContent);
      };
    }
  }, [editor]);




  const handleExerciseChange = useCallback((index: number, exercise: any) => {
    setExercises(prev => {
      const newExercises = [...prev];
      newExercises[index] = exercise;
      return newExercises;
    });
  }, []);

  const handleAddExercise = () => {
    const newExercise = { text: "", blanks: [] };
    const newExercises = [...exercises, newExercise];
    setExercises(newExercises);
    setForceUpdate(prev => prev + 1);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
    setForceUpdate(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Module not found</p>
          <Button onClick={() => setLocation('/cms')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMS
          </Button>
        </div>
      </div>
    );
  }

  // Save button component to pass to header
  const saveButton = (
    <Button 
      onClick={() => updateMutation.mutate()}
      disabled={updateMutation.isPending}
      data-testid="button-save-module"
    >
      {updateMutation.isPending ? (
        <>
          <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2"></div>
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save
        </>
      )}
    </Button>
  );

  return (
    <CMSLayout activeSection="courses" headerActions={saveButton}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Edit Module</h1>
          <p className="text-sm text-muted-foreground">{module.title}</p>
        </div>
        
        {/* Content will be saved via header button */}
        <div className="text-muted-foreground text-sm">
          Click the Save button in the top header to save changes
        </div>
      </div>

      <div className="space-y-6">
            {/* Module Info Card */}
            <Card>
          <CardHeader>
            <CardTitle>Module Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Module Title</label>
              <Input
                placeholder="Module title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-module-title"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  data-testid="input-module-duration"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Token Reward</label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="1"
                  value={formData.tokenReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenReward: parseInt(e.target.value) || 1 }))}
                  data-testid="input-module-token-reward"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Order Index</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 1 }))}
                  data-testid="input-module-order-index"
                />
              </div>
            </div>
          </CardContent>
            </Card>

            {/* Content Editor Card */}
            <Card>
          <CardContent className="p-0">
            {/* Editor Toolbar */}
            {editor && (
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap gap-1 shadow-sm">
                <div className="flex gap-1 mr-3">
                  <Button
                    variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    data-testid="button-h2"
                    className="h-8 px-2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    data-testid="button-h3"
                    className="h-8 px-2"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1 mr-3">
                  <Button
                    variant={editor.isActive('bold') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    data-testid="button-bold"
                    className="h-8 px-2"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    data-testid="button-italic"
                    className="h-8 px-2"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1 mr-3">
                  <Button
                    variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    data-testid="button-bullet-list"
                    className="h-8 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    data-testid="button-ordered-list"
                    className="h-8 px-2"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    data-testid="button-blockquote"
                    className="h-8 px-2"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    data-testid="button-undo"
                    className="h-8 px-2"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    data-testid="button-redo"
                    className="h-8 px-2"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Editor Content */}
            <div className="min-h-[500px] border-0">
              <EditorContent 
                editor={editor} 
                data-testid="editor-module-content"
              />
            </div>
          </CardContent>
            </Card>

            {/* Exercises Editor Card */}
            <Card>
              <CardHeader>
                <CardTitle>Exercises (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6" key={`exercises-${exercises.length}-${forceUpdate}`}>
                {exercises.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No exercises added yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Add Exercise" to create interactive exercises.
                    </p>
                  </div>
                ) : (
                  exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Exercise {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveExercise(index)}
                          data-testid={`button-remove-exercise-${index}`}
                        >
                          Remove Exercise
                        </Button>
                      </div>
                      <ExerciseEditor
                        exercise={exercise}
                        onChange={(updatedExercise: any) => handleExerciseChange(index, updatedExercise)}
                      />
                    </div>
                  ))
                )}
                
                {/* Add Exercise Button at the end */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleAddExercise}
                    data-testid="button-add-exercise"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
    </CMSLayout>
  );
}