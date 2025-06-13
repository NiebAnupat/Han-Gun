<script lang="ts">
	import { onMount } from 'svelte';

	let {
		text,
		children,
		position = 'top',
		delay = 300,
		disabled = false
	}: {
		text: string;
		children: any;
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		disabled?: boolean;
	} = $props();
	let showTooltip = $state(false);
	let timeoutId: number;
	let tooltipElement: HTMLElement;
	let triggerElement: HTMLElement;

	function handleMouseEnter() {
		if (disabled) return;
		timeoutId = setTimeout(() => {
			showTooltip = true;
		}, delay);
	}

	function handleMouseLeave() {
		clearTimeout(timeoutId);
		showTooltip = false;
	}

	function handleFocus() {
		if (disabled) return;
		showTooltip = true;
	}

	function handleBlur() {
		showTooltip = false;
	}

	const positionClasses = {
		top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
	};

	onMount(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

<div
	class="relative inline-block"
	bind:this={triggerElement}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocus={handleFocus}
	onblur={handleBlur}
>
	{@render children?.()}

	{#if showTooltip && text && !disabled}
		<div
			bind:this={tooltipElement}
			class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none {positionClasses[position]}"
			role="tooltip"
		>
			{text}
			<!-- Arrow -->
			<div
				class="absolute w-2 h-2 bg-gray-900 transform rotate-45 {
					position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
					position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
					position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
					'right-full top-1/2 -translate-y-1/2 -mr-1'
				}"
			></div>
		</div>
	{/if}
</div>
