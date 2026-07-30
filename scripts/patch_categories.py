import re

with open("data/categories.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add image property to Category type
content = content.replace(
    '  tone: "sky" | "pink" | "sage" | "lavender" | "cream" | "peach";',
    '  tone: "sky" | "pink" | "sage" | "lavender" | "cream" | "peach";\n  image?: string;'
)

with open("data/categories.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated categories.ts type")
