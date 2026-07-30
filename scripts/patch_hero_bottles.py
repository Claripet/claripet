import re

with open("components/home/Hero.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will replace the dummy "hero-bottle" placeholders with actual product images we just added
# e.g., Baby Powder, Tear Stain Remover, and Breath 

content = re.sub(
    r'<div className="hero-bottle" style=\{\{ left: "4%", background: "var\(--pink\)" \}\}>\s*<Placeholder tone="pink" paw=\{false\} label="" />\s*</div>',
    '<div className="hero-bottle" style={{ left: "4%", background: "transparent" }}>\n            <Image src="/images/products/baby-powder.png" alt="Baby Powder" fill style={{ objectFit: "contain" }} />\n          </div>',
    content
)

content = re.sub(
    r'<div className="hero-bottle" style=\{\{ left: "34%", bottom: "-12px", background: "var\(--sage\)" \}\}>\s*<Placeholder tone="sage" paw=\{false\} label="" />\s*</div>',
    '<div className="hero-bottle" style={{ left: "34%", bottom: "-12px", background: "transparent" }}>\n            <Image src="/images/products/smell-clean.png" alt="Smell Clean" fill style={{ objectFit: "contain" }} />\n          </div>',
    content
)

content = re.sub(
    r'<div className="hero-bottle" style=\{\{ left: "64%", background: "var\(--lavender\)" \}\}>\s*<Placeholder tone="lavender" paw=\{false\} label="" />\s*</div>',
    '<div className="hero-bottle" style={{ left: "64%", background: "transparent" }}>\n            <Image src="/images/products/gentle-wash.png" alt="Gentle Wash" fill style={{ objectFit: "contain" }} />\n          </div>',
    content
)

# And remove the hero-main.jpg since we don't have it (fallback to a generic product array or keep the main hero layout without a broken image)
# If hero-main doesn't exist, Image component will throw a 404. Let's make it load a generic placeholder image, or better, the main brand logo.
# Given there is no hero image, I will hide the main image and just leave the bottles if the user doesn't have a hero-main.
# Oh, we don't have hero-main. Let's leave a placeholder there for now but use tone "sky" as it originally was.
# We'll just leave hero-main.jpg, Next.js handles 404s cleanly, or we'll revert the hero-main.jpg to a Placeholder.
content = re.sub(
    r'<Image src="/images/hero/hero-main.jpg"[^>]+/>',
    '<Placeholder tone="sky" label="Hero Image Coming Soon" />',
    content
)

with open("components/home/Hero.tsx", "w", encoding="utf-8") as f:
    f.write(content)
