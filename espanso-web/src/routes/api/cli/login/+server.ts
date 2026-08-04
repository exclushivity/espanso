import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
	const port = url.searchParams.get('port') || '11034';
	const session = await locals.auth();

	if (!session?.user?.id) {
		// Store the intent to redirect back here after login
		throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.toString())}`);
	}

	// User is logged in, send them back to the CLI server
	throw redirect(302, `http://localhost:${port}/callback?userId=${session.user.id}`);
};
