"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";

export type ConfirmTone = "default" | "danger" | "success" | "warning";

const TONE_ICON: Record<ConfirmTone, string> = {
  default: "alert-circle",
  danger: "trash",
  success: "check",
  warning: "alert-triangle",
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * In-app replacement for window.confirm(). The browser dialog can't be styled,
 * shows the bare domain as its title and blocks the whole tab, so every
 * confirmation in the app goes through this instead.
 *
 * onConfirm may return a promise: the dialog then stays open with a spinner on
 * the confirm button until it settles, and the caller closes it (usually by
 * flipping isOpen in its own finally block).
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  children,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
  tone,
  icon,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  tone?: ConfirmTone;
  icon?: string;
  onConfirm: () => void | Promise<unknown>;
  onCancel: () => void;
}) {
  const resolvedTone: ConfirmTone = tone ?? (isDestructive ? "danger" : "default");
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  const cancel = useCallback(() => {
    if (!busy) onCancel();
  }, [busy, onCancel]);

  const confirm = async () => {
    if (busy) return;
    const result = onConfirm();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setBusy(true);
      try {
        await result;
      } finally {
        setBusy(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    // Hiding the scrollbar would otherwise shift the page sideways by its width.
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    // Destructive dialogs start on Cancel so a stray Enter can't delete anything.
    const target = resolvedTone === "danger" ? cancelRef.current : confirmRef.current;
    const raf = requestAnimationFrame(() => target?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cancel();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="cm-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cancel();
      }}
    >
      <div
        ref={dialogRef}
        className={`cm-dialog cm-tone-${resolvedTone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descId : undefined}
        aria-busy={busy || undefined}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="cm-close" aria-label="Tutup" onClick={cancel} disabled={busy}>
          <Icon name="close" size={18} />
        </button>

        <div className="cm-icon">
          <Icon name={icon ?? TONE_ICON[resolvedTone]} size={24} />
        </div>

        <h2 id={titleId} className="cm-title">{title}</h2>
        {message && <p id={descId} className="cm-message">{message}</p>}
        {children && <div className="cm-body">{children}</div>}

        <div className="cm-actions">
          <button ref={cancelRef} type="button" className="cm-btn cm-btn-ghost" onClick={cancel} disabled={busy}>
            {cancelText}
          </button>
          <button ref={confirmRef} type="button" className="cm-btn cm-btn-primary" onClick={confirm} disabled={busy}>
            {busy && <Icon name="loader" size={16} className="cm-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
