<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { HelpCircle, Users, UtensilsCrossed, Settings, Receipt, QrCode, Keyboard } from 'lucide-svelte';

	let isOpen = false;
</script>

<Dialog bind:open={isOpen}>
	<DialogTrigger>
		<Button variant="ghost" size="sm">
			<HelpCircle class="h-4 w-4" />
			<span class="hidden sm:inline">ช่วยเหลือ</span>
		</Button>
	</DialogTrigger>
	<DialogContent class="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>คู่มือการใช้งาน "หารกัน"</DialogTitle>
		</DialogHeader>
		<div class="space-y-6">
			<!-- ขั้นตอนการใช้งาน -->
			<div class="space-y-4">
				<h3 class="font-semibold text-lg">📖 ขั้นตอนการใช้งาน</h3>

				<div class="space-y-3">
					<div class="flex items-start gap-3">
						<Badge variant="secondary" class="shrink-0">1</Badge>
						<div>
							<div class="flex items-center gap-2 mb-1">
								<Users class="h-4 w-4" />
								<span class="font-medium">เพิ่มผู้เข้าร่วม</span>
							</div>
							<p class="text-sm text-muted-foreground">
								เริ่มต้นด้วยการเพิ่มชื่อผู้เข้าร่วมทานอาหารทุกคน
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<Badge variant="secondary" class="shrink-0">2</Badge>
						<div>
							<div class="flex items-center gap-2 mb-1">
								<UtensilsCrossed class="h-4 w-4" />
								<span class="font-medium">เพิ่มรายการอาหาร</span>
							</div>
							<p class="text-sm text-muted-foreground">
								เพิ่มเมนูอาหารพร้อมราคา และเลือกว่าใครบ้างที่สั่งเมนูนั้น
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<Badge variant="secondary" class="shrink-0">3</Badge>
						<div>
							<div class="flex items-center gap-2 mb-1">
								<Settings class="h-4 w-4" />
								<span class="font-medium">ตั้งค่าบิล</span>
							</div>
							<p class="text-sm text-muted-foreground">
								กำหนด VAT, ค่าบริการ และส่วนลด (ถ้ามี)
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<Badge variant="secondary" class="shrink-0">4</Badge>
						<div>
							<div class="flex items-center gap-2 mb-1">
								<Receipt class="h-4 w-4" />
								<span class="font-medium">ดูสรุปยอดเงิน</span>
							</div>
							<p class="text-sm text-muted-foreground">
								ตรวจสอบยอดเงินที่แต่ละคนต้องจ่าย
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<Badge variant="secondary" class="shrink-0">5</Badge>
						<div>
							<div class="flex items-center gap-2 mb-1">
								<QrCode class="h-4 w-4" />
								<span class="font-medium">สร้าง QR Code</span>
							</div>
							<p class="text-sm text-muted-foreground">
								ตั้งค่า PromptPay และสร้าง QR Code สำหรับการโอนเงิน
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- คีย์ลัด -->
			<div class="space-y-3">
				<h3 class="font-semibold text-lg flex items-center gap-2">
					<Keyboard class="h-5 w-5" />
					คีย์บอร์ดลัด
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
					<div class="flex justify-between items-center p-2 rounded bg-muted/50">
						<span>รีเซ็ตข้อมูลทั้งหมด</span>
						<Badge variant="outline">Ctrl+R</Badge>
					</div>
					<div class="flex justify-between items-center p-2 rounded bg-muted/50">
						<span>เพิ่มผู้เข้าร่วม</span>
						<Badge variant="outline">Enter</Badge>
					</div>
					<div class="flex justify-between items-center p-2 rounded bg-muted/50">
						<span>บันทึกการแก้ไข</span>
						<Badge variant="outline">Enter</Badge>
					</div>
					<div class="flex justify-between items-center p-2 rounded bg-muted/50">
						<span>ยกเลิกการแก้ไข</span>
						<Badge variant="outline">Escape</Badge>
					</div>
				</div>
			</div>

			<!-- เคล็ดลับ -->
			<div class="space-y-3">
				<h3 class="font-semibold text-lg">💡 เคล็ดลับการใช้งาน</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li class="flex items-start gap-2">
						<span class="text-primary font-bold">•</span>
						ข้อมูลทั้งหมดจะถูกบันทึกในเครื่องของคุณโดยอัตโนมัติ
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary font-bold">•</span>
						สามารถแก้ไขชื่อผู้เข้าร่วมและรายการอาหารได้ตลอดเวลา
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary font-bold">•</span>
						ส่วนลดจะถูกแบ่งเฉพาะกับคนที่เลือกไว้เท่านั้น
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary font-bold">•</span>
						สามารถแชร์หรือดาวน์โหลดสรุปยอดเงินได้
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary font-bold">•</span>
						QR Code จะใช้งานได้เมื่อตั้งค่า PromptPay แล้ว
					</li>
				</ul>
			</div>

			<!-- ปิดหน้าต่าง -->
			<div class="flex justify-end">
				<Button onclick={() => isOpen = false}>
					เข้าใจแล้ว
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>
