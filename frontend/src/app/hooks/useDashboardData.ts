import { useEffect, useCallback } from "react";
import { useArtistProfile } from "./useArtistProfile";
import { useBookings } from "./useBookings";
import { useDashboardStats } from "./useDashboardStats";

export interface UseDashboardDataReturn {
  // Artist Profile
  artistProfile: ReturnType<typeof useArtistProfile>['artistProfile'];
  profileLoading: boolean;
  updateArtistProfile: ReturnType<typeof useArtistProfile>['updateArtistProfile'];
  
  // Bookings
  bookings: ReturnType<typeof useBookings>['bookings'];
  bookingsLoading: boolean;
  updateBookingDetails: ReturnType<typeof useBookings>['updateBookingDetails'];
  updateBookingStatus: ReturnType<typeof useBookings>['updateBookingStatus'];
  
  // Stats
  dashboardStats: ReturnType<typeof useDashboardStats>['dashboardStats'];
  earningsStats: ReturnType<typeof useDashboardStats>['earningsStats'];
  statsLoading: boolean;
  
  // Actions
  refreshAllData: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const {
    artistProfile,
    profileLoading,
    setArtistProfile,
    fetchArtistProfile,
    updateArtistProfile,
  } = useArtistProfile();

  const {
    bookings,
    bookingsLoading,
    setBookings,
    setBookingsLoading,
    fetchBookings,
    updateBookingDetails,
    updateBookingStatus,
  } = useBookings();

  const {
    dashboardStats,
    earningsStats,
    statsLoading,
    setDashboardStats,
    setEarningsStats,
    setStatsLoading,
    fetchDashboardStats,
    calculateStatsFromBookings,
  } = useDashboardStats();

  // Fetch all dashboard data from single endpoint (like the original code)
  const fetchAllDashboardData = useCallback(async () => {
    console.log('Dashboard: Starting to fetch all dashboard data...');
    try {
      setBookingsLoading(true);
      setStatsLoading(true);
      
      const response = await fetch('http://localhost:8000/api/artist/dashboard', {
        credentials: 'include',
      });
      
      console.log('Dashboard: API response status:', response.status);
      
      if (response.ok) {
        const dashboardData = await response.json();
        
        // Update artist profile
        if (dashboardData.profile) {
          setArtistProfile(dashboardData.profile);
        }
        
        // Update bookings
        if (dashboardData.bookings) {
          console.log('Dashboard: Received bookings:', dashboardData.bookings.length, dashboardData.bookings);
          setBookings(dashboardData.bookings);
        } else {
          console.log('Dashboard: No bookings in response');
        }
        
        // Update stats
        if (dashboardData.stats) {
          setDashboardStats({
            totalRequests: dashboardData.stats.total_requests,
            activeBookings: dashboardData.stats.active_bookings,
            pending: dashboardData.stats.pending,
            approved: dashboardData.stats.accepted,
            totalEarnings: `$${dashboardData.stats.total_earnings.toLocaleString()}`
          });
          
          setEarningsStats({
            totalRevenue: `$${dashboardData.stats.total_earnings.toLocaleString()}`,
            thisMonth: `$${dashboardData.stats.this_month_earnings.toLocaleString()}`,
            avgFee: `$${dashboardData.stats.avg_booking_fee.toLocaleString()}`,
            totalBookings: dashboardData.stats.total_bookings
          });
        }
        
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setBookingsLoading(false);
      setStatsLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Refresh only bookings and recalculate stats
  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  // Refresh only profile
  const refreshProfile = useCallback(async () => {
    await fetchArtistProfile();
  }, [fetchArtistProfile]);

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Recalculate stats when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      calculateStatsFromBookings(bookings);
    }
  }, [bookings, calculateStatsFromBookings]);

  // Enhanced booking update functions that refresh stats
  const enhancedUpdateBookingDetails = useCallback(async (bookingId: number, newDetails: any): Promise<boolean> => {
    const success = await updateBookingDetails(bookingId, newDetails);
    if (success) {
      // Stats will be recalculated automatically via useEffect
    }
    return success;
  }, [updateBookingDetails]);

  const enhancedUpdateBookingStatus = useCallback(async (bookingId: number, newStatus: string): Promise<boolean> => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success) {
      // Stats will be recalculated automatically via useEffect
    }
    return success;
  }, [updateBookingStatus]);

  return {
    // Artist Profile
    artistProfile,
    profileLoading,
    updateArtistProfile,
    
    // Bookings
    bookings,
    bookingsLoading,
    updateBookingDetails: enhancedUpdateBookingDetails,
    updateBookingStatus: enhancedUpdateBookingStatus,
    
    // Stats
    dashboardStats,
    earningsStats,
    statsLoading,
    
    // Actions
    refreshAllData,
    refreshBookings,
    refreshProfile,
  };
}