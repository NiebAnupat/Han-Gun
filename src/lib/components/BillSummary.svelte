<script lang="ts">	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { Receipt, QrCode, Copy, Share2, Download } from 'lucide-svelte';
	import { participants, menuItems, billSettings } from '$lib/stores.js';import { calculateBillSummary, calculateTotalBill } from '$lib/bill-calculator.js';
	import { addToast } from '$lib/toast.js';
	import { generateDetailedReport, downloadReport } from '$lib/export.js';
	import type { BillSummary } from '$lib/types.js';

	let billSummary: BillSummary[] = [];
	let totalBill = {
		subtotal: 0,
		serviceCharge: 0,
		vat: 0,
		totalDiscount: 0,
		grandTotal: 0
	};
	// คำนวณใหม่เมื่อข้อมูลเปลี่ยนแปลง
	$: {
		billSummary = calculateBillSummary($participants, $menuItems, $billSettings);
		totalBill = calculateTotalBill($menuItems, $billSettings);
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}
	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			addToast('คัดลอกสำเร็จแล้ว', 'success');
		}).catch(() => {
			addToast('ไม่สามารถคัดลอกได้', 'error');
		});
	}

	function generateSummaryText() {
		let text = '🧾 สรุปยอดเงิน "หารกัน"\n\n';

		// รายละเอียดแต่ละคน
		billSummary.forEach(person => {
			text += `👤 ${person.participantName}\n`;
			text += `   อาหาร: ${formatPrice(person.foodTotal)}\n`;
			text += `   ค่าบริการ: ${formatPrice(person.serviceCharge)}\n`;
			text += `   VAT: ${formatPrice(person.vat)}\n`;
			if (person.discountReceived > 0) {
				text += `   ส่วนลด: -${formatPrice(person.discountReceived)}\n`;
			}
			text += `   รวม: ${formatPrice(person.grandTotal)}\n\n`;
		});

		// ยอดรวมทั้งหมด
		text += '📊 สรุปรวม\n';
		text += `   ยอดอาหาร: ${formatPrice(totalBill.subtotal)}\n`;
		text += `   ค่าบริการ (${$billSettings.serviceChargePercentage}%): ${formatPrice(totalBill.serviceCharge)}\n`;
		text += `   VAT (${$billSettings.vatPercentage}%): ${formatPrice(totalBill.vat)}\n`;
		if (totalBill.totalDiscount > 0) {
			text += `   ส่วนลด: -${formatPrice(totalBill.totalDiscount)}\n`;
		}
		text += `   ยอดรวมสุทธิ: ${formatPrice(totalBill.grandTotal)}\n`;

		return text;
	}
	async function shareResults() {
		const text = generateSummaryText();

		if (navigator.share) {
			try {
				await navigator.share({
					title: 'สรุปยอดเงิน "หารกัน"',
					text: text
				});
				addToast('แชร์สำเร็จแล้ว', 'success');			} catch (err) {
				if (err instanceof Error && err.name !== 'AbortError') {
					copyToClipboard(text);
				}
			}} else {
			copyToClipboard(text);
		}
	}

	function handleDownloadReport() {
		const report = generateDetailedReport($participants, $menuItems, $billSettings);
		const filename = `han-gun-report-${new Date().toISOString().slice(0, 10)}.txt`;
		downloadReport(report, filename);
		addToast('ดาวน์โหลดรายงานเรียบร้อยแล้ว', 'success');
	}
</script>

<Card class="w-full">	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2 min-w-0">
				<Receipt class="h-5 w-5 flex-shrink-0" />
				<span class="truncate">สรุปยอดเงิน</span>
			</div>			{#if billSummary.length > 0}
				<div class="flex gap-1 flex-shrink-0">
					<Tooltip text="คัดลอกข้อความสรุปยอดเงิน">
						<Button variant="outline" size="sm" onclick={() => copyToClipboard(generateSummaryText())} class="hidden sm:inline-flex">
							<Copy class="h-4 w-4 mr-1" />
							คัดลอก
						</Button>
					</Tooltip>
					<Tooltip text="คัดลอกข้อความสรุปยอดเงิน">
						<Button variant="outline" size="sm" onclick={() => copyToClipboard(generateSummaryText())} class="sm:hidden p-2">
							<Copy class="h-4 w-4" />
						</Button>
					</Tooltip>
					<Tooltip text="แชร์สรุปยอดเงิน">
						<Button variant="outline" size="sm" onclick={shareResults} class="hidden sm:inline-flex">
							<Share2 class="h-4 w-4 mr-1" />
							แชร์
						</Button>
					</Tooltip>
					<Tooltip text="แชร์สรุปยอดเงิน">
						<Button variant="outline" size="sm" onclick={shareResults} class="sm:hidden p-2">
							<Share2 class="h-4 w-4" />
						</Button>
					</Tooltip>
					<Tooltip text="ดาวน์โหลดรายงานแบบละเอียด">
						<Button variant="outline" size="sm" onclick={handleDownloadReport} class="hidden sm:inline-flex">
							<Download class="h-4 w-4 mr-1" />
							ดาวน์โหลด
						</Button>
					</Tooltip>
					<Tooltip text="ดาวน์โหลดรายงานแบบละเอียด">
						<Button variant="outline" size="sm" onclick={handleDownloadReport} class="sm:hidden p-2">
							<Download class="h-4 w-4" />
						</Button>
					</Tooltip>
				</div>
			{/if}
		</CardTitle>
	</CardHeader>	<CardContent>
		{#if billSummary.length > 0}
			<div class="space-y-4 sm:space-y-6">
				<!-- Mobile View: Cards -->
				<div class="block sm:hidden space-y-3">
					{#each billSummary as person (person.participantId)}
						<div class="rounded-lg border p-3 bg-card/50">
							<div class="flex items-center justify-between mb-2">
								<h4 class="font-medium text-base">{person.participantName}</h4>
								<Badge variant="outline" class="text-sm font-medium">
									{formatPrice(person.grandTotal)}
								</Badge>
							</div>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">อาหาร:</span>
									<span>{formatPrice(person.foodTotal)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">ค่าบริการ:</span>
									<span>{formatPrice(person.serviceCharge)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">VAT:</span>
									<span>{formatPrice(person.vat)}</span>
								</div>
								{#if person.discountReceived > 0}
									<div class="flex justify-between">
										<span class="text-muted-foreground">ส่วนลด:</span>
										<span class="text-destructive">-{formatPrice(person.discountReceived)}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Desktop View: Table -->
				<div class="hidden sm:block">
					<div class="rounded-md border overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ชื่อ</TableHead>
									<TableHead class="text-right">อาหาร</TableHead>
									<TableHead class="text-right">ค่าบริการ</TableHead>
									<TableHead class="text-right">VAT</TableHead>
									{#if $billSettings.discount}
										<TableHead class="text-right">ส่วนลด</TableHead>
									{/if}
									<TableHead class="text-right font-medium">รวม</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each billSummary as person (person.participantId)}
									<TableRow>
										<TableCell class="font-medium">
											{person.participantName}
										</TableCell>
										<TableCell class="text-right">
											{formatPrice(person.foodTotal)}
										</TableCell>
										<TableCell class="text-right">
											{formatPrice(person.serviceCharge)}
										</TableCell>
										<TableCell class="text-right">
											{formatPrice(person.vat)}
										</TableCell>
										{#if $billSettings.discount}
											<TableCell class="text-right">
												{person.discountReceived > 0 ? `-${formatPrice(person.discountReceived)}` : '-'}
											</TableCell>
										{/if}
										<TableCell class="text-right font-medium">
											<Badge variant="outline" class="text-sm">
												{formatPrice(person.grandTotal)}
											</Badge>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</div>

				<!-- สรุปยอดรวม -->
				<div class="rounded-lg border p-3 sm:p-4 bg-muted/50">
					<h4 class="font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
						📊 สรุปยอดรวม
					</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">ยอดอาหาร:</span>
							<span>{formatPrice(totalBill.subtotal)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">ค่าบริการ ({$billSettings.serviceChargePercentage}%):</span>
							<span>{formatPrice(totalBill.serviceCharge)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">VAT ({$billSettings.vatPercentage}%):</span>
							<span>{formatPrice(totalBill.vat)}</span>
						</div>
						{#if totalBill.totalDiscount > 0}
							<div class="flex justify-between">
								<span class="text-muted-foreground">ส่วนลด:</span>
								<span class="text-destructive">-{formatPrice(totalBill.totalDiscount)}</span>
							</div>
						{/if}
						<div class="col-span-1 sm:col-span-2 border-t pt-2 mt-2">
							<div class="flex justify-between font-medium text-base sm:text-lg">
								<span>ยอดรวมสุทธิ:</span>
								<span class="text-primary">
									{formatPrice(totalBill.grandTotal)}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- แสดงจำนวนคน -->
				<div class="text-center text-xs sm:text-sm text-muted-foreground">
					👥 ทั้งหมด {billSummary.length} คน
				</div>
			</div>
		{:else}
			<div class="text-center py-6 sm:py-8 text-muted-foreground">
				<Receipt class="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
				<p class="text-sm sm:text-base">ยังไม่มีข้อมูลสำหรับคำนวณ</p>
				<p class="text-xs sm:text-sm mt-1">เริ่มต้นด้วยการเพิ่มผู้เข้าร่วมและรายการอาหาร</p>
			</div>
		{/if}
	</CardContent>
</Card>
