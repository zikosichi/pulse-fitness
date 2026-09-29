BEGIN;
CREATE TABLE IF NOT EXISTS presale_orders (
  id text PRIMARY KEY,
  request_key uuid NOT NULL UNIQUE,
  session_hash text NOT NULL,
  fingerprint text NOT NULL,
  package_id text NOT NULL,
  package_name text NOT NULL,
  amount integer NOT NULL CHECK(amount > 0),
  regular_amount integer NOT NULL CHECK(regular_amount >= amount),
  currency text NOT NULL DEFAULT 'GEL' CHECK(currency = 'GEL'),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  lang text NOT NULL CHECK(lang IN ('ka','en')),
  terms_version text NOT NULL,
  origin text NOT NULL,
  status text NOT NULL DEFAULT 'initializing',
  bank_order_id text UNIQUE,
  bank_status text,
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  checked_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS presale_pending ON presale_orders(status, checked_at);
CREATE INDEX IF NOT EXISTS presale_session ON presale_orders(session_hash, created_at);
-- One first-month offer per phone, including concurrent and uncertain attempts.
-- Only a bank-confirmed failure releases eligibility for a new attempt.
CREATE UNIQUE INDEX IF NOT EXISTS presale_first_month_offer ON presale_orders(phone)
  WHERE package_id = 'monthly' AND amount < regular_amount AND status <> 'failed';
DROP INDEX IF EXISTS presale_first_month;
CREATE TABLE IF NOT EXISTS presale_rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  resets_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS presale_emails (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES presale_orders(id),
  kind text NOT NULL CHECK(kind IN ('customer','staff')),
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','review')),
  payload jsonb,
  attempts integer NOT NULL DEFAULT 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  lease_token uuid,
  provider_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE(order_id,kind,recipient)
);
CREATE INDEX IF NOT EXISTS presale_email_pending ON presale_emails(status,next_attempt_at);
CREATE TABLE IF NOT EXISTS presale_admin_sessions (
  token_hash text PRIMARY KEY,
  credential_version text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS presale_admin_expiry ON presale_admin_sessions(expires_at);
COMMIT;
