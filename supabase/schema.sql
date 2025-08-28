-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    team_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    city TEXT,
    region TEXT,
    lat NUMERIC,
    lng NUMERIC,
    visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    lat NUMERIC,
    lng NUMERIC,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT,
    name TEXT NOT NULL,
    description TEXT,
    manufacturer TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    condition TEXT CHECK (condition IN ('new', 'used', 'broken')) DEFAULT 'used',
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    lendable BOOLEAN DEFAULT TRUE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, part_id)
);

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    owner_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'fulfilled', 'cancelled')) DEFAULT 'pending',
    needed_by DATE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    status TEXT CHECK (status IN ('in_transit', 'delivered', 'returned', 'lost', 'cancelled')) DEFAULT 'in_transit',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    actor UUID REFERENCES auth.users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    vendor TEXT,
    raw_file_path TEXT,
    parsed JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_locations_team_id ON locations(team_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_team_id ON inventory_items(team_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_part_id ON inventory_items(part_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_team_id ON requests(requester_team_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner_team_id ON requests(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_transactions_request_id ON transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_team_id ON activity_log(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_team_id ON invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_parts_tags ON parts USING GIN(tags);

-- Create safe public inventory view
CREATE OR REPLACE VIEW safe_public_inventory_view AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.city,
    t.region,
    t.lat,
    t.lng,
    COUNT(ii.id) as total_items,
    COUNT(ii.id) FILTER (WHERE ii.lendable = true) as lendable_items,
    COALESCE(
        jsonb_object_agg(
            COALESCE(p.tags[1], 'uncategorized'), 
            tag_counts.count
        ) FILTER (WHERE p.tags IS NOT NULL AND array_length(p.tags, 1) > 0),
        '{}'::jsonb
    ) as counts_by_tag
FROM teams t
LEFT JOIN inventory_items ii ON t.id = ii.team_id
LEFT JOIN parts p ON ii.part_id = p.id
LEFT JOIN (
    SELECT 
        ii2.team_id,
        COALESCE(p2.tags[1], 'uncategorized') as tag,
        COUNT(*) as count
    FROM inventory_items ii2
    LEFT JOIN parts p2 ON ii2.part_id = p2.id
    WHERE p2.tags IS NOT NULL AND array_length(p2.tags, 1) > 0
    GROUP BY ii2.team_id, COALESCE(p2.tags[1], 'uncategorized')
) tag_counts ON t.id = tag_counts.team_id
WHERE t.visibility = 'public'
GROUP BY t.id, t.name, t.city, t.region, t.lat, t.lng;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public teams are visible to all" ON teams;
DROP POLICY IF EXISTS "Team members can view their team" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Team creators can update their team" ON teams;
DROP POLICY IF EXISTS "Team members can view their team's locations" ON locations;
DROP POLICY IF EXISTS "Team members can manage their team's locations" ON locations;
DROP POLICY IF EXISTS "Team members can view their team's inventory" ON inventory_items;
DROP POLICY IF EXISTS "Team members can manage their team's inventory" ON inventory_items;
DROP POLICY IF EXISTS "Request participants can view requests" ON requests;
DROP POLICY IF EXISTS "Team members can create requests" ON requests;
DROP POLICY IF EXISTS "Owner team can update request status" ON requests;
DROP POLICY IF EXISTS "Request participants can view transactions" ON transactions;
DROP POLICY IF EXISTS "Owner team can create transactions" ON transactions;
DROP POLICY IF EXISTS "Team members can view their team's activity" ON activity_log;
DROP POLICY IF EXISTS "Team members can view their team's invoices" ON invoices;
DROP POLICY IF EXISTS "Team members can manage their team's invoices" ON invoices;

-- Profiles: users can select/update own row
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Teams: public teams visible to all, team members can manage their team
CREATE POLICY "Public teams are visible to all" ON teams
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Team members can view their team" ON teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.team_id = teams.id 
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create teams" ON teams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team creators can update their team" ON teams
    FOR UPDATE USING (created_by = auth.uid());

-- Locations: team members can manage their team's locations
CREATE POLICY "Team members can view their team's locations" ON locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.team_id = locations.team_id 
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage their team's locations" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.team_id = locations.team_id 
            AND profiles.id = auth.uid()
        )
    );

-- Inventory items: team members can manage their team's inventory
CREATE POLICY "Team members can view their team's inventory" ON inventory_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.team_id = inventory_items.team_id 
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage their team's inventory" ON inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.team_id = inventory_items.team_id 
            AND profiles.id = auth.uid()
        )
    );

-- Requests: requester and owner team members can view/manage
CREATE POLICY "Request participants can view requests" ON requests
    FOR SELECT USING (
        requester_team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        ) OR
        owner_team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Team members can create requests" ON requests
    FOR INSERT WITH CHECK (
        requester_team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Owner team can update request status" ON requests
    FOR UPDATE USING (
        owner_team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Transactions: request participants can view
CREATE POLICY "Request participants can view transactions" ON transactions
    FOR SELECT USING (
        request_id IN (
            SELECT id FROM requests 
            WHERE requester_team_id IN (
                SELECT team_id FROM profiles WHERE id = auth.uid()
            ) OR
            owner_team_id IN (
                SELECT team_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Owner team can create transactions" ON transactions
    FOR INSERT WITH CHECK (
        request_id IN (
            SELECT id FROM requests 
            WHERE owner_team_id IN (
                SELECT team_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Activity log: team members can view their team's activity
CREATE POLICY "Team members can view their team's activity" ON activity_log
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Invoices: team members can manage their team's invoices
CREATE POLICY "Team members can view their team's invoices" ON invoices
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage their team's invoices" ON invoices
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Note: Views inherit RLS policies from underlying tables
-- No need to create separate policies for views

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
