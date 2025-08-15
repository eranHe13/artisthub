import { useState, useCallback } from "react";
import { BookingRequest } from "@/app/types/booking";

export interface UseBookingsReturn {
  bookings: BookingRequest[];
  bookingsLoading: boolean;
  setBookings: (bookings: BookingRequest[]) => void;
  setBookingsLoading: (loading: boolean) => void;
  fetchBookings: () => Promise<void>;
  updateBookingDetails: (bookingId: number, newDetails: any) => Promise<boolean>;
  updateBookingStatus: (bookingId: number, newStatus: string) => Promise<boolean>;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const response = await fetch('/api/artist/bookings', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const bookingsData = await response.json();
        setBookings(bookingsData);
      } else {
        console.error('Failed to fetch bookings:', response.status);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const updateBookingDetails = useCallback(async (bookingId: number, newDetails: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDetails)
      });

      if (response.ok) {
        // Update the booking in local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, ...newDetails }
              : booking
          )
        );
        return true;
      } else {
        console.error('Failed to update booking details:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Error updating booking details:', err);
      return false;
    }
  }, []);

  const updateBookingStatus = useCallback(async (bookingId: number, newStatus: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the booking status in local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
              : booking
          )
        );
        return true;
      } else {
        console.error('Failed to update booking status:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      return false;
    }
  }, []);

  return {
    bookings,
    bookingsLoading,
    setBookings,
    setBookingsLoading,
    fetchBookings,
    updateBookingDetails,
    updateBookingStatus,
  };
}
