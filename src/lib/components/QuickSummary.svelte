<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Users, UtensilsCrossed, Receipt } from 'lucide-svelte';
	import { participants, menuItems, billSettings } from '$lib/stores.js';
	import { calculateTotalBill } from '$lib/bill-calculator.js';

	$: totalBill = calculateTotalBill($menuItems, $billSettings);
	$: hasData = $participants.length > 0 || $menuItems.length > 0;

	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}
</script>

{#if hasData}
	<Card class="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
		<CardContent class="p-4">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
				<div class="flex flex-col sm:flex-row sm:items-center gap-4">
					<div class="flex items-center gap-2">
						<Users class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">ผู้เข้าร่วม:</span>
						<Badge variant="secondary">{$participants.length} คน</Badge>
					</div>
					<div class="flex items-center gap-2">
						<UtensilsCrossed class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">เมนู:</span>
						<Badge variant="secondary">{$menuItems.length} รายการ</Badge>
					</div>
				</div>
				{#if $menuItems.length > 0}
					<div class="flex items-center gap-2">
						<Receipt class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">ยอดรวม:</span>
						<Badge variant="outline" class="font-semibold text-lg">
							{formatPrice(totalBill.grandTotal)}
						</Badge>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
{/if}
