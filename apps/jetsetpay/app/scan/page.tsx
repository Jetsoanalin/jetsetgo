"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
              router.replace(`/confirm?payload=${payload}`);
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
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scan Merchant QR</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <video ref={videoRef} className="w-full rounded border" muted playsInline />
      <p className="text-sm text-neutral-500 mt-2">Point your camera at the QR code.</p>
    </div>
  );
} 