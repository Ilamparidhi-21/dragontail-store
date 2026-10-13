# DRAGONTAIL Phase 9 — Shipping updates and email notifications

## Scope
- Keeps existing Orders dashboard and authentication.
- Adds courier and tracking details when an administrator marks a **verified paid** order shipped.
- Sends best-effort customer email on processing, shipped, delivered and cancelled transitions.
- Does not enable payments, mark unpaid orders paid, deduct stock or ship unpaid orders.
- Owner's new order email and customer's unpaid-request acknowledgement already exist in Phase 7A SMTP code.

## Deploy carefully
1. Backup source and database. Inspect the ZIP paths before extraction.
2. Extract into `~/dragontail`.
3. `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < ~/dragontail/phase9_shipping.sql`
4. `npm run build`. **Do not restart on failure.**
5. `pm2 restart dragontail --update-env && pm2 save` after successful build.

## SMTP setup
In `.env.production.local`, set `ORDERS_NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. Use a verified sender or transactional email provider and TLS. Never expose credentials. Environment file chmod 600. Without SMTP, orders and status transitions still persist but no emails are sent. Check PM2 logs for delivery failures. Never assume customer received an email just because a status was saved.

## Test
- New unpaid request: order appears in admin; test owner + customer mail if SMTP configured.
- Cancel unpaid request: allowed; email attempted.
- Processing/shipping/delivered on unpaid request: HTTP 409, must remain blocked.
- Once Razorpay is integrated and verified payment is recorded, test paid → processing → shipped (requires courier + tracking) → delivered and customer emails.
- A real deployment needs transactional outbox/retries, audit trail, rate limiting and verified payment webhooks before production.

This patch is adapted from the Phase 7A API and unified admin dashboard. If you have manually modified those files, diff and reconcile before overwriting. Current full EC2 project was not available for a verified Next.js build.
