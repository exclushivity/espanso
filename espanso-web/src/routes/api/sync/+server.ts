import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { snippets } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

/**
 * GET /api/sync?userId=xxx&hash=xxx
 * Called by the Espanso client on startup / when coming online.
 * Returns the full snippet list if the hash differs, or { synced: true } if already up to date.
 */
export const GET = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	const clientHash = url.searchParams.get('hash');

	if (!userId) {
		return json({ error: 'userId is required' }, { status: 400 });
	}

	const userSnippets = await db.select().from(snippets).where(eq(snippets.userId, userId));

	// Compute a master hash over all snippets so the client can check if it's up to date
	const masterHash = computeMasterHash(userSnippets);

	if (clientHash && clientHash === masterHash) {
		return json({ synced: true, hash: masterHash });
	}

	// Return full snippet list with the new hash
	return json({
		synced: false,
		hash: masterHash,
		snippets: userSnippets.map((s) => ({
			id: s.id,
			trigger: s.trigger,
			replacement: s.replacement,
			hash: s.hash,
			updatedAt: s.updatedAt
		}))
	});
};

/**
 * POST /api/sync
 * Accepts a snippet update from the Espanso CLI and saves it.
 * Handles merge conflicts via updatedAt timestamp comparison.
 */
export const POST = async ({ request }) => {
	const body = await request.json();
	const { userId, snippet: incoming } = body;

	if (!userId || !incoming) {
		return json({ error: 'userId and snippet are required' }, { status: 400 });
	}

	const existing = await db
		.select()
		.from(snippets)
		.where(eq(snippets.id, incoming.id))
		.limit(1);

	if (existing.length > 0) {
		const serverVersion = existing[0];
		const clientTime = new Date(incoming.updatedAt).getTime();
		const serverTime = new Date(serverVersion.updatedAt).getTime();

		// Conflict resolution: server wins if server is newer
		if (serverTime > clientTime) {
			return json({
				conflict: true,
				resolution: 'server',
				serverSnippet: serverVersion
			});
		}

		// Client is newer — apply the update
		const hash = computeHash(incoming.trigger, incoming.replacement);
		await db
			.update(snippets)
			.set({ trigger: incoming.trigger, replacement: incoming.replacement, hash, updatedAt: new Date() })
			.where(eq(snippets.id, incoming.id));
	} else {
		// New snippet from client
		const hash = computeHash(incoming.trigger, incoming.replacement);
		await db.insert(snippets).values({
			id: incoming.id,
			userId,
			trigger: incoming.trigger,
			replacement: incoming.replacement,
			hash
		});
	}

	const allSnippets = await db.select().from(snippets).where(eq(snippets.userId, userId));
	return json({ success: true, hash: computeMasterHash(allSnippets) });
};

function computeHash(trigger: string, replacement: string): string {
	return crypto.createHash('sha256').update(trigger + replacement).digest('hex');
}

function computeMasterHash(rows: typeof snippets.$inferSelect[]): string {
	const combined = rows
		.map((s) => s.hash)
		.sort()
		.join('');
	return crypto.createHash('sha256').update(combined).digest('hex');
}
