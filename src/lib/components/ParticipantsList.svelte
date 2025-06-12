<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';	import { UserPlus, Trash2, Edit2 } from 'lucide-svelte';
	import { participants, addParticipant, removeParticipant, updateParticipantName } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';
	import type { Participant } from '$lib/types.js';	let newParticipantName = '';
	let editingId: string | null = null;
	let editingName = '';function handleAddParticipant() {
		const trimmedName = newParticipantName.trim();
		if (!trimmedName) {
			addToast('กรุณาใส่ชื่อผู้เข้าร่วม', 'warning');
			return;
		}

		// ตรวจสอบชื่อซ้ำ
		if ($participants.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
			addToast('มีชื่อนี้อยู่แล้ว กรุณาใส่ชื่ออื่น', 'warning');
			return;
		}

		addParticipant(trimmedName);
		addToast(`เพิ่ม "${trimmedName}" เรียบร้อยแล้ว`, 'success');
		newParticipantName = '';
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleAddParticipant();
		}
	}

	function startEditing(participant: Participant) {
		editingId = participant.id;
		editingName = participant.name;
	}	function finishEditing() {
		const trimmedName = editingName.trim();
		if (!trimmedName) {
			addToast('กรุณาใส่ชื่อที่ถูกต้อง', 'warning');
			return;
		}

		// ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
		if ($participants.some(p => p.id !== editingId && p.name.toLowerCase() === trimmedName.toLowerCase())) {
			addToast('มีชื่อนี้อยู่แล้ว กรุณาใส่ชื่ออื่น', 'warning');
			return;
		}

		if (editingId) {
			updateParticipantName(editingId, trimmedName);
			addToast('แก้ไขชื่อเรียบร้อยแล้ว', 'success');
		}
		editingId = null;
		editingName = '';
	}

	function cancelEditing() {
		editingId = null;
		editingName = '';
	}
	function handleEditKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			finishEditing();
		} else if (event.key === 'Escape') {
			cancelEditing();
		}
	}

	function handleRemoveParticipant(participant: Participant) {
		removeParticipant(participant.id);
		addToast(`ลบ "${participant.name}" เรียบร้อยแล้ว`, 'info');
	}
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<UserPlus class="h-5 w-5" />
			รายชื่อผู้เข้าร่วม
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- ฟอร์มเพิ่มผู้เข้าร่วม -->
		<div class="flex gap-2">
			<div class="flex-1">
				<Label for="participant-name" class="sr-only">ชื่อผู้เข้าร่วม</Label>
				<Input
					id="participant-name"
					bind:value={newParticipantName}
					placeholder="ใส่ชื่อผู้เข้าร่วม"
					onkeypress={handleKeyPress}
				/>
			</div>
			<Button onclick={handleAddParticipant} disabled={!newParticipantName.trim()}>
				<UserPlus class="h-4 w-4" />
				เพิ่ม
			</Button>
		</div>

		<!-- รายชื่อผู้เข้าร่วม -->
		{#if $participants.length > 0}
			<div class="space-y-2">
				<Label class="text-sm font-medium">ผู้เข้าร่วมทั้งหมด ({$participants.length} คน)</Label>
				<div class="grid gap-2">
					{#each $participants as participant (participant.id)}
						<div class="flex items-center justify-between rounded-lg border p-3">
							{#if editingId === participant.id}
								<!-- โหมดแก้ไข -->
								<Input
									bind:value={editingName}
									class="flex-1 mr-2"
									onkeypress={handleEditKeyPress}
									onfocusout={finishEditing}
									autofocus
								/>
								<div class="flex gap-1">
									<Button size="sm" variant="ghost" onclick={finishEditing}>
										บันทึก
									</Button>
									<Button size="sm" variant="ghost" onclick={cancelEditing}>
										ยกเลิก
									</Button>
								</div>
							{:else}
								<!-- โหมดแสดงผล -->
								<div class="flex items-center gap-2 flex-1">
									<Badge variant="secondary" class="text-sm">
										{participant.name}
									</Badge>
								</div>
								<div class="flex gap-1">
									<Button
										size="sm"
										variant="ghost"
										onclick={() => startEditing(participant)}
										class="h-8 w-8 p-0"
									>
										<Edit2 class="h-3 w-3" />
									</Button>									<Button
										size="sm"
										variant="ghost"
										onclick={() => handleRemoveParticipant(participant)}
										class="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 class="h-3 w-3" />
									</Button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-center py-8 text-muted-foreground">
				<UserPlus class="h-12 w-12 mx-auto mb-2 opacity-50" />
				<p>ยังไม่มีผู้เข้าร่วม</p>
				<p class="text-sm">เริ่มต้นด้วยการเพิ่มชื่อผู้เข้าร่วมกันเถอะ</p>
			</div>
		{/if}
	</CardContent>
</Card>
