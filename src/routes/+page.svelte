<script lang="ts">
	import ParticipantsList from '$lib/components/ParticipantsList.svelte';
	import MenuItems from '$lib/components/MenuItems.svelte';
	import BillSettings from '$lib/components/BillSettings.svelte';
	import BillSummary from '$lib/components/BillSummary.svelte';
	import PromptPayQR from '$lib/components/PromptPayQR.svelte';
	import QuickSummary from '$lib/components/QuickSummary.svelte';
	import HelpDialog from '$lib/components/HelpDialog.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Calculator, Trash2, RefreshCw } from 'lucide-svelte';
	import { clearAllData } from '$lib/localStorage.js';
	import { participants, menuItems, billSettings, promptPayInfo } from '$lib/stores.js';
	import { addToast } from '$lib/toast.js';

	let isResetDialogOpen = false;

	function handleResetAllData() {
		clearAllData();

		// Reset all stores to default values
		participants.set([]);
		menuItems.set([]);
		billSettings.set({
			vatPercentage: 7,
			serviceChargePercentage: 10,
			discount: null
		});
		promptPayInfo.set({});

		addToast('ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว', 'success');
		isResetDialogOpen = false;
	}

	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		// Ctrl/Cmd + R = Reset data
		if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
			event.preventDefault();
			isResetDialogOpen = true;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/50">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div role="application" tabindex="0" onkeydown={handleKeydown} style="outline: none;">
	<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-2">
						<Calculator class="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 class="text-2xl font-bold">หารกัน</h1>
						<p class="text-sm text-muted-foreground">แอปแบ่งค่าอาหารสำหรับกลุ่มเพื่อน</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-2">
					<HelpDialog />
					<Dialog bind:open={isResetDialogOpen}>
					<DialogTrigger>
						<Button variant="outline" size="sm" class="hidden sm:flex">
							<RefreshCw class="h-4 w-4" />
							รีเซ็ต
						</Button>
						<Button variant="outline" size="sm" class="sm:hidden">
							<RefreshCw class="h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent class="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>ล้างข้อมูลทั้งหมด</DialogTitle>
						</DialogHeader>
						<div class="space-y-4">
							<div class="text-sm text-muted-foreground">
								<p>คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?</p>
								<p class="mt-2 text-destructive">⚠️ ข้อมูลที่จะถูกลบ:</p>
								<ul class="mt-1 list-disc list-inside space-y-1">
									<li>รายชื่อผู้เข้าร่วมทั้งหมด</li>
									<li>รายการอาหารทั้งหมด</li>
									<li>การตั้งค่าบิล VAT, ค่าบริการ, ส่วนลด</li>
									<li>ข้อมูล PromptPay</li>
								</ul>
							</div>
							<div class="flex justify-end gap-2">
								<Button variant="outline" onclick={() => isResetDialogOpen = false}>
									ยกเลิก
								</Button>
								<Button variant="destructive" onclick={handleResetAllData}>
									<Trash2 class="h-4 w-4" />
									ล้างข้อมูลทั้งหมด
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				</div>
			</div>
		</div>
	</header>
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<!-- Quick Summary -->
		<QuickSummary />

		<div class="grid gap-6 lg:gap-8 lg:grid-cols-2">
			<!-- Left Column -->
			<div class="space-y-6">
				<!-- ผู้เข้าร่วม -->
				<ParticipantsList />

				<!-- รายการอาหาร -->
				<MenuItems />
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- การตั้งค่าบิล -->
				<BillSettings />

				<!-- สรุปยอดเงิน -->
				<BillSummary />

				<!-- PromptPay QR Code -->
				<PromptPayQR />
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
		<div class="container mx-auto px-4 py-6">
			<div class="text-center text-sm text-muted-foreground space-y-2">
				<p>🍽️ สร้างด้วยความรักสำหรับการแบ่งค่าอาหารที่ง่ายและยุติธรรม</p>
				<p>ข้อมูลทั้งหมดจัดเก็บในเครื่องของคุณเท่านั้น • คีย์ลัด: Ctrl+R เพื่อรีเซ็ตข้อมูล</p>
			</div>
		</div>
	</footer>

	<!-- Toast Notifications -->
	<Toast />
	</div>
</div>
