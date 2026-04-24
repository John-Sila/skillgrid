export type Category = 'Household' | 'Maintenance' | 'Logistics' | 'Outdoor' | 'Lifestyle' | 'Staff';
export type TierLevel = 'Basic' | 'Premium' | 'Luxury';
export type UserRole = 'client' | 'provider';
export type SortOption = 'none' | 'rating' | 'price' | 'distance';

export interface Testimonial {
  writer: string;
  text: string;
  rating: number;
  date: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reason: string;
  date: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'appealed';
  appealText?: string;
  appealDate?: string;
}

export interface Milestone {
  id: string;
  label: string;
  status: 'pending' | 'locked' | 'released';
  amount: number;
}

export interface Provider {
  id: string;
  name: string;
  category: Category;
  subCategory?: string;
  tier: TierLevel;
  bio: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  pricePerHour: number;
  image: string;
  verified: boolean;
  joined: string;
  isAvailable: boolean;
  services: string[];
  reliability: number;
  flaggedCount: number;
  testimonials: Testimonial[];
  reports: UserReport[];
}

export interface Client {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  reliability: number;
  flaggedCount: number;
  location: string;
  reports: UserReport[];
}

export interface Booking {
  id: string;
  providerId: string;
  clientId: string;
  date: any;
  time: string;
  category: Category | string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'paid' | 'closed' | 'cancelled' | 'disputed';
  price: number;
  paymentScheduled: boolean;
  completionTimestamp?: any;
  milestones?: Milestone[];
}

export interface Invoice {
  id: string;
  bookingId: string;
  providerId: string;
  clientId: string;
  amount: number;
  platformFee: number;
  total: number;
  description: string;
  status: 'sent' | 'approved' | 'disputed' | 'paid';
  timestamp: any;
  providerName: string;
  clientName: string;
}
