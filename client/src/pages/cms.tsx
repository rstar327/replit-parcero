import CMSLayout from "@/components/layout/cms-layout";
import ContentManagement from "@/components/cms/content-management";
import CourseEditor from "@/components/cms/course-editor";

export default function CMS() {
  return (
    <CMSLayout activeSection="pages">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Management System</h1>
        <p className="text-muted-foreground">Powered by Strapi - Manage courses, modules, and educational content</p>
      </div>
      
      <div className="space-y-6">
        <ContentManagement />
        <CourseEditor />
      </div>
    </CMSLayout>
  );
}
