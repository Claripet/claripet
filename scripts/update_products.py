import re

with open("data/products.ts", "r", encoding="utf-8") as f:
    content = f.read()

def replace_images(match):
    slug = match.group(1)
    
    # Map slug to image based on copied files
    image_map = {
        "claripet-smell-clean": "smell-clean.png",
        "claripet-botanica-bloom": "botanica-bloom.png",
        "claripet-baby-powder": "baby-powder.png",
        "claripet-warm-vanilla": "warm-vanilla.png",
        "claripet-milky-moo": "milky-moo.png",
        "claripet-breath": "breath.png",
        "claripet-tear-stain-remover": "tear-stain.png",
        "claripet-gentle-wash-shampoo": "gentle-wash.png",
        # For products without images, don't add image field (or add null/undefined)
    }
    
    image_name = image_map.get(slug)
    
    images_arr = "[]"
    if image_name:
        base = image_name.replace(".png", "")
        # Try to find numbered images
        import os
        import glob
        files = glob.glob(f"public/images/products/{base}-*.png")
        if files:
            files.sort()
            files_str = ", ".join([f"'/images/products/{os.path.basename(f)}'" for f in files])
            images_arr = f"['/images/products/{image_name}', {files_str}]"
        else:
            images_arr = f"['/images/products/{image_name}']"
            
        # Add image fields before category
        return match.group(0).replace(
            f'category: "', 
            f'image: "/images/products/{image_name}", images: {images_arr}, category: "'
        )
    return match.group(0)

# Pattern to match a product object block
pattern = r'slug: "(claripet-[^"]+)",(.*?)category: "'
new_content = re.sub(pattern, replace_images, content, flags=re.DOTALL)

with open("data/products.ts", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated products.ts")
