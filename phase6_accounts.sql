BEGIN;
CREATE TABLE IF NOT EXISTS dt_customers (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 display_name VARCHAR(100) NOT NULL,
 failed_logins INTEGER NOT NULL DEFAULT 0,
 locked_until TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS dt_customer_sessions (
 token_hash CHAR(64) PRIMARY KEY,
 customer_id BIGINT NOT NULL REFERENCES dt_customers(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dt_customer_session_expiry ON dt_customer_sessions(expires_at);
CREATE TABLE IF NOT EXISTS dt_customer_addresses (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 customer_id BIGINT NOT NULL REFERENCES dt_customers(id) ON DELETE CASCADE,
 label VARCHAR(30) NOT NULL DEFAULT 'Home',
 recipient VARCHAR(100) NOT NULL,
 address_line1 VARCHAR(180) NOT NULL,
 address_line2 VARCHAR(180) NOT NULL DEFAULT '',
 city VARCHAR(90) NOT NULL,
 state VARCHAR(90) NOT NULL,
 postal_code VARCHAR(12) NOT NULL,
 country CHAR(2) NOT NULL DEFAULT 'IN',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dt_customer_addresses_owner ON dt_customer_addresses(customer_id);
GRANT SELECT, INSERT, UPDATE ON dt_customers TO dragontail_app;
GRANT SELECT, INSERT, DELETE ON dt_customer_sessions TO dragontail_app;
GRANT SELECT, INSERT, DELETE ON dt_customer_addresses TO dragontail_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dragontail_app;
COMMIT;
