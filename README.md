# Daily Task Log — Full Version

แอปจัดการงานรายวันแบบ Production-ready ด้วย **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Firebase** (Auth + Firestore) พร้อมฟีเจอร์ Engagement, Growth และ Quality-of-Life ครบชุด

---

## Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + Dark mode (`dark:`) |
| Auth & DB | Firebase Auth, Cloud Firestore (real-time) |
| UI | SweetAlert2, Font Awesome, Recharts |
| PWA | Web App Manifest + Service Worker (`public/sw.js`) |

---

## Deploy ที่ไหน

### แนะนำ: Frontend บน Vercel + Backend บน Firebase

| ส่วน | แพลตฟอร์ม | หมายเหตุ |
|------|-----------|----------|
| **Next.js App** | [Vercel](https://vercel.com) | เชื่อม GitHub repo → Import โปรเจกต์ → ใส่ Environment Variables จาก `.env.local` |
| **Auth + Firestore** | [Firebase Console](https://console.firebase.google.com/) | เปิด Email/Password, สร้าง Firestore |
| **Security Rules** | Firebase CLI | `npm run firebase:deploy` |

**ขั้นตอน Deploy (Vercel)**

1. Push โค้ดขึ้น GitHub  
2. Vercel → New Project → เลือก repo `daily-task-log`  
3. ตั้งค่า Environment Variables (ทุกตัวที่ขึ้นต้น `NEXT_PUBLIC_FIREBASE_`)  
4. Deploy — ได้ URL เช่น `https://daily-task-log.vercel.app`  
5. Firebase Console → Authentication → Authorized domains → เพิ่มโดเมน Vercel  

**ทางเลือกอื่น:** Netlify, Cloudflare Pages, Firebase Hosting (static export ไม่เหมาะกับ App Router แบบเต็ม — ใช้ Vercel ง่ายกว่า)

### โปรเจกต์ Firebase ปัจจุบัน

- Project ID: `dailytasknet-40e9d` (ดูใน `.firebaserc`)

---

## การใช้ AI ในโปรเจกต์นี้

| ขั้นตอน | เครื่องมือ | บทบาท |
|---------|-----------|--------|
| **แรกเริ่ม** | **Google Gemini** | ช่วยเขียน prompt / สเปกฟีเจอร์ให้ละเอียด เพื่อส่งให้ Cursor สร้างโปรเจกต์ฐาน (Auth, Task, Theme, CSV) |
| **พัฒนา & ขยาย** | **Cursor (AI Agent)** | สร้างและขยายโค้ดทั้งหมดใน repo — รวม Add-on ชุด Engagement, Growth, QoL |
| **รันไทม์** | ไม่มี | แอปไม่เรียก Gemini/OpenAI ตอนผู้ใช้ใช้งาน — เป็น Client → Firebase โดยตรง |

สรุป: **Gemini = ออกแบบ prompt/สเปกเบื้องต้น · Cursor = เขียนโค้ดจริง · Firebase = ข้อมูลและ Auth**

---

## ฟีเจอร์ทั้งหมด

### Engagement
- สตรีครายวัน (streak) + สถิติ DONE รายสัปดาห์  
- กราฟ Bar Chart 7 วัน (Recharts)  
- เทมเพลตงานซ้ำ (บันทึก/ใช้ template)  
- โหมดโฟกัส Pomodoro 25 นาที + บันทึกนาทีสะสมลง task  
- แจ้งเตือน Browser ก่อน deadline 15 นาที  

### Growth
- โปรไฟล์ + Avatar URL  
- อันดับสัปดาห์ (opt-in)  
- สีธีม accent 5 แบบ + สติกเกอร์สถานะ  
- ลิงก์เชิญ `/login?invite=CODE`  
- หน้า Landing + Demo (ไม่ต้อง login)  

### Quality of Life
- ค้นหา + เรียง (ชื่อ, deadline, priority, วันที่สร้าง)  
- งานย่อย (subtasks) + แท็ก + ความสำคัญ  
- ประวัติการแก้ไข (subcollection `history`)  
- Soft delete + ถังขยะ + ลบถาวร  
- PWA (ติดตั้งบนหน้าจอโฮม)  
- ภาษาไทย / English  

---

## เริ่มต้นในเครื่อง

```bash
cd daily-task-log
npm install
copy .env.local.example .env.local
# กรอกค่า Firebase
npm run dev
```

- แอป: http://localhost:3000  
- Landing: http://localhost:3000/landing  
- Login: http://localhost:3000/login  

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase

1. Authentication → Email/Password  
2. Firestore Database  
3. Deploy rules & indexes:

```bash
npm run firebase:login
npm run firebase:deploy
```

Index ที่ต้องมี (ถ้า Console แจ้ง):
- `tasks`: `userId` + `createdAt`  
- `tasks`: `userId` + `isDeleted` + `deletedAt`  
- `users`: `leaderboardOptIn` + `weekDoneCount`  

---

## โครงสร้างโปรเจกต์

```
src/
  app/
    page.tsx          # Dashboard
    landing/          # หน้าโปรโมท + Demo
    login/
    focus/            # Pomodoro
    trash/
    profile/
    manifest.ts       # PWA
  components/
    dashboard/
    layout/
    tasks/
  config/firebase.ts
  context/            # Theme, Locale
  hooks/
  i18n/
  lib/
  types/
firestore.rules
firestore.indexes.json
public/sw.js
```

---

## Firestore Schema (ย่อ)

**users/{uid}** — โปรไฟล์, streak, leaderboard, inviteCode  

**tasks/{id}** — งาน (+ tags, subtasks, sticker, pomodoroMinutes, isDeleted)  

**tasks/{id}/history/{hid}** — ประวัติแก้ไข  

**taskTemplates/{id}** — เทมเพลตงาน  

---

## สคริปต์

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | พัฒนาในเครื่อง |
| `npm run build` | Build production |
| `npm run start` | รันหลัง build |
| `npm run firebase:deploy` | Deploy Firestore rules + indexes |

---

## License

Private / การเรียนรู้ — ปรับใช้ตามต้องการ
