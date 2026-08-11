"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";

interface RewardEvent {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}
interface Rewards {
  balance: number;
  lifetime: number;
  tier: string;
  events: RewardEvent[];
}

const EARN = [
  { ic: "bag", t: "Berbelanja", d: "Dapatkan 1 poin untuk setiap Rp 1.000 yang dibelanjakan." },
  { ic: "star", t: "Tulis ulasan", d: "Dapatkan 50 poin untuk setiap ulasan produk." },
  { ic: "users", t: "Ajak teman", d: "Dapatkan 200 poin saat pesanan pertama teman Anda dikirim." },
];

export default function RewardsPage() {
  return (
    <AccountShell title="ClariPet Rewards">
      <RewardsBody />
    </AccountShell>
  );
}

function RewardsBody() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Rewards | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/rewards");
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user, load]);

  if (loading) return <p className="muted">Memuat poin reward Anda…</p>;

  const r = data ?? { balance: 0, lifetime: 0, tier: "Friend", events: [] };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div className="rewards-hero">
        <div className="rewards-points">
          <Icon name="award" size={26} />
          <div>
            <div className="rewards-balance">{r.balance.toLocaleString()}</div>
            <div className="rewards-label">Poin tersedia</div>
          </div>
        </div>
        <div className="rewards-meta">
          <div><span>{r.lifetime.toLocaleString()}</span> poin seumur hidup</div>
          <div className="rewards-tier">Tingkat {r.tier}</div>
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 16 }}>Cara mendapatkan poin</h3>
        <div className="why-grid rewards-earn">
          {EARN.map((e, i) => (
            <div className="why-item" key={i}>
              <div className="why-ic"><Icon name={e.ic} size={26} /></div>
              <div className="t">{e.t}</div>
              <div className="d">{e.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 16 }}>Riwayat poin</h3>
        {r.events.length === 0 ? (
          <p className="muted">Belum ada aktivitas poin. Pesanan pertama Anda akan memulai saldo poin!</p>
        ) : (
          <div className="card table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Aktivitas</th><th style={{ textAlign: "right" }}>Poin</th></tr>
              </thead>
              <tbody>
                {r.events.map((ev) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.created_at).toLocaleDateString("id-ID")}</td>
                    <td>{ev.reason}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: ev.points >= 0 ? "#3c7a52" : "#b04050" }}>
                      {ev.points >= 0 ? "+" : ""}{ev.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
