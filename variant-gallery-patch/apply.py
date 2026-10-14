from pathlib import Path
import shutil,datetime,sys
root=Path.home()/'dragontail'
files=['src/app/admin/products/ProductsClient.tsx','src/app/api/admin/products/route.ts','src/app/api/products/route.ts','src/app/page.tsx','src/app/globals.css']
for x in files:
 if not (root/x).is_file():sys.exit('Missing required file: '+x)
texts={x:(root/x).read_text() for x in files}
def rep(f,a,b):
 t=texts[f]
 if a not in t:
  if b in t:print('Already patched:',f);return
  sys.exit('Cannot locate patch anchor in '+f+': '+a[:90]+'\nNo source files changed; please share the failing anchor.')
 texts[f]=t.replace(a,b,1)
a='src/app/admin/products/ProductsClient.tsx'
rep(a,'inventory?:Variant[]};','inventory?:Variant[];colorImages?:Record<string,string[]>};')
rep(a,"description:'',active:true});","description:'',active:true,colorImages:{}});")
rep(a,"{f('tag','TAG')}","<section className=\"dt-color-photos\"><strong>IMAGES BY COLOR</strong><p>Enter one or more HTTPS image URLs for each color (one URL per line). These override the shared photos when that color is selected.</p>{form.colors.map(color=><label key={color}>{color} photos<textarea rows={3} placeholder=\"https://.../front.jpg\\nhttps://.../back.jpg\" value={(form.colorImages?.[color]||[]).join('\\n')} onChange={e=>setForm(v=>({...v,colorImages:{...v.colorImages,[color]:e.target.value.split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean)}}))}/></label>)}</section>{f('tag','TAG')}")
a='src/app/api/admin/products/route.ts'
rep(a,'return {name,category,type,price,image,altImage,description,tag,active,colors,sizes}',"const rawImages=p.colorImages;const colorImages:Record<string,string[]>={};if(rawImages!==undefined){if(!rawImages||typeof rawImages!=='object'||Array.isArray(rawImages))return null;for(const c of colors){const list=(rawImages as Record<string,unknown>)[c];if(list===undefined)continue;if(!Array.isArray(list)||list.length>8||list.some(u=>typeof u!=='string'||!/^https:\\/\\//.test(u)||u.length>1500))return null;colorImages[c]=list as string[]}}return {name,category,type,price,image,altImage,description,tag,active,colors,sizes,colorImages}")
rep(a,'description,active, COALESCE(', 'description,active,color_images AS "colorImages", COALESCE(')
rep(a,'description,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', 'description,active,color_images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)')
rep(a,'p.description,p.active]);','p.description,p.active,JSON.stringify(p.colorImages)]);')
rep(a,'active=$11,updated_at=NOW() WHERE id=$12','active=$11,color_images=$13::jsonb,updated_at=NOW() WHERE id=$12')
rep(a,'p.description,p.active,id]);','p.description,p.active,id,JSON.stringify(p.colorImages)]);')
a='src/app/api/products/route.ts'
rep(a,'sizes,description, COALESCE(', 'sizes,description,color_images AS "colorImages", COALESCE(')
a='src/app/page.tsx'
rep(a,'inventory?:InventoryLine[]};','inventory?:InventoryLine[];colorImages?:Record<string,string[]>};')
rep(a,"const [detail,setDetail]=useState<StockProduct|null>(null);", "const [detail,setDetail]=useState<StockProduct|null>(null);")
rep(a,"const ProductCard=", "const imagesFor=(p:StockProduct,color:string)=>{const specific=p.colorImages?.[color]?.filter(Boolean)||[];return specific.length?specific:[p.image,p.altImage].filter(Boolean)};\n const [cardPhotos,setCardPhotos]=useState<Record<number,number>>({});\n const galleryImages=detail?imagesFor(detail,selectedColor):[];\n const moveGallery=(direction:number)=>{setGalleryIndex(i=>(i+direction+galleryImages.length)%Math.max(1,galleryImages.length));setZoomed(false)};\n const ProductCard=")
rep(a,'<img src={p.image} alt={p.name}/></button>{p.tag', '<img src={imagesFor(p,p.colors[0])[cardPhotos[p.id]%imagesFor(p,p.colors[0]).length||0]} alt={p.name}/></button>{imagesFor(p,p.colors[0]).length>1&&<div className="dt-card-gallery"><button aria-label="Previous product photo" onClick={()=>setCardPhotos(v=>({...v,[p.id]:(v[p.id]||0)-1<0?imagesFor(p,p.colors[0]).length-1:(v[p.id]||0)-1}))}>‹</button><button aria-label="Next product photo" onClick={()=>setCardPhotos(v=>({...v,[p.id]:((v[p.id]||0)+1)%imagesFor(p,p.colors[0]).length}))}>›</button></div>}{p.tag')
rep(a,'<div className="dt-main-image"><button', '<div className="dt-main-image" onTouchStart={e=>{e.currentTarget.dataset.touchX=String(e.touches[0].clientX)}} onTouchEnd={e=>{const start=Number(e.currentTarget.dataset.touchX);const diff=e.changedTouches[0].clientX-start;if(Math.abs(diff)>45)moveGallery(diff<0?1:-1)}}><button')
rep(a,'src={[detail.image,detail.altImage][galleryIndex]}','src={galleryImages[galleryIndex]||detail.image}')
rep(a,'</span></button></div><div className="dt-thumbs">{[detail.image,detail.altImage].map((img,i)=>', '</span></button>{galleryImages.length>1&&<div className="dt-gallery-arrows"><button aria-label="Previous image" onClick={()=>moveGallery(-1)}>‹</button><span>{galleryIndex+1} / {galleryImages.length}</span><button aria-label="Next image" onClick={()=>moveGallery(1)}>›</button></div>}</div><div className="dt-thumbs">{galleryImages.map((img,i)=>')
rep(a,'<small className="dt-gallery-note">Images are illustrative. Color options do not alter the photography.</small>','<small className="dt-gallery-note">Swipe or use the arrows to browse photos.</small>')
rep(a,'onClick={()=>setSelectedColor(c)}','onClick={()=>{setSelectedColor(c);setGalleryIndex(0);setZoomed(false)}}')
a='src/app/globals.css'
texts[a]+='''\n/* DRAGONTAIL variant galleries */\n.dt-main-image{position:relative;touch-action:pan-y}\n.dt-gallery-arrows{position:absolute;bottom:15px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:15px;background:rgba(255,255,255,.93);padding:5px 10px;z-index:5;box-shadow:0 2px 14px #0002}\n.dt-gallery-arrows button,.dt-card-gallery button{border:0;background:white;color:#111;cursor:pointer;font-size:26px;line-height:1;padding:5px 12px;min-width:38px;min-height:38px}\n.dt-gallery-arrows span{font-size:11px;white-space:nowrap}\n.dt-card-gallery{position:absolute;bottom:15px;left:12px;right:12px;display:flex;justify-content:space-between;z-index:4;pointer-events:none}\n.dt-card-gallery button{pointer-events:auto;background:#ffffffe8}\n.dt-color-photos{display:grid;gap:12px;padding:15px 0;border-block:1px solid #ddd}\n.dt-color-photos p{font-size:12px;color:#777}\n.dt-color-photos textarea{display:block;width:100%;min-height:82px;padding:10px;border:1px solid #d7d7d7;font:inherit;resize:vertical}\n'''
backup=root/'.variant-gallery-backups'/datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
for f in files:
 dest=backup/f;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/f,dest)
for f,t in texts.items():(root/f).write_text(t)
print('Patched 5 source files. Backups:',backup)
print('Database color_images column already exists. Run npm run build; restart only if build succeeds.')
