import re

with open("components/product/ProductView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure Image is imported
if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# Patch main product image
content = re.sub(
    r'\{/\* Main product image slot \*/\}\s*<div className="product-media-main">\s*<Placeholder tone=\{thumbTones\[activeThumb\]\} label=\{product\.name\} />\s*</div>',
    '{/* Main product image slot */}\n            <div className="product-media-main">\n              {product.images?.[activeThumb] ? (\n                <Image src={product.images[activeThumb].url} alt={product.images[activeThumb].alt || product.name} fill style={{ objectFit: "cover" }} priority sizes="(max-width: 1024px) 100vw, 50vw" />\n              ) : (\n                <Placeholder tone={thumbTones[activeThumb]} label={product.name} />\n              )}\n            </div>',
    content
)

# Patch thumbnail images
content = re.sub(
    r'<Placeholder tone=\{t\} paw=\{i === 0\} label="" />',
    '{product.images?.[i] ? (\n                      <Image src={product.images[i].url} alt={product.images[i].alt || product.name} fill style={{ objectFit: "cover" }} sizes="80px" />\n                    ) : (\n                      <Placeholder tone={t} paw={i === 0} label="" />\n                    )}',
    content
)

with open("components/product/ProductView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProductView.tsx")
