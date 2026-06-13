-- Database Schema for SplitBill Web App
-- You can run this in your Supabase SQL Editor

-- 1. Create groups table with tax, service, discount and extra fee support
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  service_rate NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percent')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  extra_fee NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create expense_participants table
CREATE TABLE IF NOT EXISTS expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  share_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create receipt_scans table (Optional metadata storage)
CREATE TABLE IF NOT EXISTS receipt_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  merchant TEXT,
  raw_text TEXT,
  parsed_result JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indices for performance optimizations
CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_id ON expense_participants(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_member_id ON expense_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_receipt_scans_group_id ON receipt_scans(group_id);

-- Enable Row Level Security (RLS) policies - Developer access policy for MVP
-- Allows anyone to select, insert, update and delete (simplifies MVP)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public operations for groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public operations for members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public operations for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public operations for expense_participants" ON expense_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public operations for receipt_scans" ON receipt_scans FOR ALL USING (true) WITH CHECK (true);
