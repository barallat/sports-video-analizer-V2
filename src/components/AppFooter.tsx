import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

export function AppFooter() {
  const { t } = useLanguage();
  const { appName, appFooterDescription } = useSportConfigContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{appName}</h3>
            <p className="text-muted-foreground text-sm">
              {appFooterDescription || t('footerDescription')}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">{t('contact')}</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t('email')}: info@sportlytix.es</p>
              <p>{t('phone')}: +34 900 123 456</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">{t('links')}</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t('privacyPolicy')}</p>
              <p>{t('termsOfService')}</p>
              <p>{t('support')}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {appName}. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
