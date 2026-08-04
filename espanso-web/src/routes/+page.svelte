<script lang="ts">
	import confetti from 'canvas-confetti';
	import { signIn } from '@auth/sveltekit/client';
	
	let { data } = $props();

	// Demo snippets to cycle through
	const demoSnippets = [
		{ trigger: ':date',      replacement: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
		{ trigger: ':email',     replacement: 'hello@yourname.com' },
		{ trigger: ':sig',       replacement: 'Best regards,\nYour Name\nYour Company' },
		{ trigger: ':meet',      replacement: 'Happy to jump on a call — here\'s my Calendly: https://cal.com/you' },
		{ trigger: ':thanks',    replacement: 'Thank you so much for reaching out! I really appreciate it. 🙌' },
	];

	let snippetIndex = $state(0);
	let inputValue = $state('');
	let expanded = $state(false);
	let expanding = $state(false);
	let showExpanded = $state(false);

	let currentSnippet = $derived(demoSnippets[snippetIndex % demoSnippets.length]);

	async function expand() {
		if (expanding) return;
		expanding = true;
		// Simulate the "typing detection" flash
		await sleep(120);
		expanded = true;
		expanding = false;

		// Fire confetti from center-bottom like TextBlaze
		await sleep(80);
		confetti({ particleCount: 60, angle: 60, spread: 50, origin: { x: 0.25, y: 0.75 }, colors: ['#26ccff','#a25afd','#ff5e7e','#88ff5a','#fcff42','#ffa62d'], ticks: 220, gravity: 0.85 });
		confetti({ particleCount: 60, angle: 120, spread: 50, origin: { x: 0.75, y: 0.75 }, colors: ['#26ccff','#a25afd','#ff5e7e','#88ff5a','#fcff42','#ffa62d'], ticks: 220, gravity: 0.85 });
		confetti({ particleCount: 20, angle: 90, spread: 80, origin: { x: 0.5, y: 0.78 }, colors: ['#ffffff','#ffd700','#a25afd'], ticks: 180, gravity: 1.1, scalar: 0.7, shapes: ['star'] });
	}

	function reset() {
		expanded = false;
		inputValue = '';
		snippetIndex++;
	}

	function sleep(ms: number) {
		return new Promise(r => setTimeout(r, ms));
	}

	// Auto-type the trigger into the input for the demo
	let typingTimeout: ReturnType<typeof setTimeout>;
	function autoType() {
		if (expanded) { reset(); return; }
		inputValue = '';
		expanded = false;
		const trigger = currentSnippet.trigger;
		let i = 0;
		clearTimeout(typingTimeout);
		function type() {
			if (i < trigger.length) {
				inputValue += trigger[i++];
				typingTimeout = setTimeout(type, 80);
			} else {
				setTimeout(expand, 300);
			}
		}
		type();
	}
</script>

<svelte:head>
	<title>Devspanso | Sync Your Snippets</title>
	<meta name="description" content="A powerful cloud dashboard to sync, manage, and edit your Espanso shortcuts anywhere." />
</svelte:head>

<div class="hero">
	<div class="container animate-fade-in">
		<div class="hero-content">
			<div class="badge">Introducing Devspanso</div>
			<h1 class="hero-title">Your Snippets, <span class="highlight">Everywhere.</span></h1>
			<p class="hero-subtitle">
				Type a short trigger, watch it expand instantly. Manage all your shortcuts in one beautiful place.
			</p>
			<div class="hero-actions">
				{#if data.session}
					<a href="/dashboard" class="btn btn-primary btn-lg">Go to Dashboard</a>
				{:else}
					<button class="btn btn-primary btn-lg" onclick={() => signIn('google')}>Sign In with Google</button>
				{/if}
			</div>
		</div>

		<!-- Interactive Demo -->
		<div class="demo-card glass-card">
			<div class="demo-header">
				<div class="demo-dots">
					<div class="dot red"></div>
					<div class="dot yellow"></div>
					<div class="dot green"></div>
				</div>
				<span class="demo-title">Try it live</span>
			</div>

			<div class="demo-body">
				<div class="snippet-row">
					<span class="label">Trigger</span>
					<code class="trigger-badge">{currentSnippet.trigger}</code>
					<span class="arrow">→</span>
					<span class="label">expands to</span>
					<span class="replacement-preview">{currentSnippet.replacement.split('\n')[0]}{currentSnippet.replacement.includes('\n') ? '…' : ''}</span>
				</div>

				<div class="type-area">
					{#if !expanded}
						<div class="input-wrap">
							<input
								id="demo-input"
								class="demo-input"
								type="text"
								placeholder="Start typing your trigger..."
								bind:value={inputValue}
								onkeydown={(e) => { if (e.key === 'Enter') expand(); }}
								autocomplete="off"
								spellcheck="false"
							/>
							<button class="expand-btn" onclick={expand} disabled={expanding}>
								{#if expanding}
									<span class="spinner"></span>
								{:else}
									Expand ↵
								{/if}
							</button>
						</div>
						<p class="hint">Type <code>{currentSnippet.trigger}</code> and press Expand — or <button class="link-btn" onclick={autoType}>auto-demo it</button></p>
					{:else}
						<div class="expanded-result">
							<div class="expanded-label">✨ Expanded!</div>
							<div class="expanded-text">{currentSnippet.replacement}</div>
							<button class="btn btn-outline try-next-btn" onclick={reset}>Try next snippet →</button>
						</div>
					{/if}
				</div>

				<div class="snippet-dots">
					{#each demoSnippets as _, i}
						<button
							class="snippet-dot {i === snippetIndex % demoSnippets.length ? 'active' : ''}"
							onclick={() => { snippetIndex = i; expanded = false; inputValue = ''; }}
							aria-label="Demo snippet {i + 1}"
						></button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.hero {
		padding: 5rem 0 7rem;
		overflow: hidden;
		position: relative;
	}

	.hero::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60vw;
		height: 60vw;
		background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(15,17,21,0) 70%);
		z-index: -1;
		pointer-events: none;
	}

	.hero-content {
		text-align: center;
		max-width: 700px;
		margin: 0 auto 3.5rem;
	}

	.badge {
		display: inline-block;
		padding: 0.4rem 1rem;
		background: rgba(59, 130, 246, 0.1);
		color: var(--accent-primary);
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 1.25rem;
		border: 1px solid rgba(59, 130, 246, 0.2);
	}

	.hero-title {
		font-size: 3.75rem;
		line-height: 1.1;
		margin-bottom: 1.25rem;
	}

	.highlight {
		background: linear-gradient(135deg, #60a5fa, #a78bfa);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-subtitle {
		font-size: 1.15rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 560px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.7;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-lg {
		padding: 0.9rem 2rem;
		font-size: 1rem;
	}

	/* ── Demo Card ── */
	.demo-card {
		max-width: 680px;
		margin: 0 auto;
		padding: 0;
		overflow: hidden;
	}

	.demo-header {
		background: rgba(255,255,255,0.03);
		border-bottom: 1px solid var(--border-color);
		padding: 0.9rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.demo-dots {
		display: flex;
		gap: 0.4rem;
	}

	.dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
	}
	.dot.red    { background: #ff5f56; }
	.dot.yellow { background: #ffbd2e; }
	.dot.green  { background: #27c93f; }

	.demo-title {
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.demo-body {
		padding: 1.75rem 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Snippet preview row */
	.snippet-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		font-size: 0.875rem;
	}

	.label {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.trigger-badge {
		background: rgba(59,130,246,0.12);
		color: #60a5fa;
		border: 1px solid rgba(59,130,246,0.25);
		border-radius: 6px;
		padding: 0.2rem 0.55rem;
		font-family: 'Fira Code', monospace;
		font-size: 0.85rem;
	}

	.arrow {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.replacement-preview {
		color: var(--text-primary);
		font-size: 0.875rem;
		background: rgba(255,255,255,0.05);
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
		max-width: 220px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Type area */
	.type-area {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-wrap {
		display: flex;
		gap: 0.5rem;
	}

	.demo-input {
		flex: 1;
		padding: 0.75rem 1rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: 'Fira Code', monospace;
		font-size: 0.95rem;
		transition: border-color 0.2s, box-shadow 0.2s;
		outline: none;
	}

	.demo-input:focus {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(59,130,246,0.18);
	}

	.expand-btn {
		padding: 0.75rem 1.25rem;
		background: var(--accent-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
		box-shadow: 0 4px 14px rgba(59,130,246,0.35);
		display: flex;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
	}

	.expand-btn:hover:not(:disabled) {
		background: var(--accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(59,130,246,0.45);
	}

	.expand-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	.hint {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.hint code {
		background: rgba(255,255,255,0.07);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-family: 'Fira Code', monospace;
		font-size: 0.78rem;
		color: #60a5fa;
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--accent-primary);
		cursor: pointer;
		font-size: inherit;
		padding: 0;
		text-decoration: underline;
		text-decoration-style: dotted;
		transition: color 0.15s;
	}

	.link-btn:hover { color: var(--accent-hover); }

	/* Expanded result */
	.expanded-result {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
	}

	@keyframes popIn {
		from { opacity: 0; transform: scale(0.94) translateY(6px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}

	.expanded-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #22c55e;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.expanded-text {
		background: rgba(34,197,94,0.06);
		border: 1px solid rgba(34,197,94,0.2);
		border-left: 3px solid #22c55e;
		border-radius: var(--radius-sm);
		padding: 0.85rem 1rem;
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		color: var(--text-primary);
		white-space: pre-wrap;
		line-height: 1.6;
	}

	.try-next-btn {
		align-self: flex-start;
		padding: 0.55rem 1rem;
		font-size: 0.875rem;
	}

	/* Snippet selector dots */
	.snippet-dots {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
	}

	.snippet-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--border-color);
		border: none;
		cursor: pointer;
		transition: background 0.2s, transform 0.2s;
		padding: 0;
	}

	.snippet-dot.active {
		background: var(--accent-primary);
		transform: scale(1.4);
	}

	.snippet-dot:hover:not(.active) {
		background: var(--text-secondary);
	}
</style>
