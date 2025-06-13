<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import {
		History,
		Eye,
		Trash2,
		Save,
		FileText,
		Calendar,
		Users,
		DollarSign,
		Trash,
		Download,
		Upload,
		FileDown,
		FileUp
	} from 'lucide-svelte';
	import {
		history,
		saveBillToHistory,
		removeHistoryEntry,
		clearCurrentBill,
		importHistoryData
	} from '$lib/stores.js';
	import { calculateBillSummary } from '$lib/bill-calculator.js';
	import { participants, menuItems, billSettings } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import type { HistoryEntry, BillSummary } from '$lib/types.js';
	import { clearHistory } from '$lib/localStorage.js';
	import {
		exportHistory,
		importHistory,
		exportHistoryCSV,
		generateHistoryReport,
		downloadReport
	} from '$lib/export.js';
	let isSaveDialogOpen = false;
	let isViewDialogOpen = false;
	let isImportDialogOpen = false;
	let saveDialogName = '';
	let selectedEntry: HistoryEntry | null = null;
	let billSummary: BillSummary[] = [];
	let fileInput: HTMLInputElement;
	let importMode: 'merge' | 'replace' = 'merge';

	// คำนวณยอดเงินของแต่ละคน
	$: billSummary = calculateBillSummary($participants, $menuItems, $billSettings);

	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function saveBill() {
		if (!saveDialogName.trim()) {
			addToast('กรุณาใส่ชื่อบิล', 'error');
			return;
		}

		if (billSummary.length === 0) {
			addToast('ยังไม่มีข้อมูลบิลให้บันทึก', 'error');
			return;
		}

		saveBillToHistory(saveDialogName, billSummary);
		addToast('บันทึกบิลลงประวัติเรียบร้อยแล้ว', 'success');

		// ล้างข้อมูลปัจจุบันหลังบันทึก
		clearCurrentBill();
		addToast('ล้างข้อมูลปัจจุบันแล้ว พร้อมเริ่มบิลใหม่', 'info');

		// ปิด dialog และล้างชื่อ
		isSaveDialogOpen = false;
		saveDialogName = '';
	}

	function viewHistoryEntry(entry: HistoryEntry) {
		selectedEntry = entry;
		isViewDialogOpen = true;
	}

	function deleteHistoryEntry(id: string, name: string) {
		if (confirm(`ต้องการลบประวัติ "${name}" หรือไม่?`)) {
			removeHistoryEntry(id);
			addToast('ลบประวัติเรียบร้อยแล้ว', 'success');
		}
	}

	function clearAllHistory() {
		if (confirm('ต้องการลบประวัติทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้')) {
			clearHistory();
			history.set([]);
			addToast('ลบประวัติทั้งหมดเรียบร้อยแล้ว', 'success');
		}
	}
	function canSaveBill() {
		return (
			$participants.length > 0 && $menuItems.length > 0 && billSummary.some((p) => p.grandTotal > 0)
		);
	}

	function handleExportJSON() {
		if ($history.length === 0) {
			addToast('ไม่มีประวัติให้ส่งออก', 'error');
			return;
		}

		try {
			exportHistory($history);
			addToast('ส่งออกประวัติเรียบร้อยแล้ว', 'success');
		} catch (error) {
			addToast('เกิดข้อผิดพลาดในการส่งออก', 'error');
		}
	}

	function handleExportCSV() {
		if ($history.length === 0) {
			addToast('ไม่มีประวัติให้ส่งออก', 'error');
			return;
		}

		try {
			exportHistoryCSV($history);
			addToast('ส่งออกประวัติ CSV เรียบร้อยแล้ว', 'success');
		} catch (error) {
			addToast('เกิดข้อผิดพลาดในการส่งออก CSV', 'error');
		}
	}

	function handleExportReport() {
		if ($history.length === 0) {
			addToast('ไม่มีประวัติให้ส่งออก', 'error');
			return;
		}

		try {
			const report = generateHistoryReport($history);
			downloadReport(
				report,
				`han-gun-history-report-${new Date().toISOString().split('T')[0]}.txt`
			);
			addToast('ส่งออกรายงานเรียบร้อยแล้ว', 'success');
		} catch (error) {
			addToast('เกิดข้อผิดพลาดในการส่งออกรายงาน', 'error');
		}
	}

	function handleImportFile() {
		fileInput.click();
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		try {
			const importedHistory = await importHistory(file);

			if (importedHistory.length === 0) {
				addToast('ไฟล์ไม่มีข้อมูลประวัติ', 'error');
				return;
			}

			// นำเข้าข้อมูล
			importHistoryData(importedHistory, importMode === 'replace');

			const message =
				importMode === 'replace'
					? `แทนที่ประวัติเรียบร้อยแล้ว (${importedHistory.length} รายการ)`
					: `นำเข้าประวัติเรียบร้อยแล้ว (${importedHistory.length} รายการใหม่)`;

			addToast(message, 'success');
			isImportDialogOpen = false;
		} catch (error) {
			addToast(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้า', 'error');
		} finally {
			// ล้างค่า input
			input.value = '';
		}
	}
</script>

<Card class="w-full">
	<CardHeader class="px-6">
		<CardTitle class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex items-center gap-2">
				<History class="h-5 w-5" />
				<span class="text-base sm:text-lg">ประวัติการแบ่งบิล</span>
			</div>
			<!-- Mobile: Action buttons in responsive grid -->
			<div class="flex flex-wrap gap-2 sm:gap-2">
				<!-- ปุ่มบันทึกบิลปัจจุบัน -->
				<Dialog bind:open={isSaveDialogOpen}>
					<DialogTrigger disabled={!canSaveBill()}>
						<Tooltip text="บันทึกบิลปัจจุบันลงในประวัติ" disabled={!canSaveBill()}>
							<Button variant="outline" size="sm" class="touch-target" disabled={!canSaveBill()}>
								<Save class="h-4 w-4" />
								<span class="xs:inline hidden">บันทึกบิล</span>
							</Button>
						</Tooltip>
					</DialogTrigger>
					<DialogContent class="mx-auto w-[95vw] max-w-md">
						<DialogHeader>
							<DialogTitle class="text-base sm:text-lg">บันทึกบิลลงประวัติ</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="bill-name" class="text-sm">ชื่อบิล</Label>
								<Input
									id="bill-name"
									bind:value={saveDialogName}
									placeholder="เช่น มื้อเที่ยงกับเพื่อน"
									maxlength={50}
									class="text-base"
								/>
							</div>
							<div class="text-muted-foreground bg-muted/50 rounded p-2 text-xs sm:text-sm">
								หมายเหตุ: หลังจากบันทึกแล้ว ข้อมูลปัจจุบันจะถูกล้างเพื่อเริ่มบิลใหม่
							</div>
							<div class="flex flex-col justify-end gap-2 sm:flex-row">
								<Button
									variant="outline"
									onclick={() => (isSaveDialogOpen = false)}
									class="touch-target"
								>
									ยกเลิก
								</Button>
								<Button
									onclick={(e) => {
										e.preventDefault();
										saveBill();
									}}
									class="touch-target"
								>
									บันทึก
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<!-- ปุ่มส่งออก -->
				{#if $history.length > 0}
					<Dialog>
						<DialogTrigger>
							<Tooltip text="ส่งออกประวัติเป็นไฟล์ JSON, CSV หรือรายงาน">								<Button variant="outline" size="sm" class="touch-target">
									<Upload class="h-4 w-4" />
									<span class="xs:inline hidden">ส่งออก</span>
								</Button>
							</Tooltip>
						</DialogTrigger>
						<DialogContent class="mx-auto w-[95vw] max-w-md">
							<DialogHeader>
								<DialogTitle class="text-base sm:text-lg">ส่งออกประวัติ</DialogTitle>
							</DialogHeader>
							<div class="space-y-4">
								<p class="text-muted-foreground text-xs sm:text-sm">
									เลือกรูปแบบการส่งออกประวัติการแบ่งบิล ({$history.length} รายการ)
								</p>
								<div class="space-y-2">									<Button class="touch-target w-full justify-start" onclick={handleExportJSON}>
										<Upload class="h-4 w-4" />
										<span class="text-sm">ส่งออกเป็น JSON (สำหรับนำเข้าใหม่)</span>
									</Button>									<Button
										variant="outline"
										class="touch-target w-full justify-start"
										onclick={handleExportCSV}
									>
										<Upload class="h-4 w-4" />
										<span class="text-sm">ส่งออกเป็น CSV (สำหรับ Excel)</span>
									</Button>
									<Button
										variant="outline"
										class="touch-target w-full justify-start"
										onclick={handleExportReport}
									>
										<FileText class="h-4 w-4" />
										<span class="text-sm">ส่งออกรายงานแบบละเอียด</span>
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				{/if}
				<!-- ปุ่มนำเข้า -->
				<Dialog bind:open={isImportDialogOpen}>
					<DialogTrigger>							<Tooltip text="นำเข้าประวัติจากไฟล์ JSON">
								<Button variant="outline" size="sm" class="touch-target">
									<Download class="h-4 w-4" />
									<span class="xs:inline hidden">นำเข้า</span>
								</Button>
							</Tooltip>
					</DialogTrigger>
					<DialogContent class="mx-auto w-[95vw] max-w-md">
						<DialogHeader>
							<DialogTitle class="text-base sm:text-lg">นำเข้าประวัติ</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<p class="text-muted-foreground text-xs sm:text-sm">
								นำเข้าประวัติการแบ่งบิลจากไฟล์ JSON ที่ส่งออกจากแอปนี้
							</p>

							<!-- เลือกโหมดการนำเข้า -->
							<div >
								<Label class="text-sm">โหมดการนำเข้า</Label>
								<div >
									<label class="touch-target flex items-center space-x-3">
										<input
											type="radio"
											bind:group={importMode}
											value="merge"
											class="h-4 w-4 text-blue-600"
										/>
										<span class="text-sm">รวมกับประวัติเดิม (แนะนำ)</span>
									</label>
									<label class="touch-target flex items-center space-x-3">
										<input
											type="radio"
											bind:group={importMode}
											value="replace"
											class="h-4 w-4 text-red-600"
										/>
										<span class="text-sm text-red-600">แทนที่ประวัติเดิมทั้งหมด</span>
									</label>
								</div>
							</div>

							{#if importMode === 'replace'}
								<div class="text-destructive bg-destructive/10 rounded p-3 text-xs sm:text-sm">
									⚠️ ประวัติเดิมทั้งหมดจะถูกลบและแทนที่ด้วยข้อมูลใหม่
								</div>
							{/if}

							<div class="flex flex-col justify-end gap-2 sm:flex-row">
								<Button
									variant="outline"
									onclick={() => (isImportDialogOpen = false)}
									class="touch-target"
								>
									ยกเลิก
								</Button>								<Button onclick={handleImportFile} class="touch-target">
									<Download class="h-4 w-4" />
									เลือกไฟล์
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<!-- ปุ่มล้างประวัติทั้งหมด -->
				{#if $history.length > 0}
					<Tooltip text="ลบประวัติทั้งหมด (ไม่สามารถยกเลิกได้)">
						<Button variant="outline" size="sm" onclick={clearAllHistory} class="touch-target">
							<Trash class="h-4 w-4" />
							<span class="xs:inline hidden">ล้างทั้งหมด</span>
						</Button>
					</Tooltip>
				{/if}
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent >
		{#if $history.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<FileText class="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p class="text-sm sm:text-base">ยังไม่มีประวัติการแบ่งบิล</p>
				<p class="text-xs sm:text-sm">บันทึกบิลที่เสร็จแล้วเพื่อดูประวัติ</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each $history as entry (entry.id)}
					<!-- Mobile Card Layout -->
					<div class="block sm:hidden">
						<Card class="p-3">
							<div class="space-y-3">
								<div class="flex items-start justify-between">
									<h3 class="text-sm leading-tight font-medium">{entry.name}</h3>
									<Badge variant="secondary" class="ml-2 text-xs whitespace-nowrap">
										{formatPrice(entry.totalAmount)}
									</Badge>
								</div>

								<div class="text-muted-foreground grid grid-cols-3 gap-2 text-xs">
									<div class="flex items-center gap-1">
										<Calendar class="h-3 w-3 flex-shrink-0" />
										<span class="truncate">{formatDate(entry.createdAt).split(' ')[0]}</span>
									</div>
									<div class="flex items-center gap-1">
										<Users class="h-3 w-3 flex-shrink-0" />
										<span>{entry.participants.length} คน</span>
									</div>
									<div class="flex items-center gap-1">
										<DollarSign class="h-3 w-3 flex-shrink-0" />
										<span>{entry.menuItems.length} รายการ</span>
									</div>
								</div>
								<div class="flex justify-end gap-2">
									<Tooltip text="ดูรายละเอียดบิลนี้">
										<Button
											size="sm"
											variant="outline"
											onclick={() => viewHistoryEntry(entry)}
											class="touch-target text-xs"
										>
											<Eye class="h-3 w-3" />
											ดู
										</Button>
									</Tooltip>
									<Tooltip text="ลบบิลนี้จากประวัติ">
										<Button
											size="sm"
											variant="outline"
											onclick={() => deleteHistoryEntry(entry.id, entry.name)}
											class="touch-target text-xs"
										>
											<Trash2 class="h-3 w-3" />
											ลบ
										</Button>
									</Tooltip>
								</div>
							</div>
						</Card>
					</div>

					<!-- Desktop Layout -->
					<div class="hidden items-center justify-between rounded-lg border p-4 sm:flex">
						<div class="flex-1">
							<div class="mb-1 flex items-center gap-2">
								<h3 class="font-medium">{entry.name}</h3>
								<Badge variant="secondary" class="text-xs">
									{formatPrice(entry.totalAmount)}
								</Badge>
							</div>
							<div class="text-muted-foreground flex items-center gap-4 text-sm">
								<div class="flex items-center gap-1">
									<Calendar class="h-3 w-3" />
									{formatDate(entry.createdAt)}
								</div>
								<div class="flex items-center gap-1">
									<Users class="h-3 w-3" />
									{entry.participants.length} คน
								</div>
								<div class="flex items-center gap-1">
									<DollarSign class="h-3 w-3" />
									{entry.menuItems.length} รายการ
								</div>
							</div>
						</div>
						<div class="flex gap-2">
							<Tooltip text="ดูรายละเอียดบิลนี้">
								<Button
									size="sm"
									variant="outline"
									onclick={() => viewHistoryEntry(entry)}
									class="touch-target"
								>
									<Eye class="h-3 w-3" />
									ดู
								</Button>
							</Tooltip>
							<Tooltip text="ลบบิลนี้จากประวัติ">
								<Button
									size="sm"
									variant="outline"
									onclick={() => deleteHistoryEntry(entry.id, entry.name)}
									class="touch-target"
								>
									<Trash2 class="h-3 w-3" />
									ลบ
								</Button>
							</Tooltip>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		<!-- Dialog สำหรับดูรายละเอียดประวัติ -->
		{#if selectedEntry}
			<Dialog bind:open={isViewDialogOpen} onOpenChange={(open) => !open && (selectedEntry = null)}>
				<DialogContent class="mx-auto max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
					<DialogHeader class="pb-4">
						<DialogTitle class="text-base sm:text-lg">{selectedEntry.name}</DialogTitle>
						<div class="text-muted-foreground text-xs sm:text-sm">
							{formatDate(selectedEntry.createdAt)}
						</div>
					</DialogHeader>
					<div class="space-y-4 sm:space-y-6">
						<!-- ข้อมูลสรุป -->
						<div class="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-4 md:grid-cols-3">
							<Card>
								<CardContent class="pt-3 sm:pt-4">
									<div class="text-center">
										<Users class="mx-auto mb-1 h-6 w-6 text-blue-600 sm:mb-2 sm:h-8 sm:w-8" />
										<div class="text-lg font-bold sm:text-2xl">
											{selectedEntry.participants.length}
										</div>
										<div class="text-muted-foreground text-xs sm:text-sm">ผู้เข้าร่วม</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent class="pt-3 sm:pt-4">
									<div class="text-center">
										<DollarSign class="mx-auto mb-1 h-6 w-6 text-green-600 sm:mb-2 sm:h-8 sm:w-8" />
										<div class="text-lg font-bold sm:text-2xl">
											{selectedEntry.menuItems.length}
										</div>
										<div class="text-muted-foreground text-xs sm:text-sm">รายการอาหาร</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent class="pt-3 sm:pt-4">
									<div class="text-center">
										<FileText class="mx-auto mb-1 h-6 w-6 text-purple-600 sm:mb-2 sm:h-8 sm:w-8" />
										<div class="text-lg font-bold sm:text-2xl">
											{formatPrice(selectedEntry.totalAmount)}
										</div>
										<div class="text-muted-foreground text-xs sm:text-sm">ยอดรวมทั้งหมด</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<!-- ตารางสรุปการจ่าย -->
						<div>
							<h3 class="mb-3 text-sm font-medium sm:text-base">สรุปการจ่ายเงิน</h3>

							<!-- Mobile: Card Layout -->
							<div class="block space-y-2 sm:hidden">
								{#each selectedEntry.billSummary as person (person.participantId)}
									{#if person.grandTotal > 0}
										<Card class="p-3">
											<div class="space-y-2">
												<div class="flex items-center justify-between">
													<span class="text-sm font-medium">{person.participantName}</span>
													<span class="text-sm font-bold">{formatPrice(person.grandTotal)}</span>
												</div>
												<div class="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
													<div class="flex justify-between">
														<span>อาหาร:</span>
														<span>{formatPrice(person.foodTotal)}</span>
													</div>
													<div class="flex justify-between">
														<span>ค่าบริการ:</span>
														<span>{formatPrice(person.serviceCharge)}</span>
													</div>
													<div class="flex justify-between">
														<span>VAT:</span>
														<span>{formatPrice(person.vat)}</span>
													</div>
													<div class="flex justify-between">
														<span>ส่วนลด:</span>
														<span
															>{person.discountReceived > 0
																? `-${formatPrice(person.discountReceived)}`
																: '-'}</span
														>
													</div>
												</div>
											</div>
										</Card>
									{/if}
								{/each}
							</div>

							<!-- Desktop: Table Layout -->
							<div class="hidden rounded-lg border sm:block">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ชื่อ</TableHead>
											<TableHead class="text-right">อาหาร</TableHead>
											<TableHead class="text-right">ค่าบริการ</TableHead>
											<TableHead class="text-right">VAT</TableHead>
											<TableHead class="text-right">ส่วนลด</TableHead>
											<TableHead class="text-right">รวม</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{#each selectedEntry.billSummary as person (person.participantId)}
											{#if person.grandTotal > 0}
												<TableRow>
													<TableCell class="font-medium">{person.participantName}</TableCell>
													<TableCell class="text-right">{formatPrice(person.foodTotal)}</TableCell>
													<TableCell class="text-right"
														>{formatPrice(person.serviceCharge)}</TableCell
													>
													<TableCell class="text-right">{formatPrice(person.vat)}</TableCell>
													<TableCell class="text-right">
														{person.discountReceived > 0
															? `-${formatPrice(person.discountReceived)}`
															: '-'}
													</TableCell>
													<TableCell class="text-right font-medium"
														>{formatPrice(person.grandTotal)}</TableCell
													>
												</TableRow>
											{/if}
										{/each}
									</TableBody>
								</Table>
							</div>
						</div>
						<!-- รายการอาหาร -->
						<div>
							<h3 class="mb-3 text-sm font-medium sm:text-base">รายการอาหาร</h3>
							<div class="space-y-2">
								{#each selectedEntry.menuItems as item (item.id)}
									<div
										class="flex flex-col justify-between gap-2 rounded border p-3 sm:flex-row sm:items-center"
									>
										<div class="flex-1">
											<div class="text-sm font-medium sm:text-base">{item.name}</div>
											<div class="text-muted-foreground text-xs sm:text-sm">
												{item.participants
													.map((pId) => selectedEntry?.participants.find((p) => p.id === pId)?.name)
													.filter(Boolean)
													.join(', ')}
											</div>
										</div>
										<div class="self-end text-sm font-medium sm:self-center sm:text-base">
											{formatPrice(item.price)}
										</div>
									</div>
								{/each}
							</div>
						</div>						<!-- การตั้งค่าบิล -->
						<div>
							<h3 class="mb-3 text-sm font-medium sm:text-base">การตั้งค่าบิล</h3>
							<div class="space-y-2 text-xs sm:text-sm">
								<div class="flex justify-between">
									<span>ค่าบริการ:</span>
									<span>{selectedEntry.billSettings.serviceChargePercentage}%</span>
								</div>
								<div class="flex justify-between">
									<span>VAT:</span>
									<span>{selectedEntry.billSettings.vatPercentage}%</span>
								</div>								<!-- แสดงส่วนลดแบบใหม่ (หลายรายการ) -->
								{#if selectedEntry.billSettings.discounts && selectedEntry.billSettings.discounts.length > 0}
									<div class="space-y-1">
										<span class="font-medium">ส่วนลด:</span>
										{#each selectedEntry.billSettings.discounts as discount}
											<div class="flex justify-between pl-4">
												<span class="text-muted-foreground">{discount.name}:</span>
												<span>
													{discount.type === 'percentage'
														? `${discount.value}%`
														: formatPrice(discount.value)}
												</span>
											</div>
										{/each}
									</div>
								{:else if (selectedEntry.billSettings as any).discount}
									<!-- Fallback สำหรับข้อมูลเก่าที่อาจจะยังมี discount แบบเดียว -->
									<div class="flex justify-between">
										<span>ส่วนลด:</span>
										<span>
											{(selectedEntry.billSettings as any).discount.type === 'percentage'
												? `${(selectedEntry.billSettings as any).discount.value}%`
												: formatPrice((selectedEntry.billSettings as any).discount.value)}
										</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="flex justify-end pt-2">
							<Button onclick={() => (isViewDialogOpen = false)} class="touch-target">ปิด</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		{/if}
	</CardContent>
</Card>

<!-- Hidden file input for importing -->
<input
	type="file"
	accept=".json"
	bind:this={fileInput}
	onchange={handleFileSelect}
	style="display: none;"
/>
