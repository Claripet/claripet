"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/data/categories";
import { Icon } from "@/components/icons";
import { SOCIAL_LINKS } from "@/lib/social";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: "1rem" }}>
              <Image src="/brand/logo-light.png" alt="ClariPet" width={140} height={46} className="object-contain" />
            </div>
            <p className="footer-blurb" style={{ fontWeight: 500, marginBottom: 8, color: "#fff" }}>
              Helping You Help Them.
            </p>
            <p className="footer-blurb">
              Merawat hewan peliharaan seharusnya tidak terasa rumit.
            </p>
            {/*
              These were href="#" placeholders, which rendered three dead
              buttons and gave the site no outbound link to the profiles it
              shares an identity with. The URLs live in lib/social.ts so they
              stay in sync with the Organization `sameAs` on the home page.

              Facebook is intentionally absent: no ClariPet Facebook page has
              been confirmed, and an icon pointing at the wrong page is worse
              than no icon. Add it to SOCIAL_LINKS and restore it here once the
              real URL is known.
            */}
            <div className="socials">
              <a
                className="social"
                href={SOCIAL_LINKS.instagram}
                aria-label="ClariPet on Instagram"
                target="_blank"
                rel="noopener noreferrer me"
              >
                <Icon name="instagram" size={18} />
              </a>
              <a
                className="social"
                href={SOCIAL_LINKS.tiktok}
                aria-label="ClariPet on TikTok"
                target="_blank"
                rel="noopener noreferrer me"
              >
                <Icon name="tiktok" size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/shop">All Products</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/journal">Pet Care Journal</Link></li>
              <li><Link href="/reviews">Reviews</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping & Delivery</Link></li>
              <li><Link href="/returns">Returns & Refunds</Link></li>
              <li><Link href="/account/orders">Track Order</Link></li>
            </ul>
            <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
              <input placeholder="Email Anda" aria-label="Email for newsletter" type="email" />
              <button type="submit">Berlangganan</button>
            </form>
          </div>
        </div>
        <div className="footer-bar">
          <span>&copy; {new Date().getFullYear()} ClariPet. Semua hak cipta dilindungi.</span>
          <span className="footer-legal">
            <Link href="/privacy-policy">Kebijakan Privasi</Link>
            <span className="sep">&middot;</span>
            <Link href="/terms">Syarat & Ketentuan</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

