-- ============================================
-- PUNTO ELECTRO - E-Commerce Database Schema
-- ============================================
-- Stack: Supabase (PostgreSQL 15+)
-- Features: B2B/B2C, Bundles, Project Lists
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Brands (marcas)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, slug)
);

-- Products (including bundles)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  -- Bundle flag
  is_bundle BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),  -- Original/strikethrough price
  cost_price DECIMAL(12,2),        -- Internal cost (admin only)
  
  -- Inventory
  stock INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  track_inventory BOOLEAN DEFAULT TRUE,
  
  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs
  
  -- SEO & Display
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle Items (components of a bundle/kit)
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT unique_bundle_component UNIQUE (bundle_id, product_id),
  CONSTRAINT no_self_reference CHECK (bundle_id != product_id),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Product Specifications (key-value attributes)
CREATE TABLE IF NOT EXISTS product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(product_id, spec_key)
);

-- ============================================
-- USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,        -- B2B: Company/Business name
  cuit TEXT,                -- B2B: Tax ID (Argentina)
  is_b2b BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- B2B: PROJECT LISTS (LISTAS DE OBRA)
-- ============================================

CREATE TABLE IF NOT EXISTS project_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active_cart BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for one active cart per user
-- Uses partial unique index instead of DEFERRABLE constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_cart_per_user 
  ON project_lists(user_id) 
  WHERE is_active_cart = TRUE;

-- Project List Items
CREATE TABLE IF NOT EXISTS project_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES project_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, product_id)
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact & Shipping
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Totals
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Snapshot at time of order
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_image TEXT,
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  
  -- Bundle info (if applicable)
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_components JSONB,  -- Snapshot of components
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get effective stock for bundles (minimum of components)
CREATE OR REPLACE FUNCTION get_bundle_effective_stock(bundle_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    MIN(FLOOR(p.stock::NUMERIC / bi.quantity)::INTEGER),
    0
  )
  FROM bundle_items bi
  JOIN products p ON p.id = bi.product_id
  WHERE bi.bundle_id = bundle_uuid
    AND p.track_inventory = TRUE
$$ LANGUAGE sql STABLE;

-- Get product stock (handles both regular products and bundles)
CREATE OR REPLACE FUNCTION get_product_stock(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  product_record RECORD;
BEGIN
  SELECT is_bundle, stock, track_inventory 
  INTO product_record 
  FROM products 
  WHERE id = product_uuid;
  
  IF NOT product_record.track_inventory THEN
    RETURN 999999; -- Unlimited stock
  END IF;
  
  IF product_record.is_bundle THEN
    RETURN get_bundle_effective_stock(product_uuid);
  ELSE
    RETURN product_record.stock;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Deduct stock when order is confirmed
CREATE OR REPLACE FUNCTION deduct_order_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  bundle_component RECORD;
BEGIN
  -- Only process when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    FOR item IN 
      SELECT oi.*, p.is_bundle 
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = NEW.id
    LOOP
      IF item.is_bundle THEN
        -- Deduct from bundle components
        FOR bundle_component IN
          SELECT bi.product_id, bi.quantity
          FROM bundle_items bi
          WHERE bi.bundle_id = item.product_id
        LOOP
          UPDATE products 
          SET stock = stock - (bundle_component.quantity * item.quantity),
              updated_at = NOW()
          WHERE id = bundle_component.product_id
            AND track_inventory = TRUE;
        END LOOP;
      ELSE
        -- Deduct from product directly
        UPDATE products 
        SET stock = stock - item.quantity,
            updated_at = NOW()
        WHERE id = item.product_id
          AND track_inventory = TRUE;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_deduct_order_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_order_stock();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER tr_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_project_lists_updated_at
  BEFORE UPDATE ON project_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (catalog data)
CREATE POLICY "Public can view active brands" ON brands
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view bundle items" ON bundle_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = bundle_id AND is_active = TRUE)
  );

CREATE POLICY "Public can view product specs" ON product_specs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND is_active = TRUE)
  );

-- PROFILE policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECT LISTS policies (B2B feature)
CREATE POLICY "Users can view own project lists" ON project_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own project lists" ON project_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project lists" ON project_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project lists" ON project_lists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own list items" ON project_list_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_lists WHERE id = list_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own list items" ON project_list_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM project_lists WHERE id = list_id AND user_id = auth.uid())
  );

-- ORDER policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

-- ADMIN policies (staff can do everything)
CREATE POLICY "Admins have full access to brands" ON brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to bundle_items" ON bundle_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to product_specs" ON product_specs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins have full access to order_items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id);

CREATE INDEX IF NOT EXISTS idx_project_lists_user ON project_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_project_list_items_list ON project_list_items(list_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- SEED DATA (Sample categories)
-- ============================================

INSERT INTO categories (name, slug, display_order) VALUES
  ('Iluminación', 'iluminacion', 1),
  ('Electricidad', 'electricidad', 2),
  ('Herramientas', 'herramientas', 3),
  ('Cámaras y Seguridad', 'camaras-seguridad', 4)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Sub-categories for Iluminación
WITH parent AS (SELECT id FROM categories WHERE slug = 'iluminacion')
INSERT INTO categories (parent_id, name, slug, display_order) VALUES
  ((SELECT id FROM parent), 'Lámparas LED', 'lamparas-led', 1),
  ((SELECT id FROM parent), 'Iluminación Interior', 'iluminacion-interior', 2),
  ((SELECT id FROM parent), 'Iluminación Exterior', 'iluminacion-exterior', 3),
  ((SELECT id FROM parent), 'Tiras LED', 'tiras-led', 4)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Sub-categories for Electricidad
WITH parent AS (SELECT id FROM categories WHERE slug = 'electricidad')
INSERT INTO categories (parent_id, name, slug, display_order) VALUES
  ((SELECT id FROM parent), 'Cables', 'cables', 1),
  ((SELECT id FROM parent), 'Tableros y Gabinetes', 'tableros-gabinetes', 2),
  ((SELECT id FROM parent), 'Protecciones', 'protecciones', 3),
  ((SELECT id FROM parent), 'Llaves y Módulos', 'llaves-modulos', 4)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Sample brands
INSERT INTO brands (name, slug) VALUES
  ('MACROLED', 'macroled'),
  ('GENROD', 'genrod'),
  ('LCT', 'lct'),
  ('JADEVER', 'jadever'),
  ('JELUZ', 'jeluz')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
