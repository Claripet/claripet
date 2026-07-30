import re

with open("lib/data/index.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Re-enable USE_DATABASE to allow falling back to Supabase
content = re.sub(
    r'const USE_DATABASE = false;',
    'const USE_DATABASE = Boolean(\n  process.env.NEXT_PUBLIC_SUPABASE_URL &&\n    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-supabase-url-here",\n);',
    content
)

with open("lib/data/index.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Re-enabled USE_DATABASE.")
