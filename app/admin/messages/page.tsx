"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
};

const TABS: { key: string; label: string }[] = [
  { key: "new", label: "Baru" },
  { key: "read", label: "Dibaca" },
  { key: "archived", label: "Arsip" },
];

export default function AdminMessagesPage() {
  const [tab, setTab] = useState("new");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToastMsg } = useCart();

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetch(`/api/admin/messages?status=${status}`).then((r) => r.json());
      if (!json.success) throw new Error(json.error || "Gagal memuat pesan");
      setMessages(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const setStatus = async (m: Message, status: Message["status"]) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, status }),
    }).then((r) => r.json());
    if (!res.success) {
      showToastMsg(res.error || "Gagal memperbarui pesan", "error");
      return;
    }
    setMessages((list) => list.filter((x) => x.id !== m.id));
    showToastMsg(status === "archived" ? "Pesan diarsipkan" : status === "read" ? "Ditandai sudah dibaca" : "Ditandai baru");
  };

  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 20 }}>Pesan Masuk</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.key} className={"pill" + (tab === t.key ? " active" : "")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="os-error" role="alert">
          <Icon name="alert-circle" size={18} /> {error}
        </div>
      )}
      {loading ? (
        <p className="muted">Memuat pesan...</p>
      ) : messages.length === 0 && !error ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-soft)" }}>
          Tidak ada pesan di sini.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {messages.map((m) => {
            const reply = `mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`;
            return (
              <div key={m.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{m.subject}</div>
                    <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 2 }}>
                      {m.name} · {m.email}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    {new Date(m.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
                <p style={{ margin: "14px 0", whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text)" }}>{m.message}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a
                    className="btn btn-primary btn-sm"
                    href={reply}
                    onClick={() => m.status === "new" && void setStatus(m, "read")}
                  >
                    <Icon name="mail" size={16} /> Balas lewat email
                  </a>
                  {m.status === "new" && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setStatus(m, "read")}>
                      Tandai dibaca
                    </button>
                  )}
                  {m.status !== "archived" ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => setStatus(m, "archived")}>
                      Arsipkan
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => setStatus(m, "new")}>
                      Kembalikan ke Baru
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
