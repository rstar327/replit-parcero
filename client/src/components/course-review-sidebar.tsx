"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Send, MessageSquare, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/star-rating"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import type { CourseReview } from "@shared/schema"

interface CourseReviewSidebarProps {
  courseId: string
  userId?: string
  className?: string
}

interface CourseRatingStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
}

export function CourseReviewSidebar({ courseId, userId, className }: CourseReviewSidebarProps) {
  const [newReviewRating, setNewReviewRating] = React.useState<number>(0)
  const [newReviewComment, setNewReviewComment] = React.useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch course reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<CourseReview[]>({
    queryKey: ["course-reviews", courseId],
    enabled: !!courseId,
    staleTime: 0,
    gcTime: 0,
  })

  // Fetch course rating stats
  const { data: ratingStats, isLoading: statsLoading } = useQuery<CourseRatingStats>({
    queryKey: ["course-rating-stats", courseId],
    enabled: !!courseId,
    staleTime: 0,
    gcTime: 0,
  })

  // Fetch user's existing review
  const { data: userReview } = useQuery<{ review: CourseReview | null }>({
    queryKey: ["user-course-review", courseId, userId],
    enabled: !!courseId && !!userId,
    staleTime: 0,
    gcTime: 0,
  })

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, comment: comment.trim() || undefined }),
      })
      if (!response.ok) throw new Error("Failed to submit review")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] })
      queryClient.invalidateQueries({ queryKey: ["course-rating-stats", courseId] })
      queryClient.invalidateQueries({ queryKey: ["user-course-review", courseId, userId] })
      
      setNewReviewRating(0)
      setNewReviewComment("")
      
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmitReview = () => {
    if (newReviewRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    submitReviewMutation.mutate({
      rating: newReviewRating,
      comment: newReviewComment,
    })
  }

  const isSubmitDisabled = newReviewRating === 0 || submitReviewMutation.isPending
  const hasUserReviewed = userReview?.review !== null
  const canReview = userId && !hasUserReviewed

  // Don't render if no reviews exist and not loading
  if (!reviewsLoading && reviews.length === 0) {
    return null
  }

  return (
    <Card className={className} data-testid="course-review-sidebar">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Course Reviews
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Overview */}
        {ratingStats && (
          <div className="space-y-3" data-testid="rating-overview">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating value={ratingStats.averageRating} readOnly showValue />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingStats.ratingDistribution?.[stars] || 0
                const percentage = ratingStats.totalReviews > 0 
                  ? Math.round((count / ratingStats.totalReviews) * 100) 
                  : 0
                
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Add Review Section */}
        {canReview && (
          <div className="space-y-3" data-testid="add-review-section">
            <h4 className="font-medium text-sm">Add Your Review</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Your Rating
                </label>
                <StarRating
                  value={newReviewRating}
                  onChange={setNewReviewRating}
                  size={24}
                  data-testid="review-star-rating"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Your Comment (optional)
                </label>
                <Textarea
                  placeholder="Share your thoughts about this course..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="min-h-20 resize-none text-sm"
                  data-testid="review-comment-textarea"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitDisabled}
                className="w-full"
                size="sm"
                data-testid="submit-review-button"
              >
                <Send className="h-3 w-3 mr-2" />
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}

        {/* User's existing review */}
        {hasUserReviewed && userReview?.review && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg" data-testid="user-existing-review">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Your Review</span>
              <StarRating value={userReview.review.rating} readOnly size={14} />
            </div>
            {userReview.review.comment && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {userReview.review.comment}
              </p>
            )}
          </div>
        )}

        {!userId && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            Please log in to add a review
          </div>
        )}

        <Separator />

        {/* Reviews List */}
        <div className="space-y-4" data-testid="reviews-list">
          <h4 className="font-medium text-sm flex items-center gap-2">
            Recent Reviews
            {!reviewsLoading && (
              <Badge variant="secondary" className="text-xs">
                {reviews.length}
              </Badge>
            )}
          </h4>

          {reviewsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No reviews yet. Be the first to review this course!
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2" data-testid={`review-${review.id}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {review.userId?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            Anonymous Student
                          </span>
                          <StarRating value={review.rating} readOnly size={12} />
                        </div>
                        
                        <time className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt!), 'MMM d')}
                        </time>
                      </div>
                      
                      {review.comment && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}