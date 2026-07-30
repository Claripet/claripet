import Image from 'next/image'
import type { CSSProperties } from "react";
import type { Tone } from "@/lib/types";

interface PlaceholderProps {
  tone?: Tone;
  label?: string;
  src?: string;
  alt?: string;
  paw?: boolean;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
}

export function Placeholder({
  tone,
  label,
  src,
  alt,
  paw = true,
  className,
  style,
  width = 400,
  height = 400,
}: PlaceholderProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || label || ""}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  return (
    <div
      className={"ph " + (tone ?? "") + " " + (className ?? "")}
      style={style}
      role="img"
      aria-label={label || "image"}
    >
      {paw && (
        <svg className="ph-paw" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
          <ellipse cx="20" cy="22" rx="6.5" ry="9" />
          <ellipse cx="44" cy="22" rx="6.5" ry="9" />
          <ellipse cx="10" cy="36" rx="5.5" ry="7.5" />
          <ellipse cx="54" cy="36" rx="5.5" ry="7.5" />
          <path d="M32 34c-8 0-14 6-14 13 0 5 4 8 9 8 2 0 3.5-1 5-1s3 1 5 1c5 0 9-3 9-8 0-7-6-13-14-13z" />
        </svg>
      )}
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}
