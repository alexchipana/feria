-- Enable RLS
-- Tables for Feria 16 de Julio Directory

CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    geojson JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    owner_name TEXT,
    contact_phone TEXT,
    whatsapp TEXT,
    email TEXT,
    image_url TEXT,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    sector_id UUID REFERENCES sectors(id),
    tags TEXT[],
    opening_hours TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors table for real-time location sharing
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_lat FLOAT,
    last_lng FLOAT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    share_public BOOLEAN DEFAULT FALSE
);

-- RLS Policies
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to sectors" ON sectors FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to stalls" ON stalls FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to visitors" ON visitors FOR SELECT TO public USING (share_public = true);

-- Review submission (public)
CREATE POLICY "Allow public insert to reviews" ON reviews FOR INSERT TO public WITH CHECK (true);

-- Admin write access (Assuming service_role or admin user)
-- For a simple MVP, we can restrict write to authenticated users if we use Supabase Auth
-- or just leave it for the admin panel with a specific role.
CREATE POLICY "Allow authenticated users to manage stalls" ON stalls FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage sectors" ON sectors FOR ALL TO authenticated USING (true);

-- Storage bucket for stall images
-- Run this in Supabase Console:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stalls', 'stalls', true);
-- CREATE POLICY "Public read access to stall images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'stalls');
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stalls');
