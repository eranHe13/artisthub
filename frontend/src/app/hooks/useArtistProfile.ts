import { useState, useCallback } from "react";

export interface ArtistProfile {
  id: number;
  user_id: number;
  stage_name: string;
  bio: string;
  genres: string;
  min_price: number;
  photo: string;
  profile_image: string; // alias for photo
  social_links: string;
  created_at: string;
  updated_at: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  soundcloud?: string;
  spotify?: string;
  bandcamp?: string;
}

export interface UseArtistProfileReturn {
  artistProfile: ArtistProfile | null;
  profileLoading: boolean;
  setArtistProfile: (profile: ArtistProfile | null) => void;
  fetchArtistProfile: () => Promise<void>;
  updateArtistProfile: (profileData: any) => Promise<boolean>;
}

export function useArtistProfile(): UseArtistProfileReturn {
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchArtistProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('http://localhost:8000/api/artist/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile = await response.json();
        setArtistProfile(profile);
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (err) {
      console.error('Error fetching artist profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateArtistProfile = useCallback(async (profileData: any): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/artist/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await fetchArtistProfile(); // Refresh profile after update
        return true;
      } else {
        console.error('Failed to update profile:', response.status);
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  }, [fetchArtistProfile]);

  return {
    artistProfile,
    profileLoading,
    setArtistProfile,
    fetchArtistProfile,
    updateArtistProfile,
  };
}
