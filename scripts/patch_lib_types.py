with open("lib/types.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure Category has `image` in lib/types.ts
if "export type Category = {" in content and "image?:" not in content.split("export type Category = {")[1].split("}")[0]:
    content = content.replace(
        "export type Category = {",
        "export type Category = {\n  image?: string;"
    )
    with open("lib/types.ts", "w", encoding="utf-8") as f:
        f.write(content)
