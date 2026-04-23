import { type Booking, type Provider, type Category } from "../App";

export interface MatchResult {
  score: number;
  reason: string;
  targetId: string;
  targetName: string;
}

class SmartMatcher {
  /**
   * Calculates a match score between a client's needs and a provider's profile.
   * Score is 0-100.
   */
  calculateMatchScore(clientInterests: string[], provider: Provider, searchCriteria?: { query?: string, category?: string }): number {
    let score = 0;

    // 1. Category alignment (Max 40 points)
    if (searchCriteria?.category === provider.category) {
      score += 40;
    } else if (clientInterests.some(interest => interest.includes(provider.category))) {
      score += 30;
    }

    // 2. Performance & Trust (Max 30 points)
    score += (provider.rating / 5) * 20; // Up to 20 based on rating
    if (provider.verified) score += 10;

    // 3. Reliability (Max 15 points)
    score += (provider.reliability / 100) * 15;

    // 4. Availability Bonus (Max 15 points)
    if (provider.isAvailable) score += 15;

    // 5. Search keyword match (Extra bonus - high weight as it's explicit user intent)
    if (searchCriteria?.query && (
      provider.name.toLowerCase().includes(searchCriteria.query.toLowerCase()) ||
      provider.bio.toLowerCase().includes(searchCriteria.query.toLowerCase()) ||
      provider.services.some(s => s.toLowerCase().includes(searchCriteria.query!.toLowerCase()))
    )) {
      score += 50;
    }

    return Math.min(score, 100);
  }

  /**
   * Logic for recommending providers to a client
   */
  getMatchesForClient(clientInterests: string[], providers: Provider[], searchCriteria?: { query?: string, category?: string }): MatchResult[] {
    return providers
      .map(p => ({
        score: this.calculateMatchScore(clientInterests, p, searchCriteria),
        reason: this.getMatchReason(clientInterests, p),
        targetId: p.id,
        targetName: p.name
      }))
      .filter(m => m.score > 40)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Logic for recommending potential leads to a provider
   */
  getMatchesForProvider(provider: Provider, bookings: Booking[]): MatchResult[] {
    // For a provider, matches are basically pending bookings in their category/tier
    return bookings
      .filter(b => b.status === 'pending' && b.category === provider.category)
      .map(b => {
        let score = 70; // Base score for category match
        
        return {
          score,
          reason: `Work needed: ${b.category} support requested for ${b.date}.`,
          targetId: b.id,
          targetName: `Lead for ${b.category}`
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private getMatchReason(interests: string[], provider: Provider): string {
    if (provider.rating >= 4.9 && provider.reliability >= 95) return "Elite specialist with perfect reliability record.";
    if (interests.some(i => i.includes(provider.category))) return `Aligned with your ${provider.category} interest profile.`;
    if (provider.verified && provider.isAvailable) return "Verified professional available for immediate deployment.";
    return "High-performance match based on service history.";
  }
}

export const matchingService = new SmartMatcher();
