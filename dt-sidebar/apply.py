from pathlib import Path
import shutil,sys,datetime
root=Path.cwd()
component=Path(__file__).resolve().parent
files={
'src/app/admin/orders/OrdersClient.tsx':('orders','mobileMenu','setMobileMenu','orders.length'),
'src/app/admin/products/ProductsClient.tsx':('products','mobile','setMobile','products.length'),
'src/app/admin/collections/CollectionsClient.tsx':('collections','mobile','setMobile',None),
}
updates={}
for name,(section,mobile,setter,count) in files.items():
 p=root/name
 if not p.is_file():sys.exit('Missing: '+name)
 s=p.read_text()
 if "import AdminSidebar from '@/components/AdminSidebar';" in s:
  print('Already patched:',name);continue
 a=s.find('<aside className=')
 b=s.find('</aside>',a)
 if a<0 or b<0 or 'Admin navigation' not in s[a:b]:sys.exit('Unexpected sidebar layout: '+name+' — no files changed')
 b+=len('</aside>')
 replacement=f'<AdminSidebar active="{section}" mobile={{{mobile}}} onClose={{()=>{setter}(false)}}'+(f' count={{{count}}}' if count else '')+'/>'
 s=s[:a]+replacement+s[b:]
 s="import AdminSidebar from '@/components/AdminSidebar';\n"+s
 updates[p]=s
for src,dest in [('AdminSidebar.tsx',root/'src/components/AdminSidebar.tsx'),('sidebar.css',root/'src/components/sidebar.css')]:
 if not (component/src).exists():sys.exit('Patch file missing: '+src)
 if dest.exists() and 'dtShared' not in dest.read_text():sys.exit('Existing custom component: '+str(dest))
backup=root/('dt-sidebar-backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir()
for p,s in updates.items():
 shutil.copy2(p,backup/p.name.replace('.tsx','-'+p.parent.name+'.tsx'))
 p.write_text(s);print('Updated',p.relative_to(root))
for src,dest in [('AdminSidebar.tsx',root/'src/components/AdminSidebar.tsx'),('sidebar.css',root/'src/components/sidebar.css')]:
 dest.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(component/src,dest)
print('Backup:',backup)
print('Now run npm run build. Do not restart PM2 unless it passes.')
