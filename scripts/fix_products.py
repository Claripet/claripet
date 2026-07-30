import re

with open("data/products.ts", "r", encoding="utf-8") as f:
    content = f.read()

def replace_images(match):
    # Change images: ['str', 'str'] to images: [{url: 'str'}, {url: 'str'}]
    images_str = match.group(1)
    
    urls = re.findall(r"'([^']+)'", images_str)
    new_images_str = ", ".join([f"{{url: '{url}', alt: ''}}" for url in urls])
    
    return f"images: [{new_images_str}]"

new_content = re.sub(r"images:\s*(\[[^\]]+\])", replace_images, content)

with open("data/products.ts", "w", encoding="utf-8") as f:
    f.write(new_content)
