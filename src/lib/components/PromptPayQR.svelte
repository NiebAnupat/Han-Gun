<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { QrCode, Copy, Settings, Smartphone, CreditCard, Download } from 'lucide-svelte';
	import { participants, menuItems, billSettings, promptPayInfo } from '$lib/stores.js';
	import { calculateBillSummary } from '$lib/bill-calculator.js';
	import { addToast } from '$lib/toast.js';
	import type { BillSummary } from '$lib/types.js';
	import generatePayload from 'promptpay-qr';
	import { qr as svgQR } from '@svelte-put/qr/svg';
	import ThaiQRLogo from '../../assets/images/Thai_QR_Logo.svg';
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
	$: billSummary = calculateBillSummary($participants, $menuItems, $billSettings);
	function savePromptPaySettings() {
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
	}
	function copyAmount(amount: number) {
		navigator.clipboard
			.writeText(amount.toFixed(2))
			.then(() => {
				addToast('คัดลอกจำนวนเงินสำเร็จ', 'success');
			})
			.catch(() => {
				addToast('ไม่สามารถคัดลอกได้', 'error');
			});
	}
	function copyQRPayload() {
		if (qrCodePayload) {
			navigator.clipboard
				.writeText(qrCodePayload)
				.then(() => {
					addToast('คัดลอก QR Code ข้อมูลสำเร็จ', 'success');
				})
				.catch(() => {
					addToast('ไม่สามารถคัดลอกได้', 'error');
				});
		}
	}
	function downloadQRCode() {
		if (!qrCodePayload) return;

		try {
			// สร้าง canvas เพื่อแปลง SVG เป็น image
			const svg = document.querySelector('svg[data-qr-svg]') as SVGElement;
			if (!svg) {
				addToast('ไม่พบ QR Code ให้ดาวน์โหลด', 'error');
				return;
			}

			// สร้าง canvas และ context
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				addToast('ไม่สามารถสร้าง canvas ได้', 'error');
				return;
			}

			// กำหนดขนาด canvas
			canvas.width = 400;
			canvas.height = 400;

			// สร้าง Image จาก SVG
			const svgData = new XMLSerializer().serializeToString(svg);
			const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
			const svgUrl = URL.createObjectURL(svgBlob);

			const img = new Image();
			img.onload = function () {
				// วาดพื้นหลังสีขาว
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// วาด QR Code ตรงกลาง
				const qrSize = 350;
				const x = (canvas.width - qrSize) / 2;
				const y = (canvas.height - qrSize) / 2;
				ctx.drawImage(img, x, y, qrSize, qrSize);				// โหลดและวาดโลโก้ Thai QR ตรงกลาง
				const logoImg = new Image();
				logoImg.onload = function () {
					// กำหนดขนาดโลโก้ให้เหมือนกับที่แสดง (width = 35% ของ QR Code, height ตามอัตราส่วน)
					const logoWidth = qrSize * 0.35;
					const logoHeight = (logoImg.height / logoImg.width) * logoWidth; // คำนวณ height ตามอัตราส่วนจริง
					const logoX = (canvas.width - logoWidth) / 2;
					const logoY = (canvas.height - logoHeight) / 2;
					const padding = 8;

					// วาดพื้นหลังสีขาวแบบมมุมมน (เลียนแบบ rounded-xl)
					const bgWidth = logoWidth + padding * 2;
					const bgHeight = logoHeight + padding * 2;
					const bgX = logoX - padding;
					const bgY = logoY - padding;
					const borderRadius = 12;

					ctx.fillStyle = '#ffffff';
					ctx.beginPath();
					ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
					ctx.fill();

					// วาดโลโก้ด้วยอัตราส่วนที่ถูกต้อง
					ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

					// สร้าง download link
					canvas.toBlob((blob) => {
						if (blob) {
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `promptpay-qr-${selectedPersonAmount.toFixed(2)}-baht.png`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							URL.revokeObjectURL(url);
							addToast('ดาวน์โหลด QR Code สำเร็จ', 'success');
						} else {
							addToast('ไม่สามารถสร้างไฟล์รูปภาพได้', 'error');
						}
					}, 'image/png');
				};

				logoImg.onerror = function () {
					// หากไม่สามารถโหลดโลโก้ได้ ให้ดาวน์โหลด QR Code อย่างเดียว
					canvas.toBlob((blob) => {
						if (blob) {
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `promptpay-qr-${selectedPersonAmount.toFixed(2)}-baht.png`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							URL.revokeObjectURL(url);
							addToast('ดาวน์โหลด QR Code สำเร็จ (ไม่มีโลโก้)', 'success');
						}
					}, 'image/png');
				};

				// โหลดโลโก้ Thai QR
				logoImg.src = ThaiQRLogo;

				URL.revokeObjectURL(svgUrl);
			};

			img.onerror = function () {
				addToast('ไม่สามารถแปลง QR Code เป็นรูปภาพได้', 'error');
				URL.revokeObjectURL(svgUrl);
			};

			img.src = svgUrl;
		} catch (error) {
			console.error('Error downloading QR code:', error);
			addToast('เกิดข้อผิดพลาดในการดาวน์โหลด', 'error');
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
			</div>
			<Dialog bind:open={isSettingsOpen}>
				<DialogTrigger>
					<Button variant="outline" size="sm">
						<Settings class="h-4 w-4" />
						ตั้งค่า
					</Button>
				</DialogTrigger>
				<DialogContent class="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>ตั้งค่า PromptPay</DialogTitle>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="phone-number">เบอร์โทรศัพท์</Label>
							<Input
								id="phone-number"
								bind:value={settingsForm.phoneNumber}
								placeholder="0812345678"
								maxlength={10}
								oninput={() => (settingsForm.idNumber = '')}
							/>
						</div>
						<div class="space-y-2">
							<Label for="id-number">เลขประจำตัวประชาชน</Label>
							<Input
								id="id-number"
								bind:value={settingsForm.idNumber}
								placeholder="1234567890123"
								maxlength={13}
								oninput={() => (settingsForm.phoneNumber = '')}
							/>
						</div>
						<div class="text-muted-foreground text-xs">
							เลือกกรอกอย่างใดอย่างหนึ่ง (แนะนำ: เบอร์โทรศัพท์)
						</div>
						<div class="flex justify-end gap-2">
							<Button variant="outline" onclick={() => (isSettingsOpen = false)}>ยกเลิก</Button>
							<Button onclick={savePromptPaySettings}>บันทึก</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if !hasPromptPayInfo()}
			<div class="text-muted-foreground py-8 text-center">
				<Smartphone class="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p>ยังไม่ได้ตั้งค่า PromptPay</p>
				<p class="mb-4 text-sm">กรุณาตั้งค่าข้อมูล PromptPay เพื่อสร้าง QR Code</p>
				<Button variant="outline" onclick={() => (isSettingsOpen = true)}>
					<Settings class="h-4 w-4" />
					ตั้งค่าตอนนี้
				</Button>
			</div>
		{:else if billSummary.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<QrCode class="mx-auto mb-2 h-12 w-12 opacity-50" />
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
										<div class="text-muted-foreground text-sm">
											{formatPrice(person.grandTotal)}
										</div>
									</div>
								</div>
								<div class="flex gap-2">
									<Button size="sm" variant="outline" onclick={() => copyAmount(person.grandTotal)}>
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
				</div>
				<!-- แสดง QR Code ใน Dialog -->
				{#if qrCodePayload}
					<Dialog open={!!qrCodePayload} onOpenChange={(open) => !open && (qrCodePayload = '')}>
						<DialogContent class="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>
									QR Code สำหรับ
									{billSummary.find((p) => p.participantId === selectedPersonId)?.participantName}
								</DialogTitle>
							</DialogHeader>
							<div class="space-y-4">
								<!-- QR Code -->
								<div class="flex justify-center">
									<div class="relative rounded-lg border bg-white p-4">
										<svg
											use:svgQR={{
												data: qrCodePayload
											}}
											width="200"
											height="200"
											class="flex items-center justify-center"
											data-qr-svg
										></svg>										<!-- Thai QR Logo overlay -->
										<div
											class="pointer-events-none absolute inset-0 flex items-center justify-center"
										>
											<div class="bg-white rounded-lg p-2">
												<img src={ThaiQRLogo} alt="Thai QR Logo" class="w-15" />
											</div>
										</div>
									</div>
								</div>

								<!-- ข้อมูลการโอน -->
								<div class="space-y-2 text-center">
									<div class="text-lg font-medium">
										{formatPrice(selectedPersonAmount)}
									</div>
									{#if $promptPayInfo.phoneNumber}
										<div class="text-muted-foreground text-sm">
											โอนไปยัง: {$promptPayInfo.phoneNumber}
										</div>
									{:else if $promptPayInfo.idNumber}
										<div class="text-muted-foreground text-sm">
											โอนไปยัง: {$promptPayInfo.idNumber}
										</div>
									{/if}
								</div>
								<!-- ปุ่มคัดลอกจำนวนเงิน -->
								<div class="flex justify-center gap-2">
									<Button variant="outline" onclick={() => copyAmount(selectedPersonAmount)}>
										<Copy class="h-4 w-4" />
										คัดลอกจำนวนเงิน
									</Button>
									<Button variant="outline" onclick={downloadQRCode}>
										<Download class="h-4 w-4" />
										ดาวน์โหลด QR
									</Button>
									<Button onclick={() => (qrCodePayload = '')}>ปิด</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
