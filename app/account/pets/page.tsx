"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null;
  notes: string | null;
}

const EMPTY = { name: "", species: "Dog", breed: "", birthdate: "", notes: "" };

export default function PetsPage() {
  return (
    <AccountShell title="My Pets">
      <PetsList />
    </AccountShell>
  );
}

function PetsList() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/pet-profiles");
    const json = await res.json();
    if (json.success) setPets(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user, load]);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (p: Pet) => {
    setForm({ name: p.name, species: p.species, breed: p.breed ?? "", birthdate: p.birthdate ?? "", notes: p.notes ?? "" });
    setEditing(p.id);
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify(form);
    const headers = { "Content-Type": "application/json" };
    if (editing) await fetch(`/api/pet-profiles/${editing}`, { method: "PATCH", headers, body });
    else await fetch("/api/pet-profiles", { method: "POST", headers, body });
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this pet profile?")) return;
    await fetch(`/api/pet-profiles/${id}`, { method: "DELETE" });
    setPets((s) => s.filter((p) => p.id !== id));
  };

  if (loading) return <p className="muted">Loading your pets…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p className="muted" style={{ margin: 0 }}>Tell us about your pets so we can recommend the right care.</p>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Icon name="plus" size={16} /> Add Pet</button>
      </div>

      {pets.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="ec"><Icon name="dog" size={32} /></div>
          <h3 className="h3" style={{ marginBottom: 8 }}>No pets added yet</h3>
          <p className="muted" style={{ marginBottom: 18 }}>Add your first fur baby to get personalised recommendations.</p>
          <button className="btn btn-primary" onClick={openNew}>Add a pet</button>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((p) => (
            <div className="pet-card card" key={p.id}>
              <div className="pet-avatar"><Icon name={p.species === "Cat" ? "cat" : "dog"} size={26} /></div>
              <div className="pet-info">
                <div className="pet-name">{p.name}</div>
                <div className="pet-sub">{[p.species, p.breed].filter(Boolean).join(" · ")}</div>
                {p.notes && <p className="pet-notes">{p.notes}</p>}
              </div>
              <div className="pet-actions">
                <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(p)}><Icon name="edit" size={16} /></button>
                <button className="icon-btn" aria-label="Remove" onClick={() => remove(p.id)}><Icon name="trash" size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-scrim" onClick={() => setShowForm(false)}>
          <form className="modal pet-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3 className="h3" style={{ marginBottom: 18 }}>{editing ? "Edit Pet" : "Add Pet"}</h3>
            <div className="cf-field">
              <span>Name <b>*</b></span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mochi" />
            </div>
            <div className="cf-row">
              <label className="cf-field">
                <span>Species</span>
                <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
                  <option>Dog</option><option>Cat</option><option>Other</option>
                </select>
              </label>
              <label className="cf-field">
                <span>Breed</span>
                <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Poodle" />
              </label>
            </div>
            <label className="cf-field">
              <span>Birthdate</span>
              <input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
            </label>
            <label className="cf-field">
              <span>Notes</span>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Allergies, preferences, anything we should know" />
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-block">{editing ? "Save" : "Add Pet"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
