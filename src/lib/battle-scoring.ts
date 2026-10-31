import type { Contribution } from './contributions.ts';

export interface PlayerStats {
	total: number;
	longestStreak: number;
	currentStreak: number;
	peakDay: Contribution;
	consistency: number;
}

export interface BattleScore {
	firstStats: PlayerStats;
	secondStats: PlayerStats;
	winner: 'player-one' | 'player-two' | 'tie';
}

export function calculateStats(days: Contribution[]): PlayerStats {
	if (days.length === 0) {
		throw new Error('Cannot score a player without contribution days.');
	}

	const total = days.reduce((sum, day) => sum + day.count, 0);
	let longestStreak = 0;
	let activeRun = 0;

	for (const day of days) {
		activeRun = day.count > 0 ? activeRun + 1 : 0;
		longestStreak = Math.max(longestStreak, activeRun);
	}

	const today = new Date().toISOString().slice(0, 10);
	let currentIndex = days.length - 1;
	if (days[currentIndex]?.date === today && days[currentIndex].count === 0) {
		currentIndex -= 1;
	}
	let currentStreak = 0;
	while (currentIndex >= 0 && days[currentIndex].count > 0) {
		currentStreak += 1;
		currentIndex -= 1;
	}

	const peakDay = days.reduce((peak, day) => (day.count > peak.count ? day : peak), days[0]);
	const consistency = (days.filter((day) => day.count > 0).length / days.length) * 100;
	return { total, longestStreak, currentStreak, peakDay, consistency };
}

export function scoreBattle(firstDays: Contribution[], secondDays: Contribution[]): BattleScore {
	const firstStats = calculateStats(firstDays);
	const secondStats = calculateStats(secondDays);
	const winner =
		firstStats.total === secondStats.total
			? 'tie'
			: firstStats.total > secondStats.total
				? 'player-one'
				: 'player-two';

	return { firstStats, secondStats, winner };
}
