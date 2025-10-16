import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CookieNoticeProps {
  language: "en" | "es";
}

export function CookieNotice({ language }: CookieNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem("cookiesAccepted");
    if (!hasAcceptedCookies) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <div className="bg-background border border-border rounded-xl shadow-lg p-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {language === "en" 
              ? "By using our website you accept our use of cookies"
              : "Al usar nuestro sitio web aceptas nuestro uso de cookies"
            }
          </p>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-[#2f6a75] text-[#fff] hover:opacity-90 flex-shrink-0 h-7 px-3 text-xs"
            data-testid="button-accept-cookies"
          >
            {language === "en" ? "OK" : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
}