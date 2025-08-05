# ArtistHub Booking API Documentation

## Overview
The ArtistHub Booking API allows clients to book artists for events and artists to manage their bookings.

## Base URL
```
https://yourdomain.com/api
```

## Authentication
All endpoints require authentication via HTTP-only cookies set during Google OAuth login.

## Endpoints

### 1. Create Booking Request

**POST** `/bookings/?artist_id={artist_id}`

Creates a new booking request for an artist.

#### Request Body
```json
{
  "event_date": "2024-02-15",
  "event_time": "19:00",
  "time_zone": "UTC",
  "budget": 500.00,
  "currency": "USD",
  "venue_name": "Grand Concert Hall",
  "city": "New York",
  "country": "USA",
  "performance_duration": 120,
  "participant_count": 200,
  "includes_travel": false,
  "includes_accommodation": false,
  "client_first_name": "John",
  "client_last_name": "Doe",
  "client_email": "john.doe@example.com",
  "client_phone": "+1234567890",
  "client_company": "Event Productions Inc",
  "client_message": "We would love to have you perform at our annual gala."
}
```

#### Response (201 Created)
```json
{
  "id": 1,
  "artist_id": 123,
  "event_date": "2024-02-15",
  "event_time": "19:00",
  "time_zone": "UTC",
  "budget": 500.00,
  "currency": "USD",
  "venue_name": "Grand Concert Hall",
  "city": "New York",
  "country": "USA",
  "performance_duration": 120,
  "participant_count": 200,
  "includes_travel": false,
  "includes_accommodation": false,
  "client_first_name": "John",
  "client_last_name": "Doe",
  "client_email": "john.doe@example.com",
  "client_phone": "+1234567890",
  "client_company": "Event Productions Inc",
  "client_message": "We would love to have you perform at our annual gala.",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "detail": "Event date must be in the future"
}
```

**404 Not Found** - Artist Not Found
```json
{
  "detail": "Artist not found"
}
```

**409 Conflict** - Duplicate Booking
```json
{
  "detail": "A booking already exists for this artist at the requested time"
}
```

### 2. Get Artist Bookings

**GET** `/bookings/artist/{artist_id}`

Retrieves all bookings for an artist (requires authentication as the artist).

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "artist_id": 123,
    "event_date": "2024-02-15",
    "event_time": "19:00",
    "time_zone": "UTC",
    "budget": 500.00,
    "currency": "USD",
    "venue_name": "Grand Concert Hall",
    "city": "New York",
    "country": "USA",
    "performance_duration": 120,
    "participant_count": 200,
    "includes_travel": false,
    "includes_accommodation": false,
    "client_first_name": "John",
    "client_last_name": "Doe",
    "client_email": "john.doe@example.com",
    "client_phone": "+1234567890",
    "client_company": "Event Productions Inc",
    "client_message": "We would love to have you perform at our annual gala.",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 3. Get Specific Booking

**GET** `/bookings/{booking_id}`

Retrieves a specific booking by ID.

#### Response (200 OK)
```json
{
  "id": 1,
  "artist_id": 123,
  "event_date": "2024-02-15",
  "event_time": "19:00",
  "time_zone": "UTC",
  "budget": 500.00,
  "currency": "USD",
  "venue_name": "Grand Concert Hall",
  "city": "New York",
  "country": "USA",
  "performance_duration": 120,
  "participant_count": 200,
  "includes_travel": false,
  "includes_accommodation": false,
  "client_first_name": "John",
  "client_last_name": "Doe",
  "client_email": "john.doe@example.com",
  "client_phone": "+1234567890",
  "client_company": "Event Productions Inc",
  "client_message": "We would love to have you perform at our annual gala.",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 4. Update Booking Status

**PUT** `/bookings/{booking_id}/status`

Updates the status of a booking (only the artist can update).

#### Request Body
```json
{
  "status": "accepted"
}
```

#### Response (200 OK)
```json
{
  "id": 1,
  "artist_id": 123,
  "event_date": "2024-02-15",
  "event_time": "19:00",
  "time_zone": "UTC",
  "budget": 500.00,
  "currency": "USD",
  "venue_name": "Grand Concert Hall",
  "city": "New York",
  "country": "USA",
  "performance_duration": 120,
  "participant_count": 200,
  "includes_travel": false,
  "includes_accommodation": false,
  "client_first_name": "John",
  "client_last_name": "Doe",
  "client_email": "john.doe@example.com",
  "client_phone": "+1234567890",
  "client_company": "Event Productions Inc",
  "client_message": "We would love to have you perform at our annual gala.",
  "status": "accepted",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### 5. Cancel Booking

**DELETE** `/bookings/{booking_id}`

Cancels a booking (only the artist can cancel).

#### Response (204 No Content)
No response body.

## Data Validation Rules

### Event Date & Time
- Event date must be in the future
- Date format: YYYY-MM-DD
- Time format: HH:MM (24-hour)
- Time zone must be a valid IANA timezone identifier

### Budget
- Must be a positive number
- Must meet artist's minimum price requirement
- Currency must be a valid 3-letter currency code

### Client Information
- First name, last name, and email are required
- Email must be a valid email format
- Phone number is optional but should include country code

### Performance Details
- Performance duration must be positive (in minutes)
- Participant count must be positive
- Venue name, city, and country are required

## Business Rules

1. **Artist Availability**: System checks for calendar blocks and existing bookings
2. **Minimum Budget**: Booking must meet artist's minimum price requirement
3. **Duplicate Prevention**: No duplicate bookings for same artist, date, and time
4. **Status Management**: Only artists can update booking status
5. **Cancellation**: Only pending or accepted bookings can be cancelled

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Business rule violation |
| 500 | Internal Server Error |

## Testing Examples

### cURL Examples

**Create Booking:**
```bash
curl -X POST "https://yourdomain.com/api/bookings/?artist_id=123" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=your_jwt_token" \
  -d '{
    "event_date": "2024-02-15",
    "event_time": "19:00",
    "time_zone": "UTC",
    "budget": 500.00,
    "currency": "USD",
    "venue_name": "Grand Concert Hall",
    "city": "New York",
    "country": "USA",
    "performance_duration": 120,
    "participant_count": 200,
    "client_first_name": "John",
    "client_last_name": "Doe",
    "client_email": "john.doe@example.com"
  }'
```

**Get Artist Bookings:**
```bash
curl -X GET "https://yourdomain.com/api/bookings/artist/123" \
  -H "Cookie: access_token=your_jwt_token"
```

**Update Booking Status:**
```bash
curl -X PUT "https://yourdomain.com/api/bookings/1/status" \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=your_jwt_token" \
  -d '{"status": "accepted"}'
```

## Next Steps

1. **Email Notifications**: Implement email notifications for booking status changes
2. **Calendar Integration**: Add calendar sync for accepted bookings
3. **Payment Processing**: Integrate payment processing for accepted bookings
4. **Rating System**: Add rating and review system after completed events
5. **Analytics**: Add booking analytics and reporting features 