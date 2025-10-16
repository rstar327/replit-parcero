"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Star, MessageSquare, Trophy, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CourseCompletionPromptProps {
  courseId: string
  userId?: string
  className?: string
  onReviewClick?: () => void
}

export function CourseCompletionPrompt({ courseId, userId, className, onReviewClick }: CourseCompletionPromptProps) {
  // Check if user has completed all modules
  const { data: completion, isLoading } = useQuery<{
    isCompleted: boolean
    completedModules: number
    totalModules: number
  }>({
    queryKey: ["course-completion", courseId, userId],
    enabled: !!courseId && !!userId,
    staleTime: 30000, // Cache for 30 seconds
  })

  // Don't render if still loading or user hasn't completed the course
  if (isLoading || !completion?.isCompleted) {
    return null
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 ${className}`} data-testid="course-completion-prompt">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Congratulations! 🎉</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              You've completed all {completion.totalModules} modules in this course
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {completion.completedModules}/{completion.totalModules} Modules Complete
          </Badge>
          <span>•</span>
          <span>Course Finished!</span>
        </div>

        <div className="bg-card/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Share Your Experience</h4>
              <p className="text-xs text-muted-foreground">
                Help other students by sharing your thoughts on this course
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onReviewClick}
            className="w-full text-sm h-9"
            data-testid="write-review-button"
          >
            <Star className="h-4 w-4 mr-2" />
            Write a Review
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Your review will help improve the course for future students
        </p>
      </CardContent>
    </Card>
  )
}