import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, translations, SUPPORTED_LANGUAGES } from '../lib/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  detectedLang: LanguageCode | null;
  showPrompt: boolean;
  dismissPrompt: () => void;
  acceptPrompt: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load saved language, default to 'th'
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sotyai_language');
    if (saved && translations[saved as LanguageCode]) {
      return saved as LanguageCode;
    }
    return 'th'; // default Thai
  });

  const [detectedLang, setDetectedLang] = useState<LanguageCode | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language || (navigator as any).userLanguage || '';
    const cleanLang = browserLang.split('-')[0].toLowerCase() as LanguageCode;

    // Check if the browser language is one of our 10 supported languages
    const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === cleanLang);
    const hasPrompted = localStorage.getItem('sotyai_lang_prompted');

    if (isSupported && cleanLang !== language && !hasPrompted) {
      setDetectedLang(cleanLang);
      setShowPrompt(true);
    }
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('sotyai_language', lang);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('sotyai_lang_prompted', 'true');
  };

  const acceptPrompt = () => {
    if (detectedLang) {
      setLanguage(detectedLang);
    }
    setShowPrompt(false);
    localStorage.setItem('sotyai_lang_prompted', 'true');
  };

  // Translation function
  const t = (key: string): string => {
    const langDict = translations[language] || translations['th'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English, then Thai, then return key itself
    const enDict = translations['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    const thDict = translations['th'];
    if (thDict && thDict[key]) {
      return thDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        detectedLang,
        showPrompt,
        dismissPrompt,
        acceptPrompt,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
