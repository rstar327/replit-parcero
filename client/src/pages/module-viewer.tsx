import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/language-context";
import Header from "@/components/layout/header";
import { YouTubeVideo } from "@/components/ui/youtube-video";
import { ExerciseRenderer } from "@/components/exercise/exercise-renderer";
import { CallRequestNotification } from "@/components/call/call-request-notification";
import { CallScreen } from "@/components/call/call-screen";
import { CourseReviewModal } from "@/components/course-review-modal";
import { PeerEvaluationModal } from "@/components/peer-evaluation-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  BookOpen,
  Trophy,
  Award,
  Play,
  Pause,
  RotateCcw,
  Star,
  Lock,
  Menu,
  X,
  MessageSquare,
  Users,
  User,
  ThumbsUp,
  ThumbsDown,
  Send,
  UserPlus
} from "lucide-react";

// Function to render HTML content with YouTube videos
const renderHTMLWithVideos = (html: string) => {
  const youtubePattern = /<a[^>]*href="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+)"[^>]*>.*?<\/a>|https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/g;
  const components: JSX.Element[] = [];
  let lastIndex = 0;
  let match;

  while ((match = youtubePattern.exec(html)) !== null) {
    // Add HTML content before the YouTube URL/link
    if (match.index > lastIndex) {
      const htmlBefore = html.slice(lastIndex, match.index);
      if (htmlBefore.trim()) {
        components.push(
          <div 
            key={`html-${components.length}`}
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: htmlBefore }}
          />
        );
      }
    }

    // Extract the YouTube URL - either from href attribute or direct URL
    let youtubeUrl = match[1] || match[0]; // match[1] is href, match[0] is the full match
    if (youtubeUrl.startsWith('<')) {
      // If it's still HTML, extract just the URL
      const urlMatch = youtubeUrl.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/);
      youtubeUrl = urlMatch ? urlMatch[0] : youtubeUrl;
    }

    // Add YouTube video component
    components.push(
      <YouTubeVideo 
        key={`video-${components.length}`} 
        url={youtubeUrl} 
        className="my-4" 
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining HTML content after the last YouTube URL
  if (lastIndex < html.length) {
    const htmlAfter = html.slice(lastIndex);
    if (htmlAfter.trim()) {
      components.push(
        <div 
          key={`html-${components.length}`}
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: htmlAfter }}
        />
      );
    }
  }

  // If no YouTube URLs were found, render the original HTML
  if (components.length === 0) {
    return [
      <div 
        key="html-only"
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ];
  }

  return components;
};

// Peer Feedback Section Component
const PeerFeedbackSection = ({ 
  moduleId, 
  userId, 
  language 
}: { 
  moduleId: string; 
  userId: string; 
  language: "en" | "es";
}) => {
  const { data: peerEvaluations } = useQuery({
    queryKey: [`/api/modules/${moduleId}/peer-evaluations/${userId}`],
    enabled: !!moduleId && !!userId,
  });

  if (!peerEvaluations || peerEvaluations.length === 0) {
    return null; // Don't show section if no peer feedback exists
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {language === "en" ? "Peer Feedback" : "Comentarios de Compañeros"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {peerEvaluations.map((evaluation: any, index: number) => (
          <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={evaluation.evaluatorAvatar} />
                  <AvatarFallback>
                    {evaluation.evaluatorUsername?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{evaluation.evaluatorUsername}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(evaluation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant={evaluation.approved ? "default" : "secondary"}>
                {evaluation.approved 
                  ? (language === "en" ? "Approved" : "Aprobado")
                  : (language === "en" ? "Needs Practice" : "Necesita Práctica")
                }
              </Badge>
            </div>

            {/* Skill Ratings */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "en" ? "Grammar" : "Gramática"}
                </p>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= evaluation.grammarRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "en" ? "Vocabulary" : "Vocabulario"}
                </p>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= evaluation.vocabularyRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "en" ? "Pronunciation" : "Pronunciación"}
                </p>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= evaluation.pronunciationRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Text */}
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm">{evaluation.feedback}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Module Community Section Component
const ModuleCommunitySection = ({ 
  moduleId, 
  moduleTitle, 
  userId, 
  userProfile,
  language 
}: { 
  moduleId: string; 
  moduleTitle: string; 
  userId: string;
  userProfile: { id: string; username: string; fullName: string; email: string; tokenBalance: string; role: string; avatar?: string; };
  language: string; 
}) => {
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch module-specific community posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community/posts", moduleId],
    queryFn: () => fetch(`/api/community/posts?moduleId=${moduleId}`).then(res => res.json()),
  });

  // Fetch online users for connecting
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ["/api/online-users"],
  });

  // Fetch module ratings
  const { data: moduleRatings = { thumbsUp: 0, thumbsDown: 0 } } = useQuery({
    queryKey: [`/api/modules/${moduleId}/ratings`],
  });

  // Fetch user's rating for this module
  const { data: userRating } = useQuery({
    queryKey: [`/api/modules/${moduleId}/user-rating/${userId}`],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string; type: string; moduleId?: string; parentId?: string }) => {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...postData, authorId: userId })
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", moduleId] });
      toast({
        title: language === "en" ? "Comment posted!" : "¡Comentario publicado!",
        description: language === "en" ? "Your comment has been shared." : "Tu comentario ha sido compartido."
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to post comment" : "Error al publicar comentario",
        description: language === "en" ? "Please try again later." : "Por favor intenta de nuevo más tarde.",
        variant: "destructive"
      });
    }
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (rating: 'thumbs_up' | 'thumbs_down') => {
      const response = await fetch(`/api/modules/${moduleId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rating })
      });
      if (!response.ok) throw new Error('Failed to submit rating');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/modules/${moduleId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/modules/${moduleId}/user-rating/${userId}`] });
      toast({
        title: language === "en" ? "Rating submitted!" : "¡Calificación enviada!",
        description: language === "en" ? "Thank you for rating this module." : "Gracias por calificar este módulo."
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to submit rating" : "Error al enviar calificación",
        description: language === "en" ? "Please try again later." : "Por favor intenta de nuevo más tarde.",
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const extractTitleFromContent = (content: string): string => {
    const trimmedContent = content.trim();
    const sentenceEnd = trimmedContent.search(/[.!?]+(\s|$)/);
    
    if (sentenceEnd !== -1) {
      const firstSentence = trimmedContent.substring(0, sentenceEnd + 1).trim();
      return firstSentence.length > 60 ? firstSentence.substring(0, 57) + "..." : firstSentence;
    }
    
    return trimmedContent.length > 40 ? trimmedContent.substring(0, 40) + "..." : trimmedContent;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return language === "en" ? "Just now" : "Ahora mismo";
    if (diffInHours < 24) return `${diffInHours}h ${language === "en" ? "ago" : ""}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${language === "en" ? "ago" : ""}`;
  };

  const handlePost = () => {
    if (!comment.trim() || comment.trim().length < 10) {
      toast({
        title: language === "en" ? "Comment too short" : "Comentario muy corto",
        description: language === "en" ? "Please write at least 10 characters." : "Por favor escribe al menos 10 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    createPostMutation.mutate({
      title: extractTitleFromContent(comment),
      content: comment,
      type: "module_discussion",
      moduleId: moduleId
    });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    createPostMutation.mutate({
      title: extractTitleFromContent(replyContent),
      content: replyContent,
      type: "module_discussion", 
      moduleId: moduleId,
      parentId: parentId
    });
    
    setReplyContent("");
    setReplyingTo(null);
  };

  // Organize posts with replies
  const organizePostsWithReplies = (posts: any[]) => {
    if (!posts) return [];
    
    const topLevelPosts = posts.filter(post => !post.parentId);
    const replies = posts.filter(post => post.parentId);
    
    return topLevelPosts.map(post => ({
      ...post,
      replies: replies.filter(reply => reply.parentId === post.id)
    }));
  };

  const organizedPosts = organizePostsWithReplies(Array.isArray(posts) ? posts : []);
  const otherUsers = onlineUsers.filter((user: any) => user.id !== userId);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {language === "en" ? "Community" : "Comunidad"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "en" 
            ? "Ask questions, share insights, and connect with other learners studying this module."
            : "Haz preguntas, comparte ideas y conéctate con otros estudiantes de este módulo."
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Module Rating */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {language === "en" ? "Did you like this module?" : "¿Te gustó este módulo?"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={userRating?.rating === "thumbs_up" ? "default" : "outline"}
              size="sm"
              onClick={() => ratingMutation.mutate("thumbs_up")}
              disabled={ratingMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-thumbs-up"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium">{moduleRatings.thumbsUp}</span>
            </Button>
            <Button
              variant={userRating?.rating === "thumbs_down" ? "default" : "outline"}
              size="sm"
              onClick={() => ratingMutation.mutate("thumbs_down")}
              disabled={ratingMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-thumbs-down"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="font-medium">{moduleRatings.thumbsDown}</span>
            </Button>
          </div>
        </div>

        {/* Online Users */}
        {otherUsers.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {language === "en" ? "Online Now" : "En Línea Ahora"} ({otherUsers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherUsers.slice(0, 8).map((user: any) => (
                <Button
                  key={user.id}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-white hover:bg-blue-50 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-xs"
                  data-testid={`connect-user-${user.id}`}
                >
                  <Avatar className="w-4 h-4 mr-1">
                    <AvatarFallback className="text-xs">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {user.username || 'User'}
                  <UserPlus className="w-3 h-3 ml-1" />
                </Button>
              ))}
              {otherUsers.length > 8 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{otherUsers.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Comment Form */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile.avatar} alt={userProfile.fullName || userProfile.username} />
              <AvatarFallback className="bg-gray-100 text-gray-400">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={
                  language === "en" 
                    ? "Share your thoughts about this module, ask questions, or help others..."
                    : "Comparte tus pensamientos sobre este módulo, haz preguntas o ayuda a otros..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-20 resize-none text-sm bg-white"
                data-testid="textarea-module-comment"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted-foreground">
                  {comment.trim().length < 10 && comment.trim().length > 0
                    ? `${10 - comment.trim().length} ${language === "en" ? "more characters needed" : "caracteres más necesarios"}`
                    : (language === "en" ? "Share your experience with this module" : "Comparte tu experiencia con este módulo")
                  }
                </div>
                <Button 
                  disabled={!comment.trim() || comment.trim().length < 10 || createPostMutation.isPending} 
                  onClick={handlePost}
                  size="sm"
                  data-testid="button-post-module-comment"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {language === "en" ? "Post" : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                        <div className="h-12 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : organizedPosts.length > 0 ? (
            organizedPosts.map((post: any) => (
              <Card key={post.id} className="bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.authorAvatar} alt={post.authorName || 'User'} />
                      <AvatarFallback className="bg-gray-100 text-gray-400 text-xs">
                        {post.authorName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {post.authorName || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(post.createdAt)}</span>
                      </div>
                      
                      <p className="text-sm text-foreground">{post.content}</p>
                      
                      <div className="flex items-center space-x-3 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          0
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {language === "en" ? "Reply" : "Responder"}
                        </Button>
                      </div>
                      
                      {/* Reply Form */}
                      {replyingTo === post.id && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={userProfile.avatar} alt={userProfile.fullName || userProfile.username} />
                              <AvatarFallback className="bg-gray-100 text-gray-400 text-xs">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                placeholder={language === "en" ? "Write a reply..." : "Escribe una respuesta..."}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-12 resize-none text-sm bg-white"
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                  className="h-6 px-2 text-xs"
                                >
                                  {language === "en" ? "Cancel" : "Cancelar"}
                                </Button>
                                <Button 
                                  disabled={!replyContent.trim() || createPostMutation.isPending}
                                  onClick={() => handleReply(post.id)}
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  {language === "en" ? "Reply" : "Responder"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          {post.replies.map((reply: any) => (
                            <div key={reply.id} className="flex space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.authorAvatar} alt={reply.authorName || 'User'} />
                                <AvatarFallback className="bg-gray-100 text-gray-400 text-xs">
                                  {reply.authorName?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground text-xs">
                                    {reply.authorName || 'Anonymous'}
                                  </span>
                                  <span>•</span>
                                  <span>{formatTimestamp(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs text-foreground mt-1">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium mb-1">
                {language === "en" ? "Start the conversation" : "Inicia la conversación"}
              </p>
              <p className="text-sm">
                {language === "en" 
                  ? "Be the first to comment on this module and help others learn!"
                  : "¡Sé el primero en comentar sobre este módulo y ayuda a otros a aprender!"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ModuleViewer() {
  // Check for both regular and peer view routes
  const [, regularParams] = useRoute("/course/:courseId/module/:moduleId");
  const [, peerParams] = useRoute("/peer-practice/course/:courseId/module/:moduleId");
  const params = regularParams || peerParams;
  const isPeerView = !!peerParams;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentActiveExercise, setCurrentActiveExercise] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [showPeerEvaluationModal, setShowPeerEvaluationModal] = useState(false);
  const [evaluationTarget, setEvaluationTarget] = useState<{ userId: string; userName: string; sessionId: string } | null>(null);
  
  // WebSocket and calling state
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [incomingCallRequest, setIncomingCallRequest] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [callData, setCallData] = useState<any>(null);

  const courseId = params?.courseId;
  const moduleId = params?.moduleId;

  // Fetch user profile (needed for WebSocket authentication)
  const { data: profileData } = useQuery<{
    id: string;
    username: string;
    fullName: string;
    email: string;
    tokenBalance: string;
    role: string;
    avatar?: string;
  }>({
    queryKey: ["/api/profile/user-1"],
  });

  // Fetch all exercise answers to determine completion status
  const { data: exerciseAnswers } = useQuery({
    queryKey: ['exercise-answers-all', profileData?.id, moduleId],
    queryFn: async () => {
      if (!profileData?.id || !moduleId) return [];
      const answers = [];
      // Check each exercise (we'll check up to 10 exercises)
      for (let i = 0; i < 10; i++) {
        try {
          const response = await fetch(`/api/exercise-answers/${profileData.id}/${moduleId}/${i}`);
          if (response.ok) {
            const answer = await response.json();
            answers[i] = answer;
          } else {
            answers[i] = null; // No answer saved
          }
        } catch (error) {
          answers[i] = null;
        }
      }
      return answers;
    },
    enabled: !!(profileData?.id && moduleId && !isPeerView)
  });


  // Auto-scroll to active exercise when it changes and focus first blank
  useEffect(() => {
    if (currentActiveExercise >= 0) {
      setTimeout(() => {
        const activeExerciseElement = document.querySelector(`[data-exercise-index="${currentActiveExercise}"]`);
        if (activeExerciseElement) {
          activeExerciseElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Also focus on the first blank field in this exercise
          setTimeout(() => {
            const firstBlankInput = activeExerciseElement.querySelector(`[data-testid="exercise-input-0"]`) as HTMLInputElement;
            if (firstBlankInput && !firstBlankInput.disabled) {
              firstBlankInput.focus();
            }
          }, 300); // Additional delay to ensure scrolling is complete
        }
      }, 500); // Delay to ensure the exercise is rendered and highlighted
    }
  }, [currentActiveExercise]);

  // WebSocket connection setup (skip in peer view)
  useEffect(() => {
    if (!profileData?.id || isPeerView) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with the server
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: profileData.id
      }));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [profileData?.id]);

  // WebSocket message handler
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'authenticated':
        console.log('WebSocket authenticated successfully');
        break;
      
      case 'online_users_update':
        console.log('Online users updated:', message.onlineUsers);
        break;
      
      case 'call_request':
        setIncomingCallRequest(message);
        toast({
          title: language === "en" ? "Incoming Call Request!" : "¡Solicitud de Llamada Entrante!",
          description: language === "en" 
            ? `${message.callerName} wants to practice with you`
            : `${message.callerName} quiere practicar contigo`,
        });
        break;
      
      case 'call_accepted':
        setActiveCall(message.sessionId);
        setCallStatus('connected');
        setCallData({
          sessionId: message.sessionId,
          partnerId: message.partnerId,
          partnerName: message.partnerName,
          partnerAvatar: message.partnerAvatar,
          exerciseTitle: message.exerciseTitle,
          duration: message.duration,
          topics: message.topics
        });
        toast({
          title: language === "en" ? "Call Accepted!" : "¡Llamada Aceptada!",
          description: language === "en" ? "Starting your practice session..." : "Iniciando tu sesión de práctica...",
        });
        break;
      
      case 'call_declined':
        setCallStatus(null);
        toast({
          title: language === "en" ? "Call Declined" : "Llamada Rechazada",
          description: language === "en" ? "Your partner declined the call" : "Tu compañero rechazó la llamada",
        });
        break;
      
      case 'call_ended':
        // Check if this user should evaluate their peer
        if (callData && message.shouldEvaluate && profileData) {
          setEvaluationTarget({
            userId: message.evaluatedUserId,
            userName: message.evaluatedUserName,
            sessionId: message.sessionId
          });
          setShowPeerEvaluationModal(true);
        }
        
        setActiveCall(null);
        setCallStatus(null);
        setCallData(null);
        setIncomingCallRequest(null);
        toast({
          title: language === "en" ? "Call Ended" : "Llamada Terminada",
          description: language === "en" ? "Practice session completed" : "Sesión de práctica completada",
        });
        break;
      
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  // Send call request
  const sendCallRequest = (peerId: string, exerciseId: string, duration: number) => {
    if (!socket || !profileData) return;

    const callRequestData = {
      type: 'call_request',
      callerId: profileData.id,
      calleeId: peerId,
      exerciseId,
      duration,
      callerName: profileData.fullName || profileData.username
    };

    socket.send(JSON.stringify(callRequestData));
    setCallStatus('requesting');
  };

  // Accept call request
  const acceptCallRequest = () => {
    if (!socket || !incomingCallRequest) return;

    socket.send(JSON.stringify({
      type: 'call_accept',
      requestId: incomingCallRequest.requestId
    }));

    setIncomingCallRequest(null);
  };

  // Decline call request
  const declineCallRequest = () => {
    if (!socket || !incomingCallRequest) return;

    socket.send(JSON.stringify({
      type: 'call_decline',
      requestId: incomingCallRequest.requestId
    }));

    setIncomingCallRequest(null);
  };

  // End active call
  const endCall = () => {
    if (!socket || !activeCall) return;

    socket.send(JSON.stringify({
      type: 'end_call',
      sessionId: activeCall
    }));

    setActiveCall(null);
    setCallStatus(null);
    setCallData(null);
  };

  // Fetch course data
  const { data: course } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch module data
  const { data: module } = useQuery({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
    select: (modules: any[]) => modules?.find(m => m.id === moduleId)
  });

  // Fetch all modules for navigation
  const { data: allModules } = useQuery({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  // Fetch user progress for this module (skip in peer view)
  const { data: progress } = useQuery({
    queryKey: [`/api/progress/user-1/module/${moduleId}`],
    enabled: !!moduleId && !!profileData && !isPeerView,
  });

  // Check enrollment status (skip in peer view)
  const { data: enrollmentStatus } = useQuery({
    queryKey: [`/api/enrollment/user-1/${courseId}`],
    enabled: !!courseId && !!profileData && !isPeerView,
  });

  const isEnrolled = (enrollmentStatus as any)?.isEnrolled || false;
  const currentModuleIndex = (allModules as any)?.findIndex((m: any) => m.id === moduleId) ?? -1;
  const isFreeModule = currentModuleIndex < 3; // First 3 modules are free
  const hasAccess = isPeerView || isEnrolled || isFreeModule; // Peer view always has access

  // Calculate enrollment costs and balance
  const userBalance = parseFloat((profileData as any)?.tokenBalance || "0");
  const coursePrice = parseFloat((course as any)?.price || "0");
  const hasInsufficientTokens = profileData && course && userBalance < coursePrice;

  // Enrollment mutation
  const enrollmentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/enroll", {
        userId: profileData?.id || "user-1",
        courseId
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [`/api/enrollment/user-1/${courseId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile/user-1"] });
        toast({
          title: language === "en" ? "Enrolled Successfully!" : "¡Inscrito Exitosamente!",
          description: language === "en" ? `Welcome to the course! Your new balance is ${data.newBalance} tokens.` : `¡Bienvenido al curso! Tu nuevo saldo es ${data.newBalance} tokens.`,
        });
      }
    },
    onError: () => {
      toast({
        title: language === "en" ? "Enrollment Failed" : "Fallo en la Inscripción",
        description: language === "en" ? "Failed to enroll in course. Please try again." : "Error al inscribirse en el curso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleEnrollment = () => {
    if (!profileData) {
      // Redirect to signup if not logged in
      window.location.href = "/signup";
      return;
    }
    // Always show confirmation modal
    setShowEnrollConfirm(true);
  };

  const confirmEnrollment = () => {
    setShowEnrollConfirm(false);
    enrollmentMutation.mutate();
  };

  // A module is only complete when ALL exercises (including live practice) are completed successfully
  const isCompleted = (() => {
    if (!exerciseAnswers || !module || !((module as any).exercises || module.exercise)) {
      return false;
    }
    
    const exercises = (module as any).exercises || [module.exercise];
    
    // Check if all exercises are properly completed (marked as correct)
    for (let i = 0; i < exercises.length; i++) {
      const answer = exerciseAnswers[i];
      if (!answer || !answer.isCorrect) {
        return false; // Exercise not completed successfully
      }
    }
    
    return true; // All exercises completed successfully
  })();

  // Check if this is the last module in the course and just completed
  const isLastModule = allModules && currentModuleIndex === (allModules as any[]).length - 1;
  const shouldShowReviewPrompt = isCompleted && isLastModule && hasAccess && profileData;

  // Auto-open review modal when user completes the last module
  useEffect(() => {
    if (shouldShowReviewPrompt && !showReviewModal) {
      setShowReviewModal(true);
    }
  }, [shouldShowReviewPrompt, showReviewModal]);

  // Auto module progression when module is completed
  useEffect(() => {
    if (isCompleted && hasAccess && allModules && !isLastModule) {
      // Add a delay to allow user to see completion message
      const timer = setTimeout(() => {
        const nextModuleIndex = currentModuleIndex + 1;
        const nextModule = (allModules as any[])[nextModuleIndex];
        
        if (nextModule) {
          const nextModuleIsFree = nextModuleIndex < 3; // First 3 modules are free
          const hasNextModuleAccess = isEnrolled || nextModuleIsFree;
          
          if (hasNextModuleAccess) {
            // User has access - smoothly redirect to next module
            toast({
              title: language === "en" ? "Moving to Next Module..." : "Avanzando al Siguiente Módulo...",
              description: language === "en" ? `Continuing with: ${nextModule.title}` : `Continuando con: ${nextModule.title}`,
            });
            
            setTimeout(() => {
              setLocation(`/course/${courseId}/module/${nextModule.id}`);
            }, 1500);
          } else {
            // User doesn't have access - show enrollment modal
            toast({
              title: language === "en" ? "Great Progress!" : "¡Excelente Progreso!",
              description: language === "en" ? "Ready to continue? Upgrade to unlock more modules." : "¿Listo para continuar? Actualiza para desbloquear más módulos.",
            });
            
            setTimeout(() => {
              setShowEnrollConfirm(true);
            }, 2000);
          }
        }
      }, 2000); // 2 second delay to show completion message
      
      return () => clearTimeout(timer);
    }
  }, [isCompleted, hasAccess, allModules, isLastModule, currentModuleIndex, isEnrolled, courseId, language, setLocation]);

  // Determine which exercise should be active based on completion status
  useEffect(() => {
    if (exerciseAnswers && module && ((module as any).exercises || module.exercise)) {
      const exercises = (module as any).exercises || [module.exercise];
      
      // Find the first exercise that needs attention (incomplete or incorrect)
      let nextActiveExercise = 0;
      for (let i = 0; i < exercises.length; i++) {
        const answer = exerciseAnswers[i];
        const exercise = exercises[i];
        
        // For fill-in-blank exercises, check if all blanks are filled and correct
        if (exercise.type === 'fill_in_blank' || (exercise.text && exercise.blanks)) {
          const blanksCount = exercise.blanks?.length || 0;
          const hasAllAnswers = answer?.answers && answer.answers.length === blanksCount && 
                               answer.answers.every((ans: string) => ans && ans.trim() !== '');
          const isCorrect = answer?.isCorrect === true;
          
          // Exercise needs attention if it's missing answers or has incorrect answers
          if (!hasAllAnswers || (hasAllAnswers && answer?.isSubmitted && !isCorrect)) {
            nextActiveExercise = i;
            break;
          }
        }
        // For live call exercises, check if completed
        else if (exercise.type === 'live_call' || (exercise.title && exercise.duration)) {
          const isComplete = answer?.isCorrect || answer?.isSubmitted;
          if (!isComplete) {
            nextActiveExercise = i;
            break;
          }
        }
        // For other exercise types, use basic completion check
        else {
          const hasAnswers = answer && answer.answers && Array.isArray(answer.answers) && answer.answers.length > 0;
          const isComplete = answer?.isCorrect || hasAnswers;
          if (!isComplete) {
            nextActiveExercise = i;
            break;
          }
        }
        
        // If all exercises are complete, stay on the last one
        if (i === exercises.length - 1) {
          nextActiveExercise = i;
        }
      }
      setCurrentActiveExercise(nextActiveExercise);
    }
  }, [exerciseAnswers, module]);

  // Progress tracking mutation
  const progressMutation = useMutation({
    mutationFn: async (data: { progress: number; timeSpent: number; completed: boolean }) => {
      const response = await apiRequest("POST", "/api/progress/update", {
        userId: "user-1",
        moduleId,
        courseId,
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/user-1/module/${moduleId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/user-1"] });
    }
  });

  // Peer evaluation mutation
  const peerEvaluationMutation = useMutation({
    mutationFn: async (evaluation: {
      sessionId: string;
      evaluatorId: string;
      evaluatedUserId: string;
      moduleId: string;
      exerciseIndex: number;
      grammarRating: number;
      vocabularyRating: number;
      pronunciationRating: number;
      approved: boolean;
      feedback: string;
    }) => {
      const response = await apiRequest("POST", "/api/peer-evaluations", evaluation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/modules/${moduleId}/peer-evaluations`] });
      setShowPeerEvaluationModal(false);
      setEvaluationTarget(null);
      toast({
        title: language === "en" ? "Evaluation Submitted!" : "¡Evaluación Enviada!",
        description: language === "en" ? "Thank you for helping your peer practice!" : "¡Gracias por ayudar a tu compañero a practicar!",
      });
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
        setTimeSpent(prev => prev + 1/60); // increment by 1 second converted to minutes
        
        // Auto-advance progress while playing
        if (module?.duration) {
          const newProgress = Math.min(100, (elapsed / module.duration) * 100);
          setCurrentProgress(newProgress);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, startTime, module?.duration]);

  // Save progress periodically
  useEffect(() => {
    if (currentProgress > 0 && hasAccess) {
      const isCompleted = currentProgress >= 95; // 95% is considered complete
      progressMutation.mutate({
        progress: Math.floor(currentProgress),
        timeSpent: Math.floor(timeSpent),
        completed: isCompleted
      });
    }
  }, [Math.floor(currentProgress / 10)]); // Save every 10% progress

  const handlePlayPause = () => {
    if (!isPlaying) {
      setStartTime(Date.now());
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentProgress(0);
    setTimeSpent(0);
    setStartTime(null);
  };

  const handleCompleteModule = () => {
    if (hasAccess) {
      setCurrentProgress(100);
      progressMutation.mutate({
        progress: 100,
        timeSpent: Math.floor(timeSpent),
        completed: true
      });
      
      toast({
        title: language === "en" ? "Module Completed!" : "¡Módulo Completado!",
        description: language === "en" 
          ? `You earned ${Math.floor(parseFloat(module?.tokenReward || '1'))} PARCERO tokens!` 
          : `¡Ganaste ${Math.floor(parseFloat(module?.tokenReward || '1'))} tokens PARCERO!`,
      });
    }
  };

  const navigateToModule = (direction: 'prev' | 'next') => {
    if (!allModules) return;
    
    const newIndex = direction === 'next' ? currentModuleIndex + 1 : currentModuleIndex - 1;
    const targetModule = (allModules as any[])[newIndex];
    
    if (targetModule) {
      const targetIsFree = newIndex < 3;
      if (isEnrolled || targetIsFree) {
        setLocation(`/course/${courseId}/module/${targetModule.id}`);
      } else {
        toast({
          title: language === "en" ? "Premium Module" : "Módulo Premium",
          description: language === "en" ? "Enroll in the course to access this module" : "Inscríbete en el curso para acceder a este módulo",
          variant: "destructive"
        });
      }
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "en" ? "Premium Module" : "Módulo Premium"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "en" 
                ? "This module requires course enrollment to access"
                : "Este módulo requiere inscripción al curso para acceder"
              }
            </p>
            <div className="space-y-2">
              <Button onClick={handleEnrollment} className="w-full">
                {language === "en" ? "Enroll Now" : "Inscribirse Ahora"}
              </Button>
              <Button variant="outline" onClick={() => setLocation(`/course/${courseId}`)}>
                {language === "en" ? "Back to Course" : "Volver al Curso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === "en" ? "Loading module..." : "Cargando módulo..."}</p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={language === "en" ? "Learning Module" : "Módulo de Aprendizaje"} 
        subtitle={module?.title || ""} 
      />
      
      {/* Peer View Indicator */}
      {isPeerView && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                {language === "en" ? "Peer Practice Mode" : "Modo de Práctica entre Pares"}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {language === "en" 
                ? "You're viewing this module to help a peer practice. No progress will be saved." 
                : "Estás viendo este módulo para ayudar a un compañero a practicar. No se guardará el progreso."
              }
            </div>
          </div>
        </div>
      )}
      
      {/* Call Request Notification (hidden in peer view) */}
      {!isPeerView && (
        <CallRequestNotification
          request={incomingCallRequest}
          onAccept={acceptCallRequest}
          onDecline={declineCallRequest}
          language={language}
        />
      )}

      {/* Active Call Screen (hidden in peer view) */}
      {!isPeerView && activeCall && callData && (
        <CallScreen
          callData={callData}
          onEndCall={endCall}
          language={language}
        />
      )}
      
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-background shadow-md"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex relative">
        {/* Left Sidebar Navigation */}
        <div className={`
          w-80 bg-card border-r border-border min-h-screen overflow-y-auto scrollbar-thin
          lg:block
          ${isMobileSidebarOpen ? 'block' : 'hidden'}
          lg:relative absolute lg:z-auto z-40
          lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          lg:w-80 ${isMobileSidebarOpen ? 'w-[90vw]' : 'w-80'}
        `}>
          {/* All Content in One Scrollable Container */}
          <div className="p-6 pt-6">
            <div className="mb-6">
              <h2 
                className="text-lg font-semibold mb-3 text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => setLocation(`/course/${courseId}`)}
              >
                {(course as any)?.title || "Course"}
              </h2>
              
              {/* Course Progress Summary */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                {/* Circular Progress Indicator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${currentProgress || (progress as any)?.progress || 0}, 100`}
                        className="text-primary transition-all duration-500 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="text-xs font-semibold text-primary">
                            {Math.floor(currentProgress || (progress as any)?.progress || 0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  {isCompleted ? 1 : 0} / {(allModules as any[])?.length || 0} {language === "en" ? "modules completed" : "módulos completados"}
                </div>
                <Progress 
                  value={isCompleted ? 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {language === "en" ? "Course Modules" : "Módulos del Curso"}
              </p>
            </div>

            {/* Module Navigation */}
            <div className="space-y-2 pb-6">
              {(allModules as any[])?.map((mod: any, index: number) => {
                const isCurrent = mod.id === moduleId;
                const isModuleFree = index < 3;
                const hasModuleAccess = isEnrolled || isModuleFree;
                
                return (
                  <div
                    key={mod.id}
                    className={`group rounded-lg border transition-all duration-200 ${
                      isCurrent 
                        ? 'bg-[#def6fa] border-[#b8e8ed] shadow-md ring-1 ring-[#b8e8ed]' 
                        : hasModuleAccess 
                          ? isModuleFree 
                            ? 'bg-white border-border cursor-pointer'
                            : 'bg-background border-border cursor-pointer hover:bg-[#CDEDF6]'
                          : 'bg-muted/30 border-border/50 cursor-pointer hover:bg-muted/40'
                    }`}
                    onClick={() => {
                      if (hasModuleAccess) {
                        setLocation(`/course/${courseId}/module/${mod.id}`);
                        setIsMobileSidebarOpen(false); // Close sidebar on mobile when navigating
                      } else {
                        // Show enrollment modal for locked modules
                        setShowEnrollConfirm(true);
                        setIsMobileSidebarOpen(false); // Close sidebar on mobile
                      }
                    }}
                  >
                    <div className="p-4 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-foreground">
                                {mod.title}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{mod.duration} min</span>
                              </div>
                              <div className="flex items-center">
                                <Award className="w-3 h-3 mr-1" />
                                <span>+{Math.floor(parseFloat(mod.tokenReward || '1'))} token</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isModuleFree && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 absolute bottom-2 right-2">
                          {language === "en" ? "Free" : "Gratis"}
                        </Badge>
                      )}
                      {!hasModuleAccess && (
                        <Lock className="w-4 h-4 text-orange-500 absolute bottom-2 right-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="px-4 py-8 lg:px-8">
            <div className="max-w-4xl mx-auto lg:mt-0 mt-16">
          {/* Module Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="module-title">
              {module.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {module.duration} {language === "en" ? "minutes" : "minutos"}
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {Math.floor(parseFloat(module.tokenReward))} {
                  Math.floor(parseFloat(module.tokenReward)) === 1 
                    ? (language === "en" ? "token" : "token") 
                    : (language === "en" ? "tokens" : "tokens")
                }
              </div>
              {isCompleted && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {language === "en" ? "Completed" : "Completado"}
                </div>
              )}
            </div>
          </div>


          {/* Module Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {language === "en" ? "Learning" : "Aprendizaje"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none" data-testid="module-content">
                {module.content && (module.content.sections || module.content.html) ? (
                  <div className="space-y-8">
                    {module.content.sections ? (
                      // Render sections format
                      module.content.sections.map((section: any, index: number) => (
                        <div key={index} className="border-l-4 border-primary/20 pl-6">
                          <h3 className="text-xl font-semibold mb-4 text-primary">
                            {section.title}
                          </h3>
                          <div className="text-muted-foreground leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render HTML format from WYSIWYG editor with YouTube video support
                      <div className="space-y-4">
                        {renderHTMLWithVideos(module.content.html || '')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {language === "en" ? "Welcome to " + module.title : "Bienvenido a " + module.title}
                    </h3>
                    <p className="mb-4">
                      {language === "en" 
                        ? "This is a sample module demonstrating the learning experience. In a real implementation, this would contain rich educational content including videos, text, exercises, and interactive elements."
                        : "Este es un módulo de muestra que demuestra la experiencia de aprendizaje. En una implementación real, esto contendría contenido educativo rico incluyendo videos, texto, ejercicios y elementos interactivos."
                      }
                    </p>
                    <p className="text-sm">
                      {language === "en" 
                        ? "Click 'Start' above to begin tracking your progress through this module."
                        : "Haz clic en 'Iniciar' arriba para comenzar a rastrear tu progreso en este módulo."
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercises Section */}
          {((module as any).exercises || module.exercise) && profileData && moduleId && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {language === "en" ? "Exercises" : "Ejercicios"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {((module as any).exercises || [module.exercise]).map((exercise: any, index: number) => {
                  const isActive = index === currentActiveExercise;
                  const totalExercises = ((module as any).exercises || [module.exercise]).length;
                  
                  
                  return (
                    <div
                      key={index}
                      data-exercise-index={index}
                      className={`transition-all duration-300 rounded-lg relative ${
                        isActive 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'opacity-60'
                      }`}
                    >
                      <ExerciseRenderer 
                        exercise={exercise}
                        exerciseNumber={index + 1}
                        userId={profileData.id}
                        moduleId={moduleId}
                        isActive={isActive}
                        onSubmit={(answers, isCorrect) => {
                          if (isCorrect) {
                            toast({
                              title: language === "en" ? "Exercise Completed!" : "¡Ejercicio Completado!",
                              description: language === "en" ? "Great job! All answers are correct." : "¡Buen trabajo! Todas las respuestas son correctas.",
                            });
                            
                            // Move to next exercise if available
                            if (index < totalExercises - 1) {
                              setTimeout(() => {
                                setCurrentActiveExercise(index + 1);
                                
                                // Scroll the next exercise into view
                                setTimeout(() => {
                                  const nextExerciseElement = document.querySelector(`[data-exercise-index="${index + 1}"]`);
                                  if (nextExerciseElement) {
                                    nextExerciseElement.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'center' 
                                    });
                                  }
                                }, 300); // Delay to ensure the exercise is highlighted first
                              }, 1000); // Small delay for visual feedback
                            }
                          }
                        }}
                        onCallRequest={(peerId) => {
                          // Handle call request for live call exercises
                          const exercise = ((module as any).exercises || [module.exercise])[index];
                          const duration = exercise.duration || 10; // Default 10 minutes
                          
                          sendCallRequest(peerId, exercise.id || `exercise-${index}`, duration);
                          
                          toast({
                            title: language === "en" ? "Call Request Sent!" : "¡Solicitud de Llamada Enviada!",
                            description: language === "en" ? "Waiting for your partner to accept..." : "Esperando que tu compañero acepte...",
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Peer Feedback Section */}
          {!isPeerView && profileData && moduleId && (
            <PeerFeedbackSection 
              moduleId={moduleId}
              userId={profileData.id}
              language={language}
            />
          )}

          {/* Module Community Section */}
          {!isPeerView && profileData && moduleId && (
            <ModuleCommunitySection 
              moduleId={moduleId}
              moduleTitle={module.title}
              userId={profileData.id}
              userProfile={profileData}
              language={language}
            />
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Review Modal */}
      <CourseReviewModal
        courseId={courseId!}
        userId={profileData?.id}
        courseName={(course as any)?.title}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        language={language}
      />

      {/* Enrollment Confirmation Modal */}
      <AlertDialog open={showEnrollConfirm} onOpenChange={setShowEnrollConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasInsufficientTokens 
                ? (language === "en" ? "Insufficient Balance" : "Saldo Insuficiente")
                : (language === "en" ? "Confirm Enrollment" : "Confirmar Inscripción")
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                {language === "en" 
                  ? `You're about to enroll in "${(course as any)?.title}" for ${parseFloat((course as any)?.price || "0").toLocaleString()} tokens.`
                  : `Estás a punto de inscribirte en "${(course as any)?.title}" por ${parseFloat((course as any)?.price || "0").toLocaleString()} tokens.`
                }
              </div>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{language === "en" ? "Current balance:" : "Saldo actual:"}</span>
                    {hasInsufficientTokens && (
                      <Badge variant="destructive" className="text-xs">
                        {language === "en" ? "Insufficient Balance" : "Saldo Insuficiente"}
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold">
                    {(profileData as any)?.tokenBalance ? Math.floor(parseFloat((profileData as any).tokenBalance)).toLocaleString() : "0"} tokens
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{language === "en" ? "Course price:" : "Precio del curso:"}</span>
                  <span className="font-semibold text-orange-600">
                    -{parseFloat((course as any)?.price || "0").toLocaleString()} tokens
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>{language === "en" ? "Balance after enrollment:" : "Saldo después de la inscripción:"}</span>
                  <span className="text-green-600">
                    {((parseFloat((profileData as any)?.tokenBalance || "0")) - (parseFloat((course as any)?.price || "0"))).toLocaleString()} tokens
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "en" 
                  ? "After enrollment, you'll have lifetime access to all course modules and earn tokens for completing them."
                  : "Después de la inscripción, tendrás acceso de por vida a todos los módulos del curso y ganarás tokens por completarlos."
                }
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "en" ? "Cancel" : "Cancelar"}
            </AlertDialogCancel>
            {hasInsufficientTokens ? (
              <AlertDialogAction 
                onClick={() => {
                  setShowEnrollConfirm(false);
                  window.location.href = "/pricing";
                }}
                data-testid="button-upgrade-tokens"
              >
                {language === "en" ? "Upgrade for Tokens" : "Actualizar por Tokens"}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction 
                onClick={confirmEnrollment}
                disabled={enrollmentMutation.isPending}
              >
                {enrollmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Processing..." : "Procesando..."}
                  </>
                ) : (
                  language === "en" ? "Confirm Enrollment" : "Confirmar Inscripción"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Peer Evaluation Modal */}
      {showPeerEvaluationModal && evaluationTarget && (
        <PeerEvaluationModal
          isOpen={showPeerEvaluationModal}
          onClose={() => {
            setShowPeerEvaluationModal(false);
            setEvaluationTarget(null);
          }}
          onSubmit={(evaluation) => {
            peerEvaluationMutation.mutate({
              sessionId: evaluationTarget.sessionId,
              evaluatorId: profileData?.id || "user-1",
              evaluatedUserId: evaluationTarget.userId,
              moduleId: moduleId!,
              exerciseIndex: currentActiveExercise,
              ...evaluation
            });
          }}
          evaluatedUserName={evaluationTarget.userName}
          language={language}
          isPending={peerEvaluationMutation.isPending}
        />
      )}
    </div>
  );
}