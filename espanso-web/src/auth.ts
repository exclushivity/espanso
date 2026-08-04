import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './lib/server/db';
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET
		})
	],
	trustHost: true,
	secret: env.AUTH_SECRET,
	callbacks: {
		session({ session, user }) {
			if (session.user && user) {
				session.user.id = user.id;
			}
			return session;
		}
	}
});
