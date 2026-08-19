import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";

const STEPS = [
  { icon: "paw", title: "1. Jenis Anabul", desc: "Anjing atau kucing", bg: "bg-[#AECBEB]/20" },
  { icon: "heart", title: "2. Usia", desc: "Berapa usia anabulmu?", bg: "bg-[#F5CDD3]/20" },
  { icon: "leaf", title: "3. Kebutuhan Utama", desc: "Pilih maksimal dua kebutuhan", bg: "bg-[#C5D6C8]/20" },
  { icon: "sparkle", title: "4. Rekomendasi", desc: "Produk yang paling sesuai", bg: "bg-[#E0CBE8]/20" },
];

export function QuizCTA() {
  return (
    <section className="wrap quiz-photo-section">
      <div>
        <div>
          {/* Top section — two columns on md+ */}
          <div className="quiz-photo-grid grid gap-8 md:gap-10 items-center">
            {/* Left column */}
            <div className="space-y-6">
              <h2
                className="text-navy font-bold leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
              >
                Not Sure Which Product
                <br />
                Your Pet Needs?
                <Icon name="heart" size={20} className="inline-block ml-1.5 text-pink -mt-1 align-middle" strokeWidth={2} />
              </h2>
              <p
                className="text-[#5A6072] leading-relaxed max-w-md"
                style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)" }}
              >
                Jawab beberapa pertanyaan singkat dan dapatkan rekomendasi ClariPet yang dipersonalisasi sesuai kebutuhan hewan peliharaan Anda.
              </p>
              <div className="flex flex-col items-start gap-4">
                {/* Site primary button rather than a pale --sky fill: white on
                    #AECBEB is ~1.9:1 contrast, well under the 4.5:1 minimum,
                    which is why it read as washed out. */}
                <Link href="/quiz" className="btn btn-primary btn-lg">
                  Mulai Kuis
                  <Icon name="arrowRight" size={18} />
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-[#8A90A0]">
                  <Icon name="shield" size={14} className="text-sage" />
                  <span>100% Gratis</span>
                  <span className="text-[#C5CDD8]">•</span>
                  <span>2 Menit Saja</span>
                  <span className="text-[#C5CDD8]">•</span>
                  <span>Tanpa Daftar</span>
                </div>
              </div>
            </div>

            {/* Right column — unframed photograph. Its own proportions, and the
                edge facing the copy is masked away so it melts into the page
                instead of sitting in a box. */}
            <div className="quiz-photo">
              <Image
                src="/images/quiz-cta.png"
                alt="A puppy and a cat sitting beside a basket, waiting to be matched with the right ClariPet products"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="quiz-photo-img"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Bottom section — step indicator strip */}
          <div className="quiz-photo-steps mt-10 md:mt-12 p-7 md:p-9">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {STEPS.map((step) => (
                // Icon above the label on phones: side-by-side leaves ~90px for
                // the text and every step wraps to four lines.
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center gap-2.5 md:flex-row md:items-center md:text-left md:gap-4"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.bg}`}>
                    <Icon name={step.icon} size={22} className="text-navy" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy text-[15px] leading-tight mb-1">{step.title}</p>
                    <p className="text-[#8A90A0] text-[13px] leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
