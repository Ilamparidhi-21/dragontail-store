from pathlib import Path
import shutil,sys
p=Path('src/app/page.tsx')
if not p.exists():sys.exit('Not in DRAGONTAIL project root')
s=p.read_text()
old='<button className="product-name" onClick={()=>openProduct(p)}>{p.name}</button>'
new='<a className="product-name" href={`/products/${p.id}`}>{p.name}</a>'
if new in s:print('Product-page links already added')
elif old in s:
 shutil.copy2(p,p.with_suffix('.tsx.before-product-page'))
 p.write_text(s.replace(old,new,1))
 print('Product names now link to dedicated pages; Quick View remains')
else:sys.exit('Anchor not found; storefront unchanged. Send the ProductCard section for a matching patch.')
