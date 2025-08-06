"use client";
import React, { useState, useEffect } from "react";
import { BookingRequest } from "@/app/types/booking";

interface BookingDetailDrawerProps {
  req: BookingRequest;
  onClose: () => void;
  updateBookingDetails: (bookingId: number, newDetails: any) => Promise<boolean>;
  updateBookingStatus: (id: number, status: string) => Promise<boolean>;
}

export function BookingDetailDrawer({
  req,
  onClose,
  updateBookingDetails,
  updateBookingStatus,
}: BookingDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDateTime, setEditedDateTime] = useState("");
  const [editedDuration, setEditedDuration] = useState(req.performance_duration);
  const [editedBudget, setEditedBudget] = useState(req.budget);

  useEffect(() => {
    setEditedDateTime(`${req.event_date}T${req.event_time}`);
  }, [req.event_date, req.event_time]);

  const editable = req.status === "pending";

  const handleSave = async () => {
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
  };

  const handleApprove = async () => {
    await updateBookingStatus(req.id, "accepted");
  };

  const handleReject = async () => {
    await updateBookingStatus(req.id, "cancelled");
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-[#181c23] border-l border-[#cccccc] shadow-2xl z-50 flex flex-col transition-transform duration-300 animate-slide-in">
      {/* Close Button */}
      <button 
        className="absolute top-4 right-4 text-2xl text-[#cccccc] hover:text-white z-10" 
        onClick={onClose}
      >
        &times;
      </button>

      <div className="p-8 overflow-y-auto flex-1">
        {/* Header */}
        <div className="font-bold text-2xl mb-4 text-white">
          {req.client_first_name} {req.client_last_name} - {req.venue_name}
        </div>

        {/* Status and Actions */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Status</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusStyle(req.status)}`}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </span>
          
          <div className="flex gap-3 flex-wrap">
            {editable && req.status !== "accepted" && (
              <button
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow transition-colors"
                onClick={handleApprove}
              >
                Approve
              </button>
            )}
            {editable && req.status !== "cancelled" && (
              <button
                className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold shadow transition-colors"
                onClick={handleReject}
              >
                Reject
              </button>
            )}
            {editable && !isEditing && (
              <button
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow transition-colors"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Client Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-[#cccccc]">
            <div><span className="font-medium">Name:</span> {req.client_first_name} {req.client_last_name}</div>
            <div><span className="font-medium">Email:</span> {req.client_email}</div>
            <div><span className="font-medium">Phone:</span> {req.client_phone || "Not provided"}</div>
            <div><span className="font-medium">Company:</span> {req.client_company || "Not provided"}</div>
          </div>
        </div>

        {/* Event Details */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Event Details</div>

          {isEditing ? (
            <div className="space-y-4 text-[#cccccc]">
              <div>
                <label className="block font-semibold mb-1">Date & Time:</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 rounded-lg bg-[#2a2f3a] text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  value={editedDateTime}
                  onChange={e => setEditedDateTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duration (minutes):</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-[#2a2f3a] text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  value={editedDuration}
                  onChange={e => setEditedDuration(+e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Budget ({req.currency}):</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-[#2a2f3a] text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  value={editedBudget}
                  onChange={e => setEditedBudget(+e.target.value)}
                  min="0"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow transition-colors"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold shadow transition-colors"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-[#cccccc]">
              <div><span className="font-medium">Date & Time:</span> {req.event_date} at {req.event_time}</div>
              <div><span className="font-medium">Duration:</span> {req.performance_duration} minutes</div>
              <div><span className="font-medium">Budget:</span> ${req.budget.toLocaleString()} {req.currency}</div>
              <div><span className="font-medium">Venue:</span> {req.venue_name}</div>
              <div><span className="font-medium">Location:</span> {req.city}, {req.country}</div>
              <div><span className="font-medium">Participants:</span> {req.participant_count.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Additional Services */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Additional Services</div>
          <div className="space-y-2 text-base text-[#cccccc]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${req.includes_travel ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className="font-medium">Travel Expenses:</span> 
              <span className={req.includes_travel ? 'text-green-400' : 'text-gray-400'}>
                {req.includes_travel ? 'Included' : 'Not included'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${req.includes_accommodation ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className="font-medium">Accommodation:</span>
              <span className={req.includes_accommodation ? 'text-green-400' : 'text-gray-400'}>
                {req.includes_accommodation ? 'Included' : 'Not included'}
              </span>
            </div>
          </div>
        </div>

        {/* Client Message */}
        {req.client_message && (
          <div className="mb-6">
            <div className="font-semibold text-lg mb-2 text-white">Client Message</div>
            <div className="text-[#cccccc] bg-[#2a2f3a] p-4 rounded-lg border border-gray-600">
              {req.client_message}
            </div>
          </div>
        )}

        {/* Booking Timeline */}
        <div className="mb-6">
          <div className="font-semibold text-lg mb-2 text-white">Timeline</div>
          <div className="space-y-2 text-sm text-[#cccccc]">
            <div><span className="font-medium">Created:</span> {new Date(req.created_at).toLocaleString()}</div>
            <div><span className="font-medium">Last Updated:</span> {new Date(req.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}