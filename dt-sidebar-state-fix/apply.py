from pathlib import Path
import shutil,sys,datetime
root=Path.cwd()
target=root/'src/components/AdminSidebar.tsx'
source=Path(__file__).with_name('AdminSidebar.tsx')
css=root/'src/app/admin/orders/orders.module.css'
if not target.is_file() or not css.is_file():sys.exit('Missing current sidebar or Orders CSS. Nothing changed.')
current=target.read_text()
if 'dtSharedOverview' not in current or 'dtSharedChildren' not in current:
 sys.exit('Sidebar differs from expected shared version; nothing changed.')
if 'dt-admin-overview-expanded' in current:
 print('Sidebar state fix already installed.');sys.exit(0)
backup=target.with_name('AdminSidebar.tsx.backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(target,backup)
target.write_text(source.read_text())
print('Updated:',target)
print('Backup:',backup)
print('Next: npm run build; restart PM2 only after success.')
