"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { shippingAddressSchema } from "@/lib/validators/checkout";
import { ID_PROVINCES, citiesForProvince } from "@/data/idRegions";

type ShippingRate = {
  courierCode: string;
  courierName: string;
  courierServiceCode: string;
  courierServiceName: string;
  description: string;
  etd: string;
  fee: number;
  originalFee: number;
  freeShipping: boolean;
};

type FormState = {
  fullName: string;
  phone: string;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  note: string;
};

// A saved address as returned by /api/addresses (snake_case from the DB)
type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  label: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  note: "",
};

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [mode, setMode] = useState<"saved" | "new">("new");
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [addressSaved, setAddressSaved] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [modal, setModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handlePayment() {
    setIsProcessing(true);
    try {
      // 1. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: {
            full_name: form.fullName,
            phone: form.phone,
            street: form.address,
            city: form.city,
            province: form.province,
            postal_code: form.postalCode,
          },
          courier_code: selectedRate?.courierCode,
          courier_service_code: selectedRate?.courierServiceCode,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || "Gagal membuat pesanan");

      // 2. Get payment token
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderData.data.id }),
      });
      const payData = await payRes.json();
      if (!payData.success) throw new Error(payData.error || "Gagal membuat token pembayaran");

      // 3. Launch midtrans snap
      if (typeof (window as any).snap !== "undefined") {
        (window as any).snap.pay(payData.data.token, {
          onSuccess: function (result: any) {
            cart.clear();
            router.push("/account/orders");
          },
          onPending: function (result: any) {
            cart.clear();
            router.push("/account/orders");
          },
          onError: function (result: any) {
            alert("Pembayaran gagal.");
          },
          onClose: function () {
            // User closed the popup, redirect to orders page to retry later
            cart.clear(); // Cart must be cleared because order is already created
            router.push("/account/orders");
          }
        });
      } else {
        alert("Midtrans script not found.");
      }
    } catch (err: any) {
      alert(err.message || "Terdapat kesalahan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Load saved addresses for logged-in users so they can pick one
  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setMode("new");
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/addresses");
        const json = await res.json();
        if (!active || !json.success) return;
        const list = json.data as SavedAddress[];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.is_default) ?? list[0];
          setMode("saved");
          setSelectedAddressId(def.id);
          applySavedAddress(def);
        }
      } catch {
        /* ignore — user can still fill manually */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function resetShipping() {
    setRates([]);
    setSelectedRate(null);
    setAddressSaved(false);
    setShippingError(null);
  }

  function applySavedAddress(addr: SavedAddress) {
    setForm({
      fullName: addr.full_name,
      phone: addr.phone,
      label: addr.label,
      address: addr.street,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postal_code,
      note: "",
    });
    setFieldErrors({});
    // Picking a different address invalidates a previous shipping quote
    resetShipping();
  }

  function chooseSavedAddress(id: string) {
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setSelectedAddressId(id);
    applySavedAddress(addr);
  }

  function startNewAddress() {
    setMode("new");
    setSelectedAddressId(null);
    setForm(initialForm);
    setFieldErrors({});
    resetShipping();
  }

  if (cart.detailed.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-shell empty-checkout">
          <h1>Checkout</h1>
          <div className="checkout-card center-card">
            <Icon name="cart" size={34} />
            <h2>Your cart is empty</h2>
            <p>Tambahkan produk dulu sebelum checkout.</p>
            <PrimaryButton onClick={() => router.push("/shop")}>Shop Now</PrimaryButton>
          </div>
        </div>
        <CheckoutStyles />
      </main>
    );
  }

  const itemCount = cart.detailed.reduce((sum, item) => sum + item.qty, 0);
  const shippingFee = selectedRate?.fee ?? 0;
  const discount = promoCode.trim() ? Math.min(Math.round(cart.subtotal * 0.05), 25000) : 0;
  const total = cart.subtotal + shippingFee - discount;
  const points = Math.floor(total / 200);
  const canPay = addressSaved && !!selectedRate;

  function updateForm(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    // Editing the destination invalidates the previous shipping rates
    if (addressSaved && (key === "city" || key === "province" || key === "postalCode")) {
      resetShipping();
    }
  }

  async function persistAddressToProfile() {
    // Only for logged-in users entering a brand-new address they opted to save
    if (!user || mode !== "new" || !saveToProfile) return;
    try {
      await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          full_name: form.fullName,
          phone: form.phone,
          street: form.address,
          city: form.city,
          province: form.province,
          postal_code: form.postalCode,
          is_default: savedAddresses.length === 0,
        }),
      });
    } catch {
      /* non-fatal — shipping still calculated */
    }
  }

  async function calculateOngkir() {
    setShippingLoading(true);
    setShippingError(null);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: form.province,
          city: form.city,
          subtotal: cart.subtotal,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal menghitung ongkir");
      const list = (json.data?.rates ?? []) as ShippingRate[];
      if (list.length === 0) throw new Error("Tidak ada layanan pengiriman untuk alamat ini");
      setRates(list);
      setSelectedRate(list[0]);
      setAddressSaved(true);
      // Save the manually-entered address to the user's profile in the background
      void persistAddressToProfile();
    } catch (err) {
      resetShipping();
      setShippingError(err instanceof Error ? err.message : "Gagal menghitung ongkir");
    } finally {
      setShippingLoading(false);
    }
  }

  function saveAddress() {
    const parsed = shippingAddressSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    void calculateOngkir();
  }

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-grid">
          <section className="checkout-main">
            <div className="checkout-card address-card">
              <h2>Alamat Pengiriman</h2>

              {user && savedAddresses.length > 0 && (
                <div className="saved-addr-block">
                  <div className="saved-addr-head">
                    <h3>Pilih alamat tersimpan</h3>
                    <button type="button" className="link-btn" onClick={() => router.push("/account/addresses")}>
                      Kelola alamat
                    </button>
                  </div>
                  <div className="saved-addr-grid">
                    {savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr.id}
                        className={"saved-addr" + (mode === "saved" && selectedAddressId === addr.id ? " active" : "")}
                        onClick={() => {
                          setMode("saved");
                          chooseSavedAddress(addr.id);
                        }}
                      >
                        <span className="saved-addr-top">
                          <span className="saved-addr-label"><Icon name="pinned" size={13} /> {addr.label}</span>
                          {addr.is_default && <span className="saved-addr-default">Default</span>}
                        </span>
                        <strong>{addr.full_name}</strong>
                        <span className="saved-addr-line">{addr.phone}</span>
                        <span className="saved-addr-line">{addr.street}</span>
                        <span className="saved-addr-line">{addr.city}, {addr.province} {addr.postal_code}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={"saved-addr add-new" + (mode === "new" ? " active" : "")}
                      onClick={startNewAddress}
                    >
                      <Icon name="plus" size={20} />
                      <span>Pakai alamat baru</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="inner-card" hidden={user ? mode !== "new" && savedAddresses.length > 0 : false}>
                <h3>Informasi penerima paket</h3>
                <div className="two-col">
                  <Field label="Nama Lengkap Penerima" error={fieldErrors.fullName}>
                    <input type="text" autoComplete="name" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Masukkan nama lengkap" />
                  </Field>
                  <Field label="Nomor handphone" error={fieldErrors.phone}>
                    <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="Masukkan nomor handphone" inputMode="tel" />
                  </Field>
                </div>
                {user && (
                  <button
                    type="button"
                    className="fill-profile-btn"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        fullName: user.profile?.full_name ?? prev.fullName,
                        phone: user.profile?.phone ?? prev.phone,
                      }))
                    }
                  >
                    <Icon name="user" size={14} /> Gunakan data dari profil saya
                  </button>
                )}
                <div className="divider" />

                <h3>Detail Alamat</h3>
                <Field label="Label Alamat" helper="Contoh: Alamat Rumah, Alamat Kantor" error={fieldErrors.label}>
                  <input type="text" value={form.label} onChange={(e) => updateForm("label", e.target.value)} placeholder="Label Alamat" />
                </Field>
                <Field label="Alamat Lengkap" helper="Nama jalan, nomor rumah, RT/RW, kelurahan" error={fieldErrors.address}>
                  <textarea autoComplete="street-address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Contoh: Jl. Melati No. 12, RT 03 RW 05, Kel. Sukamaju" rows={3} />
                </Field>
                <div className="two-col">
                  <Field label="Provinsi" error={fieldErrors.province}>
                    <select
                      className="select-input"
                      autoComplete="address-level1"
                      value={form.province}
                      onChange={(e) => {
                        updateForm("province", e.target.value);
                        // Changing province clears the dependent city selection
                        updateForm("city", "");
                      }}
                    >
                      <option value="">Pilih provinsi</option>
                      {ID_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Kota / Kabupaten" error={fieldErrors.city}>
                    <select
                      className="select-input"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      disabled={!form.province}
                    >
                      <option value="">{form.province ? "Pilih kota / kabupaten" : "Pilih provinsi dulu"}</option>
                      {citiesForProvince(form.province).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Kode Pos" error={fieldErrors.postalCode}>
                  <input type="text" autoComplete="postal-code" value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} placeholder="Contoh: 40123" inputMode="numeric" />
                </Field>
                <Field label="Catatan Pengiriman" helper="Patokan rumah, pesan khusus, dll. (opsional)">
                  <textarea value={form.note} onChange={(e) => updateForm("note", e.target.value)} placeholder="Catatan tambahan untuk kurir pengiriman" rows={3} />
                </Field>

                {user && (
                  <label className="check-row save-toggle">
                    <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} />
                    Simpan alamat ini ke profil saya
                  </label>
                )}

                <p className="terms">Dengan klik “Simpan & Hitung Ongkir” kamu menyetujui <span>Syarat & Ketentuan</span></p>
                <div className="address-actions">
                  <SecondaryButton onClick={() => router.push("/cart")}>Batal</SecondaryButton>
                  <PrimaryButton onClick={saveAddress} disabled={shippingLoading}>{shippingLoading ? "Menghitung..." : "Simpan & Hitung Ongkir"}</PrimaryButton>
                </div>
                {shippingError && (
                  <div className="error-row">
                    <p className="error-text">{shippingError}</p>
                    <button type="button" className="retry-btn" onClick={() => void calculateOngkir()} disabled={shippingLoading}>
                      Coba lagi
                    </button>
                  </div>
                )}
              </div>

              {user && mode === "saved" && savedAddresses.length > 0 && (
                <div className="saved-confirm">
                  {shippingError && <p className="error-text" style={{ marginBottom: 10 }}>{shippingError}</p>}
                  <PrimaryButton onClick={saveAddress} disabled={shippingLoading} block>
                    {shippingLoading ? "Menghitung ongkir..." : addressSaved ? "Ongkir dihitung ✓" : "Kirim ke alamat ini & Hitung Ongkir"}
                  </PrimaryButton>
                </div>
              )}
            </div>

            <div className="checkout-card products-card">
              <h2>Produk yang akan dibeli</h2>
              {!addressSaved ? (
                <div className="info-strip"><Icon name="alert-circle" size={18} /> Isi alamat pengiriman dulu agar kami dapat menghitung estimasi biaya pengiriman</div>
              ) : (
                <>
                  <div className="product-list">
                    {cart.detailed.map((item) => (
                      <div className="checkout-item" key={item.slug + item.size}>
                        <div className="item-thumb">
                          {item.product.images?.[0] ? (
                            <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} fill style={{ objectFit: "cover" }} sizes="64px" />
                          ) : (
                            <Placeholder tone={item.product.tone} paw={false} label="" />
                          )}
                        </div>
                        <div>
                          <strong>{item.product.name}</strong>
                          <span>Size {item.size} • Qty {item.qty}</span>
                        </div>
                        <b>{formatPrice(item.product.price * item.qty)}</b>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {addressSaved && rates.length > 0 && (
              <div className="checkout-card courier-card">
                <h2>Pilih Pengiriman</h2>
                <p className="courier-sub">Pilih kurir dan layanan pengiriman yang kamu mau.</p>
                {selectedRate?.freeShipping && (
                  <div className="info-strip success-strip">🎉 Kamu mendapatkan GRATIS ongkir!</div>
                )}
                <div className="courier-list">
                  {rates.map((rate) => {
                    const key = `${rate.courierCode}-${rate.courierServiceCode}`;
                    const active =
                      selectedRate?.courierCode === rate.courierCode &&
                      selectedRate?.courierServiceCode === rate.courierServiceCode;
                    return (
                      <button
                        type="button"
                        key={key}
                        className={"courier-opt" + (active ? " active" : "")}
                        onClick={() => setSelectedRate(rate)}
                      >
                        <span className="courier-radio" aria-hidden />
                        <CourierLogo code={rate.courierCode} name={rate.courierName} />
                        <span className="courier-info">
                          <strong>{rate.courierName.toUpperCase()} • Reguler</strong>
                          <span>{rate.etd ? `Estimasi ${rate.etd}` : rate.description || "Layanan reguler"}</span>
                        </span>
                        <span className="courier-fee">
                          {rate.freeShipping ? (
                            <>
                              <s>{formatPrice(rate.originalFee)}</s>
                              <b className="free">GRATIS</b>
                            </>
                          ) : (
                            <b>{formatPrice(rate.fee)}</b>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <section className="voucher-section">
              <div className="voucher-head"><h2>Voucher tersedia</h2><button>Selengkapnya</button></div>
              <div className="voucher-row">
                <Voucher title="testPets Member Benefit" code="25%" until="31 Desember 2026" min="Rp250.000" tone="orange" />
                <Voucher title="BUY 3 GET 10%" code="B3G10" until="30 Juni 2026" min="Rp10.000" tone="blue" />
                <Voucher title="Free Gift Grooming" code="PETLOVE" until="30 Juni 2026" min="Rp150.000" tone="white" />
              </div>
            </section>
          </section>

          <aside className="checkout-sidebar">
            <div className="side-card">
              <h2>Diskon</h2>
              <p>Pilih salah satu</p>
              <button className="discount-option" onClick={() => setPromoOpen((v) => !v)}>
                <span className="radio" />
                <span className="tag-icon">🏷</span>
                <strong>{promoCode ? `Promo ${promoCode}` : "Gunakan Kode Promo"}</strong>
                <span className="chev">›</span>
              </button>
              {promoOpen && (
                <div className="promo-box">
                  <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Kode promo" />
                  <p>Demo: isi kode apapun untuk diskon 5% max Rp25.000.</p>
                </div>
              )}
              <div className="points-option">
                <span className="radio" />
                <div>
                  <strong>Gunakan Poin testPets</strong>
                  <div className="points-grid"><span>Total Poin Saya</span><b>Rp 0</b><span>Poin digunakan</span><b className="accent">Rp 0</b></div>
                  <p>Penggunaan poin hanya berlaku jika total pesanan lebih dari Rp10.000</p>
                  <p>Nilai 1 Poin sama dengan 1 Rupiah</p>
                </div>
              </div>
            </div>

            <div className="side-card summary-card">
              <div className="summary-head"><div><h2>Ringkasan Belanja</h2><p>{itemCount} item dalam keranjang</p></div><button onClick={() => router.push("/cart")}>Ubah</button></div>
              <SummaryRow label={`Total Harga (${itemCount} barang)`} value={formatPrice(cart.subtotal)} />
              {selectedRate && <SummaryRow label={`Pengiriman (${selectedRate.courierName.toUpperCase()})`} value={selectedRate.fee === 0 ? "GRATIS" : formatPrice(shippingFee)} />}
              {discount > 0 && <SummaryRow label="Diskon Promo" value={`- ${formatPrice(discount)}`} />}
              <SummaryRow label="Total Biaya" value={formatPrice(cart.subtotal + shippingFee - discount)} />
              <div className="summary-total"><span>Total Tagihan</span><strong>{formatPrice(total)}</strong></div>
              <div className="reward-strip">🎁 Kamu akan mendapatkan <b>{points} testPets Poin</b> dari transaksi ini</div>
              <button className="pay-btn" disabled={!canPay || isProcessing} onClick={handlePayment}>
                {isProcessing ? "Memproses..." : "Lanjutkan ke Pembayaran"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky pay button for mobile */}
      <div className="checkout-sticky-pay">
        <div className="csp-total">
          <span className="csp-label">Total Tagihan</span>
          <span className="csp-value">{formatPrice(total)}</span>
        </div>
        <button
          className="csp-btn"
          disabled={!canPay || isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? "Memproses..." : "Lanjutkan ke Pembayaran"}
        </button>
      </div>

      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      <CheckoutStyles />
    </main>
  );
}

function Field({ label, helper, error, children }: { label: string; helper?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small className="field-error" role="alert">{error}</small> : helper && <small>{helper}</small>}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="summary-row2"><span>{label}</span><strong>{value}</strong></div>;
}

function CourierLogo({ code, name }: { code: string; name: string }) {
  const file: Record<string, string> = {
    jne: "/couriers/jne.png",
    jnt: "/couriers/jnt.png",
    sicepat: "/couriers/sicepat.png",
  };
  const src = file[code];
  if (src) {
    return <Image className="courier-logo-img" src={src} alt={`${code.toUpperCase()} logo`} width={60} height={20} style={{ objectFit: "contain" }} />;
  }
  return <span className="courier-logo generic" aria-label={name}>{(name || code).slice(0, 8).toUpperCase()}</span>;
}

function Voucher({ title, code, until, min, tone }: { title: string; code: string; until: string; min: string; tone: string }) {
  return (
    <article className="voucher-card">
      <div className={`voucher-art ${tone}`}><span>{title}</span><strong>{code}</strong></div>
      <div className="voucher-meta"><span>Berlaku hingga</span><b>{until}</b><span>Minimum transaksi</span><b>{min}</b></div>
    </article>
  );
}

function CheckoutStyles() {
  return (
    <style jsx global>{`
      .checkout-page { background:#f3f5f7; min-height:100vh; padding:28px 0 60px; overflow-x: hidden; width: 100%; max-width: 100%; }
      .checkout-page *, .checkout-page *::before, .checkout-page *::after { box-sizing: border-box; }
      .checkout-shell { width: 100%; max-width: 1240px; margin:0 auto; box-sizing: border-box; padding: 0 16px; overflow-x: hidden; }
      .checkout-title, .checkout-shell h1 { font-size:26px; margin:0 0 20px; font-weight:800; color:#171717; }
      .checkout-grid { display:grid; grid-template-columns:minmax(0, 760px) 390px; gap:56px; align-items:start; width: 100%; max-width: 100%; }
      .checkout-main { display:grid; gap:22px; min-width: 0; max-width: 100%; }
      .checkout-card, .side-card { background:#fff; border:1px solid #dde3ea; border-radius:10px; padding:24px; box-shadow:0 1px 2px rgba(16,24,40,.04); min-width: 0; box-sizing: border-box; max-width: 100%; }
      .checkout-card h2, .side-card h2, .voucher-head h2 { font-size:18px; margin:0 0 16px; font-weight:800; color:#171717; }
      .inner-card { border:1px solid #d8dee6; border-radius:8px; padding:24px; min-width: 0; box-sizing: border-box; }
      .inner-card h3 { font-size:16px; margin:0 0 18px; font-weight:800; }
      .two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; width: 100%; max-width: 100%; }
      .two-col > * { min-width: 0; max-width: 100%; }
      .field { display:grid; gap:8px; margin-bottom:16px; font-size:13px; font-weight:700; color:#222; min-width: 0; max-width: 100%; }
      .field input, .field textarea, .promo-box input { width:100%; max-width:100%; border:1px solid #cfd7e2; border-radius:7px; padding:0 13px; min-height:42px; font:inherit; background:#fff; outline:none; box-sizing: border-box; }
      .field .select-input { width:100%; max-width:100%; border:1px solid #cfd7e2; border-radius:7px; padding:0 13px; min-height:42px; font:inherit; background:#fff; outline:none; cursor:pointer; box-sizing: border-box; }
      .field select { box-sizing: border-box; max-width:100%; }
      .field .select-input:focus { border-color:#f05a28; box-shadow:0 0 0 3px rgba(240,90,40,.12); }
      .field .select-input:disabled { background-color:#f1f3f5; color:#8b95a1; cursor:not-allowed; }
      .field textarea { padding-top:12px; min-height:106px; resize:vertical; }
      .field input:focus, .field textarea:focus, .promo-box input:focus { border-color:#f05a28; box-shadow:0 0 0 3px rgba(240,90,40,.12); }
      .field input:disabled { background:#f1f3f5; color:#8b95a1; }
      .field small, .helper { color:#7a8592; font-size:12px; font-weight:500; margin:0; }
      .field small.field-error { color:#b42318; font-weight:600; }
      .check-row { display:flex; gap:10px; align-items:center; font-size:13px; margin:10px 0 20px; color:#333; }
      .save-toggle { margin:16px 0 4px; font-weight:600; }
      .fill-profile-btn { display:inline-flex; align-items:center; gap:7px; background:#fff3ed; border:1px solid #f6c5ad; color:#c2410c; border-radius:8px; padding:9px 14px; font-weight:700; font-size:13px; cursor:pointer; margin:4px 0 18px; }
      .fill-profile-btn:hover { background:#ffe7d8; }
      .divider { height:1px; background:#e3e7ed; margin:8px 0 22px; }
      .saved-addr-block { margin-bottom:22px; }
      .saved-addr-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
      .saved-addr-head h3 { font-size:15px; margin:0; font-weight:800; }
      .link-btn { border:0; background:none; color:#f05a28; font-weight:700; font-size:13px; cursor:pointer; }
      .saved-addr-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px; }
      .saved-addr { text-align:left; border:1.5px solid #d8dee6; background:#fff; border-radius:10px; padding:14px; display:flex; flex-direction: column; gap:3px; cursor:pointer; font:inherit; transition:border-color .15s, box-shadow .15s; max-width:100%; word-break: break-word; overflow-wrap: break-word; }
      .saved-addr:hover { border-color:#f6a883; }
      .saved-addr.active { border-color:#f05a28; box-shadow:0 0 0 3px rgba(240,90,40,.12); }
      .saved-addr strong { font-size:14px; color:#171717; margin-top:2px; }
      .saved-addr-line { color:#697586; font-size:12.5px; }
      .saved-addr-top { display:flex; justify-content:space-between; align-items:center; }
      .saved-addr-label { display:inline-flex; align-items:center; gap:5px; font-weight:700; color:#f05a28; font-size:12.5px; }
      .saved-addr-default { font-size:10.5px; background:#111; color:#fff; border-radius:999px; padding:2px 9px; font-weight:700; }
      .saved-addr.add-new { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#5f6875; border-style:dashed; min-height:120px; font-weight:700; }
      .saved-addr.add-new.active { color:#f05a28; }
      .saved-confirm { margin-top:18px; }
      .inner-card[hidden] { display:none; }
      .destination-picker { position:relative; }
      .destination-list { position:absolute; z-index:20; left:0; right:0; top:48px; background:#fff; border:1px solid #d8dee6; border-radius:10px; box-shadow:0 12px 30px rgba(15,23,42,.14); max-height:260px; overflow:auto; padding:6px; }
      .destination-list button { width:100%; border:0; background:#fff; text-align:left; padding:10px; border-radius:8px; display:grid; gap:3px; cursor:pointer; }
      .destination-list button:hover, .destination-list button:focus-visible { background:#fff3ed; }
      .destination-list span { color:#697586; font-size:12px; }
      .destination-skel { display:grid; gap:6px; padding:10px; }
      .map-box { height:260px; border:1px solid #d8dee6; border-radius:8px; display:grid; place-items:center; text-align:center; overflow:hidden; background:linear-gradient(135deg,#dfe7df,#eef1f4 45%,#d1ded1); position:relative; }
      .map-box:before { content:""; position:absolute; inset:0; backdrop-filter:blur(2px); background:repeating-linear-gradient(35deg, rgba(255,255,255,.35) 0 10px, rgba(120,150,120,.15) 10px 18px); }
      .map-box > div { position:relative; z-index:1; display:grid; gap:12px; justify-items:center; }
      .map-box p { margin:0; color:#4b5563; font-weight:700; }
      .map-box button { border:1px solid #d7dde5; background:#fff; border-radius:8px; padding:10px 14px; color:#f05a28; font-weight:800; }
      .map-box button:disabled { color:#a0a8b1; }
      .terms { font-size:12px; color:#5f6875; margin:6px 0 18px; }
      .terms span, .accent, .voucher-head button, .summary-total strong, .reward-strip b { color:#f05a28; }
      .address-actions { display:flex; justify-content:flex-end; gap:12px; }
      .error-row { display:flex; align-items:center; gap:14px; margin-top:12px; }
      .error-text { color:#b42318; font-size:13px; margin:0; }
      .retry-btn { border:1px solid #b42318; background:#fff; color:#b42318; border-radius:999px; padding:6px 14px; font-weight:700; font-size:13px; cursor:pointer; }
      .retry-btn:disabled { opacity:.6; cursor:not-allowed; }
      .info-strip { background:#f4f6f8; color:#5f6875; border-radius:8px; padding:14px 16px; display:flex; align-items:center; gap:10px; font-size:14px; }
      .success-strip { background:#fff7ed; color:#9a3412; margin-top:12px; }
      .courier-sub { color:#667085; font-size:13px; margin:-8px 0 16px; }
      .courier-list { display:grid; gap:10px; }
      .courier-opt { display:grid; grid-template-columns:20px 56px 1fr auto; gap:12px; align-items:center; text-align:left; border:1.5px solid #d8dee6; background:#fff; border-radius:10px; padding:14px; cursor:pointer; font:inherit; transition:border-color .15s, box-shadow .15s; max-width:100%; }
      .courier-opt:hover { border-color:#f6a883; }
      .courier-opt.active { border-color:#f05a28; box-shadow:0 0 0 3px rgba(240,90,40,.12); }
      .courier-radio { width:18px; height:18px; border:1.5px solid #a8b0ba; border-radius:50%; position:relative; }
      .courier-opt.active .courier-radio { border-color:#f05a28; }
      .courier-opt.active .courier-radio:after { content:""; position:absolute; inset:3px; border-radius:50%; background:#f05a28; }
      .courier-info { display:grid; gap:3px; min-width:0; }
      .courier-info strong { font-size:13.5px; color:#171717; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .courier-info span { color:#697586; font-size:12.5px; }
      .courier-fee { display:grid; justify-items:end; gap:2px; text-align:right; }
      .courier-fee s { color:#a0a8b1; font-size:12px; }
      .courier-fee b { font-size:14px; color:#171717; }
      .courier-fee b.free { color:#15803d; }
      .courier-logo { width:56px; height:34px; border-radius:6px; display:grid; place-items:center; font-weight:800; font-size:12px; letter-spacing:.2px; border:1px solid #eceff3; overflow:hidden; padding:0 4px; text-align:center; line-height:1; }
      .courier-logo-img { width:56px; height:34px; object-fit:contain; border-radius:6px; border:1px solid #eceff3; background:#fff; padding:3px; }
      .courier-logo.generic { background:#1f2937; color:#fff; font-size:10px; }
      .product-list { display:grid; gap:14px; }
      .checkout-item { display:grid; grid-template-columns:68px 1fr auto; gap:14px; align-items:center; padding:12px; border:1px solid #e2e8f0; border-radius:10px; min-width: 0; max-width:100%; }
      .checkout-item > * { min-width: 0; }
      .item-thumb { position:relative; height:68px; border-radius:8px; overflow:hidden; }
      .checkout-item div:nth-child(2) { display:flex; flex-direction: column; gap:4px; min-width: 0; }
      .checkout-item strong { white-space: normal; word-break: break-word; overflow-wrap: break-word; line-height: 1.3; }
      .checkout-item span, .checkout-item em { color:#667085; font-size:13px; font-style:normal; }
      .checkout-item b { white-space: nowrap; }
      .voucher-section { padding:4px 0 0; }
      .voucher-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
      .voucher-head button { border:0; background:none; font-weight:800; cursor:pointer; }
      .voucher-row { display:flex; gap:14px; overflow-x:auto; padding-bottom:8px; width: 100%; max-width: 100%; }
      .voucher-card { flex:0 0 245px; background:#fff; border:1px solid #d8dee6; border-radius:10px; overflow:hidden; }
      .voucher-art { height:112px; color:#fff; padding:14px; display:grid; align-content:space-between; background:#111; }
      .voucher-art.orange { background:linear-gradient(135deg,#111,#f05a28); }
      .voucher-art.blue { background:linear-gradient(135deg,#123766,#1c88d1); }
      .voucher-art.white { background:linear-gradient(135deg,#f8fafc,#dbeafe); color:#1f2937; }
      .voucher-art strong { font-size:28px; }
      .voucher-meta { padding:12px; display:grid; grid-template-columns:1fr; gap:4px; font-size:12px; }
      .voucher-meta span { color:#7a8592; }
      .checkout-sidebar { position:sticky; top:20px; display:grid; gap:18px; }
      .side-card > p { color:#667085; margin:-8px 0 14px; font-size:13px; }
      .discount-option { width:100%; border:1px solid #d8dee6; background:#fff; border-radius:10px; padding:14px; display:grid; grid-template-columns:20px 28px 1fr 16px; gap:10px; align-items:center; text-align:left; cursor:pointer; }
      .radio { width:16px; height:16px; border:1.5px solid #a8b0ba; border-radius:50%; display:inline-block; }
      .tag-icon { color:#f05a28; }
      .chev { font-size:24px; color:#77808d; }
      .promo-box { margin-top:10px; display:grid; gap:8px; width: 100%; }
      .promo-box p { margin:0; font-size:12px; color:#7a8592; }
      .points-option { margin-top:12px; background:#f7f2eb; border-radius:10px; padding:14px; display:grid; grid-template-columns:20px 1fr; gap:10px; color:#8b95a1; }
      .points-grid { display:grid; grid-template-columns:1fr auto; gap:6px; margin:10px 0; font-size:12px; }
      .points-option p { margin:4px 0 0; font-size:11px; }
      .summary-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
      .summary-head p { margin:2px 0 0; color:#667085; font-size:13px; }
      .summary-head button { border:1px solid #d8dee6; background:#fff; border-radius:999px; padding:6px 14px; font-weight:800; cursor:pointer; }
      .summary-row2 { display:flex; justify-content:space-between; gap:12px; padding:13px 0; border-bottom:1px solid #edf0f3; font-size:14px; }
      .summary-row2 span { color:#4b5563; }
      .summary-total { display:flex; justify-content:space-between; padding:16px 0; font-weight:800; }
      .summary-total strong { font-size:18px; }
      .reward-strip { background:#f4f6f8; border-radius:8px; padding:13px; font-size:13px; color:#4b5563; margin-bottom:16px; }
      .pay-btn { width:100%; height:46px; border:0; border-radius:8px; background:#111; color:#fff; font-weight:800; cursor:pointer; }
      .pay-btn:disabled:not(.loading) { background:#edf0f3; color:#a0a8b1; cursor:not-allowed; }
      .empty-checkout .center-card { display:grid; place-items:center; text-align:center; gap:10px; }
      @media (max-width: 980px) { .checkout-grid { grid-template-columns:minmax(0, 1fr); gap:22px; width: 100%; max-width: 100%; } .checkout-sidebar { position:static; } .two-col { grid-template-columns:1fr; }
        /* .checkout-main has no explicit columns, so its implicit track is an
           auto track — it sizes to max-content and overflows instead of
           clamping to the 358px container. The widest descendants (the voucher
           row and the 35-option province select) dragged the whole form out to
           763px, clipping every field off the right edge. minmax(0, 1fr) lets
           the track shrink to the container. */
        .checkout-main { grid-template-columns: minmax(0, 1fr); }
        /* Bare text buttons — 26-40px tall by default, too small to tap reliably. */
        .voucher-head button { min-height: 44px; padding: 0 4px; margin-right: -4px; }
        .summary-head button { min-height: 44px; padding: 0 10px; margin-right: -10px; }
      }
      @media (max-width: 640px) { .checkout-page { padding-top:18px; } .checkout-card, .side-card, .inner-card { padding:16px; min-width: 0; } .inner-card { border: none; padding: 0; } .inner-card h3 { margin-top: 4px; } .divider { margin: 16px 0; } .checkout-item { grid-template-columns:54px minmax(0,1fr); gap:10px; width: 100%; max-width: 100%; } .checkout-item b { grid-column:2; white-space: nowrap; text-align: right; } .destination-list { max-height:200px; } .courier-opt { grid-template-columns:18px 44px minmax(0,1fr) auto; gap:9px; padding:12px; width: 100%; max-width: 100%; } .courier-logo-img { width:44px; height:28px; } .courier-info strong { font-size:12.5px; } .courier-fee b { font-size:13px; } .saved-addr-head { flex-direction: column; align-items: flex-start; gap: 8px; } .saved-addr-grid { grid-template-columns: 1fr; } }
    `}</style>
  );
}
