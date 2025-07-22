import React from "react";

export default function BookingChatPage({ params }: { params: { requestId: string } }) {
  // TODO: Fetch chat messages from API
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Chat with Artist</h1>
      <div className="bg-gray-100 h-64 mb-4 p-2 overflow-y-auto rounded">{/* Messages */}</div>
      <form className="flex gap-2">
        <input className="flex-1 border rounded px-2 py-1" placeholder="Type your message..." />
        <button className="bg-primary text-white px-4 py-1 rounded" type="submit">Send</button>
      </form>
    </main>
  );
} 