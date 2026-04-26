import { Provider, Category, TierLevel } from '../../shared/types';

const NAMES = [
  'Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Prince', 'Ethan Hunt',
  'Fiona Gallagher', 'George Clooney', 'Hannah Montana', 'Ian Wright', 'Jane Doe',
  'Kevin Hart', 'Lara Croft', 'Mike Tyson', 'Nina Simone', 'Oscar Wilde',
  'Paul McCartney', 'Quinn Fabray', 'Rose Tyler', 'Steve Rogers', 'Tina Fey'
];

const LOCATIONS = [
  'Westlands, Nairobi', 'Kilimani, Nairobi', 'Lavington, Nairobi', 'Karen, Nairobi',
  'Muthaiga, Nairobi', 'Parklands, Nairobi', 'South C, Nairobi', 'Langata, Nairobi'
];

const IMAGES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
];

export const generateMockProviders = (count: number, category: string): Provider[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `${category}-${i}`;
    const name = NAMES[i % NAMES.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const image = IMAGES[i % IMAGES.length];
    const rating = 4.0 + Math.random();
    const reviews = Math.floor(Math.random() * 200);
    const pricePerHour = 1000 + Math.floor(Math.random() * 5000);
    const tier: TierLevel = i % 3 === 0 ? 'Luxury' : i % 2 === 0 ? 'Premium' : 'Basic';

    return {
      id,
      name,
      category: 'Household', // Default to a valid Category type, will be filtered/cast as needed
      subCategory: category,
      tier,
      bio: `Professional ${category} expert with years of experience. Highly recommended for quality service.`,
      rating: parseFloat(rating.toFixed(1)),
      reviews,
      location,
      distance: `${(Math.random() * 10).toFixed(1)} km`,
      pricePerHour,
      image,
      verified: Math.random() > 0.3,
      joined: '2022',
      isAvailable: Math.random() > 0.2,
      services: [category],
      reliability: 90 + Math.floor(Math.random() * 10),
      flaggedCount: 0,
      testimonials: [],
      reports: []
    };
  });
};
