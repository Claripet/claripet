import re

with open("data/products.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Remove `image: "...",` which caused the type error.
content = re.sub(r'image: "[^"]+",\s*', '', content)

with open("data/products.ts", "w", encoding="utf-8") as f:
    f.write(content)
