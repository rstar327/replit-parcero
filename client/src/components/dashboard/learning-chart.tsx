import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";

export default function LearningChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Sample data
    const data = [2, 3, 2.5, 4, 3.5, 5, 4.5];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = rect.height - 2 * padding;
    
    // Find max value for scaling
    const maxValue = Math.max(...data);
    
    // Draw grid lines
    ctx.strokeStyle = '#eaf8fb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw the line chart
    ctx.strokeStyle = 'hsl(158, 64%, 52%)';
    ctx.fillStyle = 'hsla(158, 64%, 52%, 0.1)';
    ctx.lineWidth = 2;
    
    // Create path
    const path = new Path2D();
    const fillPath = new Path2D();
    
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      
      if (index === 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, padding + chartHeight);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    });
    
    // Close fill path
    fillPath.lineTo(padding + chartWidth, padding + chartHeight);
    fillPath.closePath();
    
    // Fill area
    ctx.fill(fillPath);
    
    // Draw line
    ctx.stroke(path);
    
    // Draw points
    ctx.fillStyle = 'hsl(158, 64%, 52%)';
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = rect.height - 10;
      ctx.fillText(label, x, y);
    });
    
  }, [period]);

  return null;
}
