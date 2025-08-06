export interface BookingRequest {
    id: number;
    artist_id: number;
    event_date: string;
    event_time: string;
    time_zone: string;
    budget: number;
    currency: string;
    venue_name: string;
    city: string;
    country: string;
    performance_duration: number;
    participant_count: number;
    includes_travel: boolean;
    includes_accommodation: boolean;
    client_first_name: string;
    client_last_name: string;
    client_email: string;
    client_phone?: string;
    client_company?: string;
    client_message?: string;
    status: string;
    created_at: string;
    updated_at: string;
  }