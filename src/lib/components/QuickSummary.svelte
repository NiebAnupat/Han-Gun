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
	<Card class="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
		<CardContent class="p-3 sm:p-4">
			<div class="flex flex-col gap-3 sm:gap-4 text-sm">
				<!-- Top Row: Participants and Menu items -->
				<div class="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
					<div class="flex items-center gap-2">
						<Users class="h-4 w-4 text-muted-foreground flex-shrink-0" />
						<span class="text-muted-foreground">ผู้เข้าร่วม:</span>
						<Badge variant="secondary" class="text-xs">{$participants.length} คน</Badge>
					</div>
					<div class="flex items-center gap-2">
						<UtensilsCrossed class="h-4 w-4 text-muted-foreground flex-shrink-0" />
						<span class="text-muted-foreground">เมนู:</span>
						<Badge variant="secondary" class="text-xs">{$menuItems.length} รายการ</Badge>
					</div>
				</div>

				<!-- Bottom Row: Total amount -->
				{#if $menuItems.length > 0}
					<div class="flex items-center justify-between sm:justify-start sm:gap-4 pt-2 border-t border-primary/20">
						<div class="flex items-center gap-2">
							<Receipt class="h-4 w-4 text-muted-foreground flex-shrink-0" />
							<span class="text-muted-foreground">ยอดรวม:</span>
						</div>
						<Badge variant="outline" class="font-semibold text-base sm:text-lg bg-primary/5">
							{formatPrice(totalBill.grandTotal)}
						</Badge>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
{/if}
