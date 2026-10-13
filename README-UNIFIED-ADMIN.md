# DRAGONTAIL Unified Admin (Orders + Products)

- `/admin/orders`: existing orders dashboard, now links to integrated Products and new-tab Storefront; avatar opens admin sign-out drawer.
- `/admin/products`: black-and-white dashboard with live product table, add/edit product drawer, publish/hide, and variant stock editor. Uses existing Phase 4/5 API routes and database.
- `/admin`: existing admin sign-in entry point remains unchanged.
- No database migration or new dependencies. All routes require existing server-side API authentication.
- This patch intentionally styles **admin** only; customer-facing storefront retains its separate luxury visual theme.

## Deployment
1. Back up `src` before applying.
2. `unzip -o ~/DRAGONTAIL-unified-admin.zip` from `~/dragontail`.
3. `npm run build`; **only if successful** restart using `pm2 restart dragontail --update-env`.
4. Visit `/admin/orders` and `/admin/products`. Sign in through `/admin` if necessary.
5. Add a test product, set variant stock, and use Storefront (new tab) to confirm.

**Note:** This patch changes the two admin views, not the older standalone `/admin` login/product studio. For unified navigation use `/admin/orders` or `/admin/products`.
