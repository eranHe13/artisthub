"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookingSubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [artistInfo, setArtistInfo] = useState<{ min_price?: number; currency?: string }>({});
  const [form, setForm] = useState({
    // Step 1
    event_date: "",
    event_time: "",
    time_zone: "",
    budget: "",
    currency: "USD",
    venue_name: "",
    city: "",
    country: "",
    venue_address: "",
    performance_duration: "",
    participant_count: "",
    includes_travel: false,
    includes_accommodation: false,
    includes_ground_transportation: false,
    // Step 2
    client_first_name: "",
    client_last_name: "",
    client_company: "",
    client_email: "",
    client_phone: "",
    client_message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const artistName = searchParams.get("artistName");
  // Fetch artist information on component mount
  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const artistId = window.location.pathname.split('/')[2];
        const response = await fetch(`http://localhost:8000/api/public/artist/${artistId}`);
        if (response.ok) {
          const data = await response.json();
          setArtistInfo({
            min_price: data.min_price,
            currency: data.currency || 'USD'
          });
        }
      } catch (error) {
        console.error('Error fetching artist info:', error);
      }
    };

    fetchArtistInfo();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);
  
  const validateBudget = () => {
    if (!artistInfo.min_price) return true; // No minimum price set, allow any budget
    
    const budget = parseFloat(form.budget);
    if (isNaN(budget)) return false;
    
    return budget >= artistInfo.min_price;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      'event_date', 'event_time', 'time_zone', 'budget', 'venue_name', 
      'city', 'country', 'performance_duration', 'participant_count',
      'client_first_name', 'client_last_name', 'client_email'
    ];
    
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate budget against artist's minimum price
    if (!validateBudget()) {
      alert(`Budget must be at least ${artistInfo.min_price} ${artistInfo.currency || 'USD'}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get artist ID from URL
      const artistId = window.location.pathname.split('/')[2]; // /artist/[artistId]/booking
      
      // Prepare booking data
      const bookingData = {
        event_date: form.event_date,
        event_time: form.event_time,
        time_zone: form.time_zone,
        budget: parseFloat(form.budget),
        currency: form.currency,
        venue_name: form.venue_name,
        city: form.city,
        country: form.country,
        performance_duration: parseInt(form.performance_duration),
        participant_count: parseInt(form.participant_count),
        includes_travel: form.includes_travel,
        includes_accommodation: form.includes_accommodation,
        includes_ground_transportation: form.includes_ground_transportation,
        client_first_name: form.client_first_name,
        client_last_name: form.client_last_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        client_company: form.client_company,
        client_message: form.client_message
      };

      // Send booking request to API
      const response = await fetch(`http://localhost:8000/api/bookings/?artist_id=${artistId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setSubmitted(true);
        console.log('Booking submitted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Booking submission failed:', errorData);
        alert(`Booking submission failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error submitting booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimal timezones/currencies for demo
  const timezones = [
    "America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Jerusalem"
  ];
  const currencies = ["USD", "EUR", "ILS"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-2 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <button className="mb-4 px-4 py-2 bg-black-100 rounded !text-black !border-black" onClick={handlePrev} disabled={step === 1}>&lt; Back</button>
        <h1 className="text-3xl font-bold text-center mb-2 !text-black">Book {artistName}</h1>
        <p className="text-center mb-8 text-gray-600">Complete the booking process to request this artist for your event</p>
        {/* Progress Steps */}
        <div className="flex justify-center mb-8 gap-8">
          {[1,2,3].map((n) => (
            <div key={n} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step===n?"bg-blue-600 text-white":step>n?"bg-green-500 text-white":"bg-gray-200 text-gray-500"}`}>{step>n?"✓":n}</div>
              <div className="text-xs mt-1 font-semibold">{n===1?"Event Details":n===2?"Your Information":"Confirmation"}</div>
            </div>
          ))}
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="p-8 border-b">
            <CardTitle className="text-2xl font-bold text-center text-black">
              {step === 1 ? "Event Details" : step === 2 ? "Your Information" : "Confirmation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {step === 1 && (
              <form className="space-y-6" onSubmit={e => {e.preventDefault(); handleNext();}}>
                {/* Event Information */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>📅</span> Event Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Event Date *</label>
                      
                      <input type="date" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black " value={form.event_date} onChange={e=>handleChange('event_date',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Event Time *</label>
                      <input type="time" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black " value={form.event_time} onChange={e=>handleChange('event_time',e.target.value)} required />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 !text-black">Time Zone</label>
                    <select className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.time_zone} onChange={e=>handleChange('time_zone',e.target.value)}>
                      <option value="">Select timezone</option>
                      {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
                {/* Budget */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span className="text-green-600">$</span> Budget</div>
                  {artistInfo.min_price && (
                    <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <strong>Minimum Budget:</strong> {artistInfo.min_price} {artistInfo.currency || 'USD'}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Budget Amount *</label>
                      <input 
                        type="number" 
                        className={`w-full !border-2 rounded px-2 py-1 !bg-white !text-black ${
                          form.budget && !validateBudget() 
                            ? '!border-red-500 bg-red-50' 
                            : '!border-black'
                        }`}
                        value={form.budget} 
                        onChange={e=>handleChange('budget',e.target.value)} 
                        required 
                      />
                      {form.budget && !validateBudget() && (
                        <div className="text-red-600 text-sm mt-1">
                          Budget must be at least {artistInfo.min_price} {artistInfo.currency || 'USD'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Currency</label>
                      <select className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.currency} onChange={e=>handleChange('currency',e.target.value)}>
                        {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                {/* Venue Information */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>📍</span> Venue Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Venue Name *</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.venue_name} onChange={e=>handleChange('venue_name',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">City *</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.city} onChange={e=>handleChange('city',e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Country *</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.country} onChange={e=>handleChange('country',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Venue Address</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.venue_address} onChange={e=>handleChange('venue_address',e.target.value)} />
                    </div>
                  </div>
                </div>
                {/* Performance Details */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>⏱️</span> Performance Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Duration (minutes) *</label>
                      <input type="number" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.performance_duration} onChange={e=>handleChange('performance_duration',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Expected Participants *</label>
                      <input type="number" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.participant_count} onChange={e=>handleChange('participant_count',e.target.value)} required />
                    </div>
                  </div>
                </div>
                {/* Additional Services */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>🛫</span> Additional Services</div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">Include Travel Expenses</div>
                      <div className="text-xs text-gray-500">Flight, train, or bus transportation</div>
                    </div>
                    <input type="checkbox" checked={form.includes_travel} onChange={e=>handleChange('includes_travel',e.target.checked)} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">Include Accommodation</div>
                      <div className="text-xs text-gray-500">Hotel or lodging arrangements</div>
                    </div>
                    <input type="checkbox" checked={form.includes_accommodation} onChange={e=>handleChange('includes_accommodation',e.target.checked)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Include Ground Transportation</div>
                      <div className="text-xs text-gray-500">Car, shuttle, or local transport</div>
                    </div>
                    <input type="checkbox" checked={form.includes_ground_transportation} onChange={e=>handleChange('includes_ground_transportation',e.target.checked)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className={`px-8 py-2 rounded ${
                      form.budget && !validateBudget() 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    disabled={!!form.budget && !validateBudget()}
                  >
                    Next
                  </button>
                </div>
              </form>
            )}
            {step === 2 && (
              <form className="space-y-6" onSubmit={e => {e.preventDefault(); handleNext();}}>
                {/* Contact Information */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>👤</span> Contact Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">First Name *</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.client_first_name} onChange={e=>handleChange('client_first_name',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Last Name *</label>
                      <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.client_last_name} onChange={e=>handleChange('client_last_name',e.target.value)} required />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 !text-black">Company Name (Optional)</label>
                    <input className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.client_company} onChange={e=>handleChange('client_company',e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Email Address *</label>
                      <input type="email" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.client_email} onChange={e=>handleChange('client_email',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 !text-black">Phone Number *</label>
                      <input type="tel" className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black" value={form.client_phone} onChange={e=>handleChange('client_phone',e.target.value)} required />
                    </div>
                  </div>
                </div>
                {/* Message to Artist */}
                <div className="mb-6">
                  <div className="font-semibold mb-2 flex items-center gap-2"><span>💬</span> Message to Artist</div>
                  <textarea className="w-full !border-2 !border-black rounded px-2 py-1 !bg-white !text-black min-h-24" value={form.client_message} onChange={e=>handleChange('client_message',e.target.value)} placeholder="Tell the artist more about your event, special requirements, or any questions you have..." />
                  <div className="text-xs text-gray-500 mt-1">This message will be sent directly to the artist along with your booking request.</div>
                </div>
                {/* Summary */}
                <div className="mb-6 bg-blue-50 rounded p-4">
                  <div className="font-semibold text-lg mb-2">Booking Summary</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Event Date:</span><span className="font-medium">{form.event_date} at {form.event_time}</span></div>
                    <div className="flex justify-between"><span>Venue:</span><span className="font-medium">{form.venue_name}, {form.city}</span></div>
                    <div className="flex justify-between"><span>Duration:</span><span className="font-medium">{form.performance_duration} minutes</span></div>
                    <div className="flex justify-between"><span>Budget:</span><span className="font-medium">${form.budget} {form.currency}</span></div>
                    <div className="flex justify-between"><span>Travel Included:</span><span className="font-medium">{form.includes_travel ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span>Accommodation Included:</span><span className="font-medium">{form.includes_accommodation ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span>Ground Transportation Included:</span><span className="font-medium">{form.includes_ground_transportation ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button type="button" className="bg-gray-100 px-8 py-2 rounded" onClick={handlePrev}>Previous</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">Next</button>
                </div>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-5xl">📋</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Submit Booking</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">Please review your booking details below and click submit to send your request to <strong>DJ Eran</strong>.</p>
                </div>
                
                {/* Booking Summary */}
                <div className="bg-blue-50 rounded p-6 text-left">
                  <div className="font-semibold text-lg mb-4">Booking Summary</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Event Date:</strong> {form.event_date} at {form.event_time}</div>
                    <div><strong>Venue:</strong> {form.venue_name}, {form.city}</div>
                    <div><strong>Duration:</strong> {form.performance_duration} minutes</div>
                    <div><strong>Budget:</strong> {form.currency} {form.budget}</div>
                    <div><strong>Participants:</strong> {form.participant_count}</div>
                    <div><strong>Travel Included:</strong> {form.includes_travel ? 'Yes' : 'No'}</div>
                    <div><strong>Accommodation Included:</strong> {form.includes_accommodation ? 'Yes' : 'No'}</div>
                    <div><strong>Ground Transportation Included:</strong> {form.includes_ground_transportation ? 'Yes' : 'No'}</div>
                    <div><strong>Contact:</strong> {form.client_first_name} {form.client_last_name}</div>
                  </div>
                </div>
            {!submitted &&(
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button type="button" className="px-8 py-2 border rounded bg-white" onClick={handlePrev} disabled={isSubmitting}>Back to Edit</button>
                <button 
                  type="submit" 
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>

            )}

              </form>
            )}
            
            {submitted && (
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-5xl">✓</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Request Submitted!</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">Your booking request has been sent to <strong>DJ Eran</strong>. You'll receive a confirmation email shortly, and the artist will respond to your request soon.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className="px-8 py-2 border rounded bg-white" 
                    onClick={() => {
                      const artistId = window.location.pathname.split('/')[2];
                      router.push(`/artist/${artistId}`);
                    }}
                  >
                    Back to Artist Profile
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 