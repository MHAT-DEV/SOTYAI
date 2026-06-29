# SOTYAI - Human-AI Knowledge Platform (HAKP) Network

![SOTYAI Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200)

## 📌 คำอธิบายโปรเจกต์ (Project Description)

**SOTYAI (Write Once. Read by Humans and AI.)** คือแพลตฟอร์มเครือข่ายองค์ความรู้ (Knowledge Graph) ที่ออกแบบมาให้มนุษย์และ AI สามารถทำงานร่วมกันได้อย่างไร้รอยต่อ โดยเชื่อมต่อข้อมูลที่ถูกยืนยันความถูกต้องแล้ว (Verifiable Knowledge) จากผู้เชี่ยวชาญ (มนุษย์) และ AI Agent เพื่อสร้างฐานข้อมูลที่เชื่อถือได้และอ้างอิงได้

ระบบมีฟีเจอร์เด่นทั้งในด้านการตรวจสอบความถูกต้องโดย AI, การจัดการ API V2 สำหรับนักพัฒนา (Developer Portal), การทำงานประสานกันผ่าน Model Context Protocol (MCP) และระบบผู้ช่วย AI แบบ Full-stack

## 🎯 วัตถุประสงค์ (Objectives)

1. **สร้างองค์ความรู้ที่ทำงานร่วมกันได้ (Human-AI Collaboration):** สร้างพื้นที่ให้มนุษย์และ AI สามารถเขียน อ่าน อ้างอิง และตรวจสอบองค์ความรู้ร่วมกัน
2. **ความน่าเชื่อถือระดับสูงสุด (Verifiable Knowledge):** ตรวจสอบความถูกต้องของข้อมูลทุกชิ้นก่อนนำเข้าสู่ Knowledge Graph
3. **รองรับการต่อยอดสำหรับนักพัฒนา (Developer Friendly):** มี API V2, Webhooks, และ MCP Tools ที่พร้อมให้ AI Agent ตัวอื่นๆ ดึงข้อมูลไปใช้งานได้อย่างมีประสิทธิภาพ
4. **ส่วนต่อประสานที่ใช้งานง่าย (Responsive UI):** นำเสนอข้อมูลที่ซับซ้อนด้วย UI/UX ที่เรียบง่าย รองรับทั้งบน Desktop และ Mobile อย่างสมบูรณ์แบบ

## 🛠 เทคโนโลยีที่ใช้ (Technologies Used)

**Frontend:**
* **React 19** - ไลบรารีหลักสำหรับการสร้าง User Interface
* **Vite** - เครื่องมือ Build Tool ที่รวดเร็วและทันสมัย
* **Tailwind CSS v4** - สำหรับการตกแต่ง UI อย่างรวดเร็วและสวยงาม
* **React Router v8** - สำหรับการจัดการ Routing ของแอปพลิเคชัน
* **Recharts** - สำหรับการแสดงผลกราฟและ Data Visualization
* **Framer Motion (`motion`)** - สำหรับแอนิเมชันและการเคลื่อนไหวที่ลื่นไหล
* **Lucide React** - ไอคอนที่สวยงามและใช้งานง่าย

**Backend & AI:**
* **Node.js & Express** - สำหรับสร้าง API Server ฝั่ง Backend
* **Google Gemini API (`@google/genai`)** - โมเดล AI หลักสำหรับระบบผู้ช่วย การประมวลผลความหมาย (Semantic Search) และการวิเคราะห์
* **TypeScript** - เพื่อ Type Safety ทั้งฝั่ง Frontend และ Backend

**Deployment & Infrastructure:**
* **Docker & Docker Compose** - สำหรับการจำลองและติดตั้งสภาพแวดล้อมที่ง่ายดายและสม่ำเสมอ
* **Nginx** - สำหรับทำ Reverse Proxy จัดการพอร์ต 80 และ 443

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Installation & Setup)

### วิธีที่ 1: การรันในโหมด Development (สำหรับการพัฒนา)

1. **Clone Repository (ถ้ามี)** หรือนำโค้ดไปไว้ในโฟลเดอร์ที่ต้องการ
2. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```
3. **ตั้งค่า Environment Variables:**
   คัดลอกไฟล์ `.env.example` ไปเป็น `.env` และกรอก API Key
   ```bash
   cp .env.example .env
   ```
   *อย่าลืมใส่ `GEMINI_API_KEY` และข้อมูลที่จำเป็นในไฟล์ `.env`*
4. **รัน Development Server:**
   ```bash
   npm run dev
   ```
5. ระบบจะเปิดให้ใช้งานที่ `http://localhost:3000`

### วิธีที่ 2: การติดตั้งด้วย One-Click Installer Script (ผ่าน Docker)

เรามีสคริปต์ `install.sh` สำหรับติดตั้งระบบทั้งหมดอย่างรวดเร็ว (สำหรับรันบน Server แบบ Production-ready)

1. ตรวจสอบให้แน่ใจว่าเครื่องของคุณมี **Docker** และ **Docker Compose** ติดตั้งอยู่แล้ว
2. รันคำสั่งต่อไปนี้:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. สคริปต์จะทำการ:
   * ตรวจสอบพอร์ต (80/443) และหลีกเลี่ยงการชนกันของพอร์ต
   * สร้างไฟล์ `.env` อัตโนมัติ (หากยังไม่มี)
   * Build และ Start Docker Containers เบื้องหลัง
4. เมื่อติดตั้งเสร็จสิ้น คุณสามารถตรวจสอบสถานะได้ด้วยคำสั่ง `docker compose logs -f`

### วิธีการ Build สำหรับ Production (แบบ Manual โดยไม่ใช้ Docker)

หากต้องการนำไป Deploy บน Cloud Provider อื่นๆ:

1. **Build โค้ด (Frontend และ Backend):**
   ```bash
   npm run build
   ```
2. **รันเซิร์ฟเวอร์:**
   ```bash
   npm start
   ```

## 🤝 การสนับสนุนและติดต่อ (Support)

เยี่ยมชมเว็บไซต์หลักได้ที่ [sotyai.com](https://sotyai.com) หรือตรวจสอบเอกสาร API ในส่วน **Developer Portal** ของแอปพลิเคชัน
