import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentCourses from "@/components/dashboard/recent-courses";
import LearningChart from "@/components/dashboard/learning-chart";
import Leaderboard from "@/components/dashboard/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

export default function Dashboard() {
  const { language } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Stats Cards */}
          <StatsCards />

          {/* Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}
