import re

with open("components/checkout/CheckoutView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

content = re.sub(
    r'<div className="item-thumb"><Placeholder tone=\{item\.product\.tone\} paw=\{false\} label="" /></div>',
    '<div className="item-thumb">\n                          {item.product.images?.[0] ? (\n                            <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} fill style={{ objectFit: "cover" }} sizes="64px" />\n                          ) : (\n                            <Placeholder tone={item.product.tone} paw={false} label="" />\n                          )}\n                        </div>',
    content
)

with open("components/checkout/CheckoutView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CheckoutView.tsx")
