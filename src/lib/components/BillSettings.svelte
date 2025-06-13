<script lang="ts">	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import Tooltip from '$lib/components/Tooltip.svelte';import { Percent, DollarSign, Settings, Trash2 } from 'lucide-svelte';
	import { participants, billSettings } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import type { Discount } from '$lib/types.js';	let isDiscountDialogOpen = false;
	let isSettingsDialogOpen = false;
	let discountForm = {
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
			type: 'percentage',
			value: 0,
			selectedParticipants: []
		};
	}

	function openDiscountDialog() {
		if ($billSettings.discount) {
			discountForm = {
				type: $billSettings.discount.type,
				value: $billSettings.discount.value,
				selectedParticipants: [...$billSettings.discount.participants]
			};
		} else {
			resetDiscountForm();
		}
		isDiscountDialogOpen = true;
	}
	function handleDiscountSubmit() {
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
			type: discountForm.type,
			value: discountForm.value,
			participants: discountForm.selectedParticipants
		};

		billSettings.update(settings => ({
			...settings,
			discount
		}));

		addToast('บันทึกส่วนลดเรียบร้อยแล้ว', 'success');
		isDiscountDialogOpen = false;
	}
	function removeDiscount() {
		billSettings.update(settings => ({
			...settings,
			discount: null
		}));
		addToast('ลบส่วนลดเรียบร้อยแล้ว', 'info');
	}	function toggleDiscountParticipant(participantId: string) {
		if (discountForm.selectedParticipants.includes(participantId)) {
			discountForm.selectedParticipants = discountForm.selectedParticipants.filter(id => id !== participantId);
		} else {
			discountForm.selectedParticipants = [...discountForm.selectedParticipants, participantId];
		}
	}function handleSettingsSubmit() {
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

<Card class="w-full">	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2 min-w-0">
				<Settings class="h-5 w-5 flex-shrink-0" />
				<span class="truncate">การตั้งค่าบิล</span>
			</div>			<Dialog bind:open={isSettingsDialogOpen}>
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
	</CardHeader>	<CardContent class="space-y-4">
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
				<h4 class="font-medium text-sm sm:text-base">ส่วนลด</h4>				<Dialog bind:open={isDiscountDialogOpen}>
					<DialogTrigger>
						<Tooltip text={$billSettings.discount ? 'แก้ไขส่วนลด' : 'เพิ่มส่วนลด'} disabled={$participants.length === 0}>
							<Button
								variant="outline"
								size="sm"
								onclick={openDiscountDialog}
								disabled={$participants.length === 0}
								class="flex-shrink-0"
							>
								<Percent class="h-4 w-4 sm:mr-1" />
								<span class="hidden sm:inline">{$billSettings.discount ? 'แก้ไข' : 'เพิ่ม'}ส่วนลด</span>
							</Button>
						</Tooltip>
					</DialogTrigger>
					<DialogContent class="w-[95vw] max-w-md mx-auto">
						<DialogHeader>
							<DialogTitle class="text-base">จัดการส่วนลด</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
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
								<Button variant="outline" onclick={() => isDiscountDialogOpen = false} class="w-full sm:w-auto">
									ยกเลิก
								</Button>
								<Button
									onclick={handleDiscountSubmit}
									disabled={discountForm.value <= 0 || discountForm.selectedParticipants.length === 0}
									class="w-full sm:w-auto"
								>
									บันทึก
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<!-- แสดงส่วนลดปัจจุบัน -->
			{#if $billSettings.discount}
				<div class="rounded-lg border p-3 bg-muted/50">
					<div class="flex items-start justify-between gap-3">
						<div class="space-y-1 min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<Badge variant="secondary" class="text-xs">
									{#if $billSettings.discount.type === 'percentage'}
										{$billSettings.discount.value}% ส่วนลด
									{:else}
										{formatPrice($billSettings.discount.value)} ส่วนลด
									{/if}
								</Badge>
							</div>
							<div class="text-xs sm:text-sm text-muted-foreground">
								สำหรับ: {getDiscountParticipantNames($billSettings.discount.participants)}
								({$billSettings.discount.participants.length} คน)
							</div>
						</div>						<Tooltip text="ลบส่วนลด">
							<Button
								size="sm"
								variant="ghost"
								onclick={removeDiscount}
								class="h-7 w-7 p-0 text-destructive hover:text-destructive flex-shrink-0"
							>
								<Trash2 class="h-3 w-3" />
							</Button>
						</Tooltip>
					</div>
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
