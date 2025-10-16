"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Trophy, MessageSquare, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"

interface CourseReviewModalProps {
  courseId: string
  userId?: string
  courseName?: string
  isOpen: boolean
  onClose: () => void
  language?: "en" | "es"
}

export function CourseReviewModal({ 
  courseId, 
  userId, 
  courseName, 
  isOpen, 
  onClose, 
  language = "en" 
}: CourseReviewModalProps) {
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

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
      
      toast({
        title: language === "en" ? "Review submitted!" : "¡Reseña enviada!",
        description: language === "en" 
          ? "Thank you for your feedback." 
          : "Gracias por tus comentarios.",
      })
      
      // Reset form and close modal
      setRating(0)
      setComment("")
      onClose()
    },
    onError: () => {
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en" 
          ? "Failed to submit review. Please try again." 
          : "Error al enviar reseña. Inténtalo de nuevo.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: language === "en" ? "Rating required" : "Calificación requerida",
        description: language === "en" 
          ? "Please select a star rating before submitting." 
          : "Por favor selecciona una calificación antes de enviar.",
        variant: "destructive",
      })
      return
    }

    submitReviewMutation.mutate({ rating, comment })
  }

  const isSubmitDisabled = rating === 0 || submitReviewMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="review-modal-overlay">
      <Card className="w-full max-w-lg bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {language === "en" ? "🎉 Congratulations!" : "🎉 ¡Felicitaciones!"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "en" 
                    ? "You've completed the entire course!" 
                    : "¡Has completado todo el curso!"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-review-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Course completion message */}
          <div className="text-center py-4">
            <h3 className="font-semibold mb-2">
              {courseName || (language === "en" ? "Course" : "Curso")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Help other students by sharing your experience"
                : "Ayuda a otros estudiantes compartiendo tu experiencia"}
            </p>
          </div>

          {/* Rating section */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {language === "en" ? "Your Rating" : "Tu Calificación"}
            </label>
            <div className="flex justify-center">
              <StarRating
                value={rating}
                onChange={setRating}
                size={24}
                data-testid="review-modal-rating"
              />
            </div>
          </div>

          {/* Comment section */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              {language === "en" ? "Your Review (Optional)" : "Tu Reseña (Opcional)"}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={language === "en" 
                ? "Share your thoughts about this course..."
                : "Comparte tu opinión sobre este curso..."}
              className="min-h-[100px] resize-none"
              maxLength={500}
              data-testid="review-modal-comment"
            />
            {comment.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={submitReviewMutation.isPending}
              className="flex-1"
              data-testid="skip-review-button"
            >
              {language === "en" ? "Skip for Now" : "Omitir por Ahora"}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1"
              data-testid="submit-review-button"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  {language === "en" ? "Submitting..." : "Enviando..."}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  {language === "en" ? "Submit Review" : "Enviar Reseña"}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {language === "en"
              ? "Your review will help improve the course for future students"
              : "Tu reseña ayudará a mejorar el curso para futuros estudiantes"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}