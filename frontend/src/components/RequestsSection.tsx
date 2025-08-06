"use client";
import React from "react";
import { BookingRequest } from "@/app/types/booking";
import { BookingDetailDrawer } from "./BookingDetailDrawer";

interface RequestsSectionProps {
  bookings: BookingRequest[];
  bookingsLoading: boolean;
  filter: 'All' | 'Pending' | 'Approved' | 'Close';
  setFilter: (filter: 'All' | 'Pending' | 'Approved' | 'Close') => void;
  expandedRequestId: number | null;
  setExpandedRequestId: (id: number | null) => void;
  updateBookingDetails: (bookingId: number, newDetails: any) => Promise<boolean>;
  updateBookingStatus: (id: number, status: string) => Promise<boolean>;
}

export function RequestsSection({
  bookings,
  bookingsLoading,
  filter,
  setFilter,
  expandedRequestId,
  setExpandedRequestId,
  updateBookingDetails,
  updateBookingStatus,
}: RequestsSectionProps) {
  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return b.status === 'pending';
    if (filter === 'Approved') return b.status === 'accepted';
    if (filter === 'Close') return b.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-[#f0f0f0]">
        Booking Requests
      </h1>
      
      {bookingsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-3 text-white">Loading booking requests...</span>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8">
            {['All', 'Pending', 'Approved', 'Close'].map(tab => (
              <button
                key={tab}
                className={`px-6 py-2 rounded-full font-semibold text-base shadow-sm transition-colors duration-150 ${
                  filter === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#232733] text-[#f0f0f0] border border-[#333] hover:bg-blue-700'
                }`}
                onClick={() => setFilter(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-xl font-semibold mb-2">No booking requests</div>
              <div className="text-sm">When clients book you, their requests will appear here</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 max-w-4xl">
              {filteredBookings.map(req => (
                <div 
                  key={req.id} 
                  className="bg-[#232733] rounded-xl shadow-lg border border-[#cccccc]/40 p-6 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  onClick={() => setExpandedRequestId(req.id)}
                >
                  <div>
                    <div className="font-bold text-lg text-[#f0f0f0]">
                      {req.client_first_name} {req.client_last_name}
                    </div>
                    <div className="text-[#cccccc] text-sm">{req.venue_name}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[#cccccc] text-sm">
                      {req.event_date} at {req.event_time}
                    </div>
                    <div className="text-blue-400 font-bold">
                      ${req.budget} {req.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Detail Drawer */}
          {expandedRequestId && (() => {
            const req = bookings.find(r => r.id === expandedRequestId);
            if (!req) return null;
            return (
                <BookingDetailDrawer
                req={req}
                onClose={() => setExpandedRequestId(null)}
                updateBookingDetails={updateBookingDetails}
                updateBookingStatus={updateBookingStatus}
                />
            );
            })()}
        </>
      )}
    </div>
  );
}