import { writable } from 'svelte/store';
import type { Participant, MenuItem, BillSettings, PromptPayInfo } from './types.js';
import {
	loadParticipants,
	saveParticipants,
	loadMenuItems,
	saveMenuItems,
	loadBillSettings,
	saveBillSettings,
	loadPromptPayInfo,
	savePromptPayInfo
} from './localStorage.js';

// สร้าง stores พร้อมข้อมูลจาก localStorage
export const participants = writable<Participant[]>(loadParticipants());
export const menuItems = writable<MenuItem[]>(loadMenuItems());
export const billSettings = writable<BillSettings>(loadBillSettings());
export const promptPayInfo = writable<PromptPayInfo>(loadPromptPayInfo());

// เก็บข้อมูลไว้ใน localStorage เมื่อมีการเปลี่ยนแปลง
participants.subscribe(value => saveParticipants(value));
menuItems.subscribe(value => saveMenuItems(value));
billSettings.subscribe(value => saveBillSettings(value));
promptPayInfo.subscribe(value => savePromptPayInfo(value));

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
