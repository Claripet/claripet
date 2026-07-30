export function PageHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-head wrap">
      <h1 className="h1">{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  );
}
