# DRAGONTAIL Collections & Storefront Refinement

## Included
- Admin `/admin/collections`: create, edit, publish/hide, order, assign products and optional cover images.
- New Arrivals: automatic view of products with `created_at` within 30 days.
- Customer homepage: curated collection cards and collection filters. Shop All still lists all published catalog items.
- New admin navigation entry in Orders and Products.

## Safe deployment
1. Back up source and database.
2. Extract patch at project root.
3. Apply `phase10_collections.sql` once using `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < phase10_collections.sql`.
4. Run `npm run build`; restart PM2 only on successful build.
5. Visit `/admin/collections`, assign products and save; then check storefront in a second tab.

The migration does not modify existing products, orders, inventory, or accounts. The new curated collections default to empty; only collections with assigned products appear on the homepage. The automatic New Arrivals filter is based on the database's product creation date. No images are auto-created.

Rollback: restore backed-up source and rebuild. Keep the added collection tables (harmless) or remove them only after confirming no data is needed.

Note: collections are independent of Women/Men/Accessories categories, and unpublished products remain hidden through the existing products API.
