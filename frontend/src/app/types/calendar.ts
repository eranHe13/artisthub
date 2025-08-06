import { BookingRequest } from "./booking";

export interface CalendarEvent {
    id: number;
    title: string;
    date: Date;
    status: string;
    booking: BookingRequest;
  }