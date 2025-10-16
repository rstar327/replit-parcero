import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, Settings } from "lucide-react";

interface MicrophoneSetupProps {
  onPermissionGranted: (stream: MediaStream) => void;
  onPermissionDenied: () => void;
  onError: (error: string) => void;
  language?: string;
}

export const MicrophoneSetup: React.FC<MicrophoneSetupProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  onError,
  language = "en"
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'prompt' | 'granted' | 'denied' | 'error'>('checking');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermissions();
  }, []);

  // Monitor audio levels when stream is available
  useEffect(() => {
    if (audioStream && isTestingMic) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (isTestingMic) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();

      return () => {
        audioContext.close();
      };
    }
  }, [audioStream, isTestingMic]);

  const checkMicrophonePermissions = async () => {
    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permission.state === 'granted') {
          await requestMicrophoneAccess();
        } else if (permission.state === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
      } else {
        // Fallback: try to access microphone directly
        setPermissionStatus('prompt');
      }
    } catch (error) {
      console.error('Error checking microphone permissions:', error);
      setPermissionStatus('prompt');
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      setAudioStream(stream);
      setPermissionStatus('granted');
      onPermissionGranted(stream);
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        onPermissionDenied();
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionStatus('error');
        onError(language === "en" ? "No microphone found" : "No se encontró micrófono");
      } else {
        setPermissionStatus('error');
        onError(language === "en" ? "Failed to access microphone" : "Error al acceder al micrófono");
      }
    }
  };

  const testMicrophone = () => {
    setIsTestingMic(true);
    setTimeout(() => setIsTestingMic(false), 5000); // Test for 5 seconds
  };

  const openSystemSettings = () => {
    // Guide user to system settings
    if (language === "en") {
      alert("Please go to your browser settings and allow microphone access for this website.");
    } else {
      alert("Por favor ve a la configuración de tu navegador y permite el acceso al micrófono para este sitio web.");
    }
  };

  const renderPermissionStatus = () => {
    switch (permissionStatus) {
      case 'checking':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{language === "en" ? "Checking microphone permissions..." : "Verificando permisos del micrófono..."}</p>
          </div>
        );

      case 'prompt':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Mic className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "Microphone Access Required" : "Se Requiere Acceso al Micrófono"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "To start your practice call, we need access to your microphone."
                  : "Para iniciar tu llamada de práctica, necesitamos acceso a tu micrófono."
                }
              </p>
            </div>
            
            <Button onClick={requestMicrophoneAccess} className="w-full" data-testid="allow-microphone-button">
              <Mic className="h-4 w-4 mr-2" />
              {language === "en" ? "Allow Microphone Access" : "Permitir Acceso al Micrófono"}
            </Button>
          </div>
        );

      case 'granted':
        return (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {language === "en" ? "Microphone access granted!" : "¡Acceso al micrófono concedido!"}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "en" ? "Microphone Test" : "Prueba de Micrófono"}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testMicrophone}
                  disabled={isTestingMic}
                  data-testid="test-microphone-button"
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  {isTestingMic 
                    ? (language === "en" ? "Testing..." : "Probando...") 
                    : (language === "en" ? "Test" : "Probar")
                  }
                </Button>
              </div>

              {isTestingMic && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {language === "en" ? "Speak to test your microphone" : "Habla para probar tu micrófono"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'denied':
        return (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {language === "en" 
                  ? "Microphone access was denied. Please enable it to make calls."
                  : "Se denegó el acceso al micrófono. Por favor habilítalo para hacer llamadas."
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button onClick={requestMicrophoneAccess} className="w-full">
                <Mic className="h-4 w-4 mr-2" />
                {language === "en" ? "Try Again" : "Intentar de Nuevo"}
              </Button>
              
              <Button variant="outline" onClick={openSystemSettings} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                {language === "en" ? "Browser Settings" : "Configuración del Navegador"}
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {language === "en" 
                  ? "Unable to access microphone. Please check your device settings."
                  : "No se pudo acceder al micrófono. Por favor verifica la configuración de tu dispositivo."
                }
              </AlertDescription>
            </Alert>

            <Button onClick={requestMicrophoneAccess} className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              {language === "en" ? "Try Again" : "Intentar de Nuevo"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          {language === "en" ? "Audio Setup" : "Configuración de Audio"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderPermissionStatus()}
      </CardContent>
    </Card>
  );
};