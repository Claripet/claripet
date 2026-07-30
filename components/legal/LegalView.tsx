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
            <p className="legal-updated">Last updated: {updated}</p>
            {sections.map((s, i) => (
              <section key={i} className="legal-block">
                <h2 className="h3">{s.heading}</h2>
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
            <p className="legal-note">
              This is placeholder legal copy provided for layout purposes. Final, reviewed text will
              be supplied separately.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
