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
	import { Label } from '$lib/components/ui/label';	import {
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
	import { history, saveBillToHistory, removeHistoryEntry, clearCurrentBill, importHistoryData } from '$lib/stores.js';
	import { calculateBillSummary } from '$lib/bill-calculator.js';
	import { participants, menuItems, billSettings } from '$lib/stores.js';	import { addToast } from '$lib/toast.js';
	import type { HistoryEntry, BillSummary } from '$lib/types.js';
	import { clearHistory } from '$lib/localStorage.js';
	import { exportHistory, importHistory, exportHistoryCSV, generateHistoryReport, downloadReport } from '$lib/export.js';
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
		return $participants.length > 0 && $menuItems.length > 0 && billSummary.some(p => p.grandTotal > 0);
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
			downloadReport(report, `han-gun-history-report-${new Date().toISOString().split('T')[0]}.txt`);
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

			const message = importMode === 'replace'
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
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<History class="h-5 w-5" />
				ประวัติการแบ่งบิล
			</div>			<div class="flex gap-2">
				<!-- ปุ่มบันทึกบิลปัจจุบัน -->
				<Dialog bind:open={isSaveDialogOpen}>
					<DialogTrigger disabled={!canSaveBill()}>
						<Button variant="outline" size="sm" disabled={!canSaveBill()}>
							<Save class="h-4 w-4" />
							บันทึกบิล
						</Button>
					</DialogTrigger>
					<DialogContent class="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>บันทึกบิลลงประวัติ</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<div class="space-y-2">
								<Label for="bill-name">ชื่อบิล</Label>
								<Input
									id="bill-name"
									bind:value={saveDialogName}
									placeholder="เช่น มื้อเที่ยงกับเพื่อน"
									maxlength={50}
								/>
							</div>
							<div class="text-muted-foreground text-sm">
								หมายเหตุ: หลังจากบันทึกแล้ว ข้อมูลปัจจุบันจะถูกล้างเพื่อเริ่มบิลใหม่
							</div>
							<div class="flex justify-end gap-2">
								<Button variant="outline" onclick={() => (isSaveDialogOpen = false)}>ยกเลิก</Button>
								<Button onclick={(e)=>{
                                    e.preventDefault();
                                    saveBill();}}>บันทึก</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				<!-- ปุ่มส่งออก -->
				{#if $history.length > 0}
					<Dialog>
						<DialogTrigger>
							<Button variant="outline" size="sm">
								<Download class="h-4 w-4" />
								ส่งออก
							</Button>
						</DialogTrigger>
						<DialogContent class="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>ส่งออกประวัติ</DialogTitle>
							</DialogHeader>
							<div class="space-y-4">
								<p class="text-sm text-muted-foreground">
									เลือกรูปแบบการส่งออกประวัติการแบ่งบิล ({$history.length} รายการ)
								</p>
								<div class="space-y-2">
									<Button class="w-full justify-start" onclick={handleExportJSON}>
										<FileDown class="h-4 w-4" />
										ส่งออกเป็น JSON (สำหรับนำเข้าใหม่)
									</Button>
									<Button variant="outline" class="w-full justify-start" onclick={handleExportCSV}>
										<FileDown class="h-4 w-4" />
										ส่งออกเป็น CSV (สำหรับ Excel)
									</Button>
									<Button variant="outline" class="w-full justify-start" onclick={handleExportReport}>
										<FileText class="h-4 w-4" />
										ส่งออกรายงานแบบละเอียด
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				{/if}

				<!-- ปุ่มนำเข้า -->
				<Dialog bind:open={isImportDialogOpen}>
					<DialogTrigger>
						<Button variant="outline" size="sm">
							<Upload class="h-4 w-4" />
							นำเข้า
						</Button>
					</DialogTrigger>
					<DialogContent class="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>นำเข้าประวัติ</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<p class="text-sm text-muted-foreground">
								นำเข้าประวัติการแบ่งบิลจากไฟล์ JSON ที่ส่งออกจากแอปนี้
							</p>

							<!-- เลือกโหมดการนำเข้า -->
							<div class="space-y-2">
								<Label>โหมดการนำเข้า</Label>
								<div class="space-y-2">
									<label class="flex items-center space-x-2">
										<input
											type="radio"
											bind:group={importMode}
											value="merge"
											class="w-4 h-4 text-blue-600"
										/>
										<span class="text-sm">รวมกับประวัติเดิม (แนะนำ)</span>
									</label>
									<label class="flex items-center space-x-2">
										<input
											type="radio"
											bind:group={importMode}
											value="replace"
											class="w-4 h-4 text-red-600"
										/>
										<span class="text-sm text-red-600">แทนที่ประวัติเดิมทั้งหมด</span>
									</label>
								</div>
							</div>

							{#if importMode === 'replace'}
								<div class="text-sm text-destructive bg-destructive/10 p-2 rounded">
									⚠️ ประวัติเดิมทั้งหมดจะถูกลบและแทนที่ด้วยข้อมูลใหม่
								</div>
							{/if}

							<div class="flex justify-end gap-2">
								<Button variant="outline" onclick={() => (isImportDialogOpen = false)}>
									ยกเลิก
								</Button>
								<Button onclick={handleImportFile}>
									<FileUp class="h-4 w-4" />
									เลือกไฟล์
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				<!-- ปุ่มล้างประวัติทั้งหมด -->
				{#if $history.length > 0}
					<Button variant="outline" size="sm" onclick={clearAllHistory}>
						<Trash class="h-4 w-4" />
						ล้างทั้งหมด
					</Button>
				{/if}
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if $history.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<FileText class="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p>ยังไม่มีประวัติการแบ่งบิล</p>
				<p class="text-sm">บันทึกบิลที่เสร็จแล้วเพื่อดูประวัติ</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each $history as entry (entry.id)}
					<div class="flex items-center justify-between rounded-lg border p-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								<h3 class="font-medium">{entry.name}</h3>
								<Badge variant="secondary" class="text-xs">
									{formatPrice(entry.totalAmount)}
								</Badge>
							</div>
							<div class="flex items-center gap-4 text-muted-foreground text-sm">
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
							<Button size="sm" variant="outline" onclick={() => viewHistoryEntry(entry)}>
								<Eye class="h-3 w-3" />
								ดู
							</Button>
							<Button
								size="sm"
								variant="outline"
								onclick={() => deleteHistoryEntry(entry.id, entry.name)}
							>
								<Trash2 class="h-3 w-3" />
								ลบ
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Dialog สำหรับดูรายละเอียดประวัติ -->
		{#if selectedEntry}
			<Dialog bind:open={isViewDialogOpen} onOpenChange={(open) => !open && (selectedEntry = null)}>
				<DialogContent class="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{selectedEntry.name}</DialogTitle>
						<div class="text-muted-foreground text-sm">
							{formatDate(selectedEntry.createdAt)}
						</div>
					</DialogHeader>
					<div class="space-y-6">
						<!-- ข้อมูลสรุป -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card>
								<CardContent class="pt-4">
									<div class="text-center">
										<Users class="mx-auto mb-2 h-8 w-8 text-blue-600" />
										<div class="text-2xl font-bold">{selectedEntry.participants.length}</div>
										<div class="text-muted-foreground text-sm">ผู้เข้าร่วม</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent class="pt-4">
									<div class="text-center">
										<DollarSign class="mx-auto mb-2 h-8 w-8 text-green-600" />
										<div class="text-2xl font-bold">{selectedEntry.menuItems.length}</div>
										<div class="text-muted-foreground text-sm">รายการอาหาร</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent class="pt-4">
									<div class="text-center">
										<FileText class="mx-auto mb-2 h-8 w-8 text-purple-600" />
										<div class="text-2xl font-bold">{formatPrice(selectedEntry.totalAmount)}</div>
										<div class="text-muted-foreground text-sm">ยอดรวมทั้งหมด</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<!-- ตารางสรุปการจ่าย -->
						<div>
							<h3 class="font-medium mb-3">สรุปการจ่ายเงิน</h3>
							<div class="border rounded-lg">
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
													<TableCell class="text-right">{formatPrice(person.serviceCharge)}</TableCell>
													<TableCell class="text-right">{formatPrice(person.vat)}</TableCell>
													<TableCell class="text-right">
														{person.discountReceived > 0 ? `-${formatPrice(person.discountReceived)}` : '-'}
													</TableCell>
													<TableCell class="text-right font-medium">{formatPrice(person.grandTotal)}</TableCell>
												</TableRow>
											{/if}
										{/each}
									</TableBody>
								</Table>
							</div>
						</div>

						<!-- รายการอาหาร -->
						<div>
							<h3 class="font-medium mb-3">รายการอาหาร</h3>
							<div class="space-y-2">
								{#each selectedEntry.menuItems as item (item.id)}
									<div class="flex items-center justify-between rounded border p-3">
										<div>
											<div class="font-medium">{item.name}</div>
											<div class="text-muted-foreground text-sm">
												{item.participants.map(pId =>
													selectedEntry?.participants.find(p => p.id === pId)?.name
												).filter(Boolean).join(', ')}
											</div>
										</div>
										<div class="font-medium">{formatPrice(item.price)}</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- การตั้งค่าบิล -->
						<div>
							<h3 class="font-medium mb-3">การตั้งค่าบิล</h3>
							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span>ค่าบริการ:</span>
									<span>{selectedEntry.billSettings.serviceChargePercentage}%</span>
								</div>
								<div class="flex justify-between">
									<span>VAT:</span>
									<span>{selectedEntry.billSettings.vatPercentage}%</span>
								</div>
								{#if selectedEntry.billSettings.discount}
									<div class="flex justify-between">
										<span>ส่วนลด:</span>
										<span>
											{selectedEntry.billSettings.discount.type === 'percentage'
												? `${selectedEntry.billSettings.discount.value}%`
												: formatPrice(selectedEntry.billSettings.discount.value)}
										</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="flex justify-end">
							<Button onclick={() => (isViewDialogOpen = false)}>ปิด</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>		{/if}
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
