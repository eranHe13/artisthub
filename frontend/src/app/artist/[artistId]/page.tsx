"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User as UserIcon, Music, Link as LinkIcon, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

// SVG icons for music platforms
const SpotifyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#1ED760"/><path d="M23.5 22.1c-.3 0-.5-.1-.7-.2-4.2-2.6-9.5-3.2-15.1-1.7-.6.2-1.2-.2-1.4-.8-.2-.6.2-1.2.8-1.4 6.1-1.6 11.9-1 16.5 1.9.5.3.6 1 .3 1.5-.2.2-.5.3-.8.3zm1.1-3.2c-.4 0-.7-.1-1-.3-4.8-2.9-12.1-3.7-17.7-2-.7.2-1.4-.2-1.6-.9-.2-.7.2-1.4.9-1.6 6.2-1.9 14.1-1 19.5 2.2.6.4.8 1.1.4 1.7-.2.3-.6.5-1 .5zm1.2-3.3c-.4 0-.8-.1-1.1-.3-5.3-3.2-14.2-3.5-19.4-1.9-.8.2-1.6-.2-1.8-1-.2-.8.2-1.6 1-1.8 6-1.8 15.6-1.5 21.5 2.2.7.4.9 1.3.5 2-.3.4-.7.6-1.1.6z" fill="#fff"/></svg>
);
const YoutubeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#FF0000"/><path d="M22.5 13.1c-.2-.7-.7-1.2-1.4-1.4C19.7 11.3 16 11.3 16 11.3s-3.7 0-5.1.4c-.7.2-1.2.7-1.4 1.4-.4 1.4-.4 4.3-.4 4.3s0 2.9.4 4.3c.2.7.7 1.2 1.4 1.4 1.4.4 5.1.4 5.1.4s3.7 0 5.1-.4c.7-.2 1.2-.7 1.4-1.4.4-1.4.4-4.3.4-4.3s0-2.9-.4-4.3zm-8.1 6.9v-5.2l4.5 2.6-4.5 2.6z" fill="#fff"/></svg>
);
const SoundcloudIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#FF5500"/><path d="M24.2 19.2c-.2 0-.3 0-.5.1-.2-1.7-1.7-3-3.4-3-.3 0-.6.1-.9.2-.2-2.2-2-3.9-4.2-3.9-.3 0-.6 0-.9.1-.2 0-.3.2-.3.4v8.1c0 .2.2.4.4.4h9.8c.2 0 .4-.2.4-.4 0-1.1-.9-2-2-2zm-10.2-4.2c-.2 0-.4.2-.4.4v7.2c0 .2.2.4.4.4s.4-.2.4-.4v-7.2c0-.2-.2-.4-.4-.4zm-1.6 1.2c-.2 0-.4.2-.4.4v6c0 .2.2.4.4.4s.4-.2.4-.4v-6c0-.2-.2-.4-.4-.4zm-1.6 1.2c-.2 0-.4.2-.4.4v4.8c0 .2.2.4.4.4s.4-.2.4-.4v-4.8c0-.2-.2-.4-.4-.4zm-1.6 1.2c-.2 0-.4.2-.4.4v3.6c0 .2.2.4.4.4s.4-.2.4-.4v-3.6c0-.2-.2-.4-.4-.4z" fill="#fff"/></svg>
);

const BandcampIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#1ED760" />
    <path fill="#fff" d="M9 21l4.7-10H23L18.3 21H9z"/>
  </svg>
);



interface ArtistProfile {
  user_id: number;
  stage_name: string;
  bio: string;
  genres: string;
  social_links?: Record<string, string> | string | null; // ← היה string בלבד
  min_price: number;
  photo: string;
}

export default function ArtistProfilePage() {
  const { user, logout } = useAuth();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtistProfile();
  }, []);

  const fetchArtistProfile = async () => {
    try {
      setLoading(true);
      // Get artist ID from URL params
      const artistId = window.location.pathname.split('/').pop();
      const response = await fetch(`/api/public/artist/${artistId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile = await response.json();
        console.log(profile);
        setArtistProfile(profile);
      } else {
        setError('Failed to load artist profile');
      }
    } catch (err) {
      setError('Error loading artist profile');
      console.error('Error fetching artist profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSendInvitation = () => {
    const artistName = artistProfile?.stage_name || ""; 
    const artistId = artistProfile?.user_id;
  
    // קידוד לשימוש ב-URL
    const encodedName = encodeURIComponent(artistName);
  
    // מוסיפים ל-URL כ-Query Param
    window.location.href = `/artist/${artistId}/booking?artistName=${encodedName}`;
    console.log("Sending invitation with artistName:", artistName);
  };
  // Parse social links from JSON string
  const getSocialLinks = (): Record<string, string> => {
    const v = artistProfile?.social_links;
    if (!v) return {};
    if (typeof v === "string") {
      try { return JSON.parse(v); } catch { return {}; }
    }
    // כבר אובייקט
    return v as Record<string, string>;
  };
  // Parse genres from comma-separated string
  const getGenres = () => {
    if (!artistProfile?.genres) return [];
    return artistProfile.genres.split(',').map(g => g.trim()).filter(g => g);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchArtistProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = getSocialLinks();
  const genres = getGenres();
  const artistName = artistProfile?.stage_name || "DJ Artist";
  const bio = artistProfile?.bio || "Professional DJ and music producer. Available for bookings.";
  const minPrice = artistProfile?.min_price || 1000;
  const photo = artistProfile?.photo || "/profile.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative">
      {/* Login/User Button - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200"
              title="התנתק"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <a 
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 text-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19C20.1046 3 21 3.89543 21 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            התחבר
          </a>
        )}
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
        {/* Left: Main Content */}
        <div className="flex flex-col gap-4 items-center">
          {/* Image & Info Card */}
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl mx-auto shadow-lg">
            <CardContent className="py-8 px-4 flex flex-col md:flex-row items-center md:items-stretch text-center md:text-left">
              {/* Left: Image */}
              <div className="flex-shrink-0 flex items-center justify-center w-full md:w-1/2 mb-4 md:mb-0">
                <img
                  src={photo}
                  alt={artistName}
                  className="w-70 h-90 rounded-xl object-cover shadow-md border-2 border-gray-700 mx-auto"
                />
              </div>
              {/* Right: Info */}
              <div className="flex flex-col justify-center md:w-1/2 md:pl-8">
                <h1 className="text-3xl font-bold text-white mb-1 text-center md:text-left">{artistName}</h1>
                <div className="text-gray-400 mb-2 text-center md:text-left">Tel Aviv, Israel</div>
                <h2 className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start text-blue-400 mb-2">
                  <UserIcon className="w-5 h-5" /> About {artistName}
                </h2>
                <p className="text-gray-300 text-base mb-2 text-center md:text-left">{bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Genres & Specialties Card */}
          {genres.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl mx-auto shadow-lg">
              <CardContent className="py-6 text-center">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2 justify-center mb-3">
                  <Music className="w-5 h-5 text-indigo-400" /> Genres & Specialties
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {genres.map((genre) => (
                    <span key={genre} className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {genre}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listen to My Music Card */}
          {(socialLinks.youtube || socialLinks.soundcloud || socialLinks.spotify || socialLinks.bandcamp) && (
            <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl mx-auto shadow-lg">
              <CardContent className="py-6 text-center">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2 justify-center mb-4">
                  <LinkIcon className="w-5 h-5 text-green-400" /> Listen to My Music
                </h3>
                <div className="flex flex-row justify-center gap-6">
                  {socialLinks.spotify && (
                    <a href={socialLinks.spotify} className="hover:scale-110 transition" target="_blank" rel="noopener noreferrer">
                      <SpotifyIcon />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} className="hover:scale-110 transition" target="_blank" rel="noopener noreferrer">
                      <YoutubeIcon />
                    </a>
                  )}
                  {socialLinks.soundcloud && (
                    <a href={socialLinks.soundcloud} className="hover:scale-110 transition" target="_blank" rel="noopener noreferrer">
                      <SoundcloudIcon />
                    </a>
                  )}

                  {socialLinks.bandcamp && (
                      <a href={socialLinks.bandcamp} className="hover:scale-110 transition" target="_blank" rel="noopener noreferrer" aria-label="Bandcamp">
                        <BandcampIcon />
                      </a>
                    )}


                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Stacked Cards */}
        <div className="w-full md:w-80 flex flex-col gap-3">
          {/* Invitation Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardContent className="py-6 flex flex-col items-center text-center">
              <h1 className="text-lg font-semibold text-white mb-2">Invite {artistName}</h1>
              <div className="mb-4 text-lg font-bold text-blue-300">Start from: ${minPrice} USD</div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition" onClick={handleSendInvitation}>Send Invitation</button>
            </CardContent>
          </Card>
          {/* Follow Me Card */}
          {(socialLinks.instagram || socialLinks.twitter || socialLinks.facebook) && (
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="py-6 flex flex-col items-center text-center">
                <h3 className="font-semibold text-gray-200 mb-2">Follow Me</h3>
                <div className="flex gap-4 justify-center">
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} className="text-gray-400 hover:text-pink-400" target="_blank" rel="noopener noreferrer">
                      <span className="sr-only">Instagram</span>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"/></svg>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} className="text-gray-400 hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                      <span className="sr-only">Twitter</span>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37a8.59 8.59 0 0 1-2.72 1.04a4.28 4.28 0 0 0-7.29 3.9A12.13 12.13 0 0 1 3.11 4.9a4.28 4.28 0 0 0 1.32 5.71a4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19a4.3 4.3 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2c0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} className="text-gray-400 hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                      <span className="sr-only">Facebook</span>
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.05h-2.1v-2.9h2.1V9.5c0-2.07 1.23-3.22 3.12-3.22c.9 0 1.84.16 1.84.16v2.02h-1.04c-1.03 0-1.35.64-1.35 1.3v1.56h2.3l-.37 2.9h-1.93v7.05A10 10 0 0 0 22 12z"/></svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Ready to Invite Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardContent className="py-6 flex flex-col items-center text-center">
              <h3 className="font-semibold text-gray-200 mb-2">Welcome to ArtistryHub</h3>
              <p className="text-gray-400 text-center mb-2">Simplify your work, stay organized and manage bookings with ease <br></br> all in one place.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 