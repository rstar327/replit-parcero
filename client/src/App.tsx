import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/language-context";
import { CookieNotice } from "@/components/cookie-notice";
import NotFound from "@/pages/not-found";
import Dashboard from "./pages/dashboard";
import Courses from "./pages/courses";
import CMS from "./pages/cms";
import Analytics from "./pages/analytics";
import Tokens from "./pages/tokens";
import Community from "./pages/community";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import PublicLanding from "./pages/public-landing";
import PublicCourses from "./pages/public-courses";
import CourseLanding from "./pages/course-landing";
import Signup from "./pages/signup";
import Login from "./pages/login";
import AuthVerify from "./pages/auth-verify";
import Pricing from "./pages/pricing";
import RefundPolicy from "./pages/refund-policy";
import PricingES from "./pages/pricing-es";
import RefundPolicyES from "./pages/refund-policy-es";
import Checkout from "./pages/checkout";
import PublicProfile from "./pages/public-profile";
import AdminDashboard from "./pages/admin-dashboard";
import CourseEdit from "./pages/course-edit";
import ModuleEdit from "./pages/module-edit";
import ModuleViewer from "./pages/module-viewer";

// Component to handle scroll to top on route changes
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* Public routes */}
      <Route path="/" component={PublicLanding} />
      <Route path="/public-courses" component={PublicCourses} />
      <Route path="/course/:id" component={CourseLanding} />
      <Route path="/course/:courseId/module/:moduleId" component={ModuleViewer} />
      <Route path="/peer-practice/course/:courseId/module/:moduleId" component={ModuleViewer} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/auth/verify" component={AuthVerify} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/pricing-es" component={PricingES} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/refund-policy-es" component={RefundPolicyES} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/profile/:userId" component={PublicProfile} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/courses" component={Courses} />
      <Route path="/community" component={Community} />
      <Route path="/cms-legacy" component={CMS} />
      <Route path="/cms" component={AdminDashboard} />
      <Route path="/cms/course/:id" component={CourseEdit} />
      <Route path="/cms/module/:moduleId" component={ModuleEdit} />
      <Route path="/superadmin" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/tokens" component={Tokens} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppContent() {
  const { language } = useLanguage();
  
  return (
    <>
      <Router />
      <CookieNotice language={language as "en" | "es"} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
