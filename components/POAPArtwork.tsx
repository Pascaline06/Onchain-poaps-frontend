"use client";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import { decodeRawSvg } from "@/lib/metadata";

/**
 * Renders a POAP's SVG inline (sanitized) rather than via <img src="data:...">.
 * Centralized here because this exact logic used to be duplicated across
 * four components with copy-pasted <img> tags — meaning the "some SVGs
 * silently render blank via <img>" bug had to be fixed in four places
 * independently. Now there's one place, used everywhere artwork shows up.
 *
 * Anyone can register an event with arbitrary SVG on this permissionless
 * contract, so sanitizing before this ever touches the DOM isn't optional.
 */
export function POAPArtwork({
  imageDataUri,
  alt,
  className,
  fallback,
}: {
  imageDataUri: string | undefined | null;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const sanitizedSvg = useMemo(() => {
    if (!imageDataUri) return null;
    const raw = decodeRawSvg(imageDataUri);
    if (!raw) return null;
    try {
      return DOMPurify.sanitize(raw, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script"],
        FORBID_ATTR: ["onload", "onerror", "onclick"],
      });
    } catch {
      return null;
    }
  }, [imageDataUri]);

  if (!sanitizedSvg) return <>{fallback}</>;

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}
