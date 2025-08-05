"use client";
import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Types and Interfaces
type Value = Date | Date[] | null;

interface BookingRequest {
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

interface DashboardStats {
  totalRequests: number;
  activeBookings: number;
  pending: number;
  approved: number;
  totalEarnings: string;
}

interface EarningsStats {
  totalRevenue: string;
  thisMonth: string;
  avgFee: string;
  totalBookings: number;
}

// Constants
const MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "requests", label: "Booking Requests" },
  { key: "calendar", label: "Calendar" },
  { key: "earnings", label: "Earnings" },
  { key: "profile", label: "Profile" }
];

// Components
function BookingDetailDrawer({
  req,
  onClose,
  updateBookingDetails,
  updateBookingStatus,
}: {
  req: BookingRequest;
  onClose: () => void;
  updateBookingDetails: (bookingId: number, newDetails: any) => Promise<boolean>;
  updateBookingStatus: (id: number, status: string) => Promise<boolean>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDateTime, setEditedDateTime] = useState("");
  const [editedDuration, setEditedDuration] = useState(req.performance_duration);
  const [editedBudget, setEditedBudget] = useState(req.budget);

  useEffect(() => {
    setEditedDateTime(`${req.event_date}T${req.event_time}`);
  }, [req.event_date, req.event_time]);

  const editable = req.status === "pending";

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-[#181c23] border-l border-[#cccccc] shadow-2xl z-50 flex flex-col transition-transform duration-300 animate-slide-in">
      <button className="absolute top-4 right-4 text-2xl text-[#cccccc] hover:text-white" >
        &times;
      </button>
      <div className="p-8 overflow-y-auto flex-1">
        <div className="font-bold text-2xl mb-4 text-white">
          {req.client_first_name} {req.client_last_name}  {req.venue_name}
        </div>

        {/* Status and Actions */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Status</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
            req.status === "accepted" ? "bg-green-100 text-green-700" :
            req.status === "cancelled" ? "bg-gray-300 text-gray-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {req.status}
          </span>
          <div className="flex gap-3">
            {editable && req.status !== "accepted" && (
              <button
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow"
                onClick={async () => {
                  const ok = await updateBookingStatus(req.id, "accepted");
                  
                }}
              >
                Approve
              </button>
            )}
            {editable && req.status !== "cancelled" && (
              <button
                className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold shadow"
                onClick={async () => {
                  const ok = await updateBookingStatus(req.id, "cancelled");
                  
                }}
              >
                Reject
              </button>
            )}
            {editable && !isEditing && (
              <button
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Client Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-[#cccccc]">
            <div>Name: {req.client_first_name} {req.client_last_name}</div>
            <div>Email: {req.client_email}</div>
            <div>Phone: {req.client_phone || "Not provided"}</div>
            <div>Company: {req.client_company || "Not provided"}</div>
          </div>
        </div>

        {/* Event Details with Edit Mode */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Event Details</div>

          {isEditing ? (
            <div className="space-y-4 text-[#cccccc]">
              <div>
                <label className="block font-semibold mb-1">Date & Time:</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded bg-[#2a2f3a] text-white"
                  value={editedDateTime}
                  onChange={e => setEditedDateTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duration (min):</label>
                <input
                  type="number"
                  className="w-full p-2 rounded bg-[#2a2f3a] text-white"
                  value={editedDuration}
                  onChange={e => setEditedDuration(+e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Budget:</label>
                <input
                  type="number"
                  className="w-full p-2 rounded bg-[#2a2f3a] text-white"
                  value={editedBudget}
                  onChange={e => setEditedBudget(+e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow"
                  onClick={async () => {
                    const [date, time] = editedDateTime.split("T");
                    const success = await updateBookingDetails(req.id, {
                      event_date: date,
                      event_time: time,
                      performance_duration: editedDuration,
                      budget: editedBudget
                    });
                    if (success) {
                      setIsEditing(false);
                      onClose();
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold shadow"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-[#cccccc]">
              <div>Date & Time: {req.event_date} at {req.event_time}</div>
              <div>Duration: {req.performance_duration} minutes</div>
              <div>Budget: ${req.budget} {req.currency}</div>
              <div>Venue: {req.venue_name}</div>
              <div>Location: {req.city}, {req.country}</div>
              <div>Participants: {req.participant_count}</div>
            </div>
          )}
        </div>

        {/* Additional Services */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Additional Services</div>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 text-base text-[#cccccc]">
            <div>Include Travel Expenses: {req.includes_travel ? 'Yes' : 'No'}</div>
            <div>Include Accommodation: {req.includes_accommodation ? 'Yes' : 'No'}</div>
            <div>Include Ground Transportation: TODO</div>
            
          </div>
        </div>

        {/* Client Message */}
        {req.client_message && (
          <div className="mb-6">
            <div className="font-semibold text-lg mb-2 text-white">Client Message</div>
            <div className="text-[#cccccc] bg-[#2a2f3a] p-4 rounded-lg">{req.client_message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[120px]">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className="text-2xl font-extrabold text-gray-100 mb-1">{value}</div>
      <div className="text-xs text-gray-400 font-semibold tracking-wide uppercase">{label}</div>
    </div>
  );
}

// Utility Functions
const parseSocialLinks = (socialLinksString: string) => {
  try {
    return JSON.parse(socialLinksString);
  } catch {
    return {};
  }
};

// Main Component
export default function DashboardPage() {
  // State Management
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
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
  const [formData, setFormData] = useState({
    stage_name: "",
    bio: "",
    genres: "",
    min_price: 1000,
    instagram: "",
    twitter: "",
    facebook: "",
    youtube: "",
    soundcloud: "",
    spotify: "",
    bandcamp: ""
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Close'>('All');
  const [calendarDate, setCalendarDate] = useState<Date | [Date, Date] | null>(new Date());

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (artistProfile && section === "profile") {
      if (artistProfile.photo) {
        setProfileImage(artistProfile.photo);
      }
      
      const socialLinks = parseSocialLinks(artistProfile.social_links || "{}");
      setFormData({
        stage_name: artistProfile.stage_name || "",
        bio: artistProfile.bio || "",
        genres: artistProfile.genres || "",
        min_price: artistProfile.min_price || 1000,
        instagram: socialLinks.instagram || "",
        twitter: socialLinks.twitter || "",
        facebook: socialLinks.facebook || "",
        youtube: socialLinks.youtube || "",
        soundcloud: socialLinks.soundcloud || "",
        spotify: socialLinks.spotify || "",
        bandcamp: socialLinks.bandcamp || ""
      });
    }
  }, [artistProfile, section]);

  // API Functions
  const fetchArtistProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('http://localhost:8000/api/artist/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile = await response.json();
        setArtistProfile(profile);
        if (profile.photo) {
          setProfileImage(profile.photo);
        }
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (err) {
      console.error('Error fetching artist profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setBookingsLoading(true);
      const response = await fetch('http://localhost:8000/api/artist/dashboard', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        
        setArtistProfile(dashboardData.profile);
        if (dashboardData.profile.photo) {
          setProfileImage(dashboardData.profile.photo);
        }
        
        setBookings(dashboardData.bookings);
        
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
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setBookingsLoading(false);
    }
  };


  const updateBookingDetails = async (bookingId: number, newDetails: any): Promise<boolean> => {

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDetails)
      });

      if (response.ok) {
        // TODO - UPDATE ON FRONTEND
        fetchDashboardData();
        return true;
      } else {
        console.error('Failed to update booking details:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Error updating booking details:', err);
      return false;
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // TODO - UPDATE ON FRONTEND
        fetchDashboardData();
        return true;
      } else {
        console.error('Failed to update booking status:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      return false;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const socialLinks = {
        instagram: formData.instagram,
        twitter: formData.twitter,
        facebook: formData.facebook,
        youtube: formData.youtube,
        soundcloud: formData.soundcloud,
        spotify: formData.spotify,
        bandcamp: formData.bandcamp,
      };

      const profileData = {
        stage_name: formData.stage_name,
        bio: formData.bio,
        genres: formData.genres,
        social_links: socialLinks,
        min_price: formData.min_price,
        photo: artistProfile?.photo || "",
      };

      const response = await fetch('http://localhost:8000/api/artist/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchArtistProfile();
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  // Event Handlers
  const handleMenuClick = (key: string) => {
    setSection(key);
    if (window.innerWidth < 600) setSidebarOpen(false);
  };

  // Computed Values
  const calendarEvents = bookings.map(b => ({
    id: b.id,
    title: b.venue_name,
    date: new Date(b.event_date),
    status: b.status,
  }));

  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return b.status === 'pending';
    if (filter === 'Approved') return b.status === 'accepted';
    if (filter === 'Close') return b.status === 'cancelled';
    return true;
  });

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
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white-900">Dashboard</h1>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="ml-3 text-white">Loading dashboard data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                  <SummaryCard label="Total Requests" value={dashboardStats.totalRequests} icon="📥" />
                  <SummaryCard label="Active Bookings" value={dashboardStats.activeBookings} icon="📅" />
                  <SummaryCard label="Pending" value={dashboardStats.pending} icon="⏳" />
                  <SummaryCard label="Approved" value={dashboardStats.approved} icon="✅" />
                  <SummaryCard label="Total Earnings" value={dashboardStats.totalEarnings} icon="💰" />
                </div>
                
                <div className="max-w-3xl">
                  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                    <div className="font-bold text-lg mb-4 text-gray-900">Recent Booking Requests</div>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No booking requests yet</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="text-gray-500 border-b">
                              <th className="py-2 pr-4 font-semibold">Client</th>
                              <th className="py-2 pr-4 font-semibold">Date</th>
                              <th className="py-2 pr-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.slice(0, 5).map((req) => (
                              <tr key={req.id} className="border-b last:border-0">
                                <td className="py-3 pr-4 font-medium text-gray-900">{req.client_first_name} {req.client_last_name}</td>
                                <td className="py-3 pr-4">{req.event_date} at {req.event_time}</td>
                                <td className="py-3 pr-4">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === "accepted" ? "bg-green-100 text-green-700" : req.status === "cancelled" ? "bg-gray-300 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {req.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Booking Requests Section */}
        {section === "requests" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-[#f0f0f0]">Booking Requests</h1>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="ml-3 text-white">Loading booking requests...</span>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-8">
                  {['All', 'Pending', 'Approved', 'Close'].map(tab => (
                    <button
                      key={tab}
                      className={`px-6 py-2 rounded-full font-semibold text-base shadow-sm transition-colors duration-150 ${filter === tab ? 'bg-blue-600 text-white' : 'bg-[#232733] text-[#f0f0f0] border border-[#333] hover:bg-blue-700'}`}
                      onClick={() => setFilter(tab as any)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
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
                          <div className="font-bold text-lg text-[#f0f0f0]">{req.client_first_name} {req.client_last_name}</div>
                          <div className="text-[#cccccc] text-sm">{req.venue_name}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-[#cccccc] text-sm">{req.event_date} at {req.event_time}</div>
                          <div className="text-blue-400 font-bold">${req.budget} {req.currency}</div>
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
        )}

        {/* Earnings Section */}
        {section === "earnings" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white-900">Earnings</h1>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="ml-3 text-white">Loading earnings data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <SummaryCard label="Total Revenue" value={earningsStats.totalRevenue} icon="💰" />
                  <SummaryCard label="Revenue This Month" value={earningsStats.thisMonth} icon="📈" />
                  <SummaryCard label="Avg. Booking Fee" value={earningsStats.avgFee} icon="💵" />
                  <SummaryCard label="Total Bookings" value={earningsStats.totalBookings} icon="📦" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Earnings Graph */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 col-span-2 flex flex-col justify-between min-h-[320px]">
                    <div className="font-bold text-lg mb-4 text-gray-900">Earnings Over Time</div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-48 w-full flex items-center justify-center text-gray-400 text-lg bg-gray-50 rounded-xl border border-dashed border-gray-200">[Graph Placeholder]</div>
                    </div>
                  </div>
                  
                  {/* Recent Approved Bookings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col">
                    <div className="font-bold text-lg mb-4 text-gray-900">Recent Approved Bookings</div>
                    {bookings.filter(b => b.status === 'accepted').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No approved bookings yet</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="text-gray-500 border-b">
                              <th className="py-2 pr-4 font-semibold">Client</th>
                              <th className="py-2 pr-4 font-semibold">Date</th>
                              <th className="py-2 pr-4 font-semibold">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings
                              .filter(b => b.status === 'accepted')
                              .slice(0, 5)
                              .map((req) => (
                                <tr key={req.id} className="border-b last:border-0">
                                  <td className="py-3 pr-4 font-medium text-gray-900">{req.client_first_name} {req.client_last_name}</td>
                                  <td className="py-3 pr-4">{req.event_date}</td>
                                  <td className="py-3 pr-4 font-semibold text-green-600">${req.budget} {req.currency}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile Section */}
        {section === "profile" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-gray-100">Edit Profile</h1>
            {profileLoading ? (
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-10 max-w-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="ml-3 text-white">Loading profile...</span>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-10 max-w-2xl flex flex-col gap-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-800">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-4xl text-white-400">👤</span>
                    )}
                  </div>
                  <label className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/png,image/jpeg" 
                      className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setProfileImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>

                {/* Basic Information */}
                <div>
                  <div className="text-lg font-bold text-white-900 mb-4">Basic Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Artist/DJ Name</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="Artist Name" 
                        value={formData.stage_name}
                        onChange={(e) => setFormData({...formData, stage_name: e.target.value})}
                        name="stage_name"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Location</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="Location" 
                        defaultValue="Tel Aviv, Israel"
                        name="location"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block font-semibold mb-1 text-white-700">Bio / Description</label>
                    <textarea 
                      className="w-full border rounded-lg px-4 py-2 text-base min-h-24" 
                      placeholder="Bio or description" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      name="bio"
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block font-semibold mb-1 text-white-700">Genres (comma-separated)</label>
                    <input 
                      className="w-full border rounded-lg px-4 py-2 text-base" 
                      placeholder="House, Techno, EDM" 
                      value={formData.genres}
                      onChange={(e) => setFormData({...formData, genres: e.target.value})}
                      name="genres"
                    />
                  </div>
                </div>

                {/* Booking & Media */}
                <div>
                  <div className="text-lg font-bold text-white-900 mb-4">Booking & Media</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Minimum Booking Fee</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        type="number" 
                        placeholder="$1000" 
                        value={formData.min_price}
                        onChange={(e) => setFormData({...formData, min_price: parseFloat(e.target.value) || 1000})}
                        name="min_price"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Currency</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="USD" 
                        defaultValue="USD"
                        name="currency"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <div className="text-lg font-bold text-white-900 mb-4">Social Media Links</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Instagram URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://instagram.com/yourprofile" 
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        name="instagram"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Twitter URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://twitter.com/yourprofile" 
                        value={formData.twitter}
                        onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                        name="twitter"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Facebook URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://facebook.com/yourprofile" 
                        value={formData.facebook}
                        onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                        name="facebook"
                      />
                    </div>
                  </div>
                </div>

                {/* Music & Media */}
                <div>
                  <div className="text-lg font-bold text-white-900 mb-4">Music & Media</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">YouTube URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://youtube.com/yourchannel" 
                        value={formData.youtube}
                        onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                        name="youtube"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">SoundCloud URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://soundcloud.com/yourprofile" 
                        value={formData.soundcloud}
                        onChange={(e) => setFormData({...formData, soundcloud: e.target.value})}
                        name="soundcloud"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Spotify URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://spotify.com/yourprofile" 
                        value={formData.spotify}
                        onChange={(e) => setFormData({...formData, spotify: e.target.value})}
                        name="spotify"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-white-700">Bandcamp URL</label>
                      <input 
                        className="w-full border rounded-lg px-4 py-2 text-base" 
                        placeholder="https://bandcamp.com/yourprofile" 
                        value={formData.bandcamp}
                        onChange={(e) => setFormData({...formData, bandcamp: e.target.value})}
                        name="bandcamp"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold text-lg shadow-lg">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Calendar Section */}
        {section === "calendar" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-gray-100">Calendar</h1>
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8 max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-gray-100">Booking Events</div>
                <button 
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold" 
                  onClick={() => alert('Google Calendar sync coming soon!')}
                >
                  Sync with Google Calendar
                </button>
              </div>
              <Calendar
                value={calendarDate as Date | [Date, Date] | null}
                onChange={value => setCalendarDate(value as Date | [Date, Date] | null)}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const event = calendarEvents.find(ev => ev.date.toDateString() === date.toDateString());
                    if (event) {
                      return (
                        <span className={`block w-2 h-2 rounded-full mt-1 mx-auto ${
                          event.status === 'accepted' ? 'bg-green-400' : 
                          event.status === 'pending' ? 'bg-yellow-400' : 
                          'bg-gray-400'
                        }`}></span>
                      );
                    }
                  }
                  return null;
                }}
                calendarType="gregory"
                className="!bg-[#232733] !text-gray-100 !border-none !rounded-xl !shadow-lg"
              />
              <div className="mt-6 text-gray-300 text-sm">Click an event date to view details (feature coming soon).</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}