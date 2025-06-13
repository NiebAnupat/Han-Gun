<!-- BillSettings Component สำหรับหลายส่วนลด -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { Percent, DollarSign, Settings, Trash2, Plus, Edit } from 'lucide-svelte';
	import { participants, billSettings } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import type { Discount } from '$lib/types.js';

	let isDiscountDialogOpen = false;
	let isSettingsDialogOpen = false;
	let editingDiscountId: string | null = null;
	let discountForm = {
		name: '',
		type: 'percentage' as 'fixed' | 'percentage',
		value: 0,
		selectedParticipants: [] as string[]
	};

	let settingsForm = {
		vatPercentage: 7,
		serviceChargePercentage: 10
	};

	// ซิงค์ข้อมูลจาก store
	$: {
		settingsForm.vatPercentage = $billSettings.vatPercentage;
		settingsForm.serviceChargePercentage = $billSettings.serviceChargePercentage;
	}

	function resetDiscountForm() {
		discountForm = {
			name: '',
			type: 'percentage',
			value: 0,
			selectedParticipants: []
		};
		editingDiscountId = null;
	}

	function openDiscountDialog(discount?: Discount) {
		if (discount) {
			// แก้ไขส่วนลดที่มีอยู่
			editingDiscountId = discount.id;
			discountForm = {
				name: discount.name,
				type: discount.type,
				value: discount.value,
				selectedParticipants: [...discount.participants]
			};
		} else {
			// เพิ่มส่วนลดใหม่
			resetDiscountForm();
		}
		isDiscountDialogOpen = true;
	}

	function handleDiscountSubmit() {
		if (!discountForm.name.trim()) {
			addToast('กรุณาใส่ชื่อส่วนลด', 'warning');
			return;
		}
		if (discountForm.value <= 0) {
			addToast('กรุณาใส่จำนวนส่วนลดที่ถูกต้อง', 'warning');
			return;
		}
		if (discountForm.type === 'percentage' && discountForm.value > 100) {
			addToast('เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100%', 'warning');
			return;
		}
		if (discountForm.selectedParticipants.length === 0) {
			addToast('กรุณาเลือกผู้ที่จะได้รับส่วนลด', 'warning');
			return;
		}

		const discount: Discount = {
			id: editingDiscountId || Date.now().toString(),
			name: discountForm.name.trim(),
			type: discountForm.type,
			value: discountForm.value,
			participants: discountForm.selectedParticipants
		};

		billSettings.update(settings => {
			if (editingDiscountId) {
				// แก้ไขส่วนลดที่มีอยู่
				return {
					...settings,
					discounts: settings.discounts.map(d => d.id === editingDiscountId ? discount : d)
				};
			} else {
				// เพิ่มส่วนลดใหม่
				return {
					...settings,
					discounts: [...settings.discounts, discount]
				};
			}
		});

		addToast(editingDiscountId ? 'แก้ไขส่วนลดเรียบร้อยแล้ว' : 'เพิ่มส่วนลดเรียบร้อยแล้ว', 'success');
		isDiscountDialogOpen = false;
		resetDiscountForm();
	}

	function removeDiscount(discountId: string) {
		billSettings.update(settings => ({
			...settings,
			discounts: settings.discounts.filter(d => d.id !== discountId)
		}));
		addToast('ลบส่วนลดเรียบร้อยแล้ว', 'info');
	}

	function toggleDiscountParticipant(participantId: string) {
		if (discountForm.selectedParticipants.includes(participantId)) {
			discountForm.selectedParticipants = discountForm.selectedParticipants.filter(id => id !== participantId);
		} else {
			discountForm.selectedParticipants = [...discountForm.selectedParticipants, participantId];
		}
	}

	function handleSettingsSubmit() {
		if (settingsForm.vatPercentage < 0 || settingsForm.vatPercentage > 100) {
			addToast('VAT ต้องอยู่ระหว่าง 0-100%', 'warning');
			return;
		}
		if (settingsForm.serviceChargePercentage < 0 || settingsForm.serviceChargePercentage > 100) {
			addToast('ค่าบริการต้องอยู่ระหว่าง 0-100%', 'warning');
			return;
		}

		billSettings.update(settings => ({
			...settings,
			vatPercentage: settingsForm.vatPercentage,
			serviceChargePercentage: settingsForm.serviceChargePercentage
		}));
		addToast('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
		isSettingsDialogOpen = false;
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}

	function getDiscountParticipantNames(participantIds: string[]) {
		return participantIds
			.map(id => $participants.find(p => p.id === id)?.name)
			.filter(Boolean)
			.join(', ');
	}
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2 min-w-0">
				<Settings class="h-5 w-5 flex-shrink-0" />
				<span>การตั้งค่าบิล</span>
			</div>
			<Dialog bind:open={isSettingsDialogOpen}>
				<DialogTrigger>
					<Tooltip text="ตั้งค่า VAT และค่าบริการ">
						<Button variant="outline" size="sm" class="flex-shrink-0">
							<Settings class="h-4 w-4 sm:mr-1" />
							<span class="hidden sm:inline">ตั้งค่า</span>
						</Button>
					</Tooltip>
				</DialogTrigger>
				<DialogContent class="w-[95vw] max-w-md mx-auto">
					<DialogHeader>
						<DialogTitle class="text-base">ตั้งค่าการคำนวณ</DialogTitle>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="vat-percentage" class="text-sm">VAT (%)</Label>
							<Input
								id="vat-percentage"
								type="number"
								min="0"
								max="100"
								step="0.01"
								bind:value={settingsForm.vatPercentage}
								class="text-sm"
							/>
						</div>
						<div class="space-y-2">
							<Label for="service-percentage" class="text-sm">ค่าบริการ (%)</Label>
							<Input
								id="service-percentage"
								type="number"
								min="0"
								max="100"
								step="0.01"
								bind:value={settingsForm.serviceChargePercentage}
								class="text-sm"
							/>
						</div>
						<div class="flex flex-col sm:flex-row justify-end gap-2">
							<Button variant="outline" onclick={() => isSettingsDialogOpen = false} class="w-full sm:w-auto">
								ยกเลิก
							</Button>
							<Button onclick={handleSettingsSubmit} class="w-full sm:w-auto">
								บันทึก
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</CardTitle>
	</CardHeader>

	<CardContent class="space-y-4">
		<!-- แสดงการตั้งค่าปัจจุบัน -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
			<div class="flex justify-between p-2 rounded bg-muted/30">
				<span class="text-muted-foreground">VAT:</span>
				<span class="font-medium">{$billSettings.vatPercentage}%</span>
			</div>
			<div class="flex justify-between p-2 rounded bg-muted/30">
				<span class="text-muted-foreground">ค่าบริการ:</span>
				<span class="font-medium">{$billSettings.serviceChargePercentage}%</span>
			</div>
		</div>

		<Separator />

		<!-- จัดการส่วนลด -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="font-medium text-sm sm:text-base">ส่วนลด</h4>
				<Dialog bind:open={isDiscountDialogOpen}>
					<DialogTrigger>
						<Tooltip text="เพิ่มส่วนลด" disabled={$participants.length === 0}>
							<Button
								variant="outline"
								size="sm"
								onclick={() => openDiscountDialog()}
								disabled={$participants.length === 0}
								class="flex-shrink-0"
							>
								<Plus class="h-4 w-4 sm:mr-1" />
								<span class="hidden sm:inline">เพิ่มส่วนลด</span>
							</Button>
						</Tooltip>
					</DialogTrigger>
					<DialogContent class="w-[95vw] max-w-md mx-auto">
						<DialogHeader>
							<DialogTitle class="text-base">
								{editingDiscountId ? 'แก้ไขส่วนลด' : 'เพิ่มส่วนลด'}
							</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<!-- ชื่อส่วนลด -->
							<div class="space-y-2">
								<Label for="discount-name" class="text-sm">ชื่อส่วนลด</Label>
								<Input
									id="discount-name"
									type="text"
									bind:value={discountForm.name}
									placeholder="เช่น ส่วนลดสมาชิก, คูปองส่วนลด"
									class="text-sm"
								/>
							</div>

							<!-- ประเภทส่วนลด -->
							<div class="space-y-2">
								<Label class="text-sm">ประเภทส่วนลด</Label>
								<div class="grid grid-cols-2 gap-2">
									<Button
										variant={discountForm.type === 'percentage' ? 'default' : 'outline'}
										size="sm"
										onclick={() => discountForm.type = 'percentage'}
									>
										<Percent class="h-4 w-4 mr-1" />
										เปอร์เซ็นต์
									</Button>
									<Button
										variant={discountForm.type === 'fixed' ? 'default' : 'outline'}
										size="sm"
										onclick={() => discountForm.type = 'fixed'}
									>
										<DollarSign class="h-4 w-4 mr-1" />
										จำนวนเงิน
									</Button>
								</div>
							</div>

							<!-- จำนวนส่วนลด -->
							<div class="space-y-2">
								<Label for="discount-value" class="text-sm">
									{discountForm.type === 'percentage' ? 'เปอร์เซ็นต์ส่วนลด' : 'จำนวนเงินส่วนลด (บาท)'}
								</Label>
								<Input
									id="discount-value"
									type="number"
									min="0"
									max={discountForm.type === 'percentage' ? '100' : undefined}
									step={discountForm.type === 'percentage' ? '0.01' : '1'}
									bind:value={discountForm.value}
									placeholder={discountForm.type === 'percentage' ? '0.00' : '0'}
									class="text-sm"
								/>
							</div>

							<!-- เลือกผู้ได้รับส่วนลด -->
							<div class="space-y-2">
								<Label class="text-sm">ผู้ที่ได้รับส่วนลด</Label>
								{#if $participants.length > 0}
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
										{#each $participants as participant (participant.id)}
											<div class="flex items-center space-x-2">
												<Checkbox
													id={`discount-${participant.id}`}
													checked={discountForm.selectedParticipants.includes(participant.id)}
													onCheckedChange={() => toggleDiscountParticipant(participant.id)}
												/>
												<Label
													for={`discount-${participant.id}`}
													class="text-sm font-normal cursor-pointer truncate"
												>
													{participant.name}
												</Label>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">กรุณาเพิ่มผู้เข้าร่วมก่อน</p>
								{/if}
							</div>

							<div class="flex flex-col sm:flex-row justify-end gap-2">
								<Button variant="outline" onclick={() => { isDiscountDialogOpen = false; resetDiscountForm(); }} class="w-full sm:w-auto">
									ยกเลิก
								</Button>
								<Button
									onclick={handleDiscountSubmit}
									disabled={!discountForm.name.trim() || discountForm.value <= 0 || discountForm.selectedParticipants.length === 0}
									class="w-full sm:w-auto"
								>
									{editingDiscountId ? 'แก้ไข' : 'เพิ่ม'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<!-- แสดงส่วนลดปัจจุบัน -->
			{#if $billSettings.discounts.length > 0}
				<div class="space-y-2">
					{#each $billSettings.discounts as discount (discount.id)}
						<div class="rounded-lg border p-3 bg-muted/50">
							<div class="flex items-start justify-between gap-3">
								<div class="space-y-1 min-w-0 flex-1">
									<div class="flex items-center gap-2 flex-wrap">
										<Badge variant="secondary" class="text-xs">
											{discount.name}
										</Badge>
										<Badge variant="outline" class="text-xs">
											{#if discount.type === 'percentage'}
												{discount.value}%
											{:else}
												{formatPrice(discount.value)}
											{/if}
										</Badge>
									</div>
									<div class="text-xs sm:text-sm text-muted-foreground">
										สำหรับ: {getDiscountParticipantNames(discount.participants)}
										({discount.participants.length} คน)
									</div>
								</div>
								<div class="flex gap-1 flex-shrink-0">
									<Tooltip text="แก้ไขส่วนลด">
										<Button
											size="sm"
											variant="ghost"
											onclick={() => openDiscountDialog(discount)}
											class="h-7 w-7 p-0"
										>
											<Edit class="h-3 w-3" />
										</Button>
									</Tooltip>
									<Tooltip text="ลบส่วนลด">
										<Button
											size="sm"
											variant="ghost"
											onclick={() => removeDiscount(discount.id)}
											class="h-7 w-7 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</Tooltip>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-4 text-muted-foreground">
					<Percent class="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p class="text-sm">ยังไม่มีส่วนลด</p>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>
