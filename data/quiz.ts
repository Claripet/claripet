/**
 * Quiz ClariPet — branching product finder.
 *
 * Everything the quiz UI needs lives here as plain data and pure functions, so
 * `components/quiz/Quiz.tsx` only has to render whatever `buildSteps` hands it.
 * The flow, the wording and the answer→product mappings all come from the
 * "Kuis ClariPet" spec.
 */

export type PetKey = "dog" | "cat";
export type AgeKey = "under2m" | "2to12m" | "1to7y" | "over7y";
export type NeedKey = "bath" | "skin" | "coat" | "face" | "scent" | "behavior";
export type FaceKey = "eyes" | "ears" | "mouth" | "all";

export interface Answers {
  pet?: PetKey;
  age?: AgeKey;
  /** Ordered by tap order — the first pick drives the primary recommendation. */
  needs?: NeedKey[];
  bath?: "clean" | "beauty" | "unsure";
  gentleSize?: "250" | "500" | "unsure";
  skin?: "sensitive" | "fungal" | "mites" | "wound";
  coat?: "oil" | "powder" | "spray" | "shampoo";
  face?: FaceKey[];
  scent?: "clean" | "sweet" | "warm" | "floral";
  scentSweet?: "babyPowder" | "milkyMoo";
  scentFloral?: "botanica" | "fruity";
  behavior?: "chew" | "potty" | "area" | "odor";
  odorScent?: "fresh" | "sereh" | "unsure";
  petName?: string;
}

export type AnswerKey = keyof Answers;

interface Option {
  value: string;
  label: string;
  /** Clears every other selection in a multi-select when picked. */
  exclusive?: boolean;
}

export type Step =
  | { kind: "single"; key: AnswerKey; q: string; hint?: string; options: Option[] }
  | { kind: "multi"; key: AnswerKey; q: string; hint?: string; max: number; options: Option[] }
  | { kind: "text"; key: AnswerKey; q: string; hint?: string; placeholder: string; skipLabel: string };

/* ---------------------------------------------------------------- copy --- */

export const INTRO = {
  title: "Kuis ClariPet",
  body: "Jawab beberapa pertanyaan singkat, lalu kami akan membantu memilihkan produk ClariPet yang paling sesuai untuk anabulmu.",
  perks: ["100% Gratis", "2 Menit Saja", "Tanpa Daftar"],
  cta: "Mulai Kuis",
};

export const TOO_YOUNG = {
  title: "Anabulmu Masih Terlalu Kecil",
  body: [
    "Untuk anabul berusia di bawah 2 bulan, kami tidak menyarankan penggunaan produk perawatan atau suplemen hewan apa pun, kecuali memang diperlukan dan digunakan atas arahan atau pengawasan dokter hewan.",
    "Kondisi setiap anabul dapat berbeda. Konsultasikan terlebih dahulu dengan dokter hewan sebelum menggunakan produk apa pun.",
  ],
  cta: "Kembali ke Awal",
};

export const SKIN_DISCLAIMER =
  "Rekomendasi ini ditujukan untuk membantu perawatan harian dan bukan sebagai diagnosis atau pengganti pemeriksaan dokter hewan. Jika kondisi kulit menyebar, memburuk, bernanah, atau tidak kunjung membaik, segera konsultasikan dengan dokter hewan.";

export function resultHeading(petName?: string) {
  const name = petName?.trim();
  return name
    ? {
        title: `Rekomendasi untuk ${name} Sudah Siap!`,
        subtitle: `Berdasarkan jawabanmu, berikut produk ClariPet yang paling sesuai untuk membantu kebutuhan ${name}.`,
      }
    : {
        title: "Rekomendasi untuk Anabulmu Sudah Siap!",
        subtitle:
          "Berdasarkan jawabanmu, berikut produk ClariPet yang paling sesuai dengan kebutuhan anabulmu.",
      };
}

/* ------------------------------------------------- coming-soon products --- */

/**
 * Products the spec maps to but that the catalogue does not carry yet. They are
 * deliberately kept out of `data/products.ts`: anything added there also shows
 * up in /shop, the category pages, BEST_SELLERS and the sitemap. Here they only
 * render as a "Segera Hadir" card with no purchase button. When a real SKU
 * lands, delete the entry and point the ref at its slug instead.
 */
export const COMING_SOON: Record<string, { name: string; subtitle: string }> = {
  "salmon-oil": {
    name: "ClariPet Salmon Oil",
    subtitle: "Nutrisi berbentuk minyak yang dicampurkan ke makanan.",
  },
  "fruity-fresh": {
    name: "ClariPet Fruity Fresh",
    subtitle: "Aroma buah-buahan yang segar dan ceria.",
  },
  "scabies-spray": {
    name: "ClariPet Skin Guard Scabies Spray",
    subtitle: "Perawatan kulit untuk masalah tungau dan kutu.",
  },
};

/* ---------------------------------------------------------------- steps --- */

const NEED_LABELS: Record<NeedKey, string> = {
  bath: "Mandi dan perawatan tubuh",
  skin: "Kulit yang bermasalah",
  coat: "Bulu dan nutrisi",
  face: "Mata, telinga, atau mulut",
  scent: "Aroma tubuh",
  behavior: "Perilaku atau bau di rumah",
};

/** Follow-ups are asked in this order regardless of tap order. */
const NEED_ORDER: NeedKey[] = ["bath", "skin", "coat", "face", "scent", "behavior"];

const STEP_PET: Step = {
  kind: "single",
  key: "pet",
  q: "Anabulmu anjing atau kucing?",
  options: [
    { value: "dog", label: "Anjing" },
    { value: "cat", label: "Kucing" },
  ],
};

const STEP_AGE: Step = {
  kind: "single",
  key: "age",
  q: "Berapa usia anabulmu?",
  options: [
    { value: "under2m", label: "Di bawah 2 bulan" },
    { value: "2to12m", label: "2–12 bulan" },
    { value: "1to7y", label: "1–7 tahun" },
    { value: "over7y", label: "Di atas 7 tahun" },
  ],
};

const STEP_NEEDS: Step = {
  kind: "multi",
  key: "needs",
  q: "Apa yang paling ingin kamu bantu rawat?",
  hint: "Pilih maksimal dua",
  max: 2,
  options: NEED_ORDER.map((value) => ({ value, label: NEED_LABELS[value] })),
};

const STEP_BATH: Step = {
  kind: "single",
  key: "bath",
  q: "Apa kebutuhan utama anabulmu saat mandi?",
  options: [
    { value: "clean", label: "Membersihkan tubuh dengan lembut" },
    { value: "beauty", label: "Merawat bulu agar lebih lembut dan terawat" },
    { value: "unsure", label: "Belum yakin, pilihkan untuk saya" },
  ],
};

const STEP_GENTLE_SIZE: Step = {
  kind: "single",
  key: "gentleSize",
  q: "Ukuran mana yang paling sesuai?",
  options: [
    { value: "250", label: "250 ml, untuk mencoba atau pemakaian pribadi" },
    { value: "500", label: "500 ml, lebih hemat untuk pemakaian rutin" },
    { value: "unsure", label: "Belum yakin, pilihkan untuk saya" },
  ],
};

const STEP_SKIN: Step = {
  kind: "single",
  key: "skin",
  q: "Kondisi mana yang paling sesuai?",
  options: [
    { value: "sensitive", label: "Kulit sensitif, gatal, atau mudah iritasi" },
    { value: "fungal", label: "Ada tanda-tanda jamur" },
    { value: "mites", label: "Ada tanda-tanda tungau / kutu" },
    { value: "wound", label: "Ada luka ringan atau bagian kulit yang perlu dirawat" },
  ],
};

const STEP_COAT: Step = {
  kind: "single",
  key: "coat",
  q: "Perawatan seperti apa yang kamu cari?",
  options: [
    { value: "oil", label: "Nutrisi berbentuk minyak yang dicampurkan ke makanan" },
    { value: "powder", label: "Nutrisi berbentuk bubuk yang dicampurkan ke makanan" },
    { value: "spray", label: "Spray untuk merawat bulu dari luar" },
    { value: "shampoo", label: "Perawatan bulu saat mandi" },
  ],
};

const STEP_FACE: Step = {
  kind: "multi",
  key: "face",
  q: "Bagian mana yang membutuhkan perawatan?",
  hint: "Pilih maksimal dua",
  max: 2,
  options: [
    { value: "eyes", label: "Area mata dan noda air mata" },
    { value: "ears", label: "Kebersihan telinga" },
    { value: "mouth", label: "Bau mulut dan kebersihan gigi" },
    { value: "all", label: "Semuanya", exclusive: true },
  ],
};

const STEP_SCENT: Step = {
  kind: "single",
  key: "scent",
  q: "Aroma seperti apa yang kamu sukai?",
  options: [
    { value: "clean", label: "Bersih dan segar" },
    { value: "sweet", label: "Lembut dan manis" },
    { value: "warm", label: "Hangat dan elegan" },
    { value: "floral", label: "Floral atau fruity" },
  ],
};

const STEP_SCENT_SWEET: Step = {
  kind: "single",
  key: "scentSweet",
  q: "Kamu lebih menyukai aroma yang mana?",
  options: [
    { value: "babyPowder", label: "Seperti bedak bayi" },
    { value: "milkyMoo", label: "Lembut dan creamy" },
  ],
};

const STEP_SCENT_FLORAL: Step = {
  kind: "single",
  key: "scentFloral",
  q: "Kamu lebih menyukai aroma yang mana?",
  options: [
    { value: "botanica", label: "Floral yang lembut" },
    { value: "fruity", label: "Buah-buahan yang segar" },
  ],
};

const STEP_BEHAVIOR: Step = {
  kind: "single",
  key: "behavior",
  q: "Apa masalah utamanya?",
  options: [
    { value: "chew", label: "Menggigit atau mencakar barang" },
    { value: "potty", label: "Buang air di tempat yang tidak seharusnya" },
    { value: "area", label: "Masuk atau naik ke area tertentu" },
    { value: "odor", label: "Bau urine, kandang, atau bau tidak sedap" },
  ],
};

const STEP_ODOR_SCENT: Step = {
  kind: "single",
  key: "odorScent",
  q: "Aroma mana yang kamu pilih?",
  options: [
    { value: "fresh", label: "Segar" },
    { value: "sereh", label: "Sereh" },
    { value: "unsure", label: "Pilihkan untuk saya" },
  ],
};

const STEP_NAME: Step = {
  kind: "text",
  key: "petName",
  q: "Siapa nama anabulmu?",
  placeholder: "Masukkan nama anabul",
  skipLabel: "Lewati",
};

/** True when the bath branch lands on Gentle Wash, which then needs a size. */
function bathPicksGentleWash(a: Answers) {
  return a.bath === "clean" || a.bath === "unsure";
}

/** True when the behaviour branch pulls in Pet Odor Remover, which needs a scent. */
function behaviorPicksOdorRemover(a: Answers) {
  return a.behavior === "potty" || a.behavior === "odor";
}

/**
 * The step list for the current answers. Recomputed on every change, which is
 * what keeps branching, back-navigation and "Langkah X dari N" consistent
 * without a separate state machine.
 */
export function buildSteps(a: Answers): Step[] {
  const steps: Step[] = [STEP_PET, STEP_AGE];

  // Under 2 months stops the quiz outright — no further questions, no products.
  if (!a.age || a.age === "under2m") return steps;

  steps.push(STEP_NEEDS);
  const needs = a.needs ?? [];
  if (needs.length === 0) return steps;

  for (const need of NEED_ORDER) {
    if (!needs.includes(need)) continue;
    switch (need) {
      case "bath":
        steps.push(STEP_BATH);
        if (bathPicksGentleWash(a)) steps.push(STEP_GENTLE_SIZE);
        break;
      case "skin":
        steps.push(STEP_SKIN);
        break;
      case "coat":
        steps.push(STEP_COAT);
        break;
      case "face":
        steps.push(STEP_FACE);
        break;
      case "scent":
        steps.push(STEP_SCENT);
        if (a.scent === "sweet") steps.push(STEP_SCENT_SWEET);
        if (a.scent === "floral") steps.push(STEP_SCENT_FLORAL);
        break;
      case "behavior":
        steps.push(STEP_BEHAVIOR);
        if (behaviorPicksOdorRemover(a)) steps.push(STEP_ODOR_SCENT);
        break;
    }
  }

  steps.push(STEP_NAME);
  return steps;
}

/** A step counts as answered once it holds a value; text steps are optional. */
export function isAnswered(step: Step, a: Answers): boolean {
  const value = a[step.key];
  if (step.kind === "multi") return Array.isArray(value) && value.length > 0;
  if (step.kind === "text") return true;
  return value !== undefined;
}

/* ------------------------------------------------------- recommendation --- */

export interface Ref {
  /** Catalogue slug, or a COMING_SOON key when `comingSoon` is set. */
  slug: string;
  size?: string;
  comingSoon?: boolean;
  /** One line explaining why this product is here. */
  why?: string;
}

export interface Recommendation {
  primary?: Ref;
  companions: Ref[];
  disclaimers: string[];
}

const soon = (key: string, why?: string): Ref => ({ slug: key, comingSoon: true, why });

function bathRefs(a: Answers): Ref[] {
  if (a.bath === "beauty") {
    return [
      {
        slug: "claripet-vitabulu-beauty-shampoo",
        why: "Perawatan bulu saat mandi agar terasa lebih lembut dan terawat.",
      },
    ];
  }
  // "clean" and "unsure" both land on Gentle Wash; unsure defaults to 250 ml.
  const size = a.gentleSize === "500" ? "500ml" : "250ml";
  return [
    {
      slug: "claripet-gentle-wash-shampoo",
      size,
      why: "Membersihkan tubuh dengan lembut tanpa membuat kulit terasa kering.",
    },
  ];
}

function skinRefs(a: Answers): Ref[] {
  switch (a.skin) {
    case "fungal":
      return [
        {
          slug: "claripet-skin-guard-fungal-spray",
          why: "Perawatan untuk kulit yang menunjukkan tanda-tanda jamur.",
        },
        {
          slug: "claripet-gentle-wash-shampoo",
          size: "250ml",
          why: "Melengkapi perawatan saat mandi.",
        },
      ];
    case "mites":
      return [
        {
          slug: "claripet-gentle-wash-shampoo",
          size: "250ml",
          why: "Membantu perawatan kulit yang berkaitan dengan tungau dan kutu ringan.",
        },
        soon("scabies-spray", "Perawatan terarah untuk area yang bermasalah."),
      ];
    case "wound":
      return [
        {
          slug: "claripet-skin-guard-silver-heal",
          why: "Merawat luka ringan dan bagian kulit yang perlu perhatian.",
        },
      ];
    default:
      return [
        {
          slug: "claripet-gentle-wash-shampoo",
          size: "250ml",
          why: "Formula lembut untuk kulit yang sensitif dan mudah gatal.",
        },
      ];
  }
}

function coatRefs(a: Answers): Ref[] {
  switch (a.coat) {
    case "oil":
      return [soon("salmon-oil", "Nutrisi berbentuk minyak yang dicampurkan ke makanan.")];
    case "spray":
      return [
        {
          slug: "claripet-vitabulu-spray",
          why: "Perawatan bulu yang digunakan dari luar.",
        },
      ];
    case "shampoo":
      return [
        {
          slug: "claripet-vitabulu-beauty-shampoo",
          why: "Perawatan bulu saat mandi.",
        },
      ];
    default:
      return [
        {
          slug: "claripet-vitabulu-beauty-powder",
          why: "Bubuk nutrisi yang dicampurkan ke makanan.",
        },
      ];
  }
}

const FACE_REFS: Record<Exclude<FaceKey, "all">, Ref> = {
  eyes: {
    slug: "claripet-tear-stain-remover",
    why: "Membersihkan area mata dan noda air mata.",
  },
  ears: {
    slug: "claripet-magic-ear-cleaner",
    why: "Menjaga kebersihan telinga.",
  },
  mouth: {
    slug: "claripet-breath",
    why: "Merawat kesegaran napas dan kebersihan mulut.",
  },
};

function faceRefs(a: Answers): Ref[] {
  const picks = a.face ?? [];
  if (picks.includes("all")) return [FACE_REFS.eyes, FACE_REFS.ears, FACE_REFS.mouth];
  return (["eyes", "ears", "mouth"] as const)
    .filter((k) => picks.includes(k))
    .map((k) => FACE_REFS[k]);
}

function scentRefs(a: Answers): Ref[] {
  switch (a.scent) {
    case "sweet":
      return a.scentSweet === "milkyMoo"
        ? [{ slug: "claripet-milky-moo", why: "Aroma yang lembut dan creamy." }]
        : [{ slug: "claripet-baby-powder", why: "Aroma bedak bayi yang lembut." }];
    case "warm":
      return [{ slug: "claripet-warm-vanilla", why: "Aroma hangat dan elegan." }];
    case "floral":
      return a.scentFloral === "fruity"
        ? [soon("fruity-fresh", "Aroma buah-buahan yang segar.")]
        : [{ slug: "claripet-botanica-bloom", why: "Aroma floral yang lembut." }];
    default:
      return [{ slug: "claripet-smell-clean", why: "Aroma bersih dan segar." }];
  }
}

function behaviorRefs(a: Answers): Ref[] {
  const shuShu: Ref = {
    slug: a.pet === "cat" ? "claripet-shu-shu-cat" : "claripet-shu-shu-dog",
    why: "Membantu menjauhkan anabul dari area atau benda tertentu.",
  };
  const odorRemover: Ref = {
    slug:
      a.odorScent === "sereh"
        ? "claripet-pet-odor-remover-sereh"
        : "claripet-pet-odor-remover-fresh",
    why: "Membantu membersihkan bau yang tertinggal.",
  };

  switch (a.behavior) {
    case "potty":
      return [
        {
          ...shuShu,
          why: "Membantu menjauhkan anabul dari area tersebut agar perilakunya tidak mudah terulang.",
        },
        odorRemover,
      ];
    case "odor":
      return [odorRemover];
    default:
      // "chew" and "area" both land on Shu Shu alone.
      return [shuShu];
  }
}

const NEED_REFS: Record<NeedKey, (a: Answers) => Ref[]> = {
  bath: bathRefs,
  skin: skinRefs,
  coat: coatRefs,
  face: faceRefs,
  scent: scentRefs,
  behavior: behaviorRefs,
};

/**
 * One primary product plus at most two companions, in the order the user picked
 * their needs — the first need's most direct match leads.
 */
export function recommend(a: Answers): Recommendation {
  if (a.age === "under2m") return { primary: undefined, companions: [], disclaimers: [] };

  const refs: Ref[] = [];
  const seen = new Set<string>();
  for (const need of a.needs ?? []) {
    for (const ref of NEED_REFS[need](a)) {
      const key = `${ref.slug}|${ref.size ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push(ref);
    }
  }

  const [primary, ...rest] = refs.slice(0, 3);
  return {
    primary,
    companions: rest,
    disclaimers: (a.needs ?? []).includes("skin") ? [SKIN_DISCLAIMER] : [],
  };
}
