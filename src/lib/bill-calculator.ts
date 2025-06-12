import type { Participant, MenuItem, BillSettings, BillSummary } from './types.js';

/**
 * คำนวณยอดรวมของแต่ละผู้เข้าร่วม
 * @param participants รายชื่อผู้เข้าร่วมทั้งหมด
 * @param menuItems รายการอาหารทั้งหมด
 * @param settings การตั้งค่าบิล (VAT, ค่าบริการ, ส่วนลด)
 * @returns สรุปยอดของแต่ละคน
 */
export function calculateBillSummary(
	participants: Participant[],
	menuItems: MenuItem[],
	settings: BillSettings
): BillSummary[] {
	return participants.map(participant => {
		// คำนวณราคาอาหารที่แต่ละคนสั่ง
		const foodTotal = menuItems.reduce((total, item) => {
			if (item.participants.includes(participant.id)) {
				// แบ่งราคาตามจำนวนคนที่สั่งเมนูนั้น
				return total + (item.price / item.participants.length);
			}
			return total;
		}, 0);

		// คำนวณค่าบริการ
		const serviceCharge = (foodTotal * settings.serviceChargePercentage) / 100;

		// คำนวณ VAT (จากยอดรวมอาหาร + ค่าบริการ)
		const vat = ((foodTotal + serviceCharge) * settings.vatPercentage) / 100;

		// คำนวณส่วนลดที่ได้รับ
		let discountReceived = 0;
		if (settings.discount && settings.discount.participants.includes(participant.id)) {
			const subtotal = foodTotal + serviceCharge + vat;

			if (settings.discount.type === 'fixed') {
				// ส่วนลดแบบจำนวนเงินคงที่ - แบ่งกันตามจำนวนคนที่ได้รับส่วนลด
				discountReceived = settings.discount.value / settings.discount.participants.length;
			} else {
				// ส่วนลดแบบเปอร์เซ็นต์
				discountReceived = (subtotal * settings.discount.value) / 100;
			}
		}

		// คำนวณยอดรวมสุดท้าย
		const grandTotal = Math.max(0, foodTotal + serviceCharge + vat - discountReceived);

		return {
			participantId: participant.id,
			participantName: participant.name,
			foodTotal: Math.round(foodTotal * 100) / 100,
			serviceCharge: Math.round(serviceCharge * 100) / 100,
			vat: Math.round(vat * 100) / 100,
			discountReceived: Math.round(discountReceived * 100) / 100,
			grandTotal: Math.round(grandTotal * 100) / 100
		};
	});
}

/**
 * คำนวณยอดรวมทั้งหมดของบิล
 */
export function calculateTotalBill(menuItems: MenuItem[], settings: BillSettings) {
	const subtotal = menuItems.reduce((total, item) => total + item.price, 0);
	const serviceCharge = (subtotal * settings.serviceChargePercentage) / 100;
	const vat = ((subtotal + serviceCharge) * settings.vatPercentage) / 100;

	let totalDiscount = 0;
	if (settings.discount) {
		if (settings.discount.type === 'fixed') {
			totalDiscount = settings.discount.value;
		} else {
			totalDiscount = ((subtotal + serviceCharge + vat) * settings.discount.value) / 100;
		}
	}

	return {
		subtotal: Math.round(subtotal * 100) / 100,
		serviceCharge: Math.round(serviceCharge * 100) / 100,
		vat: Math.round(vat * 100) / 100,
		totalDiscount: Math.round(totalDiscount * 100) / 100,
		grandTotal: Math.round((subtotal + serviceCharge + vat - totalDiscount) * 100) / 100
	};
}
