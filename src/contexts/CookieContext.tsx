import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
}

interface CookieContextType {
  consent: CookieConsent | null;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (consent: Partial<CookieConsent>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetConsent: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = "cookie-consent";

export const CookieProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Cargar consentimiento guardado
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
      } catch (error) {
        console.error("Error parsing saved cookie consent:", error);
      }
    } else {
      // Mostrar banner si no hay consentimiento previo
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      advertising: true,
    };
    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
  };

  const rejectAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      advertising: false,
    };
    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
  };

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = { ...consent, ...newConsent };
    setConsent(updatedConsent);
    setShowBanner(false);
    setShowSettings(false);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updatedConsent));
  };

  const openSettings = () => {
    setShowSettings(true);
    setShowBanner(false);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setConsent(null);
    setShowBanner(true);
    setShowSettings(false);
  };

  const value: CookieContextType = {
    consent,
    showBanner,
    showSettings,
    acceptAll,
    rejectAll,
    updateConsent,
    openSettings,
    closeSettings,
    resetConsent,
  };

  return (
    <CookieContext.Provider value={value}>{children}</CookieContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieProvider");
  }
  return context;
};
