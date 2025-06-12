<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { QrCode, Copy, Settings, Smartphone, CreditCard } from 'lucide-svelte';
    import { participants, menuItems, billSettings, promptPayInfo } from '$lib/stores.js';
	import { calculateBillSummary } from '$lib/bill-calculator.js';	import { addToast } from '$lib/toast.js';
	import type { BillSummary } from '$lib/types.js';
	import generatePayload from 'promptpay-qr';
	import { qr as svgQR } from '@svelte-put/qr/svg';
    let isSettingsOpen = false;
	let selectedPersonId = '';
	let selectedPersonAmount = 0;
	let qrCodePayload = '';
	let billSummary: BillSummary[] = [];
	let settingsForm = {
		phoneNumber: '',
		idNumber: ''
	};
	// ซิงค์ข้อมูลจาก store
	$: {
		settingsForm.phoneNumber = $promptPayInfo.phoneNumber || '';
		settingsForm.idNumber = $promptPayInfo.idNumber || '';
	}

	// คำนวณยอดเงินของแต่ละคน
	$: billSummary = calculateBillSummary($participants, $menuItems, $billSettings);	function savePromptPaySettings() {
		promptPayInfo.update(() => ({
			phoneNumber: settingsForm.phoneNumber || undefined,
			idNumber: settingsForm.idNumber || undefined
		}));
		addToast('บันทึกข้อมูล PromptPay เรียบร้อยแล้ว', 'success');
		isSettingsOpen = false;
	}
	function generateQRCode(amount: number) {
		try {
			// ใช้ promptpay-qr library เพื่อสร้าง QR payload ที่ถูกต้องตามมาตรฐาน EMV
			const promptPayId = $promptPayInfo.phoneNumber || $promptPayInfo.idNumber;
			if (!promptPayId) {
				console.error('No PromptPay ID available');
				return '';
			}

			// generatePayload จะสร้าง EMV QR Code payload ที่ถูกต้อง
			const payload = generatePayload(promptPayId, { amount });
			return payload;
		} catch (error) {
			console.error('Error generating PromptPay QR payload:', error);
			return '';
		}
	}

	function showQRCode(personId: string, amount: number) {
		selectedPersonId = personId;
		selectedPersonAmount = amount;
		qrCodePayload = generateQRCode(amount);
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}	function copyAmount(amount: number) {
		navigator.clipboard.writeText(amount.toFixed(2)).then(() => {
			addToast('คัดลอกจำนวนเงินสำเร็จ', 'success');
		}).catch(() => {
			addToast('ไม่สามารถคัดลอกได้', 'error');
		});
	}

	function copyQRPayload() {
		if (qrCodePayload) {
			navigator.clipboard.writeText(qrCodePayload).then(() => {
				addToast('คัดลอก QR Code ข้อมูลสำเร็จ', 'success');
			}).catch(() => {
				addToast('ไม่สามารถคัดลอกได้', 'error');
			});
		}
	}
	function hasPromptPayInfo() {
		return $promptPayInfo.phoneNumber || $promptPayInfo.idNumber;
	}
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<QrCode class="h-5 w-5" />
				PromptPay QR Code
			</div>			<Dialog bind:open={isSettingsOpen}>
				<DialogTrigger>
					<Button variant="outline" size="sm">
						<Settings class="h-4 w-4" />
						ตั้งค่า
					</Button>
				</DialogTrigger>
				<DialogContent class="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>ตั้งค่า PromptPay</DialogTitle>
					</DialogHeader>					<div class="space-y-4">						<div class="space-y-2">
							<Label for="phone-number">เบอร์โทรศัพท์</Label>
							<Input
								id="phone-number"
								bind:value={settingsForm.phoneNumber}
								placeholder="0812345678"
								maxlength={10}
								oninput={() => settingsForm.idNumber = ''}
							/>
						</div>
						<div class="space-y-2">
							<Label for="id-number">เลขประจำตัวประชาชน</Label>							<Input
								id="id-number"
								bind:value={settingsForm.idNumber}
								placeholder="1234567890123"
								maxlength={13}
								oninput={() => settingsForm.phoneNumber = ''}
							/>
						</div>
						<div class="text-xs text-muted-foreground">
							เลือกกรอกอย่างใดอย่างหนึ่ง (แนะนำ: เบอร์โทรศัพท์)
						</div>
						<div class="flex justify-end gap-2">
							<Button variant="outline" onclick={() => isSettingsOpen = false}>
								ยกเลิก
							</Button>
							<Button onclick={savePromptPaySettings}>
								บันทึก
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if !hasPromptPayInfo()}
			<div class="text-center py-8 text-muted-foreground">
				<Smartphone class="h-12 w-12 mx-auto mb-2 opacity-50" />
				<p>ยังไม่ได้ตั้งค่า PromptPay</p>
				<p class="text-sm mb-4">กรุณาตั้งค่าข้อมูล PromptPay เพื่อสร้าง QR Code</p>
				<Button variant="outline" onclick={() => isSettingsOpen = true}>
					<Settings class="h-4 w-4" />
					ตั้งค่าตอนนี้
				</Button>
			</div>
		{:else if billSummary.length === 0}
			<div class="text-center py-8 text-muted-foreground">
				<QrCode class="h-12 w-12 mx-auto mb-2 opacity-50" />
				<p>ยังไม่มีข้อมูลสำหรับสร้าง QR Code</p>
				<p class="text-sm">เพิ่มผู้เข้าร่วมและรายการอาหารก่อน</p>
			</div>
		{:else}
			<div class="space-y-4">
				<!-- รายการแต่ละคน -->
				<div class="space-y-3">
					{#each billSummary as person (person.participantId)}
						{#if person.grandTotal > 0}
							<div class="flex items-center justify-between rounded-lg border p-3">
								<div class="flex items-center gap-3">
									<div>
										<div class="font-medium">{person.participantName}</div>
										<div class="text-sm text-muted-foreground">
											{formatPrice(person.grandTotal)}
										</div>
									</div>
								</div>
								<div class="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onclick={() => copyAmount(person.grandTotal)}
									>
										<Copy class="h-3 w-3" />
										คัดลอก
									</Button>
									<Button
										size="sm"
										onclick={() => showQRCode(person.participantId, person.grandTotal)}
									>
										<QrCode class="h-3 w-3" />
										QR Code
									</Button>
								</div>
							</div>
						{/if}
					{/each}
				</div>				<!-- แสดง QR Code ใน Dialog -->
				{#if qrCodePayload}
					<Dialog open={!!qrCodePayload} onOpenChange={(open) => !open && (qrCodePayload = '')}>
						<DialogContent class="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>
									QR Code สำหรับ
									{billSummary.find(p => p.participantId === selectedPersonId)?.participantName}
								</DialogTitle>
							</DialogHeader>
							<div class="space-y-4">								<!-- QR Code -->
								<div class="flex justify-center">
									<div class="p-4 bg-white rounded-lg border">
										<svg
											use:svgQR={{
												data: qrCodePayload
											}}
											width="200"
											height="200"
											class="flex items-center justify-center"
										></svg>
									</div>
								</div>

								<!-- ข้อมูลการโอน -->
								<div class="space-y-2 text-center">
									<div class="text-lg font-medium">
										{formatPrice(selectedPersonAmount)}
									</div>
									{#if $promptPayInfo.phoneNumber}
										<div class="text-sm text-muted-foreground">
											โอนไปยัง: {$promptPayInfo.phoneNumber}
										</div>
									{:else if $promptPayInfo.idNumber}
										<div class="text-sm text-muted-foreground">
											โอนไปยัง: {$promptPayInfo.idNumber}
										</div>
									{/if}
								</div>								<!-- ปุ่มคัดลอกจำนวนเงิน -->
								<div class="flex justify-center gap-2">
									<Button
										variant="outline"
										onclick={() => copyAmount(selectedPersonAmount)}
									>
										<Copy class="h-4 w-4" />
										คัดลอกจำนวนเงิน
									</Button>
									<Button
										variant="outline"
										onclick={copyQRPayload}
									>
										<Copy class="h-4 w-4" />
										คัดลอก QR
									</Button>
									<Button onclick={() => qrCodePayload = ''}>
										ปิด
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
