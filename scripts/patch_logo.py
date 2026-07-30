import re

with open("components/Navbar.tsx", "r", encoding="utf-8") as f:
    nav_content = f.read()

# Add Image import to Navbar if not present
if "import Image from" not in nav_content:
    nav_content = nav_content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# Replace text logo with image in Navbar
nav_content = re.sub(
    r'<Link className="brand" href="/" aria-label="ClariPet home">\s*ClariPet<sup>®</sup>\s*</Link>',
    '<Link className="brand" href="/" aria-label="ClariPet home">\n          <Image src="/images/brand/logo.png" alt="ClariPet" width={120} height={40} className="object-contain" priority />\n        </Link>',
    nav_content
)

nav_content = re.sub(
    r'<Link className="brand" href="/" onClick=\{[^}]+\} aria-label="ClariPet home">\s*ClariPet<sup>®</sup>\s*</Link>',
    '<Link className="brand" href="/" onClick={() => setMenu(false)} aria-label="ClariPet home">\n                <Image src="/images/brand/logo.png" alt="ClariPet" width={100} height={32} className="object-contain" />\n              </Link>',
    nav_content
)

with open("components/Navbar.tsx", "w", encoding="utf-8") as f:
    f.write(nav_content)

with open("components/Footer.tsx", "r", encoding="utf-8") as f:
    foot_content = f.read()

# Add Image import to Footer
if "import Image from" not in foot_content:
    foot_content = foot_content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# Replace text logo with image in Footer
foot_content = re.sub(
    r'<div className="brand">\s*ClariPet<sup>Â?®?</sup>\s*</div>',
    '<div className="brand" style={{ marginBottom: "1rem" }}>\n              <Image src="/images/brand/logo.png" alt="ClariPet" width={140} height={46} className="object-contain" />\n            </div>',
    foot_content
)

with open("components/Footer.tsx", "w", encoding="utf-8") as f:
    f.write(foot_content)
print("Updated Navbar and Footer")
