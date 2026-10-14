-- Non-destructive collection migration. Apply as postgres; existing catalog remains untouched.
CREATE TABLE IF NOT EXISTS dt_collections (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name VARCHAR(90) NOT NULL,
 slug VARCHAR(100) NOT NULL UNIQUE,
 description TEXT NOT NULL DEFAULT '',
 cover_image TEXT NOT NULL DEFAULT '',
 active BOOLEAN NOT NULL DEFAULT TRUE,
 sort_order INTEGER NOT NULL DEFAULT 100,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS dt_collection_products (
 collection_id BIGINT NOT NULL REFERENCES dt_collections(id) ON DELETE CASCADE,
 product_id INTEGER NOT NULL REFERENCES dt_products(id) ON DELETE CASCADE,
 PRIMARY KEY(collection_id,product_id)
);
INSERT INTO dt_collections (name,slug,description,sort_order) VALUES
('Essentials','essentials','Everyday signatures, refined.',10),
('Statement Pieces','statement-pieces','Pieces with presence.',20)
ON CONFLICT (slug) DO NOTHING;
GRANT SELECT,INSERT,UPDATE,DELETE ON dt_collections,dt_collection_products TO dragontail_app;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO dragontail_app;
