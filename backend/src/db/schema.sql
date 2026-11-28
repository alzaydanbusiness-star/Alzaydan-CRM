-- ==============================================================
-- AL ZAYDAN INTERNATIONAL FZE CRM - CLOUDFLARE D1 DATABASE SCHEMA
-- Database: al-zaydan-crm-db (d4a568fa-8a32-4253-905e-6b2524c503bb)
-- ==============================================================

-- 1. USERS & EMPLOYEES DIRECTORY
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- 'super_admin', 'manager', 'team_lead', 'sales_executive'
  designation TEXT DEFAULT 'Sales Executive',
  mobile TEXT,
  status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  lead_name TEXT NOT NULL,
  company_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT DEFAULT 'Inbound Direct',
  assigned_to TEXT,
  status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Qualified', 'Lost'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. OPPORTUNITIES PIPELINE
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  customer TEXT NOT NULL,
  owner TEXT NOT NULL,
  stage TEXT DEFAULT 'Enquiry', -- 'Enquiry', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'
  win_probability INTEGER DEFAULT 10,
  amount REAL DEFAULT 0,
  close_date TEXT,
  date TEXT,
  status TEXT DEFAULT 'Open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. QUOTATIONS / COMMERCIAL OFFERS
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_no TEXT UNIQUE NOT NULL,
  opportunity_ref TEXT,
  customer TEXT NOT NULL,
  owner TEXT NOT NULL,
  subtotal REAL DEFAULT 0,
  vat REAL DEFAULT 0,
  total REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. SALES ORDERS
CREATE TABLE IF NOT EXISTS sales_orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  quotation_ref TEXT,
  customer TEXT NOT NULL,
  owner TEXT NOT NULL,
  total REAL DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. TAX INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  order_ref TEXT,
  customer TEXT NOT NULL,
  owner TEXT NOT NULL,
  amount REAL NOT NULL,
  advance_paid REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Partially Paid', 'Paid'
  trn TEXT DEFAULT '100 234 567 800 003',
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. PAYMENT RECEIPTS
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  payment_type TEXT NOT NULL, -- 'Cash', 'Bank Transfer', 'Cheque'
  bank_name TEXT NOT NULL,
  ref_no TEXT NOT NULL,
  invoice_ref TEXT,
  amount REAL NOT NULL,
  shipping_cost REAL DEFAULT 0,
  status TEXT DEFAULT 'Cleared',
  created_by TEXT NOT NULL,
  tags TEXT,
  notes TEXT,
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. INVENTORY PRODUCTS
CREATE TABLE IF NOT EXISTS inventory_products (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  selling_price REAL NOT NULL,
  purchase_price REAL,
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'PCS',
  low_stock_alert INTEGER DEFAULT 5,
  primary_image TEXT,
  spec_image TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. DOCUMENT LINE ITEMS (Products attached to Invoices, Receipts, Quotations)
CREATE TABLE IF NOT EXISTS document_items (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'INVOICE', 'RECEIPT', 'QUOTATION', 'ORDER'
  item_name TEXT NOT NULL,
  item_code TEXT,
  brand TEXT,
  quantity INTEGER DEFAULT 1,
  price REAL NOT NULL,
  total REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  trn TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  customer TEXT,
  assigned_to TEXT,
  priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  due_date TEXT,
  status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- INITIAL SEED DATA (For Immediate Verification)
-- ==============================================================

-- Seed Users
INSERT OR IGNORE INTO users (id, name, email, role, designation, mobile, status)
VALUES 
  ('usr-01', 'MUHAMMED RISWAN', 'riswan@alzaydanfze.com', 'super_admin', 'Managing Director', '+971 50 111 2233', 'Active'),
  ('usr-02', 'muhammed shibil', 'shibil@alzaydanfze.com', 'sales_executive', 'Sales Executive', '+971 50 222 3344', 'Active'),
  ('usr-03', 'shemin', 'shemin@alzaydanfze.com', 'sales_executive', 'Sales Executive', '+971 58 526 2058', 'Active');

-- Seed Customers
INSERT OR IGNORE INTO customers (id, name, contact_person, email, phone, address, trn)
VALUES 
  ('cust-01', 'mustafa', 'Mustafa Ali', 'mustafa@client.ae', '+971 56 789 0987', 'Dubai Industrial City', '100 234 567 800 001'),
  ('cust-02', 'Shaheer', 'Shaheer Khan', 'shaheer@client.ae', '+971 55 123 4567', 'Mussafah, Abu Dhabi', '100 234 567 800 002'),
  ('cust-03', 'Jamshl', 'Jamshl PK', 'jamshl@client.ae', '+971 52 345 6789', 'Sharjah Industrial 10', '100 234 567 800 003');

-- Seed Inventory
INSERT OR IGNORE INTO inventory_products (id, product_name, product_code, category, selling_price, purchase_price, stock_quantity, unit, low_stock_alert, description)
VALUES 
  ('prod-01', 'tap', 'DGGFG43', 'new', 35567.00, 34543.00, 12, 'PCS', 5, 'Heavy duty industrial tap mechanism with multi-layer coating.'),
  ('prod-02', 'glue', 'tdtykhfg55', 'General', 525.00, 480.00, 40, 'PCS', 10, 'High-strength industrial adhesive.');

-- Seed Opportunities
INSERT OR IGNORE INTO opportunities (id, code, title, customer, owner, stage, win_probability, amount, date, status)
VALUES 
  ('opp-01', 'CTEQ#1795158143533', 'product', 'mustafa', 'muhammed riswan', 'Enquiry', 35, 2100.00, '16-11-2026', 'Open'),
  ('opp-02', 'CTEQ#1795158143532', 'Tap', 'Jamshl', 'muhammed shibil', 'Enquiry', 10, 35567.00, '16-11-2026', 'Open');

-- Seed Invoices
INSERT OR IGNORE INTO invoices (id, invoice_no, order_ref, customer, owner, amount, advance_paid, balance, status, trn, date)
VALUES 
  ('inv-01', 'CTINV#15259', 'CTSO#3954', 'Shaheer', 'MUHAMMED RISWAN', 2100.00, 2100.00, 0.00, 'Paid', '100 234 567 800 003', '16-11-2026'),
  ('inv-02', 'CTINV#15261', 'CTSO#3955', 'mustafa', 'muhammed riswan', 2100.00, 2100.00, 0.00, 'Paid', '100 234 567 800 003', '16-11-2026');

-- Seed Receipts
INSERT OR IGNORE INTO receipts (id, receipt_no, customer, payment_type, bank_name, ref_no, invoice_ref, amount, status, created_by, notes, date)
VALUES 
  ('rec-01', 'CTRV#1235', 'Shaheer', 'Cash', 'Cash Counter', 'CASH-REC-7539', 'CTINV#15259', 2100.00, 'Cleared', 'MUHAMMED RISWAN', 'Commercial Payment Settlement for Shaheer - TAP (CTINV#15259)', '16-11-2026'),
  ('rec-02', 'CTRV#1236', 'mustafa', 'Cash', 'Cash Counter', 'CASH-REC', 'CTINV#15261', 2100.00, 'Cleared', 'muhammed riswan', 'Commercial Payment Settlement for mustafa product (CTINV#15261)', '16-11-2026');

-- Seed Line Items for Receipts/Invoices
INSERT OR IGNORE INTO document_items (id, document_id, document_type, item_name, item_code, brand, quantity, price, total)
VALUES 
  ('item-01', 'CTRV#1235', 'RECEIPT', 'tap', 'sk1786', 'lk', 1, 2000.00, 2000.00),
  ('item-02', 'CTRV#1236', 'RECEIPT', 'glue', 'tdtykhfg55', 'll', 4, 525.00, 2100.00);
