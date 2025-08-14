import React, { createContext, useContext, useEffect, useState } from 'react';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  return useContext(SiteSettingsContext);
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: '',
    site_logo: '/logo.png',
    site_font: 'Cairo, sans-serif',
    site_language: 'ar',
    site_languages: JSON.stringify(['ar', 'en']),
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
     const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/settings`);
      const data = await res.json();
      setSettings({
        site_name: data.site_name || '',
        site_logo: data.site_logo || '/logo.png',
        site_font: data.site_font || 'Cairo, sans-serif',
        site_language: data.site_language || 'ar',
        site_languages: data.site_languages || JSON.stringify(['ar', 'en']),
        facebookUrl: data.facebookUrl || '',
        twitterUrl: data.twitterUrl || '',
        instagramUrl: data.instagramUrl || '',
        youtubeUrl: data.youtubeUrl || ''
      });
    } catch (e) {
      // fallback to defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  // تطبيق الخط المختار على مستوى body
  useEffect(() => {
    if (settings.site_font) {
      document.body.style.fontFamily = settings.site_font;
    }
  }, [settings.site_font]);

  // تطبيق اللغة المختارة على مستوى html
  useEffect(() => {
    if (settings.site_language) {
      document.documentElement.lang = settings.site_language;
      document.body.dir = settings.site_language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [settings.site_language]);

  // تطبيق اسم الموقع على عنوان الصفحة
  useEffect(() => {
    if (settings.site_name) {
      document.title = settings.site_name;
    }
  }, [settings.site_name]);

  return (
    <SiteSettingsContext.Provider value={{ ...settings, loading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}; 