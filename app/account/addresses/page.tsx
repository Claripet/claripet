"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";
import { ID_PROVINCES, citiesForProvince } from "@/data/idRegions";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export default function AddressesPage() {
  return (
    <AccountShell title="My Addresses">
      <AddressesList />
    </AccountShell>
  );
}

function AddressesList() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const fetchAddresses = useCallback(async () => {
    const res = await fetch("/api/addresses");
    const json = await res.json();
    if (json.success) setAddresses(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAddresses();
    }
  }, [authLoading, user, fetchAddresses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    fetchAddresses();
  };

  return (
    <div>
      <div className="addresses-head">
        <h2 className="h3">Saved Addresses</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={16} /> Add Address
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : addresses.length === 0 ? (
        <div className="empty-box">
          <Icon name="pinned" size={32} />
          <p>No saved addresses yet</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={"address-card card" + (addr.is_default ? " default" : "")}
            >
              <div className="address-header">
                <span className="address-label">
                  <Icon name="pinned" size={14} /> {addr.label}
                </span>
                {addr.is_default && <span className="default-badge">Default</span>}
              </div>
              <div className="address-body">
                <div className="address-name">{addr.full_name}</div>
                <div>{addr.phone}</div>
                <div>{addr.street}</div>
                <div>
                  {addr.city}, {addr.province} {addr.postal_code}
                </div>
              </div>
              <div className="address-actions">
                <button
                  onClick={() => {
                    setEditing(addr);
                    setShowForm(true);
                  }}
                >
                  <Icon name="edit" size={14} /> Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)}>
                    <Icon name="check" size={14} /> Set Default
                  </button>
                )}
                <button className="danger" onClick={() => handleDelete(addr.id)}>
                  <Icon name="trash" size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          address={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchAddresses();
          }}
        />
      )}

      <style jsx>{`
        .addresses-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .empty-box {
          text-align: center;
          padding: 48px;
          background: var(--mist);
          border-radius: var(--r-lg);
          color: var(--text-soft);
        }
        .empty-box p {
          margin: 12px 0 20px;
        }
        .address-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .address-list :global(.address-card) {
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .address-list :global(.address-card.default) {
          border: 1.5px solid var(--navy);
        }
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .address-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--navy);
        }
        .default-badge {
          font-size: 11px;
          padding: 3px 10px;
          background: var(--navy);
          border-radius: var(--r-pill);
          font-weight: 600;
          color: #fff;
        }
        .address-body {
          font-size: 14px;
          color: var(--text-soft);
          line-height: 1.6;
          margin-bottom: 14px;
          flex: 1;
        }
        .address-name {
          font-weight: 600;
          color: var(--navy);
        }
        .address-actions {
          display: flex;
          gap: 14px;
          border-top: 1px solid var(--line);
          padding-top: 12px;
        }
        .address-actions button {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-soft);
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          transition: color 0.15s;
        }
        .address-actions button:hover {
          color: var(--navy);
        }
        .address-actions button.danger:hover {
          color: #b04050;
        }
      `}</style>
    </div>
  );
}

function AddressForm({
  address,
  onClose,
  onSaved,
}: {
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: address?.label ?? "",
    full_name: address?.full_name ?? "",
    phone: address?.phone ?? "",
    street: address?.street ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    postal_code: address?.postal_code ?? "",
    is_default: address?.is_default ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = address ? `/api/addresses/${address.id}` : "/api/addresses";
    const method = address ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (json.success) {
      onSaved();
    } else {
      setError(json.error ?? "Failed to save address.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, textAlign: "left" }}
      >
        <h3 className="h3" style={{ marginBottom: 20 }}>
          {address ? "Edit Address" : "Add Address"}
        </h3>

        {error && (
          <div
            style={{
              background: "var(--pink-50)",
              color: "#b04050",
              padding: "10px 14px",
              borderRadius: "var(--r-md)",
              marginBottom: 14,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g., Home, Office"
              required
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
            />
          </div>
          <div className="addr-2col">
            <div className="form-group">
              <label>Province</label>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value, city: "" })}
                required
              >
                <option value="">Select province</option>
                {ID_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>City / Regency</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={!form.province}
                required
              >
                <option value="">{form.province ? "Select city / regency" : "Select province first"}</option>
                {citiesForProvince(form.province).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              required
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default address
          </label>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
          }
          .addr-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          @media (max-width: 480px) {
            .addr-2col { grid-template-columns: 1fr; }
          }
          .form-group label {
            font-weight: 500;
            font-size: 13px;
            color: var(--navy);
          }
          .form-group input[type="text"],
          .form-group input[type="tel"],
          .form-group select {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 14px;
            border: 1.5px solid var(--line);
            border-radius: var(--r-md);
            font-family: inherit;
            font-size: 14px;
            outline: none;
            background: #fff;
          }
          .form-group select {
            cursor: pointer;
          }
          .form-group select:disabled {
            background: var(--mist);
            color: var(--text-soft);
            cursor: not-allowed;
          }
          .form-group input:focus,
          .form-group select:focus {
            border-color: var(--navy);
          }
        `}</style>
      </div>
    </div>
  );
}
