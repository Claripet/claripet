import { SectionDoodles } from "@/components/DecorIcons";

export function PageHead({
  title,
  subtitle,
  // The purchase flow opts out — nothing should compete with the cart contents.
  decor = true,
}: {
  title: string;
  subtitle?: string;
  decor?: boolean;
}) {
  return (
    <div className={"page-head wrap" + (decor ? " section-doodles" : "")}>
      {decor && <SectionDoodles marks={["paw-mini", "sparkle-soft", "heart-small", "trail-tiny"]} />}
      <h1 className="h1">{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  );
}
