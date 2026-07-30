import re

with open("components/about/AboutView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import { Icon }', 'import Image from "next/image";\nimport { Icon }')

content = re.sub(
    r'<Placeholder tone="cream" label="Golden retriever & cat" />',
    '<div style={{ width: "100%", height: "100%", background: "var(--cream-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>\n            <Image src="/images/brand/logo.png" alt="ClariPet About Us" width={200} height={64} className="object-contain" />\n          </div>',
    content
)

with open("components/about/AboutView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("components/Mascot.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import { Placeholder }', 'import Image from "next/image";\nimport { Placeholder }')

content = re.sub(
    r'<Placeholder tone=\{tone\} label="" paw />',
    '<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>\n          <Image src="/images/brand/logo.png" alt="Mascot" width={80} height={32} className="object-contain" style={{ opacity: 0.5 }} />\n        </div>',
    content
)

with open("components/Mascot.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("components/reviews/ReviewsView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import { Icon }', 'import Image from "next/image";\nimport { Icon }')

content = re.sub(r'<Placeholder tone="cream" label="Before" />', '<div className="ph cream">Before</div>', content)
content = re.sub(r'<Placeholder tone=\{r\.tone\} label="After" />', '<div className={"ph " + r.tone}>After</div>', content)
content = re.sub(r'<Placeholder tone="sky" label="Happy pets" />', '<div className="ph sky">Happy pets</div>', content)

with open("components/reviews/ReviewsView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
