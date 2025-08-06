"use client";
import React, { useState } from "react";
import { ArtistProfile } from "@/app/hooks/useArtistProfile";

interface ProfileFormData {
  profile_image: string;
  stage_name: string;
  bio: string;
  genres: string;
  min_price: number;
  location: string;
  currency: string;
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
  soundcloud: string;
  spotify: string;
  bandcamp: string;
}

interface ProfileSectionProps {
  artistProfile: ArtistProfile | null;
  profileLoading: boolean;
  onProfileUpdate: (profileData: any) => Promise<boolean>;
}

export function ProfileSection({
  artistProfile,
  profileLoading,
  onProfileUpdate,
}: ProfileSectionProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    profile_image: artistProfile?.profile_image || "",
    stage_name: artistProfile?.stage_name || "",
    bio: artistProfile?.bio || "",
    genres: artistProfile?.genres || "",
    min_price: artistProfile?.min_price || 1000,
    location: "Tel Aviv, Israel", // Default value
    currency: "USD", // Default value
    instagram: artistProfile?.instagram || "",
    twitter: artistProfile?.twitter || "",
    facebook: artistProfile?.facebook || "",
    youtube: artistProfile?.youtube || "",
    soundcloud: artistProfile?.soundcloud || "",
    spotify: artistProfile?.spotify || "",
    bandcamp: artistProfile?.bandcamp || "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(
    artistProfile?.profile_image || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'artist-profile-images');

      const res = await fetch('https://api.cloudinary.com/v1_1/do4aoauyu/image/upload', {
        method: 'POST',
        body: data,
      });
      
      const result = await res.json();
      
      if (result.secure_url) {
        setProfileImage(result.secure_url);
        setFormData(prev => ({ ...prev, profile_image: result.secure_url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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
        photo: formData.profile_image,
      };

      const success = await onProfileUpdate(profileData);
      
      if (success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight text-gray-100">
        Edit Profile
      </h1>
      
      {profileLoading ? (
        <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-10 max-w-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-3 text-white">Loading profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-10 max-w-2xl flex flex-col gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-600 shadow-lg">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile Preview" 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <span className="text-5xl text-gray-400">👤</span>
              )}
            </div>
            
            <label className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors ${
              isUploading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-blue-700 hover:bg-blue-600 text-white'
            }`}>
              {isUploading ? 'Uploading...' : 'Upload Image'}
              <input 
                type="file" 
                accept="image/png,image/jpeg,image/jpg,image/webp" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-gray-400 text-center">
              Recommended: 400x400px, max 5MB<br />
              Formats: JPG, PNG, WebP
            </p>
          </div>

          {/* Basic Information */}
          <div>
            <div className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              Basic Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-300">Artist/DJ Name *</label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Your stage name" 
                  value={formData.stage_name}
                  onChange={(e) => updateFormData('stage_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300">Location</label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Your location" 
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-gray-300">Bio / Description</label>
              <textarea 
                className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base min-h-32 bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors resize-vertical" 
                placeholder="Tell people about your music, experience, and style..." 
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.bio.length}/500 characters
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-gray-300">Genres</label>
              <input 
                className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                placeholder="House, Techno, EDM, Hip Hop..." 
                value={formData.genres}
                onChange={(e) => updateFormData('genres', e.target.value)}
              />
              <div className="text-xs text-gray-400 mt-1">
                Separate multiple genres with commas
              </div>
            </div>
          </div>

          {/* Booking & Pricing */}
          <div>
            <div className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Booking & Pricing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-300">Minimum Booking Fee *</label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  type="number" 
                  placeholder="1000" 
                  value={formData.min_price}
                  onChange={(e) => updateFormData('min_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="50"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300">Currency</label>
                <select 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData.currency}
                  onChange={(e) => updateFormData('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="ILS">ILS (₪)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <div className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Social Media
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-pink-500">📷</span>
                  Instagram
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://instagram.com/yourprofile" 
                  value={formData.instagram}
                  onChange={(e) => updateFormData('instagram', e.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-blue-400">🐦</span>
                  Twitter
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://twitter.com/yourprofile" 
                  value={formData.twitter}
                  onChange={(e) => updateFormData('twitter', e.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-blue-600">📘</span>
                  Facebook
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://facebook.com/yourprofile" 
                  value={formData.facebook}
                  onChange={(e) => updateFormData('facebook', e.target.value)}
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Music Platforms */}
          <div>
            <div className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              Music Platforms
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-red-500">📺</span>
                  YouTube
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://youtube.com/yourchannel" 
                  value={formData.youtube}
                  onChange={(e) => updateFormData('youtube', e.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-orange-500">🔊</span>
                  SoundCloud
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://soundcloud.com/yourprofile" 
                  value={formData.soundcloud}
                  onChange={(e) => updateFormData('soundcloud', e.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-green-500">🎧</span>
                  Spotify
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://open.spotify.com/artist/yourprofile" 
                  value={formData.spotify}
                  onChange={(e) => updateFormData('spotify', e.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <span className="text-cyan-500">💿</span>
                  Bandcamp
                </label>
                <input 
                  className="w-full border border-gray-600 rounded-lg px-4 py-3 text-base bg-[#2a2f3a] text-white focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="https://yourname.bandcamp.com" 
                  value={formData.bandcamp}
                  onChange={(e) => updateFormData('bandcamp', e.target.value)}
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-colors ${
                isSaving 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}