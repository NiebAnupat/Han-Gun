// Export utilities สำหรับ "หารกัน"
import type { Participant, MenuItem, BillSettings, BillSummary } from './types.js';
import { calculateBillSummary, calculateTotalBill } from './bill-calculator.js';

/**
 * สร้างรายงานข้อมูลการแบ่งค่าอาหารในรูปแบบ text
 */
export function generateDetailedReport(
	participants: Participant[],
	menuItems: MenuItem[],
	settings: BillSettings
): string {
	const billSummary = calculateBillSummary(participants, menuItems, settings);
	const totalBill = calculateTotalBill(menuItems, settings);
	const date = new Date().toLocaleString('th-TH');

	let report = '';

	// Header
	report += '📱 รายงานการแบ่งค่าอาหาร "หารกัน"\n';
	report += `🕐 สร้างเมื่อ: ${date}\n`;
	report += '=' .repeat(50) + '\n\n';

	// ผู้เข้าร่วม
	report += '👥 ผู้เข้าร่วม:\n';
	participants.forEach((p, index) => {
		report += `   ${index + 1}. ${p.name}\n`;
	});
	report += '\n';

	// รายการอาหาร
	report += '🍽️ รายการอาหาร:\n';
	menuItems.forEach((item, index) => {
		const participantNames = item.participants
			.map(id => participants.find(p => p.id === id)?.name)
			.filter(Boolean)
			.join(', ');
		const pricePerPerson = item.price / item.participants.length;

		report += `   ${index + 1}. ${item.name}\n`;
		report += `      ราคารวม: ${formatPrice(item.price)}\n`;
		report += `      ผู้สั่ง: ${participantNames} (${item.participants.length} คน)\n`;
		report += `      ราคาต่อคน: ${formatPrice(pricePerPerson)}\n\n`;
	});

	// การตั้งค่า
	report += '⚙️ การตั้งค่าบิล:\n';
	report += `   VAT: ${settings.vatPercentage}%\n`;
	report += `   ค่าบริการ: ${settings.serviceChargePercentage}%\n`;
	if (settings.discount) {
		const discountParticipantNames = settings.discount.participants
			.map(id => participants.find(p => p.id === id)?.name)
			.filter(Boolean)
			.join(', ');

		if (settings.discount.type === 'percentage') {
			report += `   ส่วนลด: ${settings.discount.value}% สำหรับ ${discountParticipantNames}\n`;
		} else {
			report += `   ส่วนลด: ${formatPrice(settings.discount.value)} สำหรับ ${discountParticipantNames}\n`;
		}
	}
	report += '\n';

	// สรุปยอดแต่ละคน
	report += '💰 สรุปยอดเงินแต่ละคน:\n';
	billSummary.forEach((person, index) => {
		report += `   ${index + 1}. ${person.participantName}\n`;
		report += `      อาหาร: ${formatPrice(person.foodTotal)}\n`;
		report += `      ค่าบริการ: ${formatPrice(person.serviceCharge)}\n`;
		report += `      VAT: ${formatPrice(person.vat)}\n`;
		if (person.discountReceived > 0) {
			report += `      ส่วนลด: -${formatPrice(person.discountReceived)}\n`;
		}
		report += `      รวมที่ต้องจ่าย: ${formatPrice(person.grandTotal)}\n\n`;
	});

	// สรุปรวม
	report += '📊 สรุปยอดรวมทั้งหมด:\n';
	report += `   ยอดอาหาร: ${formatPrice(totalBill.subtotal)}\n`;
	report += `   ค่าบริการ: ${formatPrice(totalBill.serviceCharge)}\n`;
	report += `   VAT: ${formatPrice(totalBill.vat)}\n`;
	if (totalBill.totalDiscount > 0) {
		report += `   ส่วนลด: -${formatPrice(totalBill.totalDiscount)}\n`;
	}
	report += `   ยอดรวมสุทธิ: ${formatPrice(totalBill.grandTotal)}\n\n`;

	// Footer
	report += '=' .repeat(50) + '\n';
	report += '🍽️ สร้างโดยแอป "หารกัน" - แอปแบ่งค่าอาหารสำหรับกลุ่มเพื่อน\n';

	return report;
}

/**
 * ดาวน์โหลดรายงานเป็นไฟล์ .txt
 */
export function downloadReport(content: string, filename = 'han-gun-report.txt') {
	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * สร้าง CSV ข้อมูลการแบ่งค่าอาหาร
 */
export function generateCSVReport(
	participants: Participant[],
	menuItems: MenuItem[],
	settings: BillSettings
): string {
	const billSummary = calculateBillSummary(participants, menuItems, settings);

	let csv = 'ชื่อ,อาหาร,ค่าบริการ,VAT,ส่วนลด,รวมทั้งหมด\n';

	billSummary.forEach(person => {
		csv += `"${person.participantName}",`;
		csv += `${person.foodTotal},`;
		csv += `${person.serviceCharge},`;
		csv += `${person.vat},`;
		csv += `${person.discountReceived},`;
		csv += `${person.grandTotal}\n`;
	});

	return csv;
}

function formatPrice(price: number): string {
	return new Intl.NumberFormat('th-TH', {
		style: 'currency',
		currency: 'THB'
	}).format(price);
}
