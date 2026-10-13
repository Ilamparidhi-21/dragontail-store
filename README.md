# DRAGONTAIL — luxury storefront prototype

A responsive Next.js storefront with collection navigation, search, sorting, quick-view, size selection, wishlist, shopping bag, quantity controls and browser-local persistence.

## Local / Ubuntu EC2

Requires a supported Node.js LTS release (Node.js 20.9+ for Next.js 15; Node.js 22 LTS recommended).

```bash
npm install
npm run dev
```

Visit http://127.0.0.1:3000 or tunnel the port over SSH. For production:

```bash
npm run build
npm run start
```

For PM2: `pm2 start npm --name dragontail -- start && pm2 save`.

Configure Nginx to reverse proxy `127.0.0.1:3000`, with HTTPS. Keep port 3000 closed in the EC2 security group. Point GoDaddy DNS A `@` to an AWS Elastic IP attached to this instance, and set CNAME `www` to `@`.

## Scope / important limitations

This is **phase 1 frontend**, not a production ecommerce backend. The product catalog is demonstration data and photography is loaded from Unsplash. Cart and wishlist persist in the same browser via localStorage. No accounts, shipping quotes, transactional inventory, checkout, order storage or payment processing exist yet. Checkout is intentionally disabled and the newsletter is demonstrative only. Replace demo photography with appropriately licensed product assets before launch. No customer payment information is collected.

## Later production integrations

PostgreSQL/Prisma or a managed database; product and stock administration; S3 for approved product photos; Razorpay server-side orders and signed webhooks; authentication; transactional emails; rate limiting; privacy, terms, return and shipping policies; backups, monitoring and TLS.
