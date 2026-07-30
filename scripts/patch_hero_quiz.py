import re
import os

# We don't have hero images in the provided folders.
# So I'll just change the "Hero Image Coming Soon" placeholder to just use 
# one of the transparent product images as a generic lifestyle hero if we want, or a solid color block.
# Actually, the user says "remove the dummy product and the dummy container assets"
# I think they might be referring to the generic Placeholders (the pastel blocks with the paw print).

with open("components/home/Hero.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will replace the "Hero Image Coming Soon" with the brand logo or just one of the products so the dummy pastel block is gone.
content = re.sub(
    r'<Placeholder tone="sky" label="Hero Image Coming Soon" />',
    '<div style={{ width: "100%", height: "100%", background: "var(--sky-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>\n              <Image src="/images/brand/logo.png" alt="ClariPet" width={200} height={64} className="object-contain" />\n            </div>',
    content
)

with open("components/home/Hero.tsx", "w", encoding="utf-8") as f:
    f.write(content)


with open("components/home/QuizCTA.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

content = re.sub(
    r'<Placeholder tone="lavender" label="Happy dog & cat" />',
    '<div style={{ width: "100%", height: "100%", background: "var(--lavender-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>\n            <Image src="/images/products/botanica-bloom.png" alt="Find your product" width={200} height={200} className="object-contain" />\n          </div>',
    content
)

with open("components/home/QuizCTA.tsx", "w", encoding="utf-8") as f:
    f.write(content)
