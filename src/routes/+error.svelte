<script lang="ts">
	import { page } from '$app/stores';
	import { AlertTriangle, Home, RefreshCw } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div
	class="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4"
>
	<div
		class="bg-card animate-in fade-in-50 slide-in-from-bottom-5 w-full max-w-md rounded-xl border p-8 text-center shadow-lg duration-300"
	>
		<!-- Error Icon -->
		<div class="mb-6 flex justify-center">
			<div class="bg-destructive/10 rounded-full p-4">
				<AlertTriangle class="text-destructive h-12 w-12" />
			</div>
		</div>

		<!-- Status Code -->
		<h1 class="text-foreground mb-2 text-6xl font-bold">
			{$page.status}
		</h1>

		<!-- Error Title -->
		<h2 class="text-foreground mb-4 text-xl font-semibold">
			{#if $page.status === 404}
				Page Not Found
			{:else if $page.status === 500}
				Internal Server Error
			{:else if $page.status === 403}
				Access Forbidden
			{:else}
				Something Went Wrong
			{/if}
		</h2>

		<!-- Error Message -->
		<p class="text-muted-foreground mb-8 leading-relaxed">
			{#if $page.status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if $page.status === 500}
				We're experiencing some technical difficulties. Please try again later.
			{:else}
				{$page.error?.message || 'An unexpected error occurred. Please try again.'}
			{/if}
		</p>

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-3 sm:flex-row">
			<Button href="/" class="inline-flex items-center gap-2">
				<Home class="h-4 w-4" />
				Go Home
			</Button>

			<Button
				variant="outline"
				onclick={() => window.location.reload()}
				class="inline-flex items-center gap-2"
			>
				<RefreshCw class="h-4 w-4" />
				Try Again
			</Button>
		</div>

		<!-- Additional Info -->
		<div class="mt-8 border-t pt-6">
			<p class="text-muted-foreground text-sm">
				Error Code: <code class="bg-muted text-foreground rounded px-2 py-1 font-mono text-xs"
					>{$page.status}</code
				>
			</p>
		</div>
	</div>
</div>
