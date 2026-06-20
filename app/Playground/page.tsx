"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTheme } from "../../lib/ThemeContext";
import {
  Camera,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Recycle,
  Palette,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MaterialCategory = "plastic" | "metal" | "e_waste" | "glass" | "rubber";

interface ClassificationResult {
  product_type: {
    recyclable: { category: MaterialCategory } | null;
    artwork: boolean;
  };
  quality_score: number;
  estimated_price: number;
  summary: string;
}

type ScanState = "idle" | "camera" | "captured" | "classifying" | "result" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const MATERIAL_META: Record<MaterialCategory, { label: string; color: string; bg: string }> = {
  plastic:  { label: "Plastic",  color: "text-blue-300",   bg: "bg-blue-500/15" },
  metal:    { label: "Metal",    color: "text-orange-300", bg: "bg-orange-500/15" },
  e_waste:  { label: "E-Waste",  color: "text-purple-300", bg: "bg-purple-500/15" },
  glass:    { label: "Glass",    color: "text-cyan-300",   bg: "bg-cyan-500/15" },
  rubber:   { label: "Rubber",   color: "text-yellow-300", bg: "bg-yellow-500/15" },
};

// ─── API call ─────────────────────────────────────────────────────────────────
async function classifyImage(base64Image: string): Promise<ClassificationResult> {
  await new Promise((r) => setTimeout(r, 2200)); // simulate latency

  const MOCKS: ClassificationResult[] = [
    {
      product_type: { recyclable: { category: "plastic" }, artwork: false },
      quality_score: 82,
      estimated_price: 3200,
      summary: "Clear PET plastic in good reusable condition with moderate resale value.",
    },
    {
      product_type: { recyclable: { category: "metal" }, artwork: false },
      quality_score: 74,
      estimated_price: 8500,
      summary: "Mixed aluminium scrap with recoverable material value despite visible wear.",
    },
    {
      product_type: { recyclable: { category: "e_waste" }, artwork: false },
      quality_score: 68,
      estimated_price: 14000,
      summary: "Electronic waste components with recoverable parts and moderate market value.",
    },
    {
      product_type: { recyclable: null, artwork: true },
      quality_score: 91,
      estimated_price: 28000,
      summary: "Creative recycled artwork with strong visual appeal and high marketplace interest.",
    },
    {
      product_type: { recyclable: { category: "glass" }, artwork: false },
      quality_score: 88,
      estimated_price: 1800,
      summary: "Clean glass bottles in excellent condition, ready for recycling.",
    },
  ];
  return MOCKS[Math.floor(Math.random() * MOCKS.length)];
}

// ─── Quality badge ─────────────────────────────────────────────────────────

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-ecomate-500" :
    score >= 60 ? "bg-yellow-400" :
    score >= 40 ? "bg-orange-400" : "bg-red-500";

  const label =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Average" : "Poor";

  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1.5">
        <span>Quality Score</span>
        <span className="font-semibold text-white">{score}/100 — {label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState("camera");
    } catch {
      setErrorMsg("Camera access denied. Please allow camera permissions and try again.");
      setState("error");
    }
  }, [cameraFacing]);

  const flipCamera = useCallback(async () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      // ignore flip failure
    }
  }, [cameraFacing]);

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    // Stop camera stream after capture
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setCapturedImage(dataUrl);
    setState("captured");
  }, []);

  const classify = useCallback(async () => {
    if (!capturedImage) return;
    setState("classifying");
    try {
      const base64 = capturedImage.split(",")[1];
      const res = await classifyImage(base64);
      setResult(res);
      setState("result");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Classification failed. Please try again.");
      setState("error");
    }
  }, [capturedImage]);

  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCapturedImage(null);
    setResult(null);
    setErrorMsg("");
    setState("idle");
  }, []);

  // Derived display values
  const isArtwork = result?.product_type.artwork;
  const category = result?.product_type.recyclable?.category;
  const meta = category ? MATERIAL_META[category] : null;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-white"}`}>
      <Navbar solid />

      {/* Hero header */}
      <div className="bg-[#0d2818] pt-28 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-ecomate-500/30 bg-ecomate-500/10 px-4 py-1.5 text-xs font-semibold text-ecomate-400 mb-4">
          <Sparkles size={12} />
          AI Material Scanner
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl gradient-text">
          Scan & Classify
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
          Point your camera at any recyclable material or artwork. Our AI will identify it,
          estimate its quality, and give you a market price — instantly.
        </p>
      </div>

      {/* Main card */}
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className={`overflow-hidden rounded-2xl border shadow-xl transition-colors ${
          isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
        }`}>

          {/* ── IDLE STATE ─────────────────────────────────────────────── */}
          {state === "idle" && (
            <div className="flex flex-col items-center gap-6 p-10 text-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#0d2818]">
                <div className="absolute inset-0 animate-ping rounded-full bg-ecomate-500/20" />
                <Camera size={44} className="text-ecomate-400" />
              </div>

              <div>
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Ready to Scan</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Hold your item steady in good lighting for the best result.
                </p>
              </div>

              {/* What can be scanned */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {[
                  { icon: Recycle, label: "Plastic", sub: "Bottles, bags" },
                  { icon: Zap, label: "E-Waste", sub: "Electronics" },
                  { icon: Palette, label: "Artwork", sub: "Recycled art" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl p-3 text-center border transition-colors ${
                    isDark ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-100"
                  }`}>
                    <item.icon size={20} className="mx-auto mb-1 text-ecomate-600" />
                    <p className={`text-xs font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={startCamera}
                className="w-full rounded-xl bg-[#0d2818] py-4 text-sm font-semibold text-ecomate-400 transition hover:bg-[#0a1f12] active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera size={16} />
                Open Camera
              </button>

              <p className="text-[11px] text-gray-400">
                No images are saved. This is a test tool — nothing gets stored.
              </p>
            </div>
          )}

          {/* ── CAMERA STATE ───────────────────────────────────────────── */}
          {state === "camera" && (
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full object-cover"
                style={{ maxHeight: "380px" }}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-56 w-56 rounded-xl border-2 border-ecomate-400 opacity-70">
                  <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-ecomate-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-ecomate-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-ecomate-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-ecomate-400 rounded-br-xl" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-linear-to-t from-black/80 px-6 py-5">
                <button
                  onClick={reset}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                  aria-label="Cancel"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={captureSnapshot}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition hover:bg-white/30 active:scale-90"
                  aria-label="Take snapshot"
                >
                  <div className="h-12 w-12 rounded-full bg-white" />
                </button>

                <button
                  onClick={flipCamera}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                  aria-label="Flip camera"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="M20 7h-9" /><path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
                  </svg>
                </button>
              </div>

              <p className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/70 backdrop-blur-sm">
                Centre your item in the frame
              </p>
            </div>
          )}

          {/* ── CAPTURED STATE ─────────────────────────────────────────── */}
          {state === "captured" && capturedImage && (
            <div>
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured item"
                  className="w-full object-cover"
                  style={{ maxHeight: "320px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
                  Snapshot captured
                </div>
              </div>

              <div className="flex gap-3 p-4">
                <button
                  onClick={reset}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                    isDark ? "border-gray-800 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <RotateCcw size={14} />
                  Retake
                </button>
                <button
                  onClick={classify}
                  className="flex-1 rounded-xl bg-[#0d2818] py-3 text-sm font-semibold text-ecomate-400 transition hover:bg-[#0a1f12] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Classify with AI
                </button>
              </div>
            </div>
          )}

          {/* ── CLASSIFYING STATE ──────────────────────────────────────── */}
          {state === "classifying" && capturedImage && (
            <div>
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Analysing"
                  className="w-full object-cover opacity-50"
                  style={{ maxHeight: "320px" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <Loader2 size={36} className="animate-spin text-ecomate-400" />
                  <p className="text-sm font-medium text-white">Analysing material…</p>
                  <p className="text-[11px] text-white/50">AI is reading texture, shape & composition</p>
                </div>
              </div>
              <div className="p-4 text-center text-xs text-gray-400">
                This usually takes 2–3 seconds
              </div>
            </div>
          )}

          {/* ── RESULT STATE ───────────────────────────────────────────── */}
          {state === "result" && result && (
            <div>
              {capturedImage && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Scanned item"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2818] via-[#0d2818]/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    {isArtwork ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30">
                        <Palette size={11} />
                        Recycled Artwork
                      </span>
                    ) : meta ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-white/20 ${meta.bg} ${meta.color}`}>
                        <Recycle size={11} />
                        {meta.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ecomate-500">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
              )}

              {/* Results panel */}
              <div className="bg-[#0d2818] p-5 space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/40">Estimated Market Price</p>
                    <p className="mt-0.5 text-3xl font-bold text-ecomate-400">
                      ₦{result.estimated_price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-white/40">Type</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {isArtwork ? "Artwork" : meta?.label ?? "Unknown"}
                    </p>
                  </div>
                </div>

                <QualityBar score={result.quality_score} />

                <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1.5">AI Summary</p>
                  <p className="text-sm leading-relaxed text-white/80">{result.summary}</p>
                </div>

                <p className="text-[10px] text-white/30 text-center">
                  Estimates are for guidance only and may vary by location and market conditions.
                  Nothing here is saved to your account.
                </p>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={reset}
                    className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 flex items-center justify-center gap-2"
                  >
                    <Camera size={14} />
                    Scan Another
                  </button>
                  {!isArtwork && (
                    <a
                      href="/market"
                      className="flex-1 rounded-xl bg-ecomate-600 py-3 text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Recycle size={14} />
                      List on Market
                    </a>
                  )}
                  {isArtwork && (
                    <a
                      href="/market"
                      className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Palette size={14} />
                      List as Artwork
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ERROR STATE ────────────────────────────────────────────── */}
          {state === "error" && (
            <div className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Something went wrong</h3>
                <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
              </div>
              <button
                onClick={reset}
                className="rounded-xl bg-[#0d2818] px-6 py-3 text-sm font-semibold text-ecomate-400 transition hover:bg-[#0a1f12]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* How it works */}
        {state === "idle" && (
          <div className="mt-10">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400 mb-5">
              How it works
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: "1", label: "Open Camera", desc: "Grant camera access when prompted" },
                { step: "2", label: "Take Snapshot", desc: "Frame your item and tap the shutter" },
                { step: "3", label: "Get Results", desc: "AI returns category, quality & price" },
              ].map((s) => (
                <div key={s.step}>
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0d2818] text-xs font-bold text-ecomate-400">
                    {s.step}
                  </div>
                  <p className={`text-xs font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{s.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}