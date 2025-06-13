<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';	import { PlusCircle, Trash2, Edit2, UtensilsCrossed } from 'lucide-svelte';
	import { participants, menuItems, addMenuItem, removeMenuItem, updateMenuItem } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import type { MenuItem } from '$lib/types.js';	let isDialogOpen = false;
	let editingItem: MenuItem | null = null;
	let formData = {
		name: '',
		price: 0,
		selectedParticipants: [] as string[]
	};

	function resetForm() {
		formData = {
			name: '',
			price: 0,
			selectedParticipants: []
		};
		editingItem = null;
	}

	function openAddDialog() {
		resetForm();
		isDialogOpen = true;
	}

	function openEditDialog(item: MenuItem) {
		editingItem = item;
		formData = {
			name: item.name,
			price: item.price,
			selectedParticipants: [...item.participants]
		};
		isDialogOpen = true;
	}	function handleSubmit() {
		if (!formData.name.trim()) {
			addToast('กรุณาใส่ชื่อเมนู', 'warning');
			return;
		}
		if (formData.price <= 0) {
			addToast('กรุณาใส่ราคาที่ถูกต้อง', 'warning');
			return;
		}
		if (formData.selectedParticipants.length === 0) {
			addToast('กรุณาเลือกผู้ที่สั่งเมนูนี้', 'warning');
			return;
		}

		if (editingItem) {
			// แก้ไขรายการ
			updateMenuItem(editingItem.id, {
				name: formData.name.trim(),
				price: formData.price,
				participants: formData.selectedParticipants
			});
			addToast(`แก้ไข "${formData.name.trim()}" เรียบร้อยแล้ว`, 'success');
		} else {
			// เพิ่มรายการใหม่
			addMenuItem(formData.name.trim(), formData.price, formData.selectedParticipants);
			addToast(`เพิ่ม "${formData.name.trim()}" เรียบร้อยแล้ว`, 'success');
		}

		isDialogOpen = false;
		resetForm();
	}	function toggleParticipant(participantId: string) {
		if (formData.selectedParticipants.includes(participantId)) {
			formData.selectedParticipants = formData.selectedParticipants.filter(id => id !== participantId);
		} else {
			formData.selectedParticipants = [...formData.selectedParticipants, participantId];
		}
	}

	function selectAllParticipants() {
		if (formData.selectedParticipants.length === $participants.length) {
			// If all are selected, deselect all
			formData.selectedParticipants = [];
		} else {
			// Select all participants
			formData.selectedParticipants = $participants.map(p => p.id);
		}
	}

	function getParticipantNames(participantIds: string[]) {
		return participantIds
			.map(id => $participants.find(p => p.id === id)?.name)
			.filter(Boolean)
			.join(', ');
	}
	function formatPrice(price: number) {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB'
		}).format(price);
	}

	function handleRemoveMenuItem(item: MenuItem) {
		removeMenuItem(item.id);
		addToast(`ลบ "${item.name}" เรียบร้อยแล้ว`, 'info');
	}
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<UtensilsCrossed class="h-5 w-5" />
				รายการอาหาร
			</div>			<Dialog bind:open={isDialogOpen}>
				<DialogTrigger>
					<Button onclick={openAddDialog} disabled={$participants.length === 0}>
						<PlusCircle class="h-4 w-4" />
						เพิ่มเมนู
					</Button>
				</DialogTrigger>
				<DialogContent class="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingItem ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหาร'}
						</DialogTitle>
					</DialogHeader>
					<div class="space-y-4">
						<!-- ชื่อเมนู -->
						<div class="space-y-2">
							<Label for="menu-name">ชื่อเมนู</Label>
							<Input
								id="menu-name"
								bind:value={formData.name}
								placeholder="ชื่อเมนูอาหาร"
							/>
						</div>

						<!-- ราคา -->
						<div class="space-y-2">
							<Label for="menu-price">ราคา (บาท)</Label>
							<Input
								id="menu-price"
								type="number"
								min="0"
								step="0.01"
								bind:value={formData.price}
								placeholder="0.00"
							/>
						</div>						<!-- เลือกผู้สั่ง -->
						<div class="space-y-2">
							<div class="flex items-baseline justify-between">
								<Label>ผู้ที่สั่งเมนูนี้</Label>
								{#if $participants.length > 0}
									<div class="flex items-center space-x-2">
										<Checkbox
											id="select-all"
											checked={formData.selectedParticipants.length === $participants.length}
											onCheckedChange={selectAllParticipants}
										/>
										<Label for="select-all" class="text-xs cursor-pointer">
											เลือกทั้งหมด
										</Label>
									</div>
								{/if}
							</div>
							{#if $participants.length > 0}
								<div class="grid gap-2 max-h-40 overflow-y-auto">
									{#each $participants as participant (participant.id)}
										<div class="flex items-center space-x-2">
											<Checkbox
												id={participant.id}
												checked={formData.selectedParticipants.includes(participant.id)}
												onCheckedChange={() => toggleParticipant(participant.id)}
											/>
											<Label
												for={participant.id}
												class="text-sm font-normal cursor-pointer"
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

						<!-- ปุ่มบันทึก -->
						<div class="flex justify-end gap-2">
							<Button variant="outline" onclick={() => isDialogOpen = false}>
								ยกเลิก
							</Button>
							<Button
								onclick={handleSubmit}
								disabled={!formData.name.trim() || formData.price <= 0 || formData.selectedParticipants.length === 0}
							>
								{editingItem ? 'บันทึก' : 'เพิ่มเมนู'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</CardTitle>
	</CardHeader>
	<CardContent>
		{#if $menuItems.length > 0}
			<div class="space-y-3">
				{#each $menuItems as item (item.id)}
					<div class="flex items-center justify-between rounded-lg border p-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								<h4 class="font-medium">{item.name}</h4>
								<Badge variant="outline" class="text-xs">
									{formatPrice(item.price)}
								</Badge>
							</div>
							<div class="flex items-center gap-1 text-sm text-muted-foreground">
								<span>สั่งโดย:</span>
								<div class="flex flex-wrap gap-1">
									{#each item.participants as participantId (participantId)}
										{@const participant = $participants.find(p => p.id === participantId)}
										{#if participant}
											<Badge variant="secondary" class="text-xs">
												{participant.name}
											</Badge>
										{/if}
									{/each}
								</div>
								<span class="text-xs">
									({item.participants.length} คน)
								</span>
							</div>
							<div class="text-xs text-muted-foreground mt-1">
								ราคาต่อคน: {formatPrice(item.price / item.participants.length)}
							</div>
						</div>
						<div class="flex gap-1 ml-4">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => openEditDialog(item)}
								class="h-8 w-8 p-0"
							>
								<Edit2 class="h-3 w-3" />
							</Button>							<Button
								size="sm"
								variant="ghost"
								onclick={() => handleRemoveMenuItem(item)}
								class="h-8 w-8 p-0 text-destructive hover:text-destructive"
							>
								<Trash2 class="h-3 w-3" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8 text-muted-foreground">
				<UtensilsCrossed class="h-12 w-12 mx-auto mb-2 opacity-50" />
				<p>ยังไม่มีรายการอาหาร</p>
				{#if $participants.length === 0}
					<p class="text-sm">กรุณาเพิ่มผู้เข้าร่วมก่อนแล้วจึงเพิ่มเมนูอาหาร</p>
				{:else}
					<p class="text-sm">เริ่มต้นด้วยการเพิ่มเมนูอาหารที่สั่งกันเถอะ</p>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
