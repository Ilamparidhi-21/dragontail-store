DRAGONTAIL: Multi-photo color variants

1. Back up database and project before running patch.
2. Run SQL migration first: sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < phase_variant_images.sql
3. Run python3 apply.py from any directory (script looks for ~/dragontail).
4. npm run build in ~/dragontail. DO NOT restart PM2 if build fails.
5. pm2 restart dragontail --update-env

Use admin -> Products -> Edit product -> Colors. Add each color, then fill image URLs under IMAGES BY COLOR, one HTTPS URL per line, e.g. Beige front and Beige back; Black front and Black back. Save. The storefront's gallery arrows and swipe will use selected color photos. The two original image fields stay as fallback.

Requires product API and admin Products page structure from DRAGONTAIL phase 5/unified admin. Backups created under ~/.variant-gallery-backups/.

Note: product-card gallery navigates photos for the default color; to select colors open Quick View. Payment and order flows are unchanged.
