import type { Tone } from "@/lib/types";
import Image from "next/image";
import { Placeholder } from "@/components/Placeholder";

export function Mascot({ tone = "cream", speech, sub }: { tone?: Tone; speech: string; sub?: string }) {
  return (
    <div className="mascot">
      <div className="mascot-img">
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image src="/images/brand/logo.png" alt="Mascot" width={80} height={32} className="object-contain" style={{ opacity: 0.5 }} />
        </div>
      </div>
      <div className="mascot-bubble">
        <div className="speech">“{speech}”</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
    </div>
  );
}
