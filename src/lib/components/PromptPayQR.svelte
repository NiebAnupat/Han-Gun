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
	} from '$lib/components/ui/dialog';	import { Badge } from '$lib/components/ui/badge';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { QrCode, Copy, Settings, Smartphone, CreditCard, Download, Building2 } from 'lucide-svelte';
	import { participants, menuItems, billSettings, promptPayInfo } from '$lib/stores.js';
	import { calculateBillSummary } from '$lib/bill-calculator.js';
	import { addToast } from '$lib/toast.js';
	import type { BillSummary } from '$lib/types.js';
	import generatePayload from 'promptpay-qr';
	import { qr as svgQR } from '@svelte-put/qr/svg';
	import ThaiQRLogo from '../../assets/images/Thai_QR_Logo.svg';	let isSettingsOpen = false;
	let selectedPersonId = '';
	let selectedPersonAmount = 0;
	let qrCodePayload = '';
	let billSummary: BillSummary[] = [];
	let paymentMethod: 'promptpay' | 'bank' = 'promptpay';	let settingsForm = {
		phoneNumber: '',
		bankName: '',
		accountNumber: '',
		accountName: ''
	};
	// ซิงค์ข้อมูลจาก store
	$: {
		settingsForm.phoneNumber = $promptPayInfo.phoneNumber || '';
		settingsForm.bankName = $promptPayInfo.bankName || '';
		settingsForm.accountNumber = $promptPayInfo.accountNumber || '';
		settingsForm.accountName = $promptPayInfo.accountName || '';
	}

	// คำนวณยอดเงินของแต่ละคน
	$: billSummary = calculateBillSummary($participants, $menuItems, $billSettings);	function savePromptPaySettings() {
		promptPayInfo.update(() => ({
			phoneNumber: settingsForm.phoneNumber || undefined,
			bankName: settingsForm.bankName || undefined,
			accountNumber: settingsForm.accountNumber || undefined,
			accountName: settingsForm.accountName || undefined
		}));
		addToast('บันทึกข้อมูลการชำระเงินเรียบร้อยแล้ว', 'success');
		isSettingsOpen = false;
	}function generateQRCode(amount: number) {
		try {
			// ใช้ promptpay-qr library เพื่อสร้าง QR payload ที่ถูกต้องตามมาตรฐาน EMV
			const promptPayId = $promptPayInfo.phoneNumber;
			if (!promptPayId) {
				console.error('No PromptPay phone number available');
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

	function showBankDetails(personId: string, amount: number) {
		selectedPersonId = personId;
		selectedPersonAmount = amount;
		qrCodePayload = 'bank-details'; // Use this as a flag for bank details
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
	}	function hasPromptPayInfo() {
		return $promptPayInfo.phoneNumber;
	}

	function hasBankInfo() {
		return $promptPayInfo.bankName && $promptPayInfo.accountNumber;
	}

	function hasPaymentInfo() {
		return hasPromptPayInfo() || hasBankInfo();
	}
</script>

<Card class="w-full">	<CardHeader>		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2 min-w-0">
				{#if paymentMethod === 'promptpay'}
					<QrCode class="h-5 w-5 flex-shrink-0" />
					<span class="truncate text-sm sm:text-base">PromptPay QR Code</span>
				{:else}
					<Building2 class="h-5 w-5 flex-shrink-0" />
					<span class="truncate text-sm sm:text-base">การโอนเงินผ่านธนาคาร</span>
				{/if}
			</div>			<Dialog bind:open={isSettingsOpen}>
				<DialogTrigger>
					<Tooltip text="ตั้งค่าข้อมูล PromptPay และธนาคาร">
						<Button variant="outline" size="sm" class="flex-shrink-0">
							<Settings class="h-4 w-4 sm:mr-1" />
							<span class="hidden sm:inline">ตั้งค่า</span>
						</Button>
					</Tooltip>
				</DialogTrigger>
				<DialogContent class="w-[95vw] max-w-md mx-auto">
					<DialogHeader>
						<DialogTitle class="text-base">ตั้งค่าการชำระเงิน</DialogTitle>
					</DialogHeader>					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="phone-number" class="text-sm">เบอร์โทรศัพท์ PromptPay</Label>
							<Input
								id="phone-number"
								bind:value={settingsForm.phoneNumber}
								placeholder="0812345678"
								maxlength={10}
								class="text-sm"
							/>
						</div>
						<div class="space-y-2">
							<Label for="bank-name" class="text-sm">ชื่อธนาคาร</Label>
							<Input
								id="bank-name"
								bind:value={settingsForm.bankName}
								placeholder="ธนาคารกสิกรไทย"
								class="text-sm"
							/>
						</div>
						<div class="space-y-2">
							<Label for="account-name" class="text-sm">ชื่อบัญชี</Label>
							<Input
								id="account-name"
								bind:value={settingsForm.accountName}
								placeholder="นาย สมชาย ใจดี"
								class="text-sm"
							/>
						</div>
						<div class="space-y-2">
							<Label for="account-number" class="text-sm">เลขที่บัญชี</Label>
							<Input
								id="account-number"
								bind:value={settingsForm.accountNumber}
								placeholder="123-4-56789-0"
								class="text-sm"
							/>
						</div>
						<div class="text-muted-foreground text-xs">
							กรอกข้อมูล PromptPay สำหรับ QR Code หรือข้อมูลธนาคารสำหรับการโอนเงิน
						</div>
						<div class="flex flex-col sm:flex-row justify-end gap-2">
							<Button variant="outline" onclick={() => (isSettingsOpen = false)} class="w-full sm:w-auto">ยกเลิก</Button>
							<Button onclick={savePromptPaySettings} class="w-full sm:w-auto">บันทึก</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</CardTitle>
	</CardHeader>	<CardContent>
		{#if !hasPaymentInfo()}
			<div class="text-muted-foreground py-6 sm:py-8 text-center">
				<Smartphone class="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
				<p class="text-sm sm:text-base">ยังไม่ได้ตั้งค่าข้อมูลการชำระเงิน</p>
				<p class="mb-4 text-xs sm:text-sm">กรุณาตั้งค่าข้อมูล PromptPay หรือบัญชีธนาคาร</p>
				<Button variant="outline" onclick={() => (isSettingsOpen = true)}>
					<Settings class="h-4 w-4 mr-2" />
					ตั้งค่าตอนนี้
				</Button>
			</div>
		{:else if billSummary.length === 0}
			<div class="text-muted-foreground py-6 sm:py-8 text-center">
				<QrCode class="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
				<p class="text-sm sm:text-base">ยังไม่มีข้อมูลสำหรับสร้างการชำระเงิน</p>
				<p class="text-xs sm:text-sm">เพิ่มผู้เข้าร่วมและรายการอาหารก่อน</p>
			</div>
		{:else}
			<div class="space-y-4">
				<!-- Payment Method Selection -->
				<div class="flex flex-col sm:flex-row justify-center gap-2 mb-4">
					<Button
						variant={paymentMethod === 'promptpay' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (paymentMethod = 'promptpay')}
						disabled={!hasPromptPayInfo()}
						class="w-full sm:w-auto"
					>
						<QrCode class="h-4 w-4 mr-2" />
						QR PromptPay
					</Button>
					<Button
						variant={paymentMethod === 'bank' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (paymentMethod = 'bank')}
						disabled={!hasBankInfo()}
						class="w-full sm:w-auto"
					>
						<Building2 class="h-4 w-4 mr-2" />
						โอนผ่านธนาคาร
					</Button>
				</div>

				<!-- รายการแต่ละคน -->
				<div class="space-y-3">
					{#each billSummary as person (person.participantId)}
						{#if person.grandTotal > 0}
							<div class="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 gap-3">
								<div class="flex items-center gap-3 min-w-0">
									<div class="min-w-0 flex-1">
										<div class="font-medium text-sm sm:text-base truncate">{person.participantName}</div>
										<div class="text-muted-foreground text-xs sm:text-sm">
											{formatPrice(person.grandTotal)}
										</div>
									</div>
								</div>								<div class="flex gap-2 justify-end sm:justify-start">
									<Tooltip text="คัดลอกจำนวนเงิน">
										<Button size="sm" variant="outline" onclick={() => copyAmount(person.grandTotal)} class="flex-1 sm:flex-none">
											<Copy class="h-3 w-3 mr-1" />
											<span class="text-xs sm:text-sm">คัดลอก</span>
										</Button>
									</Tooltip>
									{#if paymentMethod === 'promptpay'}
										<Tooltip text="แสดง QR Code สำหรับโอนเงิน">
											<Button
												size="sm"
												onclick={() => showQRCode(person.participantId, person.grandTotal)}
												class="flex-1 sm:flex-none"
											>
												<QrCode class="h-3 w-3 mr-1" />
												<span class="text-xs sm:text-sm">QR</span>
											</Button>
										</Tooltip>
									{:else}
										<Tooltip text="แสดงข้อมูลธนาคารสำหรับโอนเงิน">
											<Button
												size="sm"
												onclick={() => showBankDetails(person.participantId, person.grandTotal)}
												class="flex-1 sm:flex-none"
											>
												<Building2 class="h-3 w-3 mr-1" />
												<span class="text-xs sm:text-sm">ข้อมูลโอน</span>
											</Button>
										</Tooltip>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>				<!-- แสดง QR Code หรือข้อมูลธนาคาร ใน Dialog -->
				{#if qrCodePayload}
					<Dialog open={!!qrCodePayload} onOpenChange={(open) => !open && (qrCodePayload = '')}>
						<DialogContent class="w-[95vw] max-w-sm mx-auto p-0 overflow-hidden">
							<DialogHeader class="px-4 pt-4 pb-2">
								<DialogTitle class="text-base text-center">
									{qrCodePayload === 'bank-details' ? '💳 ข้อมูลการโอนเงิน' : '📱 QR Code PromptPay'}
								</DialogTitle>
								<div class="text-center text-sm text-muted-foreground">
									สำหรับ {billSummary.find((p) => p.participantId === selectedPersonId)?.participantName}
								</div>
							</DialogHeader>
							<div class="px-4 pb-4">
								{#if qrCodePayload === 'bank-details'}
									<!-- Bank Details -->
									<div class="space-y-4">
										<div class="text-center py-4 bg-gradient-to-b from-blue-50 to-white rounded-lg">
											<Building2 class="mx-auto mb-3 h-12 w-12 text-blue-600" />
											<div class="text-2xl font-bold text-blue-900 mb-1">
												{formatPrice(selectedPersonAmount)}
											</div>
											<div class="text-sm text-blue-600">จำนวนที่ต้องโอน</div>
										</div>

										<div class="space-y-3 rounded-xl border bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
											<div class="flex justify-between items-center py-2 border-b border-gray-100">
												<span class="text-sm text-gray-600">🏦 ธนาคาร</span>
												<span class="font-semibold text-gray-900">{$promptPayInfo.bankName}</span>
											</div>
											<div class="flex justify-between items-center py-2 border-b border-gray-100">
												<span class="text-sm text-gray-600">👤 ชื่อบัญชี</span>
												<span class="font-semibold text-gray-900 text-right max-w-[180px] truncate">{$promptPayInfo.accountName}</span>
											</div>
											<div class="flex justify-between items-center py-2 border-b border-gray-100">
												<span class="text-sm text-gray-600">🔢 เลขที่บัญชี</span>
												<div class="flex items-center gap-2">
													<span class="font-mono font-semibold text-gray-900 text-sm">{$promptPayInfo.accountNumber}</span>
													<Tooltip text="คัดลอกเลขที่บัญชี">
														<Button
															size="sm"
															variant="ghost"
															onclick={() => {
																navigator.clipboard.writeText($promptPayInfo.accountNumber || '');
																addToast('คัดลอกเลขบัญชีสำเร็จ', 'success');
															}}
															class="h-8 w-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
														>
															<Copy class="h-3 w-3" />
														</Button>
													</Tooltip>
												</div>
											</div>
											<div class="flex justify-between items-center py-2">
												<span class="text-sm text-gray-600">💰 จำนวนเงิน</span>
												<div class="flex items-center gap-2">
													<span class="font-bold text-lg text-green-600">{selectedPersonAmount.toFixed(2)} ฿</span>
													<Tooltip text="คัดลอกจำนวนเงิน">
														<Button
															size="sm"
															variant="ghost"
															onclick={() => copyAmount(selectedPersonAmount)}
															class="h-8 w-8 p-0 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
														>
															<Copy class="h-3 w-3" />
														</Button>
													</Tooltip>
												</div>
											</div>
										</div>

										<div class="flex flex-col gap-2">
											<Button
												variant="outline"
												onclick={() => copyAmount(selectedPersonAmount)}
												class="w-full bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
											>
												<Copy class="h-4 w-4 mr-2" />
												คัดลอกจำนวนเงิน
											</Button>
											<Button
												onclick={() => (qrCodePayload = '')}
												class="w-full"
											>
												เสร็จสิ้น
											</Button>
										</div>
									</div>
								{:else}
									<!-- QR Code -->
									<div class="space-y-4">
										<!-- QR Code Container -->
										<div class="flex justify-center">
											<div class="relative rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-200">
												<!-- QR Code -->
												<svg
													use:svgQR={{
														data: qrCodePayload
													}}
													width="220"
													height="220"
													class="rounded-xl shadow-sm"
													data-qr-svg
												></svg>
												<!-- Thai QR Logo overlay -->
												<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
													<div class="bg-white rounded-xl p-2 shadow-md border border-gray-100">
														<img src={ThaiQRLogo} alt="Thai QR Logo" class="w-16 h-auto" />
													</div>
												</div>
											</div>
										</div>

										<!-- Payment Info -->
										<div class="text-center space-y-3 py-4 bg-gradient-to-b from-blue-50 to-white rounded-xl">
											<div class="text-3xl font-bold text-blue-900">
												{formatPrice(selectedPersonAmount)}
											</div>
											{#if $promptPayInfo.phoneNumber}
												<div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
													<Smartphone class="h-4 w-4 text-blue-600" />
													<span class="text-sm font-medium text-blue-700">
														{$promptPayInfo.phoneNumber}
													</span>
												</div>
											{/if}
											<div class="text-xs text-blue-600">
												แสกน QR Code เพื่อโอนเงินผ่าน PromptPay
											</div>
										</div>

										<!-- Action Buttons -->
										<div class="flex flex-col gap-2">
											<Tooltip text="คัดลอกจำนวนเงินที่ต้องโอน">
												<Button
													variant="outline"
													onclick={() => copyAmount(selectedPersonAmount)}
													class="w-full bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
												>
													<Copy class="h-4 w-4 mr-2" />
													คัดลอกจำนวนเงิน
												</Button>
											</Tooltip>
											<Tooltip text="ดาวน์โหลด QR Code เป็นรูปภาพ">
												<Button
													variant="outline"
													onclick={downloadQRCode}
													class="w-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
												>
													<Download class="h-4 w-4 mr-2" />
													ดาวน์โหลด QR Code
												</Button>
											</Tooltip>
											<Button
												onclick={() => (qrCodePayload = '')}
												class="w-full"
											>
												เสร็จสิ้น
											</Button>
										</div>
									</div>
								{/if}
							</div>
						</DialogContent>
					</Dialog>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
