import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { snippets } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

export const load = async (event) => {
	const session = await event.locals.auth();
	
	if (!session?.user?.id) {
		throw redirect(302, '/');
	}
	
	const userId = session.user.id;
	
	const userSnippets = await db.select().from(snippets).where(eq(snippets.userId, userId));
	
	return {
		snippets: userSnippets
	};
};

export const actions = {
	save: async (event) => {
		const session = await event.locals.auth();
		if (!session?.user?.id) return fail(401, { unauthorized: true });
		const userId = session.user.id;

		const data = await event.request.formData();
		const id = data.get('id') as string;
		const trigger = data.get('trigger') as string;
		const replacement = data.get('replacement') as string;
		
		if (!trigger || !replacement) {
			return fail(400, { missing: true });
		}
		
		// Create a hash for sync resolution
		const hash = crypto.createHash('sha256').update(trigger + replacement).digest('hex');

		if (id && id !== 'new') {
			// Update existing
			await db.update(snippets)
				.set({ trigger, replacement, hash, updatedAt: new Date() })
				.where(eq(snippets.id, id));
		} else {
			// Insert new
			await db.insert(snippets).values({
				userId,
				trigger,
				replacement,
				hash
			});
		}
		
		return { success: true };
	},
	
	delete: async (event) => {
		const session = await event.locals.auth();
		if (!session?.user?.id) return fail(401, { unauthorized: true });

		const data = await event.request.formData();
		const id = data.get('id') as string;
		
		if (id && id !== 'new') {
			await db.delete(snippets).where(eq(snippets.id, id));
		}
		
		return { success: true };
	}
};
