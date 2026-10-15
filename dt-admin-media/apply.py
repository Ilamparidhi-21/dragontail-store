from pathlib import Path
import shutil,sys
from datetime import datetime
root=Path.cwd()
backup=root/('dt-admin-media-backup-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
files=['src/app/admin/products/ProductsClient.tsx','src/app/admin/products/products.css','src/app/admin/orders/orders.module.css','src/app/admin/orders/OrdersClient.tsx','src/app/admin/collections/CollectionsClient.tsx']
original={}
for name in files:
 p=root/name
 if not p.exists():sys.exit('Missing: '+name)
 original[name]=p.read_text()
modified=dict(original)
products='src/app/admin/products/ProductsClient.tsx'
s=modified[products]
anchor=" const [overviewOpen,setOverviewOpen]=useState(true);"
if anchor not in s:sys.exit('Incompatible ProductsClient Overview state')
s=s.replace(anchor,anchor+'''
 const [uploading,setUploading]=useState('');
 const uploadImage=async(file:File,assign:(url:string)=>void,slot:string)=>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Please choose a JPG, PNG or WebP up to 5 MB');return}
  setUploading(slot);setError('');
  try{const payload=new FormData();payload.append('image',file);const response=await fetch('/api/admin/media',{method:'POST',credentials:'same-origin',body:payload});const result=await response.json();if(!response.ok)throw new Error(result.error||'Upload failed');assign(result.url);setNotice('Image uploaded. Save the product to retain the image.')}catch(e){setError(e instanceof Error?e.message:'Upload failed')}finally{setUploading('')}
 };
 const mediaUpload=(slot:string,assign:(url:string)=>void)=><label className="dtMediaUpload">{uploading===slot?'Uploading…':'Upload / replace image'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!uploading} onChange={e=>{const selected=e.target.files?.[0];if(selected)void uploadImage(selected,assign,slot);e.currentTarget.value='';}}/></label>;
 useEffect(()=>{const toggle=(e:Event)=>{const opened=e.target;if(!(opened instanceof HTMLDetailsElement)||!opened.open)return;document.querySelectorAll('details.dtCompactFilters, details.dtActionMenu').forEach(el=>{if(el!==opened)(el as HTMLDetailsElement).open=false})};const dismiss=(e:PointerEvent)=>{const target=e.target;if(!(target instanceof Node))return;if(!(target instanceof Element)||!target.closest('details.dtCompactFilters,details.dtActionMenu'))document.querySelectorAll('details.dtCompactFilters,details.dtActionMenu').forEach(el=>(el as HTMLDetailsElement).open=false)};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')document.querySelectorAll('details.dtCompactFilters,details.dtActionMenu').forEach(el=>(el as HTMLDetailsElement).open=false)};document.addEventListener('toggle',toggle,true);document.addEventListener('pointerdown',dismiss,true);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('toggle',toggle,true);document.removeEventListener('pointerdown',dismiss,true);document.removeEventListener('keydown',escape)}} ,[]);
''',1)
# exact targets from uploaded source
old="{f('image','MAIN IMAGE HTTPS URL','url',true)}{f('altImage','SECOND IMAGE HTTPS URL','url',true)}"
new="{f('image','MAIN IMAGE HTTPS URL','url',true)}{mediaUpload('main',url=>setForm(v=>({...v,image:url})))}{f('altImage','SECOND IMAGE HTTPS URL','url',true)}{mediaUpload('second',url=>setForm(v=>({...v,altImage:url})))}"
if old not in s:sys.exit('Incompatible main image inputs')
s=s.replace(old,new,1)
for position,slot in [(0,'front'),(1,'back')]:
 # find by relevant adjacent label end, not indiscriminate replacement
 pattern=('FRONT IMAGE HTTPS URL' if position==0 else 'BACK IMAGE HTTPS URL')
 start=s.index('<label>'+pattern)
 end=s.index('</label>',start)+len('</label>')
 existing=s[start:end]
 addition="{mediaUpload('"+slot+"-'+index,url=>setForm(v=>{const arr=[...(v.colorImages?.[color]||[])];arr["+str(position)+"]=url;return {...v,colorImages:{...v.colorImages,[color]:arr}}}))}"
 s=s[:end]+addition+s[end:]
modified[products]=s
css='src/app/admin/products/products.css'
modified[css]+='''
/* Admin image uploader */
.dtForm .dtMediaUpload{display:inline-flex;align-items:center;justify-content:center;position:relative;min-height:37px;width:fit-content;padding:9px 13px;background:#fff;border:1px solid #b8b8b8;border-radius:5px;color:#161616;cursor:pointer;letter-spacing:0;font-size:12px;font-weight:600}
.dtForm .dtMediaUpload:hover{border-color:#161616;background:#f5f5f5}
.dtMediaUpload input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.dtCompactFilters summary:hover,.dtActionMenu summary:hover{background:#f5f5f5;border-color:#999}
.dtCompactFilters summary:focus-visible,.dtActionMenu summary:focus-visible{outline:2px solid #111;outline-offset:2px}
'''
css='src/app/admin/orders/orders.module.css'
modified[css]+='''
/* Neutral active navigation: thin stripe instead of filled block */
.sidebar nav a[class*="navActive"]{background:transparent!important;border-left:2px solid #fff!important;border-radius:0!important;font-weight:700;color:#fff!important}
.sidebar nav a[class*="navActive"]:hover{background:#222!important}
.sidebar nav .dtOverviewButton{color:#fff!important;background:transparent!important;box-shadow:none!important;outline:none!important}
.sidebar nav .dtOverviewButton:hover{background:#242424!important}
.sidebar nav .dtOverviewChildren{display:grid}
'''
# Add media route via separate file below
for name in ['src/app/admin/orders/OrdersClient.tsx','src/app/admin/collections/CollectionsClient.tsx']:
 if 'useState(true)' not in modified[name]:sys.exit('Missing Overview default expansion in '+name)
# Verify change set first, then write all
for name,contents in modified.items():
 if contents!=original[name]:
  dst=backup/name;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(original[name])
for name,contents in modified.items():
 if contents!=original[name]:(root/name).write_text(contents);print('Updated '+name)
print('Backup:',backup)
