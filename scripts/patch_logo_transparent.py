from PIL import Image

# For the Dark Logo
try:
    img_dark = Image.open('public/images/brand/logo-dark.png')
    img_dark = img_dark.convert("RGBA")
    datas = img_dark.getdata()
    
    newData = []
    for item in datas:
        # Change all white (also shades of white)
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img_dark.putdata(newData)
    img_dark.save('public/images/brand/logo-dark.png', "PNG")
    print("Dark logo updated.")
except Exception as e:
    print(f"Error updating dark logo: {e}")

# For the Light Logo
try:
    img_light = Image.open('public/images/brand/logo-light.png')
    img_light = img_light.convert("RGBA")
    datas = img_light.getdata()
    
    newData = []
    for item in datas:
        # Change all white (also shades of white)
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img_light.putdata(newData)
    img_light.save('public/images/brand/logo-light.png', "PNG")
    print("Light logo updated.")
except Exception as e:
    print(f"Error updating light logo: {e}")

# For the Default Logo
try:
    img_main = Image.open('public/images/brand/logo.png')
    img_main = img_main.convert("RGBA")
    datas = img_main.getdata()
    
    newData = []
    for item in datas:
        # Change all white (also shades of white)
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img_main.putdata(newData)
    img_main.save('public/images/brand/logo.png', "PNG")
    print("Main logo updated.")
except Exception as e:
    print(f"Error updating main logo: {e}")
