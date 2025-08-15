"use client";
import React, { useState, useEffect } from "react";
import { RequestsSection } from "@/components/RequestsSection";
import { EarningsSection } from "@/components/EarningsSection";
import { CalendarSection } from "@/components/CalendarSection";
import { ProfileSection } from "@/components/ProfileSection";
import { DashboardSection } from "@/components/DashboardSection";
import { BookingDetailDrawer } from "@/components/BookingDetailDrawer";
import { useDashboardData } from "@/app/hooks";

// Constants
const MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "requests", label: "Booking Requests" },
  { key: "calendar", label: "Calendar" },
  { key: "earnings", label: "Earnings" },
  { key: "profile", label: "Profile" }
];





// Main Component
export default function DashboardPage() {
  // UI State (only)
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Close'>('All');

  // All data management through custom hooks
  const {
    // Artist Profile
    artistProfile,
    profileLoading,
    updateArtistProfile,
    
    // Bookings
    bookings,
    bookingsLoading,
    updateBookingDetails,
    updateBookingStatus,
    
    // Stats
    dashboardStats,
    earningsStats,
    statsLoading,
  } = useDashboardData();

  // Effects
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);







  // Event Handlers
  const handleMenuClick = (key: string) => {
    setSection(key);
    if (window.innerWidth < 600) setSidebarOpen(false);
  };



  return (
    <div className="flex min-h-screen bg-[#181c23] text-gray-100">
      {/* Mobile Hamburger Menu */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-gray-800 rounded-full p-2 shadow-lg border border-gray-700"
        style={{ display: sidebarOpen ? "none" : "block" }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect y="5" width="24" height="2" rx="1" fill="#fff"/>
          <rect y="11" width="24" height="2" rx="1" fill="#fff"/>
          <rect y="17" width="24" height="2" rx="1" fill="#fff"/>
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 bg-[#232733] border-r border-gray-800 flex flex-col items-center py-10 px-6 shadow-lg transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ minHeight: "100vh" }}
      >
        <div className="text-3xl font-extrabold tracking-tight mb-1 text-white">ArtistryHub</div>
        <div className="text-2xl font-extrabold tracking-tight mb-1 text-white">Control Panel</div>
        <div className="text-sm text-gray-400 mb-6 text-center leading-tight">Manage bookings, earnings, and your profile</div>
        <hr className="w-full border-gray-700 mb-8" />
        
        <nav className="flex flex-col gap-2 w-full">
          <a
            href={`/artist/${artistProfile?.user_id}`}
            className="text-left px-5 py-3 rounded-lg font-semibold text-base transition-all duration-150 bg-green-600 text-white shadow hover:bg-green-500"
          >
            View Artist Page
          </a>
          {MENU.map((item) => (
            <button
              key={item.key}
              className={`text-left px-5 py-3 rounded-lg font-semibold text-base transition-all duration-150 ${section === item.key ? "bg-blue-600 text-white shadow" : "hover:bg-gray-800 text-gray-200"}`}
              onClick={() => handleMenuClick(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 600 && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 px-8 py-12 md:px-16 md:py-16 bg-[#181c23] min-h-screen">
        {/* Dashboard Section */}

        {section === "dashboard" && (
        <DashboardSection
          dashboardStats={dashboardStats}
          bookings={bookings}
          bookingsLoading={bookingsLoading || statsLoading}
          onBookingClick={(bookingId) => setExpandedRequestId(bookingId)}
        />
       )}





        {/* Booking Requests Section */}
        {section === "requests" && (
        <RequestsSection
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          filter={filter}
          setFilter={setFilter}
          expandedRequestId={expandedRequestId}
          setExpandedRequestId={setExpandedRequestId}
          updateBookingDetails={updateBookingDetails}
          updateBookingStatus={updateBookingStatus}
        />
)}

        {/* Earnings Section */}
        {section === "earnings" && (
        <EarningsSection
          earningsStats={earningsStats}
          bookings={bookings}
          bookingsLoading={bookingsLoading || statsLoading}
        />
)}




    {section === "profile" && (
      <ProfileSection
        artistProfile={artistProfile}
        profileLoading={profileLoading}
        onProfileUpdate={updateArtistProfile}
      />
    )}


        {/* Calendar Section */}
        {section === "calendar" && (
        <CalendarSection
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          onEventClick={(booking) => setExpandedRequestId(booking.id)}
        />
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

      </main>
    </div>
  );
}