<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	
	let { data } = $props();
	
	let snippets = $state(data.snippets || []);
	
	// When data updates (e.g. after form submission), update our local state
	$effect(() => {
		snippets = data.snippets || [];
	});

	let activeSnippet = $state(snippets.length > 0 ? snippets[0] : null);

	function selectSnippet(s: any) {
		activeSnippet = s;
	}

	function createSnippet() {
		// Cast to `any` since a new snippet won't have DB-generated fields yet
		// The server will fill in userId, hash, createdAt, updatedAt on save
		const newSnippet = {
			id: 'new',
			trigger: ':new',
			replacement: 'New snippet text...',
			hash: '',
			changedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: ''
		} as const;
		activeSnippet = newSnippet as any;
	}

	function handleSaveEnhance({ action }: { action: URL }) {
		const isDelete = action.search.includes('delete');
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				if (isDelete) {
					toast.show('Snippet deleted.', 'info');
					activeSnippet = null;
				} else {
					toast.show('Snippet saved! 🎉', 'success');
				}
			} else {
				toast.show('Something went wrong. Please try again.', 'error');
			}
			await update();
		};
	}
</script>

<svelte:head>
	<title>Dashboard | Devspanso</title>
</svelte:head>

<div class="dashboard container animate-fade-in">
	<header class="dash-header">
		<div>
			<h2>Your Snippets</h2>
			<p class="text-secondary">Manage your text expansion snippets</p>
		</div>
		<button class="btn btn-primary" onclick={createSnippet}>
			<span class="icon">+</span> New Snippet
		</button>
	</header>

	<div class="workspace">
		<!-- Sidebar list -->
		<div class="sidebar glass-card">
			<div class="search-box">
				<input type="text" class="input" placeholder="Search snippets..." />
			</div>
			<div class="snippet-list">
				{#each snippets as snippet}
					<button 
						class="snippet-item {snippet.id === activeSnippet?.id ? 'active' : ''}"
						onclick={() => selectSnippet(snippet)}
					>
						<div class="snippet-trigger">{snippet.trigger}</div>
						<div class="snippet-preview">{snippet.replacement.substring(0, 30)}...</div>
					</button>
				{/each}
				{#if snippets.length === 0}
					<div class="empty-state" style="padding: 1rem; text-align: center; font-size: 0.9rem;">
						No snippets yet.
					</div>
				{/if}
			</div>
		</div>

		<!-- Editor -->
		<div class="editor-area glass-card">
			{#if activeSnippet}
				<form method="POST" action="?/save" use:enhance={handleSaveEnhance}>
					<div class="editor-toolbar">
						<h3>Edit Snippet</h3>
						<div style="display: flex; gap: 0.5rem;">
							{#if activeSnippet.id !== 'new'}
								<button type="submit" formaction="?/delete" class="btn btn-outline" style="color: #ff5f56; border-color: #ff5f56;">Delete</button>
							{/if}
							<button type="submit" class="btn btn-primary">Save Changes</button>
						</div>
					</div>
					
					<input type="hidden" name="id" value={activeSnippet.id} />
					
					<div class="form-group">
						<label for="trigger">Trigger (what you type)</label>
						<input type="text" name="trigger" id="trigger" class="input trigger-input" bind:value={activeSnippet.trigger} />
					</div>
					<div class="form-group">
						<label for="replacement">Replacement (what gets expanded)</label>
						<textarea name="replacement" id="replacement" class="input editor-textarea" bind:value={activeSnippet.replacement}></textarea>
					</div>
				</form>
			{:else}
				<div class="empty-state">
					<p>Select a snippet to edit or create a new one.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.dashboard {
		padding: 2rem 0;
	}

	.dash-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.text-secondary {
		color: var(--text-secondary);
	}

	.icon {
		margin-right: 0.5rem;
		font-weight: bold;
	}

	.workspace {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
		height: calc(100vh - 200px);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		height: 100%;
		overflow: hidden;
	}

	.search-box {
		margin-bottom: 1rem;
	}

	.snippet-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.snippet-item {
		background: transparent;
		border: 1px solid transparent;
		text-align: left;
		padding: 1rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-primary);
	}

	.snippet-item:hover {
		background: var(--bg-hover);
	}

	.snippet-item.active {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.snippet-trigger {
		font-weight: 600;
		color: var(--accent-primary);
		margin-bottom: 0.25rem;
	}

	.snippet-preview {
		font-size: 0.85rem;
		color: var(--text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.editor-area {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		height: 100%;
	}

	.editor-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	form {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}
	
	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.trigger-input {
		font-family: 'Fira Code', monospace;
		font-size: 1.1rem;
		color: var(--accent-primary);
	}

	.editor-textarea {
		flex: 1;
		min-height: 300px;
		font-family: 'Fira Code', monospace;
		resize: none;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
	}
</style>
