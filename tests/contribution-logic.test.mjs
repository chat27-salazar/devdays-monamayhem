import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GET } from '../src/pages/api/contributions/[username].ts';
import { calculateStats, scoreBattle } from '../src/lib/battle-scoring.ts';
import { isContributionResponse, parseContributions } from '../src/lib/contributions.ts';

function createDays(endDate, countForDate = () => 0) {
	const end = new Date(`${endDate}T00:00:00Z`);
	return Array.from({ length: 364 }, (_, index) => {
		const date = new Date(end);
		date.setUTCDate(end.getUTCDate() - (363 - index));
		const dateString = date.toISOString().slice(0, 10);
		const count = countForDate(dateString);
		return { date: dateString, count, intensity: count === 0 ? 0 : 1 };
	});
}

function createUpstreamPayload({ count = 0 } = {}) {
	const start = new Date('2024-01-07T00:00:00Z');
	return {
		weeks: Array.from({ length: 52 }, (_, weekIndex) => {
			const firstDay = new Date(start);
			firstDay.setUTCDate(start.getUTCDate() + weekIndex * 7);
			return {
				first_day: firstDay.toISOString().slice(0, 10),
				contribution_days: Array.from({ length: 7 }, (_, weekday) => ({
					weekday,
					count,
					level: count === 0 ? 0 : 1,
				})),
			};
		}),
	};
}

test('parses a zero-contribution calendar into 364 normalized days', () => {
	const contributions = parseContributions(createUpstreamPayload());

	assert.equal(contributions?.length, 364);
	assert.ok(contributions.every((day) => day.count === 0 && day.intensity === 0));
	assert.equal(contributions[0].date, '2024-01-07');
	assert.equal(contributions.at(-1).date, '2025-01-04');
	assert.equal(
		isContributionResponse({ username: 'octocat', contributions }),
		true,
	);
});

test('rejects malformed upstream contribution weeks', () => {
	const payload = createUpstreamPayload();
	payload.weeks[4].contribution_days[2].weekday = 6;

	assert.equal(parseContributions(payload), null);
});

test('scores a zero-contribution year without inventing streaks', () => {
	const stats = calculateStats(createDays('2025-01-05'));

	assert.equal(stats.total, 0);
	assert.equal(stats.longestStreak, 0);
	assert.equal(stats.currentStreak, 0);
	assert.equal(stats.consistency, 0);
	assert.equal(stats.peakDay.count, 0);
});

test('counts a continuous streak across a month and year boundary', () => {
	const activeDates = new Set(
		Array.from({ length: 9 }, (_, index) => {
			const date = new Date('2024-12-28T00:00:00Z');
			date.setUTCDate(date.getUTCDate() + index);
			return date.toISOString().slice(0, 10);
		}),
	);
	const stats = calculateStats(createDays('2025-01-05', (date) => (activeDates.has(date) ? 1 : 0)));

	assert.equal(stats.longestStreak, 9);
	assert.equal(stats.currentStreak, 9);
});

test('returns a draw when both fighters have identical scoring stats', () => {
	const days = createDays('2025-01-05', (date) => (date.endsWith('-01') ? 3 : 0));
	const score = scoreBattle(days, structuredClone(days));

	assert.equal(score.winner, 'tie');
	assert.deepEqual(score.firstStats, score.secondStats);
});

test('rejects invalid usernames in the API route without fetching upstream', async (context) => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = () => {
		throw new Error('Invalid usernames must not reach upstream fetch.');
	};
	context.after(() => {
		globalThis.fetch = originalFetch;
	});

	for (const username of ['', '-octocat', 'octocat-', 'octo--cat', 'octo_cat', 'octo.cat', 'a'.repeat(40)]) {
		const response = await GET({ params: { username } });
		assert.equal(response.status, 400, `Expected ${JSON.stringify(username)} to be rejected`);
		assert.equal(response.headers.get('cache-control'), 'public, max-age=300');
		assert.deepEqual(await response.json(), { error: 'Invalid GitHub username' });
	}

	const missingUsernameResponse = await GET({ params: {} });
	assert.equal(missingUsernameResponse.status, 400);
});
