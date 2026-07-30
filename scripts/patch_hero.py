import re

with open("components/home/Hero.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Image import
if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# Replace the hero placeholders
content = re.sub(
    r'<div className="hero-media">\s*<Placeholder tone="sky" label="Poodle & cat with ClariPet products" />\s*</div>',
    '<div className="hero-media">\n            <Image src="/images/hero/hero-main.jpg" alt="Poodle & cat with ClariPet products" fill priority style={{ objectFit: "cover" }} />\n          </div>',
    content
)

with open("components/home/Hero.tsx", "w", encoding="utf-8") as f:
    f.write(content)
