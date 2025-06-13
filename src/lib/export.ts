// Export utilities สำหรับ "หารกัน"
import type { Participant, MenuItem, BillSettings, BillSummary, HistoryEntry } from './types.js';
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

	// แสดงรายละเอียดส่วนลดแต่ละรายการ
	if (settings.discounts.length > 0) {
		report += '   ส่วนลด:\n';
		settings.discounts.forEach(discount => {
			const discountParticipantNames = discount.participants
				.map(id => participants.find(p => p.id === id)?.name)
				.filter(Boolean)
				.join(', ');

			if (discount.type === 'percentage') {
				report += `     - "${discount.name}": ${discount.value}% สำหรับ ${discountParticipantNames}\n`;
			} else {
				report += `     - "${discount.name}": ${formatPrice(discount.value)} สำหรับ ${discountParticipantNames}\n`;
			}
		});
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

	// แสดงรายละเอียดส่วนลดแต่ละรายการ
	if (settings.discounts.length > 0) {
		settings.discounts.forEach(discount => {
			const discountText = discount.type === 'percentage'
				? `${discount.value}%`
				: formatPrice(discount.value);
			const discountAmount = discount.type === 'fixed'
				? discount.value
				: ((totalBill.subtotal + totalBill.serviceCharge + totalBill.vat) * discount.value) / 100;
			report += `   ส่วนลด "${discount.name}" (${discountText}): -${formatPrice(discountAmount)}\n`;
		});
	}

	if (totalBill.totalDiscount > 0) {
		report += `   ส่วนลดรวม: -${formatPrice(totalBill.totalDiscount)}\n`;
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

/**
 * ส่งออกประวัติการแบ่งบิลเป็นไฟล์ JSON
 */
export function exportHistory(history: HistoryEntry[]): void {
	const exportData = {
		version: '1.0',
		exportDate: new Date().toISOString(),
		appName: 'หารกัน',
		dataType: 'history',
		history: history
	};

	const jsonString = JSON.stringify(exportData, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `han-gun-history-${new Date().toISOString().split('T')[0]}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * นำเข้าประวัติการแบ่งบิลจากไฟล์ JSON
 */
export function importHistory(file: File): Promise<HistoryEntry[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const data = JSON.parse(content);

				// ตรวจสอบรูปแบบไฟล์
				if (!data.appName || data.appName !== 'หารกัน') {
					throw new Error('ไฟล์นี้ไม่ใช่ไฟล์ส่งออกจากแอป "หารกัน"');
				}

				if (!data.dataType || data.dataType !== 'history') {
					throw new Error('ไฟล์นี้ไม่ใช่ไฟล์ประวัติการแบ่งบิล');
				}

				if (!data.history || !Array.isArray(data.history)) {
					throw new Error('รูปแบบไฟล์ไม่ถูกต้อง: ไม่พบข้อมูลประวัติ');
				}

				// แปลง createdAt จาก string เป็น Date object
				const history: HistoryEntry[] = data.history.map((entry: any) => ({
					...entry,
					createdAt: new Date(entry.createdAt)
				}));

				// ตรวจสอบความถูกต้องของข้อมูลแต่ละรายการ
				for (const entry of history) {
					if (!entry.id || !entry.name || !entry.createdAt || !entry.participants || !entry.menuItems || !entry.billSettings || !entry.billSummary) {
						throw new Error('รูปแบบข้อมูลประวัติไม่ถูกต้อง');
					}
				}

				resolve(history);
			} catch (error) {
				reject(error instanceof Error ? error : new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
			}
		};

		reader.onerror = () => {
			reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
		};

		reader.readAsText(file, 'utf-8');
	});
}

/**
 * ส่งออกประวัติการแบ่งบิลเป็นไฟล์ CSV สำหรับดูใน Excel
 */
export function exportHistoryCSV(history: HistoryEntry[]): void {
	let csv = 'ชื่อบิล,วันที่,จำนวนคน,รายการอาหาร,ยอดรวม,VAT(%),ค่าบริการ(%),ส่วนลด\n';

	history.forEach(entry => {
		const discountText = entry.billSettings.discounts.length > 0
			? entry.billSettings.discounts.map(d =>
				`${d.name}(${d.type === 'percentage' ? `${d.value}%` : `${d.value} บาท`})`
			).join(', ')
			: 'ไม่มี';

		csv += `"${entry.name}",`;
		csv += `"${entry.createdAt.toLocaleDateString('th-TH')}",`;
		csv += `${entry.participants.length},`;
		csv += `${entry.menuItems.length},`;
		csv += `${entry.totalAmount},`;
		csv += `${entry.billSettings.vatPercentage}%,`;
		csv += `${entry.billSettings.serviceChargePercentage}%,`;
		csv += `"${discountText}"\n`;
	});

	const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `han-gun-history-summary-${new Date().toISOString().split('T')[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * สร้างรายงานประวัติแบบละเอียดเป็น text
 */
export function generateHistoryReport(history: HistoryEntry[]): string {
	const date = new Date().toLocaleString('th-TH');
	let report = '';

	// Header
	report += '📱 รายงานประวัติการแบ่งค่าอาหาร "หารกัน"\n';
	report += `🕐 สร้างเมื่อ: ${date}\n`;
	report += `📊 จำนวนประวัติทั้งหมด: ${history.length} รายการ\n`;
	report += '=' .repeat(60) + '\n\n';

	if (history.length === 0) {
		report += 'ยังไม่มีประวัติการแบ่งบิล\n';
		return report;
	}

	// สถิติรวม
	const totalAmount = history.reduce((sum, entry) => sum + entry.totalAmount, 0);
	const totalParticipants = history.reduce((sum, entry) => sum + entry.participants.length, 0);
	const totalMenuItems = history.reduce((sum, entry) => sum + entry.menuItems.length, 0);
	const avgAmount = totalAmount / history.length;
	const avgParticipants = totalParticipants / history.length;

	report += '📈 สถิติรวม:\n';
	report += `   ยอดรวมทั้งหมด: ${formatPrice(totalAmount)}\n`;
	report += `   ค่าเฉลี่ยต่อบิล: ${formatPrice(avgAmount)}\n`;
	report += `   จำนวนคนเฉลี่ย: ${avgParticipants.toFixed(1)} คน/บิล\n`;
	report += `   รายการอาหารรวม: ${totalMenuItems} รายการ\n\n`;

	// รายละเอียดแต่ละบิล
	report += '📋 รายละเอียดแต่ละบิล:\n';
	report += '=' .repeat(60) + '\n';

	history.forEach((entry, index) => {
		report += `\n${index + 1}. ${entry.name}\n`;
		report += `   📅 วันที่: ${entry.createdAt.toLocaleString('th-TH')}\n`;
		report += `   👥 ผู้เข้าร่วม: ${entry.participants.length} คน (${entry.participants.map(p => p.name).join(', ')})\n`;
		report += `   🍽️ รายการอาหาร: ${entry.menuItems.length} รายการ\n`;
		report += `   💰 ยอดรวม: ${formatPrice(entry.totalAmount)}\n`;		report += `   ⚙️ การตั้งค่า: VAT ${entry.billSettings.vatPercentage}%, ค่าบริการ ${entry.billSettings.serviceChargePercentage}%\n`;

		if (entry.billSettings.discounts.length > 0) {
			const discountsText = entry.billSettings.discounts.map(discount => {
				const discountValue = discount.type === 'percentage'
					? `${discount.value}%`
					: formatPrice(discount.value);
				return `"${discount.name}" (${discountValue})`;
			}).join(', ');
			report += `   🎁 ส่วนลด: ${discountsText}\n`;
		}

		// สรุปการจ่ายแต่ละคน
		report += '   💳 การจ่ายเงิน:\n';
		entry.billSummary.forEach(person => {
			if (person.grandTotal > 0) {
				report += `      - ${person.participantName}: ${formatPrice(person.grandTotal)}\n`;
			}
		});

		report += '\n' + '-'.repeat(50) + '\n';
	});

	// Footer
	report += '\n' + '=' .repeat(60) + '\n';
	report += '🍽️ สร้างโดยแอป "หารกัน" - แอปแบ่งค่าอาหารสำหรับกลุ่มเพื่อน\n';

	return report;
}
