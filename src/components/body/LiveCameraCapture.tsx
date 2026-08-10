"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, FlipCameraIcon } from "@/components/icons";
import { bodyCopy } from "@/lib/copy/body";

/**
 * In-app live camera view (getUserMedia + <video>), so the previous shot for
 * this slot can be overlaid semi-transparently ON the live feed while
 * framing the new one — the OS's own camera app (the alternative, via a
 * plain <input type="file">) gives web pages no way to draw on top of it.
 * "Choose from library" always stays reachable (permission denial, no
 * camera, unsupported browser) via `onUseGalleryInstead`.
 */
export function LiveCameraCapture({
  previousImageUrl,
  onCapture,
  onCancel,
  onUseGalleryInstead,
}: {
  previousImageUrl?: string;
  onCapture: (file: File) => void;
  onCancel: () => void;
  onUseGalleryInstead: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);
  const cameraSupported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const [error, setError] = useState<string | null>(cameraSupported ? null : bodyCopy.camera.unsupported);

  useEffect(() => {
    if (!cameraSupported) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setError(null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError(bodyCopy.camera.permissionError);
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facingMode, cameraSupported]);

  function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000" }}>
      <div
        className="flex shrink-0 items-center justify-between px-4 pb-3"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label={bodyCopy.camera.close}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <CloseIcon className="h-4 w-4 text-white" />
        </button>
        <button
          type="button"
          onClick={() => setFacingMode((f) => (f === "environment" ? "user" : "environment"))}
          aria-label={bodyCopy.camera.flip}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <FlipCameraIcon className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        {previousImageUrl && ready && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previousImageUrl}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}

        {!error && (
          <p className="pointer-events-none absolute top-3 left-1/2 max-w-[80%] -translate-x-1/2 text-center text-[11px] leading-relaxed text-white/80">
            {ready ? bodyCopy.camera.hint : bodyCopy.camera.starting}
          </p>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="max-w-[240px] text-[13px] leading-relaxed text-white">{error}</p>
            <button
              type="button"
              onClick={onUseGalleryInstead}
              className="rounded-full px-5 py-2.5 text-[12px] font-semibold"
              style={{ background: "var(--color-accent)", color: "var(--color-ink)" }}
            >
              {bodyCopy.camera.gallery}
            </button>
          </div>
        )}
      </div>

      {!error && (
        <div
          className="grid shrink-0 grid-cols-3 items-center px-6 pt-4"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={onUseGalleryInstead}
            className="justify-self-start text-[11px] font-semibold text-white/80"
          >
            {bodyCopy.camera.gallery}
          </button>
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            aria-label={bodyCopy.capture.cta}
            className="h-16 w-16 justify-self-center rounded-full disabled:opacity-40"
            style={{ border: "3px solid white", background: "rgba(255,255,255,0.15)" }}
          />
          <span />
        </div>
      )}
    </div>
  );
}
