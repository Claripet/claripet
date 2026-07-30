import re

with open("components/SearchOverlay.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

with open("components/SearchOverlay.tsx", "w", encoding="utf-8") as f:
    f.write(content)
