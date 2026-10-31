import type { APIRoute } from 'astro';
import { isValidGitHubUsername, parseContributions } from '../../../lib/contributions.ts';

function jsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=300',
		},
	});
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const username = params.username;
	if (!isValidGitHubUsername(username)) {
		return jsonResponse({ error: 'Invalid GitHub username' }, 400);
	}

	let upstream: Response;
	try {
		upstream = await fetch(`https://github.com/${username}.contribs`, {
			headers: { Accept: 'application/json' },
		});
	} catch (error) {
		console.error(`Failed to fetch contributions for ${username}`, error);
		return jsonResponse({ error: 'Unable to fetch GitHub contributions' }, 502);
	}

	if (upstream.status === 404) {
		return jsonResponse({ error: 'GitHub user not found' }, 404);
	}

	if (!upstream.ok) {
		console.error(`GitHub contributions request failed with status ${upstream.status}`);
		return jsonResponse({ error: 'GitHub contributions service failed' }, 502);
	}

	let payload: unknown;
	try {
		payload = await upstream.json();
	} catch (error) {
		console.error(`Invalid contributions response for ${username}`, error);
		return jsonResponse({ error: 'Invalid response from GitHub contributions service' }, 502);
	}

	try {
		const contributions = parseContributions(payload);
		if (!contributions) {
			return jsonResponse({ error: 'Invalid response from GitHub contributions service' }, 502);
		}

		return jsonResponse({ username, contributions }, 200);
	} catch (error) {
		console.error(`Failed to parse contributions for ${username}`, error);
		return jsonResponse({ error: 'Unable to process GitHub contributions' }, 500);
	}
};
