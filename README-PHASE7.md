# DRAGONTAIL Phase 7A — Unpaid order requests, no payment processing

## Scope
- Existing homepage, cart, products, inventory, account and admin authentication retained.
- Logged-in customers can submit **unpaid order requests**.
- Prices and stock are rechecked server-side. No payment, stock reservation, or stock deduction.
- Admin order dashboard at `/admin/orders` lists incoming requests. Customer history at `/account/orders`.
- Optional SMTP emails: store-owner alert and customer acknowledgement. Emails are best effort; database remains authoritative.
- PATCH for fulfillment rejects all requests until payment_status is **paid** via verified integration. Do not manually update payment_status in SQL to bypass this safeguard.

## Safe deployment
1. Back up source and database. Verify ZIP contents before extracting.
2. `unzip -o ~/DRAGONTAIL-phase7a-order-requests.zip -d ~/dragontail`
3. `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < ~/dragontail/phase7_orders.sql`
4. `cd ~/dragontail && npm install nodemailer && npm install -D @types/nodemailer`
5. Configure `.env.production.local` (chmod 600):
   `ENABLE_ORDER_REQUESTS=true`
   `ORDERS_NOTIFY_EMAIL=owner@example.com`
   `SMTP_HOST=...` `SMTP_PORT=587` `SMTP_USER=...` `SMTP_PASSWORD=...` `SMTP_FROM=...`
   Configure a verified sending account; don't paste secrets into chat. Without SMTP, orders still save but **no emails are sent**.
6. `npm run build` — if failure, DO NOT RESTART PM2. After success, `pm2 restart dragontail --update-env && pm2 save`.
7. Test `/checkout`, `/admin/orders`, `/account/orders` on your **HTTPS** host. Verify unverified payment status remains `unpaid`.

## Before production / accepting orders
This is a limited development workflow, not a payments integration. It accepts order requests but cannot accept money, finalize purchases, reserve stock, or issue real paid-order confirmations. Add server-created Razorpay orders, verified webhook signature handling and idempotency, transactional stock decrement after verified capture, refunds/cancellations, shipping rules, verified email DNS, CSRF/rate limiting, privacy/retention and staging tests. Do not present an unpaid request as a confirmed purchase.
