import re

with open("components/SearchOverlay.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Since `import Link from "next/link";` wasn't in SearchOverlay, my previous patch didn't work.
content = 'import Image from "next/image";\n' + content

with open("components/SearchOverlay.tsx", "w", encoding="utf-8") as f:
    f.write(content)
