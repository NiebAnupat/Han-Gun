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
		return { vatPercentage: 7, serviceChargePercentage: 10, discount: null };
	}
	const data = localStorage.getItem(STORAGE_KEYS.BILL_SETTINGS);
	return safeJSONParse(data, {
		vatPercentage: 7,
		serviceChargePercentage: 10,
		discount: null
	});
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
