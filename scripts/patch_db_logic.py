import re

with open("lib/data/index.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Force USE_DATABASE to false so it loads the real products we just added to static data, not the old ones in Supabase
content = re.sub(
    r'const USE_DATABASE = Boolean\([\s\S]+?\);',
    'const USE_DATABASE = false;',
    content
)

with open("lib/data/index.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Disabled USE_DATABASE to force static real data.")
