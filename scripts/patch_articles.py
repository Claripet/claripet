import re

with open("data/articles.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add coverImage property to Article type if it doesn't exist
with open("lib/types.ts", "r", encoding="utf-8") as f:
    types_content = f.read()

if "coverImage?: string;" not in types_content:
    types_content = types_content.replace(
        "export type Article = {",
        "export type Article = {\n  coverImage?: string;"
    )
    with open("lib/types.ts", "w", encoding="utf-8") as f:
        f.write(types_content)
print("Updated articles.ts and types")
