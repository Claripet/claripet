import re

with open("components/home/QuizCTA.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure Image is imported
if "import Image from" not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";')

# We don't have a hero/quiz asset so I'll leave the placeholder, but if there's any product we could show it.
# The user wants "dummy container assets" removed.
