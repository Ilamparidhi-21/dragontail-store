BEGIN;
CREATE TABLE IF NOT EXISTS dt_orders (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 customer_id BIGINT NOT NULL REFERENCES dt_customers(id),
 order_number TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK(status IN ('awaiting_payment','paid','processing','shipped','delivered','cancelled','refunded')),
 payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','pending','paid','failed','refunded')),
 payment_provider TEXT NOT NULL DEFAULT 'not_configured',
 payment_reference TEXT,
 subtotal INTEGER NOT NULL CHECK(subtotal>=0),
 delivery_fee INTEGER NOT NULL DEFAULT 0 CHECK(delivery_fee>=0),
 total INTEGER NOT NULL CHECK(total>=0),
 recipient TEXT NOT NULL, email TEXT NOT NULL,
 address_line1 TEXT NOT NULL, address_line2 TEXT NOT NULL DEFAULT '',
 city TEXT NOT NULL, state TEXT NOT NULL, postal_code TEXT NOT NULL,
 admin_notes TEXT NOT NULL DEFAULT '', tracking_number TEXT NOT NULL DEFAULT '',
 customer_notified_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS dt_order_items (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 order_id BIGINT NOT NULL REFERENCES dt_orders(id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES dt_products(id),
 name TEXT NOT NULL, color TEXT NOT NULL, size TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 20),
 unit_price INTEGER NOT NULL CHECK(unit_price>=0)
);
CREATE INDEX IF NOT EXISTS dt_orders_customer ON dt_orders(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS dt_orders_status ON dt_orders(status,created_at DESC);
GRANT SELECT,INSERT,UPDATE ON dt_orders,dt_order_items TO dragontail_app;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO dragontail_app;
COMMIT;
