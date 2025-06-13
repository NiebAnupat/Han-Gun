# หารกัน 🍽️

**Thai Bill Splitting Web App** - แอปพลิเคชันแบ่งค่าอาหารสำหรับกลุ่มเพื่อนในร้านอาหาร ที่ช่วยให้การคำนวณเงินแบ่งเป็นเรื่องง่ายและยุติธรรม

![Svelte](https://img.shields.io/badge/Svelte-5.0-FF3E00?style=for-the-badge&logo=svelte)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

## ✨ คุณสมบัติหลัก

### 👥 จัดการผู้เข้าร่วม
- เพิ่ม/ลบ/แก้ไขรายชื่อผู้เข้าร่วมได้อย่างง่ายดาย
- UI ที่เป็นมิตรกับผู้ใช้ด้วย shadcn-svelte components

### 🍽️ รายการอาหาร
- เพิ่มรายการอาหารพร้อมราคา
- เลือกว่าใครสั่งอาหารเมนูไหนบ้าง (checkbox/multi-select)
- แบ่งราคาเฉพาะคนที่สั่งเมนูนั้นๆ

### 💰 คำนวณค่าใช้จ่าย
- **VAT และค่าบริการ**: รองรับการคำนวณตามเปอร์เซ็นต์ (ตามมาตรฐานไทย)
- **ส่วนลดหลายรายการ**:
  - เพิ่มส่วนลดได้หลายรายการพร้อมตั้งชื่อแต่ละส่วนลด
  - รองรับส่วนลดแบบจำนวนเงินคงที่หรือเปอร์เซ็นต์
  - เลือกได้ว่าใครจะได้รับส่วนลดแต่ละรายการ
  - แบ่งส่วนลดเฉพาะคนที่เลือกเท่านั้น
  - รวมส่วนลดหลายรายการได้อย่างแม่นยำ
- การคำนวณที่แม่นยำและโปร่งใส

### 📊 ตารางสรุปยอด
- แสดงรายละเอียดค่าใช้จ่ายของแต่ละคน
- แบ่งแยกหมวดหมู่: อาหาร, ค่าบริการ, VAT, ส่วนลด, ยอดรวม
- UI ทั้งหมดเป็นภาษาไทย

### 📱 PromptPay Integration
- ใส่ข้อมูล PromptPay ของผู้จ่ายเงิน
- สร้าง QR Code PromptPay สำหรับแต่ละคน
- คัดลอกและแชร์ข้อมูลการชำระเงินได้ง่าย

### 📱 Responsive Design
- ใช้งานได้ดีทั้งบนมือถือและเดสก์ท็อป
- UI/UX ที่สวยงามด้วย TailwindCSS
- ไม่ต้องลงทะเบียน/เข้าสู่ระบบ

### 📂 ประวัติและการจัดการข้อมูล
- **บันทึกประวัติการแบ่งบิล**: เก็บประวัติบิลที่เสร็จแล้วพร้อมรายละเอียดครบถ้วน
- **ส่งออกข้อมูล**: ส่งออกข้อมูลทั้งหมดเป็น JSON หรือเฉพาะประวัติเป็น CSV/รายงาน
- **นำเข้าข้อมูล**: นำเข้าข้อมูลจากไฟล์ JSON พร้อมโหมดรวมหรือแทนที่
- **Migration อัตโนมัติ**: แปลงข้อมูลเก่าให้เข้ากับระบบใหม่อัตโนมัติ
- **Local Storage**: ข้อมูลจัดเก็บในเครื่องของคุณเท่านั้น ปลอดภัย 100%

## 🚀 เริ่มต้นใช้งาน

### ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ด้วย Bun (แนะนำ)
bun install

# หรือใช้ npm
npm install
```

### เริ่มต้น Development Server

```bash
# ด้วย Bun
bun run dev

# หรือ npm
npm run dev

# เปิดในเบราว์เซอร์อัตโนมัติ
bun run dev -- --open
```

### Build สำหรับ Production

```bash
# Build
bun run build

# Preview production build
bun run preview
```

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend Framework**: [SvelteKit 5](https://kit.svelte.dev/) - Modern, reactive framework
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/) - Beautiful, accessible components
- **Icons**: [Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte) - Beautiful & consistent icons
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Package Manager**: [Bun](https://bun.sh/) - Fast package manager and runtime
- **QR Code**: [PromptPay QR](https://github.com/dtinth/promptpay-qr) - Thai PromptPay QR generation

## 📁 โครงสร้างโปรเจค

```
src/
├── lib/
│   ├── components/           # Svelte components
│   │   ├── ParticipantsList.svelte
│   │   ├── MenuItems.svelte
│   │   ├── BillSettings.svelte    # รองรับส่วนลดหลายรายการ
│   │   ├── BillSummary.svelte
│   │   ├── PromptPayQR.svelte
│   │   ├── History.svelte         # ประวัติการแบ่งบิล
│   │   ├── ExportImport.svelte    # ส่งออก/นำเข้าข้อมูล
│   │   ├── QuickSummary.svelte
│   │   └── ui/              # shadcn-svelte components
│   ├── bill-calculator.ts   # Logic การคำนวณบิล (รองรับส่วนลดหลายรายการ)
│   ├── export.ts           # ระบบส่งออกข้อมูล CSV/รายงาน
│   ├── types.ts            # Type definitions
│   ├── stores.ts           # Svelte stores
│   └── localStorage.ts     # Local storage utilities + migration
└── routes/
    └── +page.svelte        # หน้าหลัก
```

## 🎯 วิธีใช้งาน

1. **เพิ่มผู้เข้าร่วม**: กรอกชื่อและเพิ่มเข้าไปในรายการ
2. **เพิ่มรายการอาหาร**: ใส่ชื่อเมนูและราคา แล้วเลือกว่าใครสั่ง
3. **ตั้งค่าบิล**:
   - กำหนด VAT และค่าบริการ
   - เพิ่มส่วนลดหลายรายการได้ (ถ้ามี) พร้อมตั้งชื่อและเลือกผู้รับ
4. **ดูผลลัพธ์**: ตรวจสอบว่าแต่ละคนต้องจ่ายเท่าไหร่ พร้อมรายละเอียดครบถ้วน
5. **บันทึกประวัติ**: บันทึกบิลที่เสร็จแล้วเพื่อดูย้อนหลัง
6. **สร้าง QR Code**: ใส่ข้อมูล PromptPay และสร้าง QR สำหรับการโอนเงิน
7. **ส่งออก/นำเข้า**: สำรองข้อมูลหรือแชร์ข้อมูลระหว่างอุปกรณ์

## 🔧 คุณสมบัติเพิ่มเติม

- **💾 Local Storage**: บันทึกข้อมูลในเครื่องอัตโนมัติ พร้อม migration ข้อมูลเก่า
- **📊 ประวัติการแบ่งบิล**: เก็บประวัติบิลที่เสร็จแล้วพร้อมค้นหาและดูรายละเอียด
- **📁 Export/Import**:
  - ส่งออกข้อมูลเป็น JSON (ทั้งหมด) หรือ CSV (เฉพาะประวัติ)
  - นำเข้าข้อมูลจากไฟล์ JSON พร้อมโหมดรวมหรือแทนที่
  - สร้างรายงานแบบละเอียดสำหรับการวิเคราะห์
- **⌨️ Keyboard Shortcuts**: Ctrl+R สำหรับรีเซ็ตข้อมูล
- **📱 PWA Ready**: สามารถติดตั้งเป็นแอปบนมือถือได้
- **🌙 Responsive**: ใช้งานได้ดีทุกขนาดหน้าจอ
- **🔢 คำนวณแม่นยำ**: รองรับส่วนลดหลายรายการและการคำนวณที่ซับซ้อน
- **🛡️ ปลอดภัย**: ข้อมูลเก็บในเครื่องของคุณเท่านั้น ไม่ส่งไปเซิร์ฟเวอร์

## 🤝 การมีส่วนร่วม

หากต้องการปรับปรุงหรือเพิ่มคุณสมบัติ สามารถ:

1. Fork repository นี้
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. สร้าง Pull Request

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

## 🔄 Update History

### v2.0.0 (Latest)
- ✨ **ส่วนลดหลายรายการ**: เพิ่มส่วนลดได้หลายรายการพร้อมตั้งชื่อและเลือกผู้รับ
- 📊 **ระบบประวัติ**: บันทึกและดูประวัติการแบ่งบิลย้อนหลัง
- 📁 **Export/Import**: ส่งออก/นำเข้าข้อมูลเป็น JSON, CSV และรายงานข้อความ
- 🔄 **Auto Migration**: แปลงข้อมูลเก่าให้เข้ากับระบบใหม่อัตโนมัติ
- 🎨 **UI/UX ปรับปรุง**: ปรับปรุงการแสดงผลและการใช้งานให้ดีขึ้น
- 🐛 **Bug Fixes**: แก้ไขไอคอนและปัญหาต่างๆ

### v1.0.0
- 🎉 เปิดตัวครั้งแรก
- 👥 จัดการผู้เข้าร่วมและรายการอาหาร
- 💰 คำนวณค่าใช้จ่ายพื้นฐาน
- 📱 PromptPay QR Code

---

**สร้างด้วยความรักสำหรับการแบ่งค่าอาหารที่ง่ายและยุติธรรม** 🇹🇭
