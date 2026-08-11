'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DECOR_SVGS } from '@/lib/decor';

const PASTELS = [
  'var(--pink)', 
  'var(--sky)', 
  'var(--sage)', 
  'var(--peach)', 
  'var(--lavender)',
  'var(--cream)'
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// 8 defined non-overlapping regions (mostly edges and corners) to prevent clustering
const SLOTS = [
  { top: 5, left: 5 },     // Top Left
  { top: 45, left: 2 },    // Mid Left
  { top: 85, left: 8 },    // Bottom Left
  { top: 8, left: 88 },    // Top Right
  { top: 50, left: 94 },   // Mid Right
  { top: 85, left: 90 },   // Bottom Right
  { top: 2, left: 30 },    // Top Center-ish
  { top: 95, left: 70 },   // Bottom Center-ish
];

function SectionDecor() {
  const [icons, setIcons] = useState<any[]>([]);

  useEffect(() => {
    // Generate 2-4 icons per section (fewer icons for a cleaner look)
    const count = Math.floor(random(2, 5));
    
    // Shuffle our pre-defined slots and pick 'count' amount to guarantee no overlaps
    const shuffledSlots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, count);
    
    const newIcons = shuffledSlots.map((slot) => {
      const svg = DECOR_SVGS[Math.floor(Math.random() * DECOR_SVGS.length)];
      const color = PASTELS[Math.floor(Math.random() * PASTELS.length)];
      
      // Add a tiny bit of random jitter so it doesn't look totally robotic
      const top = slot.top + random(-3, 3);
      const left = slot.left + random(-3, 3);
      
      // Keep sizes elegant (48px to 96px)
      const size = random(48, 96);
      
      // Less extreme rotation (between -30 and 30 degrees) looks much more natural
      const rotate = random(-30, 30);
      return { svg, color, top, left, size, rotate };
    });
    setIcons(newIcons);
  }, []);

  if (icons.length === 0) return null;

  return (
    <div 
      className="global-decor-wrapper"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        overflow: 'hidden', 
        zIndex: 0 
      }}
    >
      {icons.map((icon, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${icon.top}%`,
            left: `${icon.left}%`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            backgroundColor: icon.color,
            maskImage: `url(${icon.svg})`,
            WebkitMaskImage: `url(${icon.svg})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            transform: `rotate(${icon.rotate}deg)`,
            opacity: 0.7, // Softly visible behind content
            zIndex: 0
          }}
        />
      ))}
    </div>
  );
}

export function GlobalDecor() {
  const [sections, setSections] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const update = () => {
      // Find all sections
      const els = Array.from(document.querySelectorAll('section'));
      els.forEach(el => {
        const pos = window.getComputedStyle(el).position;
        if (pos === 'static') {
          el.style.position = 'relative';
        }
      });
      setSections(els);
    };
    
    // Initial run
    update();
    
    // MutationObserver to catch dynamically added sections
    const obs = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          m.addedNodes.forEach(node => {
            if (node.nodeName === 'SECTION' || (node as Element).querySelector?.('section')) {
              shouldUpdate = true;
            }
          });
        }
      }
      if (shouldUpdate) update();
    });
    
    obs.observe(document.body, { childList: true, subtree: true });
    
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {sections.map((s, i) => createPortal(<SectionDecor key={i} />, s))}
    </>
  );
}
