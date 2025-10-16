import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function AnalyticsCharts() {
  const userGrowthRef = useRef<HTMLCanvasElement>(null);
  const coursePerformanceRef = useRef<HTMLCanvasElement>(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    drawUserGrowthChart();
    drawCoursePerformanceChart();
  }, [period]);

  const drawUserGrowthChart = () => {
    const canvas = userGrowthRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Sample data
    const newUsers = [1200, 1900, 2300, 2800, 3200, 3600];
    const returningUsers = [800, 1400, 1800, 2200, 2600, 2900];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const padding = 40;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = rect.height - 2 * padding;
    const maxValue = Math.max(...newUsers, ...returningUsers);

    // Draw grid
    ctx.strokeStyle = '#eaf8fb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw new users line
    ctx.strokeStyle = 'hsl(158, 64%, 52%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    newUsers.forEach((value, index) => {
      const x = padding + (index / (newUsers.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw returning users line
    ctx.strokeStyle = 'hsl(43, 96%, 56%)';
    ctx.beginPath();
    returningUsers.forEach((value, index) => {
      const x = padding + (index / (returningUsers.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth;
      ctx.fillText(label, x, rect.height - 10);
    });
  };

  const drawCoursePerformanceChart = () => {
    const canvas = coursePerformanceRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Sample data for doughnut chart
    const data = [35, 25, 15, 15, 10];
    const colors = [
      'hsl(158, 64%, 52%)',
      'hsl(43, 96%, 56%)',
      'hsl(197, 37%, 24%)',
      'hsl(43, 74%, 66%)',
      'hsl(27, 87%, 67%)'
    ];
    const labels = ['Web Development', 'Finance', 'Design', 'Marketing', 'Others'];

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const innerRadius = radius * 0.6;

    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, val) => sum + val, 0);

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Course', centerX, centerY - 5);
    ctx.font = '16px Inter';
    ctx.fillText('Performance', centerX, centerY + 15);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <Card data-testid="user-growth-chart">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle data-testid="user-growth-title">User Growth</CardTitle>
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-3 h-3 bg-primary rounded-full"></span>
            <span className="text-muted-foreground">New Users</span>
            <span className="w-3 h-3 bg-accent rounded-full ml-4"></span>
            <span className="text-muted-foreground">Returning Users</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <canvas 
              ref={userGrowthRef} 
              className="w-full h-full"
              data-testid="user-growth-canvas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Chart */}
      <Card data-testid="course-performance-chart">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle data-testid="course-performance-title">Course Performance</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-course-details">
            View Details
          </Button>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <canvas 
              ref={coursePerformanceRef} 
              className="w-full h-full"
              data-testid="course-performance-canvas"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
