import { Link } from "react-router-dom";
import { useCookieConsent } from "../contexts/CookieContext";

const Footer = () => {
  const { openSettings } = useCookieConsent();

  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-6">
            <Link 
              to="/public-legal?tab=terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => console.log("Footer: Clicked Terms and Conditions")}
            >
              Términos y Condiciones
            </Link>
            <Link 
              to="/public-legal?tab=privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => console.log("Footer: Clicked Privacy Policy")}
            >
              Política de Privacidad
            </Link>
            <Link 
              to="/public-legal?tab=cookies" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => console.log("Footer: Clicked Cookie Policy")}
            >
              Política de Cookies
            </Link>
            <button 
              onClick={() => {
                console.log('Footer button clicked');
                openSettings();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Configuración de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
