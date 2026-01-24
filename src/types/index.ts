export interface Sector {
    id: string;
    name: string;
    color: string;
    geojson: any;
    description?: string;
    created_at: string;
}

export interface Stall {
    id: string;
    name: string;
    category: string;
    description?: string;
    owner_name?: string;
    contact_phone?: string;
    whatsapp?: string;
    email?: string;
    image_url?: string;
    lat: number;
    lng: number;
    sector_id?: string;
    tags?: string[];
    opening_hours?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: string;
    stall_id: string;
    user_name: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface Visitor {
    id: string;
    last_lat: number;
    last_lng: number;
    last_seen_at: string;
    share_public: boolean;
}
