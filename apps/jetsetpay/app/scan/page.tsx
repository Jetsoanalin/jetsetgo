"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { getSelectedCountry } from "@jetset/shared/dist/prefs";
import { getCountry } from "@jetset/shared/dist/countries";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const code = getSelectedCountry('TH');
  const country = useMemo(() => getCountry(code), [code]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: IScannerControls | undefined;

    async function start() {
      try {
        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (stopped) return;
            if (result) {
              stopped = true;
              const text = result.getText();
              const payload = encodeURIComponent(text);
              router.replace(`/pay/amount?payload=${payload}`);
              controls?.stop();
            }
          }
        );
      } catch (e: any) {
        setError(e?.message || "Camera error");
      }
    }

    start();
    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />

      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-sm opacity-90">Scanning • {country.qrSystem}</div>
        {error && <div className="text-red-400 text-xs">{error}</div>}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 border-4 border-white/80 rounded-xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]" />
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 text-center bg-gradient-to-t from-black/80 to-transparent text-sm opacity-90">
        Align the QR within the frame to pay via {country.qrSystem}.
      </div>
    </div>
  );
} 