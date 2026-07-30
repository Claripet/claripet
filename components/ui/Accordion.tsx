"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({ items, defaultOpen = 0 }: { items: AccordionItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      {items.map((it, i) => (
        <div key={i} className={"acc-item" + (open === i ? " open" : "")}>
          <button className="acc-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            {it.title}
            <span className="chev">
              <Icon name="chevDown" size={20} />
            </span>
          </button>
          <div className="acc-body">
            <div>{it.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
