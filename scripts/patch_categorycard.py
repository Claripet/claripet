import re

with open("components/CategoryCard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# Replace the category placeholder with logic that uses cat.image if available
pattern = r'<div className="cat-img">\s*<Placeholder tone=\{cat.tone\} label=\{cat.name\} />\s*</div>'
replacement = """<div className="cat-img">
        {cat.image ? (
          <Image src={cat.image} alt={cat.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <Placeholder tone={cat.tone} label={cat.name} />
        )}
      </div>"""

content = re.sub(pattern, replacement, content)

with open("components/CategoryCard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
