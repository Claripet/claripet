import { Fragment } from "react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <div className="breadcrumb wrap">
      {trail.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span className="cur">{t.label}</span>}
        </Fragment>
      ))}
    </div>
  );
}
