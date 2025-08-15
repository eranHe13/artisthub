'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Send, User, Music, Clock, MapPin, Calendar, DollarSign  , EuroIcon } from 'lucide-react'

interface Message {
  id: number
  booking_request_id: number
  sender_user_id?: number | null
  sender_type: 'artist' | 'booker'
  message: string
  timestamp: string
  is_read: boolean
  sender_name: string
}

interface ChatResponse {
  messages: Message[]
  total_count: number
}

interface BookingDetails {
  id: number
  event_date: string
  event_time: string
  time_zone: string

  venue_name: string
  city: string
  country: string
  budget: number
  currency: string
  status: string
  performance_duration: number        // בדקות
  participant_count: number
  includes_travel: boolean
  includes_ground_transportation: boolean
  includes_accommodation: boolean
  client_first_name: string
  client_last_name: string
  artist_stage_name: string

}

export default function ChatPage() {
  const params = useParams()
  const bookingId = params.booking_id as string | undefined
  const chatToken = params.chat_token as string | undefined
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    
  }, [messages])

  // Fetch booking details
  const fetchBookingDetails = async () => {
    if (!bookingId || !chatToken) 
      return

    try {
      const response = await fetch(`/api/bookings/chat/${bookingId}/getbookingchat/booker?chat_token=${chatToken}`)
      if (response.ok) {
        const data = await response.json()
        console.log("booking = " , data)
        setBookingDetails(data)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    }
  }

  // Fetch messages
  const fetchMessages = async () => {
    if (!bookingId || !chatToken) {
      console.log("Missing booking ID or chat token")
      setError('Missing booking ID or chat token')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/chat/${bookingId}/getmessages/booker?chat_token=${chatToken}`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data: ChatResponse = await response.json()
      setMessages(data.messages)
      setError(null)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Failed to load chat messages')
    } finally {
      setLoading(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !bookingId || !chatToken || sending) return
    console.log("newMessage = " , newMessage)
    setSending(true)
    try {
      const response = await fetch(`/api/chat/${bookingId}/messages/booker?chat_token=${chatToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      console.log("response = " , response)
      const sentMessage: Message = await response.json()
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Initial load
  useEffect(() => {
    fetchBookingDetails()
    fetchMessages()
    console.log("bookingDetails = " , bookingDetails)
    console.log("messages = " , messages)
  }, [bookingId, chatToken])

 

  if (!bookingId || !chatToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Chat Link</h1>
          <p className="text-gray-600">
            This chat link is missing required information. Please check the link and try again.
          </p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="animate-spin text-purple-500 mb-4">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Chat...</h1>
          <p className="text-gray-600">Please wait while we load your conversation.</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Chat Not Available</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMessages}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Music className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold !text-black">
                    Chat with {bookingDetails?.artist_stage_name || 'Artist'}
                  </h1>
                  <p className="text-gray-600">Booking Details</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{bookingDetails?.event_date}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Details Summary */}
        {bookingDetails && (
          <div className="mb-6">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {bookingDetails.event_date} at {bookingDetails.event_time} ({bookingDetails.time_zone})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {bookingDetails.venue_name}, {bookingDetails.city}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {bookingDetails.budget} {bookingDetails.currency}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {bookingDetails.client_first_name} {bookingDetails.client_last_name}
                  </span>
                </div>
              <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
          Duration: {bookingDetails.performance_duration} min
          </span>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              Participants: {bookingDetails.participant_count}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Music className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              Status: <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                {bookingDetails.status}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              Travel: {bookingDetails.includes_travel ? 'Yes' : 'No'} ·
              Ground: {bookingDetails.includes_ground_transportation ? 'Yes' : 'No'} ·
              Accomm.: {bookingDetails.includes_accommodation ? 'Yes' : 'No'}
            </span>
          </div>
          </div>
            </Card>
          </div>
        )}

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No messages yet</p>
                <p>Start the conversation by sending your first message!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'artist' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_type === 'artist'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium opacity-75">
                        {message.sender_name}
                      </span>
                      <span className="text-xs opacity-50 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>

              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={1}
                style={{
                  minHeight: '40px',
                  maxHeight: '120px',
                }}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
