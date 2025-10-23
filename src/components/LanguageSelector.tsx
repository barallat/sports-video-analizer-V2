
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'es' | 'en')}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          <span className="flex items-center">
            <span className="mr-2">{currentLanguage?.flag}</span>
            {currentLanguage?.name}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center">
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
