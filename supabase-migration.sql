-- =====================================
-- AUDITSEC - Migration Supabase PostgreSQL
-- =====================================
-- Ce fichier contient toutes les tables nécessaires pour AuditSec
-- À exécuter dans le SQL Editor de Supabase

-- =====================================
-- EXTENSIONS
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- =====================================
-- USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Email verification
  email_verification_token_hash TEXT,
  email_verification_expires_at TIMESTAMPTZ,
  
  -- Phone verification
  phone_verification_code_hash TEXT,
  phone_verification_expires_at TIMESTAMPTZ,
  
  -- Phone login (OTP)
  phone_auth_code_hash TEXT,
  phone_auth_expires_at TIMESTAMPTZ,
  
  -- Password reset
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  password_reset_sms_code_hash TEXT,
  password_reset_sms_expires_at TIMESTAMPTZ,
  
  -- OAuth identities
  oauth_google_sub TEXT,
  oauth_microsoft_sub TEXT,
  oauth_apple_sub TEXT,
  
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_users_oauth_google ON users(oauth_google_sub) WHERE oauth_google_sub IS NOT NULL;
CREATE UNIQUE INDEX idx_users_oauth_microsoft ON users(oauth_microsoft_sub) WHERE oauth_microsoft_sub IS NOT NULL;
CREATE UNIQUE INDEX idx_users_oauth_apple ON users(oauth_apple_sub) WHERE oauth_apple_sub IS NOT NULL;

-- =====================================
-- PRODUCTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  
  category TEXT NOT NULL CHECK (category IN ('tools', 'formation', 'database', 'comptes', 'pentest', 'osint', 'guides', 'videos')),
  type TEXT NOT NULL CHECK (type IN ('script', 'pdf', 'video', 'pack', 'tool', 'course', 'account', 'database', 'wordlist')),
  
  image TEXT DEFAULT '/images/default-product.jpg',
  file_url TEXT NOT NULL, -- S3 key or file identifier
  file_size TEXT DEFAULT 'N/A',
  
  download_count INTEGER DEFAULT 0,
  tags TEXT[], -- Array de tags
  
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches et filtres
CREATE INDEX idx_products_category ON products(category, active);
CREATE INDEX idx_products_featured ON products(featured, active);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_description_trgm ON products USING gin(description gin_trgm_ops);

-- =====================================
-- ORDERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'stripe',
  
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  
  -- Crypto payment data (JSONB pour flexibilité)
  crypto_payment_data JSONB,
  
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes efficaces
CREATE INDEX idx_orders_customer_email ON orders(customer_email, created_at DESC);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =====================================
-- ORDER ITEMS TABLE (relation many-to-many)
-- =====================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================
-- DOWNLOAD TOKENS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_download_tokens_token ON download_tokens(token);
CREATE INDEX idx_download_tokens_order ON download_tokens(order_id);
CREATE INDEX idx_download_tokens_expires ON download_tokens(expires_at);

-- =====================================
-- ACCOUNT PRODUCTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS account_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  
  service_name TEXT NOT NULL, -- Ex: "Spotify", "Netflix"
  account_type TEXT NOT NULL, -- Ex: "Premium", "Family"
  
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  additional_info JSONB, -- Infos supplémentaires (URL, codes, etc.)
  
  valid_until TIMESTAMPTZ NOT NULL,
  
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'expired', 'blocked')),
  
  delivery_template TEXT NOT NULL,
  usage_instructions TEXT NOT NULL,
  
  region TEXT DEFAULT 'Global',
  features TEXT[], -- Liste des fonctionnalités
  
  warning_message TEXT DEFAULT 'Ce compte est fourni à des fins de test uniquement. Respectez les conditions d''utilisation du service.',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_products_product ON account_products(product_id);
CREATE INDEX idx_account_products_service ON account_products(service_name);
CREATE INDEX idx_account_products_status ON account_products(status);
CREATE INDEX idx_account_products_valid_until ON account_products(valid_until);

-- =====================================
-- PROJECTS TABLE (Client Portal)
-- =====================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT DEFAULT 'idle',
  last_result JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- =====================================
-- AUDITS TABLE (Client Portal)
-- =====================================
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  mode TEXT NOT NULL DEFAULT 'active',
  
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  
  result_json JSONB,
  error_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

-- =====================================
-- AI CONVERSATIONS TABLE (Client Portal)
-- =====================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- =====================================
-- AI MESSAGES TABLE (Client Portal)
-- =====================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

-- =====================================
-- TRIGGERS pour updated_at automatique
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_products_updated_at BEFORE UPDATE ON account_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================
-- À configurer selon vos besoins de sécurité
-- Exemple pour les projets/audits (accès uniquement à ses propres données)

-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- DONNÉES DE TEST (optionnel)
-- =====================================
-- Décommentez si vous voulez des données de test

-- INSERT INTO users (email, password_hash, first_name, last_name) VALUES
-- ('test@auditsec.com', '$2b$10$example', 'Test', 'User');

-- INSERT INTO products (name, description, price, category, type, file_url) VALUES
-- ('Script OSINT Pro', 'Script Python pour OSINT avancé', 29.99, 'osint', 'script', 's3://auditsec/products/osint-pro.zip'),
-- ('Guide Pentest Web', 'PDF complet sur le pentest web', 19.99, 'guides', 'pdf', 's3://auditsec/products/guide-pentest.pdf');

-- =====================================
-- FIN DU SCRIPT
-- =====================================
