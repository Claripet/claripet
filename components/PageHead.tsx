
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
    <div className={"page-head wrap"}>
      <h1 className="h1">{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  );
}
