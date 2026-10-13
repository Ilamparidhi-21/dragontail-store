BEGIN;
CREATE TABLE IF NOT EXISTS dt_inventory (
 product_id INTEGER NOT NULL REFERENCES dt_products(id) ON DELETE CASCADE,
 color TEXT NOT NULL,
 size TEXT NOT NULL,
 quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(product_id,color,size)
);
-- New and existing products start at zero until an administrator records real stock.
INSERT INTO dt_inventory(product_id,color,size,quantity)
SELECT p.id,c.color,s.size,0
FROM dt_products p CROSS JOIN LATERAL unnest(p.colors) AS c(color)
CROSS JOIN LATERAL unnest(p.sizes) AS s(size)
ON CONFLICT(product_id,color,size) DO NOTHING;
GRANT SELECT ON dt_inventory TO dragontail_app;
GRANT INSERT,UPDATE,DELETE ON dt_inventory TO dragontail_app;
COMMIT;
