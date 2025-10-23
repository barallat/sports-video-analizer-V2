import { useCookieConsent } from "../contexts/CookieContext";
import CookieBanner from "./CookieBanner";
import CookieSettings from "./CookieSettings";

const CookieManager = () => {
  const {
    consent,
    showBanner,
    showSettings,
    acceptAll,
    rejectAll,
    openSettings,
    closeSettings,
    updateConsent,
  } = useCookieConsent();

  return (
    <>
      {showBanner && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onOpenSettings={openSettings}
          onClose={() => {}}
        />
      )}

      <CookieSettings
        isOpen={showSettings}
        onClose={closeSettings}
        consent={consent}
        onSave={updateConsent}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
      />
    </>
  );
};

export default CookieManager;
