"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Placeholder } from "@/components/Placeholder";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function ArticleView({
  article,
  more = [],
}: {
  article: Article;
  more?: Article[];
}) {
  const router = useRouter();

  return (
    <main>
      <Breadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Journal", href: "/journal" }, { label: article.title }]}
      />
      <article className="wrap article-detail">
        <div className="meta muted" style={{ display: "flex", gap: 10, fontSize: 14, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: "var(--navy)" }}>{article.category}</span>
          <span>·</span>
          <span>{article.readTime} read</span>
        </div>
        <h1 className="h1">{article.title}</h1>
        <div className="hero-img" style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden" }}>
          {article.image ? (
            <Image
              src={article.image}
              alt=""
              fill
              priority
              sizes="(max-width: 860px) 100vw, 800px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Placeholder tone={article.tone} label={article.title} />
          )}
        </div>
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {article.sections.map((s, i) => (
          <Fragment key={i}>
            <h3 className="h3">{s.h}</h3>
            <p>{s.p}</p>
          </Fragment>
        ))}
        <div
          style={{
            marginTop: 36,
            padding: 28,
            background: "var(--sky-50)",
            borderRadius: "var(--r-lg)",
            textAlign: "center",
          }}
        >
          <h3 className="h3" style={{ marginBottom: 10 }}>
            Ready to give it a try?
          </h3>
          <p className="muted" style={{ marginBottom: 20 }}>
            Explore gentle, pet-safe products made for moments like these.
          </p>
          <PrimaryButton icon="arrowRight" onClick={() => router.push("/shop")}>
            Shop ClariPet
          </PrimaryButton>
        </div>
      </article>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h3">More from the journal</h2>
          </div>
          <div className="article-list" style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {more.map((a) => (
              <article
                className="article-row"
                key={a.slug}
                style={{ flex: "1 1 280px" }}
                onClick={() => router.push(`/journal/${a.slug}`)}
              >
                <div className="thumb">
                  <Placeholder tone={a.tone} paw={false} label="" />
                </div>
                <div>
                  <div className="meta">
                    <span>{a.category}</span>
                    <span>· {a.readTime}</span>
                  </div>
                  <h4>{a.title}</h4>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
