from pathlib import Path
import shutil, datetime, sys
path=Path('src/app/admin/products/ProductsClient.tsx')
css=Path('src/app/admin/products/products.css')
if not path.exists() or not css.exists(): sys.exit('Run in ~/dragontail: Products client or CSS missing.')
s=path.read_text()
anchor=" const shown=useMemo(()=>products.filter(p=>[p.name,p.type,p.category,String(p.id)].some(v=>v.toLowerCase().includes(search.toLowerCase()))),[products,search]);"
replacement=""" const [categoryFilter,setCategoryFilter]=useState('All');
 const [visibilityFilter,setVisibilityFilter]=useState('All');
 const [stockFilter,setStockFilter]=useState('All');
 const shown=useMemo(()=>products.filter(p=>{
  const q=search.trim().toLowerCase();
  const matchesSearch=[p.name,p.type,p.category,String(p.id)].some(v=>v.toLowerCase().includes(q));
  const units=(p.inventory||[]).reduce((total,line)=>total+Number(line.quantity||0),0);
  return matchesSearch && (categoryFilter==='All'||p.category===categoryFilter)
   && (visibilityFilter==='All'||(visibilityFilter==='Published'?p.active:!p.active))
   && (stockFilter==='All'||(stockFilter==='In stock'?units>0:stockFilter==='Out of stock'?units===0:units>0&&units<=5));
 }),[products,search,categoryFilter,visibilityFilter,stockFilter]);"""
old="""<section className={styles.listCard}><div className={styles.filters}><div className={styles.searchBox}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." aria-label="Search products"/></div><span style={{color:'#777'}}>{shown.length} products {loading?'· Loading...':''}</span></div>"""
new="""<section className={styles.listCard}>
    <div className="dtProductFilters">
      <div className="dtCategoryTabs" role="group" aria-label="Filter product category">{['All','Men','Women','Accessories'].map(c=><button key={c} type="button" aria-pressed={categoryFilter===c} className={categoryFilter===c?'dtCategoryActive':''} onClick={()=>setCategoryFilter(c)}>{c} <span>{c==='All'?products.length:products.filter(p=>p.category===c).length}</span></button>)}</div>
      <div className="dtFilterControls">
        <label>Visibility<select aria-label="Filter visibility" value={visibilityFilter} onChange={e=>setVisibilityFilter(e.target.value)}><option>All</option><option>Published</option><option>Hidden</option></select></label>
        <label>Inventory<select aria-label="Filter stock" value={stockFilter} onChange={e=>setStockFilter(e.target.value)}><option value="All">All</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select></label>
        {(categoryFilter!=='All'||visibilityFilter!=='All'||stockFilter!=='All'||search)&&<button type="button" className="dtClearFilters" onClick={()=>{setCategoryFilter('All');setVisibilityFilter('All');setStockFilter('All');setSearch('')}}>Clear filters</button>}
      </div>
    </div>
    <div className={styles.filters}><div className={styles.searchBox}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." aria-label="Search products"/></div><span style={{color:'#777'}} aria-live="polite">{shown.length} of {products.length} products {loading?'· Loading...':''}</span></div>"""
if 'dtCategoryTabs' in s: sys.exit('Filters already present; no changes applied.')
if s.count(anchor)!=1 or s.count(old)!=1: sys.exit('Current source differs from tested version. No changes applied. Please share the current ProductsClient.tsx.')
cssadd="""\n/* Products dashboard filtering (category, visibility, stock) */
.dtProductFilters{display:flex;flex-direction:column;gap:14px;padding:16px 20px 12px;border-bottom:1px solid #e9e9e9;background:#fff}
.dtCategoryTabs{display:flex;align-items:center;gap:22px;overflow-x:auto;scrollbar-width:thin}
.dtCategoryTabs button{white-space:nowrap;display:flex;align-items:center;gap:7px;border:0;border-bottom:2px solid transparent;padding:8px 1px 11px;background:transparent;color:#707070;cursor:pointer;font-size:13px}
.dtCategoryTabs button.dtCategoryActive{border-bottom-color:#171717;color:#171717;font-weight:650}
.dtCategoryTabs button span{font-size:11px;color:#888}
.dtFilterControls{display:flex;gap:12px;align-items:end;flex-wrap:wrap}
.dtFilterControls label{display:flex;flex-direction:column;gap:5px;font-size:11px;color:#666}
.dtFilterControls select{background:#fff;border:1px solid #dedede;border-radius:5px;color:#171717;padding:9px 30px 9px 11px;min-width:150px;font-size:12px}
.dtClearFilters{border:0;background:transparent;padding:10px 3px;font-size:12px;color:#333;text-decoration:underline;cursor:pointer}
@media(max-width:620px){.dtProductFilters{padding:13px 14px}.dtCategoryTabs{gap:17px}.dtFilterControls label{flex:1;min-width:125px}.dtFilterControls select{width:100%;min-width:0}}\n"""
backup=Path.home()/('dragontail-product-filter-backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True,exist_ok=True)
shutil.copy2(path,backup/path.name);shutil.copy2(css,backup/css.name)
path.write_text(s.replace(anchor,replacement,1).replace(old,new,1))
css.write_text(css.read_text()+cssadd)
print('Patched category tabs, visibility and stock filters.')
print('Backups:',backup)
print('Next: npm run build; restart PM2 only if successful.')
