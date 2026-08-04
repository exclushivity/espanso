<script lang="ts">
	import { toast, type ToastMessage } from '$lib/stores/toast';
	import { flip } from 'svelte/animate';
	import { fly, fade } from 'svelte/transition';
	import confetti from 'canvas-confetti';

	let toasts: ToastMessage[] = $state([]);
	const seenIds = new Set<string>();

	$effect(() => {
		const unsub = toast.subscribe((incoming) => {
			// Fire confetti for brand-new success toasts
			incoming.forEach((t) => {
				if (!seenIds.has(t.id)) {
					seenIds.add(t.id);
					if (t.type === 'success') {
						fireConfetti();
					}
				}
			});
			// Clean up ids that are no longer present
			const current = new Set(incoming.map((t) => t.id));
			seenIds.forEach((id) => { if (!current.has(id)) seenIds.delete(id); });
			toasts = incoming;
		});
		return unsub;
	});

	function fireConfetti() {
		// Left cannon
		confetti({
			particleCount: 55,
			angle: 60,
			spread: 52,
			origin: { x: 0.25, y: 0.85 },
			colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'],
			ticks: 220,
			gravity: 0.85,
			scalar: 0.95
		});
		// Right cannon
		confetti({
			particleCount: 55,
			angle: 120,
			spread: 52,
			origin: { x: 0.75, y: 0.85 },
			colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'],
			ticks: 220,
			gravity: 0.85,
			scalar: 0.95
		});
		// Center star burst
		confetti({
			particleCount: 25,
			angle: 90,
			spread: 90,
			origin: { x: 0.5, y: 0.88 },
			colors: ['#ffffff', '#ffd700', '#a25afd'],
			ticks: 180,
			gravity: 1.1,
			scalar: 0.7,
			shapes: ['star']
		});
	}

	const icons: Record<string, string> = {
		success: '🎉',
		error: '❌',
		info: '💡'
	};
	const colors: Record<string, string> = {
		success: '#22c55e',
		error: '#ef4444',
		info: '#3b82f6'
	};
</script>

<div class="toast-container">
	{#each toasts as t (t.id)}
		<div
			class="toast"
			style="--accent: {colors[t.type]};"
			in:fly={{ y: 50, duration: 250 }}
			out:fade={{ duration: 200 }}
			animate:flip={{ duration: 250 }}
		>
			<span class="toast-icon">{icons[t.type]}</span>
			<span class="toast-message">{t.message}</span>
			<button class="toast-close" onclick={() => toast.dismiss(t.id)}>✕</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 1.25rem;
		background: var(--bg-secondary);
		border: 1px solid var(--accent);
		border-left: 4px solid var(--accent);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		pointer-events: all;
		min-width: 280px;
		max-width: 400px;
	}

	.toast-icon { font-size: 1.1rem; flex-shrink: 0; }

	.toast-message {
		flex: 1;
		font-size: 0.9rem;
		color: var(--text-primary);
	}

	.toast-close {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.8rem;
		flex-shrink: 0;
		transition: color 0.2s;
	}
	.toast-close:hover { color: var(--text-primary); }
</style>
