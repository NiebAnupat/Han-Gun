<!-- Export/Import Component สำหรับหารกัน -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-svelte';	import { participants, menuItems, billSettings, promptPayInfo, history } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import { exportAllData, importAllData, type ExportDataStructure } from '$lib/localStorage.js';
	import type { Participant, MenuItem, BillSettings, PromptPayInfo } from '$lib/types.js';
	let isExportDialogOpen = false;
	let isImportDialogOpen = false;
	let fileInput: HTMLInputElement;
	let exportData = '';
	let importData = '';
	let includeHistory = false;

	function generateExportData(): string {
		const data = exportAllData(includeHistory);
		return JSON.stringify(data, null, 2);
	}

	function handleExport() {
		exportData = generateExportData();
		isExportDialogOpen = true;
	}

	function downloadExportFile() {
		const blob = new Blob([exportData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `han-gun-export-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		addToast('ส่งออกข้อมูลเรียบร้อยแล้ว', 'success');
		isExportDialogOpen = false;
	}

	function copyExportData() {
		navigator.clipboard.writeText(exportData).then(() => {
			addToast('คัดลอกข้อมูลไปยังคลิปบอร์ดแล้ว', 'success');
		}).catch(() => {
			addToast('ไม่สามารถคัดลอกข้อมูลได้', 'error');
		});
	}

	function handleImportFromFile() {
		if (fileInput) {
			fileInput.click();
		}
	}

	function onFileSelected(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			importData = content;
			processImport();
		};
		reader.readAsText(file);
	}

	function handleImportFromText() {
		if (!importData.trim()) {
			addToast('กรุณาป้อนข้อมูลที่ต้องการนำเข้า', 'error');
			return;
		}
		processImport();
	}	function processImport() {
		try {
			const parsedData: ExportDataStructure = JSON.parse(importData);

			// ใช้ฟังก์ชัน importAllData จาก localStorage
			importAllData(parsedData);

			// อัปเดต stores
			const { participants: importParticipants, menuItems: importMenuItems, billSettings: importBillSettings, promptPayInfo: importPromptPayInfo, history: importHistory } = parsedData.data;

			participants.set(importParticipants);
			menuItems.set(importMenuItems);
			billSettings.set(importBillSettings);
			if (importPromptPayInfo) {
				promptPayInfo.set(importPromptPayInfo);
			}

			// อัปเดตประวัติหากมี
			if (importHistory && Array.isArray(importHistory)) {
				// แปลง createdAt กลับเป็น Date object และทำ migration สำหรับประวัติเก่า
				const processedHistory = importHistory.map(entry => {
					const processedEntry = {
						...entry,
						createdAt: new Date(entry.createdAt)
					};

					// Migration: แปลง discount เก่าเป็น discounts array ในประวัติ
					if (processedEntry.billSettings && 'discount' in processedEntry.billSettings) {
						const oldDiscount = (processedEntry.billSettings as any).discount;
						processedEntry.billSettings = {
							...processedEntry.billSettings,
							discounts: oldDiscount && oldDiscount !== null ? [
								{
									id: `${entry.id}-discount`,
									name: 'ส่วนลดเก่า',
									type: oldDiscount.type,
									value: oldDiscount.value,
									participants: oldDiscount.participants || []
								}
							] : []
						};
						// ลบ discount เก่าออก
						delete (processedEntry.billSettings as any).discount;
					}

					return processedEntry;
				});

				history.set(processedHistory);
			}

			addToast('นำเข้าข้อมูลเรียบร้อยแล้ว', 'success');
			isImportDialogOpen = false;
			importData = '';
		} catch (error) {
			console.error('Import error:', error);
			addToast(`ไม่สามารถนำเข้าข้อมูลได้: ${error instanceof Error ? error.message : 'ข้อมูลผิดรูปแบบ'}`, 'error');
		}
	}

	function clearImportData() {
		importData = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<input
	bind:this={fileInput}
	type="file"
	accept=".json"
	style="display: none"
	on:change={onFileSelected}
/>

<div class="flex items-center gap-2">
	<!-- Export Button -->	<Dialog bind:open={isExportDialogOpen}>
		<DialogTrigger>
			<Button variant="outline" size="sm" onclick={handleExport} class="hidden sm:inline-flex">
				<Upload class="h-4 w-4 mr-1" />
				ส่งออกข้อมูล
			</Button>
			<Button variant="outline" size="sm" onclick={handleExport} class="sm:hidden p-2">
				<Upload class="h-4 w-4" />
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">
					<Upload class="h-5 w-5" />
					ส่งออกข้อมูลบัญชี
				</DialogTitle>
			</DialogHeader>			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<Checkbox bind:checked={includeHistory} />
					<Label for="include-history" class="text-sm">รวมประวัติการแบ่งบิลด้วย</Label>
				</div>
				<div class="space-y-2">
					<Label for="export-data">ข้อมูลที่จะส่งออก (JSON):</Label>
					<textarea
						id="export-data"
						readonly
						bind:value={exportData}
						class="w-full h-64 p-3 text-sm border rounded-md bg-muted font-mono resize-none"
						placeholder="ข้อมูลจะแสดงที่นี่..."
					></textarea>
				</div>				<div class="flex flex-col sm:flex-row gap-2">
					<Button onclick={downloadExportFile} class="flex-1">
						<FileText class="h-4 w-4 mr-2" />
						ดาวน์โหลดไฟล์
					</Button>
					<Button variant="outline" onclick={copyExportData} class="flex-1">
						<CheckCircle class="h-4 w-4 mr-2" />
						คัดลอกข้อมูล
					</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>

	<!-- Import Button -->
	<Dialog bind:open={isImportDialogOpen}>
		<DialogTrigger>			<Button variant="outline" size="sm" class="hidden sm:inline-flex">
				<Download class="h-4 w-4 mr-1" />
				นำเข้าข้อมูล
			</Button>			<Button variant="outline" size="sm" class="sm:hidden p-2">
				<Download class="h-4 w-4" />
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">					<Download class="h-5 w-5" />
					นำเข้าข้อมูลบัญชี
				</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
					<div class="flex items-start gap-2">
						<AlertCircle class="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
						<div class="text-sm text-yellow-800">
							<p class="font-medium">⚠️ คำเตือน:</p>
							<p class="mt-1">การนำเข้าข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด กรุณาส่งออกข้อมูลปัจจุบันก่อนหากต้องการเก็บไว้</p>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm">นำเข้าจากไฟล์</CardTitle>
						</CardHeader>						<CardContent>
							<Button variant="outline" onclick={handleImportFromFile} class="w-full">
								<FileText class="h-4 w-4 mr-2" />
								เลือกไฟล์ JSON
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm">นำเข้าจากข้อความ</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								<textarea
									bind:value={importData}
									placeholder="วางข้อมูล JSON ที่นี่..."
									class="w-full h-32 p-2 text-sm border rounded-md resize-none font-mono"
								></textarea>								<div class="flex gap-2">
									<Button size="sm" onclick={handleImportFromText} class="flex-1">
										นำเข้าข้อมูล
									</Button>
									<Button variant="outline" size="sm" onclick={clearImportData}>
										ล้าง
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</div>
