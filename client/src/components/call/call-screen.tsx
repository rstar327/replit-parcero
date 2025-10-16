import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock,
  User,
  Users,
  CheckCircle
} from "lucide-react";
import { MicrophoneSetup } from "./microphone-setup";

interface CallScreenProps {
  callData: {
    sessionId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    exerciseTitle?: string;
    duration: number; // in minutes
    topics?: string[];
  };
  onEndCall: () => void;
  language?: string;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  callData,
  onEndCall,
  language = "en"
}) => {
  const [callStage, setCallStage] = useState<'setup' | 'connecting' | 'connected' | 'ending'>('setup');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [partnerAudioLevel, setPartnerAudioLevel] = useState(0);

  // Timer for call duration
  useEffect(() => {
    if (callStage === 'connected') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStage]);

  // Auto-end call after duration
  useEffect(() => {
    if (callStage === 'connected' && timeElapsed >= callData.duration * 60) {
      handleEndCall();
    }
  }, [timeElapsed, callData.duration, callStage]);

  // Simulate partner audio levels (in real implementation, this would come from WebRTC)
  useEffect(() => {
    if (callStage === 'connected') {
      const interval = setInterval(() => {
        setPartnerAudioLevel(Math.random() * 100);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [callStage]);

  const handleMicrophoneGranted = (stream: MediaStream) => {
    setAudioStream(stream);
    setCallStage('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setCallStage('connected');
    }, 2000);
  };

  const handleMicrophoneDenied = () => {
    // Handle microphone access denial
    alert(language === "en" 
      ? "Microphone access is required for calls" 
      : "Se requiere acceso al micrófono para las llamadas"
    );
  };

  const handleMicrophoneError = (error: string) => {
    alert(error);
  };

  const toggleMute = () => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
    setCallStage('ending');
    
    // Clean up audio stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    
    setTimeout(() => {
      onEndCall();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRemainingTime = () => {
    const totalSeconds = callData.duration * 60;
    const remaining = Math.max(0, totalSeconds - timeElapsed);
    return remaining;
  };

  const getProgressPercentage = () => {
    const totalSeconds = callData.duration * 60;
    return Math.min(100, (timeElapsed / totalSeconds) * 100);
  };

  if (callStage === 'setup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {language === "en" ? "Starting Call with" : "Iniciando Llamada con"}
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={callData.partnerAvatar || undefined} />
                <AvatarFallback>
                  {getInitials(callData.partnerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{callData.partnerName}</p>
                <p className="text-sm text-muted-foreground">
                  {callData.duration} {language === "en" ? "minutes" : "minutos"}
                </p>
              </div>
            </div>
          </div>
          
          <MicrophoneSetup
            onPermissionGranted={handleMicrophoneGranted}
            onPermissionDenied={handleMicrophoneDenied}
            onError={handleMicrophoneError}
            language={language}
          />
        </div>
      </div>
    );
  }

  if (callStage === 'connecting') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center z-50">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={callData.partnerAvatar || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {getInitials(callData.partnerName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {language === "en" ? "Connecting..." : "Conectando..."}
            </h3>
            <p className="text-white/70 mb-6">
              {language === "en" ? "Setting up your call with" : "Configurando tu llamada con"} {callData.partnerName}
            </p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 border-red-600 text-white"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (callStage === 'connected') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 to-blue-900 flex flex-col z-50">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm p-4 text-white">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={callData.partnerAvatar || undefined} />
                <AvatarFallback className="bg-white/20 text-white">
                  {getInitials(callData.partnerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{callData.partnerName}</p>
                <p className="text-sm text-white/70">
                  {callData.exerciseTitle || (language === "en" ? "Practice Session" : "Sesión de Práctica")}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-mono font-bold">
                {formatTime(timeElapsed)}
              </div>
              <div className="text-xs text-white/70">
                {formatTime(getRemainingTime())} {language === "en" ? "remaining" : "restante"}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="max-w-4xl mx-auto mt-3">
            <Progress value={getProgressPercentage()} className="h-1" />
          </div>
        </div>

        {/* Main Call Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Partner Video/Audio Area */}
            <Card className="bg-black/30 backdrop-blur-md border-white/20 text-white aspect-video flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={callData.partnerAvatar || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {getInitials(callData.partnerName)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-semibold">{callData.partnerName}</p>
                {/* Audio Level Indicator */}
                <div className="w-20 h-2 bg-white/20 rounded-full mx-auto mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all duration-100"
                    style={{ width: `${partnerAudioLevel}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Your Video/Audio Area */}
            <Card className="bg-black/30 backdrop-blur-md border-white/20 text-white aspect-video flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-semibold">
                  {language === "en" ? "You" : "Tú"}
                </p>
                {/* Audio Level Indicator */}
                <div className="w-20 h-2 bg-white/20 rounded-full mx-auto mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                {isMuted && (
                  <Badge variant="secondary" className="mt-2 bg-red-500 text-white">
                    <MicOff className="h-3 w-3 mr-1" />
                    {language === "en" ? "Muted" : "Silenciado"}
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Exercise Topics */}
        {callData.topics && callData.topics.length > 0 && (
          <div className="bg-black/20 backdrop-blur-sm p-4 text-white">
            <div className="max-w-4xl mx-auto">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {language === "en" ? "Discussion Topics:" : "Temas de Conversación:"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {callData.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-black/20 backdrop-blur-sm p-6 text-white">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={toggleMute}
              className={`rounded-full w-14 h-14 ${
                isMuted ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'bg-white/20 hover:bg-white/30 border-white/30'
              }`}
              data-testid="mute-button"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={toggleSpeaker}
              className={`rounded-full w-14 h-14 bg-white/20 hover:bg-white/30 border-white/30`}
              data-testid="speaker-button"
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 border-red-600"
              data-testid="end-call-button"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (callStage === 'ending') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "en" ? "Call Completed!" : "¡Llamada Completada!"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "en" 
                ? `Great practice session with ${callData.partnerName}!`
                : `¡Excelente sesión de práctica con ${callData.partnerName}!`
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Duration:" : "Duración:"} {formatTime(timeElapsed)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};