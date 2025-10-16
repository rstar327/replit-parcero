import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type CommunityPost = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function CommunityActivity() {
  const { data: posts, isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
  });

  return (
    <Card data-testid="community-activity-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle data-testid="community-activity-title">Community Activity</CardTitle>
        <Link href="/community">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-community">
            View All
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex items-start space-x-3" data-testid={`activity-${post.id}`}>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {post.authorId.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground" data-testid={`activity-text-${post.id}`}>
                  <span className="font-medium">User</span> posted in community:
                  <span className="text-primary ml-1">{post.title}</span>
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-time-${post.id}`}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              No community activity yet
            </p>
            <p className="text-xs text-muted-foreground">
              Be the first to post in the community!
            </p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-border">
          <Link href="/community">
            <Button variant="outline" size="sm" className="w-full hover:bg-muted/50 hover:text-foreground" data-testid="button-join-discussion">
              {posts && posts.length > 0 ? 'Join Discussion' : 'Start Discussion'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
