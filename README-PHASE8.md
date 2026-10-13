# DRAGONTAIL Phase 8 — Checkout UI, Razorpay-ready (no payments)

This patch upgrades `/checkout` to a black-and-white, responsive delivery/review flow. Reuses your existing Phase 6 customer addresses and Phase 7A unpaid order-request POST API. Adds `/api/checkout/quote` which authenticates the customer, validates a cart against the private PostgreSQL inventory, and prices all items on the server.

**No payment is made.** No Razorpay credentials are needed; no order is marked paid; no inventory is reserved or deducted. The request remains `unpaid`, and the existing owner/customer order-request SMTP notifications remain optional.

## Requirements
Phase 5 inventory, Phase 6 customer account APIs, Phase 7A order tables and `/api/orders` endpoint installed. `ENABLE_ORDER_REQUESTS=true` in `.env.production.local` for unpaid requests. HTTPS enabled and functional. Existing customer sign-in must work. 

## Deploy safely
1. Upload ZIP to `/home/ubuntu/`. Use maintenance window on single EC2 instance because a build replaces `.next` assets.
2. `cd ~/dragontail && mkdir -p ~/dragontail-backups/phase8`
3. `cp -a src/app/checkout ~/dragontail-backups/phase8/`
4. `unzip -o ~/DRAGONTAIL-phase8-checkout.zip -d ~/dragontail`
5. `npm run build`
6. **Only after build succeeds:** `pm2 restart dragontail --update-env && pm2 save`
7. Visit `https://13-207-192-30.sslip.io/checkout` while signed in, with items in your bag. Verify address selection, quote, review, then submit an unpaid request. Confirm it appears at `/admin/orders` and `/account/orders`.

## Razorpay phase after account verification
Implement server-side Razorpay order creation using official credentials; never trust browser price; independently verify signed webhook and payment status; idempotent processing; row-level locks + atomic stock deduction only once after payment capture; handle declined/duplicate/replayed webhooks, cancellation, refunds, and emails from verified transitions. Do not allow unpaid orders to be fulfilled. Add rate limiting, CSRF validation and a resilient transactional email outbox before public launch.

## Limitations
Quote is an availability snapshot, not a stock reservation; it may change between review and submission. Existing `/api/orders` revalidates prices and inventory. Delivery charge is currently ₹0 pending shipping policy; no Razorpay test/live checkout is exposed.
