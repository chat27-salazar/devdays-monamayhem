export interface Contribution {
	date: string;
	count: number;
	intensity: number;
}

const DAYS_IN_YEAR = 52 * 7;
const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseDate(value: unknown): Date | null {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return null;
	}

	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toISOString().slice(0, 10) === value ? date : null;
}

export function isValidGitHubUsername(username: string | undefined): username is string {
	return username !== undefined && GITHUB_USERNAME_PATTERN.test(username);
}

export function isContribution(value: unknown): value is Contribution {
	return (
		isRecord(value) &&
		parseDate(value.date) !== null &&
		typeof value.count === 'number' &&
		Number.isInteger(value.count) &&
		value.count >= 0 &&
		typeof value.intensity === 'number' &&
		Number.isInteger(value.intensity) &&
		value.intensity >= 0 &&
		value.intensity <= 4
	);
}

export function isContributionResponse(
	value: unknown,
): value is { username: string; contributions: Contribution[] } {
	return (
		isRecord(value) &&
		typeof value.username === 'string' &&
		Array.isArray(value.contributions) &&
		value.contributions.length === DAYS_IN_YEAR &&
		value.contributions.every(isContribution)
	);
}

export function parseContributions(payload: unknown): Contribution[] | null {
	if (!isRecord(payload) || !Array.isArray(payload.weeks)) {
		return null;
	}

	const contributions: Contribution[] = [];

	for (const week of payload.weeks) {
		if (!isRecord(week) || !Array.isArray(week.contribution_days)) {
			return null;
		}

		const firstDay = parseDate(week.first_day);
		if (!firstDay || week.contribution_days.length !== 7) {
			return null;
		}

		for (let index = 0; index < week.contribution_days.length; index += 1) {
			const day = week.contribution_days[index];
			if (
				!isRecord(day) ||
				day.weekday !== index ||
				typeof day.count !== 'number' ||
				!Number.isInteger(day.count) ||
				day.count < 0 ||
				typeof day.level !== 'number' ||
				!Number.isInteger(day.level) ||
				day.level < 0 ||
				day.level > 4
			) {
				return null;
			}

			const date = new Date(firstDay);
			date.setUTCDate(date.getUTCDate() + index);
			contributions.push({
				date: date.toISOString().slice(0, 10),
				count: day.count,
				intensity: day.level,
			});
		}
	}

	if (contributions.length < DAYS_IN_YEAR) {
		return null;
	}

	return contributions.slice(-DAYS_IN_YEAR);
}
