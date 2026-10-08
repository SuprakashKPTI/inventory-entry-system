-- Supabase Database Schema for Inventory Entry Page
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Items table (maintained by admin)
CREATE TABLE items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table (maintained by admin)
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    region TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking data table (maintained by admin)
CREATE TABLE booking_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT NOT NULL,
    item_id TEXT NOT NULL,
    average_booking NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_code, item_id),
    FOREIGN KEY (customer_code) REFERENCES customers(customer_code) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Shipping data table (maintained by admin)
CREATE TABLE shipping_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT NOT NULL,
    item_id TEXT NOT NULL,
    average_shipping NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_code, item_id),
    FOREIGN KEY (customer_code) REFERENCES customers(customer_code) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Spike data table (submitted by users)
CREATE TABLE spike_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT NOT NULL,
    item_id TEXT NOT NULL,
    month1 NUMERIC DEFAULT 0,
    month2 NUMERIC DEFAULT 0,
    month3 NUMERIC DEFAULT 0,
    total_spike NUMERIC GENERATED ALWAYS AS (COALESCE(month1, 0) + COALESCE(month2, 0) + COALESCE(month3, 0)) STORED,
    submit_date DATE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    region TEXT NOT NULL,
    moved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_code) REFERENCES customers(customer_code) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Submission control table (managed by admin)
CREATE TABLE submission_control (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    is_open BOOLEAN DEFAULT false,
    opened_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    scheduled_close TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default submission control record
INSERT INTO submission_control (is_open) VALUES (false);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_items_item_id ON items(item_id);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_region ON customers(region);
CREATE INDEX idx_booking_data_customer_code ON booking_data(customer_code);
CREATE INDEX idx_booking_data_item_id ON booking_data(item_id);
CREATE INDEX idx_shipping_data_customer_code ON shipping_data(customer_code);
CREATE INDEX idx_shipping_data_item_id ON shipping_data(item_id);
CREATE INDEX idx_spike_data_customer_code ON spike_data(customer_code);
CREATE INDEX idx_spike_data_item_id ON spike_data(item_id);
CREATE INDEX idx_spike_data_submit_date ON spike_data(submit_date);
CREATE INDEX idx_spike_data_user_name ON spike_data(user_name);
CREATE INDEX idx_spike_data_moved_date ON spike_data(moved_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE spike_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_control ENABLE ROW LEVEL SECURITY;

-- Public read access for items, customers, booking_data, shipping_data
CREATE POLICY "Allow public read access to items"
    ON items FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to customers"
    ON customers FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to booking_data"
    ON booking_data FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to shipping_data"
    ON shipping_data FOR SELECT
    USING (true);

-- Authenticated users can read spike data
CREATE POLICY "Allow authenticated read access to spike_data"
    ON spike_data FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can insert spike data
CREATE POLICY "Allow authenticated insert to spike_data"
    ON spike_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Public read access to submission control
CREATE POLICY "Allow public read access to submission_control"
    ON submission_control FOR SELECT
    USING (true);

-- ============================================
-- FUNCTIONS FOR TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_data_updated_at BEFORE UPDATE ON booking_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_data_updated_at BEFORE UPDATE ON shipping_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submission_control_updated_at BEFORE UPDATE ON submission_control
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR EASY DATA ACCESS
-- ============================================

-- View for spike data with customer and item details
CREATE VIEW spike_data_view AS
SELECT 
    s.id,
    s.customer_code,
    c.customer_name,
    s.item_id,
    i.description,
    i.grade,
    s.month1,
    s.month2,
    s.month3,
    s.total_spike,
    s.submit_date,
    s.user_name,
    s.user_email,
    s.region,
    s.moved_date,
    s.created_at
FROM spike_data s
LEFT JOIN customers c ON s.customer_code = c.customer_code
LEFT JOIN items i ON s.item_id = i.item_id;

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample items
INSERT INTO items (item_id, description, grade) VALUES
('ITM001', 'Steel Sheet 5mm', 'A'),
('ITM002', 'Steel Sheet 10mm', 'B'),
('ITM003', 'Aluminum Plate 3mm', 'A'),
('ITM004', 'Copper Wire 2mm', 'C'),
('ITM005', 'Steel Rod 20mm', 'A');

-- Insert sample customers
INSERT INTO customers (customer_code, customer_name, region) VALUES
('CUST001', 'ABC Manufacturing', 'South West'),
('CUST002', 'XYZ Industries', 'North East'),
('CUST003', 'Global Corp', 'South West'),
('CUST004', 'Local Metals Ltd', 'North East');

-- Insert sample booking data
INSERT INTO booking_data (customer_code, item_id, average_booking) VALUES
('CUST001', 'ITM001', 150),
('CUST001', 'ITM002', 200),
('CUST001', 'ITM003', 100),
('CUST001', 'ITM004', 75),
('CUST001', 'ITM005', 180),
('CUST002', 'ITM001', 120),
('CUST002', 'ITM002', 180),
('CUST002', 'ITM003', 80),
('CUST002', 'ITM004', 60),
('CUST002', 'ITM005', 150);

-- Insert sample shipping data
INSERT INTO shipping_data (customer_code, item_id, average_shipping) VALUES
('CUST001', 'ITM001', 140),
('CUST001', 'ITM002', 190),
('CUST001', 'ITM003', 95),
('CUST001', 'ITM004', 70),
('CUST001', 'ITM005', 170),
('CUST002', 'ITM001', 115),
('CUST002', 'ITM002', 175),
('CUST002', 'ITM003', 75),
('CUST002', 'ITM004', 55),
('CUST002', 'ITM005', 145);
