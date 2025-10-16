import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnalyticsCharts from "@/components/analytics/charts";
import { Users, Trophy, Coins, DollarSign, Download, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Analytics() {
  const [period, setPeriod] = useState("30");

  const { data: stats } = useQuery<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
    revenue: string;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const handleExportReport = () => {
    console.log("Exporting analytics report...");
  };

  const keyMetrics = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toString() || "0",
      change: "+12.5% from last month",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "metric-total-users"
    },
    {
      title: "Course Completions",
      value: "2,456",
      change: "+8.3% from last month",
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "metric-course-completions"
    },
    {
      title: "Tokens Distributed",
      value: stats?.tokensDistributed ? `${(parseFloat(stats.tokensDistributed) / 1000).toFixed(1)}K` : "0K",
      change: "+15.7% from last month",
      icon: Coins,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "metric-tokens-distributed"
    },
    {
      title: "Revenue",
      value: stats?.revenue ? `$${parseFloat(stats.revenue).toFixed(2)}` : "$0",
      change: "+22.1% from last month",
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "metric-revenue"
    }
  ];

  const topCourses = [
    { id: "1", title: "Advanced Web Development", completions: 1247, rating: 4.9, rank: 1 },
    { id: "2", title: "Financial Analysis", completions: 967, rating: 4.8, rank: 2 },
    { id: "3", title: "Digital Marketing", completions: 834, rating: 4.7, rank: 3 }
  ];

  const engagementMetrics = [
    { label: "Daily Active Users", value: "3,247", percentage: 78, testId: "engagement-daily-active" },
    { label: "Session Duration", value: "24 min", percentage: 65, testId: "engagement-session-duration" },
    { label: "Course Completion Rate", value: "72%", percentage: 72, testId: "engagement-completion-rate" }
  ];

  const tokenDistribution = [
    { label: "Course Completion", percentage: 65, color: "bg-primary", testId: "distribution-courses" },
    { label: "Quiz Performance", percentage: 20, color: "bg-accent", testId: "distribution-quizzes" },
    { label: "Community Help", percentage: 15, color: "bg-muted-foreground", testId: "distribution-community" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Analytics Dashboard" 
          subtitle="Comprehensive insights into platform performance and user engagement"
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Select value={period} onValueChange={setPeriod} data-testid="select-analytics-period">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleExportReport} data-testid="button-export-report">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title} data-testid={metric.testId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground" data-testid={`${metric.testId}-label`}>
                          {metric.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground" data-testid={`${metric.testId}-value`}>
                          {metric.value}
                        </p>
                        <p className="text-sm text-primary mt-1" data-testid={`${metric.testId}-change`}>
                          {metric.change}
                        </p>
                      </div>
                      <div className={`p-3 ${metric.bgColor} rounded-full`}>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <AnalyticsCharts />

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Distribution */}
            <Card data-testid="token-distribution-card">
              <CardHeader>
                <CardTitle data-testid="token-distribution-title">Token Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenDistribution.map((item) => (
                  <div key={item.label} className="flex items-center justify-between" data-testid={item.testId}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t border-[#eaf8fb]">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary" data-testid="total-tokens-distributed">
                      {stats?.tokensDistributed || "0"}
                    </p>
                    <p className="text-sm text-muted-foreground">Total PARCERO Distributed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Courses */}
            <Card data-testid="top-courses-card">
              <CardHeader>
                <CardTitle data-testid="top-courses-title">Top Performing Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCourses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-3" data-testid={`top-course-${course.id}`}>
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      course.rank === 1 ? 'bg-primary text-primary-foreground' :
                      course.rank === 2 ? 'bg-accent text-accent-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {course.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" data-testid={`course-title-${course.id}`}>
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`course-completions-${course.id}`}>
                        {course.completions.toLocaleString()} completions
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary" data-testid={`course-rating-${course.id}`}>
                      {course.rating}★
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card data-testid="user-engagement-card">
              <CardHeader>
                <CardTitle data-testid="user-engagement-title">User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagementMetrics.map((metric) => (
                  <div key={metric.label} data-testid={metric.testId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground" data-testid={`${metric.testId}-label`}>
                        {metric.label}
                      </span>
                      <span className="text-sm font-medium text-foreground" data-testid={`${metric.testId}-value`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${metric.percentage}%` }}
                        data-testid={`${metric.testId}-bar`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
