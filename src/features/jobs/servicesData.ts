import { 
  Home, Wrench, Truck, Leaf, Heart, BookOpen, 
  Users, Paintbrush, Monitor, Calendar, Dumbbell, 
  Shield, UserCheck, Car, Sparkles, Hotel, 
  Languages, GraduationCap, Briefcase, Coffee, Baby, Flower2, Laptop, Brush 
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  tier: 'Basic' | 'Premium' | 'Luxury' | 'Other';
  status: 'ACTIVE' | 'ON DEMAND';
  rate: string;
  icon: any;
}

export const SERVICES_DATA: ServiceItem[] = [
  // Basic
  { id: 'b1', name: 'Household Support', category: 'Basic', description: 'Reliable help for your daily home tasks and errands.', tier: 'Basic', status: 'ACTIVE', rate: '$15/hr', icon: Home },
  { id: 'b2', name: 'Maintenance & Repairs', category: 'Basic', description: 'Quick fixes and essential maintenance for your property.', tier: 'Basic', status: 'ACTIVE', rate: '$25/hr', icon: Wrench },
  { id: 'b3', name: 'Moving & Logistics', category: 'Basic', description: 'Safe and efficient transport for your belongings.', tier: 'Basic', status: 'ON DEMAND', rate: '$40/project', icon: Truck },
  { id: 'b4', name: 'Outdoor Care', category: 'Basic', description: 'Essential garden and yard maintenance services.', tier: 'Basic', status: 'ACTIVE', rate: '$20/hr', icon: Leaf },
  { id: 'b5', name: 'Pet Care', category: 'Basic', description: 'Caring support for your furry friends when you are away.', tier: 'Basic', status: 'ACTIVE', rate: '$18/hr', icon: Heart },
  { id: 'b6', name: 'Tutoring', category: 'Basic', description: 'Academic support across various subjects and levels.', tier: 'Basic', status: 'ON DEMAND', rate: '$30/hr', icon: BookOpen },

  // Premium
  { id: 'p1', name: 'Premium Staffing', category: 'Premium', description: 'Expertly vetted staff for specialized roles.', tier: 'Premium', status: 'ACTIVE', rate: '$45/hr', icon: Users },
  { id: 'p2', name: 'Renovations & Design', category: 'Premium', description: 'Professional home improvement and aesthetic upgrades.', tier: 'Premium', status: 'ON DEMAND', rate: '$75/hr', icon: Paintbrush },
  { id: 'p3', name: 'IT Consulting', category: 'Premium', description: 'Expert technology solutions for your home or business.', tier: 'Premium', status: 'ACTIVE', rate: '$80/hr', icon: Monitor },
  { id: 'p4', name: 'Event Management', category: 'Premium', description: 'Seamless planning and execution for your special occasions.', tier: 'Premium', status: 'ON DEMAND', rate: '$150/project', icon: Calendar },
  { id: 'p5', name: 'Fitness & Training', category: 'Premium', description: 'Personalized wellness and strength conditioning programs.', tier: 'Premium', status: 'ACTIVE', rate: '$55/hr', icon: Dumbbell },

  // Luxury
  { id: 'l1', name: 'Executive Security', category: 'Luxury', description: 'Elite protection services for high-profile individuals.', tier: 'Luxury', status: 'ACTIVE', rate: '$120/hr', icon: Shield },
  { id: 'l2', name: 'Butler Services', category: 'Luxury', description: 'Professional household management at the highest level.', tier: 'Luxury', status: 'ON DEMAND', rate: '$90/hr', icon: UserCheck },
  { id: 'l3', name: 'Chauffeur', category: 'Luxury', description: 'Private, professional transportation in luxury vehicles.', tier: 'Luxury', status: 'ACTIVE', rate: '$70/hr', icon: Car },
  { id: 'l4', name: 'Wellness & Spa', category: 'Luxury', description: 'Bespoke spa and therapeutic treatments in your home.', tier: 'Luxury', status: 'ON DEMAND', rate: '$200/project', icon: Sparkles },
  { id: 'l5', name: 'Elite Stays', category: 'Luxury', description: 'Curated luxury accommodation and property management.', tier: 'Luxury', status: 'ACTIVE', rate: '$500/night', icon: Hotel },

  // Other Services
  { id: 'o1', name: 'Teaching', category: 'Other', description: 'Professional education and classroom support.', tier: 'Other', status: 'ACTIVE', rate: '$35/hr', icon: GraduationCap },
  { id: 'o2', name: 'Training', category: 'Other', description: 'Vocational and skill-based development programs.', tier: 'Other', status: 'ON DEMAND', rate: '$45/hr', icon: Briefcase },
  { id: 'o3', name: 'Translation', category: 'Other', description: 'Accurate multilingual document and verbal translation.', tier: 'Other', status: 'ACTIVE', rate: '$40/hr', icon: Languages },
  { id: 'o4', name: 'Coaching', category: 'Other', description: 'Personal and professional life guidance.', tier: 'Other', status: 'ACTIVE', rate: '$60/hr', icon: Coffee },
  { id: 'o5', name: 'Babysitting', category: 'Other', description: 'Safe and engaging childcare services.', tier: 'Other', status: 'ACTIVE', rate: '$20/hr', icon: Baby },
  { id: 'o6', name: 'Gardening', category: 'Other', description: 'Expert plant care and landscape maintenance.', tier: 'Other', status: 'ACTIVE', rate: '$25/hr', icon: Flower2 },
  { id: 'o7', name: 'Tech Support', category: 'Other', description: 'Troubleshooting and device optimization.', tier: 'Other', status: 'ACTIVE', rate: '$50/hr', icon: Laptop },
  { id: 'o8', name: 'Cleaning', category: 'Other', description: 'Professional janitorial and housekeeping services.', tier: 'Other', status: 'ACTIVE', rate: '$22/hr', icon: Brush },
];
