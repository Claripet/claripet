"use client";

import { useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-scrim"
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "var(--r-lg, 12px)",
          padding: 24,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, marginBottom: 24 }}>
          {message}
        </p>
        
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            {cancelText}
          </button>
          
          <PrimaryButton
            onClick={onConfirm}
            className={isDestructive ? "btn-destructive" : ""}
            size="md"
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
      
      <style jsx>{`
        :global(.btn-destructive) {
          background-color: #b04050 !important;
          border-color: #b04050 !important;
          color: white !important;
        }
        :global(.btn-destructive:hover) {
          background-color: #8c2b38 !important;
        }
      `}</style>
    </div>
  );
}