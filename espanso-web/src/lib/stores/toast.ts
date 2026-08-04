import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	function show(message: string, type: ToastType = 'info', duration = 3500) {
		const id = Math.random().toString(36).slice(2);
		update((toasts) => [...toasts, { id, message, type }]);
		setTimeout(() => {
			dismiss(id);
		}, duration);
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return { subscribe, show, dismiss };
}

export const toast = createToastStore();
