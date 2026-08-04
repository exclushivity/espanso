<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { mountUISniper } from 'ui-sniper';

	let { props = {} }: { props?: Record<string, unknown> } = $props();

	let container: HTMLDivElement;
	let sniperInstance: any = null;
	let isActive = $state(false);
	let isVisible = $state(false); // Hidden by default!

	onMount(() => {
		if (typeof window === 'undefined' || !container) return;

		sniperInstance = mountUISniper(container, {
			...props,
			onActivate:   () => { isActive = true; },
			onDeactivate: () => { 
				isActive = false; 
				// Hide the container entirely after a short delay for closing animations
				setTimeout(() => {
					if (!isActive) isVisible = false;
				}, 350);
			}
		});

		// Pressing 'f' then '1' (within 1s) toggles UISniper
		let lastKey = '';
		let keyTimer: ReturnType<typeof setTimeout>;

		function handleKeydown(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

			if (e.key === 'f' || e.key === 'F') {
				lastKey = 'f';
				clearTimeout(keyTimer);
				keyTimer = setTimeout(() => { lastKey = ''; }, 1000);
			} else if (e.key === '1' && lastKey === 'f') {
				lastKey = '';
				clearTimeout(keyTimer);
				
				// Get all buttons across shadow boundaries
				function getAllButtons(root: ParentNode): HTMLElement[] {
					let buttons = Array.from(root.querySelectorAll('button, [role="button"]')) as HTMLElement[];
					for (const child of Array.from(root.children)) {
						if (child.shadowRoot) {
							buttons = buttons.concat(getAllButtons(child.shadowRoot));
						}
					}
					return buttons;
				}

				if (!isVisible) {
					// Show the container
					isVisible = true;
					// Wait for the DOM to apply display:block, then click the trigger to open
					setTimeout(() => {
						const buttons = getAllButtons(container);
						if (buttons.length > 0) buttons[0].click();
					}, 50);
				} else {
					const buttons = getAllButtons(container);
					if (buttons.length > 0) {
						if (isActive) {
							// Find the close button by its SVG path (X icon)
							const closeBtn = buttons.find(b => b.innerHTML.includes('M4 4l8 8M12 4l-8 8')) || buttons[buttons.length - 1];
							if (closeBtn) closeBtn.click();
						} else {
							// If it's visible but not active, just click the trigger
							buttons[0].click();
						}
					}
				}
			} else {
				lastKey = '';
				clearTimeout(keyTimer);
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => { window.removeEventListener('keydown', handleKeydown); clearTimeout(keyTimer); };
	});

	$effect(() => {
		if (sniperInstance && props) {
			sniperInstance.update({
				...props,
				onActivate:   () => { isActive = true; },
				onDeactivate: () => { 
					isActive = false;
					setTimeout(() => {
						if (!isActive) isVisible = false;
					}, 350);
				}
			});
		}
	});

	onDestroy(() => {
		sniperInstance?.unmount();
		sniperInstance = null;
	});
</script>

<div bind:this={container} class="ui-sniper-wrapper" class:hidden={!isVisible}></div>

<style>
	.ui-sniper-wrapper {
		pointer-events: none; 
		position: fixed; 
		top: 0; 
		left: 0; 
		width: 100%; 
		z-index: 999999;
	}
	
	/* Use !important so the React library cannot overwrite the hidden state */
	.ui-sniper-wrapper.hidden {
		display: none !important;
	}
</style>
