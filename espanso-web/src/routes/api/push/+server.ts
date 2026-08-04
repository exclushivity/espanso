/**
 * GET /api/push?userId=xxx
 * Server-Sent Events (SSE) endpoint.
 * The Espanso client connects here when online and receives push notifications
 * whenever the server's snippet list changes.
 *
 * Cloudflare Workers support SSE natively via ReadableStream.
 */
export const GET = async ({ url }) => {
	const userId = url.searchParams.get('userId');

	if (!userId) {
		return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
	}

	const stream = new ReadableStream({
		start(controller) {
			// Keep connection alive every 20 seconds
			const keepAlive = setInterval(() => {
				try {
					controller.enqueue(encode(': keepalive\n\n'));
				} catch {
					clearInterval(keepAlive);
				}
			}, 20_000);

			// Send an initial connection event
			controller.enqueue(encode(`data: ${JSON.stringify({ event: 'connected', userId })}\n\n`));

			// NOTE: In a production setup with a real message broker (e.g. Cloudflare Queues,
			// Upstash Redis, or Durable Objects), you would subscribe to user-specific change
			// events here and forward them to the client. For now, this establishes the SSE
			// transport layer. The Espanso client polls /api/sync on receiving any event.
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*'
		}
	});
};

function encode(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}
