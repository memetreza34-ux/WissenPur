import { League } from '../types';

export interface LeagueInfo {
  name: League;
  minRating: number;
  maxRating: number | null; // null for Master (no upper bound)
  color: string;
  iconColor: string;
}

export const LEAGUES: Record<League, LeagueInfo> = {
  'Bronze': { name: 'Bronze', minRating: 0, maxRating: 499, color: 'from-orange-700 to-orange-900', iconColor: 'text-orange-400' },
  'Silber': { name: 'Silber', minRating: 500, maxRating: 999, color: 'from-slate-400 to-slate-600', iconColor: 'text-slate-300' },
  'Gold': { name: 'Gold', minRating: 1000, maxRating: 1499, color: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-300' },
  'Platin': { name: 'Platin', minRating: 1500, maxRating: 1999, color: 'from-cyan-500 to-blue-700', iconColor: 'text-cyan-300' },
  'Diamant': { name: 'Diamant', minRating: 2000, maxRating: 2499, color: 'from-indigo-400 to-purple-600', iconColor: 'text-indigo-300' },
  'Elite': { name: 'Elite', minRating: 2500, maxRating: 2999, color: 'from-fuchsia-500 to-pink-700', iconColor: 'text-fuchsia-300' },
  'Meister': { name: 'Meister', minRating: 3000, maxRating: null, color: 'from-rose-500 to-red-800', iconColor: 'text-rose-300' },
};

export function getLeagueForRating(rating: number): LeagueInfo {
  if (rating >= 3000) return LEAGUES['Meister'];
  if (rating >= 2500) return LEAGUES['Elite'];
  if (rating >= 2000) return LEAGUES['Diamant'];
  if (rating >= 1500) return LEAGUES['Platin'];
  if (rating >= 1000) return LEAGUES['Gold'];
  if (rating >= 500) return LEAGUES['Silber'];
  return LEAGUES['Bronze'];
}

export function getNextLeague(currentLeague: League): LeagueInfo | null {
  const order: League[] = ['Bronze', 'Silber', 'Gold', 'Platin', 'Diamant', 'Elite', 'Meister'];
  const currentIndex = order.indexOf(currentLeague);
  if (currentIndex === -1 || currentIndex === order.length - 1) return null;
  return LEAGUES[order[currentIndex + 1]];
}

export function calculateRatingChange(playerRating: number, opponentRating: number, result: 'win' | 'loss' | 'draw'): number {
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  let actualScore = 0;
  if (result === 'win') actualScore = 1;
  else if (result === 'draw') actualScore = 0.5;
  
  return Math.round(K * (actualScore - expectedScore));
}
