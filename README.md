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
- **ส่วนลดทั่วทั้งบิล**:
  - รองรับส่วนลดแบบจำนวนเงินคงที่หรือเปอร์เซ็นต์
  - เลือกได้ว่าใครจะได้รับส่วนลด
  - แบ่งส่วนลดเฉพาะคนที่เลือกเท่านั้น
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
│   │   ├── BillSettings.svelte
│   │   ├── BillSummary.svelte
│   │   ├── PromptPayQR.svelte
│   │   └── ui/              # shadcn-svelte components
│   ├── bill-calculator.ts   # Logic การคำนวณบิล
│   ├── types.ts            # Type definitions
│   ├── stores.ts           # Svelte stores
│   └── localStorage.ts     # Local storage utilities
└── routes/
    └── +page.svelte        # หน้าหลัก
```

## 🎯 วิธีใช้งาน

1. **เพิ่มผู้เข้าร่วม**: กรอกชื่อและเพิ่มเข้าไปในรายการ
2. **เพิ่มรายการอาหาร**: ใส่ชื่อเมนูและราคา แล้วเลือกว่าใครสั่ง
3. **ตั้งค่าบิล**: กำหนด VAT, ค่าบริการ, และส่วนลด (ถ้ามี)
4. **ดูผลลัพธ์**: ตรวจสอบว่าแต่ละคนต้องจ่ายเท่าไหร่
5. **สร้าง QR Code**: ใส่ข้อมูล PromptPay และสร้าง QR สำหรับการโอนเงิน

## 🔧 คุณสมบัติเพิ่มเติม

- **💾 Local Storage**: บันทึกข้อมูลในเครื่องอัตโนมัติ
- **⌨️ Keyboard Shortcuts**: Ctrl+R สำหรับรีเซ็ตข้อมูล
- **📱 PWA Ready**: สามารถติดตั้งเป็นแอปบนมือถือได้
- **🌙 Responsive**: ใช้งานได้ดีทุกขนาดหน้าจอ

## 🤝 การมีส่วนร่วม

หากต้องการปรับปรุงหรือเพิ่มคุณสมบัติ สามารถ:

1. Fork repository นี้
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. สร้าง Pull Request

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

---

**สร้างด้วยความรักสำหรับการแบ่งค่าอาหารที่ง่ายและยุติธรรม** 🇹🇭
