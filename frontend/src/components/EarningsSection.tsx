"use client";
import React from "react";
import { BookingRequest } from "@/app/types/booking";
import { SummaryCard } from "./SummaryCard";

export interface EarningsStats {
  totalRevenue: string;
  thisMonth: string;
  avgFee: string;
  totalBookings: number;
}

interface EarningsSectionProps {
  earningsStats: EarningsStats;
  bookings: BookingRequest[];
  bookingsLoading: boolean;
}

export function EarningsSection({
  earningsStats,
  bookings,
  bookingsLoading,
}: EarningsSectionProps) {
  // Get approved bookings for the recent bookings table
  const approvedBookings = bookings
    .filter(b => b.status === 'accepted')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Calculate additional stats
  const totalEarningsThisYear = bookings
    .filter(b => b.status === 'accepted' && new Date(b.event_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, b) => sum + b.budget, 0);

  const upcomingEarnings = bookings
    .filter(b => b.status === 'accepted' && new Date(b.event_date) > new Date())
    .reduce((sum, b) => sum + b.budget, 0);

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white">
        Earnings
      </h1>
      
      {bookingsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-3 text-white">Loading earnings data...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <SummaryCard 
              label="Total Revenue" 
              value={earningsStats.totalRevenue} 
              icon="💰" 
            />
            <SummaryCard 
              label="Revenue This Month" 
              value={earningsStats.thisMonth} 
              icon="📈" 
            />
            <SummaryCard 
              label="Avg. Booking Fee" 
              value={earningsStats.avgFee} 
              icon="💵" 
            />
            <SummaryCard 
              label="Total Bookings" 
              value={earningsStats.totalBookings} 
              icon="📦" 
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">This Year</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                ${totalEarningsThisYear.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Upcoming</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                ${upcomingEarnings.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Success Rate</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                {bookings.length > 0 
                  ? Math.round((approvedBookings.length / bookings.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings Graph */}
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8 col-span-2 flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-white">Earnings Over Time</h3>
                <select className="bg-[#2a2f3a] text-white px-3 py-1 rounded-lg text-sm border border-gray-600">
                  <option>Last 6 months</option>
                  <option>This year</option>
                  <option>All time</option>
                </select>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="h-48 w-full flex items-center justify-center text-gray-400 text-lg bg-[#2a2f3a] rounded-xl border border-dashed border-gray-600">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div>Chart Coming Soon</div>
                    <div className="text-sm text-gray-500 mt-1">Revenue visualization will be added here</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Approved Bookings */}
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col">
              <h3 className="font-bold text-xl mb-6 text-white">Recent Approved Bookings</h3>
              {approvedBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400 flex-1 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3">🎭</div>
                  <div className="font-semibold">No approved bookings yet</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Your approved bookings will appear here
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="space-y-4">
                    {approvedBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-white text-sm">
                            {booking.client_first_name} {booking.client_last_name}
                          </div>
                          <div className="text-green-400 font-bold text-sm">
                            ${booking.budget.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(booking.event_date).toLocaleDateString()} • {booking.venue_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.city}, {booking.country}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {bookings.filter(b => b.status === 'accepted').length > 5 && (
                    <div className="mt-4 text-center">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View all approved bookings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="mt-8">
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8">
              <h3 className="font-bold text-xl mb-6 text-white">Monthly Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {getMonthlyBreakdown(bookings).map((month, index) => (
                  <div key={index} className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">{month.name}</div>
                    <div className="text-lg font-bold text-white">${month.earnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{month.bookings} bookings</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get monthly breakdown
function getMonthlyBreakdown(bookings: BookingRequest[]) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentYear = new Date().getFullYear();
  const monthlyData = months.map((monthName, index) => {
    const monthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.event_date);
      return bookingDate.getFullYear() === currentYear && 
             bookingDate.getMonth() === index && 
             b.status === 'accepted';
    });
    
    const earnings = monthBookings.reduce((sum, b) => sum + b.budget, 0);
    
    return {
      name: monthName,
      earnings,
      bookings: monthBookings.length
    };
  });
  
  // Return only last 4 months for display
  const currentMonth = new Date().getMonth();
  return monthlyData.slice(Math.max(0, currentMonth - 3), currentMonth + 1);
}