from pathlib import Path
from datetime import datetime
import shutil,sys
p=Path('src/app/page.tsx')
if not p.exists(): sys.exit('Run this from ~/dragontail: src/app/page.tsx not found')
s=p.read_text()
needle='const galleryImages=detail?imagesFor(detail,selectedColor):[];'
if needle not in s: sys.exit('Cannot locate gallery helper; no changes made. Send current page.tsx for tailored patch.')
preload='''const galleryImages=detail?imagesFor(detail,selectedColor):[];
 // Warm each color's main photograph when Quick View opens. Avoid downloading all thumbnails.
 useEffect(()=>{if(!detail)return;for(const color of detail.colors){const src=imagesFor(detail,color)[0];if(src){const img=new window.Image();img.src=src}}},[detail]);'''
image_old='<img src={galleryImages[galleryIndex]||detail.image} alt={`${detail.name} – photograph ${galleryIndex+1}`}/>'
image_new='<img key={`${detail.id}-${selectedColor}-${galleryIndex}`} src={galleryImages[galleryIndex]||detail.image} loading="eager" decoding="async" alt={`${detail.name} – ${selectedColor} – photograph ${galleryIndex+1}`}/>'
if image_old not in s:sys.exit('Cannot locate Quick View gallery image; no changes made. Send current page.tsx.')
button_old="onClick={()=>{setSelectedColor(c);setGalleryIndex(0);setZoomed(false)}}"
button_new="onClick={()=>{if(c===selectedColor)return;setSelectedColor(c);setGalleryIndex(0);setZoomed(false)}}"
if button_old not in s:sys.exit('Cannot locate color variant click handler; no changes made. Send current page.tsx.')
backup=p.with_name('page.tsx.before-smooth-color-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(p,backup)
s=s.replace(needle,preload,1).replace(image_old,image_new,1).replace(button_old,button_new,1)
p.write_text(s)
print('Patched Quick View. Backup:',backup)
print('Now run npm run build; restart PM2 ONLY if build succeeds.')
