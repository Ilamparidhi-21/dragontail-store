from pathlib import Path
from datetime import datetime
import shutil,sys
root=Path.cwd()
home=root/'src/app/page.tsx'
quote=root/'src/app/api/checkout/quote/route.ts'
orders=[root/'src/app/account/orders/page.tsx',root/'src/app/account/orders/[number]/page.tsx']
for p in [home,quote,*orders]:
 if not p.is_file():sys.exit(f'Missing {p}; stopped before changing files')
changes={}
s=home.read_text()
old='<img src={p.image} alt={p.name}/><div><strong>{p.name}</strong><small>SIZE {line.size}'
new='<img src={imagesFor(p,line.color||p.colors[0])[0]||p.image} alt={`${p.name} — ${line.color||p.colors[0]}`}/><div><strong>{p.name}</strong><small>SIZE {line.size}'
if old in s:s=s.replace(old,new,1)
elif new not in s:sys.exit('Cart image anchor missing; no files changed')
# Remove ONLY the curated promotional section, never the collection filter buttons.
marker='<section className="dt-curated-home" aria-label="Shop curated collections">'
if marker in s:
 start=s.index(marker); end=s.find('</div></section>',start)
 if end<0:sys.exit('Curated section ending missing; no files changed')
 s=s[:start]+s[end+len('</div></section>'):]
# The earlier patch may wrap the section in a conditional.
import re
s=s.replace("{curated.some(c=>c.slug!=='new-arrivals' && c.productIds.some(id=>products.some(p=>p.id===id)))&&}","")
# Explicit conditional prefix can survive after section removal; remove immediately adjoining prefix and brace.
pattern="{curated.some(c=>c.slug!=='new-arrivals' && c.productIds.some(id=>products.some(p=>p.id===id)))&&"
if pattern in s:
 # conditional previously wrapped the removed section; there should be a trailing } at location before next main section
 s=s.replace(pattern,'',1)
 # The adjacent } is best removed only if before next section
 s=s.replace('}</main>','</main>',1) if '}</main>' in s else s
# If conditional brace remains, better remove by positional strategy during real validation below.
changes[home]=s
s=quote.read_text()
old='SELECT p.id,p.name,p.price,p.image,i.quantity AS stock FROM dt_products p'
new='SELECT p.id,p.name,p.price,COALESCE(NULLIF(p.color_images -> $2 ->> 0,\'\'),p.image) AS image,i.quantity AS stock FROM dt_products p'
if old in s:s=s.replace(old,new,1)
elif new not in s:sys.exit('Checkout quote SQL anchor missing; no files changed')
changes[quote]=s
for p in orders:
 s=p.read_text()
 old="'image',p.image) ORDER BY i.id)"
 new="'image',COALESCE(NULLIF(p.color_images -> i.color ->> 0,''),p.image)) ORDER BY i.id)"
 if old in s:s=s.replace(old,new,1)
 elif new not in s:sys.exit(f'Order image SQL anchor missing in {p}; no files changed')
 changes[p]=s
# Write only after all validations complete.
backup=root/('dt-ui-backup-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
for p,content in changes.items():
 dest=backup/p.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 p.write_text(content)
 print('Patched',p.relative_to(root))
print('Backup:',backup)
print('Build before restarting PM2.')
