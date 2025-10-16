import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useWeb3 } from "@/hooks/use-web3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UserPlus, 
  MessageCircle, 
  Trophy,
  Coins,
  Send,
  Calendar,
  MapPin,
  Users,
  Search,
  Globe,
  Bell,
  Wallet,
  Loader2
} from "lucide-react";

export default function PublicProfile() {
  const [, params] = useRoute("/profile/:userId");
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, connectWallet, disconnectWallet, tokenInfo, isLoading: web3Loading } = useWeb3();

  const userId = params?.userId;

  // State to track if user is logged out
  const [isLoggedOut, setIsLoggedOut] = useState(() => {
    return localStorage.getItem('userLoggedOut') === 'true';
  });

  // Fetch user profile for avatar - only when connected and not logged out
  const { data: profileData } = useQuery({
    queryKey: ["/api/profile/user-1"],
    enabled: isConnected && !isLoggedOut,
  });

  // Fetch user profile
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/users", userId],
    enabled: !!userId
  });

  const user = Array.isArray(userData) ? userData[0] : userData;

  // Fetch user posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", userId],
    enabled: !!userId
  });

  // Fetch friendship status - for demo, using mock current user
  const currentUserId = "user-1"; // In real app, get from auth context
  const { data: friendshipStatus } = useQuery({
    queryKey: ["/api/friends/status", currentUserId, userId],
    enabled: !!userId && userId !== currentUserId
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/friends/request", { 
        requesterId: currentUserId, 
        addresseeId: userId 
      });
    },
    onSuccess: () => {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", currentUserId, userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      return await apiRequest("POST", `/api/posts/${data.postId}/comments`, {
        authorId: currentUserId,
        content: data.content
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleSendFriendRequest = () => {
    sendFriendRequestMutation.mutate();
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ postId, content: newComment });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa]">
        {/* Public Navigation Header */}
        <header className="border-b sticky top-0 z-50 bg-[#fff]">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <img 
                  src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
                  alt="Parcero.eco" 
                  className="rounded object-contain cursor-pointer"
                  style={{ height: '42px', width: 'auto' }}
                />
              </Link>
              
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 h-9 bg-white dark:bg-background"
                    data-testid="input-search-courses"
                  />
                </div>
                <Link href="/public-courses">
                  <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-courses">Courses</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-pricing">Pricing</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg" data-testid="header-balance">
                <span className="text-sm font-bold text-primary">
                  {tokenInfo?.balance ? Math.floor(parseFloat(tokenInfo.balance)).toLocaleString() : "0"}
                </span>
                <span className="text-xs text-muted-foreground">PARCERO</span>
              </div>
              

              
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#CDEDF6]" data-testid="button-notifications">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-[#CDEDF6]" data-testid="button-language-switcher">
                    <Globe className="w-4 h-4 mr-2" />
                    {language === "en" ? "EN" : "ES"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="language-english">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="language-spanish">
                    Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto max-w-4xl p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-64 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!userLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa]">
        {/* Public Navigation Header */}
        <header className="border-b sticky top-0 z-50 bg-[#fff]">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <img 
                  src="/src/assets/parcero-logo-rectangle_1756574770152.png" 
                  alt="Parcero.eco" 
                  className="rounded object-contain cursor-pointer"
                  style={{ height: '42px', width: 'auto' }}
                />
              </Link>
              
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 h-9 bg-white dark:bg-background"
                    data-testid="input-search-courses"
                  />
                </div>
                <Link href="/public-courses">
                  <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-courses">Courses</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-pricing">Pricing</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg" data-testid="header-balance">
                <span className="text-sm font-bold text-primary">
                  {tokenInfo?.balance ? Math.floor(parseFloat(tokenInfo.balance)).toLocaleString() : "0"}
                </span>
                <span className="text-xs text-muted-foreground">PARCERO</span>
              </div>
              

              
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#CDEDF6]" data-testid="button-notifications">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-[#CDEDF6]" data-testid="button-language-switcher">
                    <Globe className="w-4 h-4 mr-2" />
                    {language === "en" ? "EN" : "ES"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="language-english">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="language-spanish">
                    Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto max-w-4xl p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">User Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdff] to-[#e0f7fa]">
      {/* Public Navigation Header */}
      <header className="border-b sticky top-0 z-50 bg-[#fff]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <img 
                src="/src/assets/parcero-logo-rectangle_1756569731589.png" 
                alt="Parcero.eco" 
                className="rounded object-contain cursor-pointer"
                style={{ height: '42px', width: 'auto' }}
              />
            </Link>
            
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-9 bg-white dark:bg-background"
                  data-testid="input-search-courses"
                />
              </div>
              <Link href="/public-courses">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-courses">Courses</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="hover:bg-[#CDEDF6] ml-3" data-testid="nav-pricing">Pricing</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center bg-primary/10 px-3 py-1 rounded-lg" data-testid="header-balance">
              <span className="text-sm font-bold text-primary">
                {tokenInfo?.balance ? Math.floor(parseFloat(tokenInfo.balance)).toLocaleString() : "0"}
              </span>
              <span className="text-xs text-muted-foreground">PARCERO</span>
            </div>
            
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={disconnectWallet} data-testid="button-header-disconnect-wallet">
                Disconnect Wallet
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={connectWallet} disabled={web3Loading} className="hover:bg-muted/50 hover:text-foreground" data-testid="button-header-connect-wallet">
                {web3Loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                Connect Wallet
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#CDEDF6]" data-testid="button-notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-[#CDEDF6]" data-testid="button-language-switcher">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "EN" : "ES"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="language-english">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="language-spanish">
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        
        

        {/* User Profile Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar || undefined} alt={user.fullName || user.username} />
                  <AvatarFallback className="text-2xl">
                    {(user.fullName || user.username)?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="user-name">
                    {user.fullName || user.username}
                  </h1>
                </div>

                {user.bio && (
                  <p className="text-muted-foreground" data-testid="user-bio">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.country && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.country}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 mr-1 text-primary" />
                    {Math.floor(parseFloat(user.tokenBalance || "0")).toLocaleString()} PARCERO
                  </div>
                </div>

                {user.role && user.role !== 'student' && (
                  <Badge variant="secondary">
                    {user.role === 'instructor' ? 'Instructor' : user.role}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {friendshipStatus?.status === 'none' && (
                  <Button 
                    onClick={handleSendFriendRequest}
                    disabled={sendFriendRequestMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="add-friend-button"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {sendFriendRequestMutation.isPending ? "Sending..." : "Add Friend"}
                  </Button>
                )}
                
                {friendshipStatus?.status === 'pending' && (
                  <Button disabled variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Request Sent
                  </Button>
                )}
                
                {friendshipStatus?.status === 'accepted' && (
                  <Badge variant="default" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Friends
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post: any) => (
                  <div key={post.id} className="border-b pb-6 last:border-b-0">
                    
                    {/* Post Content */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar || undefined} alt={user.fullName || user.username} />
                          <AvatarFallback className="text-xs">
                            {(user.fullName || user.username)?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-sm">
                              {user.fullName || user.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                            {post.type === 'achievement' && (
                              <Badge variant="secondary" className="text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                Achievement
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{post.content}</p>
                        </div>
                      </div>

                      {/* Post Metadata */}
                      {post.metadata && (
                        <div className="ml-11 p-3 bg-muted/50 rounded-lg">
                          {post.type === 'course_completion' && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Trophy className="w-4 h-4 mr-2 text-primary" />
                              Completed: {post.metadata.courseTitle}
                              {post.metadata.tokensEarned && (
                                <span className="ml-4 flex items-center">
                                  <Coins className="w-4 h-4 mr-1 text-primary" />
                                  +{post.metadata.tokensEarned} PARCERO
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="ml-11 space-y-3">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="flex items-start space-x-2 text-sm">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.fullName || comment.author.username} />
                                <AvatarFallback className="text-xs">
                                  {(comment.author.fullName || comment.author.username)?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {comment.author.fullName || comment.author.username}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="ml-11 flex items-center space-x-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 h-8 resize-none text-sm"
                          data-testid="comment-input"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          data-testid="send-comment-button"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}