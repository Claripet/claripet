import re

with open("components/SearchOverlay.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

content = re.sub(
    r'<Placeholder tone=\{p\.tone\} paw=\{false\} label="" />',
    '{p.images?.[0] ? (\n                  <Image src={p.images[0].url} alt={p.images[0].alt || p.name} fill style={{ objectFit: "cover" }} sizes="64px" />\n                ) : (\n                  <Placeholder tone={p.tone} paw={false} label="" />\n                )}',
    content
)

with open("components/SearchOverlay.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated SearchOverlay.tsx")
