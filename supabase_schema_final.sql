-- =====================================================
-- Punto Electro - Supabase Schema (PostgreSQL)
-- Final unified schema for MVP
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SITE CONFIG (JSON storage for all site settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BRANDS
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    description TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT FALSE,
    discount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    date TEXT,
    items JSONB DEFAULT '[]',
    delivery_method TEXT,
    delivery_address TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USERS (simple user storage, NOT Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (anyone can view)
CREATE POLICY "Public read access" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);

-- AUTHENTICATED INSERT/UPDATE/DELETE (for admin operations via anon key for MVP)
-- Note: In production, use proper Supabase Auth and service_role key for admin
CREATE POLICY "Anon full access" ON site_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON users FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- SEED: Initial site_config row
-- =====================================================
INSERT INTO site_config (id, data) 
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;
