import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Puzzle, Images, FolderSync } from "lucide-react";
import CourseManagement from "./course-management";

const contentTypes = [
  {
    id: "courses",
    title: "Courses",
    description: "Manage complete course structures with modules and lessons",
    icon: Book,
    color: "text-primary",
    bgColor: "bg-primary/10",
    published: 24,
    draft: 7,
    buttonText: "Manage Courses",
    buttonVariant: "default" as const
  },
  {
    id: "modules",
    title: "Modules",
    description: "Individual learning modules and lesson components",
    icon: Puzzle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    published: 156,
    draft: 12,
    buttonText: "Manage Modules",
    buttonVariant: "secondary" as const
  },
  {
    id: "media",
    title: "Media Library",
    description: "Videos, images, documents, and other course assets",
    icon: Images,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    published: 892,
    draft: "2.4 GB",
    buttonText: "Manage Media",
    buttonVariant: "outline" as const
  }
];

export default function ContentManagement() {
  const [activeView, setActiveView] = useState<string | null>(null);
  
  const handleSync = () => {
    // TODO: Implement Strapi sync
    console.log("Syncing with Strapi...");
  };
  
  const handleManage = (contentType: string) => {
    setActiveView(contentType);
  };
  
  if (activeView === "courses") {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setActiveView(null)}
          data-testid="button-back-to-cms"
        >
          ← Back to CMS
        </Button>
        <CourseManagement />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="cms-title">Content Management System</h2>
          <p className="text-muted-foreground" data-testid="cms-subtitle">
            Powered by Strapi - Manage courses, modules, and educational content
          </p>
        </div>
        <Button onClick={handleSync} className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-sync-strapi">
          <FolderSync className="w-4 h-4 mr-2" />
          FolderSync with Strapi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id} data-testid={`cms-card-${type.id}`}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${type.bgColor} rounded-lg`}>
                    <Icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <CardTitle data-testid={`cms-card-title-${type.id}`}>{type.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`cms-card-description-${type.id}`}>
                  {type.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {type.id === 'media' ? 'Total Assets' : 'Published'}
                    </span>
                    <span className="font-medium text-primary" data-testid={`cms-${type.id}-published`}>
                      {type.published}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {type.id === 'media' ? 'Storage Used' : 'In Review'}
                    </span>
                    <span className="font-medium text-muted-foreground" data-testid={`cms-${type.id}-draft`}>
                      {type.draft}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant={type.buttonVariant}
                  className="w-full"
                  onClick={() => handleManage(type.id)}
                  data-testid={`button-manage-${type.id}`}
                >
                  {type.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Strapi Status */}
      <Card data-testid="strapi-status-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-2" data-testid="strapi-status-title">Strapi Integration Status</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p data-testid="strapi-powered-by">Powered by <span className="font-semibold">Strapi CMS</span></p>
                <p data-testid="strapi-database">Connected to Supabase DB</p>
                <p data-testid="strapi-endpoint">Endpoint: {import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-primary font-medium" data-testid="strapi-status">Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
