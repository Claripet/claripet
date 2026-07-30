"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [progress, setProgress] = useState(0);
  // Persist the IntersectionObserver across navigations to avoid re-creating it
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Track the in-flight progress interval so it can be cleared on unmount even
  // if the link's mouseup/mouseleave never fire (e.g. keyboard navigation).
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialise the scroll-reveal observer once and reuse it.
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observerRef.current?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
    );
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []); // run once

  // Handle route change completion
  useEffect(() => {
    // Complete loading bar
    setProgress(100);
    const loadTimer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);

    // Observe any new reveal elements added by the incoming route after React
    // has committed the DOM. Common visual blocks are auto-marked so pages do
    // not feel static when a component has not been manually annotated.
    setEntering(true);
    const enterTimer = setTimeout(() => setEntering(false), 420);
    const revealTimer = setTimeout(() => {
      if (!observerRef.current) return;
      const selectors = [
        ".reveal",
        ".reveal-left",
        ".reveal-right",
        ".reveal-scale",
        ".section > .wrap",
        ".hero-copy",
        ".hero-media",
        ".trust",
        ".cat-card",
        ".prod-card",
        ".why",
        ".quiz-cta",
        ".card",
        ".faq-card",
        ".inquiry-card",
        ".story-card",
        ".result-card",
        ".collection-banner",
        ".shop-banner",
      ];
      const elements = document.querySelectorAll<HTMLElement>(selectors.join(", "));
      elements.forEach((el, index) => {
        if (!el.classList.contains("reveal") && !el.classList.contains("reveal-left") && !el.classList.contains("reveal-right") && !el.classList.contains("reveal-scale")) {
          el.classList.add("reveal-pop");
        }
        el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
        if (!el.classList.contains("revealed")) observerRef.current!.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(enterTimer);
      clearTimeout(revealTimer);
    };
  }, [pathname]);

  // Intercept all internal Link clicks for instant loader feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only check internal links
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        target.getAttribute("target") !== "_blank" &&
        !e.defaultPrevented &&
        e.button === 0 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        if (href === window.location.pathname) return;

        setLoading(true);
        setProgress(15);

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + (90 - prev) * 0.25;
          });
        }, 100);
        progressIntervalRef.current = interval;

        target.addEventListener("mouseup", () => clearInterval(interval), { once: true });
        target.addEventListener("mouseleave", () => clearInterval(interval), { once: true });
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "3px",
            backgroundColor: "var(--pink)",
            boxShadow: "0 0 8px rgba(245, 205, 211, 0.8)",
            zIndex: 99999,
            transform: `scaleX(${progress / 100})`,
            transformOrigin: "left",
            transition: progress === 100 ? "transform 0.2s ease, opacity 0.2s ease 0.1s" : "transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)",
            opacity: progress === 100 ? 0 : 1,
          }}
        />
      )}
      <div className={"page-transition" + (entering ? " page-entering" : "")}>
        {children}
      </div>
    </>
  );
}
