from pathlib import Path
import re, shutil, datetime, sys
root=Path.cwd()
files={
 'products':Path('src/app/admin/products/ProductsClient.tsx'),
 'orders':Path('src/app/admin/orders/OrdersClient.tsx'),
 'collections':Path('src/app/admin/collections/CollectionsClient.tsx'),
 'product_css':Path('src/app/admin/products/products.css'),
 'sidebar_css':Path('src/app/admin/orders/orders.module.css'),
 'admin_api':Path('src/app/api/admin/products/route.ts'),
 'store_api':Path('src/app/api/products/route.ts'),
}
for k,p in files.items():
 if not p.exists():sys.exit(f'Missing {p}. No changes made.');
src={k:p.read_text() for k,p in files.items()}
# prerequisite: the products filter patch and the unified collections client are already deployed
if 'dtCategoryTabs' not in src['products'] or 'dtFilterControls' not in src['products']:
 sys.exit('Products category filters not detected. Please share current ProductsClient.tsx. No changes made.')
if '<nav aria-label="Admin navigation">' not in src['orders'] or '<nav aria-label="Admin navigation">' not in src['products'] or '<nav aria-label="Admin navigation">' not in src['collections']:
 sys.exit('Admin nav structure differs. No changes made.')
if 'deleted_at' in src['admin_api']:sys.exit('Product soft-delete migration already applied; no changes made.')
# shared menu is intentionally component-local and class-scoped through existing CSS module
for name in ('orders','products','collections'):
 s=src[name]
 nav=re.search(r'<nav aria-label="Admin navigation">.*?</nav>',s,re.S)
 if not nav:sys.exit(f'Cannot locate {name} sidebar; no changes made.')
 selected={'orders':'Orders','products':'Products','collections':'Collections'}[name]
 mobileVar='mobileMenu' if name=='orders' else 'mobile'
 setter='setMobileMenu' if name=='orders' else 'setMobile'
 newnav=(f'<nav aria-label="Admin navigation"><button type="button" className={{`${{styles.navItem}} dtOverviewButton`}} '
         f'aria-expanded={{overviewOpen}} onClick={{()=>setOverviewOpen(v=>!v)}}><LayoutDashboard size={{17}}/>Overview '
         f'<span className="dtOverviewChevron">{{overviewOpen?"−":"+"}}</span></button>'
         f'{{overviewOpen&&<div className="dtOverviewChildren">'
         f'{{[{{label:"Orders",href:"/admin/orders",Icon:ShoppingBag}},{{label:"Products",href:"/admin/products",Icon:Package}},{{label:"Collections",href:"/admin/collections",Icon:Layers3}}].map(n=><Link key={{n.label}} href={{n.href}} '
         f'onClick={{()=>{setter}(false)}} className={{`${{styles.navItem}} ${{n.label==="{selected}"?styles.navActive:""}}`}}><n.Icon size={{17}}/>{{n.label}}'
         f'{{n.label==="Orders"&&{str(name=="orders").lower()}&&<span className={{styles.navCount}}>{{orders.length}}</span>}}'
         f'{{n.label==="Products"&&{str(name=="products").lower()}&&<span className={{styles.navCount}}>{{products.length}}</span>}}</Link>)}}</div>}}'
         f'<Link className={{styles.navItem}} href="/" target="_blank" rel="noopener noreferrer" onClick={{()=>{setter}(false)}}><ArrowUpRight size={{17}}/>Storefront</Link>'
         '<div className={styles.navDivider}/><div className={styles.navMuted}><Users size={17}/>Customers<small>SOON</small></div>'
         '<div className={styles.navMuted}><BarChart3 size={17}/>Analytics<small>SOON</small></div>'
         '<div className={styles.navMuted}><Settings size={17}/>Settings<small>SOON</small></div></nav>')
 # avoid vars referencing undefined 'orders' and 'products' when false in JSX? && false && orders.length JS short circuit yes TS still checks unresolved ids. replace those sections per page.
 newnav=re.sub(r'\{n.label==="Orders"&&false&&<span.*?</span>\}','',newnav)
 newnav=re.sub(r'\{n.label==="Products"&&false&&<span.*?</span>\}','',newnav)
 s=s[:nav.start()]+newnav+s[nav.end():]
 # add hook in component; shared state name consistent
 marker=' const [products,setProducts]' if name=='products' else (' const [orders,setOrders]' if name=='orders' else ' const [list,setList]')
 if marker not in s:sys.exit(f'Cannot identify state in {name}. No changes made.')
 s=s.replace(marker," const [overviewOpen,setOverviewOpen]=useState(true);\n"+marker,1)
 if 'Layers3' not in s.split("from 'lucide-react'")[0]:
  s=s.replace("} from 'lucide-react';",",Layers3} from 'lucide-react';",1)
 src[name]=s
# swap product action buttons with safe popover menu using native details, plus explicit confirmation
s=src['products']
a='<div className="dtBtns"><button onClick={()=>edit(p)}>Edit</button><button onClick={()=>stockOpen(p)}>Stock</button><button disabled={busy} onClick={()=>void changeVisibility(p)}>{p.active?\'Hide\':\'Publish\'}</button></div>'
if a not in s:sys.exit('Product action controls differ. No changes made.')
b='''<details className="dtActionMenu"><summary aria-label={`Actions for ${p.name}`} title="Product actions">•••</summary><div className="dtActionItems"><button onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");edit(p)}}>✎ Edit product</button><button onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");stockOpen(p)}}>▣ Manage stock</button><button disabled={busy} onClick={()=>void changeVisibility(p)}>{p.active?'◉ Hide product':'◉ Publish product'}</button><button className="dtDeleteAction" disabled={busy} onClick={()=>void archiveProduct(p)}>Delete product…</button></div></details>'''
s=s.replace(a,b,1)
needle=' const stockOpen=(p:P)=>'
if needle not in s:sys.exit('Cannot find stockOpen. No changes made.')
archive=''' const archiveProduct=async(p:P)=>{if(!p.id||busy)return;const typed=window.prompt(`To remove “${p.name}” from the catalog, type DELETE.\\nThis is a recoverable archive; historical order data is kept.`);if(typed!=='DELETE')return;setBusy(true);setError('');try{const r=await fetch('/api/admin/products',{method:'DELETE',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,confirm:'DELETE'})});const result=await r.json();if(!r.ok)throw new Error(result.error||'Could not delete product');setNotice('Product archived and removed from active catalog. Historical orders are preserved.');await load()}catch(e){setError(e instanceof Error?e.message:'Could not delete product')}finally{setBusy(false)}};
'''
s=s.replace(needle,archive+needle,1)
# compact the product filter toolbar without changing filtering logic
fstart=s.find('<div className="dtProductFilters">')
fend=s.find('<div className={styles.tableScroll}>',fstart)
if fstart<0 or fend<0:sys.exit('Filter toolbar missing; no changes made.')
newfilter='''<div className="dtCompactToolbar"><div className={styles.searchBox}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." aria-label="Search products"/></div><label className="dtCompactCategory"><span>Category</span><select aria-label="Product category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>{['All','Men','Women','Accessories'].map(c=><option key={c} value={c}>{c==='All'?'All categories':c}</option>)}</select></label><details className="dtCompactFilters"><summary>Filters {visibilityFilter!=='All'||stockFilter!=='All'?'●':''}</summary><div className="dtCompactFilterPopup"><label>Visibility<select value={visibilityFilter} onChange={e=>setVisibilityFilter(e.target.value)}><option>All</option><option>Published</option><option>Hidden</option></select></label><label>Inventory<select value={stockFilter} onChange={e=>setStockFilter(e.target.value)}><option>All</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select></label></div></details><span className="dtFilteredCount">{shown.length} of {products.length} products</span>{(categoryFilter!=='All'||visibilityFilter!=='All'||stockFilter!=='All'||search)&&<button className="dtClearFilters" onClick={()=>{setCategoryFilter('All');setVisibilityFilter('All');setStockFilter('All');setSearch('')}}>Clear</button>}</div>'''
s=s[:fstart]+newfilter+s[fend:]
src['products']=s
# API soft delete
s=src['admin_api']
s=s.replace('FROM dt_products ORDER BY id DESC LIMIT 500','FROM dt_products WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 500')
s=s.replace('WHERE id=$12 RETURNING id','WHERE id=$12 AND deleted_at IS NULL RETURNING id')
s=s.replace("try{await db.query('UPDATE dt_products SET active=false,updated_at=NOW() WHERE id=$1',[id]);return NextResponse.json({ok:true})}","if((await req.clone().json().catch(()=>null))?.confirm!=='DELETE')return NextResponse.json({error:'Type DELETE to confirm'},{status:400});try{const r=await db.query('UPDATE dt_products SET active=false,deleted_at=NOW(),updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id',[id]);return r.rowCount?NextResponse.json({ok:true}):NextResponse.json({error:'Not found'},{status:404})}")
# avoid reading req body twice: original DELETE already consumed. replace full DELETE with correct one
pos=s.index('export async function DELETE(')
s=s[:pos]+'''export async function DELETE(req:NextRequest){if(!await authenticated())return deny();const body=await req.json().catch(()=>null);const id=Number(body?.id);if(!Number.isInteger(id)||id<1||body?.confirm!=='DELETE')return NextResponse.json({error:'Valid product and DELETE confirmation required'},{status:400});try{const r=await db.query('UPDATE dt_products SET active=false,deleted_at=NOW(),updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id',[id]);return r.rowCount?NextResponse.json({ok:true}):NextResponse.json({error:'Product not found'},{status:404})}catch{return NextResponse.json({error:'Database error'},{status:503})}}\n'''
src['admin_api']=s
s=src['store_api'].replace('WHERE active = true ORDER BY','WHERE active = true AND deleted_at IS NULL ORDER BY');src['store_api']=s
src['sidebar_css']+='''\n/* Unified expandable Overview navigation */
.sidebar nav .dtOverviewButton{font:inherit;background:transparent;border:0;text-align:left;cursor:pointer}
.sidebar nav .dtOverviewButton:hover{background:#2b2c2d}
.sidebar nav .dtOverviewChildren{margin-left:18px;border-left:1px solid #454545;padding-left:7px}
.sidebar nav .dtOverviewChildren a{padding:10px 12px}
.sidebar nav .dtOverviewChevron{margin-left:auto;color:#aaa}
'''
src['product_css']+='''\n/* Compact product toolbar and explicit contextual actions */
.dtCompactToolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid #e8e8e8;background:#fff}
.dtCompactToolbar .dtCompactCategory{display:flex;align-items:center;gap:7px;font-size:12px;color:#666}
.dtCompactToolbar select,.dtCompactFilters summary{border:1px solid #ddd;border-radius:6px;background:#fff;padding:10px 12px;color:#222;font-size:12px}
.dtCompactFilters{position:relative}.dtCompactFilters summary{cursor:pointer;list-style:none}.dtCompactFilterPopup{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #ddd;box-shadow:0 8px 24px #0002;z-index:5;min-width:215px;padding:14px;display:grid;gap:12px}.dtCompactFilterPopup label{display:grid;gap:6px;font-size:12px}
.dtFilteredCount{margin-left:auto;color:#777;font-size:12px}.dtCompactToolbar .dtClearFilters{background:none;border:0;text-decoration:underline;font-size:12px;color:#333}
.dtActionMenu{position:relative;display:inline-block}.dtActionMenu summary{list-style:none;border:1px solid #ddd;border-radius:5px;padding:6px 12px;cursor:pointer;font-weight:bold;letter-spacing:2px}.dtActionMenu summary::-webkit-details-marker{display:none}
.dtActionItems{position:absolute;right:0;top:calc(100% + 4px);display:grid;min-width:185px;padding:6px;background:white;border:1px solid #ddd;box-shadow:0 8px 28px #0002;z-index:20}.dtActionItems button{border:0;background:#fff;padding:11px;text-align:left;white-space:nowrap;cursor:pointer}.dtActionItems button:hover{background:#f4f4f4}.dtActionItems button.dtDeleteAction{color:#af2525;border-top:1px solid #eee}
@media(max-width:650px){.dtCompactToolbar{padding:12px}.dtCompactToolbar .dtFilteredCount{margin-left:0}.dtCompactToolbar .dtCompactCategory{flex:1}.dtCompactToolbar .dtCompactCategory select{width:100%}}
'''
# guard all paths and prepare backup atomically
for key, p in files.items():
 if not isinstance(src[key],str):sys.exit(f'Missing generated content: {key}')
backup=Path.home()/('dragontail-admin-ui-backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
for key,p in files.items():
 dest=backup/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
for key,p in files.items():p.write_text(src[key])
print('Patched navigation, compact filters, contextual actions and soft-delete API.')
print('Backup:',backup)
print('Apply the migration BEFORE starting the updated application.')
