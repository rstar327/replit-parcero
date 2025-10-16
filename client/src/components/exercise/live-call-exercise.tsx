import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Clock, Users, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LiveCallExercise {
  type: "live_call";
  title: string;
  description: string;
  duration: number;
  instructions?: string;
  topics?: string[];
}

interface OnlineUser {
  id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  role: string;
  isOnline: boolean;
}

interface LiveCallExerciseProps {
  exercise: LiveCallExercise;
  exerciseNumber?: number;
  userId?: string;
  moduleId?: string;
  isActive?: boolean;
  onCallRequest?: (peerId: string) => void;
}

export const LiveCallExerciseDisplay: React.FC<LiveCallExerciseProps> = ({ 
  exercise, 
  exerciseNumber = 1, 
  userId, 
  moduleId, 
  isActive = false,
  onCallRequest 
}) => {
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);

  // Fetch online users
  const { data: onlineUsers = [], isLoading } = useQuery<OnlineUser[]>({
    queryKey: ['online-users'],
    queryFn: async () => {
      const response = await fetch('/api/online-users');
      if (!response.ok) throw new Error('Failed to fetch online users');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: isActive
  });

  // Filter out current user from online users
  const availablePeers = onlineUsers.filter(user => user.id !== userId);

  const handlePeerSelect = (peerId: string) => {
    setSelectedPeer(peerId);
  };

  const handleStartCall = () => {
    if (selectedPeer && onCallRequest) {
      onCallRequest(selectedPeer);
    }
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  if (!isActive) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="font-semibold tracking-tight flex items-center gap-2 text-[18px]">
            <Phone className="h-5 w-5" />
            Exercise {exerciseNumber}: {exercise.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{exercise.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {exercise.duration} minutes
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Live peer practice
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ring-2 ring-primary ring-offset-2 ring-offset-background">
      <CardHeader>
        <CardTitle className="font-semibold tracking-tight flex items-center gap-2 text-[18px]">
          <Phone className="h-5 w-5 text-primary" />
          Exercise {exerciseNumber}: {exercise.title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {exercise.duration} minutes
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-4 w-4 text-green-500" />
            Live conversation
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-muted-foreground mb-4">{exercise.description}</p>
          
          {exercise.instructions && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <p className="text-sm">{exercise.instructions}</p>
            </div>
          )}

          {exercise.topics && exercise.topics.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Discussion Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-[15px]">
            <Users className="h-4 w-4" />
            Available Practice Partners
            {!isLoading && (
              <Badge variant="outline" className="ml-auto">
                {availablePeers.length} online
              </Badge>
            )}
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              Finding available partners...
            </div>
          ) : availablePeers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="relative inline-block mb-2">
                <Users className="h-8 w-8 animate-pulse" />
                <div className="absolute -inset-[10px] rounded-full border-2 border-primary/30 animate-ping" />
              </div>
              <p>Looking for practice partners...</p>
              <p className="text-sm mt-1">We're searching for available peers to practice with!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {availablePeers.map((user) => (
                <Card 
                  key={user.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPeer === user.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handlePeerSelect(user.id)}
                  data-testid={`peer-${user.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>
                            {getInitials(user.fullName, user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedPeer && (
            <div className="text-center">
              <Button 
                onClick={handleStartCall}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                data-testid="start-call-button"
              >
                <Phone className="h-4 w-4 mr-2" />
                Start {exercise.duration}-minute Practice Call
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Your partner will receive a call request notification
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};