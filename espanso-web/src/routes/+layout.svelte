<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import UISniper from '$lib/components/UISniper.svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';

	let { children, data } = $props();
</script>


<nav class="navbar">
	<div class="container nav-container">
		<a href="/" class="logo">
			<span class="logo-icon">✨</span>
			Devspanso
		</a>
		<div class="nav-links">
			<a href="/setup" class="nav-link">Setup Guide</a>
			{#if data.session}
				<a href="/dashboard" class="btn btn-primary">Dashboard</a>
				<button class="nav-link" style="background:none; border:none; cursor:pointer;" onclick={() => signOut()}>Sign Out</button>
			{:else}
				<button class="btn btn-primary" onclick={() => signIn('google')}>Sign In with Google</button>
			{/if}
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>
<Toast />
<UISniper />


<style>
	.navbar {
		background: var(--glass-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border-color);
		position: sticky;
		top: 0;
		z-index: 50;
	}
	.nav-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4.5rem;
	}
	.logo {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.logo-icon {
		font-size: 1.5rem;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	.nav-link {
		color: var(--text-secondary);
		font-weight: 500;
		transition: color 0.2s;
	}
	.nav-link:hover {
		color: var(--text-primary);
	}
</style>
