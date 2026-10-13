# DRAGONTAIL — Order dashboard visual upgrade

Only replaces `src/app/admin/orders/page.tsx` and adds `src/app/admin/orders/orders.module.css`.
Requires the Phase 7A `/api/admin/orders` API and `dt_orders` tables already installed.
No database migration, no new dependencies (uses existing lucide-react), no Razorpay changes.

Features: black sidebar, metric strip, search/filter/sort, order table, CSV export, details drawer, existing guarded status workflow, tracking entry on shipped transition.

Metrics and export cover latest 200 records returned by API, NOT full accounting or settlement history. Paid order value is a sum of returned rows with payment_status=paid, not a financial ledger. No manual Create order UI because backend does not support that yet. Customers/Analytics/Settings sidebar placeholders are intentionally disabled.

Deployment: back up `src/app/admin/orders`, unzip at `~/dragontail`, `npm run build`, then ONLY ON SUCCESS `pm2 restart dragontail --update-env && pm2 save`.

Security: admin API requires session. Client-side visibility is never a security boundary. Payment status may only be advanced by future verified payment backend. Orders are currently unpaid requests, not confirmed purchases.
