import React from "react";

export default function ProfilePage() {
  // TODO: Fetch and update artist profile data
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>
      <form className="flex flex-col gap-4">
        <input className="border rounded px-2 py-1" placeholder="Full Name" />
        <textarea className="border rounded px-2 py-1" placeholder="Bio" />
        <input className="border rounded px-2 py-1" placeholder="Minimum Price" type="number" />
        <input className="border rounded px-2 py-1" placeholder="Profile Image URL" />
        <input className="border rounded px-2 py-1" placeholder="Social Links (comma separated)" />
        <div className="bg-gray-100 h-24 flex items-center justify-center">Media upload placeholder</div>
        <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>
      <a href="/contract.pdf" download className="mt-6 inline-block bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition">Download Artist Contract</a>
    </main>
  );
} 