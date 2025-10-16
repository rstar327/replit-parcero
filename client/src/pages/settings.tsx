import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export default function Settings() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  

  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    tokenRewards: true,
    communityPosts: false,
    systemUpdates: true,
    emailDigest: true,
    pushNotifications: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    progressVisible: true,
    tokensVisible: true,
    activityVisible: true
  });

  const [security, setSecurity] = useState({
    loginNotifications: true,
    sessionTimeout: "24h"
  });


  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: language === "en" ? "Notifications updated" : "Notificaciones actualizadas",
        description: language === "en" ? "Your notification preferences have been saved." : "Tus preferencias de notificación han sido guardadas.",
      });
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en" ? "Failed to update notifications. Please try again." : "Error al actualizar las notificaciones. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: language === "en" ? "Data export requested" : "Exportación de datos solicitada",
      description: language === "en" ? "Your data export will be ready for download within 24 hours." : "Tu exportación de datos estará lista para descargar en 24 horas.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: language === "en" ? "Account deletion" : "Eliminación de cuenta",
      description: language === "en" ? "Please contact support to delete your account." : "Por favor contacta a soporte para eliminar tu cuenta.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title={language === "en" ? "Settings" : "Configuración"} 
          subtitle={language === "en" ? "Manage your account preferences and security settings" : "Gestiona las preferencias de tu cuenta y configuración de seguridad"}
        />
        
        <div className="p-6 space-y-6 bg-[#ffffff]">
          {/* Row 1: Notification Preferences and Privacy Settings side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card data-testid="notification-settings-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="notification-settings-title">
                  <Bell className="h-5 w-5" />
                  <span>{language === "en" ? "Notification Preferences" : "Preferencias de Notificación"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between" data-testid={`notification-${key}`}>
                    <div className="space-y-0.5">
                      <Label className="font-medium">
                        {language === "en" 
                          ? key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                          : (
                            key === 'courseUpdates' ? 'Actualizaciones de Cursos' :
                            key === 'tokenRewards' ? 'Recompensas de Tokens' :
                            key === 'communityPosts' ? 'Publicaciones de la Comunidad' :
                            key === 'systemUpdates' ? 'Actualizaciones del Sistema' :
                            key === 'emailDigest' ? 'Resumen por Correo' :
                            key === 'pushNotifications' ? 'Notificaciones Push' :
                            key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                          )
                        }
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? (
                          key === 'courseUpdates' ? 'Get notified when courses you\'re enrolled in are updated' :
                          key === 'tokenRewards' ? 'Receive notifications when you earn PARCERO tokens' :
                          key === 'communityPosts' ? 'Notifications for new posts in followed discussions' :
                          key === 'systemUpdates' ? 'Important system announcements and maintenance updates' :
                          key === 'emailDigest' ? 'Weekly summary of your learning progress and activity' :
                          key === 'pushNotifications' ? 'Enable browser push notifications' : ''
                        ) : (
                          key === 'courseUpdates' ? 'Recibe notificaciones cuando se actualicen los cursos en los que estás inscrito' :
                          key === 'tokenRewards' ? 'Recibe notificaciones cuando ganes tokens PARCERO' :
                          key === 'communityPosts' ? 'Notificaciones de nuevas publicaciones en discusiones que sigues' :
                          key === 'systemUpdates' ? 'Anuncios importantes del sistema y actualizaciones de mantenimiento' :
                          key === 'emailDigest' ? 'Resumen semanal de tu progreso de aprendizaje y actividad' :
                          key === 'pushNotifications' ? 'Habilitar notificaciones push del navegador' : ''
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                      data-testid={`switch-${key}`}
                    />
                  </div>
                ))}

                <Separator />

                <Button onClick={handleSaveNotifications} disabled={isLoading} className="bg-[#CDEDF6] hover:bg-[#CDEDF6]/80 text-[#000000]" data-testid="button-save-notifications">
                  {language === "en" ? "Save Notification Settings" : "Guardar Configuración de Notificaciones"}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card data-testid="privacy-settings-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="privacy-settings-title">
                  <Shield className="h-5 w-5" />
                  <span>{language === "en" ? "Privacy Settings" : "Configuración de Privacidad"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between" data-testid={`privacy-${key}`}>
                    <div className="space-y-0.5">
                      <Label className="font-medium">
                        {language === "en"
                          ? key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                          : (
                            key === 'profileVisible' ? 'Perfil Visible' :
                            key === 'progressVisible' ? 'Progreso Visible' :
                            key === 'tokensVisible' ? 'Tokens Visibles' :
                            key === 'activityVisible' ? 'Actividad Visible' :
                            key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                          )
                        }
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? (
                          key === 'profileVisible' ? 'Make your profile visible to other users' :
                          key === 'progressVisible' ? 'Show your learning progress publicly' :
                          key === 'tokensVisible' ? 'Display your token balance and earnings' :
                          key === 'activityVisible' ? 'Show your recent activity in community feeds' : ''
                        ) : (
                          key === 'profileVisible' ? 'Hacer tu perfil visible para otros usuarios' :
                          key === 'progressVisible' ? 'Mostrar tu progreso de aprendizaje públicamente' :
                          key === 'tokensVisible' ? 'Mostrar tu balance de tokens y ganancias' :
                          key === 'activityVisible' ? 'Mostrar tu actividad reciente en los feeds de la comunidad' : ''
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, [key]: checked }))
                      }
                      data-testid={`switch-privacy-${key}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Security Settings and Data Management side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Settings */}
            <Card data-testid="security-settings-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="security-settings-title">
                  <Shield className="h-5 w-5" />
                  <span>{language === "en" ? "Security Settings" : "Configuración de Seguridad"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{language === "en" ? "Current Password" : "Contraseña Actual"}</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={language === "en" ? "Enter current password" : "Ingresa la contraseña actual"}
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{language === "en" ? "New Password" : "Nueva Contraseña"}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder={language === "en" ? "Enter new password" : "Ingresa la nueva contraseña"}
                      data-testid="input-new-password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{language === "en" ? "Confirm New Password" : "Confirmar Nueva Contraseña"}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder={language === "en" ? "Confirm new password" : "Confirma la nueva contraseña"}
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>

                <Button className="w-full bg-[#CDEDF6] hover:bg-[#CDEDF6]/80 text-[#000000]" data-testid="button-update-password">
                  {language === "en" ? "Update Password" : "Actualizar Contraseña"}
                </Button>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card data-testid="data-management-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="data-management-title">
                  <Download className="h-5 w-5" />
                  <span>{language === "en" ? "Data Management" : "Gestión de Datos"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleExportData}
                    data-testid="button-export-data"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {language === "en" ? "Export My Data" : "Exportar Mis Datos"}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Download a copy of all your data including courses, progress, and tokens." : "Descarga una copia de todos tus datos incluyendo cursos, progreso y tokens."}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleDeleteAccount}
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === "en" ? "Delete Account" : "Eliminar Cuenta"}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Permanently delete your account and all associated data. This action cannot be undone." : "Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
