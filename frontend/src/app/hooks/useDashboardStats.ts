import { useState, useCallback, useMemo } from "react";
import { BookingRequest } from "@/app/types/booking";
import { DashboardStats } from "@/app/types/dashboard";
import { EarningsStats } from "@/app/types/earnings";

export interface UseDashboardStatsReturn {
  dashboardStats: DashboardStats;
  earningsStats: EarningsStats;
  statsLoading: boolean;
  setDashboardStats: (stats: DashboardStats) => void;
  setEarningsStats: (stats: EarningsStats) => void;
  setStatsLoading: (loading: boolean) => void;
  fetchDashboardStats: () => Promise<void>;
  calculateStatsFromBookings: (bookings: BookingRequest[]) => void;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRequests: 0,
    activeBookings: 0,
    pending: 0,
    approved: 0,
    totalEarnings: "$0"
  });

  const [earningsStats, setEarningsStats] = useState<EarningsStats>({
    totalRevenue: "$0",
    thisMonth: "$0",
    avgFee: "$0",
    totalBookings: 0
  });

  const [statsLoading, setStatsLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/artist/dashboard', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        
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
        
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const calculateStatsFromBookings = useCallback((bookings: BookingRequest[]) => {
    const totalRequests = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const approved = bookings.filter(b => b.status === 'accepted').length;
    const activeBookings = bookings.filter(b => 
      b.status === 'accepted' && new Date(b.event_date) > new Date()
    ).length;

    // Calculate earnings from accepted bookings
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');
    const totalEarnings = acceptedBookings.reduce((sum, b) => sum + b.budget, 0);
    
    // Calculate this month's earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthEarnings = acceptedBookings
      .filter(b => {
        const eventDate = new Date(b.event_date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + b.budget, 0);

    // Calculate average fee
    const avgFee = acceptedBookings.length > 0 ? totalEarnings / acceptedBookings.length : 0;

    setDashboardStats({
      totalRequests,
      activeBookings,
      pending,
      approved,
      totalEarnings: `$${totalEarnings.toLocaleString()}`
    });

    setEarningsStats({
      totalRevenue: `$${totalEarnings.toLocaleString()}`,
      thisMonth: `$${thisMonthEarnings.toLocaleString()}`,
      avgFee: `$${Math.round(avgFee).toLocaleString()}`,
      totalBookings: acceptedBookings.length
    });
  }, []);

  return {
    dashboardStats,
    earningsStats,
    statsLoading,
    setDashboardStats,
    setEarningsStats,
    setStatsLoading,
    fetchDashboardStats,
    calculateStatsFromBookings,
  };
}
