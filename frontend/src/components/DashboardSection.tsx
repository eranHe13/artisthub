"use client";
import React from "react";
import { BookingRequest } from "@/app/types/booking";
import { SummaryCard } from "./SummaryCard";

export interface DashboardStats {
  totalRequests: number;
  activeBookings: number;
  pending: number;
  approved: number;
  totalEarnings: string;
}

interface DashboardSectionProps {
  dashboardStats: DashboardStats;
  bookings: BookingRequest[];
  bookingsLoading: boolean;
  onBookingClick?: (bookingId: number) => void;
}

export function DashboardSection({
  dashboardStats,
  bookings,
  bookingsLoading,
  onBookingClick,
}: DashboardSectionProps) {
  // Get recent bookings (last 5)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Calculate additional quick stats
  const thisWeekBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return bookingDate >= oneWeekAgo;
  }).length;

  const upcomingEvents = bookings.filter(booking => {
    const eventDate = new Date(booking.event_date);
    const today = new Date();
    return eventDate > today && booking.status === 'accepted';
  }).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Dashboard
        </h1>
        <div className="text-sm text-gray-400">
          Welcome back! Here is what is happening with your bookings.
          <div className="text-xs text-gray-500 mt-1">
            Debug: {bookings.length} bookings loaded
          </div>
        </div>
      </div>
      
      {bookingsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-3 text-white">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <SummaryCard 
              label="Total Requests" 
              value={dashboardStats.totalRequests} 
              icon="📥" 
            />
            <SummaryCard 
              label="Active Bookings" 
              value={dashboardStats.activeBookings} 
              icon="📅" 
            />
            <SummaryCard 
              label="Pending" 
              value={dashboardStats.pending} 
              icon="⏳" 
            />
            <SummaryCard 
              label="Approved" 
              value={dashboardStats.approved} 
              icon="✅" 
            />
            <SummaryCard 
              label="Total Earnings" 
              value={dashboardStats.totalEarnings} 
              icon="💰" 
            />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">This Week</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                {thisWeekBookings}
              </div>
              <div className="text-xs text-gray-500">New requests</div>
            </div>
            
            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎭</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Upcoming</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                {upcomingEvents}
              </div>
              <div className="text-xs text-gray-500">Confirmed events</div>
            </div>

            <div className="bg-[#232733] rounded-xl shadow-lg border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💯</span>
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Success Rate</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-100">
                {bookings.length > 0 
                  ? Math.round((dashboardStats.approved / dashboardStats.totalRequests) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">Approval rate</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Booking Requests */}
            <div className="lg:col-span-2">
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-white">Recent Booking Requests</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View all
                  </button>
                </div>
                
                {recentBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-semibold">No booking requests yet</div>
                    <div className="text-sm text-gray-500 mt-1">
                      When clients book you, their requests will appear here
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={() => onBookingClick?.(booking.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-white">
                            {booking.client_first_name} {booking.client_last_name}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-1">
                          {booking.venue_name} • {booking.city}, {booking.country}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(booking.event_date).toLocaleDateString()} at {booking.event_time}
                          </span>
                          <span className="text-green-400 font-semibold">
                            ${booking.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Stats */}

            <div className="space-y-6">
              
              {/* <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                <h3 className="font-bold text-lg text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <span>📝</span>
                    Update Profile
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <span>📅</span>
                    View Calendar
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <span>💰</span>
                    Check Earnings
                  </button>
                </div>
              </div> */}

              {/* Status Breakdown */}
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                <h3 className="font-bold text-lg text-white mb-4">Status Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <span className="text-gray-300">Pending</span>
                    </div>
                    <span className="text-white font-semibold">{dashboardStats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                      <span className="text-gray-300">Approved</span>
                    </div>
                    <span className="text-white font-semibold">{dashboardStats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span className="text-gray-300">Cancelled</span>
                    </div>
                    <span className="text-white font-semibold">
                      {dashboardStats.totalRequests - dashboardStats.pending - dashboardStats.approved}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                <h3 className="font-bold text-lg text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="text-sm text-gray-400">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          booking.status === 'accepted' ? 'bg-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-gray-300">
                          {booking.status === 'accepted' ? 'Booking confirmed' :
                           booking.status === 'pending' ? 'New request' : 'Request cancelled'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {booking.client_first_name} {booking.client_last_name} • {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <div className="text-gray-500 text-sm">No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}