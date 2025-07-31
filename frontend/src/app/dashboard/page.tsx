"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type Value = Date | Date[] | null;

const MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "requests", label: "Booking Requests" },
  { key: "calendar", label: "Calendar" },
  { key: "earnings", label: "Earnings" },
  { key: "profile", label: "Profile" }
];

export default function DashboardPage() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load profile on component mount
  useEffect(() => {
    fetchArtistProfile();
  }, []);

  // Update form when profile is loaded
  useEffect(() => {
    if (artistProfile && section === "profile") {
      // Update profile image if available
      if (artistProfile.photo) {
        setProfileImage(artistProfile.photo);
      }
      
      // Update form data
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

  // useEffect(() => {
  //   // Load profile when dashboard opens or when switching to profile section
  //   if (section === "profile") {
  //     fetchArtistProfile();
  //   }
  // }, [section, artistProfile]);

  const fetchArtistProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/artist/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile = await response.json();
        setArtistProfile(profile);
        // Set profile image if available
        if (profile.photo) {
          setProfileImage(profile.photo);
        }
      }
    } catch (err) {
      console.error('Error fetching artist profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Helper function to safely parse JSON
  const parseSocialLinks = (socialLinksString: string) => {
    try {
      return JSON.parse(socialLinksString);
    } catch {
      return {};
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

      const response = await fetch('/api/artist/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchArtistProfile(); // Refresh the profile data
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  const handleMenuClick = (key: string) => {
    setSection(key);
    if (window.innerWidth < 600) setSidebarOpen(false);
  };

  const summary = {
    totalRequests: 42,
    activeBookings: 8,
    pending: 5,
    approved: 30,
    totalEarnings: "$12,500",
  };
  const earnings = {
    totalRevenue: "$12,500",
    thisMonth: "$2,000",
    avgFee: "$400",
    totalBookings: 32,
  };

  const [requests, setRequests] = useState([
    {
      id: 1,
      client: "John Doe",
      email: "john@example.com",
      phone: "+1 555-1234",
      company: "Acme Corp",
      date: "2024-07-10 20:00",
      venue: "Club XYZ",
      location: "Tel Aviv, Israel",
      duration: "90 minutes",
      participants: 200,
      budget: "$2,500",
      travel: "Yes",
      accommodation: "No",
      message: "Looking forward to a great event!",
      status: "Pending",
      chat: [
        { from: "artist", text: "Hi, is there parking at the venue?" },
        { from: "client", text: "Yes, there is a parking lot for artists." },
      ],
    },
    {
      id: 2,
      client: "Alice Smith",
      email: "alice@company.com",
      phone: "+44 1234 567890",
      company: "Smith Events",
      date: "2024-07-12 18:00",
      venue: "Event Hall A",
      location: "London, UK",
      duration: "120 minutes",
      participants: 150,
      budget: "$3,000",
      travel: "No",
      accommodation: "Yes",
      message: "Please confirm sound check time.",
      status: "Approved",
      chat: [],
    },
    {
      id: 3,
      client: "Bob Lee",
      email: "bob@lee.com",
      phone: "+1 222-3333",
      company: "Lee Productions",
      date: "2024-07-15 21:00",
      venue: "Open Air Stage",
      location: "New York, USA",
      duration: "60 minutes",
      participants: 500,
      budget: "$5,000",
      travel: "Yes",
      accommodation: "Yes",
      message: "Outdoor event, please bring backup equipment.",
      status: "Pending",
      chat: [],
    },
    {
      id: 4,
      client: "Charlie Kim",
      email: "charlie@kim.com",
      phone: "+82 10-1234-5678",
      company: "Kim Entertainment",
      date: "2024-07-20 19:30",
      venue: "Seoul Arena",
      location: "Seoul, South Korea",
      duration: "75 minutes",
      participants: 300,
      budget: "$4,200",
      travel: "No",
      accommodation: "No",
      message: "Let us know your technical rider.",
      status: "Approved",
      chat: [],
    },
    {
      id: 5,
      client: "Dana Green",
      email: "dana@green.com",
      phone: "+972 54-123-4567",
      company: "Green Events",
      date: "2024-07-25 20:00",
      venue: "Beach Club",
      location: "Haifa, Israel",
      duration: "90 minutes",
      participants: 250,
      budget: "$2,800",
      travel: "Yes",
      accommodation: "No",
      message: "Is there a discount for repeat bookings?",
      status: "Pending",
      chat: [],
    },
  ]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Close'>('All');
  const [calendarDate, setCalendarDate] = useState<Date | [Date, Date] | null>(new Date());
  const [calendarEvents] = useState(requests.map(r => ({
    id: r.id,
    title: r.venue,
    date: new Date(r.date.split(' ')[0]),
    status: r.status,
  })));

  return (
    <div className="flex min-h-screen bg-[#181c23] text-gray-100">
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-gray-800 rounded-full p-2 shadow-lg border border-gray-700"
        style={{ display: sidebarOpen ? "none" : "block" }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect y="5" width="24" height="2" rx="1" fill="#fff"/><rect y="11" width="24" height="2" rx="1" fill="#fff"/><rect y="17" width="24" height="2" rx="1" fill="#fff"/></svg>
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 bg-[#232733] border-r border-gray-800 flex flex-col items-center py-10 px-6 shadow-lg transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ minHeight: "100vh" }}
      >
        <div className="text-3xl font-extrabold tracking-tight mb-1 text-white">ArtistryHub <br /></div>
        <div className="text-2xl font-extrabold tracking-tight mb-1 text-white">Control Panel</div>
        <div className="text-sm text-gray-400 mb-6 text-center leading-tight">Manage bookings, earnings, and your profile</div>
        <hr className="w-full border-gray-700 mb-8" />
        <nav className="flex flex-col gap-2 w-full">
          <a
            href={`/artist/${artistProfile?.user_id || 1}`}
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
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 600 && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Main Content */}
      <main className="flex-1 px-8 py-12 md:px-16 md:py-16 bg-[#181c23] min-h-screen">
        {section === "dashboard" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white-900">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              <SummaryCard label="Total Requests" value={summary.totalRequests} icon="📥" />
              <SummaryCard label="Active Bookings" value={summary.activeBookings} icon="📅" />
              <SummaryCard label="Pending" value={summary.pending} icon="⏳" />
              <SummaryCard label="Approved" value={summary.approved} icon="✅" />
              <SummaryCard label="Total Earnings" value={summary.totalEarnings} icon="💰" />
            </div>
            <div className="max-w-3xl">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                <div className="font-bold text-lg mb-4 text-gray-900">Recent Booking Requests</div>
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
                      {requests.map((req) => (
                        <tr key={req.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium text-gray-900">{req.client}</td>
                          <td className="py-3 pr-4">{req.date}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === "Approved" ? "bg-green-100 text-green-700" : req.status === "Closed" ? "bg-gray-300 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {section === "requests" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-[#f0f0f0]">Booking Requests</h1>
            <div className="flex gap-3 mb-8">
              {['All', 'Pending', 'Approved', 'Close'].map(tab => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-full font-semibold text-base shadow-sm transition-colors duration-150 ${filter === tab ? 'bg-blue-600 text-white' : 'bg-[#232733] text-[#f0f0f0] border border-[#333] hover:bg-blue-700'}`}
                  onClick={() => setFilter(tab as any)}
                >{tab}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-4xl">
              {requests.filter(r => filter === 'All' ? true : (filter === 'Close' ? r.status === 'Closed' : r.status === filter)).map(req => (
                <div key={req.id} className="bg-[#232733] rounded-xl shadow-lg border border-[#cccccc]/40 p-6 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  onClick={() => setExpandedRequestId(req.id)}
                >
                  <div>
                    <div className="font-bold text-lg text-[#f0f0f0]">{req.client}</div>
                    <div className="text-[#cccccc] text-sm">{req.venue}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[#cccccc] text-sm">{req.date}</div>
                    <div className="text-blue-400 font-bold">{req.budget}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Slide-in details panel */}
            {expandedRequestId && (() => {
              const req = requests.find(r => r.id === expandedRequestId);
              if (!req) return null;
              const isEditing = editId === req.id;

              // Disable editing for Approved or Closed
              const editable = req.status === "Pending";

              // Always display status name in English
              const statusDisplay = req.status;

              return (
                <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-[#181c23] border-l border-[#cccccc] shadow-2xl z-50 flex flex-col transition-transform duration-300 animate-slide-in">
                  <button className="absolute top-4 right-4 text-[#cccccc] hover:text-white text-2xl" onClick={() => setExpandedRequestId(null)}>&times;</button>
                  <div className="p-8 overflow-y-auto flex-1">
                    <div className="font-bold text-2xl mb-4 text-white">{req.client} - {req.venue}</div>
                    <div className="mb-4 text-[#cccccc]">{req.date} | {req.budget}</div>
                    <div className="mb-6">
                      <div className="font-semibold text-lg mb-2 text-white">Status</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${req.status === "Approved" ? "bg-green-100 text-green-700" : req.status === "Closed" ? "bg-gray-300 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {statusDisplay}
                      </span>
                      <div className="flex gap-3">
                        {editable && req.status !== 'Approved' && (
                          <button
                            className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-500"
                            onClick={() => {
                              setRequests(reqs => reqs.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
                              setExpandedRequestId(null);
                            }}
                          >Approve</button>
                        )}
                        {editable && req.status !== 'Closed' && (
                          <button
                            className="px-5 py-2 rounded-lg bg-red-700 text-white font-semibold shadow hover:bg-red-600"
                            onClick={() => {
                              setRequests(reqs => reqs.map(r => r.id === req.id ? { ...r, status: 'Closed' } : r));
                              setExpandedRequestId(null);
                            }}
                          >Close</button>
                        )}
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="font-semibold text-lg mb-2 text-white">Client Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div><span className="font-semibold text-[#cccccc]">Name:</span> {req.client}</div>
                        <div><span className="font-semibold text-[#cccccc]">Email:</span> {req.email}</div>
                        <div><span className="font-semibold text-[#cccccc]">Phone:</span> {req.phone}</div>
                        <div><span className="font-semibold text-[#cccccc]">Company:</span> {req.company}</div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="font-semibold text-lg mb-2 text-white">Event Details</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div>
                          <span className="font-semibold text-[#cccccc]">Date & Time:</span>
                          {isEditing && editable ? (
                            <input
                              className="bg-[#232733] border border-[#cccccc] rounded px-2 py-1 w-full text-[#f0f0f0] mt-1"
                              value={editForm.date}
                              onChange={e => setEditForm((f: any) => ({ ...f, date: e.target.value }))}
                            />
                          ) : (
                            <span className="ml-2">{req.date}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-[#cccccc]">Duration:</span>
                          {isEditing && editable ? (
                            <input
                              className="bg-[#232733] border border-[#cccccc] rounded px-2 py-1 w-full text-[#f0f0f0] mt-1"
                              value={editForm.duration}
                              onChange={e => setEditForm((f: any) => ({ ...f, duration: e.target.value }))}
                            />
                          ) : (
                            <span className="ml-2">{req.duration}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-[#cccccc]">Price:</span>
                          {isEditing && editable ? (
                            <input
                              className="bg-[#232733] border border-[#cccccc] rounded px-2 py-1 w-full text-[#f0f0f0] mt-1"
                              value={editForm.budget}
                              onChange={e => setEditForm((f: any) => ({ ...f, budget: e.target.value }))}
                            />
                          ) : (
                            <span className="ml-2">{req.budget}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-[#cccccc]">Venue:</span> {req.venue}
                        </div>
                        <div>
                          <span className="font-semibold text-[#cccccc]">Location:</span> {req.location}
                        </div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="font-semibold text-lg mb-2 text-white">Financial Info</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div><span className="font-semibold text-[#cccccc]">Offered Budget:</span> {req.budget}</div>
                        <div><span className="font-semibold text-[#cccccc]">Includes Travel:</span> {req.travel}</div>
                        <div><span className="font-semibold text-[#cccccc]">Includes Accommodation:</span> {req.accommodation}</div>
                        <div className="sm:col-span-2"><span className="font-semibold text-[#cccccc]">Client Message:</span> {req.message}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      {isEditing && editable ? (
                        <>
                          <button className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-500" onClick={e => {
                            e.preventDefault();
                            setRequests(reqs => reqs.map(r => r.id === req.id ? { ...r, ...editForm } : r));
                            setEditId(null);
                            setEditForm({});
                          }}>Save</button>
                          <button className="px-5 py-2 rounded-lg bg-gray-700 text-[#f0f0f0] font-semibold shadow hover:bg-gray-600" onClick={e => { e.preventDefault(); setEditId(null); setEditForm({}); }}>Cancel</button>
                        </>
                      ) : (
                        editable &&
                        <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-500" onClick={e => { e.preventDefault(); setEditId(req.id); setEditForm(req); }}>Edit</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {section === "earnings" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-white-900">Earnings</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <SummaryCard label="Total Revenue" value={earnings.totalRevenue} icon="💰" />
              <SummaryCard label="Revenue This Month" value={earnings.thisMonth} icon="📈" />
              <SummaryCard label="Avg. Booking Fee" value={earnings.avgFee} icon="💵" />
              <SummaryCard label="Total Bookings" value={earnings.totalBookings} icon="📦" />
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
                      <tr className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">Bob Lee</td>
                        <td className="py-3 pr-4">2024-06-28</td>
                        <td className="py-3 pr-4"><span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span></td>
                      </tr>
                      <tr className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">Jane Roe</td>
                        <td className="py-3 pr-4">2024-06-20</td>
                        <td className="py-3 pr-4"><span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
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
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfileImageFile(file);
                      const reader = new FileReader();
                      reader.onload = ev => setProfileImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
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
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold text-lg shadow-lg">Save</button>
              </div>
            </form>
            )}
          </div>
        )}
        {section === "calendar" && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-gray-100">Calendar</h1>
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8 max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-gray-100">Booking Events</div>
                <button className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => alert('Google Calendar sync coming soon!')}>Sync with Google Calendar</button>
              </div>
              <Calendar
                value={calendarDate as Date | [Date, Date] | null}
                onChange={value => setCalendarDate(value as Date | [Date, Date] | null)}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const event = calendarEvents.find(ev => ev.date.toDateString() === date.toDateString());
                    if (event) {
                      return <span className={`block w-2 h-2 rounded-full mt-1 mx-auto ${event.status === 'Approved' ? 'bg-green-400' : event.status === 'Pending' ? 'bg-yellow-400' : 'bg-gray-400'}`}></span>
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

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[120px]">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className="text-2xl font-extrabold text-gray-100 mb-1">{value}</div>
      <div className="text-xs text-gray-400 font-semibold tracking-wide uppercase">{label}</div>
    </div>
  );
}