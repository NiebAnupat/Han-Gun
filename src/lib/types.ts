// ประเภทข้อมูลสำหรับแอปพลิเคชัน "หารกัน"

export interface Participant {
	id: string;
	name: string;
}

export interface MenuItem {
	id: string;
	name: string;
	price: number;
	participants: string[]; // IDs ของผู้เข้าร่วมที่สั่งเมนูนี้
}

export interface Discount {
	id: string;
	name: string; // ชื่อส่วนลด เช่น "ส่วนลดสมาชิก", "คูปองส่วนลด"
	type: 'fixed' | 'percentage';
	value: number;
	participants: string[]; // IDs ของผู้เข้าร่วมที่ได้รับส่วนลด
}

export interface BillSettings {
	vatPercentage: number; // เปอร์เซ็นต์ VAT (เช่น 7%)
	serviceChargePercentage: number; // เปอร์เซ็นต์ค่าบริการ (เช่น 10%)
	discounts: Discount[]; // เปลี่ยนจาก discount เป็น discounts array
}

export interface BillSummary {
	participantId: string;
	participantName: string;
	foodTotal: number; // ราคาอาหารที่สั่ง
	serviceCharge: number; // ค่าบริการ
	vat: number; // VAT
	discountReceived: number; // ส่วนลดที่ได้รับ
	grandTotal: number; // ยอดรวมที่ต้องจ่าย
}

export interface PromptPayInfo {
	phoneNumber?: string;
	bankName?: string;
	accountNumber?: string;
	accountName?: string;
}

export interface HistoryEntry {
	id: string;
	name: string; // ชื่อบิล เช่น "มื้อเที่ยง 12 มิ.ย. 2568"
	createdAt: Date;
	participants: Participant[];
	menuItems: MenuItem[];
	billSettings: BillSettings;
	billSummary: BillSummary[];
	totalAmount: number; // ยอดรวมทั้งหมด
}
