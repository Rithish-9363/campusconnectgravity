export type Role = 'student' | 'organiser';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  year?: string;
  title?: string;
  avatar?: string;
  interests?: string[];
  createdAt?: string;
}

export type EventCategory = 
  | 'Technology' 
  | 'Hackathons' 
  | 'Workshops' 
  | 'Cultural' 
  | 'Sports' 
  | 'Career' 
  | 'Arts' 
  | 'Gaming';

export type EventStatus = 'upcoming' | 'today' | 'full' | 'completed';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  banner: string;
  seatLimit: number;
  registeredCount: number;
  interestedCount: number;
  organiserId?: string;
  organiserName?: string;
  featured?: boolean;
  tags?: string[];
  agenda?: string[];
  createdAt?: string;
  
  // Dynamic fields computed by backend
  isToday?: boolean;
  isThisWeek?: boolean;
  dynamicStatus?: EventStatus;
  remainingSeats?: number;
  capacityPercent?: number;
  isFull?: boolean;
  isRegistered?: boolean;
  isInterested?: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  ticketCode: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  registeredAt: string;
  event?: CampusEvent;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'update' | 'alert';
  read: boolean;
  eventId?: string;
  createdAt: string;
}

export interface AIRecommendation {
  event: CampusEvent;
  matchScore: number;
  matchReason: string;
  isRegistered: boolean;
  isInterested: boolean;
}

export interface OrganiserAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  totalInterested: number;
  totalSeats: number;
  avgFillRate: number;
  categoryList: Array<{
    category: string;
    events: number;
    registrations: number;
  }>;
  topEvents: CampusEvent[];
  recentRegistrations: Array<Registration & { eventTitle: string }>;
}
