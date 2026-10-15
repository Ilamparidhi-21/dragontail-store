# DRAGONTAIL — Unified Admin navigation and product actions

Changes: Orders, Products and Collections as sibling links nested under expandable Overview; compact product search/category/filters toolbar; three-dot action menu; confirmed archive-style Delete.

Archive is a soft delete (`dt_products.deleted_at`) and sets `active=false`. Historic orders remain. No public permanent-deletion feature is exposed. For recovery, a database administrator can set `deleted_at=NULL` after reviewing the specific product (and decide separately whether to republish). Never run bulk recovery SQL without confirming IDs.

## EC2 installation

1. Upload archive to `/home/ubuntu`.
2. `cd ~/dragontail`
3. Back up database: `sudo -u postgres pg_dump -Fc dragontail_db > ~/dragontail-before-admin-ui.dump`
4. Unpack: `unzip -o ~/DRAGONTAIL-admin-navigation-actions.zip -d ~/dragontail`
5. Apply migration: `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < dt-admin-patch/phase_admin_soft_delete.sql`
6. Apply source: `python3 dt-admin-patch/apply.py`
7. Build: `npm run build`
8. ONLY if build succeeds: `pm2 restart dragontail --update-env && pm2 save`

The script checks for the previously deployed product filter markup; it stops without changes if source differs. It backs up every changed source file into a timestamped folder in the user's home directory.

Note: the SQL migration is additive and safe to rerun. Archived products are absent from active admin/public catalog. Historical order line snapshots are unchanged. This patch intentionally does not alter existing database records until an administrator selects Delete and confirms.

## Rollback

If the build fails, do not restart PM2. Restore source from the timestamped `~/dragontail-admin-ui-backup-*` folder reported by the script, preserving relative paths, and rebuild. The additive `deleted_at` column can remain harmlessly in the database. After an archive operation, rollback of the UI does not automatically unarchive that product.

## Notes

- The order and collection admin pages must be based on the version with `OrdersClient.tsx` / `CollectionsClient.tsx` and shared CSS from earlier phases.
- Product row uses the ellipsis menu: Edit, Stock, Hide/Publish, Delete.
- Delete requires typing `DELETE` and is enforced by the server.
- `New Arrivals` or existing manually curated collections remain independent of Products in the sidebar.
