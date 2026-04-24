import { 
  Home, 
  Wrench, 
  Truck, 
  Leaf, 
  Heart, 
  UserCheck, 
  ShieldCheck, 
  Gem 
} from 'lucide-react';
import React from 'react';
import { Category, TierLevel } from './types';

export const INTEREST_CATEGORY_MAP: Record<string, Category[]> = {
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

export const TIER_SERVICES_MATRIX: Record<Category, Record<TierLevel, string[]>> = {
  Household: {
    Basic: ["House cleaning (regular)", "Dishwashing", "Laundry & ironing", "Grocery shopping", "Babysitting (short hours)", "Basic cooking / meal prep"],
    Premium: ["Deep cleaning (sofas, carpets, mattresses)", "Full-time nanny services", "Professional home organization", "Weekly meal planning + prep", "Elderly care (non-medical)", "Pet care (walking, feeding, grooming)"],
    Luxury: ["Live-in house manager", "Private chef (daily or on-demand)", "Butler services", "Concierge home services", "Specialized childcare (trained nannies, tutors)", "Smart home management (automation monitoring)"]
  },
  Maintenance: {
    Basic: ["Plumbing fixes (leaks, taps)", "Electrical fixes (switches, sockets)", "Furniture assembly", "Basic appliance repair", "Painting touch-ups"],
    Premium: ["Full home repainting", "Advanced electrical work (rewiring)", "Plumbing installations (heaters, piping systems)", "Appliance servicing (fridge, washing machine)", "Carpentry (custom shelves, cabinets)"],
    Luxury: ["Home renovation projects", "Interior finishing (designer-level)", "Smart home installation (CCTV, automation)", "High-end appliance installation", "Structural upgrades (ceilings, flooring)"]
  },
  Logistics: {
    Basic: ["Small item delivery", "Motorcycle courier services", "Packing assistance", "Local moving (bedsitters/1-bedroom)"],
    Premium: ["Full house moving (multi-room)", "Office relocation", "Professional packing + unpacking", "Furniture disassembly & reassembly", "Secure transport (fragile items)"],
    Luxury: ["White-glove moving service", "International relocation support", "Climate-controlled transport", "Art & valuables handling", "Full relocation concierge (housing setup, utilities)"]
  },
  Outdoor: {
    Basic: ["Lawn mowing", "Garden watering", "Basic landscaping", "Garbage collection assistance"],
    Premium: ["Garden design & landscaping", "Tree trimming", "Pest control services", "Irrigation system installation", "Compound cleaning (pressure washing)"],
    Luxury: ["Luxury landscape architecture", "Swimming pool maintenance & design", "Outdoor lighting design", "Private garden maintenance teams", "Eco-garden & smart irrigation systems"]
  },
  Lifestyle: {
    Basic: ["Massage therapy (home service)", "Haircuts / barber services", "Basic beauty services (manicure, pedicure)", "Personal shopping assistance"],
    Premium: ["Spa treatments at home", "Professional hairstyling & makeup", "Fitness training (personal trainer)", "Nutrition consulting", "Event styling (small events)"],
    Luxury: ["Private wellness concierge", "Personal stylist & image consultant", "Luxury spa experiences (full setup)", "Private yoga/fitness instructor (long-term)", "Exclusive event planning (VIP experiences)"]
  },
  Staff: {
    Basic: ["Temporary workers (cleaners, helpers)", "Casual event staff", "Day laborers"],
    Premium: ["Trained security personnel", "Professional drivers", "Executive assistants", "Skilled chefs", "Certified caregivers"],
    Luxury: ["Personal assistants (dedicated)", "Chauffeurs (executive level)", "Estate managers", "Private security teams", "Corporate-level staffing solutions"]
  }
};

export const CATEGORIES: { id: Category; label: string; icon: any; color: string; subServices: string[] }[] = [
  { 
    id: 'Household', 
    label: 'Household Support', 
    icon: Home, 
    color: 'bg-blue-500', 
    subServices: [...TIER_SERVICES_MATRIX.Household.Basic, ...TIER_SERVICES_MATRIX.Household.Premium, ...TIER_SERVICES_MATRIX.Household.Luxury] 
  },
  { 
    id: 'Maintenance', 
    label: 'Maintenance & Repairs', 
    icon: Wrench, 
    color: 'bg-indigo-500', 
    subServices: [...TIER_SERVICES_MATRIX.Maintenance.Basic, ...TIER_SERVICES_MATRIX.Maintenance.Premium, ...TIER_SERVICES_MATRIX.Maintenance.Luxury] 
  },
  { 
    id: 'Logistics', 
    label: 'Moving & Logistics', 
    icon: Truck, 
    color: 'bg-green-500', 
    subServices: [...TIER_SERVICES_MATRIX.Logistics.Basic, ...TIER_SERVICES_MATRIX.Logistics.Premium, ...TIER_SERVICES_MATRIX.Logistics.Luxury] 
  },
  { 
    id: 'Outdoor', 
    label: 'Outdoor Care', 
    icon: Leaf, 
    color: 'bg-emerald-500', 
    subServices: [...TIER_SERVICES_MATRIX.Outdoor.Basic, ...TIER_SERVICES_MATRIX.Outdoor.Premium, ...TIER_SERVICES_MATRIX.Outdoor.Luxury] 
  },
  { 
    id: 'Lifestyle', 
    label: 'Lifestyle & Comfort', 
    icon: Heart, 
    color: 'bg-rose-500', 
    subServices: [...TIER_SERVICES_MATRIX.Lifestyle.Basic, ...TIER_SERVICES_MATRIX.Lifestyle.Premium, ...TIER_SERVICES_MATRIX.Lifestyle.Luxury] 
  },
  { 
    id: 'Staff', 
    label: 'Premium Staffing', 
    icon: UserCheck, 
    color: 'bg-slate-500', 
    subServices: [...TIER_SERVICES_MATRIX.Staff.Basic, ...TIER_SERVICES_MATRIX.Staff.Premium, ...TIER_SERVICES_MATRIX.Staff.Luxury] 
  },
];

export const CATALOG_PACKAGES: { tier: TierLevel; title: string; subtitle: string; fee: number; icon: any; color: string; description: string }[] = [
  {
    tier: 'Basic',
    title: 'Essential',
    subtitle: 'Task-based, Low Commitment',
    fee: 4.5,
    icon: Home,
    color: 'from-blue-500 to-indigo-600',
    description: "Everyday household care, basic repairs, single-item logistics, and simple lifestyle tasks. Standard task-based pricing."
  },
  {
    tier: 'Premium',
    title: 'Professional',
    subtitle: 'Skilled & Specialized',
    fee: 7,
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    description: "Deep hospitality service, advanced technical repairs, full relocations, and professional lifestyle consulting. Certified talent."
  },
  {
    tier: 'Luxury',
    title: 'Elite',
    subtitle: 'Personalized, High-Value',
    fee: 9,
    icon: Gem,
    color: 'from-amber-500 to-orange-600',
    description: "Full estate management, live-in staff, private chefs, landscape architecture, and exclusive VIP lifestyle experiences. Absolute discretion."
  }
];

export const QUALIFICATION_QUESTIONS: Record<Category, string[]> = {
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
