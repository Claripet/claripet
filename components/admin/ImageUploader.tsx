"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";

export interface ProductImageInput {
  url: string;
  alt?: string;
  sort_order: number;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reindex = (list: ProductImageInput[]) =>
    list.map((img, i) => ({ ...img, sort_order: i }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded: ProductImageInput[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Upload failed");
        break;
      }
      uploaded.push({ url: json.data.url, sort_order: 0 });
    }

    if (uploaded.length > 0) onChange(reindex([...images, ...uploaded]));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(reindex(next));
  };

  const remove = (i: number) =>
    onChange(reindex(images.filter((_, idx) => idx !== i)));

  return (
    <div className="uploader">
      {error && <div className="upload-error">{error}</div>}

      {images.length > 0 && (
        <div className="thumbs">
          {images.map((img, i) => (
            <div key={img.url} className="thumb">
              <Image src={img.url} alt={img.alt ?? `Product photo ${i + 1}`} width={100} height={100} style={{ objectFit: "cover" }} />
              {i === 0 && <span className="badge">Main</span>}
              <div className="thumb-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left">
                  <Icon name="arrow-left" size={14} />
                </button>
                <button type="button" onClick={() => remove(i)} aria-label="Remove" className="danger">
                  <Icon name="trash" size={14} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move right" className="flip">
                  <Icon name="arrow-left" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Icon name="plus" size={14} /> {uploading ? "Uploading..." : "Add Photos"}
      </button>
      <p className="hint">JPEG, PNG, or WebP — max 5 MB each. First photo is the main one.</p>

      <style jsx>{`
        .uploader {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }
        .upload-error {
          background: var(--pink-50);
          color: #b04050;
          padding: 10px 16px;
          border-radius: var(--r-md);
          font-size: 13px;
          width: 100%;
        }
        .thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .thumb {
          position: relative;
          width: 120px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          overflow: hidden;
          background: #fff;
        }
        .thumb img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }
        .badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: var(--navy);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .thumb-actions {
          display: flex;
          justify-content: space-between;
          padding: 4px;
          border-top: 1.5px solid var(--line);
        }
        .thumb-actions button {
          display: inline-flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--navy);
          padding: 4px 8px;
          border-radius: 6px;
        }
        .thumb-actions button.flip {
          transform: rotate(180deg);
        }
        .thumb-actions button:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .thumb-actions button.danger {
          color: #b04050;
        }
        .hint {
          font-size: 12px;
          color: var(--muted, #888);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
