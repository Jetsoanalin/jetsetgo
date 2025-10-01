import type { CountryCode } from './countries';

type GlobalEventMap = Window & typeof globalThis;

const KEY_COUNTRY = 'jetset_country';
const KEY_LANG = 'jetset_lang';

type Lang = 'en' | 'hi' | 'id' | 'th' | 'vi' | 'ms' | 'sg' | 'ph' | 'km' | 'lo' | 'mn';

function emitPrefsUpdated() {
  if (typeof window !== 'undefined') {
    try {
      (window as GlobalEventMap).dispatchEvent(new CustomEvent('jetset:prefs-updated'));
    } catch {}
  }
}

export function getSelectedCountry(defaultCode: CountryCode = 'TH'): CountryCode {
  if (typeof window === 'undefined') return defaultCode;
  const v = localStorage.getItem(KEY_COUNTRY) as CountryCode | null;
  return (v as CountryCode) || defaultCode;
}

export function setSelectedCountry(code: CountryCode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_COUNTRY, code);
  emitPrefsUpdated();
}

export function getLanguage(defaultLang: Lang = 'en'): Lang {
  if (typeof window === 'undefined') return defaultLang;
  const v = localStorage.getItem(KEY_LANG) as Lang | null;
  return (v as Lang) || defaultLang;
}

export function setLanguage(lang: Lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_LANG, lang);
  emitPrefsUpdated();
}

export type { Lang }; 