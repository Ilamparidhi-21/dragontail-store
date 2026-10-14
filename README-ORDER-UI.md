# DRAGONTAIL Customer Order Experience

This patch changes only customer-facing order history and detail pages. No schema changes, no admin/API changes, no payment changes.

- `/account/orders` is the image-rich order list.
- `/account/orders/DT-XXXXXXXXXXXX` is an individual order detail page.
- Both pages use the current authenticated customer and query only orders belonging to that customer.
- Product image comes from the current catalog image; if a product image is changed later, historic orders will display the new image (a future schema migration should snapshot media for immutable history).
- Timeline is a display of the existing status; no invented timestamps.
- Cancelled, refunded and unpaid orders have separate messaging.
- Existing courier/tracking columns require Phase 9 migration.

## Deployment

From `~/dragontail`, back up `src/app/account/orders` and unzip the patch into the project root. Run `npm run build` and restart PM2 only if it succeeds.
