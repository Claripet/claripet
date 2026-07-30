"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

type FlyItem = { id: number; from: DOMRect };

type FlyCtx = { flyToCart: (el: HTMLElement) => void };

const FlyToCartContext = createContext<FlyCtx>({ flyToCart: () => {} });

export const useFlyToCart = () => useContext(FlyToCartContext);

/* ── Particle component ────────────────────────── */
function Particle({
  item,
  onDone,
}: {
  item: FlyItem;
  onDone: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const cart = document.querySelector<HTMLElement>('[aria-label="Cart"]');
    if (!cart) {
      onDone(item.id);
      return;
    }
    const to = cart.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (item.from.left + item.from.width / 2);
    const dy =
      to.top + to.height / 2 - (item.from.top + item.from.height / 2);

    // Trigger cart badge bounce
    const badge = cart.querySelector<HTMLElement>(".cart-badge");
    if (badge) {
      badge.classList.remove("cart-pop");
      // Force reflow so the animation re-triggers
      void badge.offsetWidth;
      badge.classList.add("cart-pop");
    }

    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.setProperty("--dx", `${dx}px`);
        ref.current.style.setProperty("--dy", `${dy}px`);
        setActive(true);
      }
    });

    const timer = setTimeout(() => onDone(item.id), 1400); // Wait for animation to finish
    return () => clearTimeout(timer);
    // Single-fire animation: intentionally runs once on mount. The stale closure
    // over `item`/`onDone` is the desired behaviour (the particle never changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="fly-particle"
      style={{
        left: item.from.left + item.from.width / 2,
        top: item.from.top + item.from.height / 2,
        transition: active
          ? "transform 1.2s cubic-bezier(.34, 1.56, .64, 1), opacity 1.1s ease .1s"
          : "none",
        transform: active ? "translate(var(--dx),var(--dy)) scale(.25)" : "scale(1)",
        opacity: active ? 0.3 : 1,
      }}
    />
  );
}

/* ── Provider ──────────────────────────────────── */
export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FlyItem[]>([]);
  const counter = useRef(0);

  const flyToCart = useCallback((el: HTMLElement) => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { id, from: el.getBoundingClientRect() }]);
  }, []);

  return (
    <FlyToCartContext.Provider value={{ flyToCart }}>
      {children}
      {items.map((it) => (
        <Particle
          key={it.id}
          item={it}
          onDone={(id) =>
            setItems((prev) => prev.filter((i) => i.id !== id))
          }
        />
      ))}
    </FlyToCartContext.Provider>
  );
}
