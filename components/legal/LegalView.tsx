import { PageHead } from "@/components/PageHead";

export type LegalSection = { heading: string; body: string[] };

export function LegalView({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro?: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main>
      <PageHead title={title} subtitle={intro} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <article className="legal">
            <p className="legal-updated">Terakhir diperbarui: {updated}</p>
            {sections.map((s, i) => (
              <section key={i} className="legal-block">
                <h2 className="h3">{s.heading}</h2>
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
