<script lang="ts">
	import { toasts, removeToast } from '$lib/toast.js';
	import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { fade, fly } from 'svelte/transition';

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return AlertCircle;
			case 'warning':
				return AlertTriangle;
			default:
				return Info;
		}
	}

	function getColorClasses(type: string) {
		switch (type) {
			case 'success':
				return 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-100 dark:border-green-800';
			case 'error':
				return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-100 dark:border-red-800';
			case 'warning':
				return 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-100 dark:border-yellow-800';
			default:
				return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/10 dark:text-blue-100 dark:border-blue-800';
		}
	}
</script>

<!-- Toast Container -->
{#if $toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
		{#each $toasts as toast (toast.id)}
			<div
				in:fly={{ x: 300, duration: 300 }}
				out:fade={{ duration: 200 }}
				class="pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm {getColorClasses(toast.type)}"
			>
				<svelte:component this={getIcon(toast.type)} class="h-5 w-5 flex-shrink-0" />
				<div class="flex-1">
					<p class="text-sm font-medium">{toast.message}</p>
				</div>
				<Button
					size="sm"
					variant="ghost"
					onclick={() => removeToast(toast.id)}
					class="h-6 w-6 p-0 hover:bg-white/20"
				>
					<X class="h-3 w-3" />
				</Button>
			</div>
		{/each}
	</div>
{/if}
