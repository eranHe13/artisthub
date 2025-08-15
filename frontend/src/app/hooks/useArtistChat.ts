import { useCallback, useEffect, useState } from "react";

export interface Message {
  id: number;
  booking_request_id: number;
  sender_user_id?: number | null;
  sender_type: "artist" | "booker";
  message: string;
  timestamp: string;
  is_read: boolean;
  sender_name: string;
}

export interface ChatResponse {
  messages: Message[];
  total_count: number;
}

export function useArtistChat(bookingId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${bookingId}/messages/artist`, {
        credentials: "include", // שליחת קוקי אימות
      });
      if (!res.ok) throw new Error(`Failed to fetch artist messages (${res.status})`);
      const data: ChatResponse = await res.json();
      setMessages(data.messages);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const sendArtistMessage = useCallback(
    async (message: string) => {
      if (!bookingId) throw new Error("Missing bookingId");
      const res = await fetch(`/api/chat/${bookingId}/messages/artist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }), // חשוב: message (MessageCreate)
      });
      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);
      const sent = (await res.json()) as Message;
      // עדכון אופטימי
      setMessages((prev) => [...prev, sent]);
      return sent;
    },
    [bookingId]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { messages, loading, error, refetch, sendArtistMessage, setMessages };
}