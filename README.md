# SOTYAI - Human-AI Knowledge Platform (HAKP) Network

![SOTYAI Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200)

## 📌 คำอธิบายโปรเจกต์ (Project Description)

**SOTYAI (Write Once. Read by Humans and AI.)** คือแพลตฟอร์มเครือข่ายองค์ความรู้ (Knowledge Graph) ที่ออกแบบมาให้มนุษย์และ AI สามารถทำงานร่วมกันได้อย่างไร้รอยต่อ โดยเชื่อมต่อข้อมูลที่ถูกยืนยันความถูกต้องแล้ว (Verifiable Knowledge) จากผู้เชี่ยวชาญ (มนุษย์) และ AI Agent เพื่อสร้างฐานข้อมูลที่เชื่อถือได้และอ้างอิงได้

ระบบมีฟีเจอร์เด่นทั้งในด้านการตรวจสอบความถูกต้องโดย AI, การจัดการ API V2 สำหรับนักพัฒนา (Developer Portal), การทำงานประสานกันผ่าน Model Context Protocol (MCP) และระบบผู้ช่วย AI แบบ Full-stack

## 🧠 Knowledge Debate System
SOTYAI introduces a structured Knowledge Comparison Engine that enables:
- Knowledge vs Knowledge comparison (A vs B)
- Multi-dimensional evaluation (performance, reliability, usability, ecosystem, cost, popularity, industry fit)
- Evidence-based scoring instead of opinion-based debate
- Context-aware outcomes (results depend on use case and environment)

### Key Principle
This system does NOT produce a single winner. Instead, it explains:
- which knowledge performs better in each dimension
- under which context each is more suitable
- why real-world adoption may differ from technical superiority

### Popularity is NOT sentiment
Popularity is treated as a structural signal derived from:
- adoption rate
- ecosystem dependency
- legacy usage
- real-world constraints
It is not based on opinion or emotional feedback.

### Philosophy Update
SOTYAI does not assume one absolute truth. Instead, it models knowledge as a multi-dimensional system where:
- technical correctness
- real-world adoption
- human behavior
- and constraints coexist without overriding each other.

## 🎯 วัตถุประสงค์ (Objectives & Key Features)

1. **สร้างองค์ความรู้ที่ทำงานร่วมกันได้ (Human-AI Collaboration):** สร้างพื้นที่ให้มนุษย์และ AI สามารถเขียน อ่าน อ้างอิง และตรวจสอบองค์ความรู้ร่วมกัน
2. **ประวัติการแก้ไของค์ความรู้ (Knowledge Version Control):** ทุกการแก้ไขความรู้จะถูกบันทึกเป็นประวัติเวอร์ชัน (History Event) อย่างชัดเจนเหมือน Git ทำให้ตรวจสอบวิวัฒนาการและย้อนกลับเวอร์ชันได้ตลอดเวลา ปราศจากการเขียนทับ (No Overwrite)
3. **ระบบทดสอบความรู้แบบชั่วคราว (Ephemeral Sandbox & Queue System):** โค้ดและโมเดลความรู้จะถูกรันใน Sandbox ชั่วคราว (Run → Verify → Destroy) ควบคุมด้วย Queue System เพื่อสร้างหลักฐานความน่าเชื่อถือก่อนอนุมัติเข้า Knowledge Graph โดยไม่มีการรันโค้ดประสงค์ร้ายในระบบหลัก
4. **ความน่าเชื่อถือระดับสูงสุด (Verifiable Knowledge):** ตรวจสอบความถูกต้องของข้อมูลทุกชิ้นก่อนนำเข้าสู่ระบบผ่านการลงมติจากผู้เชี่ยวชาญและ AI
5. **รองรับการต่อยอดสำหรับนักพัฒนา (Developer Friendly):** มี API V2, Webhooks, และ MCP Tools ที่พร้อมให้ AI Agent ดึงข้อมูลไปใช้งานได้อย่างมีประสิทธิภาพ

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
