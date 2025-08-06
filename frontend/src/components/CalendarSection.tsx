"use client";
import React, { useState, useMemo } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BookingRequest } from "@/app/types/booking";

type CalendarValue = Date | Date[] | null;

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  booking: BookingRequest;
}

interface CalendarSectionProps {
  bookings: BookingRequest[];
  bookingsLoading: boolean;
  onEventClick?: (booking: BookingRequest) => void;
}

export function CalendarSection({
  bookings,
  bookingsLoading,
  onEventClick,
}: CalendarSectionProps) {
  const [calendarDate, setCalendarDate] = useState<CalendarValue>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return bookings.map(b => ({
      id: b.id,
      title: b.venue_name,
      date: new Date(b.event_date),
      status: b.status,
      booking: b,
    }));
  }, [bookings]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return calendarEvents.filter(event => 
      event.date.toDateString() === selectedDate.toDateString()
    );
  }, [calendarEvents, selectedDate]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return calendarEvents
      .filter(event => event.date >= now && event.date <= nextWeek)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [calendarEvents]);

  const handleDateClick = (value: CalendarValue) => {
    setCalendarDate(value);
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleSyncCalendar = () => {
    alert('Google Calendar sync coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-400';
      case 'pending':
        return 'bg-yellow-400';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-blue-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100">
          Calendar
        </h1>
        <div className="flex gap-3">
          <div className="flex bg-[#232733] rounded-lg p-1 border border-gray-700">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setViewMode('agenda')}
            >
              Agenda
            </button>
          </div>
          <button
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            onClick={handleSyncCalendar}
          >
            Sync with Google Calendar
          </button>
        </div>
      </div>

      {bookingsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-3 text-white">Loading calendar data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className={`${viewMode === 'month' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-100">Booking Events</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    <span className="text-gray-300">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-300">Cancelled</span>
                  </div>
                </div>
              </div>

              {viewMode === 'month' ? (
                <div className="calendar-container">
                  <Calendar
                    value={calendarDate}
                    onChange={handleDateClick}
                    tileContent={({ date, view }) => {
                      if (view === 'month') {
                        const dayEvents = calendarEvents.filter(ev => 
                          ev.date.toDateString() === date.toDateString()
                        );
                        if (dayEvents.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {dayEvents.slice(0, 2).map((event) => (
                                <span
                                  key={event.id}
                                  className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}
                                  title={`${event.title} - ${getStatusLabel(event.status)}`}
                                ></span>
                              ))}
                              {dayEvents.length > 2 && (
                                <span className="text-xs text-gray-400">+{dayEvents.length - 2}</span>
                              )}
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                    calendarType="gregory"
                    className="custom-calendar"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-3">📅</div>
                      <div className="font-semibold">No events scheduled</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Your booking events will appear here
                      </div>
                    </div>
                  ) : (
                    calendarEvents
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((event) => (
                        <div
                          key={event.id}
                          className="bg-[#2a2f3a] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                          onClick={() => onEventClick?.(event.booking)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-white">
                              {event.title}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {event.date.toLocaleDateString()} • {event.booking.event_time}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.booking.client_first_name} {event.booking.client_last_name} • 
                            ${event.booking.budget.toLocaleString()}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - only show in month view */}
          {viewMode === 'month' && (
            <div className="space-y-6">
              {/* Selected Date Events */}
              {selectedDate && (
                <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                  <h3 className="font-bold text-lg text-white mb-4">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-gray-400 text-sm">No events on this date</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-[#2a2f3a] rounded-lg p-3 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                          onClick={() => onEventClick?.(event.booking)}
                        >
                          <div className="font-medium text-white text-sm mb-1">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.booking.event_time} • {event.booking.client_first_name} {event.booking.client_last_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Events */}
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                <h3 className="font-bold text-lg text-white mb-4">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <div className="text-gray-400 text-sm">No upcoming events this week</div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-[#2a2f3a] rounded-lg p-3 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                        onClick={() => onEventClick?.(event.booking)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-white text-sm">
                            {event.title}
                          </div>
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.date.toLocaleDateString()} • {event.booking.event_time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6">
                <h3 className="font-bold text-lg text-white mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Events</span>
                    <span className="text-white font-semibold">
                      {calendarEvents.filter(e => 
                        e.date.getMonth() === new Date().getMonth() &&
                        e.date.getFullYear() === new Date().getFullYear()
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Confirmed</span>
                    <span className="text-green-400 font-semibold">
                      {calendarEvents.filter(e => 
                        e.status === 'accepted' &&
                        e.date.getMonth() === new Date().getMonth() &&
                        e.date.getFullYear() === new Date().getFullYear()
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pending</span>
                    <span className="text-yellow-400 font-semibold">
                      {calendarEvents.filter(e => 
                        e.status === 'pending' &&
                        e.date.getMonth() === new Date().getMonth() &&
                        e.date.getFullYear() === new Date().getFullYear()
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-calendar {
          background-color: #232733 !important;
          color: #f3f4f6 !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
          width: 100% !important;
        }
        
        .custom-calendar .react-calendar__navigation {
          background-color: #2a2f3a !important;
          border-radius: 8px 8px 0 0 !important;
          margin-bottom: 1rem !important;
        }
        
        .custom-calendar .react-calendar__navigation button {
          color: #f3f4f6 !important;
          font-weight: 600 !important;
        }
        
        .custom-calendar .react-calendar__navigation button:hover {
          background-color: #374151 !important;
        }
        
        .custom-calendar .react-calendar__tile {
          background-color: transparent !important;
          color: #f3f4f6 !important;
          border: 1px solid #374151 !important;
          padding: 0.75rem 0.25rem !important;
          height: 60px !important;
        }
        
        .custom-calendar .react-calendar__tile:hover {
          background-color: #374151 !important;
        }
        
        .custom-calendar .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .custom-calendar .react-calendar__tile--now {
          background-color: #1f2937 !important;
          border-color: #3b82f6 !important;
        }
        
        .custom-calendar .react-calendar__month-view__weekdays {
          background-color: #2a2f3a !important;
        }
        
        .custom-calendar .react-calendar__month-view__weekdays__weekday {
          color: #9ca3af !important;
          font-weight: 600 !important;
          padding: 0.5rem !important;
        }
      `}</style>
    </div>
  );
}