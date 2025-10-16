import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye, 
  Upload, 
  Bold, 
  Italic, 
  Underline, 
  Image, 
  Video, 
  Link, 
  Plus, 
  ChevronDown 
} from "lucide-react";
import { useState } from "react";

export default function CourseEditor() {
  const [courseData, setCourseData] = useState({
    title: "Advanced Web Development",
    description: "Master modern web development with React, Node.js, and cloud technologies",
    content: `<h1>Welcome to Advanced Web Development</h1>
<p>In this comprehensive course, you'll learn the latest web development technologies and best practices. We'll cover everything from modern JavaScript frameworks to advanced CSS techniques.</p>
<h2>What You'll Learn</h2>
<ul>
  <li>React and Next.js fundamentals</li>
  <li>State management with Redux</li>
  <li>Modern CSS with Tailwind</li>
  <li>API integration and testing</li>
</ul>`,
    rewards: {
      completion: 100,
      module: 25,
      quiz: 50
    }
  });

  const chapters = [
    { id: "1", title: "Introduction", active: true, lessons: ["Welcome Video", "Course Overview", "Prerequisites"] },
    { id: "2", title: "Chapter 1: Basics", active: false, lessons: [] },
    { id: "3", title: "Chapter 2: Advanced", active: false, lessons: [] }
  ];

  const handlePreview = () => {
    console.log("Preview course:", courseData);
  };

  const handlePublish = () => {
    console.log("Publish course:", courseData);
  };

  const handleAddChapter = () => {
    console.log("Add new chapter");
  };

  const formatText = (format: string) => {
    console.log(`Format text: ${format}`);
  };

  return (
    <Card data-testid="course-editor-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle data-testid="course-editor-title">Course Editor</CardTitle>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePreview} data-testid="button-preview-course">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handlePublish} data-testid="button-publish-course">
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Structure */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-medium text-foreground mb-3" data-testid="course-structure-title">
              Course Structure
            </h4>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className={`p-3 rounded-lg ${chapter.active ? 'bg-primary/10 border-l-4 border-primary' : 'bg-muted/50'}`}
                  data-testid={`chapter-${chapter.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground" data-testid={`chapter-title-${chapter.id}`}>
                      {chapter.title}
                    </span>
                    {chapter.lessons.length > 0 && (
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  {chapter.lessons.length > 0 && (
                    <div className="mt-2 ml-4 space-y-1 text-xs text-muted-foreground">
                      {chapter.lessons.map((lesson, index) => (
                        <div key={index} data-testid={`lesson-${chapter.id}-${index}`}>• {lesson}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed hover:border-primary hover:text-primary"
                onClick={handleAddChapter}
                data-testid="button-add-chapter"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-medium text-foreground mb-3" data-testid="content-editor-title">
              Content Editor
            </h4>
            
            {/* Course Meta Information */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-title" className="text-sm font-medium">Course Title</Label>
                  <Input 
                    id="course-title"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({...prev, title: e.target.value}))}
                    data-testid="input-course-title"
                  />
                </div>
                <div>
                  <Label htmlFor="course-category" className="text-sm font-medium">Category</Label>
                  <Input 
                    id="course-category"
                    placeholder="e.g. Technology, Finance"
                    data-testid="input-course-category"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="course-description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="course-description"
                  value={courseData.description}
                  onChange={(e) => setCourseData(prev => ({...prev, description: e.target.value}))}
                  className="h-20"
                  data-testid="textarea-course-description"
                />
              </div>
            </div>
            
            <div className="border border-border rounded-lg">
              {/* Editor Toolbar */}
              <div className="flex items-center space-x-2 p-3 border-b border-border bg-muted/30">
                <Button size="sm" variant="ghost" onClick={() => formatText('bold')} data-testid="button-format-bold">
                  <Bold className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => formatText('italic')} data-testid="button-format-italic">
                  <Italic className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => formatText('underline')} data-testid="button-format-underline">
                  <Underline className="w-3 h-3" />
                </Button>
                <div className="w-px h-6 bg-border"></div>
                <Button size="sm" variant="ghost" onClick={() => formatText('image')} data-testid="button-insert-image">
                  <Image className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => formatText('video')} data-testid="button-insert-video">
                  <Video className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => formatText('link')} data-testid="button-insert-link">
                  <Link className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Editor Content Area */}
              <div 
                className="p-6 min-h-64 bg-background focus:outline-none"
                contentEditable="true"
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: courseData.content }}
                data-testid="content-editor"
              />
            </div>
            
            {/* Token Reward Settings */}
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h5 className="text-sm font-medium text-foreground mb-3" data-testid="token-reward-settings-title">
                Token Reward Settings
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="completion-reward" className="block text-xs text-muted-foreground mb-1">
                    Course Completion
                  </Label>
                  <Input 
                    id="completion-reward"
                    type="number" 
                    value={courseData.rewards.completion}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev, 
                      rewards: {...prev.rewards, completion: parseInt(e.target.value) || 0}
                    }))}
                    className="text-sm"
                    data-testid="input-completion-reward"
                  />
                </div>
                <div>
                  <Label htmlFor="module-reward" className="block text-xs text-muted-foreground mb-1">
                    Module Completion
                  </Label>
                  <Input 
                    id="module-reward"
                    type="number" 
                    value={courseData.rewards.module}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev, 
                      rewards: {...prev.rewards, module: parseInt(e.target.value) || 0}
                    }))}
                    className="text-sm"
                    data-testid="input-module-reward"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-reward" className="block text-xs text-muted-foreground mb-1">
                    Perfect Quiz Score
                  </Label>
                  <Input 
                    id="quiz-reward"
                    type="number" 
                    value={courseData.rewards.quiz}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev, 
                      rewards: {...prev.rewards, quiz: parseInt(e.target.value) || 0}
                    }))}
                    className="text-sm"
                    data-testid="input-quiz-reward"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
