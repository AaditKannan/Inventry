-- Extended schema for Inventry app - Invoice Processing & Part Management
-- This extends the existing schema with new tables for advanced features

-- Invoices table for file storage and processing
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10,2),
    vendor_name TEXT,
    invoice_number TEXT,
    invoice_date DATE,
    notes TEXT
);

-- Part categories for organization
CREATE TABLE IF NOT EXISTS part_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES part_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table for inventory management
CREATE TABLE IF NOT EXISTS parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    part_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES part_categories(id),
    manufacturer TEXT NOT NULL CHECK (manufacturer IN ('GoBILDA', 'REV', 'Other')),
    cost DECIMAL(10,2),
    unit TEXT DEFAULT 'piece',
    min_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    location_id UUID REFERENCES locations(id),
    tags TEXT[],
    datasheet_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, part_number)
);

-- Invoice items extracted from invoices
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    extracted_text TEXT NOT NULL,
    part_number TEXT,
    description TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status TEXT DEFAULT 'extracted' CHECK (status IN ('extracted', 'matched', 'ignored')),
    matched_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Stock movements for tracking inventory changes
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('invoice', 'manual', 'transfer', 'adjustment')),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default part categories
INSERT INTO part_categories (name, description) VALUES
    ('Motors & Actuators', 'Electric motors, servos, and linear actuators'),
    ('Wheels & Traction', 'Wheels, treads, and traction systems'),
    ('Structural & Frame', 'Beams, brackets, and frame components'),
    ('Electronics', 'Controllers, sensors, and electrical components'),
    ('Fasteners', 'Screws, nuts, bolts, and mounting hardware'),
    ('Power & Battery', 'Batteries, power distribution, and charging'),
    ('Control Systems', 'Joysticks, gamepads, and control interfaces'),
    ('Tools & Accessories', 'Tools, cables, and miscellaneous accessories')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_team_id ON invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_parts_team_id ON parts(team_id);
CREATE INDEX IF NOT EXISTS idx_parts_manufacturer ON parts(manufacturer);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_part_id ON stock_movements(part_id);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Team members can view team invoices" ON invoices
    FOR SELECT USING (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Team members can create invoices" ON invoices
    FOR INSERT WITH CHECK (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Team members can update team invoices" ON invoices
    FOR UPDATE USING (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for parts
CREATE POLICY "Team members can view team parts" ON parts
    FOR SELECT USING (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Team members can create parts" ON parts
    FOR INSERT WITH CHECK (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Team members can update team parts" ON parts
    FOR UPDATE USING (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for invoice_items
CREATE POLICY "Team members can view team invoice items" ON invoice_items
    FOR SELECT USING (invoice_id IN (
        SELECT id FROM invoices WHERE team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Team members can create invoice items" ON invoice_items
    FOR INSERT WITH CHECK (invoice_id IN (
        SELECT id FROM invoices WHERE team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Team members can update team invoice items" ON invoice_items
    FOR UPDATE USING (invoice_id IN (
        SELECT id FROM invoices WHERE team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- RLS Policies for stock_movements
CREATE POLICY "Team members can view team stock movements" ON stock_movements
    FOR SELECT USING (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Team members can create stock movements" ON stock_movements
    FOR INSERT WITH CHECK (team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
    ));

-- Function to update stock when parts are modified
CREATE OR REPLACE FUNCTION update_part_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_stock != NEW.current_stock THEN
        INSERT INTO stock_movements (
            part_id, team_id, movement_type, quantity, 
            previous_stock, new_stock, reference_type, 
            reference_id, notes, created_by
        ) VALUES (
            NEW.id, NEW.team_id, 
            CASE 
                WHEN NEW.current_stock > OLD.current_stock THEN 'in'
                ELSE 'out'
            END,
            ABS(NEW.current_stock - OLD.current_stock),
            OLD.current_stock,
            NEW.current_stock,
            'adjustment',
            NULL,
            'Stock adjustment',
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock updates
CREATE TRIGGER trigger_update_part_stock
    AFTER UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_part_stock();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
