import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Clock, User } from "lucide-react";

interface CallRequestNotificationProps {
  request: {
    requestId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    exerciseTitle?: string;
    duration: number;
  } | null;
  onAccept: () => void;
  onDecline: () => void;
  language?: string;
}

export const CallRequestNotification: React.FC<CallRequestNotificationProps> = ({
  request,
  onAccept,
  onDecline,
  language = "en"
}) => {
  if (!request) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 animate-in slide-in-from-right">
      <Card className="border-2 border-green-500 bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Phone className="h-5 w-5 animate-pulse" />
            {language === "en" ? "Incoming Call Request" : "Solicitud de Llamada Entrante"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.callerAvatar || undefined} />
              <AvatarFallback className="bg-green-100 text-green-700">
                {getInitials(request.callerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{request.callerName}</p>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "wants to practice with you" : "quiere practicar contigo"}
              </p>
            </div>
          </div>

          {request.exerciseTitle && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">
                {language === "en" ? "Exercise:" : "Ejercicio:"} {request.exerciseTitle}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {request.duration} {language === "en" ? "minutes" : "minutos"}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="accept-call-button"
            >
              <Phone className="h-4 w-4 mr-2" />
              {language === "en" ? "Accept" : "Aceptar"}
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              data-testid="decline-call-button"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              {language === "en" ? "Decline" : "Rechazar"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {language === "en" 
              ? "This request will expire automatically" 
              : "Esta solicitud expirará automáticamente"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};