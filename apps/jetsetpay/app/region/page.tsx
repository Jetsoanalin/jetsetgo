"use client";
import { useEffect, useState } from "react";
import { COUNTRIES, type CountryCode } from "@jetset/shared/dist/countries";
import { getLanguage, getSelectedCountry, setLanguage, setSelectedCountry, type Lang } from "@jetset/shared/dist/prefs";
import { useRouter } from "next/navigation";
import { t } from "@jetset/shared/dist/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi / हिन्दी' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'th', label: 'Thai / ไทย' },
  { code: 'vi', label: 'Vietnamese / Tiếng Việt' },
  { code: 'ms', label: 'Malay / Bahasa Melayu' },
  { code: 'ph', label: 'Filipino / Tagalog' },
  { code: 'km', label: 'Khmer / ភាសាខ្មែរ' },
  { code: 'lo', label: 'Lao / ລາວ' },
  { code: 'mn', label: 'Mongolian / Монгол' },
];

export default function RegionPage() {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>('TH');
  const [lang, setLang] = useState<Lang>('en');
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    setCountry(getSelectedCountry('TH'));
    setLang(getLanguage('en'));
  }, []);

  function onContinue() {
    setStep(2);
  }

  function onSave() {
    setSelectedCountry(country);
    setLanguage(lang);
    router.back();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full rounded-t-3xl bg-neutral-950 border-t border-neutral-800 p-6">
        {step === 1 && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{t('where_use_title', lang)}</h1>
              <p className="text-neutral-400 text-sm">{t('where_use_subtitle', lang)}</p>
            </div>
            <div className="max-h-[60vh] overflow-auto space-y-3">
              {COUNTRIES.map((c) => (
                <button key={c.code} onClick={() => setCountry(c.code)} className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-base">{c.name}</span>
                  </div>
                  <span className={`h-6 w-6 rounded-full border-2 ${country === c.code ? 'border-blue-500 bg-blue-500' : 'border-neutral-700'}`} />
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={onContinue} className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">{t('continue_btn', lang)}</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{t('choose_language_title', lang)}</h1>
              <p className="text-neutral-400 text-sm">{t('choose_language_subtitle', lang)}</p>
            </div>
            <div className="max-h-[60vh] overflow-auto space-y-3">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between">
                  <span className="text-base">{l.label}</span>
                  <span className={`h-6 w-6 rounded-full border-2 ${lang === l.code ? 'border-blue-500 bg-blue-500' : 'border-neutral-700'}`} />
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={onSave} className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">{t('save_btn', lang)}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 