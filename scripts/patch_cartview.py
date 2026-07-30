import re

with open("components/cart/CartView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

content = re.sub(
    r'<Placeholder tone=\{item\.product\.tone\} paw=\{false\} label="" />',
    '{item.product.images?.[0] ? (\n                  <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} fill style={{ objectFit: "cover" }} sizes="80px" />\n                ) : (\n                  <Placeholder tone={item.product.tone} paw={false} label="" />\n                )}',
    content
)

with open("components/cart/CartView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CartView.tsx")
