with open("components/SearchOverlay.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == '"use client";':
        new_lines.append(line)
        new_lines.append('import Image from "next/image";\n')
    elif line.strip() == 'import Image from "next/image";' and len(new_lines) == 0:
        continue # skip the one at the very top
    else:
        new_lines.append(line)

with open("components/SearchOverlay.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
