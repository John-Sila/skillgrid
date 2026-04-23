/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  Sparkles, 
  Heart, 
  Home,
  Leaf,
  User, 
  Briefcase, 
  Filter,
  ArrowRight,
  Phone,
  MessageSquare,
  CheckCircle2,
  Settings,
  Clock,
  Trash2,
  RefreshCcw,
  Zap,
  Wrench,
  Paintbrush,
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
  Send,
  MoreVertical,
  Activity,
  ShieldCheck,
  Moon,
  Sun,
  LayoutDashboard,
  BarChart3,
  Calendar,
  Wallet,
  Users,
  Search,
  Check,
  UserCheck,
  ChevronLeft,
  ChevronDown,
  Bell,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Dumbbell,
  Gem,
  BookOpen,
  FileText,
  AlertCircle,
  Camera,
  Upload,
  Link as LinkIcon,
  Award,
  FileCheck,
  Globe,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { auth, db, signInWithGoogle } from './firebase-config';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  or,
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { workflowService } from './services/workflowService';
import { matchingService } from './services/matchingService';

// --- Types & Mock Data ---

export type Category = 'Household' | 'Maintenance' | 'Logistics' | 'Outdoor' | 'Lifestyle' | 'Staff';

const INTEREST_CATEGORY_MAP: Record<string, Category[]> = {
  "Luxury Living": ["Lifestyle", "Staff"],
  "Tech & Gadgets": ["Maintenance"],
  "Wellness & Fitness": ["Lifestyle"],
  "Sustainable Living": ["Outdoor"],
  "Family & Parenting": ["Staff", "Household"],
  "Pet Care": ["Outdoor", "Lifestyle"],
  "Home Improvement": ["Maintenance", "Household"],
  "Art & Design": ["Lifestyle"],
  "Gourmet Dining": ["Staff", "Lifestyle"]
};
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
  reliability: number; // 0-100% payment/delivery reliability
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
  reliability: number; // 0-100% payment reliability
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

const CATEGORIES: { id: Category; label: string; icon: any; color: string; subServices: string[] }[] = [
  { 
    id: 'Household', 
    label: 'Household Support', 
    icon: Home, 
    color: 'bg-blue-500', 
    subServices: ["Daily cleaning", "Laundry", "Dishwashing", "Errands", "Simple meals", "Pet feeding/walking", "House manager", "Butler", "Inventory management", "Guest reception", "Nanny/babysitter", "Elderly care", "Pet grooming/training", "Private chef", "Wardrobe management", "Interior design", "Decluttering"] 
  },
  { 
    id: 'Maintenance', 
    label: 'Maintenance & Repairs', 
    icon: Wrench, 
    color: 'bg-indigo-500', 
    subServices: ["Light bulb replacement", "Minor plumbing fixes", "Appliance troubleshooting", "Plumbing (pipes, drainage)", "Electrical (wiring, sockets)", "Carpentry", "Painting/decorating", "HVAC installation/servicing", "Smart home automation", "Advanced security systems"] 
  },
  { 
    id: 'Logistics', 
    label: 'Moving & Logistics', 
    icon: Truck, 
    color: 'bg-green-500', 
    subServices: ["Basic moving help", "Small furniture assembly", "Full moving services", "Furniture disassembly", "Driveway/patio cleaning", "Full-service relocation", "Storage solutions", "Estate-level logistics"] 
  },
  { 
    id: 'Outdoor', 
    label: 'Outdoor Care', 
    icon: Leaf, 
    color: 'bg-emerald-500', 
    subServices: ["Simple gardening", "Lawn mowing", "Landscaping", "Pool cleaning", "Pressure washing", "Estate landscaping", "Advanced irrigation systems", "Outdoor design"] 
  },
  { 
    id: 'Lifestyle', 
    label: 'Lifestyle & Comfort', 
    icon: Heart, 
    color: 'bg-rose-500', 
    subServices: ["Basic meal prep", "Laundry/ironing", "Event hosting support", "Concierge services", "Wellness staff"] 
  },
  { 
    id: 'Staff', 
    label: 'Premium Staffing', 
    icon: UserCheck, 
    color: 'bg-slate-500', 
    subServices: ["General househelp", "Butler", "Nanny", "Elderly companion", "Chauffeur", "Governess", "Estate manager"] 
  },
];

const TIER_SERVICES_MATRIX: Record<Category, Record<TierLevel, string[]>> = {
  Household: {
    Basic: ["Daily cleaning", "Laundry", "Dishwashing", "Errands", "Simple meals", "Pet feeding/walking"],
    Premium: ["House manager/butler", "Inventory management", "Guest reception", "Nanny/babysitter", "Elderly care", "Pet grooming/training"],
    Luxury: ["Private chef", "Wardrobe management", "Interior design", "Decluttering"]
  },
  Maintenance: {
    Basic: ["Light bulb replacement", "Minor plumbing fixes", "Appliance troubleshooting"],
    Premium: ["Plumbing (pipes, drainage)", "Electrical (wiring, sockets)", "Carpentry", "Painting/decorating"],
    Luxury: ["HVAC installation/servicing", "Smart home automation", "Advanced security systems"]
  },
  Logistics: {
    Basic: ["Basic moving help", "Small furniture assembly"],
    Premium: ["Full moving services (packing, transport, unpacking)", "Furniture disassembly", "Driveway/patio cleaning"],
    Luxury: ["Full-service relocation", "Storage solutions", "Estate-level logistics"]
  },
  Outdoor: {
    Basic: ["Simple gardening", "Lawn mowing"],
    Premium: ["Landscaping", "Pool cleaning", "Pressure washing"],
    Luxury: ["Estate landscaping", "Advanced irrigation systems", "Outdoor design"]
  },
  Lifestyle: {
    Basic: ["Basic meal prep", "Laundry/ironing"],
    Premium: ["Event hosting support (servers, bartenders, decorators)"],
    Luxury: ["Concierge services (travel bookings, reservations, personal shopping)", "Wellness staff (trainer, yoga, massage)"]
  },
  Staff: {
    Basic: ["General househelp/domestic worker"],
    Premium: ["Butler", "Nanny", "Elderly companion"],
    Luxury: ["Chauffeur", "Governess", "Estate manager"]
  }
};

const CATALOG_PACKAGES: { tier: TierLevel; title: string; subtitle: string; fee: number; icon: any; color: string; description: string }[] = [
  {
    tier: 'Basic',
    title: 'Essential',
    subtitle: 'Everyday Household Care',
    fee: 4.5,
    icon: Home,
    color: 'from-blue-500 to-indigo-600',
    description: "Daily cleaning, laundry, dishwashing, errands, simple meals, pet feeding, light maintenance, and minor fixes."
  },
  {
    tier: 'Premium',
    title: 'Professional',
    subtitle: 'Comprehensive Management',
    fee: 7,
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    description: "House managers, nannies, elderly care, full moving services, landscaping, and specialized technical repairs."
  },
  {
    tier: 'Luxury',
    title: 'Elite',
    subtitle: 'Estates & Lifestyle',
    fee: 9,
    icon: Gem,
    color: 'from-amber-500 to-orange-600',
    description: "Private chefs, full-service relocation, smart home automation, estate design, concierge, and wellness staff."
  }
];

const QUALIFICATION_QUESTIONS: Record<Category, string[]> = {
  Household: [
    "Do you have experience handling delicate upholstery and specialized surfaces?",
    "Are you trained in using industrial-grade cleaning chemicals safely?",
    "Can you provide a police clearance certificate (Good Conduct) if requested by the client?",
    "Are you comfortable working in environments with pets and children?",
    "Have you ever managed a household inventory or pantry system?"
  ],
  Maintenance: [
    "Are you certified by a relevant technical body (e.g., EPRA for Electrical, NCA for Plumbing)?",
    "Do you own a complete professional tool kit required for your specific trade?",
    "Are you familiar with current local building codes and safety regulations?",
    "Can you accurately read and interpret architectural or technical blueprints?",
    "Do you have established protocols for handling emergency safety hazards while on site?"
  ],
  Lifestyle: [
    "Do you have formal professional culinary, styling, or hospitality training?",
    "Are you strictly compliant with food safety protocols (HACCP) or hygiene standards?",
    "Are you experienced in coordinating high-end private events or formal guest service?",
    "Do you possess a valid driver's license with zero major traffic violations?",
    "Are you currently certified in Basic First Aid and Emergency Response?"
  ],
  Logistics: [
    "Do you have experience in professional packing and secure transit of high-value items?",
    "Are you physically capable of lifting and moving heavy household equipment safely?",
    "Do you have a valid commercial vehicle license and relevant transit permits?",
    "Are you familiar with optimized delivery routes across the Nairobi Metro area?",
    "Do you have professional insurance coverage for goods in transit?"
  ],
  Outdoor: [
    "Are you experienced in managing complex irrigation and landscaping systems?",
    "Do you have certificates for handling professional gardening equipment and machinery?",
    "Are you familiar with indigenous plant care and seasonal landscape maintenance?",
    "Do you follow safe protocols for chemical pesticide and fertilizer application?",
    "Are you capable of executing outdoor architectural tasks like gazebo or patio builds?"
  ],
  Staff: [
    "Do you have at least 5 years of experience in elite estate or commercial staffing?",
    "Are you trained in formal etiquette, protocol, and high-level client discretion?",
    "Have you previously managed a team of more than 5 domestic or professional staff?",
    "Do you have verifiable high-profile references from the last 24 months?",
    "Are you fluent in professional English and another local or international language?"
  ]
};

const MOCK_PROVIDERS: Provider[] = [
  { 
    id: '1', 
    name: 'Sarah Wangari', 
    category: 'Household', 
    subCategory: 'House cleaning',
    tier: 'Basic',
    bio: 'Professional deep cleaning specialist with 5 years experience in Nairobi West. I specialize in post-construction and move-in/out cleaning.', 
    rating: 4.8, 
    reviews: 124, 
    location: 'Westlands, Nairobi', 
    distance: '2.4 km', 
    pricePerHour: 1500, 
    image: 'https://picsum.photos/seed/sarah/600/800', 
    verified: true, 
    joined: '2021', 
    isAvailable: true,
    services: ['Deep Cleaning', 'Regular Maintenance', 'Move-out Prep'],
    reliability: 98,
    flaggedCount: 0,
    testimonials: [
      { writer: 'Alice M.', text: 'House was spotless! Very thorough.', rating: 5, date: '2024-03-12' },
      { writer: 'Kevin O.', text: 'Good work, arrived on time.', rating: 4, date: '2024-04-01' }
    ],
    reports: []
  },
  { 
    id: '2', 
    name: 'John Mutua', 
    category: 'Maintenance', 
    subCategory: 'Plumbing',
    tier: 'Premium',
    bio: 'Licensed plumber available for emergency leaks, pipe repairs, and bathroom installations. Efficient and reliable.', 
    rating: 4.9, 
    reviews: 89, 
    location: 'Kilimani, Nairobi', 
    distance: '1.8 km', 
    pricePerHour: 2200, 
    image: 'https://picsum.photos/seed/john/600/800', 
    verified: true, 
    joined: '2022', 
    isAvailable: false,
    services: ['Leak Repair', 'Pipe Installation', 'Water Heaters'],
    reliability: 95,
    flaggedCount: 1,
    testimonials: [
      { writer: 'Peter P.', text: 'Fixed the leak in minutes. Legend!', rating: 5, date: '2024-02-15' }
    ],
    reports: [
      { id: 'r1', reporterId: 'c2', reason: 'Late arrival without notice', date: '2023-11-20', status: 'reviewed' }
    ]
  },
  { 
    id: '3', 
    name: 'Faith Chebet', 
    category: 'Maintenance', 
    subCategory: 'Electrical',
    tier: 'Premium',
    bio: 'Solar installation expert and high-precision residential electrician. EPRA certified for industrial and home setups.', 
    rating: 4.7, 
    reviews: 56, 
    location: 'Lavington, Nairobi', 
    distance: '3.1 km', 
    pricePerHour: 3000, 
    image: 'https://picsum.photos/seed/faith/600/800', 
    verified: true, 
    joined: '2026', 
    isAvailable: true,
    services: ['Solar Panel Install', 'Full House Wiring', 'Fault Finding'],
    reliability: 92,
    flaggedCount: 0,
    testimonials: [],
    reports: []
  },
  { 
    id: '4', 
    name: 'Peter Kamau', 
    category: 'Maintenance', 
    subCategory: 'Painting',
    tier: 'Premium',
    bio: 'Master painter with an eye for detail. I handle both interior and exterior projects with professional-grade finishes.', 
    rating: 4.6, 
    reviews: 32, 
    location: 'Karen, Nairobi', 
    distance: '5.2 km', 
    pricePerHour: 1800, 
    image: 'https://picsum.photos/seed/peter/600/800', 
    verified: false, 
    joined: '2026', 
    isAvailable: true,
    services: ['Interior Painting', 'Exterior Wall Finishing', 'Wallpapering'],
    reliability: 88,
    flaggedCount: 3,
    testimonials: [
      { writer: 'Anonymous', text: 'Finish was okay but missed a few spots.', rating: 3, date: '2024-01-10' }
    ],
    reports: [
      { id: 'r2', reporterId: 'c3', reason: 'Unprofessional behavior', date: '2024-02-01', status: 'pending' },
      { id: 'r3', reporterId: 'c3', reason: 'Did not complete the job', date: '2024-02-05', status: 'pending' },
      { id: 'r4', reporterId: 'c2', reason: 'Requested hidden fees', date: '2024-03-01', status: 'reviewed' }
    ]
  },
  { 
    id: '5', 
    name: 'Mercy Adhiambo', 
    category: 'Lifestyle', 
    subCategory: 'Private Chef',
    tier: 'Luxury',
    bio: 'Detail-oriented chef and home organizer. I help you reclaim your space through zen systems and curated meal plans.', 
    rating: 5.0, 
    reviews: 15, 
    location: 'Parklands, Nairobi', 
    distance: '1.2 km', 
    pricePerHour: 3500, 
    image: 'https://picsum.photos/seed/mercy/600/800', 
    verified: true, 
    joined: '2024', 
    isAvailable: true,
    services: ['Meal Prep', 'Special Event Catering', 'Keto/Vegan Specialization'],
    reliability: 100,
    flaggedCount: 0,
    testimonials: [],
    reports: []
  },
  { 
    id: '6', 
    name: 'David Mwangi', 
    category: 'Maintenance', 
    subCategory: 'IT Support',
    tier: 'Luxury',
    bio: 'Residential wiring and smart home automation specialist. Troubleshooting your tech so you dont have to.', 
    rating: 4.5, 
    reviews: 42, 
    location: 'Langata, Nairobi', 
    distance: '4.8 km', 
    pricePerHour: 2500, 
    image: 'https://picsum.photos/seed/david/600/800', 
    verified: true, 
    joined: '2022', 
    isAvailable: true,
    services: ['Wi-Fi Mesh Setup', 'Smart Locks', 'Laptop Repair'],
    reliability: 91,
    flaggedCount: 0,
    testimonials: [],
    reports: []
  },
  { 
    id: '7', 
    name: 'Grace Njoroge', 
    category: 'Maintenance', 
    subCategory: 'Security Systems',
    tier: 'Luxury',
    bio: 'Professional security consultant and alarm system technician. Protecting your home with cutting edge CCTV tech.', 
    rating: 4.9, 
    reviews: 110, 
    location: 'Runda, Nairobi', 
    distance: '6.2 km', 
    pricePerHour: 3500, 
    image: 'https://picsum.photos/seed/grace/600/800', 
    verified: true, 
    joined: '2020', 
    isAvailable: true,
    services: ['CCTV Install', 'Biometric Locks', 'Security Audit'],
    reliability: 99,
    flaggedCount: 0,
    testimonials: [],
    reports: []
  },
  { 
    id: '8', 
    name: 'Samuel Otieno', 
    category: 'Outdoor', 
    subCategory: 'Landscaping',
    tier: 'Premium',
    bio: 'Expert in garden design and luxury pool maintenance. Turning your outdoor space into a sanctuary.', 
    rating: 4.7, 
    reviews: 204, 
    location: 'Embakasi, Nairobi', 
    distance: '8.5 km', 
    pricePerHour: 2000, 
    image: 'https://picsum.photos/seed/sam/600/800', 
    verified: true, 
    joined: '2019', 
    isAvailable: true,
    services: ['Lawn Care', 'Pool Chem Balancing', 'Paving'],
    reliability: 94,
    flaggedCount: 1,
    testimonials: [],
    reports: []
  },
  { 
    id: '9', 
    name: 'Anita Kerubo', 
    category: 'Logistics', 
    subCategory: 'Moving Services',
    tier: 'Luxury',
    bio: 'Friendly and careful residential moving specialist. We handle your items with love and precision.', 
    rating: 4.8, 
    reviews: 67, 
    location: 'Dagoretti, Nairobi', 
    distance: '3.5 km', 
    pricePerHour: 2800, 
    image: 'https://picsum.photos/seed/anita/600/800', 
    verified: false, 
    joined: '2023', 
    isAvailable: true,
    services: ['Packing/Unpacking', 'Furniture Assembly', 'Cross-city Moving'],
    reliability: 96,
    flaggedCount: 0,
    testimonials: [],
    reports: []
  },
];

const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Dr. Emily Otieno',
    image: 'https://picsum.photos/seed/emily/200/200',
    rating: 4.9,
    reviews: 12,
    reliability: 100,
    flaggedCount: 0,
    location: 'Lavington',
    reports: []
  },
  {
    id: 'c2',
    name: 'James Mwangi',
    image: 'https://picsum.photos/seed/james/200/200',
    rating: 4.2,
    reviews: 8,
    reliability: 84,
    flaggedCount: 2,
    location: 'Parklands',
    reports: [
      { id: 'cr1', reporterId: '1', reason: 'Payment dispute', date: '2024-03-01', status: 'reviewed' },
      { id: 'cr2', reporterId: '2', reason: 'Unreasonable demands', date: '2024-03-15', status: 'reviewed' }
    ]
  },
  {
    id: 'c3',
    name: 'Sofia Hassan',
    image: 'https://picsum.photos/seed/sofia/200/200',
    rating: 3.5,
    reviews: 15,
    reliability: 58,
    flaggedCount: 5,
    location: 'Nairobi West',
    reports: [
      { id: 'cr3', reporterId: '4', reason: 'Non-payment', date: '2024-01-20', status: 'reviewed' },
      { id: 'cr4', reporterId: '6', reason: 'Hostile communication', date: '2024-02-10', status: 'reviewed' },
      { id: 'cr5', reporterId: '8', reason: 'Late cancellation', date: '2024-02-28', status: 'reviewed' },
      { id: 'cr6', reporterId: '1', reason: 'Non-payment', date: '2024-03-10', status: 'pending' },
      { id: 'cr7', reporterId: '3', reason: 'Non-payment', date: '2024-04-01', status: 'pending' }
    ]
  }
];

// --- Main Components ---

// --- App Logic ---

function InvoiceModal({ isOpen, onClose, booking, provider }: { isOpen: boolean, onClose: () => void, booking: Booking, provider: Provider }) {
  if (!isOpen) return null;

  const feePercent = provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5;
  const platformFee = (provider.pricePerHour * feePercent) / 100;
  const grandTotal = provider.pricePerHour + platformFee;

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('SKILLGRID INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${booking.id}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Service: ${booking.category} Specialist`, 20, 50);
    
    // Provider Details
    doc.setFontSize(12);
    doc.text('Specialist Details', 20, 65);
    doc.setFontSize(10);
    doc.text(`Name: ${provider.name}`, 20, 72);
    doc.text(`Tier: ${provider.tier} Specialist`, 20, 77);
    doc.text(`Rating: ${provider.rating}/5.0`, 20, 82);
    
    // Table Header
    doc.line(20, 95, 190, 95);
    doc.setFontSize(11);
    doc.text('Description', 20, 102);
    doc.text('Amount (Ksh)', 160, 102, { align: 'right' });
    doc.line(20, 105, 190, 105);
    
    // Table Content
    doc.setFontSize(10);
    doc.text(`${booking.category} Service Execution`, 20, 115);
    doc.text(provider.pricePerHour.toLocaleString(), 160, 115, { align: 'right' });
    
    doc.text(`Platform ${provider.tier} Fee (${feePercent}%)`, 20, 125);
    doc.text(platformFee.toLocaleString(), 160, 125, { align: 'right' });
    
    // Total
    doc.line(20, 135, 190, 135);
    doc.setFontSize(13);
    doc.text('Grand Total', 20, 145);
    doc.text(`Ksh ${grandTotal.toLocaleString()}`, 160, 145, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is a computer-generated document. No signature required.', 105, 280, { align: 'center' });
    doc.text('SkillGrid Network Nairobi - Secure Professional Talent Grid', 105, 285, { align: 'center' });

    doc.save(`Invoice_${booking.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
       <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
       />
       <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-sidebar rounded-[32px] md:rounded-[40px] border border-border-slate overflow-hidden flex flex-col shadow-2xl"
       >
          <div className="p-8 md:p-10 space-y-8">
             <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">Service Invoice</h2>
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-1">ID: {booking.id}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 border border-border-slate rounded-full flex items-center justify-center text-text-light hover:text-text-main transition-colors">
                   <X size={20} />
                </button>
             </header>

             <div className="space-y-6">
                <div className="p-6 bg-primary-blue/5 border border-primary-blue/10 rounded-3xl">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <p className="text-[9px] font-black text-primary-blue uppercase tracking-widest mb-1">Service Rendered</p>
                         <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{booking.category} Expert</h3>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Specialist</p>
                         <p className="text-xs font-bold text-text-main">{provider.name}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3 pt-6 border-t border-primary-blue/10">
                      <div className="flex justify-between">
                         <span className="text-xs font-bold text-text-light uppercase tracking-wider">Base Service Fee</span>
                         <span className="text-xs font-black text-text-main">Ksh {provider.pricePerHour.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs font-bold text-text-light uppercase tracking-wider">SkillGrid {provider.tier} Fee</span>
                         <span className="text-xs font-black text-text-main">Ksh {platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 mt-3 border-t border-primary-blue/10">
                         <span className="text-sm font-black text-text-main uppercase">Total Amount</span>
                         <span className="text-lg font-black text-primary-blue">Ksh {grandTotal.toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button 
                     onClick={downloadPDF}
                     className="w-full py-5 bg-text-main text-sidebar rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                      <Upload size={16} className="rotate-180" />
                      Download Official Invoice (PDF)
                   </button>
                   <button 
                     onClick={onClose}
                     className="w-full py-4 text-text-light font-black text-[10px] uppercase tracking-[0.2em] hover:text-text-main transition-colors"
                   >
                      Close Summary
                   </button>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterTier, setFilterTier] = useState<TierLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authStep, setAuthStep] = useState<'auth' | 'onboarding'>('auth');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  
  const [viewingProfile, setViewingProfile] = useState<Provider | null>(null);
  const [referralPoints, setReferralPoints] = useState(0);
  const [isDeployed, setIsDeployed] = useState(true);
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [providerProfile, setProviderProfile] = useState<{
    tier: TierLevel;
    category: Category;
    services: string[];
  }>({
    tier: 'Basic',
    category: 'Household',
    services: []
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle role-specific tab defaults
  useEffect(() => {
    if (userRole === 'provider') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('discover');
    }
  }, [userRole]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Email verification check
        if (!firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === 'password') {
          setNeedsVerification(true);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setNeedsVerification(false);
        setIsAuthenticated(true);
        
        // Sync user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserRole(userData.role);
          setUserInterests(userData.interests || []);
          if (userData.role === 'provider') {
            setProviderProfile({
              tier: userData.tier,
              category: userData.category,
              services: userData.services || []
            });
          }
          setAuthStep('auth');
        } else {
          // If profile doesn't exist, we need to go to onboarding
          setAuthStep('onboarding');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setNeedsVerification(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setToast({ message: "Verification email dispatched! Check your secure inbox." });
      } catch (err: any) {
        setError("Rate limit exceeded. Please wait before requesting another burst.");
      }
    }
  };

  // Firebase Data Listeners
  useEffect(() => {
    if (!user) return;

    // Listen to bookings
    const bookingsQuery = userRole === 'client' 
      ? query(collection(db, 'bookings'), where('clientId', '==', user.uid))
      : query(collection(db, 'bookings'), where('providerId', '==', user.uid));

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date?.toDate() || new Date()
      })) as Booking[];
      setBookings(bookingsData);
    });

    // Listen to blocked dates
    let unsubscribeBlocks = () => {};
    if (userRole === 'provider') {
      const blocksQuery = query(collection(db, 'blockedDates'), where('providerId', '==', user.uid));
      unsubscribeBlocks = onSnapshot(blocksQuery, (snapshot) => {
        const blocks = snapshot.docs.map(doc => doc.data().date);
        setBlockedDates(blocks);
      });
    }

    return () => {
      unsubscribeBookings();
      unsubscribeBlocks();
    };
  }, [user, userRole]);

  // Sync Waitlist
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'waitlist'),
      where('clientId', '==', user.uid),
      where('status', '==', 'active')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setWaitlistEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAddToWaitlist = async (provider: Provider) => {
    if (!user) return;
    
    // Check limit: max 2 on the same tier
    const sameTierEntries = waitlistEntries.filter(e => e.tier === provider.tier);
    if (sameTierEntries.length >= 2) {
      setToast({ message: `Waitlist Limit: Maximum of 2 entries allowed for ${provider.tier} Tier specialists.` });
      return;
    }

    try {
      await addDoc(collection(db, 'waitlist'), {
        clientId: user.uid,
        providerId: provider.id,
        tier: provider.tier,
        timestamp: serverTimestamp(),
        status: 'active'
      });
      setToast({ message: `Added to ${provider.name}'s Luxury Waitlist.` });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBooking = async (b: Booking) => {
    try {
      if (!user) return;
      const bookingData = {
        ...b,
        clientId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      // Removing client-side specific Date object as Firebase needs serialized date
      const { date, ...rest } = bookingData;
      await addDoc(collection(db, 'bookings'), {
        ...rest,
        date: b.date
      });
      
      setToast({ message: `${b.category} booking confirmed successfully!`, bookingId: b.id });
      setTimeout(() => setToast(null), 6000);
    } catch (err: any) {
      console.error("Booking error:", err);
      handleFirestoreError(err, 'create', 'bookings');
    }
  };

  const handleToggleBlockedDate = async (date: string) => {
    try {
      if (!user || userRole !== 'provider') return;
      
      const dateId = `${user.uid}_${date}`;
      const docRef = doc(db, 'blockedDates', dateId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          providerId: user.uid,
          date: date,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error("Toggle block error:", err);
      handleFirestoreError(err, 'write', 'blockedDates');
    }
  };

  const handleFinalizeCatalog = async (updatedProfile: any) => {
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        isCatalogComplete: true,
        updatedAt: serverTimestamp()
      });
      setProviderProfile(updatedProfile);
      setToast({ message: "Professional catalog finalized and deployed!" });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.error("Finalize catalog error:", err);
      handleFirestoreError(err, 'update', `users/${user.uid}`);
    }
  };

  const handleNotificationAction = async (notif: any) => {
    try {
      if (notif.type === 'invoice_sent') {
        const invoiceSnap = await getDoc(doc(db, 'invoices', notif.data.invoiceId));
        if (invoiceSnap.exists()) {
          setActiveInvoice({ id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice);
        } else {
          setToast({ message: "Invoice synchronization failed. The record may have been archived." });
        }
      }
      // Mark as read
      await updateDoc(doc(db, 'notifications', notif.id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveInvoice = async (invoice: Invoice) => {
    try {
      await workflowService.approveInvoice(invoice, invoice.bookingId);
      setActiveInvoice(null);
      setIsNotificationCenterOpen(false);
      setToast({ message: "Infrastructure funds authorized. Specialist payout initiated." });
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Authorization failed: Terminal connection unstable." });
    }
  };

  const handleDisputeInvoice = async (invoice: Invoice) => {
    try {
      await workflowService.disputeInvoice(invoice.id, invoice.bookingId, user!.uid, invoice.providerId);
      setActiveInvoice(null);
      setIsNotificationCenterOpen(false);
      setToast({ message: "Dispute protocol initiated. Operational review is now active." });
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Dispute failed: Request timed out." });
    }
  };

  const handleSaveOnboarding = async (onboardingData: any) => {
    try {
      if (!user) return;
      
      setUserInterests(onboardingData.interests || []);
      
      const newProfile = {
        uid: user.uid,
        email: user.email,
        name: onboardingData.name || user.displayName || 'New User',
        role: userRole,
        ...onboardingData,
        joined: new Date().toISOString(),
        verified: false,
        rating: 5.0,
        reviews: 0,
        reliability: 100,
        flaggedCount: 0,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), {
        ...newProfile,
        isAwaitingVerification: false
      });
      setAuthStep('auth');
    } catch (err: any) {
      console.error("Onboarding error:", err);
      handleFirestoreError(err, 'update', `users/${user.uid}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center transition-colors duration-500 font-sans bg-sidebar/5 md:bg-transparent overflow-hidden">
      
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm bg-sidebar border border-accent-green/30 p-5 rounded-[28px] shadow-2xl backdrop-blur-xl flex items-center gap-4"
        >
           <div className="w-12 h-12 bg-accent-green text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent-green/20">
              <Check size={24} />
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-black text-accent-green uppercase tracking-widest mb-0.5">Booking Confirmed</p>
              <p className="text-xs font-bold text-text-main leading-tight">{toast.message}</p>
              <button 
                onClick={() => { setActiveTab('waitlist'); setToast(null); }}
                className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline mt-2 flex items-center gap-1"
              >
                Track in Waitlist <ArrowRight size={10} />
              </button>
           </div>
           <button onClick={() => setToast(null)} className="text-text-light hover:text-text-main p-1">
              <X size={16} />
           </button>
        </motion.div>
      )}

      {!isAuthenticated ? (
        needsVerification ? (
           <VerifyEmailView 
            email={user?.email || ''} 
            onResend={handleResendVerification} 
            onSignOut={() => signOut(auth)}
          />
        ) : authStep === 'auth' ? (
          <AuthView 
            onLogin={(role) => {
              setUserRole(role);
              setIsAuthenticated(true);
            }} 
            onSignup={(role) => {
              setUserRole(role);
              setAuthStep('onboarding');
            }}
            mode={authMode as any} 
            setMode={setAuthMode as any} 
          />
        ) : (
          <OnboardingView 
            onComplete={() => setIsAuthenticated(true)} 
            onSave={handleSaveOnboarding}
            role={userRole} 
            setToast={setToast}
          />
        )
      ) : (
        /* App Container */
        <div className="w-full h-full md:h-auto md:max-w-6xl md:aspect-[16/9] md:max-h-[90vh] bg-sidebar md:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] md:dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] md:rounded-[40px] md:border border-border-slate flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar Nav (Desktop/Tablet) */}
        <nav className="hidden md:flex w-20 lg:w-24 border-r border-border-slate flex-col items-center py-10 gap-8 shrink-0 bg-sidebar/50 backdrop-blur-md">
          <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 cursor-pointer hover:scale-110 transition-transform">
            <Sparkles size={24} className="text-white" />
          </div>
          
          <div className="flex flex-col gap-4">
            {userRole === 'client' ? (
              <>
                <NavIcon active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} icon={Search} label="Discover" />
                <NavIcon active={activeTab === 'services'} onClick={() => { setActiveTab('services'); setSelectedCategory(null); }} icon={Briefcase} label="Services" />
                <NavIcon active={activeTab === 'waitlist'} onClick={() => setActiveTab('waitlist')} icon={History} label="Waitlist" />
                <NavIcon active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquare} label="Chat" />
                <NavIcon active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
              </>
            ) : (
              <>
                <NavIcon active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
                <NavIcon active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} icon={BookOpen} label="Catalogue" />
                <NavIcon active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={Calendar} label="Jobs" />
                <NavIcon active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={Wallet} label="Wallet" />
                <NavIcon active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
              </>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center">
            {/* Role Toggle */}
            <button 
              onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
              title={`Switch to ${userRole === 'client' ? 'Provider' : 'Client'} Mode`}
              className="w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all overflow-hidden"
            >
              {userRole === 'client' ? <Briefcase size={20} /> : <Users size={20} />}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <NotificationBell 
               count={notifications.filter(n => !n.read).length} 
               onClick={() => setIsNotificationCenterOpen(true)} 
            />

            {activeTab === 'services' ? (
              <TierSelector current={filterTier} onChange={setFilterTier} isSidebar />
            ) : (activeTab === 'discover' || activeTab === 'jobs') && (
              <SortSelector current={sortBy} onChange={setSortBy} />
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-card-bg/50 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border-slate bg-sidebar/80 backdrop-blur-md z-30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-sm font-black text-text-main uppercase tracking-tighter italic">SkillGrid</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
                className="w-10 h-10 rounded-full border border-border-slate flex items-center justify-center text-text-light active:bg-primary-blue/10"
              >
                {userRole === 'client' ? <Briefcase size={16} /> : <Users size={16} />}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full border border-border-slate flex items-center justify-center text-text-light active:bg-primary-blue/10"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button 
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative w-10 h-10 rounded-full border border-border-slate flex items-center justify-center text-text-light active:bg-primary-blue/10"
              >
                <Bell size={16} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-primary-blue rounded-full border-2 border-sidebar" />
                )}
              </button>

              {activeTab === 'services' ? (
                <TierSelector current={filterTier} onChange={setFilterTier} isMobile isSidebar />
              ) : (activeTab === 'discover' || activeTab === 'jobs') && (
                <SortSelector current={sortBy} onChange={setSortBy} isMobile />
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
            {/* Client Views */}
            {userRole === 'client' && activeTab === 'discover' && (
              <DiscoverView 
                sortBy={sortBy}
                onAddBooking={handleAddBooking} 
                onViewProfile={setViewingProfile}
                setActiveTab={setActiveTab}
                onWaitlist={handleAddToWaitlist}
                userInterests={userInterests}
                selectedCategory={selectedCategory}
              />
            )}
            {userRole === 'client' && activeTab === 'services' && (
              <ServicesView 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
                filterTier={filterTier}
                setFilterTier={setFilterTier}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddBooking={handleAddBooking}
                onViewProfile={setViewingProfile}
                setActiveTab={setActiveTab}
                userInterests={userInterests}
              />
            )}
            {userRole === 'client' && activeTab === 'waitlist' && (
              <WaitlistView bookings={bookings} waitlistEntries={waitlistEntries} />
            )}
            
            {/* Provider Views */}
            {userRole === 'provider' && activeTab === 'dashboard' && (
              <ProviderDashboardView 
                onProfileClick={() => setActiveTab('profile')} 
                isDeployed={isDeployed}
                toggleDeployment={() => setIsDeployed(!isDeployed)}
                bookings={bookings}
                blockedDates={blockedDates}
                toggleBlockDate={handleToggleBlockedDate}
                profile={providerProfile}
              />
            )}
            {userRole === 'provider' && activeTab === 'catalog' && (
              <ProviderCatalogView 
                profile={providerProfile} 
                setProfile={setProviderProfile} 
                onFinalize={handleFinalizeCatalog}
                setToast={setToast}
              />
            )}
            {userRole === 'provider' && activeTab === 'jobs' && <JobsManagementView bookings={bookings} setToast={setToast} />}
            {userRole === 'provider' && activeTab === 'wallet' && <WalletView />}

            {/* Shared Views */}
            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'profile' && (
              <ProfileView 
                role={userRole} 
                bookings={bookings} 
                referralPoints={referralPoints} 
                onSignOut={handleLogout}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewingProfile && (
              <ProviderProfileDetail 
                provider={viewingProfile} 
                onClose={() => setViewingProfile(null)}
                onBook={() => {}}
                onAddBooking={handleAddBooking}
                onRecommend={() => setReferralPoints(prev => prev + 50)}
                setActiveTab={setActiveTab}
              />
            )}
          </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden flex items-center justify-around p-3 border-t border-border-slate bg-sidebar/80 backdrop-blur-md z-30 shrink-0">
            {userRole === 'client' ? (
              <>
                <MobileNavItem active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} icon={Search} label="Discover" />
                <MobileNavItem active={activeTab === 'services'} onClick={() => { setActiveTab('services'); setSelectedCategory(null); }} icon={Briefcase} label="Services" />
                <MobileNavItem active={activeTab === 'waitlist'} onClick={() => setActiveTab('waitlist')} icon={History} label="Waitlist" />
                <MobileNavItem active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquare} label="Chat" />
                <MobileNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
              </>
            ) : (
              <>
                <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
                <MobileNavItem active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} icon={BookOpen} label="Catalogue" />
                <MobileNavItem active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={Calendar} label="Jobs" />
                <MobileNavItem active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={Wallet} label="Wallet" />
                <MobileNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
              </>
            )}
          </nav>

          <NotificationCenter 
             isOpen={isNotificationCenterOpen}
             onClose={() => setIsNotificationCenterOpen(false)}
             notifications={notifications}
             onAction={handleNotificationAction}
          />

          <InvoiceApprovalModal 
             isOpen={!!activeInvoice}
             onClose={() => setActiveInvoice(null)}
             invoice={activeInvoice!}
             onApprove={handleApproveInvoice}
             onDispute={handleDisputeInvoice}
          />
        </main>
      </div>
     )}
    </div>
  );
}

// --- Auth Components ---

function AuthView({ onLogin, onSignup, mode, setMode }: { onLogin: (role: UserRole) => void, onSignup: (role: UserRole) => void, mode: 'login' | 'signup' | 'reset', setMode: (m: 'login' | 'signup' | 'reset') => void }) {
  const [showTerms, setShowTerms] = useState(false);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);

  const handleSubmit = async () => {
    setAuthError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError("Email address is required.");
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        onLogin(isSpecialist ? 'provider' : 'client');
      } else if (mode === 'signup') {
        if (!agreedToTerms) {
          setAuthError("You must agree to the protocols.");
          setLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await sendEmailVerification(result.user);
        
        // Create initial profile
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: isSpecialist ? 'provider' : 'client',
          createdAt: serverTimestamp(),
          isAwaitingVerification: true
        });

        onSignup(isSpecialist ? 'provider' : 'client');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setIsResetSent(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setAuthError("Identity not found in matrix.");
      else if (err.code === 'auth/wrong-password') setAuthError("Invalid access key encryption.");
      else if (err.code === 'auth/email-already-in-use') setAuthError("Channel already occupied by another entity.");
      else if (err.code === 'auth/weak-password') setAuthError("Encryption key is too weak (min 6 chars).");
      else if (err.code === 'auth/invalid-email') setAuthError("Invalid email address format.");
      else setAuthError("Connection synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'reset') {
    return (
      <div className="w-full h-full md:h-auto md:max-w-md p-6 md:p-10 bg-sidebar md:shadow-2xl md:rounded-[40px] md:border border-border-slate overflow-y-auto md:overflow-hidden relative group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/5 rounded-full blur-3xl group-hover:bg-primary-blue/10 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-primary-blue rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <RefreshCcw size={40} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase italic leading-none">
              Reset <span className="text-primary-blue">Matrix</span>
            </h1>
            <p className="text-[10px] text-text-light font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Identity Recovery Protocol</p>
          </div>

          {isResetSent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="p-6 bg-accent-green/10 border border-accent-green/20 rounded-3xl">
                <p className="text-xs font-bold text-accent-green uppercase leading-relaxed">
                  Recovery link dispatched to your secure terminal. Check your inbox to initiate OTP sequence.
                </p>
              </div>
              <button 
                onClick={() => { setMode('login'); setIsResetSent(false); }}
                className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-widest"
              >
                Return to Access Portal
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                    <User size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Recovery Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
                />
              </div>
              <button 
                disabled={loading || !email}
                onClick={handleSubmit}
                className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : "Send Recovery Protocol"}
              </button>
              <button 
                onClick={() => setMode('login')}
                className="w-full text-center text-[10px] font-black text-text-light/40 uppercase tracking-widest hover:text-text-main transition-colors"
              >
                I remember my identity keys
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full md:h-auto md:max-w-md bg-sidebar md:shadow-2xl md:rounded-[40px] md:border border-border-slate overflow-y-auto relative group flex flex-col">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/5 rounded-full blur-3xl group-hover:bg-primary-blue/10 transition-colors duration-700" />
      
      <div className="p-6 md:p-10 flex-1 flex flex-col">
        <div className="relative z-10 flex-1">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-primary-blue rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Sparkles size={40} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase italic leading-none">
              SkillGrid <span className="text-primary-blue">Elite</span>
            </h1>
            <p className="text-[10px] text-text-light font-bold uppercase tracking-[0.4em] mt-3 opacity-60">High-Precision Service Marketplace</p>
          </div>

          <div className="flex gap-2 p-1.5 bg-sidebar/50 rounded-2xl border border-border-slate mb-8">
            <button 
              onClick={() => { setMode('login'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
            >
              Access Portal
            </button>
            <button 
              onClick={() => { setMode('signup'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
            >
              Create Identity
            </button>
          </div>

          <div className="space-y-4">
            {authError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-[10px] font-bold text-red-500 uppercase text-center">{authError}</p>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                  <User size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                  <ShieldCheck size={18} />
              </div>
              <input 
                type="password" 
                placeholder="Password Key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
              />
            </div>

            <div className="flex justify-end px-2">
              <button 
                onClick={() => setMode('reset')}
                className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline"
              >
                  Forgot identity keys?
              </button>
            </div>

            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <button 
                  onClick={() => setIsSpecialist(!isSpecialist)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all ${isSpecialist ? 'border-primary-blue/30 bg-primary-blue/5' : 'border-border-slate bg-transparent'}`}
                >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSpecialist ? 'bg-primary-blue text-white' : 'bg-sidebar border border-border-slate text-text-light'}`}>
                          <Briefcase size={16} />
                      </div>
                      <div className="text-left">
                          <p className="text-[10px] font-black text-text-main uppercase">I'm a Specialist</p>
                          <p className="text-[8px] font-bold text-text-light uppercase tracking-widest">Apply to join Elite Circle</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSpecialist ? 'border-primary-blue bg-primary-blue' : 'border-border-slate'}`}>
                      {isSpecialist && <Check size={12} className="text-white" />}
                    </div>
                </button>
              </motion.div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="flex items-start gap-4 mt-6 px-2">
              <button 
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${agreedToTerms ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-blue-500/20' : 'border-border-slate bg-sidebar/30 hover:border-text-light/20'}`}
              >
                  {agreedToTerms && <Check size={12} strokeWidth={4} />}
              </button>
              <p className="text-[9px] text-text-light font-black leading-snug uppercase tracking-widest opacity-50 select-none cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                I confirm that I have reviewed the <span className="text-primary-blue hover:underline">Platform Integrity Protocols</span> and agree to the cryptographic data matrix.
              </p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <button 
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : "Establish Secure Session"}
            </button>
            
            <div className="flex items-center gap-4 py-2">
               <div className="flex-1 h-px bg-border-slate/20" />
               <span className="text-[8px] font-black text-text-light/30 uppercase tracking-widest whitespace-nowrap">Or sync via</span>
               <div className="flex-1 h-px bg-border-slate/20" />
            </div>

            <button 
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setAuthError(null);
                try {
                  const user = await signInWithGoogle();
                  const userRef = doc(db, 'users', user.uid);
                  const snap = await getDoc(userRef);
                  let finalRole: UserRole = isSpecialist ? 'provider' : 'client';
                  
                  if (!snap.exists()) {
                    await setDoc(userRef, {
                      uid: user.uid,
                      email: user.email,
                      role: finalRole,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp()
                    });
                  } else {
                    finalRole = snap.data().role;
                  }
                  
                  // Check if email is verified (Google usually is, but let's be safe)
                  if (!user.emailVerified) {
                    setAuthError("Identity verification pending. Please verify your Google email.");
                    setLoading(false);
                    return;
                  }

                  onLogin(finalRole);
                } catch (err: any) {
                  console.error(err);
                  setAuthError("Google synchronization aborted.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-5 bg-white text-sidebar rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                  <RefreshCcw className="animate-spin" size={20} />
              ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5" alt="Google" />
                    <span>Sync Identity Matrix</span>
                  </>
              )}
            </button>
          </div>
          
          <div className="mt-8 text-center">
             <button 
              onClick={() => setShowTerms(true)}
              className="text-[9px] font-black text-text-light/40 uppercase tracking-[0.3em] hover:text-text-light transition-colors"
             >
                Review Platform Protocols & Privacy Policy
             </button>
          </div>
        </div>
      </div>

      {/* Landing Page Expansion - Mission & Purpose Section */}
      <div className="bg-sidebar mt-12 border-t border-border-slate p-8 md:p-16 lg:p-24 space-y-20 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-purple/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-1 bg-primary-blue rounded-full"></div>
                  <h4 className="text-xs font-black text-primary-blue uppercase tracking-[0.5em]">The SkillGrid Thesis</h4>
               </div>
               <h3 className="text-4xl md:text-6xl font-black text-text-main uppercase tracking-tighter italic leading-[0.85]">
                  High-Precision <br/>
                  <span className="text-primary-blue">Deployment</span> for <br/>
                  Elite Operators.
               </h3>
               <p className="text-sm text-text-light font-medium leading-relaxed max-w-lg opacity-80">
                  SkillGrid Elite was architected for the high-performing professional who values temporal efficiency and operational precision above all else. We've eliminated the bureaucratic friction of traditional gig platforms to create a direct synchronization layer between world-class specialists and Tier-1 clients.
               </p>
               <div className="pt-4 flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-sidebar/50 border border-border-slate rounded-2xl flex items-center gap-3">
                     <ShieldCheck size={18} className="text-accent-green" />
                     <span className="text-[10px] font-black text-text-main uppercase tracking-widest">RSA Governance</span>
                  </div>
                  <div className="px-6 py-3 bg-sidebar/50 border border-border-slate rounded-2xl flex items-center gap-3">
                     <Zap size={18} className="text-amber-500" />
                     <span className="text-[10px] font-black text-text-main uppercase tracking-widest">Instant Sync</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
               {[
                 { title: 'Neural Matching', sub: 'Adaptive AI protocols for optimal talent-to-node deployment.', icon: Activity },
                 { title: 'Escrow Sovereignty', sub: 'Triple-layer milestone security with decentralized dispute logic.', icon: Wallet },
                 { title: 'Identity Integrity', sub: 'Biometric and professional verification at a global standard.', icon: UserCheck },
                 { title: 'Temporal Audit', sub: 'Real-time telemetry of service sessions with fractional billing.', icon: Clock }
               ].map((feature, i) => (
                  <div key={i} className="p-8 bg-sidebar/40 border border-border-slate rounded-[32px] hover:border-primary-blue/30 transition-all group">
                     <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue mb-6 group-hover:bg-primary-blue group-hover:text-white transition-all">
                        <feature.icon size={24} />
                     </div>
                     <h5 className="text-base font-black text-text-main uppercase tracking-tight mb-2">{feature.title}</h5>
                     <p className="text-xs text-text-light font-medium leading-relaxed">{feature.sub}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="max-w-4xl mx-auto pt-20 border-t border-border-slate/50">
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.6em] mb-10 text-center">Global Presence Matrix</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 grayscale opacity-40">
               {['Nairobi', 'Lagos', 'Cape Town', 'Accra'].map(city => (
                  <div key={city} className="text-center group hover:opacity-100 transition-opacity cursor-default">
                     <p className="text-2xl font-black text-text-main uppercase tracking-tighter mb-1">{city}</p>
                     <p className="text-[8px] font-black text-primary-blue uppercase tracking-widest">{city === 'Nairobi' ? 'Active Hub' : 'Nodes Active'}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="pt-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-border-slate/10 opacity-30">
            <div className="flex items-center gap-4">
               <p className="text-[8px] font-black uppercase tracking-widest">SkillGrid v4.4.2</p>
               <div className="w-1 h-1 rounded-full bg-text-light"></div>
               <p className="text-[8px] font-black uppercase tracking-widest">Distributed Ledger Active</p>
            </div>
            <div className="flex gap-8">
               <span className="text-[8px] font-black uppercase tracking-widest">Whitepaper</span>
               <span className="text-[8px] font-black uppercase tracking-widest">API Docs</span>
               <span className="text-[8px] font-black uppercase tracking-widest">Node Status</span>
            </div>
         </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

function VerifyEmailView({ email, onResend, onSignOut }: { email: string, onResend: () => void, onSignOut: () => void }) {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setResending(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="w-full max-w-md p-10 bg-sidebar shadow-2xl rounded-[40px] border border-border-slate text-center"
    >
       <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto text-primary-blue mb-8 animate-pulse">
          <Send size={40} />
       </div>
       <h2 className="text-3xl font-black text-text-main uppercase tracking-tight mb-4 leading-none">Awaiting Clearance</h2>
       <p className="text-xs text-text-light font-medium leading-relaxed mb-10">
          We've dispatched a cryptographic validation link to <span className="text-primary-blue font-bold">{email}</span>. 
          Please confirm your identity to establish a secure session.
       </p>
       
       <div className="space-y-4">
          <button 
            disabled={resending}
            onClick={handleResend}
            className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {resending ? <RefreshCcw className="animate-spin" size={20} /> : "Discharge New Link"}
          </button>
          
          <button 
            onClick={onSignOut}
            className="w-full py-5 bg-sidebar/40 text-text-light border border-border-slate rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:text-text-main transition-all"
          >
            Abort Protocol
          </button>
       </div>

       <p className="mt-10 text-[9px] font-black text-text-light/30 uppercase tracking-[0.3em]">SkillGrid Security Matrix</p>
    </motion.div>
  );
}

function TermsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-sidebar/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-sidebar border border-border-slate rounded-[40px] shadow-3xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <header className="p-8 border-b border-border-slate flex items-center justify-between bg-sidebar/50">
               <div>
                  <h3 className="text-xl font-black text-text-main uppercase italic">Platform Protocols</h3>
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">Version 2.4.1 (April 2026)</p>
               </div>
               <button onClick={onClose} className="w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main transition-all">
                  <X size={20} />
               </button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
               <section>
                  <h4 className="text-xs font-black text-primary-blue uppercase tracking-widest mb-4">01. Service Integrity</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40">Verification Standards</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       SkillGrid Elite operates as a precision marketplace. Every specialist undergoes multi‑layered identity and credential verification before being admitted.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">User Obligations</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       You must provide accurate, complete, and non‑misleading information during onboarding and identity establishment.
                    </p>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-widest mt-4">Zero Tolerance Policy</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       Fake profiles, identity spoofing, or falsified credentials trigger immediate and irreversible sanctions, including permanent hardware‑level bans across all access points.
                    </p>
                  </div>
               </section>

               <section>
                  <h4 className="text-xs font-black text-primary-blue uppercase tracking-widest mb-4">02. Escrow & Fiscal Policy</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40">Secure Escrow Module</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       All payments are locked in a cryptographic escrow vault until both client and specialist confirm successful service delivery.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Arbitration Oversight</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       In case of disputes, resolution is handled exclusively by the SkillGrid Arbitration Center, whose rulings are binding.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Fee Structure</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       Platform fees are deducted at the point of service initiation and are strictly non‑refundable once execution has commenced, regardless of outcome.
                    </p>
                  </div>
               </section>

               <section>
                  <h4 className="text-xs font-black text-primary-blue uppercase tracking-widest mb-4">03. Privacy Matrix</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40">Data Collection</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       For enhanced security, SkillGrid collects biometrics (Smile ID Level 2), geolocation data, and encrypted communication logs.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Purpose Limitation</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       This information is used solely for identity assurance, fraud prevention, and dispute resolution.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Data Ownership</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       Your personal data remains your property. It is never sold, traded, or shared with third‑party data harvesters.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Encryption Protocols</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       All sensitive information is shielded by AES‑256 encryption, ensuring maximum confidentiality and resilience against breaches.
                    </p>
                  </div>
               </section>

               <section>
                  <h4 className="text-xs font-black text-primary-blue uppercase tracking-widest mb-4">04. Dispute Resolution</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40">Escalation Path</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       Any friction or disagreement during service delivery must be escalated via the Dispute Appeal Center accessible in your profile dashboard.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Elite Guarantee</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       Clients are protected against no‑shows, while specialists are safeguarded against non‑payment.
                    </p>
                    <p className="text-xs text-text-main font-bold uppercase tracking-widest opacity-40 mt-4">Balanced Protection</p>
                    <p className="text-xs text-text-main/80 leading-relaxed font-medium">
                       The resolution framework ensures fairness, transparency, and enforceable remedies for both parties.
                    </p>
                  </div>
               </section>
            </div>

            <div className="p-8 border-t border-border-slate bg-sidebar/30">
               <button onClick={onClose} className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/10 active:scale-95 transition-transform">
                  Acknowledged & Accepted
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function OnboardingView({ onComplete, onSave, role, setToast }: { 
  onComplete: () => void, 
  onSave: (data: any) => void, 
  role: UserRole,
  setToast: (t: { message: string }) => void 
}) {
  const [step, setStep] = useState(0);
  const totalSteps = role === 'provider' ? 4 : 4; // Intro + 3 steps

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    address: '',
    gender: 'Male',
    bio: '',
    image: '',
    interests: [] as string[],
    locationCoords: null as { latitude: number, longitude: number } | null
  });

  const interestOptions = [
    "Luxury Living", "Tech & Gadgets", "Wellness & Fitness", 
    "Sustainable Living", "Family & Parenting", "Pet Care", 
    "Home Improvement", "Art & Design", "Gourmet Dining"
  ];

  // Specialist specific state
  const [specialistData, setSpecialistData] = useState({
    category: 'Household' as Category,
    tier: 'Basic' as TierLevel,
    yearsOfExperience: '3-5',
    portfolioUrl: '',
    answers: {} as Record<string, boolean>,
    services: [] as string[]
  });

  const yearsOptions = ['< 1 Year', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];

  return (
    <div className="w-full h-full md:h-auto max-w-2xl bg-sidebar md:shadow-2xl md:rounded-[40px] border border-border-slate flex flex-col overflow-hidden relative group">
      <div className="relative z-10 flex flex-col h-full">
        <header className="p-8 md:p-12 pb-4 md:pb-6 shrink-0 border-b md:border-none border-border-slate/10 bg-sidebar/50 backdrop-blur-md">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-black text-text-main uppercase italic tracking-tight">
                {step === 0 ? 'Protocol Start' : (role === 'provider' ? 'Specialist Induction' : 'Establish Identity')}
              </h2>
              <div className="flex gap-1">
                 {[...Array(totalSteps)].map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary-blue' : 'w-4 bg-border-slate'}`} />
                 ))}
              </div>
           </div>
           <p className="text-[10px] text-text-light font-bold uppercase tracking-widest opacity-60">
             {step === 0 ? 'Initialization Phase' : `Step ${step}: ${
               role === 'provider' 
                 ? (step === 1 ? 'Core Profile' : step === 2 ? 'Qualification Assessment' : 'Professional Credentials')
                 : (step === 1 ? 'Personal Bio-Data' : step === 2 ? 'Communication & Location' : 'Security Clearance')
             }`}
           </p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-4 md:pt-6">
          <AnimatePresence mode="wait">
          {/* Step 0: Welcome / Intro */}
          {step === 0 && (
            <motion.div 
              key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="text-center py-10 space-y-8"
            >
               <div className="w-24 h-24 bg-primary-blue/10 rounded-[32px] flex items-center justify-center mx-auto text-primary-blue animate-pulse">
                  <Shield size={48} />
               </div>
               <div className="space-y-3">
                  <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Establishing Command</h3>
                  <p className="text-xs text-text-light font-medium leading-relaxed max-w-sm mx-auto">
                    Welcome to the Elite Circle. You are about to initiate your identity profile on the SkillGrid encrypted matrix.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-6">
                  <div className="p-4 bg-sidebar/30 border border-border-slate rounded-2xl">
                     <Lock size={20} className="text-primary-blue mb-3 mx-auto" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-main">Encrypted</p>
                  </div>
                  <div className="p-4 bg-sidebar/30 border border-border-slate rounded-2xl">
                     <CheckCircle2 size={20} className="text-accent-green mb-3 mx-auto" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-main">Verified</p>
                  </div>
               </div>
               <button 
                 onClick={() => setStep(1)}
                 className="mt-8 px-12 py-5 bg-primary-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
               >
                 Initiate Setup
               </button>
            </motion.div>
          )}

          {/* Step 1: Core Profile / Bio-Data (Combined for Specialists) */}
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <div className="w-24 h-24 rounded-full bg-sidebar border-2 border-dashed border-border-slate flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-blue">
                       {formData.image ? (
                         <img src={formData.image} className="w-full h-full object-cover" />
                       ) : (
                         <Camera size={32} className="text-text-light group-hover:text-primary-blue" />
                       )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white border-4 border-sidebar shadow-lg">
                       <Upload size={14} />
                    </div>
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mt-4">Capture High-Res Portrait</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-text-light uppercase ml-2">Full Identity Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-text-light uppercase ml-2">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none" 
                    />
                  </div>
               </div>

               {role === 'provider' && (
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-text-light uppercase ml-2">Secure Contact & Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input 
                         type="tel" 
                         placeholder="+254 700 000000" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none" 
                       />
                       <input 
                         type="text" 
                         placeholder="Nairobi West, Area..." 
                         value={formData.address}
                         onChange={(e) => setFormData({...formData, address: e.target.value})}
                         className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none" 
                       />
                    </div>
                 </div>
               )}

               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-text-light uppercase ml-2">Gender Identification</label>
                  <div className="flex gap-2">
                     {['Male', 'Female', 'Non-Binary'].map(g => (
                       <button 
                         key={g} 
                         onClick={() => setFormData({...formData, gender: g})}
                         className={`flex-1 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-primary-blue text-white border-primary-blue' : 'border-border-slate text-text-light hover:border-primary-blue'}`}
                       >
                         {g}
                       </button>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {/* Step 2: Qualification Assessment (Specialist) / Communication (Client) */}
          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               {role === 'provider' ? (
                 <div className="space-y-8">
                   {/* ... provider logic ... */}
                   {/* Category & Tier Selection */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-text-light uppercase ml-2">Primary Domain</label>
                         <select 
                            value={specialistData.category}
                            onChange={(e) => setSpecialistData({...specialistData, category: e.target.value as Category, services: []})}
                            className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none appearance-none font-bold"
                         >
                            {CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-text-light uppercase ml-2">Elite Tiering</label>
                         <div className="flex gap-2">
                            {(['Basic', 'Premium', 'Luxury'] as TierLevel[]).map(t => (
                              <button 
                                 key={t}
                                 onClick={() => setSpecialistData({...specialistData, tier: t})}
                                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                   specialistData.tier === t ? 'bg-primary-blue text-white border-primary-blue shadow-lg' : 'border-border-slate text-text-light hover:border-text-main'
                                 }`}
                              >
                                 {t}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Dynamic Services based on Category/Tier */}
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-text-light uppercase ml-2">Specialized Services (Tier: {specialistData.tier})</label>
                      <div className="grid grid-cols-2 gap-2">
                         {TIER_SERVICES_MATRIX[specialistData.category][specialistData.tier].map(service => (
                           <button 
                              key={service}
                              onClick={() => {
                                 const exists = specialistData.services.includes(service);
                                 setSpecialistData({
                                    ...specialistData,
                                    services: exists ? specialistData.services.filter(s => s !== service) : [...specialistData.services, service]
                                 });
                              }}
                              className={`p-3 rounded-xl border text-[9px] font-bold text-left transition-all ${
                                specialistData.services.includes(service) ? 'bg-primary-blue/10 border-primary-blue text-primary-blue' : 'border-border-slate text-text-light hover:border-text-main'
                              }`}
                           >
                              {service}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Qualification Questions */}
                   <div className="space-y-4">
                      <label className="text-[9px] font-black text-text-light uppercase ml-2">Integrity & Skill Assessment</label>
                      <div className="space-y-3">
                         {QUALIFICATION_QUESTIONS[specialistData.category].map((q, idx) => (
                           <div key={idx} className="flex items-start gap-4 p-4 bg-sidebar/50 border border-border-slate rounded-2xl">
                              <button 
                                onClick={() => setSpecialistData({
                                   ...specialistData,
                                   answers: { ...specialistData.answers, [idx]: !specialistData.answers[idx] }
                                })}
                                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${specialistData.answers[idx] ? 'bg-primary-blue border-primary-blue text-white' : 'border-border-slate bg-sidebar/30'}`}
                              >
                                 {specialistData.answers[idx] && <Check size={12} strokeWidth={4} />}
                              </button>
                              <p className="text-[10px] font-medium text-text-main leading-relaxed">{q}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2">Secure Contact & Address</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            type="tel" 
                            placeholder="+254 700 000000" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none font-bold" 
                          />
                          <input 
                            type="text" 
                            placeholder="Apartment, Street, Area, City" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none font-bold" 
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2">Identify Your Interests</label>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {interestOptions.map(interest => (
                            <button 
                              key={interest}
                              type="button"
                              onClick={() => {
                                const active = formData.interests.includes(interest);
                                setFormData({
                                  ...formData,
                                  interests: active ? formData.interests.filter(i => i !== interest) : [...formData.interests, interest]
                                });
                              }}
                              className={`p-4 rounded-3xl border text-[9px] font-black uppercase tracking-widest transition-all text-center ${formData.interests.includes(interest) ? 'bg-primary-blue text-white border-primary-blue shadow-lg' : 'border-border-slate text-text-light hover:border-text-main'}`}
                            >
                               {interest}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2">Location Intelligence</label>
                       <button 
                         type="button"
                         onClick={() => {
                           if (navigator.geolocation) {
                             navigator.geolocation.getCurrentPosition((pos) => {
                               setFormData({
                                 ...formData,
                                 locationCoords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
                                 address: `Geo-Locked Address`
                               });
                             }, (err) => {
                               setToast({ message: "Coordinate extraction failed: Location access denied or unavailable." });
                             });
                           }
                         }}
                         className="w-full p-6 bg-sidebar/30 border border-border-slate rounded-3xl flex items-center justify-between group hover:border-primary-blue transition-all font-bold shadow-sm"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                                <MapPin size={20} />
                             </div>
                             <div className="text-left">
                                <p className="text-[10px] font-black text-text-main uppercase">Detect Precise Location</p>
                                <p className="text-[9px] text-text-light font-bold">Used for optimized specialist routing</p>
                             </div>
                          </div>
                          {formData.locationCoords && <CheckCircle2 size={24} className="text-emerald-500" />}
                       </button>
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {/* Step 3: Professional Credentials (Specialist) / Verification (Client) */}
          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               {role === 'provider' ? (
                 <div className="space-y-6">
                    {/* Granular Experience */}
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2 flex items-center gap-2">
                          <Briefcase size={12} className="text-primary-blue" /> Specialist Longevity
                       </label>
                       <div className="flex flex-wrap gap-2">
                          {yearsOptions.map(opt => (
                            <button 
                              key={opt}
                              onClick={() => setSpecialistData({...specialistData, yearsOfExperience: opt})}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                specialistData.yearsOfExperience === opt ? 'bg-primary-blue text-white border-primary-blue' : 'border-border-slate text-text-light hover:border-text-main'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Portfolio & Digital Footprint */}
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2 flex items-center gap-2">
                          <Globe size={12} className="text-primary-blue" /> Professional Portfolio
                       </label>
                       <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                             <LinkIcon size={14} />
                          </div>
                          <input 
                            type="url" 
                            placeholder="https://portfolio.com/your-username" 
                            value={specialistData.portfolioUrl}
                            onChange={(e) => setSpecialistData({...specialistData, portfolioUrl: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none" 
                          />
                       </div>
                    </div>

                    {/* Certifications & ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-text-light uppercase ml-2 flex items-center gap-2">
                             <Award size={12} className="text-primary-blue" /> Certifications
                          </label>
                          <div className="w-full p-6 border-2 border-dashed border-border-slate rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-primary-blue transition-all cursor-pointer bg-sidebar/20">
                             <FileCheck size={24} className="text-text-light group-hover:text-primary-blue" />
                             <p className="text-[8px] font-black text-text-light uppercase tracking-widest text-center">Attach Licenses / Training Certificates</p>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-text-light uppercase ml-2 flex items-center gap-2">
                             <ShieldCheck size={12} className="text-primary-blue" /> Identity Matrix
                          </label>
                          <div className="w-full p-6 border-2 border-dashed border-border-slate rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-primary-blue transition-all cursor-pointer bg-sidebar/20">
                             <FileText size={24} className="text-text-light group-hover:text-primary-blue" />
                             <p className="text-[8px] font-black text-text-light uppercase tracking-widest text-center">Upload National ID / Passport</p>
                          </div>
                       </div>
                    </div>

                    {/* Professional Brief */}
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2">Executive Summary (Curated Bio)</label>
                       <textarea 
                         rows={3} 
                         placeholder="Detail your methodology, high-end tools, and previous elite project highlights..." 
                         value={formData.bio}
                         onChange={(e) => setFormData({...formData, bio: e.target.value})}
                         className="w-full px-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-xs focus:border-primary-blue outline-none resize-none font-medium" 
                       />
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-3">
                       <Shield size={16} className="text-amber-500 shrink-0 mt-0.5" />
                       <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">Cryptographic validation and manual audit will occur. Falsified data triggers total platform exclusion.</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-text-light uppercase ml-2">Identity Verification Opt-In</label>
                       <div className="w-full p-10 border-2 border-dashed border-border-slate rounded-[32px] flex flex-col items-center justify-center gap-3 group hover:border-primary-blue transition-all cursor-pointer bg-sidebar/20">
                          <div className="w-16 h-16 bg-sidebar border border-border-slate rounded-3xl flex items-center justify-center text-text-light group-hover:bg-primary-blue/10 group-hover:text-primary-blue transition-all">
                             <ShieldCheck size={32} />
                          </div>
                          <div className="text-center">
                             <p className="text-xs font-black text-text-main uppercase tracking-widest">Perform Secure Audit</p>
                             <p className="text-[9px] font-bold text-text-light uppercase tracking-tighter mt-1 opacity-60">Smile ID Level 2 Integration</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-5 bg-card-bg border border-border-slate rounded-2xl">
                       <div className="flex items-center gap-3 mb-3">
                          <Sparkles size={16} className="text-primary-blue" />
                          <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Why Verify?</h4>
                       </div>
                       <ul className="space-y-2">
                          {[
                             'Access to Elite-tier specialists',
                             'Priority booking in high-demand windows',
                             'Zero deposit requirement on major repairs',
                             'Verified Client badge for better provider responses'
                          ].map(trait => (
                            <li key={trait} className="flex items-center gap-2 text-[9px] font-bold text-text-light uppercase tracking-tighter">
                               <Check size={10} className="text-primary-blue shrink-0" />
                               {trait}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               )}
            </motion.div>
          )}
          </AnimatePresence>

          {step > 0 && (
            <div className="mt-12 flex gap-4 pb-10">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-5 border border-border-slate rounded-3xl font-black text-[11px] uppercase tracking-widest text-text-light hover:text-text-main transition-all"
                >
                  Back
                </button>
              )}
              <button 
                onClick={() => {
                  if (step < totalSteps - 1) {
                    setStep(step + 1);
                  } else {
                    const combinedData = {
                      ...formData,
                      ...(role === 'provider' ? specialistData : {})
                    };
                    onSave(combinedData);
                    onComplete();
                  }
                }}
                className="flex-1 py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {step === totalSteps - 1 
                  ? (role === 'provider' ? 'Deploy Specialist Profile' : 'Activate Identity') 
                  : 'Next Protocol'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Views ---

function DiscoverView({ sortBy, onAddBooking, onViewProfile, setActiveTab, onWaitlist, userInterests, selectedCategory }: { 
  sortBy: SortOption, 
  onAddBooking: (b: Booking) => void, 
  onViewProfile: (p: Provider) => void, 
  setActiveTab: (t: string) => void,
  onWaitlist: (p: Provider) => void,
  userInterests: string[],
  selectedCategory: Category | null
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);

  const providers = useMemo(() => {
    const matches = matchingService.getMatchesForClient(userInterests, MOCK_PROVIDERS, { category: selectedCategory || undefined });
    
    // Convert MatchResult back to Provider list, keeping the score for UI
    let list = matches.map(m => {
      const p = MOCK_PROVIDERS.find(p => p.id === m.targetId)!;
      return { ...p, matchScore: m.score };
    });

    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price') list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortBy === 'distance') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
    return list;
  }, [sortBy, userInterests, selectedCategory]);

  // Reset index if sort or filters change, and handle empty state
  useEffect(() => {
    if (providers.length === 0) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(0);
    }
  }, [sortBy, selectedCategory, providers.length]);

  const handleSwipe = (direction: 'right' | 'left') => {
    if (direction === 'right' && providers[currentIndex]) {
      // Auto-book or Like logic
      setProviderToBook(providers[currentIndex]);
      setIsBookingModalOpen(true);
    }

    if (currentIndex < providers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1); 
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 lg:p-10 relative overflow-hidden">
      <div className="flex-1 relative w-full h-full flex items-center justify-center min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {currentIndex === -1 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center max-w-xs"
            >
              <div className="w-24 h-24 bg-primary-blue/10 rounded-full flex items-center justify-center mb-6 border border-primary-blue/20">
                <RefreshCcw size={40} className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2 leading-tight">
                {providers.length === 0 ? "Expanding Search..." : "All caught up!"}
              </h3>
              <p className="text-sm text-text-light mb-8 leading-relaxed">
                {providers.length === 0 
                  ? "No exact matches found for these filters. Try broadening your criteria or categories." 
                  : "We've shown you all the top pros in your area. Want to see them again?"}
              </p>
              <button 
                onClick={() => setCurrentIndex(0)}
                className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
              >
                REFRESH DISCOVERY
              </button>
            </motion.div>
          ) : (
            providers.slice(currentIndex, currentIndex + 2).reverse().map((provider, i) => (
              <SwipeCard 
                key={provider.id} 
                provider={provider} 
                isTop={i === (providers.slice(currentIndex, currentIndex + 2).length - 1)}
                onSwipe={handleSwipe}
                onBook={() => {
                   setProviderToBook(provider);
                   setIsBookingModalOpen(true);
                }}
                onViewProfile={() => onViewProfile(provider)}
                onWaitlist={() => onWaitlist(provider)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {currentIndex !== -1 && (
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-text-light/20 pointer-events-none hidden lg:flex">
          <div className="flex flex-col items-center gap-1 group">
            <span className="text-[9px] uppercase font-black rotate-90 mb-10 tracking-widest text-text-light/40">Swipe Right to Like</span>
            <div className="w-1 h-32 bg-text-light/10 rounded-full relative overflow-hidden">
               <motion.div 
                animate={{ x: [-100, 100] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-blue to-transparent" 
               />
            </div>
          </div>
        </div>
      )}

      {/* Discovery Feed Context */}
      {currentIndex !== -1 && (
        <div className="mt-8 md:mt-12 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-forwards">
           <div className="flex items-center gap-2 mb-4 group cursor-help">
              <Sparkles size={14} className="text-primary-blue animate-pulse" />
              <span className="text-[10px] font-black text-text-light uppercase tracking-[0.3em]">Discovery Insights</span>
           </div>
           <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Verified Only</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">100% Background Checked</p>
              </div>
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Price Protection</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">Escrow Milestone Payments</p>
              </div>
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Elite Tiering</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">Top 5% Talent Globally</p>
              </div>
           </div>
        </div>
      )}

      {providerToBook && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          provider={providerToBook} 
          onConfirm={(booking) => {
             onAddBooking(booking);
          }}
          onNavigateToWaitlist={() => setActiveTab('waitlist')}
        />
      )}
    </div>
  );
}

interface SwipeCardProps {
  key?: any;
  provider: Provider;
  isTop: boolean;
  onSwipe: (dir: 'right' | 'left') => void;
  onBook?: () => void;
  onViewProfile?: () => void;
}

function SwipeCard({ provider, isTop, onSwipe, onBook, onViewProfile, onWaitlist }: SwipeCardProps & { onWaitlist?: () => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const [lastTap, setLastTap] = useState(0);
  const [showWaitlistOverlay, setShowWaitlistOverlay] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 150) onSwipe('right');
    else if (info.offset.x < -150) onSwipe('left');
  };

  const handleDoubleTap = (e: any) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      setShowWaitlistOverlay(true);
      onWaitlist?.();
      setTimeout(() => setShowWaitlistOverlay(false), 800);
    }
    setLastTap(now);
  };

  return (
    <motion.div
      style={{ x, opacity, rotate, scale, position: 'absolute' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onPointerDown={handleDoubleTap}
      animate={isTop ? { scale: 1 } : { scale: 0.9, opacity: 0.3 }}
      className="w-full h-[650px] md:h-auto md:max-w-4xl md:aspect-[18/9] bg-sidebar border border-border-slate rounded-[40px] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col md:flex-row relative"
    >
      <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 bg-accent-green/10 z-30 flex items-center justify-center pointer-events-none transition-colors">
        <div className="border-4 border-accent-green px-6 py-2 rounded-2xl">
          <span className="text-accent-green font-black text-3xl uppercase tracking-tighter">YES</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute inset-0 bg-red-500/10 z-30 flex items-center justify-center pointer-events-none transition-colors">
        <div className="border-4 border-red-500 px-6 py-2 rounded-2xl">
          <span className="text-red-500 font-black text-3xl uppercase tracking-tighter">NO</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showWaitlistOverlay && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1.2, opacity: 1 }} 
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-primary-blue/20 z-[40] backdrop-blur-sm pointer-events-none"
          >
             <div className="flex flex-col items-center gap-4">
                <Clock size={80} className="text-white fill-white/20 animate-bounce" />
                <span className="text-white font-black text-4xl uppercase tracking-[0.2em] shadow-lg">Waitlist Access</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2/3 Image Area (Mobile Focus) */}
      <div className="w-full md:w-[65%] h-[65%] md:h-full relative group shrink-0 overflow-hidden">
        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        
        {/* Top Actions */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <button 
                onPointerDown={e => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.();
                }}
                className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl group/btn"
            >
                <User size={20} className="group-hover/btn:scale-110 transition-transform" />
            </button>

            <button 
                onPointerDown={e => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Initiate chat: we'll navigate to chat tab for now
                  // Ideally we'd select this provider in the chat list
                  window.dispatchEvent(new CustomEvent('init-chat', { detail: { providerId: provider.id } }));
                }}
                className="w-12 h-12 bg-primary-blue/20 backdrop-blur-xl border border-primary-blue/30 rounded-2xl flex items-center justify-center text-primary-blue hover:bg-primary-blue/30 transition-all shadow-xl group/msg ml-2"
            >
                <MessageSquare size={20} className="group-hover/msg:scale-110 transition-transform" />
            </button>

            <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl flex items-center gap-2 border ${
               provider.isAvailable ? 'bg-accent-green/40 border-accent-green/50 text-white' : 'bg-red-500/40 border-red-500/50 text-white'
            }`}>
               <div className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-accent-green animate-pulse' : 'bg-red-400'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest">{provider.isAvailable ? 'Available' : 'Off'}</span>
            </div>
        </div>

        {/* Bottom Overlays within Image */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="flex flex-col gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 shadow-2xl">
                   <div className="text-[6px] md:text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mb-0.5">Starting Rate</div>
                   <div className="text-lg md:text-xl font-black text-white leading-none">Ksh {provider.pricePerHour.toLocaleString()}</div>
                </div>
                <div className="bg-primary-blue/30 backdrop-blur-md border border-primary-blue/20 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 self-start">
                   <MapPin size={12} className="text-white" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{provider.distance}</span>
                </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 shadow-2xl flex flex-col items-end">
               <div className="flex items-center gap-1.5 text-base md:text-xl font-black text-amber-400">
                  <Star size={16} className="fill-amber-400" /> {provider.rating}
               </div>
               <div className="text-[6px] md:text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mt-0.5">{provider.reviews} Elite Stats</div>
            </div>
        </div>
      </div>

      {/* 1/3 Content Area */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-card-bg overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-xl md:text-3xl font-black text-text-main leading-none tracking-tight">{provider.name}</h2>
            {provider.verified && <CheckCircle2 size={16} className="text-primary-blue fill-primary-blue/20" />}
            
            <button 
               onPointerDown={e => {
                 e.stopPropagation();
               }}
               onClick={(e) => {
                 e.stopPropagation();
                 onBook?.();
               }}
               className={`ml-auto px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] tracking-widest transition-all uppercase shadow-lg active:scale-95 flex items-center gap-2 ${
               provider.isAvailable ? 'bg-primary-blue text-white shadow-blue-500/20 hover:bg-blue-600' : 'bg-text-light/10 text-text-light/40 border border-border-slate cursor-not-allowed'
            }`}>
               {provider.isAvailable ? 'Book Now' : 'Waitlist'}
               <ArrowRight size={12} className={provider.isAvailable ? 'animate-pulse' : ''} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <span className={`px-3 py-1 bg-primary-blue/10 text-primary-blue text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-blue/10`}>
              {provider.category}
            </span>
            <span className="text-text-light text-[9px] font-bold uppercase tracking-widest opacity-60">
              Joined {provider.joined}
            </span>
          </div>

          <p className="text-text-main text-[11px] md:text-sm leading-relaxed font-medium opacity-80 text-left line-clamp-2 md:line-clamp-none italic border-l-2 border-primary-blue/20 pl-4 py-1">
            "{provider.bio}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ServicesView({ 
  selectedCategory, 
  setSelectedCategory, 
  filterTier, 
  setFilterTier, 
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onAddBooking, 
  onViewProfile,
  setActiveTab,
  userInterests
}: { 
  selectedCategory: Category | null, 
  setSelectedCategory: (c: Category | null) => void, 
  filterTier: TierLevel | 'All',
  setFilterTier: (t: TierLevel | 'All') => void,
  searchQuery: string,
  setSearchQuery: (s: string) => void,
  sortBy: SortOption,
  setSortBy: (o: SortOption) => void,
  onAddBooking: (b: Booking) => void, 
  onViewProfile: (p: Provider) => void,
  setActiveTab: (t: string) => void,
  userInterests: string[]
}) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);

  const trendingProviders = useMemo(() => {
    // Mostly used (high reviews) + Preferred (high rating) + New (joined 2026)
    const elite = [...MOCK_PROVIDERS].sort((a, b) => b.reviews - a.reviews).slice(0, 2);
    const newest = [...MOCK_PROVIDERS].filter(p => p.joined === '2026').slice(0, 1);
    
    // Combine and remove duplicates
    const combined = [...elite, ...newest];
    return Array.from(new Set(combined.map(p => p.id)))
      .map(id => combined.find(p => p.id === id)!);
  }, []);

  const filteredProviders = useMemo(() => {
    // First, get matching scores for the entire mock set based on current search context
    const matches = matchingService.getMatchesForClient(userInterests, MOCK_PROVIDERS, { 
      query: searchQuery || undefined, 
      category: selectedCategory || undefined 
    });

    // Map scores back to providers
    let list = MOCK_PROVIDERS.map(p => {
      const match = matches.find(m => m.targetId === p.id);
      return { ...p, matchScore: match?.score || 0 };
    });

    // Filtering
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (filterTier !== 'All') {
      list = list.filter(p => p.tier === filterTier);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.services.some(s => s.toLowerCase().includes(q))
      );
    }

    // Sorting
    // Default to Match Score if no explicit sort is chosen
    if (sortBy === 'none') {
      list.sort((a, b) => (b as any).matchScore - (a as any).matchScore);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
    
    return list;
  }, [selectedCategory, sortBy, filterTier, searchQuery, userInterests]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight uppercase whitespace-nowrap">
              Professional Directory
            </h2>
            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary-blue transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Search Skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sidebar/40 border border-border-slate rounded-xl text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {selectedCategory && (
             <div className="flex items-center gap-4">
               <button onClick={() => { setSelectedCategory(null); setFilterTier('All'); }} className="px-6 py-2.5 bg-sidebar rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary-blue transition-all border border-border-slate flex items-center gap-2 group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  All Categories
               </button>
               <span className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">
                 Filter: <span className="text-primary-blue">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
               </span>
             </div>
           )}
        </div>
      </header>

      {!selectedCategory ? (
        <div className="space-y-12">
          {/* Enhanced Landing State for Services */}
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-1 bg-primary-blue rounded-full"></div>
                <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em]">Browse Ecosystem</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
               {CATEGORIES.map((cat) => (
                 <button
                   key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                   className="p-5 md:p-6 border bg-text-main/[0.04] dark:bg-white/[0.04] border-border-slate hover:bg-primary-blue/5 rounded-[28px] md:rounded-[32px] flex flex-col items-center text-center group transition-all duration-300"
                 >
                   <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                     <cat.icon size={20} />
                   </div>
                   <span className="font-extrabold text-[10px] md:text-[12px] uppercase tracking-widest text-text-main mb-1 text-center">{cat.label}</span>
                   <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter text-text-light opacity-60">
                     {MOCK_PROVIDERS.filter(p => p.category === cat.id).length} Active
                   </span>
                 </button>
               ))}
             </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8 space-y-6">
                <h4 className="text-[10px] font-black text-primary-blue uppercase tracking-[0.3em]">Trending Now</h4>
                <div className="space-y-4">
                   {trendingProviders.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => onViewProfile(p)}
                        className="w-full flex items-center justify-between p-4 bg-sidebar/50 rounded-2xl border border-border-slate/10 hover:border-primary-blue/30 hover:bg-sidebar transition-all group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={p.image} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                               {p.joined === '2026' && (
                                 <div className="absolute -top-1 -right-1 bg-accent-green text-[6px] font-black text-white px-1 rounded-sm border border-sidebar">NEW</div>
                               )}
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black text-text-main uppercase group-hover:text-primary-blue transition-colors">{p.name}</p>
                               <div className="flex items-center gap-2">
                                  <p className="text-[9px] text-text-light font-bold uppercase">{p.category}</p>
                                  {p.reviews > 100 && (
                                    <span className="text-[7px] font-black text-primary-blue bg-primary-blue/10 px-1.5 rounded uppercase">Popular</span>
                                  )}
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-primary-blue">Ksh {p.pricePerHour}/hr</p>
                            <span className="text-[7px] font-black text-accent-green uppercase flex items-center justify-end gap-1">
                               <Star size={8} fill="currentColor" /> {p.rating}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             <div className="bg-primary-blue/5 border border-primary-blue/10 rounded-[40px] p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center text-white">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-text-main uppercase tracking-tight">The RSA Elite Guarantee</h4>
                      <p className="text-[10px] text-text-light uppercase font-bold tracking-widest">Securing every transaction</p>
                   </div>
                </div>
                <p className="text-xs text-text-main font-medium leading-relaxed italic opacity-80 mb-6">
                   "We've implemented deep cryptographic verification for all service providers. Your payments remain in zero-knowledge escrow until you confirm the milestone completion."
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-sidebar rounded-2xl text-center">
                      <p className="text-lg font-black text-text-main leading-none">2.4k+</p>
                      <p className="text-[8px] font-black text-text-light uppercase tracking-widest mt-1">Verified Pros</p>
                   </div>
                   <div className="p-4 bg-sidebar rounded-2xl text-center">
                      <p className="text-lg font-black text-text-main leading-none">99.8%</p>
                      <p className="text-[8px] font-black text-text-light uppercase tracking-widest mt-1">SLA Success</p>
                   </div>
                </div>
             </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 p-4 bg-primary-blue/5 rounded-2xl border border-primary-blue/10">
             <div className="w-10 h-10 bg-primary-blue text-white rounded-xl flex items-center justify-center">
                {(() => {
                   const Icon = CATEGORIES.find(c => c.id === selectedCategory)?.icon;
                   return Icon ? <Icon size={20} /> : null;
                })()}
             </div>
             <div className="flex-1">
                <h3 className="text-base font-black text-text-main uppercase tracking-tight leading-none mb-1">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                   {CATEGORIES.find(c => c.id === selectedCategory)?.subServices.slice(0, 6).map(sub => (
                      <span key={sub} className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-text-main/10 rounded-full text-text-light">
                         {sub}
                      </span>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {filteredProviders.length > 0 ? (
              filteredProviders.map(provider => (
                <ProviderListCard 
                  key={provider.id} 
                  provider={provider} 
                  onBook={() => {
                    setProviderToBook(provider);
                    setIsBookingModalOpen(true);
                  }}
                  onViewProfile={() => onViewProfile(provider)}
                />
              ))
            ) : (
              <div className="col-span-full p-20 bg-sidebar/20 border border-dashed border-border-slate rounded-[40px] text-center">
                 <p className="text-sm font-black text-text-light uppercase tracking-widest">No specialists found matching your search.</p>
                 <button 
                  onClick={() => { setSearchQuery(''); setFilterTier('All'); }}
                  className="mt-4 px-6 py-2 bg-text-main text-sidebar rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Clear all filters
                 </button>
              </div>
            )}
          </div>
        </div>
      )}

      {providerToBook && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          provider={providerToBook} 
          onConfirm={(booking) => {
             onAddBooking(booking);
          }}
          onNavigateToWaitlist={() => setActiveTab('waitlist')}
        />
      )}
    </motion.div>
  );
}

function ProviderListCard({ provider, onBook, onViewProfile }: { provider: Provider & { matchScore?: number }, key?: any, onBook?: () => void, onViewProfile?: () => void }) {
  return (
    <div 
      onClick={onViewProfile}
      className="p-6 bg-text-main/[0.02] dark:bg-white/[0.02] border border-border-slate rounded-[32px] flex items-center gap-6 hover:bg-text-main/[0.05] dark:hover:bg-white/[0.05] transition-all group cursor-pointer relative overflow-hidden"
    >
      {provider.matchScore && provider.matchScore > 85 && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary-blue text-[8px] font-black text-white uppercase tracking-[0.2em] rounded-bl-xl border-b border-l border-primary-blue/30 shadow-lg z-10">
          Smart Match: {provider.matchScore}%
        </div>
      )}
      <div className="relative shrink-0">
        <img src={provider.image} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-sidebar ${provider.isAvailable ? 'bg-accent-green' : 'bg-red-400'}`}></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
           <h4 className="text-lg font-black text-text-main leading-tight">{provider.name}</h4>
           <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${
             provider.tier === 'Luxury' ? 'bg-amber-500 text-white' : 
             provider.tier === 'Premium' ? 'bg-emerald-500 text-white' : 
             'bg-blue-500 text-white'
           }`}>
             {provider.tier}
           </span>
           {provider.verified && <CheckCircle2 size={14} className="text-primary-blue" fill="currentColor" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-light font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1 text-yellow-500">
              <Star size={12} fill="currentColor" /> {provider.rating}
           </div>
           <span className="text-text-main font-black">Ksh {provider.pricePerHour}/hr</span>
        </div>
        <div className="mt-3 max-w-[200px]">
           <ReputationBar 
             rating={provider.rating} 
             reliability={provider.reliability} 
             flaggedCount={provider.flaggedCount} 
             label="Pro Reliability"
           />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onBook?.(); }}
          className="px-4 py-2 bg-primary-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue-500/10"
        >
          Book Now
        </button>
        <div className="w-10 h-10 bg-sidebar/40 rounded-xl flex items-center justify-center text-text-light group-hover:hidden transition-all border border-border-slate">
           <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}

// --- Provider Views ---

function AvailabilityCalendar({ 
  bookings, 
  blockedDates, 
  onToggleDate 
}: { 
  bookings: Booking[], 
  blockedDates: string[], 
  onToggleDate: (date: string) => void 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const prevMonthDays = daysInMonth(year, month - 1);
  
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const calendarDays = [];
  
  // Padding from prev month
  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, current: false });
  }
  
  // Current month
  for (let i = 1; i <= numDays; i++) {
    calendarDays.push({ day: i, current: true });
  }
  
  // Padding for next month
  const totalSlots = 42; 
  const remainingSlots = totalSlots - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({ day: i, current: false });
  }

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isBlocked = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedDates.includes(dateStr);
  };

  const hasBooking = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.some(b => {
      const bDate = new Date(b.date);
      const bStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
      return bStr === dateStr && b.providerId === '2'; // Provider '2' has the upcoming booking in mock data
    });
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onToggleDate(dateStr);
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  return (
    <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
       <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em]">Availability</h4>
          <div className="flex items-center gap-2">
             <button onClick={prevMonth} className="p-1.5 hover:bg-sidebar rounded-lg transition-colors text-text-light"><ChevronLeft size={16} /></button>
             <span className="text-[10px] font-black text-text-main uppercase tracking-widest min-w-[100px] text-center">{monthName}</span>
             <button onClick={nextMonth} className="p-1.5 hover:bg-sidebar rounded-lg transition-colors text-text-light"><ChevronRight size={16} /></button>
          </div>
       </div>

       <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[8px] font-black text-text-light/40 text-center uppercase">{d}</div>
          ))}
       </div>

       <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const blocked = date.current && isBlocked(date.day);
            const booked = date.current && hasBooking(date.day);
            const today = date.current && isToday(date.day);
            
            return (
              <button
                key={i}
                disabled={!date.current}
                onClick={() => date.current && handleDateClick(date.day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                  !date.current ? 'opacity-10 cursor-default shadow-none border-transparent bg-transparent' : 
                  blocked ? 'bg-red-500/20 border border-red-500/30 text-red-500' :
                  booked ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5' :
                  'hover:bg-sidebar border border-transparent text-text-light'
                } ${today ? 'ring-1 ring-primary-blue ring-offset-2 ring-offset-sidebar' : ''}`}
              >
                <span className={`text-[10px] font-black ${date.current ? (blocked ? 'text-red-500' : booked ? 'text-amber-500' : 'text-text-main') : 'text-text-light/20'}`}>
                  {date.day}
                </span>
                
                {booked && !blocked && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500"></div>
                )}
                
                {date.current && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity bg-sidebar/90 rounded-xl pointer-events-none border border-primary-blue/30 overflow-hidden">
                    <span className="text-[6px] font-black uppercase tracking-widest text-primary-blue animate-pulse">
                      {blocked ? 'Open' : 'Block'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
       </div>

       <div className="mt-8 pt-6 border-t border-border-slate/10 space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">Active Jobs</span>
             </div>
             <span className="text-[9px] font-black text-text-main uppercase">{bookings.filter(b => b.providerId === '2' && b.status !== 'completed').length} Slots</span>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">Manual Blocks</span>
             </div>
             <span className="text-[9px] font-black text-text-main uppercase">{blockedDates.length} Days</span>
          </div>
       </div>
    </div>
  );
}

function ProviderDashboardView({ 
  onProfileClick, 
  isDeployed, 
  toggleDeployment,
  bookings,
  blockedDates,
  toggleBlockDate,
  profile
}: { 
  onProfileClick: () => void, 
  isDeployed: boolean, 
  toggleDeployment: () => void,
  bookings: Booking[],
  blockedDates: string[],
  toggleBlockDate: (date: string) => void,
  profile: any
}) {
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'schedule' | 'analytics' | 'requests'>('overview');

  const matches = useMemo(() => {
    // Current user's virtual "Provider" profile for matching
    const virtualProvider: any = {
      ...profile,
      id: auth.currentUser?.uid,
      name: auth.currentUser?.displayName,
    };
    return matchingService.getMatchesForProvider(virtualProvider, bookings);
  }, [profile, bookings]);

  const handleToggleDate = (date: string) => {
    toggleBlockDate(date);
  };

  const navItems = [
    { id: 'overview', label: 'Monitor', icon: LayoutDashboard },
    { id: 'schedule', label: 'Availability', icon: Calendar },
    { id: 'analytics', label: 'Earnings', icon: BarChart3 },
    { id: 'requests', label: 'Deployments', icon: Zap },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto">
       <header className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="text-left">
             <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 ${isDeployed ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} text-[9px] font-black uppercase tracking-widest rounded-md border`}>
                   {isDeployed ? 'Active Session' : 'Offline'}
                </span>
                {isDeployed && <span className="text-[10px] text-text-light font-bold uppercase tracking-widest">Since 08:30 AM</span>}
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Service Hub</h2>
             <p className="text-text-light text-xs md:text-sm font-medium">{isDeployed ? 'Monitoring your Nairobi service reach and active deployments.' : 'Ready to start your next session? Launch deployment to become visible.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-sidebar/30 p-1.5 rounded-2xl border border-border-slate">
             {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setDashboardSubTab(item.id as any)}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${dashboardSubTab === item.id ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
                >
                   <item.icon size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
             ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
             <button className="w-10 h-10 md:w-12 md:h-12 bg-sidebar/20 border border-border-slate rounded-xl md:rounded-2xl flex items-center justify-center text-text-light hover:text-text-main hover:bg-sidebar transition-all relative">
                <Bell size={18} />
                {isDeployed && <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary-blue rounded-full border-2 border-sidebar"></div>}
             </button>
             <button 
               onClick={onProfileClick}
               className="px-4 md:px-6 py-2.5 md:py-3.5 bg-sidebar border border-border-slate rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-text-main uppercase tracking-widest hover:bg-white hover:text-sidebar transition-all"
             >
                Settings
             </button>
             <button 
               onClick={toggleDeployment}
               className={`px-4 md:px-6 py-2.5 md:py-3.5 ${isDeployed ? 'bg-primary-blue text-white shadow-blue-500/20' : 'bg-sidebar border border-border-slate text-text-light hover:border-text-light'} rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all w-full lg:w-auto`}
             >
                {isDeployed ? 'Go Offline' : 'Launch Session'}
             </button>
          </div>
       </header>

       <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
             {dashboardSubTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard icon={Wallet} label="Net Revenue" value="Ksh 45,200" color="text-primary-blue" trend="+12.4%" />
                      <StatCard icon={Calendar} label="Open Gigs" value="08" color="text-accent-purple" trend="+2" />
                      <StatCard icon={History} label="Comp. Rate" value="98%" color="text-accent-green" trend="+1.2%" />
                      <StatCard icon={Star} label="Reputation" value="4.95" color="text-yellow-500" trend="Top 1%" />
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <section className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                         <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 px-2 border-l-2 border-primary-blue">Recent Activity</h4>
                         <div className="space-y-6">
                            {[
                               { type: 'Payment', msg: 'Payout of Ksh 15,200 initiated', time: '1h ago', icon: Wallet },
                               { type: 'Job', msg: 'Cleaning at Westlands completed', time: '3h ago', icon: CheckCircle2 },
                               { type: 'Review', msg: 'Received 5-star rating from Jane', time: '5h ago', icon: Star },
                            ].map((item, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-sidebar border border-border-slate flex items-center justify-center text-text-light shrink-0">
                                     <item.icon size={14} />
                                  </div>
                                  <div>
                                     <p className="text-xs font-bold text-text-main leading-tight mb-1">{item.msg}</p>
                                     <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">{item.time} • {item.type}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>

                      <section className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                         <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 px-2 border-l-2 border-accent-green">System Health</h4>
                         <div className="space-y-8">
                            <div className="flex items-center justify-between">
                               <span className="text-[11px] font-bold text-text-main uppercase tracking-tight">Visibility Rank</span>
                               <span className="text-[10px] font-black text-accent-green uppercase">Top 5% in Nairobi</span>
                            </div>
                            <div className="w-full h-1.5 bg-sidebar-dark/20 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} className="h-full bg-accent-green" />
                            </div>
                            
                            <div className="p-4 bg-primary-blue/5 border border-primary-blue/20 rounded-2xl flex items-center gap-4">
                               <Zap size={20} className="text-primary-blue" />
                               <div>
                                  <p className="text-[10px] font-black text-text-main uppercase tracking-tight leading-none mb-1">Smart Engine Active</p>
                                  <p className="text-[9px] text-text-light font-bold">Algorithmic Match: {matches.length} target leads identified</p>
                               </div>
                            </div>
                         </div>
                      </section>
                   </div>
                </motion.div>
             )}

             {dashboardSubTab === 'schedule' && (
                <motion.div 
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                >
                   <div className="lg:col-span-2">
                      <AvailabilityCalendar 
                        bookings={bookings} 
                        blockedDates={blockedDates} 
                        onToggleDate={handleToggleDate} 
                      />
                   </div>
                   <aside className="space-y-8">
                       <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                          <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-6 underline decoration-primary-blue decoration-2 underline-offset-8">Quick Rules</h4>
                          <ul className="space-y-4">
                             {[
                                'Must confirm bookings 4h prior',
                                'Min 8h gap between shifts',
                                'Instant block on cancellation',
                             ].map((rule, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
                                   <span className="text-[10px] font-bold text-text-main/70 uppercase leading-snug">{rule}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                   </aside>
                </motion.div>
             )}

             {dashboardSubTab === 'analytics' && (
                <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                   <section>
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-[11px] font-black text-text-light uppercase tracking-[0.4em] pl-2 border-l-2 border-accent-purple">Financial Vectors</h4>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-primary-blue"></div>
                               <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-border-slate"></div>
                               <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">Industry Avg</span>
                            </div>
                         </div>
                      </div>
                      <div className="bg-sidebar/20 border border-border-slate rounded-[40px] p-10">
                         <div className="flex items-end justify-between h-64 gap-4 px-4">
                            {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85, 60, 95].map((h, i) => (
                               <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                  <div className="w-full relative bg-text-main/5 rounded-full overflow-hidden h-full">
                                     <motion.div 
                                       initial={{ height: 0 }} 
                                       animate={{ height: `${h}%` }} 
                                       transition={{ delay: i * 0.05, duration: 0.8 }}
                                       className="absolute bottom-0 w-full bg-gradient-to-t from-primary-blue to-blue-400 rounded-full group-hover:from-accent-purple group-hover:to-purple-400 transition-colors"
                                     />
                                  </div>
                                  <span className="text-[8px] font-black text-text-light uppercase opacity-40 group-hover:opacity-100 transition-opacity">W{i+1}</span>
                               </div>
                            ))}
                         </div>
                         <div className="mt-10 pt-8 border-t border-border-slate/10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div>
                                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Total Payouts</p>
                                  <p className="text-xl font-black text-text-main">Ksh 1.2M</p>
                                </div>
                                <div className="w-px h-8 bg-border-slate/20"></div>
                                <div>
                                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Pending Clearance</p>
                                  <p className="text-xl font-black text-text-main">Ksh 12,400</p>
                                </div>
                             </div>
                             <button className="flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                                Transfer to Wallet <ArrowRight size={14} />
                             </button>
                         </div>
                      </div>
                   </section>
                </motion.div>
             )}

             {dashboardSubTab === 'requests' && (
                <motion.div 
                  key="requests"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-text-light uppercase tracking-[0.4em] pl-2 border-l-2 border-primary-blue">Deployment Pipeline</h4>
                      <div className="flex gap-2">
                        {['All', 'Priority', 'Nearby'].map(f => (
                           <button key={f} className="px-4 py-1.5 rounded-full border border-border-slate text-[8px] font-black uppercase tracking-widest text-text-light hover:text-text-main transition-colors text-xs">
                             {f}
                           </button>
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RequestItem name="Estate Deep Cleaning" clientId="c1" time="Today, 2:00 PM" location="Westlands" price={3000} urgency="High" matchScore={profile.category === 'Household' ? 95 : 40} />
                      <RequestItem name="Emergency Pipe Repair" clientId="c2" time="Today, 4:45 PM" location="Kilimani" price={4500} urgency="Critical" matchScore={profile.category === 'Technical' ? 98 : 30} />
                      <RequestItem name="Standard Inspection" clientId="c3" time="Tomorrow, 9:00 AM" location="Lavington" price={1500} urgency="Standard" matchScore={profile.category === 'Medical' ? 10 : 20} />
                      <RequestItem name="HVAC Maintenance" clientId="c4" time="Friday, 11:30 AM" location="Muthaiga" price={5500} urgency="Scheduled" matchScore={profile.category === 'Technical' ? 85 : 50} />
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </motion.div>
  );
}

function ProviderCatalogView({ profile, setProfile, onFinalize, setToast }: { 
  profile: { tier: TierLevel, category: Category, services: string[] },
  setProfile: (p: any) => void,
  onFinalize: (p: any) => void,
  setToast: (t: { message: string }) => void 
}) {
  const [step, setStep] = useState<'setup' | 'questions' | 'legal'>('setup');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [answers, setAnswers] = useState<boolean[]>(new Array(5).fill(false));
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const toggleService = (service: string, tier: TierLevel) => {
    const isSelected = profile.services.includes(service);
    let newServices = isSelected
      ? profile.services.filter(s => s !== service)
      : [...profile.services, service];
    
    // Determine highest tier among selected services
    let highestTier: TierLevel = 'Basic';
    CATEGORIES.forEach(c => {
      ['Luxury', 'Premium', 'Basic'].forEach(t => {
        const tierServices = TIER_SERVICES_MATRIX[c.id][t as TierLevel];
        if (newServices.some(s => tierServices.includes(s))) {
          if (t === 'Luxury') highestTier = 'Luxury';
          else if (t === 'Premium' && highestTier === 'Basic') highestTier = 'Premium';
        }
      });
    });

    setProfile({ ...profile, services: newServices, tier: highestTier });
  };

  const currentFee = CATALOG_PACKAGES.find(p => p.tier === profile.tier)?.fee || 4.5;

  const handleFinalize = () => {
    if (profile.services.length === 0) return;
    if (profile.tier === 'Basic') {
      setStep('legal');
    } else {
      setStep('questions');
    }
  };

  const submitAnswers = () => {
    if (answers.every(a => a)) {
      setStep('legal');
    } else {
      setToast({ message: "Verification Protocol Failed: You must attest to all professional requirements to activate your specialized terminal." });
    }
  };

  const completeSigning = async () => {
    setIsFinalizing(true);
    try {
      await onFinalize(profile);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (step === 'questions') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
             <button onClick={() => setStep('setup')} className="text-text-light hover:text-text-main transition-colors">
                <ChevronLeft size={24} />
             </button>
             <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-[10px] font-black uppercase tracking-widest rounded-full">Part 2 of 3</span>
          </div>
          <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Qualification Assessment</h2>
          <p className="text-text-light text-sm font-medium">Verified providers must maintain 100% compliance with industry standards for {profile.category} services.</p>
        </header>

        <div className="bg-sidebar/40 border border-border-slate rounded-[48px] p-10 space-y-8 shadow-2xl">
           <div className="grid gap-4">
              {QUALIFICATION_QUESTIONS[profile.category].map((q, i) => (
                <div key={i} className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${answers[i] ? 'bg-primary-blue/5 border-primary-blue/30' : 'bg-sidebar border-border-slate'}`}>
                   <p className="text-xs font-bold text-text-main leading-relaxed max-w-xl">{q}</p>
                   <button 
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[i] = !newAnswers[i];
                      setAnswers(newAnswers);
                    }}
                    className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${answers[i] ? 'bg-primary-blue justify-end' : 'bg-border-slate/30 justify-start'}`}
                   >
                     <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                   </button>
                </div>
              ))}
           </div>

           <div className="p-8 bg-text-main text-sidebar rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <AlertCircle size={24} />
                 <p className="text-[11px] font-bold uppercase tracking-tight">By toggling these, you attest to their accuracy under our Professional Charter.</p>
              </div>
              <button 
                onClick={submitAnswers}
                className="px-10 py-4 bg-primary-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Validate Answers
              </button>
           </div>
        </div>
      </motion.div>
    );
  }

  if (step === 'legal') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full w-full p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto">
        <header className="mb-12">
           <div className="flex items-center gap-4 mb-4">
             <button 
              onClick={() => setStep(profile.tier === 'Basic' ? 'setup' : 'questions')} 
              className="text-text-light hover:text-text-main transition-colors"
             >
                <ChevronLeft size={24} />
             </button>
             <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                {profile.tier === 'Basic' ? 'Part 2 of 2' : 'Part 3 of 3'}
             </span>
          </div>
          <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Liability & Service Agreement</h2>
          <p className="text-text-light text-sm font-medium">Please review our professional indemnity terms and operational liabilities.</p>
        </header>

        <div className="bg-sidebar border border-border-slate rounded-[48px] p-10 space-y-10 shadow-2xl">
           <div className="bg-card-bg p-8 rounded-[32px] border border-border-slate/10 overflow-y-auto max-h-[300px] text-xs text-text-light leading-loose space-y-6 font-medium scrollbar-hide">
              <h5 className="text-sm font-black text-text-main uppercase tracking-widest">Section 1: Professional Liability</h5>
              <p>1.1 The Service Provider (hereafter referred to as "Provider") acknowledges that they are an independent contractor and not an employee of the Platform. The Provider maintains full liability for any damages, losses, or claims arising from the execution of services booked through the platform.</p>
              <p>1.2 For **Maintenance & Repairs**, the Provider must verify that all installations comply with the building code. Any failure resulting in water damage, fire, or structural compromise is the sole legal responsibility of the Provider.</p>
              
              <h5 className="text-sm font-black text-text-main uppercase tracking-widest">Section 2: Independent Indemnity</h5>
              <p>2.1 The Provider agrees to indemnify and hold harmless the Platform from any and all claims, cost, or expenses resulting from any act or omission made by the Provider during the course of service delivery.</p>
              <p>2.2 Providers in the **Luxury Tier** are required to possess valid third-party liability insurance for values up to Ksh 5,000,000 for estate-level risks.</p>

              <h5 className="text-sm font-black text-text-main uppercase tracking-widest">Section 3: Standard of Care</h5>
              <p>3.1 All providers must adhere to the 4.8+ rating benchmark. Falling below this standard may result in immediate suspension for quality audit.</p>
           </div>

           <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4 p-6 bg-primary-blue/5 rounded-3xl border border-primary-blue/20">
                 <button 
                  onClick={() => setHasAcceptedLegal(!hasAcceptedLegal)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${hasAcceptedLegal ? 'bg-primary-blue border-primary-blue text-white' : 'bg-sidebar border-border-slate'}`}
                 >
                   {hasAcceptedLegal && <Check size={18} />}
                 </button>
                 <div>
                    <p className="text-[11px] font-black text-text-main uppercase tracking-tight mb-1" id="liability-agreement">Acceptance of Terms</p>
                    <p className="text-[10px] text-text-light leading-relaxed">I have read, understood, and accept the liability coverage terms and the Professional Service Charter.</p>
                 </div>
              </div>

              <button 
                disabled={!hasAcceptedLegal || isFinalizing}
                onClick={completeSigning}
                className="w-full py-6 bg-text-main text-sidebar disabled:opacity-30 disabled:grayscale rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                {isFinalizing ? (
                  <RefreshCcw className="animate-spin" size={20} />
                ) : (
                  <>Finalize Enrollment & Sign <ArrowRight size={20}/></>
                )}
              </button>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">
            {!selectedCategory ? "Core Specializations" : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} Catalog`}
          </h2>
          <p className="text-text-light text-sm font-medium">
            {!selectedCategory 
              ? "Select your primary field to configure specialized services and tier qualifications." 
              : "Tick the specific services you are professionally qualified to offer."}
          </p>
        </div>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className="px-6 py-3 bg-sidebar border border-border-slate rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-light hover:text-text-main transition-all"
          >
            Switch Specialization
          </button>
        )}
      </header>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {CATEGORIES.map(cat => (
             <button
               key={cat.id}
               onClick={() => {
                 setSelectedCategory(cat.id);
                 setProfile({ ...profile, category: cat.id });
               }}
               className="group relative h-48 bg-sidebar/20 border border-border-slate rounded-[40px] overflow-hidden hover:border-primary-blue/30 transition-all duration-500"
             >
               <div className={`absolute top-0 right-0 w-32 h-32 ${cat.color} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity`}></div>
               <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center">
                  <div className={`w-14 h-14 ${cat.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-transform group-hover:scale-110`}>
                     <cat.icon size={28} />
                  </div>
                  <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em]">{cat.label}</h3>
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-black text-primary-blue uppercase">Select Field</span>
                     <ArrowRight size={14} className="text-primary-blue" />
                  </div>
               </div>
             </button>
           ))}
        </div>
      ) : (
        <div className="space-y-12">
           <div className="grid grid-cols-1 gap-12">
              {(['Basic', 'Premium', 'Luxury'] as TierLevel[]).map(tier => (
                <div key={tier} className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-1 h-8 rounded-full ${
                        tier === 'Luxury' ? 'bg-amber-500' : tier === 'Premium' ? 'bg-emerald-500' : 'bg-primary-blue'
                      }`} />
                      <div>
                        <h4 className="text-xs font-black text-text-main uppercase tracking-[0.3em]">{tier} Tier</h4>
                        <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">
                          {CATALOG_PACKAGES.find(p => p.tier === tier)?.fee}% Platform Fee
                        </p>
                      </div>
                      <div className="flex-1 h-px bg-border-slate/10" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {TIER_SERVICES_MATRIX[selectedCategory][tier].map(service => (
                        <button
                          key={service}
                          onClick={() => toggleService(service, tier)}
                          className={`p-6 rounded-[32px] border transition-all flex items-center gap-4 text-left group ${
                            profile.services.includes(service)
                              ? 'bg-text-main text-sidebar border-text-main shadow-xl'
                              : 'bg-sidebar/20 border-border-slate hover:border-text-main/20'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            profile.services.includes(service) ? 'bg-sidebar text-text-main border-sidebar' : 'border-border-slate group-hover:border-text-main/40'
                          }`}>
                             {profile.services.includes(service) && <Check size={14} />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight">{service}</span>
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>

           <div className="sticky bottom-0 bg-card-bg/90 backdrop-blur-xl border border-border-slate rounded-[40px] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                 <div>
                    <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Assigned Designation</p>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-text-main uppercase tracking-tighter">
                          {profile.services.length > 0 ? profile.tier : "Incomplete"}
                       </span>
                       {profile.services.length > 0 && <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-[9px] font-black rounded-lg uppercase">{currentFee}% Fee</span>}
                    </div>
                 </div>
                 <div className="w-px h-12 bg-border-slate/10" />
                 <div>
                    <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Services Active</p>
                    <p className="text-2xl font-black text-primary-blue">{profile.services.length}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleFinalize}
                  disabled={profile.services.length === 0}
                  className="px-12 py-5 bg-text-main text-sidebar disabled:opacity-30 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                 >
                    Continue to Vetting <ArrowRight size={18}/>
                 </button>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}

function ReputationBar({ rating, reliability, flaggedCount, label = "Trust Score" }: { rating: number, reliability: number, flaggedCount: number, label?: string }) {
  const isFlagged = flaggedCount > 2;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em]">
        <span className="text-text-light">{label}</span>
        <span className={`${reliability >= 90 ? 'text-accent-green' : reliability >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
          {reliability}% Reliable
        </span>
      </div>
      <div className="h-1.5 w-full bg-border-slate/10 rounded-full overflow-hidden flex relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${reliability}%` }}
          className={`h-full rounded-full transition-colors ${
            reliability >= 90 ? 'bg-accent-green' : reliability >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
        {isFlagged && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 animate-pulse">
            <AlertCircle size={8} className="text-red-500" />
          </div>
        )}
      </div>
      {(isFlagged || flaggedCount > 0) && (
        <div className="flex items-center gap-1.5 mt-1">
          <AlertCircle size={10} className={`${isFlagged ? 'text-red-500' : 'text-yellow-500'}`} />
          <span className={`text-[7px] font-black uppercase tracking-tighter ${isFlagged ? 'text-red-500' : 'text-yellow-500'}`}>
            {flaggedCount} Incident Reports {isFlagged && '• High Risk User'}
          </span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: { icon: any, label: string, value: string, color: string, trend: string }) {
  const isPositive = trend.startsWith('+') || trend.includes('%');
  
  return (
    <div className="p-5 md:p-8 bg-sidebar/20 border border-border-slate rounded-2xl md:rounded-[32px] group hover:bg-sidebar transition-all text-left">
       <div className="flex items-start justify-between mb-4 md:mb-8">
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-sidebar border border-border-slate rounded-xl md:rounded-2xl flex items-center justify-center ${color}`}>
             <Icon size={18} md:size={22} />
          </div>
          <div className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-accent-green' : 'text-primary-blue'}`}>
             {isPositive ? <ArrowUpRight size={12} md:size={14} /> : <TrendingUp size={12} md:size={14} />}
             {trend}
          </div>
       </div>
       <div className="text-xl md:text-3xl font-black text-text-main mb-1 tracking-tighter uppercase">{value}</div>
       <div className="text-[8px] md:text-[10px] font-black text-text-light uppercase tracking-[0.2em] md:tracking-[0.3em]">{label}</div>
    </div>
  );
}

function RequestItem({ name, clientId, time, location, price, urgency, matchScore }: { name: string, clientId?: string, time: string, location: string, price: number, urgency: string, matchScore?: number }) {
  const urgencyColor = urgency === 'Critical' ? 'bg-red-500' : urgency === 'High' ? 'bg-orange-500' : 'bg-primary-blue';
  
  // Find mock client reputation if available
  const clientData = MOCK_CLIENTS.find(c => c.id === clientId) || MOCK_CLIENTS[0];

  return (
    <div className="p-5 md:p-8 bg-sidebar/10 border border-border-slate rounded-[32px] md:rounded-[48px] flex flex-col lg:flex-row lg:items-center gap-5 md:gap-8 hover:bg-sidebar transition-all group relative overflow-hidden shadow-sm text-left">
       <div className={`absolute left-0 top-0 bottom-0 w-1 md:w-1.5 ${urgencyColor}`}></div>
       
       <div className="flex items-center gap-5">
         <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-sidebar border border-border-slate flex items-center justify-center text-primary-blue shrink-0 shadow-lg shadow-black/5">
            <Clock size={24} md:size={28} />
         </div>
         
         <div className="lg:hidden">
            <h5 className="text-base font-black text-text-main uppercase tracking-tighter leading-tight">{name}</h5>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-md text-[7px] font-black text-white uppercase tracking-widest ${urgencyColor}`}>{urgency}</span>
              <span className="text-[8px] font-bold text-text-light uppercase tracking-widest">Ksh {price.toLocaleString()}</span>
              {matchScore && matchScore > 80 && (
                <span className="px-1.5 py-0.5 bg-primary-blue text-white rounded text-[6px] font-black uppercase tracking-widest leading-none">Match</span>
              )}
            </div>
         </div>
       </div>
       
       <div className="hidden lg:block flex-[2]">
          <div className="flex items-center gap-3 mb-2">
             <h5 className="text-xl font-black text-text-main uppercase tracking-tighter">{name}</h5>
             <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-widest ${urgencyColor}`}>{urgency}</span>
                {matchScore && matchScore > 80 && (
                  <span className="px-2 py-0.5 bg-primary-blue text-white rounded text-[7px] font-black uppercase tracking-widest">Optimal Match</span>
                )}
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[10px] text-text-light font-bold uppercase tracking-widest">
             <span className="flex items-center gap-2 relative group/u underline decoration-dotted decoration-primary-blue/30 underline-offset-4 cursor-help"><User size={14} className="text-primary-blue"/> {clientData.name}</span>
             <span className="flex items-center gap-2"><MapPin size={14} className="text-primary-blue"/> {location}</span>
             <span className="flex items-center gap-2"><Calendar size={14} className="text-primary-blue"/> {time}</span>
          </div>
       </div>

       <div className="lg:hidden flex flex-col gap-2 py-2 border-y border-border-slate/10">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-text-light uppercase tracking-widest">Requester</span>
            <span className="text-[9px] font-black text-text-main uppercase tracking-tight">{clientData.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-text-light uppercase tracking-widest">Location</span>
            <span className="text-[9px] font-black text-text-main uppercase tracking-tight">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-text-light uppercase tracking-widest">Time</span>
            <span className="text-[9px] font-black text-text-main uppercase tracking-tight">{time}</span>
          </div>
       </div>

       <div className="flex-1 min-w-[150px] lg:border-l lg:border-r border-border-slate/10 md:px-6 group/rep relative">
          <ReputationBar 
            rating={clientData.rating} 
            reliability={clientData.reliability} 
            flaggedCount={clientData.flaggedCount} 
            label="Client Reliability"
          />
          {clientData.reports && clientData.reports.length > 0 && (
             <div className="absolute top-full left-0 mt-4 w-64 p-4 bg-sidebar border border-red-500/20 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/rep:opacity-100 group-hover/rep:translate-y-0 transition-all z-50">
                <div className="flex items-center gap-2 mb-3">
                   <AlertCircle size={14} className="text-red-500" />
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Internal Flag History</span>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                   {clientData.reports.map(r => (
                      <div key={r.id} className="pb-2 border-b border-border-slate/10 last:border-0 text-left">
                         <p className="text-[9px] font-black text-text-main mb-0.5">{r.reason}</p>
                         <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-text-light/40 uppercase tracking-widest">{r.date}</span>
                            <span className="text-[7px] font-black text-accent-green uppercase tracking-widest">{r.status}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
       </div>
       
       <div className="flex items-center gap-4 shrink-0">
          <div className="text-right mr-4">
             <div className="text-2xl font-black text-text-main leading-none mb-1">Ksh {price.toLocaleString()}</div>
             <p className="text-[9px] font-black text-text-light uppercase tracking-widest">Quote Estimate</p>
          </div>
          <div className="flex gap-2">
             <button className="w-12 h-12 bg-white text-sidebar hover:bg-primary-blue hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-white/5 active:scale-90">
                <Check size={20} />
             </button>
             <button className="w-12 h-12 bg-sidebar border border-border-slate text-text-light hover:text-white hover:bg-red-500 hover:border-red-500 rounded-2xl flex items-center justify-center transition-all active:scale-90">
                <X size={20} />
             </button>
          </div>
       </div>
    </div>
  );
}

function JobsManagementView({ bookings, setToast }: { bookings: Booking[], setToast: (t: any) => void }) { 
  const activeJobs = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'closed');
  const pastJobs = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'closed');

  const handleStartTask = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'in_progress' });
      setToast({ message: "Operational lock engaged. Deployment is now 'In Progress'." });
    } catch (err) {
      console.error(err);
      setToast({ message: "Action failed: Unauthorized state transition." });
    }
  };

  const handleCompleteTask = async (booking: Booking) => {
    try {
      // For invoice, we need actual names. We'll fetch them or use placeholders if not available immediately.
      // In a real app, these would come from the context/state.
      const providerName = auth.currentUser?.displayName || "SkillGrid Specialist";
      
      // Fetch client name for invoice
      const clientSnap = await getDoc(doc(db, 'users', booking.clientId));
      const clientName = clientSnap.exists() ? clientSnap.data().name : "Client Node";

      await workflowService.markTaskCompleted(booking, providerName, clientName);
      setToast({ message: "Task Finalized. E-Invoice generated and delivered for client approval." });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to finalize task." });
    }
  };

  return (
    <div className="h-full w-full p-5 md:p-10 lg:p-16 overflow-y-auto">
       <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Operational Grid</h2>
            <p className="text-text-light text-sm font-medium">Manage your active service tracks and deployment history.</p>
          </div>
          <div className="flex gap-2 p-1 bg-sidebar/30 border border-border-slate rounded-2xl">
             <div className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Deployment List</div>
             <div className="px-5 py-2.5 text-text-light hover:text-text-main rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Calendar Matrix</div>
          </div>
       </header>

       <div className="space-y-16">
          <section>
             <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 flex items-center gap-2 border-l-2 border-primary-blue pl-4">
                Active Deployments
             </h3>
             <div className="grid grid-cols-1 gap-4">
                {activeJobs.length === 0 ? (
                   <div className="p-12 border-2 border-dashed border-border-slate rounded-[40px] text-center bg-sidebar/5">
                      <p className="text-xs text-text-light font-bold uppercase tracking-widest opacity-40">No active operational sessions</p>
                   </div>
                ) : (
                  activeJobs.map(job => (
                    <div key={job.id} className="p-8 bg-sidebar border border-border-slate rounded-[40px] shadow-xl hover:border-primary-blue/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                       <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg transition-all ${job.status === 'in_progress' ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'bg-primary-blue/10 border-primary-blue/20 text-primary-blue group-hover:bg-primary-blue group-hover:text-white'}`}>
                             {job.status === 'in_progress' ? <Activity size={28} className="animate-pulse" /> : <Zap size={28} />}
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-text-main uppercase tracking-tight">{job.category} Specialist Node</h4>
                             <div className="flex items-center gap-4 mt-1 opacity-60">
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> {job.date instanceof Date ? job.date.toDateString() : (job.date?.toDate ? job.date.toDate().toDateString() : 'Active')}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> {job.time}</span>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${job.status === 'in_progress' ? 'bg-accent-green/20 text-accent-green' : 'bg-border-slate/40 text-text-light'}`}>{job.status}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-6 self-end md:self-auto">
                          <div className="text-right">
                             <p className="text-sm font-black text-text-main">Ksh {job.price.toLocaleString()}</p>
                             <p className="text-[8px] font-bold text-accent-green uppercase tracking-widest mt-1">Funds Secured</p>
                          </div>
                          
                          {job.status === 'confirmed' && (
                            <button 
                              onClick={() => handleStartTask(job.id)}
                              className="px-6 py-3 bg-primary-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                              Start Task
                            </button>
                          )}

                          {job.status === 'in_progress' && (
                            <button 
                              onClick={() => handleCompleteTask(job)}
                              className="px-6 py-3 bg-accent-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              Task Completed
                            </button>
                          )}

                          {job.status === 'completed' && (
                            <div className="px-6 py-3 bg-border-slate/10 text-text-light rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <Clock size={14} /> Approval Pending
                            </div>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>

          <section>
             <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 border-l-2 border-border-slate pl-4">Deployment History</h3>
             <div className="bg-sidebar/20 rounded-[40px] border border-border-slate overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-sidebar/40 border-b border-border-slate">
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Operation Entity</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Status</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Revenue</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest text-right">Certificate</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-slate/50">
                      {pastJobs.map(job => (
                        <tr key={job.id} className="hover:bg-sidebar/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div>
                                 <p className="text-sm font-black text-text-main uppercase">{job.category}</p>
                                 <p className="text-[9px] font-bold text-text-light/40 uppercase tracking-widest mt-0.5">{job.date.toLocaleDateString()}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${job.status === 'completed' ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-500'}`}>
                                 {job.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-sm font-black text-text-main">Ksh {job.price.toLocaleString()}</td>
                           <td className="px-8 py-6 text-right">
                              <button className="w-10 h-10 rounded-xl bg-sidebar/50 border border-border-slate flex items-center justify-center text-text-light/40 hover:text-primary-blue hover:border-primary-blue transition-all"><FileText size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
       </div>
    </div>
  );
}

function NotificationCenter({ 
  isOpen, 
  onClose, 
  notifications, 
  onAction 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  notifications: any[], 
  onAction: (n: any) => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-card-bg border-l border-border-slate z-[90] shadow-2xl flex flex-col">
       <div className="p-8 border-b border-border-slate flex items-center justify-between bg-sidebar/20">
          <div>
             <h3 className="text-xl font-black text-text-main uppercase tracking-tighter">Ops Notifications</h3>
             <p className="text-[10px] font-bold text-text-light/50 uppercase tracking-widest mt-1">Operational Feed</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-border-slate flex items-center justify-center text-text-light hover:text-text-main">
             <X size={18} />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-sidebar/5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
               <Bell size={48} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No active transmissions detected.</p>
            </div>
          ) : (
            notifications.map((n) => (
               <div 
                 key={n.id} 
                 className={`p-5 rounded-[24px] border border-border-slate transition-all hover:bg-sidebar/40 group ${n.read ? 'bg-transparent opacity-60' : 'bg-sidebar/30 border-primary-blue/20 shadow-lg'}`}
               >
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'invoice_sent' ? 'bg-primary-blue/10 text-primary-blue' : 'bg-accent-green/10 text-accent-green'}`}>
                        {n.type === 'invoice_sent' ? <FileText size={18} /> : <Zap size={18} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-text-main uppercase mb-1">{n.title}</p>
                        <p className="text-[11px] text-text-light font-medium leading-relaxed mb-4">{n.message}</p>
                        
                        {!n.read && n.type === 'invoice_sent' && (
                          <button 
                            onClick={() => onAction(n)}
                            className="w-full py-2.5 bg-primary-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                          >
                             Review Invoice
                          </button>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-slate/5">
                           <span className="text-[8px] font-bold text-text-light/30 uppercase">{new Date(n.timestamp?.seconds * 1000).toLocaleTimeString()}</span>
                           {!n.read && <div className="w-1.5 h-1.5 bg-primary-blue rounded-full shadow-lg shadow-blue-500/50" />}
                        </div>
                     </div>
                  </div>
               </div>
            ))
          )}
       </div>
    </div>
  );
}

function InvoiceApprovalModal({ 
  isOpen, 
  onClose, 
  invoice, 
  onApprove, 
  onDispute 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  invoice: Invoice, 
  onApprove: (i: Invoice) => void,
  onDispute: (i: Invoice) => void
}) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-black/60">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="w-full max-w-lg bg-card-bg border border-border-slate rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="p-8 border-b border-border-slate flex items-center justify-between bg-sidebar/20">
             <div>
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">Electronic Invoice</h3>
                <p className="text-[10px] font-black text-primary-blue uppercase tracking-widest mt-1">ID: {invoice.id || 'Pending System Sync'}</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl border border-border-slate flex items-center justify-center text-text-light hover:text-text-main transition-all">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             {/* Header Info */}
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-3">Service Provider</p>
                   <p className="text-sm font-black text-text-main uppercase">{invoice.providerName}</p>
                   <p className="text-[10px] font-bold text-text-light/60 mt-1 uppercase">Verified Identity Checked</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-3">Client Recipient</p>
                   <p className="text-sm font-black text-text-main uppercase">{invoice.clientName}</p>
                   <p className="text-[10px] font-bold text-text-light/60 mt-1 uppercase tracking-tighter">{auth.currentUser?.email}</p>
                </div>
             </div>

             {/* Description */}
             <div className="p-6 bg-sidebar/30 border border-border-slate rounded-3xl">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-4">Operational Summary</p>
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue">
                      <Zap size={22} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-text-main uppercase leading-tight">{invoice.description}</p>
                      <p className="text-[10px] text-text-light font-bold mt-2 uppercase tracking-widest">Completed: {new Date(invoice.timestamp?.seconds * 1000).toLocaleString()}</p>
                   </div>
                </div>
             </div>

             {/* Financial Ledger */}
             <div className="space-y-4">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-6 border-l-2 border-primary-blue pl-4">Financial Ledger</p>
                <div className="space-y-3 px-2">
                   <div className="flex justify-between items-center pb-3 border-b border-border-slate/10">
                      <span className="text-xs font-bold text-text-light uppercase tracking-widest">Base Rate (Specialist)</span>
                      <span className="text-sm font-black text-text-main">Ksh {invoice.amount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pb-3 border-b border-border-slate/10">
                      <span className="text-xs font-bold text-text-light uppercase tracking-widest">Infrastructure Fee (10%)</span>
                      <span className="text-sm font-black text-text-main">Ksh {invoice.platformFee.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-black text-text-main uppercase">Grand Total Aggregate</span>
                      <span className="text-2xl font-black text-primary-blue">Ksh {invoice.total.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Integrity Statement */}
             <div className="p-5 bg-accent-green/5 border border-accent-green/10 rounded-2xl flex items-center gap-4">
                <ShieldCheck size={20} className="text-accent-green" />
                <p className="text-[10px] font-bold text-accent-green/80 uppercase leading-relaxed">This invoice is mathematically verified. Approval will trigger an instant sovereign transfer of funds.</p>
             </div>
          </div>

          <div className="p-8 border-t border-border-slate bg-sidebar/20 flex flex-col gap-3">
             <button 
               onClick={() => onApprove(invoice)}
               className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                <CheckCircle2 size={18} />
                Authorize & Disburse Funds
             </button>
             <button 
               onClick={() => onDispute(invoice)}
               className="w-full py-4 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-500/10 rounded-2xl transition-all"
             >
                Flag Incident / Dispute Charges
             </button>
          </div>
       </motion.div>
    </div>
  );
}

function CalendarGrid({ bookings }: { bookings: Booking[] }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const currentMonth = "April 2026";

  return (
    <div className="w-full">
       <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-text-main">{currentMonth}</h3>
          <div className="flex gap-2">
             <button className="p-2 border border-border-slate rounded-lg text-text-light hover:text-text-main transition-colors group">
                <ChevronRight size={18} className="rotate-180 group-active:scale-90" />
             </button>
             <button className="p-2 border border-border-slate rounded-lg text-text-light hover:text-text-main transition-colors group">
                <ChevronRight size={18} className="group-active:scale-90" />
             </button>
          </div>
       </div>

       <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-text-light uppercase tracking-widest py-2">
               {day}
            </div>
          ))}
          {/* Simple spacer for April 2026 starting on Wednesday */}
          <div className="col-span-3"></div>
          {days.map(day => {
            const dayBookings = bookings.filter(b => b.date.getDate() === day);
            return (
              <div key={day} className={`aspect-square p-2 border border-border-slate/10 rounded-xl transition-all ${dayBookings.length > 0 ? 'bg-primary-blue/5 border-primary-blue/20' : 'hover:bg-white/5'}`}>
                 <span className={`text-xs font-bold ${dayBookings.length > 0 ? 'text-primary-blue' : 'text-text-main'}`}>{day}</span>
                 {dayBookings.map(b => (
                    <div key={b.id} className="mt-1 p-1 bg-primary-blue rounded-md text-[8px] font-black text-white truncate shadow-sm">
                       {b.time} - {b.category}
                    </div>
                 ))}
              </div>
            );
          })}
       </div>
    </div>
  );
}

function BookingModal({ isOpen, onClose, provider, onConfirm, onNavigateToWaitlist }: { isOpen: boolean, onClose: () => void, provider: Provider, onConfirm: (b: Booking) => void, onNavigateToWaitlist: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentScheduled, setPaymentScheduled] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const times = ["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const feePercent = provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5;
      const commission = (provider.pricePerHour * feePercent) / 100;
      const totalPrice = provider.pricePerHour + commission;

      // Milestone Logic based on Category & Tier
      const milestones: Milestone[] = [
        { id: 'm1', label: 'Security Deposit (Escrow)', status: 'locked', amount: totalPrice * 0.3 },
        { id: 'm2', label: 'Service Commencement', status: 'pending', amount: totalPrice * 0.2 },
        { id: 'm3', label: 'Final Quality Release', status: 'pending', amount: totalPrice * 0.5 }
      ];
      
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        providerId: provider.id,
        clientId: 'current-user-id',
        date: selectedDate,
        time: selectedTime,
        category: provider.category,
        status: 'pending',
        price: totalPrice,
        paymentScheduled: paymentScheduled,
        milestones: milestones
      };
      setConfirmedBooking(newBooking);
      onConfirm(newBooking);
      setStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
       />
       <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-sidebar rounded-[32px] md:rounded-[40px] border border-border-slate overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
             <header className="flex items-center justify-between mb-8 text-left">
                <div>
                   <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
                      {step === 3 ? 'Confirmation' : 'Booking'}
                   </h2>
                   <p className="text-text-light text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Nairobi SkillGrid Network</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 border border-border-slate rounded-full flex items-center justify-center text-text-light hover:text-text-main transition-colors">
                   <X size={20} />
                </button>
             </header>

             {step === 1 && (
               <div className="space-y-8 text-left">
                  <section>
                     <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4">1. Select Date</h3>
                     <SimpleDatePicker onSelect={setSelectedDate} selected={selectedDate} />
                  </section>
                  <section>
                     <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4">2. Select Time</h3>
                     <div className="flex flex-wrap gap-2">
                        {times.map(t => (
                          <button 
                            key={t} onClick={() => setSelectedTime(t)}
                            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-2xl border text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                              selectedTime === t 
                                ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-sidebar/50 border-border-slate text-text-light hover:border-text-light'
                            }`}
                          >
                             {t}
                          </button>
                        ))}
                     </div>
                  </section>
                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(2)}
                    className="w-full py-4 md:py-5 bg-primary-blue text-white rounded-2xl md:rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 disabled:opacity-30 transition-all active:scale-95"
                  >
                     Review & Confirm
                  </button>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-6 md:space-y-8 text-left">
                  <section className="bg-primary-blue/5 border border-primary-blue/20 rounded-2xl md:rounded-3xl p-5 md:p-6">
                     <h4 className="text-[10px] font-black text-primary-blue uppercase tracking-widest mb-4">Review Appointment</h4>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                              <Sparkles size={18} />
                           </div>
                           <div>
                              <p className="text-[8px] md:text-[10px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Service Type</p>
                              <p className="text-base font-black text-text-main uppercase">{provider.category} Specialist</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="flex items-start gap-3">
                              <Calendar size={16} className="text-primary-blue mt-0.5" />
                              <div>
                                 <p className="text-[8px] md:text-[9px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Date</p>
                                 <p className="text-[12px] md:text-sm font-bold text-text-main">{selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-3">
                              <Clock size={16} className="text-primary-blue mt-0.5" />
                              <div>
                                 <p className="text-[8px] md:text-[9px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Arrival</p>
                                 <p className="text-[12px] md:text-sm font-bold text-text-main">{selectedTime}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="bg-sidebar/30 border border-border-slate rounded-2xl md:rounded-3xl p-5 md:p-6">
                     <h4 className="text-[10px] font-black text-text-light uppercase tracking-widest mb-4">Service Invoice</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between">
                           <span className="text-[12px] md:text-sm text-text-light">Base Rate</span>
                           <span className="text-[12px] md:text-sm font-bold text-text-main">Ksh {provider.pricePerHour.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pb-3 border-b border-border-slate/10">
                           <span className="text-[11px] md:text-sm text-text-light">Platform {provider.tier} Fee</span>
                           <span className="text-[12px] md:text-sm font-bold text-text-main">Ksh {((provider.pricePerHour * (provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5)) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-3">
                           <span className="text-sm md:text-base font-black text-text-main uppercase">Grand Total</span>
                           <span className="text-lg md:text-xl font-black text-primary-blue">
                              Ksh {(provider.pricePerHour + (provider.pricePerHour * (provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5)) / 100).toLocaleString()}
                            </span>
                        </div>
                     </div>
                  </section>

                  <section>
                      <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4 pr-2">3. Payment Schedule</h3>
                      <button 
                        onClick={() => setPaymentScheduled(!paymentScheduled)}
                        className={`w-full p-6 border rounded-3xl flex items-center justify-between group transition-all ${
                          paymentScheduled ? 'bg-accent-green/10 border-accent-green/50' : 'bg-sidebar/50 border-border-slate hover:border-accent-green/30'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${paymentScheduled ? 'bg-accent-green text-white shadow-lg' : 'bg-sidebar border border-border-slate text-text-light group-hover:text-accent-green'}`}>
                               <Wallet size={24} />
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-black text-text-main uppercase tracking-tight">Schedule M-Pesa Payment</p>
                               <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">Payment will be triggered automatically</p>
                            </div>
                         </div>
                         <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${paymentScheduled ? 'bg-accent-green border-accent-green text-white' : 'border-border-slate'}`}>
                            {paymentScheduled && <Check size={14} />}
                         </div>
                      </button>
                  </section>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="px-8 py-5 border border-border-slate text-text-light rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:text-text-main transition-colors">
                       Back
                    </button>
                    <button 
                      onClick={handleConfirm}
                      className="flex-1 py-5 bg-primary-blue text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                       Confirm Booking
                    </button>
                  </div>
               </div>
             )}

             {step === 3 && confirmedBooking && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center pb-6">
                  <div className="flex justify-center">
                     <div className="w-24 h-24 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center shadow-lg shadow-accent-green/20">
                        <CheckCircle2 size={48} />
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-text-main uppercase italic">Booking Secured</h3>
                     <p className="text-text-light text-[10px] font-bold uppercase tracking-widest mt-2 px-4 py-1.5 bg-sidebar-light/5 border border-border-slate/10 rounded-lg inline-block">
                        ID: <span className="text-primary-blue font-black tracking-widest">{confirmedBooking.id}</span>
                     </p>
                  </div>
                  
                  <div className="bg-sidebar-dark/5 border border-border-slate rounded-3xl p-6 space-y-4 text-left">
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Expert Specialist</span>
                        <span className="text-xs font-black text-text-main uppercase">{provider.name}</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Service Domain</span>
                        <span className="text-xs font-black text-text-main uppercase">{provider.category}</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Confirmed Slot</span>
                        <span className="text-xs font-black text-text-main uppercase">{confirmedBooking.time} | {confirmedBooking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Total Committed</span>
                        <span className="text-xs font-black text-primary-blue uppercase italic">Ksh {confirmedBooking.price.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <button 
                        onClick={() => {
                           onNavigateToWaitlist();
                           onClose();
                        }}
                        className="w-full py-5 bg-primary-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        Track Status in Waitlist
                        <ArrowRight size={16} />
                     </button>
                     <button 
                        onClick={onClose}
                        className="w-full text-text-light font-black text-[10px] uppercase tracking-[0.2em] hover:text-text-main transition-colors opacity-60 hover:opacity-100"
                     >
                        Finalize & Close
                     </button>
                  </div>
               </motion.div>
             )}
          </div>
       </motion.div>
    </div>
  );
}

function SimpleDatePicker({ onSelect, selected }: { onSelect: (d: Date) => void, selected: Date | null }) {
  const [currentDate] = useState(new Date());
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(currentDate.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
       {days.map(d => {
         const isSelected = selected?.toDateString() === d.toDateString();
         return (
           <button 
            key={d.toDateString()} 
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border transition-all ${
              isSelected 
                ? 'bg-primary-blue border-primary-blue text-white shadow-xl shadow-blue-500/20' 
                : 'bg-sidebar/50 border-border-slate text-text-light hover:border-text-light'
            }`}
           >
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-lg font-black">{d.getDate()}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
           </button>
         );
       })}
    </div>
  );
}

function ProviderProfileDetail({ provider, onClose, onAddBooking, onRecommend, setActiveTab }: { provider: Provider, onClose: () => void, onBook?: () => void, onAddBooking: (b: Booking) => void, onRecommend: () => void, setActiveTab: (t: string) => void }) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [recommended, setRecommended] = useState(false);

  const handleRecommend = () => {
    if (!recommended) {
      setRecommended(true);
      onRecommend();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col md:flex-row bg-sidebar overflow-y-auto md:overflow-hidden"
    >
      {/* Sidebar: Media & Quick Actions */}
      <div className="w-full md:w-1/2 lg:w-[45%] h-[45vh] md:h-full relative overflow-hidden bg-text-main shrink-0">
         <motion.img 
            initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            src={provider.image} 
            className="absolute inset-0 w-full h-full object-cover opacity-80" 
            referrerPolicy="no-referrer" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-transparent to-transparent md:bg-gradient-to-r"></div>
         
         <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-sidebar transition-all z-40"
         >
            <ChevronLeft size={24} />
         </button>

         <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 right-6 md:right-12 z-20">
            <div className="flex items-center gap-2 md:gap-3 mb-4">
               <span className="px-3 py-1 bg-primary-blue text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg">Verified Expert</span>
               {provider.isAvailable && <span className="px-3 py-1 bg-accent-green text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg">Available</span>}
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl">{provider.name}</h2>
            
            <div className="flex flex-wrap gap-4 md:gap-6">
               <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Rating</span>
                  <div className="flex items-center gap-2 text-xl md:text-2xl font-black text-white">
                     <Star size={18} md:size={20} className="text-yellow-500" fill="currentColor" /> {provider.rating}
                  </div>
               </div>
               <div className="h-8 md:h-10 w-px bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Base Rate</span>
                  <div className="text-xl md:text-2xl font-black text-white">Ksh {provider.pricePerHour.toLocaleString()}</div>
               </div>
               <div className="h-8 md:h-10 w-px bg-white/10 hidden md:block"></div>
               <div className="flex flex-col hidden md:flex">
                  <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Exp</span>
                  <div className="text-xl md:text-2xl font-black text-white">4+ Yrs</div>
               </div>
            </div>
         </div>
      </div>

      {/* Content: Detailed Info */}
      <div className="flex-1 md:h-full overflow-y-auto p-6 md:p-12 lg:p-20 space-y-12 md:space-y-16">
         <section className="text-left">
            <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-6 pl-1 border-l-2 border-primary-blue">Specialist Profile</h3>
            <div className="mb-8 max-w-md p-5 md:p-6 bg-sidebar/20 border border-border-slate rounded-3xl">
                <ReputationBar 
                  rating={provider.rating} 
                  reliability={provider.reliability} 
                  flaggedCount={provider.flaggedCount} 
                  label="Verified Specialist Reliability"
                />
            </div>
            <p className="text-lg md:text-xl font-medium text-text-main leading-relaxed">
               {provider.bio}. Certified specialist in {provider.category} services across Nairobi. Committed to high-quality craftsmanship and professional reliability.
            </p>
         </section>

         <section>
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8">Expertise & Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                  { title: `Full ${provider.category} Setup`, price: `Ksh ${provider.pricePerHour * 2}` },
                  { title: 'Emergency Repair', price: 'Ksh 1,500' },
                  { title: 'System Maintenance', price: `Ksh ${provider.pricePerHour}` },
                  { title: 'Home Consultation', price: 'Ksh 500' },
               ].map((svc, i) => (
                  <div key={i} className="p-6 bg-sidebar/20 border border-border-slate rounded-3xl flex items-center justify-between group hover:bg-sidebar transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                           <Sparkles size={18} />
                        </div>
                        <span className="text-sm font-bold text-text-main">{svc.title}</span>
                     </div>
                     <span className="text-xs font-black text-text-light">{svc.price}</span>
                  </div>
               ))}
            </div>
         </section>

         <section>
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8">Client Testimonials</h4>
            <div className="space-y-6">
               {(provider.testimonials && provider.testimonials.length > 0) ? provider.testimonials.map((review, i) => (
                  <div key={i} className="pb-6 border-b border-border-slate/10">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-text-main uppercase tracking-tight">{review.writer}</span>
                        <div className="flex gap-0.5">
                           {Array.from({ length: review.rating }).map((_, r) => (
                              <Star key={r} size={10} className="text-yellow-500" fill="currentColor" />
                           ))}
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-text-light leading-relaxed italic pr-4">"{review.text}"</p>
                        <span className="text-[8px] font-black text-text-light/40 uppercase whitespace-nowrap">{review.date}</span>
                     </div>
                  </div>
               )) : (
                  <div className="p-8 border border-dashed border-border-slate rounded-3xl text-center">
                     <p className="text-xs text-text-light font-bold uppercase tracking-widest">No verified testimonials yet.</p>
                  </div>
               )}
            </div>
         </section>

         {provider.reports && provider.reports.length > 0 && (
           <section>
              <div className="flex items-center gap-3 mb-8">
                 <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Transparency Report</h4>
                 <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase">Incident Log</div>
              </div>
              <div className="space-y-4">
                 {provider.reports.map((report) => (
                    <div key={report.id} className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl flex items-start gap-4">
                       <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-text-main uppercase tracking-tight">Verified Incident</span>
                             <span className="text-[8px] font-black text-text-light/40 uppercase">{report.date}</span>
                          </div>
                          <p className="text-xs text-text-light font-medium leading-relaxed">{report.reason}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${report.status === 'reviewed' ? 'bg-accent-green/10 text-accent-green' : 'bg-amber-500/10 text-amber-500'}`}>
                                {report.status}
                             </span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
         )}

         <div className="pt-10 flex gap-4">
            <button 
               onClick={() => setIsBookingModalOpen(true)}
               disabled={!provider.isAvailable}
               className={`flex-1 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl ${
                  provider.isAvailable 
                     ? 'bg-primary-blue text-white shadow-blue-500/30 hover:scale-[1.02] active:scale-95' 
                     : 'bg-text-light/10 text-text-light/40 cursor-not-allowed'
               }`}
            >
               {provider.isAvailable ? 'Reserve Specialist Now' : 'Currently Fully Booked'}
            </button>
            <button 
              onClick={handleRecommend}
              className={`px-8 py-6 border rounded-[32px] flex flex-col items-center justify-center transition-all ${recommended ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'border-border-slate text-text-light hover:text-primary-blue hover:border-primary-blue'}`}
            >
               <Users size={24} />
               <span className="text-[7px] font-black uppercase tracking-widest mt-1">{recommended ? 'Referred' : 'Refer'}</span>
            </button>
            <button className="w-20 py-6 border border-border-slate rounded-[32px] flex items-center justify-center text-text-light hover:text-text-main transition-all">
               <Heart size={24} />
            </button>
         </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        provider={provider} 
        onConfirm={(booking) => {
           onAddBooking(booking);
        }}
        onNavigateToWaitlist={() => setActiveTab('waitlist')}
      />
    </motion.div>
  );
}

function WalletView() { 
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-full w-full p-8 md:p-12 lg:p-20 overflow-y-auto bg-card-bg/50"
    >
      <header className="mb-12">
        <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Wallet & Financials</h2>
        <p className="text-text-light text-sm font-medium">Manage your earnings, payouts, and service commissions.</p>
      </header>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-8 bg-sidebar border border-border-slate rounded-[40px] shadow-xl">
           <p className="text-[10px] font-black text-primary-blue uppercase tracking-[0.4em] mb-4">Available Balance</p>
           <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-text-main leading-none">Ksh 12,450</span>
              <span className="text-xs font-bold text-accent-green uppercase mb-1">.00</span>
           </div>
           <button className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              Initiate Payout
           </button>
        </div>

        <div className="p-8 bg-sidebar/40 border border-border-slate rounded-[40px]">
           <p className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-4">Account Analytics</p>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Total Earnings</span>
                 <span className="text-sm font-black text-text-main uppercase">Ksh 84,200</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Platform Fees Paid</span>
                 <span className="text-sm font-black text-text-main uppercase">Ksh 4,050</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Completed Jobs</span>
                 <span className="text-sm font-black text-text-main uppercase">32 Jobs</span>
              </div>
           </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Recent Activity Ledger</h3>
           <button className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline">Download Statements</button>
        </div>
        <div className="space-y-4">
           {[
             { label: 'Booking Release #4412', amount: 3500, type: 'credit', status: 'Completed', date: 'Jul 12, 2024' },
             { label: 'Platform Commission (10%)', amount: -350, type: 'debit', status: 'Completed', date: 'Jul 12, 2024' },
             { label: 'Withdrawal to M-PESA', amount: -5000, type: 'debit', status: 'Processing', date: 'Jul 10, 2024' },
             { label: 'Booking Multi-tier Bonus', amount: 500, type: 'credit', status: 'Completed', date: 'Jul 08, 2024' },
           ].map((tx, i) => (
             <div key={i} className="p-6 bg-sidebar/30 border border-border-slate rounded-3xl flex items-center justify-between group hover:bg-sidebar transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                   </div>
                   <div>
                      <p className="text-sm font-black text-text-main uppercase">{tx.label}</p>
                      <p className="text-[9px] text-text-light font-bold uppercase tracking-widest mt-0.5">{tx.date}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-accent-green' : 'text-text-main'}`}>
                      {tx.type === 'credit' ? '+' : '-'} Ksh {Math.abs(tx.amount).toLocaleString()}
                   </p>
                   <p className="text-[8px] font-bold text-text-light/40 uppercase tracking-widest mt-1">{tx.status}</p>
                </div>
             </div>
           ))}
        </div>
      </section>
    </motion.div>
  );
}

function ChatView() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync chat users (people one has interacted with)
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', auth.currentUser.uid)
    );
    const q2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', auth.currentUser.uid)
    );

    const usersSet = new Set<string>();
    const usersMap = new Map<string, any>();

    const unsub = onSnapshot(
      query(
        collection(db, 'messages'),
        or(
          where('senderId', '==', auth.currentUser.uid),
          where('receiverId', '==', auth.currentUser.uid)
        )
      ),
      (snapshot) => {
        const docs = snapshot.docs.map(doc => doc.data());
        
        const involvedIds = docs.reduce((acc: string[], curr: any) => {
          const otherId = curr.senderId === auth.currentUser?.uid ? curr.receiverId : curr.senderId;
          if (!acc.includes(otherId)) acc.push(otherId);
          return acc;
        }, []);

        // Fetch user details for these IDs
        involvedIds.forEach(async (id: string) => {
          if (!usersMap.has(id)) {
            const userSnap = await getDoc(doc(db, 'users', id));
            if (userSnap.exists()) {
              usersMap.set(id, { id, ...userSnap.data() });
              setChatUsers(Array.from(usersMap.values()));
            }
          }
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Sync messages for active chat
  useEffect(() => {
    if (!auth.currentUser || !activeChatId) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [auth.currentUser.uid, activeChatId]),
      where('receiverId', 'in', [auth.currentUser.uid, activeChatId])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
      
      setMessages(filtered);
    });

    return () => unsub();
  }, [activeChatId]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: auth.currentUser.uid,
        receiverId: activeChatId,
        text: messageInput,
        timestamp: serverTimestamp(),
        read: false
      });
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const currentChatUser = chatUsers.find(u => u.id === activeChatId) || chatUsers[0];

  return (
    <div className="h-full flex divide-x divide-border-slate transition-all duration-500 overflow-hidden">
       {/* Chat List */}
       <div className={`w-full md:w-80 flex flex-col bg-sidebar/10 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 border-b border-border-slate">
             <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-4">Conversations</h3>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                <input 
                  type="text"
                  placeholder="Filter channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-sidebar/20 border border-border-slate rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-main focus:outline-none focus:border-primary-blue transition-all"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {loading && <div className="p-8 text-center text-[10px] font-black uppercase text-text-light opacity-50">Syncing Secure Comms...</div>}
             {!loading && chatUsers.length === 0 && (
               <div className="p-8 text-center">
                  <p className="text-[10px] font-black uppercase text-text-light/40 tracking-widest">No active secure channels</p>
               </div>
             )}
             {chatUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
               <button 
                key={u.id} 
                onClick={() => { setActiveChatId(u.id); setShowMobileDetail(true); }}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeChatId === u.id ? 'bg-primary-blue text-white shadow-xl' : 'text-text-light hover:bg-sidebar/40'}`}
               >
                  <img src={u.image || `https://picsum.photos/seed/${u.uid}/200`} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="text-left flex-1 min-w-0">
                     <p className={`font-bold text-sm truncate ${activeChatId === u.id ? 'text-white' : 'text-text-main'}`}>{u.name}</p>
                     <p className={`text-[9px] uppercase font-bold tracking-widest ${activeChatId === u.id ? 'text-white/60' : 'text-text-light/40'}`}>Specialist</p>
                  </div>
               </button>
             ))}
          </div>
       </div>

       {/* Chat Window */}
       <div className={`flex-1 flex-col ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
          {activeChatId && currentChatUser ? (
            <>
              <header className="px-6 md:px-8 py-6 border-b border-border-slate flex items-center justify-between bg-sidebar/20">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowMobileDetail(false)}
                      className="md:hidden w-10 h-10 rounded-xl border border-border-slate flex items-center justify-center text-text-light"
                    >
                       <ChevronLeft size={20} />
                    </button>
                    <img src={currentChatUser.image || `https://picsum.photos/seed/${currentChatUser.uid}/200`} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                       <h4 className="text-sm md:text-lg font-bold text-text-main truncate">{currentChatUser.name}</h4>
                       <p className="text-[10px] font-black text-accent-green uppercase tracking-widest">Secure Connection Active</p>
                    </div>
                 </div>
                 <div className="flex gap-3 md:gap-4 text-text-light/40 shrink-0">
                    <Phone size={18} className="cursor-pointer hover:text-text-main" />
                    <MoreVertical size={18} className="cursor-pointer hover:text-text-main" />
                 </div>
              </header>

              <div className="flex-1 p-6 md:p-8 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sidebar/5 via-transparent to-transparent">
                 {messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <MessageSquare size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Encryption Established</p>
                   </div>
                 )}
                 {messages.map((m: any) => (
                    <div key={m.id}>
                      <ChatMessage 
                        isUser={m.senderId === auth.currentUser?.uid} 
                        text={m.text} 
                      />
                    </div>
                  ))}
              </div>

              <div className="p-6 md:p-8 border-t border-border-slate bg-sidebar/5 backdrop-blur-sm">
                 <form 
                   onSubmit={handleSendMessage}
                   className="relative"
                 >
                    <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a secure message..." 
                      className="w-full bg-sidebar/20 border border-border-slate rounded-[24px] py-4 px-6 md:px-8 text-text-main text-sm focus:outline-none focus:border-primary-blue transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="absolute right-2 top-2 w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/10 transition-transform active:scale-90 disabled:opacity-50"
                    >
                       <Send size={16} />
                    </button>
                 </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20">
               <div className="w-32 h-32 bg-border-slate rounded-full flex items-center justify-center mb-6">
                  <Briefcase size={48} className="text-text-main" />
               </div>
               <h4 className="text-2xl font-black text-text-main uppercase">Select Transmission</h4>
               <p className="text-xs font-bold text-text-light mt-2 uppercase tracking-widest">Operational channels only</p>
            </div>
          )}
       </div>
    </div>
  );
}

function ChatMessage({ text, isUser }: { text: string, isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
       <div className={`max-w-[70%] p-4 rounded-[22px] text-xs leading-relaxed ${isUser ? 'bg-primary-blue text-white rounded-br-none shadow-lg' : 'bg-sidebar/30 text-text-main rounded-bl-none border border-border-slate'}`}>
          {text}
       </div>
    </div>
  );
}

function ProfileView({ role, bookings, referralPoints, onSignOut }: { role: UserRole, bookings: Booking[], referralPoints?: number, onSignOut: () => void }) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Booking | null>(null);

  // Helper to get provider for a booking
  const getBookingProvider = (providerId: string) => {
    return MOCK_PROVIDERS.find(p => p.id === providerId) || MOCK_PROVIDERS[0];
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col md:flex-row md:divide-x divide-border-slate overflow-y-auto relative">
       {/* Sidebar / Stats */}
       <div className="w-full md:w-1/3 p-6 md:p-8 lg:p-12 flex flex-col items-center text-center bg-sidebar/5 shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-[32px] md:rounded-[36px] p-1 border-2 border-primary-blue/30 mb-6 bg-gradient-to-br from-primary-blue/10 to-transparent">
             <img src={`https://picsum.photos/seed/${role}/200/200`} className="w-full h-full rounded-[28px] md:rounded-[32px] object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase">Michael Ochieng</h3>
             {role === 'provider' && <ShieldCheck size={18} className="text-accent-green" />}
          </div>
          <p className="text-[9px] text-text-light font-black uppercase tracking-[0.3em] mb-8">{role} Account</p>
          
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
             <div className="p-4 md:p-5 bg-sidebar/40 rounded-[28px] md:rounded-3xl border border-border-slate">
                <span className="block text-xl md:text-2xl font-black text-text-main">{role === 'client' ? bookings.length : '158'}</span>
                <span className="text-[8px] font-bold text-text-light uppercase tracking-widest">{role === 'client' ? 'Active Bookings' : 'Completed'}</span>
             </div>
             <div className="p-5 bg-sidebar/40 rounded-3xl border border-border-slate">
                <span className="block text-2xl font-black text-text-main">{role === 'client' ? '4.9' : '4.95'}</span>
                <span className="text-[8px] font-bold text-text-light uppercase tracking-widest">Rating</span>
             </div>
          </div>

          <div className="w-full text-left bg-sidebar/40 p-6 border border-border-slate rounded-3xl text-sidebar-foreground">
              <ReputationBar 
                rating={4.95} 
                reliability={role === 'client' ? 100 : 98} 
                flaggedCount={0} 
                label="Self Account Reputation"
              />
          </div>
       </div>

       {/* Content Area */}
       <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.3em] pl-2">Scheduled Appointments</h4>
             <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-3 py-1 rounded-full uppercase">Verified</span>
          </div>
          
          <div className="space-y-3 mb-10">
             {bookings.length === 0 ? (
               <div className="p-8 border-2 border-dashed border-border-slate rounded-[32px] text-center">
                  <p className="text-xs text-text-light font-bold uppercase tracking-widest">No active bookings found.</p>
               </div>
             ) : (
               bookings.slice().reverse().map(b => (
                 <div key={b.id} className="pb-3 flex flex-col gap-3">
                   <div className="p-5 bg-card-bg border border-border-slate rounded-[28px] flex items-center justify-between group hover:bg-sidebar transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${b.status === 'completed' ? 'bg-accent-green' : 'bg-primary-blue'}`}>
                            {b.status === 'completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                         </div>
                         <div>
                            <h5 className="text-sm font-black text-text-main uppercase">{b.category} Appointment</h5>
                            <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">{b.date.toDateString()} @ {b.time}</p>
                         </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                         <span className="text-xs font-black text-text-main">Ksh {b.price.toLocaleString()}</span>
                         <div className="flex items-center gap-2">
                            {b.status === 'completed' ? (
                               <button 
                                 onClick={() => setViewingInvoice(b)}
                                 className="flex items-center gap-1.5 px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-lg border border-primary-blue/20 hover:bg-primary-blue hover:text-white transition-all text-[8px] font-black uppercase tracking-tight"
                               >
                                  <FileText size={10} />
                                  View Invoice
                               </button>
                            ) : (
                               <div className="flex items-center gap-1 justify-end">
                                  <CheckCircle2 size={10} className="text-accent-green" />
                                  <span className="text-[8px] font-bold text-accent-green uppercase tracking-widest">Confirmed</span>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                   
                   {/* Milestones / Escrow Display */}
                   <div className="px-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {b.milestones && b.milestones.map((m, idx) => (
                        <div key={m.id} className="flex items-center shrink-0">
                           <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
                             m.status === 'released' || b.status === 'completed' ? 'bg-accent-green/10 border-accent-green text-accent-green' : 
                             m.status === 'locked' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                             'bg-sidebar border-border-slate text-text-light opacity-40'
                           }`}>
                              <span className="text-[7px] font-black uppercase tracking-widest">{m.label}</span>
                              <span className="text-[8px] font-bold">Ksh {m.amount.toLocaleString()}</span>
                           </div>
                           {idx < b.milestones.length - 1 && <div className="w-4 h-px bg-border-slate/20" />}
                        </div>
                      ))}
                   </div>
                 </div>
               ))
             )}
          </div>

          <InvoiceModal 
            isOpen={!!viewingInvoice} 
            onClose={() => setViewingInvoice(null)} 
            booking={viewingInvoice!}
            provider={viewingInvoice ? getBookingProvider(viewingInvoice.providerId) : MOCK_PROVIDERS[0]}
          />

          {role === 'client' && (
             <section className="mb-10 bg-accent-green p-8 rounded-[40px] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">SkillGrid Elite Circle</h4>
                      <p className="text-xs font-medium opacity-90 leading-relaxed uppercase tracking-widest">Earn 500 points for every specialist you recommend to your network.</p>
                   </div>
                   <div className="px-8 py-4 bg-white text-accent-green rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl">
                      Claim Rewards
                   </div>
                </div>
             </section>
            )}

          <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.3em] mb-4 pl-2">Account Control System</h4>
          
          <ProfileMenuItem icon={CreditCard} label="Payment Methods" sub="Linked M-Pesa & Visa" onClick={() => setActiveModule('payments')} />
          <ProfileMenuItem icon={ShieldCheck} label="Identity Verification" sub="Smile ID Level 2" onClick={() => setActiveModule('identity')} />
          <ProfileMenuItem icon={AlertCircle} label="Dispute Appeal Center" sub="Challenge Platform Flags" onClick={() => setActiveModule('disputes')} />
          <ProfileMenuItem icon={MapPin} label="Saved Address Book" sub="Manage Service Zones" onClick={() => setActiveModule('address')} />
          <ProfileMenuItem icon={Activity} label="Privacy & Security" sub="2FA and Session Control" onClick={() => setActiveModule('security')} />
          
          <div className="pt-8 border-t border-border-slate mt-8">
             <button 
              onClick={onSignOut}
              className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/5 transition-all"
             >
                Sign Out of Platform
             </button>
          </div>
       </div>

       <ProfileModuleModal module={activeModule} onClose={() => setActiveModule(null)} />
    </motion.div>
  );
}

function ProfileModuleModal({ module, onClose }: { module: string | null, onClose: () => void }) {
  if (!module) return null;

  const content = {
    payments: {
      title: 'Payment Methods',
      icon: CreditCard,
      description: 'Manage your linked bank accounts and mobile wallets.',
      items: [
        { label: 'M-PESA Wallet', sub: 'Linked: 2547****1234', active: true },
        { label: 'Visa Card', sub: 'Primary: **** 4412', active: true },
        { label: 'SkillGrid Credits', sub: 'Balance: Ksh 1,200', active: false },
      ]
    },
    identity: {
      title: 'Identity Verification',
      icon: ShieldCheck,
      description: 'Review your platform trust levels and verification status.',
      items: [
        { label: 'Biometric Scan', sub: 'Verified Jun 2024', active: true },
        { label: 'Government ID', sub: 'Verified Jun 2024', active: true },
        { label: 'Criminal Record Check', sub: 'Pending Review', active: false, status: 'warning' },
      ]
    },
    disputes: {
      title: 'Dispute Appeal Center',
      icon: AlertCircle,
      description: 'View and resolve active disputes or system violations.',
      items: [
        { label: 'Late Cancellation Fee', sub: 'Decision: Refunded', active: true, status: 'success' },
        { label: 'Provider No-Show', sub: 'Case #4412 - Resolved', active: true, status: 'info' },
      ]
    },
    address: {
      title: 'Saved Address Book',
      icon: MapPin,
      description: 'Manage the locations where you receive or provide services.',
      items: [
        { label: 'Home - Kilimani', sub: 'Kindaruma Road, Nairobi', active: true },
        { label: 'Office - Westlands', sub: 'Global Trade Center', active: false },
      ]
    },
    security: {
      title: 'Privacy & Security',
      icon: Activity,
      description: 'Control your account safety and access history.',
      items: [
        { label: 'Two-Factor Auth', sub: 'Status: Enabled (SMS)', active: true },
        { label: 'Active Sessions', sub: '2 Devices Logged In', active: true },
        { label: 'Biometric Login', sub: 'Status: Enabled', active: true },
      ]
    }
  }[module as keyof typeof content];

  if (!content) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full h-full md:h-auto md:max-w-md bg-sidebar md:border border-border-slate md:rounded-[40px] shadow-3xl overflow-hidden flex flex-col md:max-h-[80vh]"
        >
          <div className="p-8 border-b border-border-slate flex items-center justify-between bg-sidebar/50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <content.icon size={20} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-text-main uppercase tracking-tight italic">{content.title}</h3>
                   <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">Control Center</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-sidebar/40 border border-border-slate flex items-center justify-center text-text-light hover:text-red-500 transition-colors">
                <X size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
             <div className="bg-primary-blue/5 p-5 rounded-3xl border border-primary-blue/10">
                <p className="text-xs text-text-main font-medium leading-relaxed italic opacity-80">
                   {content.description}
                </p>
             </div>

             <div className="space-y-4">
                {content.items.map((item, i) => (
                  <div 
                    key={i}
                    className="p-5 bg-sidebar/40 border border-border-slate rounded-[28px] flex flex-col gap-4 group hover:bg-sidebar transition-all duration-300"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-2 h-2 rounded-full ${
                             item.status === 'warning' ? 'bg-amber-500' :
                             item.active ? 'bg-accent-green' : 'bg-text-light/20'
                           }`} />
                           <div>
                              <h5 className="text-sm font-bold text-text-main mb-0.5">{item.label}</h5>
                              <p className="text-[10px] text-text-light font-bold uppercase tracking-widest opacity-60">{item.sub}</p>
                           </div>
                        </div>
                        <button className="text-[9px] font-black text-primary-blue bg-primary-blue/10 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-primary-blue hover:text-white transition-all">
                           {item.status === 'warning' ? 'Action' : 'Manage'}
                        </button>
                     </div>
                     
                     {/* Dynamic expansion for "filled" look */}
                     {item.label.includes('Identity') && (
                        <div className="p-4 bg-sidebar rounded-2xl border border-border-slate/50 flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black text-text-main uppercase tracking-widest">Biometric Check</p>
                              <span className="text-[8px] font-black text-accent-green uppercase">Verified</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black text-text-main uppercase tracking-widest">Professional License</p>
                              <span className="text-[8px] font-black text-accent-green uppercase">Cleared</span>
                           </div>
                        </div>
                     )}

                     {item.label.includes('Dispute') && (
                        <div className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl text-center">
                           <AlertCircle size={24} className="text-red-500/30 mx-auto mb-3" />
                           <p className="text-[9px] font-bold text-text-light uppercase tracking-widest leading-relaxed">No active disputes or appeals detected in your operational history.</p>
                        </div>
                     )}

                     {item.label.includes('Home') && (
                        <div className="p-4 bg-sidebar rounded-2xl border border-border-slate/50 flex items-center gap-4">
                           <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green">
                              <MapPin size={16} />
                           </div>
                           <div className="flex-1">
                              <p className="text-[9px] font-black text-text-main uppercase">GPS Lock Active</p>
                              <div className="w-full h-1 bg-border-slate/10 rounded-full mt-1">
                                 <div className="w-full h-full bg-accent-green/40 rounded-full"></div>
                              </div>
                           </div>
                        </div>
                     )}

                     {item.label.includes('Wallet') && (
                        <div className="p-4 bg-primary-blue/5 rounded-2xl border border-primary-blue/10 space-y-2">
                           <div className="flex justify-between items-center">
                              <p className="text-[8px] font-black text-text-light uppercase tracking-widest">Linked Terminal</p>
                              <p className="text-[8px] font-black text-accent-green uppercase">Authorized</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-primary-blue" />
                              <p className="text-[10px] font-mono text-text-main">SF-254-Matrix-88</p>
                           </div>
                        </div>
                     )}
                  </div>
                ))}
             </div>

             <button className="w-full py-5 rounded-3xl border-2 border-dashed border-border-slate text-text-light font-black text-[10px] uppercase tracking-[0.3em] hover:border-primary-blue hover:text-primary-blue transition-all">
                + Add New Vector Entry
             </button>
          </div>

          <div className="p-8 bg-sidebar/20 border-t border-border-slate">
             <button onClick={onClose} className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">
                Save System Config & Exit
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ProfileMenuItem({ icon: Icon, label, sub, onClick }: { icon: any, label: string, sub: string, onClick?: () => void }) {
  return (
     <button 
      onClick={onClick}
      className="w-full p-5 bg-sidebar/20 border border-border-slate rounded-[28px] flex items-center gap-5 group hover:bg-sidebar transition-all duration-300"
     >
        <div className="w-12 h-12 bg-sidebar/40 rounded-2xl flex items-center justify-center text-text-light group-hover:bg-primary-blue group-hover:text-white transition-all border border-border-slate">
           <Icon size={20} />
        </div>
        <div className="flex-1 text-left">
           <h5 className="text-base font-bold text-text-main group-hover:text-primary-blue transition-colors">{label}</h5>
           <p className="text-[10px] text-text-light uppercase tracking-widest font-medium opacity-60">{sub}</p>
        </div>
        <ChevronRight size={16} className="text-text-light/20 group-hover:text-primary-blue transition-colors" />
     </button>
  );
}

function WaitlistView({ bookings, waitlistEntries }: { bookings: Booking[], waitlistEntries: any[] }) {
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="h-full w-full flex flex-col p-6 md:p-10 lg:p-12 overflow-y-auto"
    >
      <header className="mb-10">
        <h2 className="text-3xl font-black text-text-main tracking-tight uppercase">Operational Queues</h2>
        <p className="text-text-light text-[10px] font-bold uppercase tracking-[0.4em] mt-1">Pending Reservations & Waitlist Status</p>
      </header>

      <div className="flex-1 space-y-10">
        {/* Waitlist Entries Section */}
        {waitlistEntries.length > 0 && (
          <section className="space-y-4">
             <h3 className="text-xs font-black text-primary-blue uppercase tracking-[0.3em] mb-4">Priority Waitlists</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waitlistEntries.map(entry => (
                  <div key={entry.id} className="p-6 bg-primary-blue/[0.03] border border-primary-blue/20 rounded-[32px] flex items-center justify-between group hover:bg-primary-blue/[0.05] transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue border border-primary-blue/20">
                           <Clock size={24} />
                        </div>
                        <div>
                           <h4 className="text-base font-black text-text-main uppercase tracking-tight">Tier: {entry.tier}</h4>
                           <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">Specialist ID: {entry.providerId.slice(0, 8)}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary-blue/10 italic">In Queue</span>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Pending Bookings Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Pending Confirmations</h3>
          {pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border-slate rounded-[40px] text-center bg-sidebar/5">
                <div className="w-20 h-20 bg-sidebar border border-border-slate rounded-3xl flex items-center justify-center text-text-light/20 mb-6">
                   <History size={32} />
                </div>
                <h3 className="text-xl font-black text-text-main uppercase mb-2">No active reservations</h3>
                <p className="text-xs text-text-light max-w-[240px]">Reserved service slots will appear here awaiting specialist confirmation.</p>
            </div>
          ) : (
            pendingBookings.map(item => (
              <div key={item.id} className="p-6 bg-sidebar border border-border-slate rounded-[32px] flex items-center justify-between group hover:bg-white/[0.02] transition-all shadow-sm">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                       <ShieldCheck size={24} />
                    </div>
                    <div>
                       <h4 className="text-base font-black text-text-main uppercase tracking-tight">{item.category} Slot</h4>
                       <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">{item.date.toDateString()} @ {item.time}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/10">Waitlisted</span>
                    <p className="mt-2 text-xs font-black text-text-main uppercase tracking-tighter">Ksh {item.price.toLocaleString()}</p>
                 </div>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="mt-10 p-6 bg-primary-blue/5 border border-primary-blue/20 rounded-[32px] flex items-center gap-5">
         <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <Zap size={20} />
         </div>
         <div>
            <h5 className="text-xs font-black text-text-main uppercase tracking-tight">Priority Escalation</h5>
            <p className="text-[9px] text-text-light leading-relaxed">Upgrade to SkillGrid Gold to jump waitlists and get instant priority matching for urgent tasks.</p>
         </div>
      </div>
    </motion.div>
  );
}

function TierSelector({ current, onChange, isSidebar, isMobile }: { current: TierLevel | 'All', onChange: (t: TierLevel | 'All') => void, isSidebar?: boolean, isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const tiers: (TierLevel | 'All')[] = ['All', 'Basic', 'Premium', 'Luxury'];

  if (isSidebar) {
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center rounded-full border border-border-slate text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all ${
            isMobile ? 'w-10 h-10' : 'w-12 h-12'
          }`}
          title="Filter Tiers"
        >
          <Gem size={isMobile ? 16 : 20} className={isOpen ? 'text-primary-blue' : ''} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: isMobile ? 0 : 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: isMobile ? 0 : 20 }}
                className={`absolute mt-2 w-48 bg-sidebar border border-border-slate rounded-2xl shadow-3xl z-50 p-2 backdrop-blur-xl ${
                  isMobile ? 'right-0' : 'left-full ml-4 bottom-0 origin-left'
                }`}
              >
                <div className="text-[8px] font-black text-text-light uppercase tracking-[0.3em] mb-3 px-3">Service Tiers</div>
                {tiers.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onChange(t);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      current === t ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main hover:bg-white/5'
                    }`}
                  >
                    {t}
                    {current === t && <CheckCircle2 size={12} />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-sidebar border border-border-slate rounded-xl flex items-center gap-3 text-text-main hover:border-primary-blue transition-all group"
      >
        <Filter size={16} className={isOpen ? 'text-primary-blue' : 'text-text-light group-hover:text-primary-blue transition-colors'} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tier: <span className="text-primary-blue">{current}</span></span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-blue' : 'text-text-light'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-sidebar border border-border-slate rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
            >
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onChange(t);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    current === t ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main hover:bg-white/5'
                  }`}
                >
                  {t}
                  {current === t && <CheckCircle2 size={12} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortSelector({ current, onChange, isMobile }: { current: SortOption, onChange: (o: SortOption) => void, isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const options: { id: SortOption, label: string }[] = [
    { id: 'none', label: 'Default' },
    { id: 'rating', label: 'Top Rated' },
    { id: 'price', label: 'Lowest Price' },
    { id: 'distance', label: 'Nearest' },
  ];

  const currentLabel = options.find(o => o.id === current)?.label || 'Sort';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center rounded-full border border-border-slate text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all ${
          isMobile ? 'w-10 h-10' : 'w-12 h-12'
        }`}
        title="Sort Results"
      >
        <Filter size={isMobile ? 16 : 20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: isMobile ? 0 : 20 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              exit={{ opacity: 0, scale: 0.95, x: isMobile ? 0 : 20 }}
              className={`absolute mt-2 w-48 bg-sidebar border border-border-slate rounded-2xl shadow-3xl z-[101] overflow-hidden ${
                isMobile ? 'right-0' : 'left-full ml-4 bottom-0 origin-left'
              }`}
            >
              <div className="p-3 bg-card-bg/50 backdrop-blur-xl">
                <div className="text-[8px] font-black text-text-light uppercase tracking-[0.3em] mb-3 px-3">Discovery Sort</div>
                <div className="flex flex-col gap-1">
                  {options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                      }}
                      className={`px-4 py-3 rounded-xl text-left transition-all group flex items-center justify-between ${
                        current === option.id 
                          ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' 
                          : 'text-text-light hover:text-text-main hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                      {current === option.id && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Common UI Components ---

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error.code === 'permission-denied') {
    const authInfo = auth.currentUser ? {
      userId: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      emailVerified: auth.currentUser.emailVerified,
      isAnonymous: auth.currentUser.isAnonymous,
      providerInfo: auth.currentUser.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      }))
    } : {
      userId: 'not-authenticated',
      email: '',
      emailVerified: false,
      isAnonymous: false,
      providerInfo: []
    };

    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo
    };
    
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

function NotificationBell({ count, onClick }: { count: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="relative w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all"
    >
       <Bell size={20} />
       {count > 0 && (
         <span className="absolute top-2 right-2 w-4 h-4 bg-primary-blue text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-card-bg">
            {count > 9 ? '9+' : count}
         </span>
       )}
    </button>
  );
}

function NavIcon({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-500 group ${
        active ? 'bg-primary-blue text-white shadow-xl shadow-blue-500/20' : 'text-text-light hover:text-text-main'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 3 : 2} />
      {/* Label Tooltip */}
      <span className="absolute left-full ml-4 px-3 py-1 bg-text-main text-sidebar text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50">
        {label}
      </span>
    </button>
  );
}

function MobileNavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
        active ? 'text-primary-blue' : 'text-text-light'
      }`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
        active ? 'bg-primary-blue/10' : ''
      }`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
