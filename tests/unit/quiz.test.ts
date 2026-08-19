import { describe, it, expect } from "vitest";
import { PRODUCTS } from "@/data/products";
import { COMING_SOON, SKIN_DISCLAIMER, buildSteps, recommend, resultHeading, type Answers } from "@/data/quiz";

const slugs = (a: Answers) => {
  const r = recommend(a);
  return [r.primary, ...r.companions].filter(Boolean).map((ref) => ref!.slug);
};
const stepKeys = (a: Answers) => buildSteps(a).map((s) => s.key);

describe("buildSteps", () => {
  it("stops after the age question when the pet is under 2 months", () => {
    expect(stepKeys({ pet: "dog", age: "under2m" })).toEqual(["pet", "age"]);
  });

  it("asks the needs question once a valid age is given", () => {
    expect(stepKeys({ pet: "dog", age: "1to7y" })).toEqual(["pet", "age", "needs"]);
  });

  it("only asks follow-ups for the needs that were picked", () => {
    expect(stepKeys({ pet: "cat", age: "1to7y", needs: ["scent"] })).toEqual([
      "pet",
      "age",
      "needs",
      "scent",
      "petName",
    ]);
  });

  it("asks the Gentle Wash size question only when Gentle Wash is the answer", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["bath"] };
    expect(stepKeys({ ...base, bath: "clean" })).toContain("gentleSize");
    expect(stepKeys({ ...base, bath: "unsure" })).toContain("gentleSize");
    expect(stepKeys({ ...base, bath: "beauty" })).not.toContain("gentleSize");
  });

  it("asks a scent sub-question only for the sweet and floral branches", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["scent"] };
    expect(stepKeys({ ...base, scent: "sweet" })).toContain("scentSweet");
    expect(stepKeys({ ...base, scent: "floral" })).toContain("scentFloral");
    expect(stepKeys({ ...base, scent: "warm" })).not.toContain("scentSweet");
    expect(stepKeys({ ...base, scent: "warm" })).not.toContain("scentFloral");
  });

  it("asks the odour scent only when Pet Odor Remover is recommended", () => {
    const base: Answers = { pet: "dog", age: "1to7y", needs: ["behavior"] };
    expect(stepKeys({ ...base, behavior: "potty" })).toContain("odorScent");
    expect(stepKeys({ ...base, behavior: "odor" })).toContain("odorScent");
    expect(stepKeys({ ...base, behavior: "chew" })).not.toContain("odorScent");
  });

  it("orders follow-ups A-F regardless of the order the needs were tapped", () => {
    const tapped: Answers = { pet: "dog", age: "1to7y", needs: ["scent", "bath"], bath: "beauty" };
    expect(stepKeys(tapped)).toEqual(["pet", "age", "needs", "bath", "scent", "petName"]);
  });

  it("runs 5 screens at its shortest", () => {
    // pet + age + needs + one follow-up + name — the spec's lower bound.
    const shortest: Answers = { pet: "dog", age: "1to7y", needs: ["coat"], coat: "spray" };
    expect(buildSteps(shortest)).toHaveLength(5);
  });

  it("runs 8 screens at its longest", () => {
    // Two needs that each open a sub-question: pet + age + needs + 2x2 + name.
    // The spec quotes "sekitar 5-7 layar", but its own branch definitions make
    // 8 unavoidable in this case; every screen here is one the spec requires.
    const longest: Answers = {
      pet: "dog",
      age: "1to7y",
      needs: ["bath", "behavior"],
      bath: "clean",
      gentleSize: "500",
      behavior: "potty",
      odorScent: "sereh",
    };
    expect(buildSteps(longest)).toHaveLength(8);
  });
});

describe("recommend", () => {
  it("returns nothing at all for a pet under 2 months", () => {
    const r = recommend({ pet: "dog", age: "under2m", needs: ["bath"], bath: "clean" });
    expect(r.primary).toBeUndefined();
    expect(r.companions).toEqual([]);
  });

  it("never returns more than three products", () => {
    const r = recommend({
      pet: "dog",
      age: "1to7y",
      needs: ["face", "scent"],
      face: ["all"],
      scent: "warm",
    });
    expect([r.primary, ...r.companions].filter(Boolean)).toHaveLength(3);
  });

  it("leads with the first need that was picked", () => {
    const skinFirst = recommend({
      pet: "cat",
      age: "1to7y",
      needs: ["skin", "scent"],
      skin: "wound",
      scent: "warm",
    });
    expect(skinFirst.primary?.slug).toBe("claripet-skin-guard-silver-heal");

    const scentFirst = recommend({
      pet: "cat",
      age: "1to7y",
      needs: ["scent", "skin"],
      skin: "wound",
      scent: "warm",
    });
    expect(scentFirst.primary?.slug).toBe("claripet-warm-vanilla");
  });

  it("maps the bath branch per the spec, defaulting an unsure size to 250ml", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["bath"] };
    expect(recommend({ ...base, bath: "beauty" }).primary?.slug).toBe(
      "claripet-vitabulu-beauty-shampoo",
    );
    expect(recommend({ ...base, bath: "clean", gentleSize: "500" }).primary).toMatchObject({
      slug: "claripet-gentle-wash-shampoo",
      size: "500ml",
    });
    expect(recommend({ ...base, bath: "unsure", gentleSize: "unsure" }).primary).toMatchObject({
      slug: "claripet-gentle-wash-shampoo",
      size: "250ml",
    });
  });

  it("maps the skin branch and always attaches the veterinary disclaimer", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["skin"] };
    expect(slugs({ ...base, skin: "sensitive" })).toEqual(["claripet-gentle-wash-shampoo"]);
    expect(slugs({ ...base, skin: "fungal" })).toEqual([
      "claripet-skin-guard-fungal-spray",
      "claripet-gentle-wash-shampoo",
    ]);
    expect(slugs({ ...base, skin: "mites" })).toEqual([
      "claripet-gentle-wash-shampoo",
      "scabies-spray",
    ]);
    expect(slugs({ ...base, skin: "wound" })).toEqual(["claripet-skin-guard-silver-heal"]);

    for (const skin of ["sensitive", "fungal", "mites", "wound"] as const) {
      expect(recommend({ ...base, skin }).disclaimers).toEqual([SKIN_DISCLAIMER]);
    }
  });

  it("adds no disclaimer when skin was not one of the needs", () => {
    expect(recommend({ pet: "cat", age: "1to7y", needs: ["scent"], scent: "warm" }).disclaimers).toEqual([]);
  });

  it("maps the coat branch, with Beauty Powder as a primary in its own right", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["coat"] };
    expect(recommend({ ...base, coat: "oil" }).primary).toMatchObject({
      slug: "salmon-oil",
      comingSoon: true,
    });
    expect(recommend({ ...base, coat: "powder" }).primary?.slug).toBe(
      "claripet-vitabulu-beauty-powder",
    );
    expect(recommend({ ...base, coat: "spray" }).primary?.slug).toBe("claripet-vitabulu-spray");
    expect(recommend({ ...base, coat: "shampoo" }).primary?.slug).toBe(
      "claripet-vitabulu-beauty-shampoo",
    );
  });

  it("returns one product per selected face area, and all three for Semuanya", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["face"] };
    expect(slugs({ ...base, face: ["ears", "mouth"] })).toEqual([
      "claripet-magic-ear-cleaner",
      "claripet-breath",
    ]);
    expect(slugs({ ...base, face: ["all"] })).toEqual([
      "claripet-tear-stain-remover",
      "claripet-magic-ear-cleaner",
      "claripet-breath",
    ]);
  });

  it("maps the scent branch through its sub-questions", () => {
    const base: Answers = { pet: "cat", age: "1to7y", needs: ["scent"] };
    expect(recommend({ ...base, scent: "clean" }).primary?.slug).toBe("claripet-smell-clean");
    expect(recommend({ ...base, scent: "warm" }).primary?.slug).toBe("claripet-warm-vanilla");
    expect(recommend({ ...base, scent: "sweet", scentSweet: "babyPowder" }).primary?.slug).toBe(
      "claripet-baby-powder",
    );
    expect(recommend({ ...base, scent: "sweet", scentSweet: "milkyMoo" }).primary?.slug).toBe(
      "claripet-milky-moo",
    );
    expect(recommend({ ...base, scent: "floral", scentFloral: "botanica" }).primary?.slug).toBe(
      "claripet-botanica-bloom",
    );
    expect(recommend({ ...base, scent: "floral", scentFloral: "fruity" }).primary).toMatchObject({
      slug: "fruity-fresh",
      comingSoon: true,
    });
  });

  it("picks the Shu Shu variant from the dog/cat answer", () => {
    const base: Answers = { age: "1to7y", needs: ["behavior"], behavior: "chew" };
    expect(recommend({ ...base, pet: "dog" }).primary?.slug).toBe("claripet-shu-shu-dog");
    expect(recommend({ ...base, pet: "cat" }).primary?.slug).toBe("claripet-shu-shu-cat");
  });

  it("pairs Shu Shu with Pet Odor Remover for indoor accidents", () => {
    const base: Answers = { pet: "dog", age: "1to7y", needs: ["behavior"], behavior: "potty" };
    expect(slugs(base)).toEqual(["claripet-shu-shu-dog", "claripet-pet-odor-remover-fresh"]);
    expect(slugs({ ...base, odorScent: "sereh" })).toEqual([
      "claripet-shu-shu-dog",
      "claripet-pet-odor-remover-sereh",
    ]);
    // "Pilihkan untuk saya" falls back to Fresh.
    expect(slugs({ ...base, odorScent: "unsure" })).toEqual([
      "claripet-shu-shu-dog",
      "claripet-pet-odor-remover-fresh",
    ]);
  });

  it("recommends only the odour remover when the problem is smell alone", () => {
    expect(slugs({ pet: "cat", age: "1to7y", needs: ["behavior"], behavior: "odor" })).toEqual([
      "claripet-pet-odor-remover-fresh",
    ]);
  });

  it("does not list the same product twice when two needs overlap", () => {
    const r = slugs({
      pet: "cat",
      age: "1to7y",
      needs: ["bath", "coat"],
      bath: "beauty",
      coat: "shampoo",
    });
    expect(r).toEqual(["claripet-vitabulu-beauty-shampoo"]);
  });

  it("only ever names catalogue slugs or declared coming-soon placeholders", () => {
    const known = new Set(PRODUCTS.map((p) => p.slug));
    const answers: Answers[] = [
      { pet: "dog", age: "1to7y", needs: ["bath"], bath: "clean", gentleSize: "500" },
      { pet: "dog", age: "1to7y", needs: ["skin"], skin: "mites" },
      { pet: "dog", age: "1to7y", needs: ["coat"], coat: "oil" },
      { pet: "dog", age: "1to7y", needs: ["face"], face: ["all"] },
      { pet: "dog", age: "1to7y", needs: ["scent"], scent: "floral", scentFloral: "fruity" },
      { pet: "cat", age: "1to7y", needs: ["behavior"], behavior: "potty", odorScent: "sereh" },
    ];
    for (const a of answers) {
      for (const ref of [recommend(a).primary, ...recommend(a).companions]) {
        if (!ref) continue;
        expect(ref.comingSoon ? Object.keys(COMING_SOON) : [...known]).toContain(ref.slug);
      }
    }
  });

  it("only asks for a size the catalogue actually carries", () => {
    const gentleWash = PRODUCTS.find((p) => p.slug === "claripet-gentle-wash-shampoo")!;
    expect(gentleWash.sizes).toContain("250ml");
    expect(gentleWash.sizes).toContain("500ml");
  });
});

describe("resultHeading", () => {
  it("uses the pet name when one was given", () => {
    expect(resultHeading("Mochi").title).toBe("Rekomendasi untuk Mochi Sudah Siap!");
    expect(resultHeading("Mochi").subtitle).toContain("Mochi");
  });

  it("falls back to the generic wording when the name is skipped or blank", () => {
    for (const name of [undefined, "", "   "]) {
      expect(resultHeading(name).title).toBe("Rekomendasi untuk Anabulmu Sudah Siap!");
    }
  });
});
