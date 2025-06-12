import { writable } from 'svelte/store';
import type { Participant, MenuItem, BillSettings, PromptPayInfo, HistoryEntry } from './types.js';
import {
	loadParticipants,
	saveParticipants,
	loadMenuItems,
	saveMenuItems,
	loadBillSettings,
	saveBillSettings,
	loadPromptPayInfo,
	savePromptPayInfo,
	loadHistory,
	saveHistoryEntry,
	deleteHistoryEntry,
	mergeHistory,
	replaceHistory
} from './localStorage.js';

// สร้าง stores พร้อมข้อมูลจาก localStorage
export const participants = writable<Participant[]>(loadParticipants());
export const menuItems = writable<MenuItem[]>(loadMenuItems());
export const billSettings = writable<BillSettings>(loadBillSettings());
export const promptPayInfo = writable<PromptPayInfo>(loadPromptPayInfo());
export const history = writable<HistoryEntry[]>(loadHistory());

// เก็บข้อมูลไว้ใน localStorage เมื่อมีการเปลี่ยนแปลง
participants.subscribe(value => saveParticipants(value));
menuItems.subscribe(value => saveMenuItems(value));
billSettings.subscribe(value => saveBillSettings(value));
promptPayInfo.subscribe(value => savePromptPayInfo(value));
// หมายเหตุ: history ไม่ต้องการ auto-save เพราะจัดการด้วย manual functions

// Functions สำหรับจัดการผู้เข้าร่วม
export function addParticipant(name: string) {
	const id = Date.now().toString();
	participants.update(list => [...list, { id, name }]);
	return id;
}

export function removeParticipant(id: string) {
	participants.update(list => list.filter(p => p.id !== id));
	// ลบผู้เข้าร่วมออกจากรายการอาหารทั้งหมด
	menuItems.update(items =>
		items.map(item => ({
			...item,
			participants: item.participants.filter(pId => pId !== id)
		}))
	);
}

export function updateParticipantName(id: string, name: string) {
	participants.update(list =>
		list.map(p => p.id === id ? { ...p, name } : p)
	);
}

// Functions สำหรับจัดการรายการอาหาร
export function addMenuItem(name: string, price: number, participantIds: string[]) {
	const id = Date.now().toString();
	menuItems.update(list => [...list, { id, name, price, participants: participantIds }]);
	return id;
}

export function removeMenuItem(id: string) {
	menuItems.update(list => list.filter(item => item.id !== id));
}

export function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>) {
	menuItems.update(list =>
		list.map(item => item.id === id ? { ...item, ...updates } : item)
	);
}

// Functions สำหรับจัดการประวัติ
export function saveBillToHistory(name: string, billSummary: any[]) {
	// อ่านข้อมูลปัจจุบันจาก stores
	let currentParticipants: Participant[] = [];
	let currentMenuItems: MenuItem[] = [];
	let currentBillSettings: BillSettings = { vatPercentage: 7, serviceChargePercentage: 10, discount: null };

	participants.subscribe(value => currentParticipants = value)();
	menuItems.subscribe(value => currentMenuItems = value)();
	billSettings.subscribe(value => currentBillSettings = value)();

	// คำนวณยอดรวมทั้งหมด
	const totalAmount = billSummary.reduce((sum, person) => sum + person.grandTotal, 0);

	// สร้าง history entry
	const historyEntry: HistoryEntry = {
		id: Date.now().toString(),
		name: name.trim() || `บิล ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
		createdAt: new Date(),
		participants: [...currentParticipants],
		menuItems: [...currentMenuItems],
		billSettings: { ...currentBillSettings },
		billSummary: [...billSummary],
		totalAmount
	};

	// บันทึกลง localStorage
	saveHistoryEntry(historyEntry);

	// อัปเดต history store
	history.update(list => [historyEntry, ...list].slice(0, 50));
}

export function removeHistoryEntry(id: string) {
	deleteHistoryEntry(id);
	history.update(list => list.filter(entry => entry.id !== id));
}

export function clearCurrentBill() {
	participants.set([]);
	menuItems.set([]);
	billSettings.set({ vatPercentage: 7, serviceChargePercentage: 10, discount: null });
}

export function importHistoryData(newEntries: HistoryEntry[], replaceExisting: boolean = false) {
	if (replaceExisting) {
		replaceHistory(newEntries);
		history.set(newEntries);
	} else {
		const mergedEntries = mergeHistory(newEntries);
		history.set(mergedEntries);
	}
}
