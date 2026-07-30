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
  { ic: "bag", t: "Make a purchase", d: "Earn 1 point for every Rp 1.000 spent." },
  { ic: "star", t: "Write a review", d: "Earn 50 points for each product review." },
  { ic: "users", t: "Refer a friend", d: "Earn 200 points when a friend's first order ships." },
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

  if (loading) return <p className="muted">Loading your rewards…</p>;

  const r = data ?? { balance: 0, lifetime: 0, tier: "Friend", events: [] };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div className="rewards-hero">
        <div className="rewards-points">
          <Icon name="award" size={26} />
          <div>
            <div className="rewards-balance">{r.balance.toLocaleString()}</div>
            <div className="rewards-label">Points available</div>
          </div>
        </div>
        <div className="rewards-meta">
          <div><span>{r.lifetime.toLocaleString()}</span> lifetime points</div>
          <div className="rewards-tier">{r.tier} tier</div>
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 16 }}>How to earn points</h3>
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
        <h3 className="h3" style={{ marginBottom: 16 }}>Points history</h3>
        {r.events.length === 0 ? (
          <p className="muted">No points activity yet. Your first order will start your balance!</p>
        ) : (
          <div className="card table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Activity</th><th style={{ textAlign: "right" }}>Points</th></tr>
              </thead>
              <tbody>
                {r.events.map((ev) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.created_at).toLocaleDateString()}</td>
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
