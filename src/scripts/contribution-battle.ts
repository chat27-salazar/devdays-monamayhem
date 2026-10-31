import { ArcadeSfx } from './arcade-sfx';
import { calculateStats, scoreBattle, type PlayerStats } from '../lib/battle-scoring';
import { isContributionResponse, type Contribution } from '../lib/contributions';

interface ContributionResponse {
	username: string;
	contributions: Contribution[];
}

interface FighterClass {
	name: string;
	icon: string;
	description: string;
}

type StatCategory = 'total' | 'longest' | 'current' | 'peak' | 'consistency';

interface PlayerElements {
	avatar: HTMLImageElement;
	error: HTMLParagraphElement;
	fighterClass: HTMLParagraphElement;
	grid: HTMLDivElement;
	power: HTMLElement;
	powerFill: HTMLElement;
	summary: HTMLParagraphElement;
	stats: Record<StatCategory, HTMLElement>;
	statRows: Record<StatCategory, HTMLElement>;
	username: HTMLHeadingElement;
}

const form = document.querySelector<HTMLFormElement>('#battle-form');
const sfxToggle = document.querySelector<HTMLButtonElement>('#sfx-toggle');
const playerOneInput = document.querySelector<HTMLInputElement>('#player-one');
const playerTwoInput = document.querySelector<HTMLInputElement>('#player-two');
const battleButton = document.querySelector<HTMLButtonElement>('#battle-button');
const quickMatchupButtons = document.querySelectorAll<HTMLButtonElement>('.quick-matchups button');
const battleStatus = document.querySelector<HTMLDivElement>('#battle-status');
const battleStatusText = battleStatus?.querySelector<HTMLParagraphElement>('p');
const fightOverlay = document.querySelector<HTMLDivElement>('#fight-overlay');
const fightCall = document.querySelector<HTMLElement>('#fight-call');
const scoreboard = document.querySelector<HTMLElement>('.scoreboard');
const winnerBanner = document.querySelector<HTMLHeadingElement>('#winner-banner');
const scoreline = document.querySelector<HTMLParagraphElement>('#battle-scoreline');
const victoryParticles = document.querySelector<HTMLDivElement>('#victory-particles');
const arena = document.querySelector<HTMLElement>('.arena');
const resultsRegion = document.querySelector<HTMLElement>('.results');
const arcadeSfx = new ArcadeSfx();

function getPlayerElements(player: 'one' | 'two'): PlayerElements | null {
	const avatar = document.querySelector<HTMLImageElement>(`#player-${player}-avatar`);
	const error = document.querySelector<HTMLParagraphElement>(`#player-${player}-error`);
	const fighterClass = document.querySelector<HTMLParagraphElement>(`#player-${player}-class`);
	const grid = document.querySelector<HTMLDivElement>(`#player-${player}-heatmap`);
	const power = document.querySelector<HTMLElement>(`#player-${player}-power`);
	const powerFill = document.querySelector<HTMLElement>(`#player-${player}-power-fill`);
	const summary = document.querySelector<HTMLParagraphElement>(`#player-${player}-summary`);
	const username = document.querySelector<HTMLHeadingElement>(`#player-${player}-username`);
	const categories: StatCategory[] = ['total', 'longest', 'current', 'peak', 'consistency'];
	const stats = Object.fromEntries(
		categories.map((category) => [
			category,
			document.querySelector<HTMLElement>(`#player-${player}-${category}`),
		]),
	) as Record<StatCategory, HTMLElement | null>;
	const statRows = Object.fromEntries(
		categories.map((category) => [
			category,
			document.querySelector<HTMLElement>(`.player-${player} [data-stat="${category}"]`),
		]),
	) as Record<StatCategory, HTMLElement | null>;

	if (
		!avatar ||
		!error ||
		!fighterClass ||
		!grid ||
		!power ||
		!powerFill ||
		!summary ||
		!username ||
		categories.some((category) => !stats[category] || !statRows[category])
	) {
		return null;
	}

	return {
		avatar,
		error,
		fighterClass,
		grid,
		power,
		powerFill,
		summary,
		stats: stats as Record<StatCategory, HTMLElement>,
		statRows: statRows as Record<StatCategory, HTMLElement>,
		username,
	};
}

const players = [getPlayerElements('one'), getPlayerElements('two')];

if (
	!form ||
	!sfxToggle ||
	!playerOneInput ||
	!playerTwoInput ||
	!battleButton ||
	quickMatchupButtons.length === 0 ||
	!battleStatus ||
	!battleStatusText ||
	!fightOverlay ||
	!fightCall ||
	!scoreboard ||
	!winnerBanner ||
	!scoreline ||
	!victoryParticles ||
	!arena ||
	!resultsRegion ||
	players.some((player) => player === null)
) {
	throw new Error('Battle page is missing required contribution heatmap elements.');
}

const playerOne = players[0];
const playerTwo = players[1];
if (!playerOne || !playerTwo) {
	throw new Error('Battle page is missing player contribution heatmap elements.');
}
const numberFormat = new Intl.NumberFormat();

sfxToggle.addEventListener('click', () => {
	arcadeSfx.setEnabled(!arcadeSfx.isEnabled);
	const enabled = arcadeSfx.isEnabled;
	sfxToggle.textContent = `${enabled ? '🔊' : '🔇'} SFX: ${enabled ? 'ON' : 'OFF'}`;
	sfxToggle.setAttribute('aria-pressed', String(enabled));
	sfxToggle.setAttribute('aria-label', `${enabled ? 'Mute' : 'Enable'} sound effects`);
});

battleButton.addEventListener('click', () => arcadeSfx.playCoin());

quickMatchupButtons.forEach((button) => {
	button.addEventListener('click', () => {
		const playerOneUsername = button.dataset.playerOne;
		const playerTwoUsername = button.dataset.playerTwo;
		if (!playerOneUsername || !playerTwoUsername || battleButton.disabled) {
			return;
		}

		arcadeSfx.playCoin();
		playerOneInput.value = playerOneUsername;
		playerTwoInput.value = playerTwoUsername;
		form.requestSubmit();
	});
});

function showStatus(message: string, isError = false): void {
	battleStatusText.textContent = message;
	battleStatus.hidden = message.length === 0;
	battleStatus.classList.toggle('is-error', isError);
	battleStatus.classList.toggle('ready-indicator', message.includes('READY PLAYER 1'));
	battleStatus.setAttribute('role', isError ? 'alert' : 'status');
}

function renderSkeleton(grid: HTMLDivElement): void {
	const skeleton = document.createDocumentFragment();
	for (let index = 0; index < 364; index += 1) {
		const cell = document.createElement('span');
		cell.className = 'contribution-cell skeleton-cell';
		cell.dataset.level = '0';
		cell.setAttribute('aria-hidden', 'true');
		skeleton.append(cell);
	}

	grid.replaceChildren(skeleton);
	grid.setAttribute('aria-busy', 'true');
}

function delay(milliseconds: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function animationDelay(milliseconds: number): number {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : milliseconds;
}

async function runCountdown(): Promise<void> {
	fightOverlay.hidden = false;
	try {
		for (const call of ['3', '2', '1', 'FIGHT!']) {
			fightCall.textContent = call;
			fightCall.animate(
				[
					{ opacity: 0, transform: 'scale(1.8)' },
					{ opacity: 1, transform: 'scale(1)' },
				],
				{ duration: animationDelay(420), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
			);
			await delay(animationDelay(420));
		}
	} finally {
		fightOverlay.hidden = true;
	}
}

async function fetchContributions(username: string): Promise<ContributionResponse> {
	let response: Response;
	try {
		response = await fetch(`/api/contributions/${encodeURIComponent(username)}`);
	} catch {
		throw new Error(`Could not connect to load @${username}'s contributions. Please try again.`);
	}

	let data: unknown;
	try {
		data = await response.json();
	} catch {
		throw new Error(`Received an invalid response while loading @${username}.`);
	}

	if (response.status === 404) {
		throw new Error(`GitHub user @${username} was not found. Check the username and try again.`);
	}

	if (!response.ok) {
		const message =
			data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
				? data.error
				: 'Contribution service is unavailable.';
		throw new Error(`Could not load @${username}: ${message}`);
	}

	if (!isContributionResponse(data)) {
		throw new Error(`Received invalid contribution data for @${username}.`);
	}

	return data;
}

function renderHeatmap(grid: HTMLDivElement, contributions: Contribution[]): void {
	const cells = contributions.map((day, index) => {
		const cell = document.createElement('span');
		cell.className = 'contribution-cell';
		cell.dataset.level = String(day.intensity);
		cell.style.setProperty('--week', String(Math.floor(index / 7)));
		cell.title = `${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`;
		cell.setAttribute(
			'aria-label',
			`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`,
		);
		cell.setAttribute('role', 'gridcell');
		grid.append(cell);
		return cell;
	});

	grid.classList.remove('grid-reveal');
	grid.replaceChildren(...cells);
	grid.setAttribute('aria-busy', 'false');
	void grid.offsetWidth;
	grid.classList.add('grid-reveal');
}

function assignFighterClass(days: Contribution[], stats: PlayerStats): FighterClass {
	if (stats.longestStreak > 30) {
		return {
			name: 'Streak Paladin',
			icon: '🛡️',
			description: `Longest streak: ${stats.longestStreak} days`,
		};
	}

	const weekendContributions = days.reduce((total, day) => {
		const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
		return weekday === 0 || weekday === 6 ? total + day.count : total;
	}, 0);
	const weekendShare = stats.total === 0 ? 0 : weekendContributions / stats.total;
	if (weekendShare >= 0.4) {
		return {
			name: 'Weekend Warrior',
			icon: '⚔️',
			description: `${Math.round(weekendShare * 100)}% of contributions land on weekends`,
		};
	}

	if (stats.peakDay.count >= Math.max(20, stats.total * 0.1)) {
		return {
			name: 'Commit Berserker',
			icon: '🔥',
			description: `Peak day: ${stats.peakDay.count} contributions`,
		};
	}

	return {
		name: 'Arcade Ranger',
		icon: '🧭',
		description: 'A balanced contribution pattern',
	};
}

function renderFighterClass(player: PlayerElements, days: Contribution[], stats: PlayerStats): void {
	const fighterClass = assignFighterClass(days, stats);
	player.fighterClass.textContent = `${fighterClass.icon} ${fighterClass.name}`;
	player.fighterClass.title = fighterClass.description;
	player.fighterClass.setAttribute('aria-label', `${fighterClass.name}: ${fighterClass.description}`);
	player.fighterClass.hidden = false;
}

function syncBattleUrl(playerOneUsername: string, playerTwoUsername: string): void {
	const url = new URL(window.location.href);
	url.searchParams.set('p1', playerOneUsername);
	url.searchParams.set('p2', playerTwoUsername);
	window.history.replaceState(window.history.state, '', url);
}

const statCategories: Array<{
	key: StatCategory;
	value: (stats: PlayerStats) => number;
	display: (stats: PlayerStats) => string;
}> = [
	{ key: 'total', value: (stats) => stats.total, display: (stats) => numberFormat.format(stats.total) },
	{
		key: 'longest',
		value: (stats) => stats.longestStreak,
		display: (stats) => `${stats.longestStreak} days`,
	},
	{
		key: 'current',
		value: (stats) => stats.currentStreak,
		display: (stats) => `${stats.currentStreak} days`,
	},
	{
		key: 'peak',
		value: (stats) => stats.peakDay.count,
		display: (stats) => `${numberFormat.format(stats.peakDay.count)} · ${stats.peakDay.date}`,
	},
	{
		key: 'consistency',
		value: (stats) => stats.consistency,
		display: (stats) => `${stats.consistency.toFixed(1)}%`,
	},
];

function resetStats(player: PlayerElements): void {
	for (const category of statCategories) {
		const row = player.statRows[category.key];
		row.classList.remove('is-revealed');
		player.stats[category.key].textContent = '—';
	}
	player.powerFill.style.width = '100%';
	player.power.textContent = '100%';
}

async function revealStats(
	firstPlayer: PlayerElements,
	secondPlayer: PlayerElements,
	firstStats: PlayerStats,
	secondStats: PlayerStats,
): Promise<void> {
	for (const category of statCategories) {
		arcadeSfx.playStatHit();
		const firstValue = category.value(firstStats);
		const secondValue = category.value(secondStats);
		const maximum = Math.max(firstValue, secondValue);
		const firstPower = maximum === 0 ? 100 : Math.round((firstValue / maximum) * 100);
		const secondPower = maximum === 0 ? 100 : Math.round((secondValue / maximum) * 100);

		firstPlayer.stats[category.key].textContent = category.display(firstStats);
		secondPlayer.stats[category.key].textContent = category.display(secondStats);
		firstPlayer.statRows[category.key].classList.add('is-revealed');
		secondPlayer.statRows[category.key].classList.add('is-revealed');
		firstPlayer.powerFill.style.width = `${firstPower}%`;
		secondPlayer.powerFill.style.width = `${secondPower}%`;
		firstPlayer.power.textContent = `${firstPower}%`;
		secondPlayer.power.textContent = `${secondPower}%`;
		await delay(animationDelay(400));
	}
}

async function animateVictory(winner: string, isTie: boolean): Promise<void> {
	scoreboard.classList.remove('is-victory', 'is-knockout');
	victoryParticles.replaceChildren();
	winnerBanner.textContent = isTie ? 'DRAW!' : `K.O. — @${winner} WINS!`;
	arcadeSfx.playVictory();
	scoreboard.classList.add(isTie ? 'is-victory' : 'is-knockout');
	arena.classList.remove('screen-shake');
	void arena.offsetWidth;
	arena.classList.add('screen-shake');

	if (!isTie) {
		const colors = ['#39ffb6', '#00e5ff', '#ff4fd8', '#ffd166'];
		for (let index = 0; index < 36; index += 1) {
			const particle = document.createElement('span');
			particle.className = 'victory-particle';
			particle.style.setProperty('--particle-x', `${Math.random() * 440 - 220}px`);
			particle.style.setProperty('--particle-y', `${Math.random() * 240 - 120}px`);
			particle.style.setProperty('--particle-color', colors[index % colors.length]);
			particle.style.animationDelay = `${Math.random() * 180}ms`;
			victoryParticles.append(particle);
		}
		window.setTimeout(() => victoryParticles.replaceChildren(), 1300);
	}
	await delay(animationDelay(450));
}

function renderPlayer(player: PlayerElements, result: ContributionResponse): void {
	const days = result.contributions;
	const firstDay = days[0].date;
	const lastDay = days[days.length - 1].date;

	player.username.textContent = `@${result.username}`;
	const stats = calculateStats(days);
	renderFighterClass(player, days, stats);
	player.avatar.src = `https://github.com/${encodeURIComponent(result.username)}.png`;
	player.avatar.alt = '';
	player.avatar.hidden = false;
	player.summary.textContent = `${firstDay} – ${lastDay}`;
	player.error.textContent = '';
	player.error.hidden = true;
	renderHeatmap(player.grid, days);
	resetStats(player);
}

function renderPlayerError(player: PlayerElements, error: unknown): string {
	const message =
		error instanceof Error ? error.message : 'An unexpected error occurred while loading contributions.';
	player.error.textContent = message;
	player.error.hidden = false;
	player.fighterClass.textContent = '';
	player.fighterClass.hidden = true;
	player.avatar.hidden = true;
	resetStats(player);
	player.grid.replaceChildren();
	player.grid.setAttribute('aria-busy', 'false');
	player.summary.textContent = 'Contribution data could not be loaded.';
	return message;
}

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	const usernames = [playerOneInput.value.trim(), playerTwoInput.value.trim()];
	playerOneInput.value = usernames[0];
	playerTwoInput.value = usernames[1];

	if (!usernames[0] || !usernames[1]) {
		showStatus('Enter a GitHub username for both players.', true);
		(usernames[0] ? playerTwoInput : playerOneInput).focus();
		return;
	}

	syncBattleUrl(usernames[0], usernames[1]);
	battleButton.disabled = true;
	quickMatchupButtons.forEach((button) => {
		button.disabled = true;
	});
	form.setAttribute('aria-busy', 'true');
	resultsRegion.setAttribute('aria-busy', 'true');
	scoreboard.classList.remove('is-victory', 'is-knockout');
	winnerBanner.textContent = 'VS';
	scoreline.textContent = 'Comparing contribution stats…';
	victoryParticles.replaceChildren();
	arena.classList.remove('screen-shake');

	for (const [index, player] of [playerOne, playerTwo].entries()) {
		player.error.textContent = '';
		player.error.hidden = true;
		player.fighterClass.textContent = '';
		player.fighterClass.hidden = true;
		player.username.textContent = `@${usernames[index]}`;
		player.avatar.src = `https://github.com/${encodeURIComponent(usernames[index])}.png`;
		player.avatar.hidden = false;
		player.summary.textContent = 'Loading contributions…';
		resetStats(player);
		renderSkeleton(player.grid);
	}

	try {
		showStatus('The fighters are entering the arena…');
		arcadeSfx.playPowerUp();
		const resultsPromise = Promise.allSettled(usernames.map(fetchContributions));
		const [results] = await Promise.all([resultsPromise, runCountdown()]);
		const errors: string[] = [];
		const successfulResults: ContributionResponse[] = [];

		results.forEach((result, index) => {
			const player = index === 0 ? playerOne : playerTwo;
			if (result.status === 'fulfilled') {
				successfulResults[index] = result.value;
				renderPlayer(player, result.value);
			} else {
				errors.push(renderPlayerError(player, result.reason));
			}
		});

		if (errors.length > 0) {
			showStatus(errors.join(' '), true);
			scoreline.textContent = 'Battle interrupted — check the fighter error.';
			return;
		}

		const firstResult = successfulResults[0];
		const secondResult = successfulResults[1];
		if (!firstResult || !secondResult) {
			throw new Error('Both contribution results were not available after the battle.');
		}

		showStatus('DATA LOADED — REVEALING FIGHTER STATS!');
		await delay(animationDelay(1050));
		const battleScore = scoreBattle(
			firstResult.contributions,
			secondResult.contributions,
		);
		await revealStats(
			playerOne,
			playerTwo,
			battleScore.firstStats,
			battleScore.secondStats,
		);

		const isTie = battleScore.winner === 'tie';
		const winner =
			battleScore.winner === 'player-one' ? firstResult.username : secondResult.username;
		scoreline.textContent = `${firstResult.username} ${numberFormat.format(battleScore.firstStats.total)}  VS  ${numberFormat.format(battleScore.secondStats.total)} ${secondResult.username}`;
		await animateVictory(winner, isTie);
		showStatus(isTie ? 'DRAW GAME!' : `K.O.! @${winner} WINS THE BATTLE!`);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'An unexpected error occurred during the battle.';
		showStatus(message, true);
	} finally {
		battleButton.disabled = false;
		quickMatchupButtons.forEach((button) => {
			button.disabled = false;
		});
		form.removeAttribute('aria-busy');
		resultsRegion.setAttribute('aria-busy', 'false');
	}
});

const initialUrl = new URL(window.location.href);
const initialPlayerOne = initialUrl.searchParams.get('p1')?.trim();
const initialPlayerTwo = initialUrl.searchParams.get('p2')?.trim();
if (initialPlayerOne && initialPlayerTwo) {
	playerOneInput.value = initialPlayerOne;
	playerTwoInput.value = initialPlayerTwo;
	form.requestSubmit();
}
