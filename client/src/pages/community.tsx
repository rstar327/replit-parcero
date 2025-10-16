import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  User,
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Search,
  Star,
  HelpCircle,
  BookOpen,
  Send,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Show/hide autocomplete
  useEffect(() => {
    setShowAutocomplete(searchTerm.trim().length >= 2);
  }, [searchTerm]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/community/search", debouncedSearchTerm],
    queryFn: () => fetch(`/api/community/search?q=${encodeURIComponent(debouncedSearchTerm)}`).then(res => res.json()),
    enabled: debouncedSearchTerm.trim().length >= 2,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Get current user profile for avatars - only when connected
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"], // TODO: Replace with actual user ID when auth is implemented
    enabled: false, // Disable for now since this page should work without login
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string; type: string; authorId?: string; parentId?: string }) => {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setStatusUpdate("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed from the community."
      });
      setShowDeleteDialog(false);
      setPostToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete post",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Helper function to extract the first sentence as title
  const extractTitleFromContent = (content: string): string => {
    const trimmedContent = content.trim();
    
    // Find the first sentence ending with punctuation
    const sentenceEnd = trimmedContent.search(/[.!?]+(\s|$)/);
    
    if (sentenceEnd !== -1) {
      // Extract first sentence
      const firstSentence = trimmedContent.substring(0, sentenceEnd + 1).trim();
      // Limit to 80 characters if too long
      return firstSentence.length > 80 ? firstSentence.substring(0, 77) + "..." : firstSentence;
    }
    
    // If no sentence ending found, truncate at 50 characters
    return trimmedContent.length > 50 ? trimmedContent.substring(0, 50) + "..." : trimmedContent;
  };

  const handlePost = () => {
    if (!statusUpdate.trim()) return;
    
    // Minimum character limit for posts
    if (statusUpdate.trim().length < 30) {
      toast({
        title: "Post too short",
        description: "Posts must be at least 30 characters long to encourage meaningful discussions.",
        variant: "destructive"
      });
      return;
    }
    
    createPostMutation.mutate({
      title: extractTitleFromContent(statusUpdate),
      content: statusUpdate,
      type: "discussion",
      authorId: undefined // TODO: Replace with actual user ID when auth is implemented
    });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    createPostMutation.mutate({
      title: extractTitleFromContent(replyContent),
      content: replyContent,
      type: "discussion",
      authorId: undefined,
      parentId: parentId
    });
    
    setReplyContent("");
    setReplyingTo(null);
  };

  // Group posts and replies
  const organizePostsWithReplies = (posts: any[]) => {
    if (!posts) return [];
    
    const topLevelPosts = posts.filter(post => !post.parentId);
    const replies = posts.filter(post => post.parentId);
    
    return topLevelPosts.map(post => ({
      ...post,
      replies: replies.filter(reply => reply.parentId === post.id).map(reply => ({
        ...reply,
        replies: replies.filter(subReply => subReply.parentId === reply.id)
      }))
    }));
  };

  // Use search results if searching, otherwise show all posts
  const displayPosts = searchTerm.trim().length >= 2 ? searchResults : (posts || []);
  const organizedPosts = organizePostsWithReplies(Array.isArray(displayPosts) ? displayPosts : []);

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  // Check if current user can delete a post (for now, assume all posts can be deleted since we don't have auth)
  const canDeletePost = (post: any) => {
    // TODO: Replace with actual user ID comparison when auth is implemented
    // return post.authorId === currentUserId
    return true; // For now, allow deleting any post since we don't have proper auth
  };

  const communityStats = [
    { 
      label: "Active Members", 
      value: (dashboardStats as any)?.activeLearners?.toString() || "0", 
      icon: Users, 
      color: "text-primary" 
    },
    { 
      label: "Total Posts", 
      value: Array.isArray(posts) ? posts.length.toString() : "0", 
      icon: MessageSquare, 
      color: "text-accent" 
    },
    { 
      label: "Questions Answered", 
      value: "0", 
      icon: HelpCircle, 
      color: "text-primary" 
    },
    { 
      label: "Study Groups", 
      value: "0", 
      icon: Users, 
      color: "text-muted-foreground" 
    }
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "question":
        return <HelpCircle className="h-4 w-4" />;
      case "study-group":
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeBadge = (post: any) => {
    if (post.type === "question" && post.hasAcceptedAnswer) {
      return <Badge variant="default" className="bg-primary">Answered</Badge>;
    }
    if (post.type === "study-group") {
      return <Badge variant="secondary">{post.memberCount} members</Badge>;
    }
    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Community" 
          subtitle="Connect, learn, and grow together with fellow learners"
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {communityStats.map((stat) => {
              return (
                <Card key={stat.label} data-testid={`community-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Status Update */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar className="w-10 h-10">
                  {profileData?.avatar && (
                    <AvatarImage 
                      src={`/objects/${profileData.avatar.replace('/objects/', '')}`} 
                      alt="Profile" 
                    />
                  )}
                  <AvatarFallback className="bg-gray-100 text-gray-400">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's on your mind? Share your thoughts with the community..."
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="min-h-20 resize-none border border-input shadow-none p-0 text-base focus-visible:ring-0 pl-[9px] pr-[9px] pt-[9px] pb-[9px] bg-white"
                    data-testid="textarea-status-update"
                    id="status-textarea"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {statusUpdate.trim().length > 0 && statusUpdate.trim().length < 30 
                        ? `${30 - statusUpdate.trim().length} more characters needed`
                        : "Share your learning journey, ask questions, or help others"
                      }
                    </div>
                    <Button 
                      disabled={!statusUpdate.trim() || statusUpdate.trim().length < 30 || createPostMutation.isPending} 
                      onClick={handlePost}
                      data-testid="button-post-status"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowAutocomplete(searchTerm.trim().length >= 2)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                className="pl-10 bg-white"
                data-testid="input-search-community"
              />
              
              {/* Autocomplete dropdown */}
              {showAutocomplete && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result: any) => (
                    <div
                      key={result.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSearchTerm(result.title);
                        setShowAutocomplete(false);
                      }}
                      data-testid={`autocomplete-result-${result.id}`}
                    >
                      <div className="font-medium text-sm line-clamp-1">{result.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.content}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        by {result.authorName || 'Anonymous'} • {formatTimestamp(result.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show message when no results found */}
              {showAutocomplete && debouncedSearchTerm.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 p-3">
                  <div className="text-sm text-muted-foreground text-center">No discussions found for "{debouncedSearchTerm}"</div>
                </div>
              )}
            </div>
          </div>


          {/* Posts */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-16 bg-muted rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : organizedPosts && organizedPosts.length > 0 ? (
              organizedPosts.map((post: any) => (
                <Card key={post.id} data-testid={`post-${post.id}`}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Avatar className="w-10 h-10" data-testid={`post-avatar-${post.id}`}>
                        {profileData?.avatar && (
                          <AvatarImage 
                            src={`/objects/${profileData.avatar.replace('/objects/', '')}`} 
                            alt="Profile" 
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4" />
                              <h3 className="font-semibold text-foreground" data-testid={`post-title-${post.id}`}>
                                {post.title}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span data-testid={`post-author-${post.id}`}>{post.authorName || 'Anonymous'}</span>
                              <span>•</span>
                              <span data-testid={`post-time-${post.id}`}>{formatTimestamp(post.createdAt)}</span>
                            </div>
                            {post.courseId && (
                              <Badge variant="secondary" className="text-xs" data-testid={`post-course-${post.id}`}>
                                Course Discussion
                              </Badge>
                            )}
                          </div>
                          
                          {/* Post Options Menu */}
                          {canDeletePost(post) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#e1eff2] hover:text-current transition-colors" data-testid={`post-options-${post.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-destructive focus:text-destructive hover:bg-[#e1eff2] hover:text-destructive focus:bg-[#e1eff2] transition-colors"
                                  data-testid={`delete-post-${post.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Post
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        <p className="text-foreground" data-testid={`post-content-${post.id}`}>
                          {post.content}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="hover:bg-[#e1eff2] hover:text-current transition-colors" data-testid={`button-upvote-${post.id}`}>
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              0
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-[#e1eff2] hover:text-current transition-colors" data-testid={`button-downvote-${post.id}`}>
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              0
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-[#e1eff2] hover:text-current transition-colors"
                              onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                              data-testid={`button-reply-${post.id}`}
                            >
                              <Reply className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span data-testid={`post-replies-${post.id}`}>{post.replies?.length || 0} replies</span>
                          </div>
                        </div>
                        
                        {/* Reply Form */}
                        {replyingTo === post.id && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex space-x-3">
                              <Avatar className="w-8 h-8">
                                {profileData?.avatar && (
                                  <AvatarImage 
                                    src={`/objects/${profileData.avatar.replace('/objects/', '')}`} 
                                    alt="Profile" 
                                  />
                                )}
                                <AvatarFallback className="bg-gray-100 text-gray-400">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  placeholder="Write a reply..."
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="min-h-16 resize-none text-sm bg-white"
                                  data-testid={`textarea-reply-${post.id}`}
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <div className="text-xs text-muted-foreground">
                                    No minimum length for replies
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="hover:bg-[#e1eff2] hover:text-current transition-colors"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent("");
                                      }}
                                      data-testid={`button-cancel-reply-${post.id}`}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      size="sm"
                                      disabled={!replyContent.trim() || createPostMutation.isPending}
                                      onClick={() => handleReply(post.id)}
                                      data-testid={`button-submit-reply-${post.id}`}
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Replies */}
                        {post.replies && post.replies.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {post.replies.map((reply: any) => (
                              <div key={reply.id} className="ml-6 border-l-2 border-muted pl-4">
                                <div className="flex space-x-3">
                                  <Avatar className="w-8 h-8" data-testid={`reply-avatar-${reply.id}`}>
                                    <AvatarFallback>{reply.authorName ? reply.authorName.charAt(0) : 'U'}</AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <span data-testid={`reply-author-${reply.id}`}>{reply.authorName || 'Anonymous'}</span>
                                      <span>•</span>
                                      <span data-testid={`reply-time-${reply.id}`}>{formatTimestamp(reply.createdAt)}</span>
                                    </div>
                                    
                                    <p className="text-foreground text-sm" data-testid={`reply-content-${reply.id}`}>
                                      {reply.content}
                                    </p>
                                    
                                    <div className="flex items-center space-x-4 pt-2">
                                      <Button variant="ghost" size="sm" className="hover:bg-[#e1eff2] hover:text-current transition-colors" data-testid={`button-upvote-reply-${reply.id}`}>
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        0
                                      </Button>
                                      <Button variant="ghost" size="sm" className="hover:bg-[#e1eff2] hover:text-current transition-colors" data-testid={`button-downvote-reply-${reply.id}`}>
                                        <ThumbsDown className="h-3 w-3 mr-1" />
                                        0
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hover:bg-[#e1eff2] hover:text-current transition-colors"
                                        onClick={() => setReplyingTo(replyingTo === `${reply.id}-sub` ? null : `${reply.id}-sub`)}
                                        data-testid={`button-reply-to-reply-${reply.id}`}
                                      >
                                        <Reply className="h-3 w-3 mr-1" />
                                        Reply
                                      </Button>
                                    </div>
                                    
                                    {/* Sub-reply Form */}
                                    {replyingTo === `${reply.id}-sub` && (
                                      <div className="mt-3 pt-3 border-t">
                                        <div className="flex space-x-2">
                                          <Avatar className="w-6 h-6">
                                            {profileData?.avatar && (
                                              <AvatarImage 
                                                src={`/objects/${profileData.avatar.replace('/objects/', '')}`} 
                                                alt="Profile" 
                                              />
                                            )}
                                            <AvatarFallback className="bg-gray-100 text-gray-400 text-xs">
                                              <User className="h-2 w-2" />
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <Textarea
                                              placeholder="Write a reply..."
                                              value={replyContent}
                                              onChange={(e) => setReplyContent(e.target.value)}
                                              className="min-h-14 resize-none text-sm bg-white"
                                              data-testid={`textarea-sub-reply-${reply.id}`}
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                              <div className="text-xs text-muted-foreground">
                                                No minimum length for replies
                                              </div>
                                              <div className="flex space-x-2">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent("");
                                                  }}
                                                  data-testid={`button-cancel-sub-reply-${reply.id}`}
                                                >
                                                  Cancel
                                                </Button>
                                                <Button 
                                                  size="sm"
                                                  disabled={!replyContent.trim() || createPostMutation.isPending}
                                                  onClick={() => handleReply(reply.id)}
                                                  data-testid={`button-submit-sub-reply-${reply.id}`}
                                                >
                                                  Reply
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Sub-replies (Level 2) */}
                                    {reply.replies && reply.replies.length > 0 && (
                                      <div className="mt-3 ml-4 space-y-3">
                                        {reply.replies.map((subReply: any) => (
                                          <div key={subReply.id} className="border-l border-muted pl-3">
                                            <div className="flex space-x-2">
                                              <Avatar className="w-6 h-6" data-testid={`sub-reply-avatar-${subReply.id}`}>
                                                <AvatarFallback className="text-xs">{subReply.authorName ? subReply.authorName.charAt(0) : 'U'}</AvatarFallback>
                                              </Avatar>
                                              
                                              <div className="flex-1 space-y-1">
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                  <span data-testid={`sub-reply-author-${subReply.id}`}>{subReply.authorName || 'Anonymous'}</span>
                                                  <span>•</span>
                                                  <span data-testid={`sub-reply-time-${subReply.id}`}>{formatTimestamp(subReply.createdAt)}</span>
                                                </div>
                                                
                                                <p className="text-foreground text-sm" data-testid={`sub-reply-content-${subReply.id}`}>
                                                  {subReply.content}
                                                </p>
                                                
                                                <div className="flex items-center space-x-3 pt-1">
                                                  <Button variant="ghost" size="sm" className="h-6 px-2" data-testid={`button-upvote-sub-reply-${subReply.id}`}>
                                                    <ThumbsUp className="h-2 w-2 mr-1" />
                                                    0
                                                  </Button>
                                                  <Button variant="ghost" size="sm" className="h-6 px-2" data-testid={`button-downvote-sub-reply-${subReply.id}`}>
                                                    <ThumbsDown className="h-2 w-2 mr-1" />
                                                    0
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
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
              <div className="text-center py-12" data-testid="no-posts-message">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No community posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion! Share your thoughts, ask questions, or help others learn.
                </p>
                <Button 
                  className="text-[#000000] bg-[#EF7B45] hover:bg-primary/90"
                  onClick={() => document.getElementById('status-textarea')?.focus()}
                  data-testid="button-create-first-post"
                >
                  Create First Post
                </Button>
              </div>
            )}
          </div>

        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-post-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-post">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePostMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-post"
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
