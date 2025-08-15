"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';

export default function AuthCallback() {
  console.log("AuthCallback");
  const [status, setStatus] = useState('Processing...');
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    let isProcessing = false;
    
    const handleCallback = async () => {
      // Prevent multiple executions
      if (isProcessing) return;
      isProcessing = true;
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('Authentication failed');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (!code) {
          setStatus('No authorization code received');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Send the code to backend for processing
        const response = await fetch(`/api/auth/google/callback?code=${code}`, {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          // Backend should redirect us, but if we get here, it means we need to handle the response
          const data = await response.json();
          if (data.success && data.user) {
            // Update auth context with user data
            login({
              id: data.user.id.toString(),
              name: data.user.name,
              email: data.user.email,
              picture: data.user.picture || ''
            });
            
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1000);
          } else {
            throw new Error('Invalid response from server');
          }
        } else {
          const errorData = await response.text();
          console.error('Backend error:', errorData);
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Authentication failed');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, []); // Remove dependencies to prevent re-runs

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">{status}</p>
      </div>
    </div>
  );
}