with open("lib/types.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "export interface Category {",
    "export interface Category {\n  image?: string;"
)

with open("lib/types.ts", "w", encoding="utf-8") as f:
    f.write(content)
