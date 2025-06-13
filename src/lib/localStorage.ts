// localStorage utilities สำหรับ "หารกัน"
import type { Participant, MenuItem, BillSettings, PromptPayInfo, HistoryEntry } from './types.js';

const STORAGE_KEYS = {
	PARTICIPANTS: 'han-gun-participants',
	MENU_ITEMS: 'han-gun-menu-items',
	BILL_SETTINGS: 'han-gun-bill-settings',
	PROMPTPAY_INFO: 'han-gun-promptpay-info',
	HISTORY: 'han-gun-history'
} as const;

// Helper function to safely parse JSON
function safeJSONParse<T>(value: string | null, fallback: T): T {
	if (!value) return fallback;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

// Participants
export function saveParticipants(participants: Participant[]): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
	}
}

export function loadParticipants(): Participant[] {
	if (typeof window === 'undefined') return [];
	const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
	return safeJSONParse(data, []);
}

// Menu Items
export function saveMenuItems(menuItems: MenuItem[]): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
	}
}

export function loadMenuItems(): MenuItem[] {
	if (typeof window === 'undefined') return [];
	const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
	return safeJSONParse(data, []);
}

// Bill Settings
export function saveBillSettings(settings: BillSettings): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEYS.BILL_SETTINGS, JSON.stringify(settings));
	}
}

export function loadBillSettings(): BillSettings {
	if (typeof window === 'undefined') {
		return { vatPercentage: 7, serviceChargePercentage: 10, discounts: [] };
	}
	const data = localStorage.getItem(STORAGE_KEYS.BILL_SETTINGS);
	const settings: any = safeJSONParse(data, {
		vatPercentage: 7,
		serviceChargePercentage: 10,
		discount: null
	});

	// Migration: แปลง discount เก่าเป็น discounts array ใหม่
	if ('discount' in settings && settings.discount && settings.discount !== null) {
		const oldDiscount = settings.discount;
		return {
			vatPercentage: settings.vatPercentage || 7,
			serviceChargePercentage: settings.serviceChargePercentage || 10,
			discounts: [
				{
					id: Date.now().toString(),
					name: 'ส่วนลดเก่า',
					type: oldDiscount.type,
					value: oldDiscount.value,
					participants: oldDiscount.participants || []
				}
			]
		};
	}

	// ส่งคืนข้อมูลปกติ
	return {
		vatPercentage: settings.vatPercentage || 7,
		serviceChargePercentage: settings.serviceChargePercentage || 10,
		discounts: Array.isArray(settings.discounts) ? settings.discounts : []
	};
}

// PromptPay Info
export function savePromptPayInfo(info: PromptPayInfo): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEYS.PROMPTPAY_INFO, JSON.stringify(info));
	}
}

export function loadPromptPayInfo(): PromptPayInfo {
	if (typeof window === 'undefined') return {};
	const data = localStorage.getItem(STORAGE_KEYS.PROMPTPAY_INFO);
	return safeJSONParse(data, {});
}

// Clear all data
export function clearAllData(): void {
	if (typeof window !== 'undefined') {
		Object.values(STORAGE_KEYS).forEach(key => {
			localStorage.removeItem(key);
		});
	}
}

// History
export function saveHistoryEntry(entry: HistoryEntry): void {
	if (typeof window !== 'undefined') {
		const history = loadHistory();
		// เพิ่มรายการใหม่ที่ด้านบน (เรียงจากใหม่ไปเก่า)
		const updatedHistory = [entry, ...history];
		// จำกัดประวัติไม่เกิน 50 รายการ
		const limitedHistory = updatedHistory.slice(0, 50);
		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
	}
}

export function loadHistory(): HistoryEntry[] {
	if (typeof window === 'undefined') return [];
	const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
	const history = safeJSONParse(data, []);
	// แปลง createdAt จาก string กลับเป็น Date object
	return history.map((entry: any) => ({
		...entry,
		createdAt: new Date(entry.createdAt)
	}));
}

export function deleteHistoryEntry(id: string): void {
	if (typeof window !== 'undefined') {
		const history = loadHistory();
		const updatedHistory = history.filter(entry => entry.id !== id);
		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
	}
}

export function clearHistory(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(STORAGE_KEYS.HISTORY);
	}
}

export function mergeHistory(newEntries: HistoryEntry[]): HistoryEntry[] {
	if (typeof window === 'undefined') return newEntries;

	const existingHistory = loadHistory();
	const existingIds = new Set(existingHistory.map(entry => entry.id));

	// กรองรายการที่ซ้ำกัน (ตาม ID)
	const uniqueNewEntries = newEntries.filter(entry => !existingIds.has(entry.id));

	// รวมและเรียงตามวันที่ (ใหม่ไปเก่า)
	const mergedHistory = [...existingHistory, ...uniqueNewEntries]
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 100); // จำกัดไม่เกิน 100 รายการ

	// บันทึกกลับ localStorage
	localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mergedHistory));

	return mergedHistory;
}

export function replaceHistory(newEntries: HistoryEntry[]): void {
	if (typeof window !== 'undefined') {
		const sortedEntries = newEntries
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice(0, 100); // จำกัดไม่เกิน 100 รายการ

		localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(sortedEntries));
	}
}

// Export/Import all data
export interface ExportDataStructure {
	version: string;
	timestamp: string;
	data: {
		participants: Participant[];
		menuItems: MenuItem[];
		billSettings: BillSettings;
		promptPayInfo: PromptPayInfo;
		history?: HistoryEntry[];
	};
}

export function exportAllData(includeHistory = false): ExportDataStructure {
	return {
		version: '1.0',
		timestamp: new Date().toISOString(),
		data: {
			participants: loadParticipants(),
			menuItems: loadMenuItems(),
			billSettings: loadBillSettings(),
			promptPayInfo: loadPromptPayInfo(),
			...(includeHistory && { history: loadHistory() })
		}
	};
}

export function importAllData(data: ExportDataStructure): void {
	if (!data.version || !data.data) {
		throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
	}

	const { participants, menuItems, billSettings, promptPayInfo, history } = data.data;

	// ตรวจสอบข้อมูลที่จำเป็น
	if (!Array.isArray(participants) || !Array.isArray(menuItems) || !billSettings) {
		throw new Error('ข้อมูลไม่ครบถ้วนหรือผิดรูปแบบ');
	}

	// Migration สำหรับ billSettings (แปลง discount เก่าเป็น discounts array)
	let migratedBillSettings = billSettings;
	if ('discount' in billSettings) {
		const oldDiscount = (billSettings as any).discount;
		migratedBillSettings = {
			vatPercentage: billSettings.vatPercentage || 7,
			serviceChargePercentage: billSettings.serviceChargePercentage || 10,
			discounts: oldDiscount && oldDiscount !== null ? [
				{
					id: Date.now().toString(),
					name: 'ส่วนลดเก่า',
					type: oldDiscount.type,
					value: oldDiscount.value,
					participants: oldDiscount.participants || []
				}
			] : []
		};
	}

	// นำเข้าข้อมูล
	saveParticipants(participants);
	saveMenuItems(menuItems);
	saveBillSettings(migratedBillSettings);
	savePromptPayInfo(promptPayInfo || {});

	// นำเข้าประวัติถ้ามี พร้อม migration
	if (history && Array.isArray(history)) {
		const migratedHistory = history.map(entry => {
			const migratedEntry = { ...entry };

			// Migration: แปลง discount เก่าเป็น discounts array ในประวัติ
			if (migratedEntry.billSettings && 'discount' in migratedEntry.billSettings) {
				const oldDiscount = (migratedEntry.billSettings as any).discount;
				migratedEntry.billSettings = {
					...migratedEntry.billSettings,
					discounts: oldDiscount && oldDiscount !== null ? [
						{
							id: `${entry.id}-discount`,
							name: 'ส่วนลดเก่า',
							type: oldDiscount.type,
							value: oldDiscount.value,
							participants: oldDiscount.participants || []
						}
					] : []
				};
				// ลบ discount เก่าออก
				delete (migratedEntry.billSettings as any).discount;
			}

			return migratedEntry;
		});

		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(migratedHistory));
		}
	}
}
