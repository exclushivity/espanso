<svelte:head>
	<title>Setup Guide | Devspanso</title>
	<meta name="description" content="Step-by-step guide to install Espanso and connect it to your cloud account." />
</svelte:head>

<div class="container animate-fade-in">
	<div class="setup-hero">
		<div class="badge">Quick Setup</div>
		<h1>Get Devspanso <span class="highlight">Running</span></h1>
		<p class="subtitle">Follow these steps to connect your local Espanso installation to your cloud dashboard and start syncing snippets across all your devices.</p>
	</div>

	<div class="steps">
		<!-- Step 1 -->
		<div class="step glass-card">
			<div class="step-number">01</div>
			<div class="step-content">
				<h2>Install Espanso</h2>
				<p>If you don't have Espanso installed yet, download and install it from the official website.</p>
				<div class="code-block">
					<div class="code-header">
						<span>Linux (Flatpak)</span>
						<button class="copy-btn" onclick={() => navigator.clipboard.writeText('flatpak install flathub dev.devare.devspanso')}>Copy</button>
					</div>
					<pre><code>flatpak install flathub dev.devare.devspanso</code></pre>
				</div>
				<div class="code-block">
					<div class="code-header">
						<span>macOS (Homebrew)</span>
						<button class="copy-btn" onclick={() => navigator.clipboard.writeText('brew install espanso')}>Copy</button>
					</div>
					<pre><code>brew install espanso</code></pre>
				</div>
				<a href="https://espanso.org/install/" target="_blank" class="btn btn-outline" style="margin-top: 1rem;">View all install options →</a>
			</div>
		</div>

		<!-- Step 2 -->
		<div class="step glass-card">
			<div class="step-number">02</div>
			<div class="step-content">
				<h2>Connect to Devspanso</h2>
				<p>Simply use the built-in sync command to log in. This will open your browser so you can securely authenticate with your account.</p>
				<div class="code-block">
					<div class="code-header">
						<span>Terminal</span>
						<button class="copy-btn" onclick={() => navigator.clipboard.writeText('espanso sync login')}>Copy</button>
					</div>
					<pre><code>espanso sync login</code></pre>
				</div>
				<div class="info-box">
					<span class="info-icon">💡</span>
					<span>This securely registers your device with the cloud and automatically configures everything. You can log out anytime using <code class="inline-code">espanso sync logout</code>.</span>
				</div>
			</div>
		</div>

		<!-- Step 3 -->
		<div class="step glass-card">
			<div class="step-number">03</div>
			<div class="step-content">
				<h2>Start the Sync Daemon</h2>
				<p>Espanso will now automatically sync your snippets in the background while the daemon is running. To make sure the sync service is active, restart your daemon.</p>
				<div class="code-block">
					<div class="code-header">
						<span>Terminal</span>
						<button class="copy-btn" onclick={() => navigator.clipboard.writeText('espanso restart')}>Copy</button>
					</div>
					<pre><code>espanso restart</code></pre>
				</div>
				<div class="info-box" style="margin-top: 1rem;">
					<span class="info-icon">🔄</span>
					<span>The sync agent runs transparently in the background, keeping your snippets instantly synced across all devices whenever a change is detected!</span>
				</div>
			</div>
		</div>

		<!-- Step 5 -->
		<div class="step glass-card">
			<div class="step-number">05</div>
			<div class="step-content">
				<h2>Start Typing!</h2>
				<p>That's it! Go to your <a href="/dashboard">dashboard</a>, create a new snippet, and it will instantly appear in Espanso on all your connected devices.</p>
				<div class="demo">
					<div class="demo-item">
						<span class="demo-trigger">:date</span>
						<span class="demo-arrow">→</span>
						<span class="demo-replacement">2026-08-04</span>
					</div>
					<div class="demo-item">
						<span class="demo-trigger">:sig</span>
						<span class="demo-arrow">→</span>
						<span class="demo-replacement">Best regards, Your Name</span>
					</div>
					<div class="demo-item">
						<span class="demo-trigger">:addr</span>
						<span class="demo-arrow">→</span>
						<span class="demo-replacement">123 Main Street, City, Country</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="cta glass-card">
		<h2>Ready to get started?</h2>
		<p>Sign in with Google to create your free account and start managing your snippets from anywhere.</p>
		<a href="/dashboard" class="btn btn-primary btn-lg">Go to Dashboard →</a>
	</div>
</div>

<style>
	.setup-hero {
		text-align: center;
		padding: 4rem 0 3rem;
		max-width: 700px;
		margin: 0 auto;
	}
	.badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.1);
		color: var(--accent-primary);
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
		border: 1px solid rgba(59, 130, 246, 0.2);
	}
	h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	.highlight {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.subtitle {
		font-size: 1.1rem;
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.step {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 2rem;
		align-items: start;
	}

	.step-number {
		font-size: 3rem;
		font-weight: 700;
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		line-height: 1;
	}

	.step-content h2 {
		font-size: 1.5rem;
		margin-bottom: 0.75rem;
	}
	.step-content p {
		color: var(--text-secondary);
		line-height: 1.7;
		margin-bottom: 1rem;
	}

	.code-block {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
		margin-bottom: 1rem;
	}
	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--bg-hover);
		font-size: 0.8rem;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-color);
	}
	.copy-btn {
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: 0.2rem 0.6rem;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.2s;
	}
	.copy-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}
	pre {
		padding: 1rem;
		overflow-x: auto;
	}
	code {
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		color: #98c379;
	}
	.inline-code {
		background: var(--bg-hover);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-family: 'Fira Code', monospace;
		font-size: 0.88em;
		color: var(--accent-primary);
	}

	.info-box {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		background: rgba(59, 130, 246, 0.08);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: var(--radius-sm);
		padding: 1rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
	}
	.info-icon { font-size: 1.2rem; }

	.demo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.demo-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-color);
	}
	.demo-trigger {
		font-family: 'Fira Code', monospace;
		color: var(--accent-primary);
		font-weight: 600;
		min-width: 80px;
	}
	.demo-arrow { color: var(--text-secondary); }
	.demo-replacement {
		color: var(--text-primary);
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
	}

	.cta {
		text-align: center;
		padding: 3rem;
		margin-bottom: 4rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
		border-color: rgba(59, 130, 246, 0.2);
	}
	.cta h2 { font-size: 2rem; margin-bottom: 0.75rem; }
	.cta p { color: var(--text-secondary); margin-bottom: 1.5rem; }
	.btn-lg { padding: 1rem 2rem; font-size: 1.1rem; }
</style>
