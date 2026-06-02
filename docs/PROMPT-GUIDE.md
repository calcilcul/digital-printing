# 🤖 Panduan Prompt AI Assistant
# Jaya Mandiri Digital Printing — Mobile App

> Dokumen ini menjelaskan cara berkomunikasi dengan AI Assistant agar hasilnya selalu sesuai PRD,
> dan bagaimana setiap sesi kerja dicatat secara otomatis.

---

## 📁 Struktur Folder `docs/`

```
docs/
├── baca.md                          # Instruksi awal project
├── PRD-Jaya-Mandiri-Digital-Printing.md  # 📋 PRD Utama (v2.0.0)
├── GAP-ANALYSIS.md                  # 📊 Status kode vs PRD
├── PROMPT-GUIDE.md                  # 📖 Dokumen ini
└── sessions/                        # 📝 Log semua sesi kerja
    ├── 2026-05-28_session-001.md
    ├── 2026-05-28_session-002.md
    └── ...
```

---

## 🎯 Template Prompt Standar

Gunakan template berikut setiap kali mau minta sesuatu ke AI:

### Template 1: Membuat Fitur Baru
```
TASK: Buat [nama screen/komponen/fitur]
PRD REF: [F-XXX-XX dari PRD]
TARGET FILE: [path file yang akan dibuat/diubah]
API: [endpoint yang digunakan]
ROLE: [customer/staff/manager]
CATATAN: [instruksi tambahan jika ada]
```

**Contoh nyata:**
```
TASK: Buat screen User Management untuk Manager
PRD REF: F-AUTH-06
TARGET FILE: mobile/src/screens/manager/UserManagementScreen.tsx
API: GET /api/admin/users | PUT /api/admin/users/:id/status
ROLE: manager/owner
CATATAN: Tampilkan daftar user, bisa toggle aktif/nonaktif
```

---

### Template 2: Memperbaiki Bug
```
BUG: [deskripsi masalah]
FILE: [file yang bermasalah]
GEJALA: [apa yang terjadi]
EKSPEKTASI: [apa yang seharusnya terjadi]
PRD REF: [F-XXX-XX jika relevan]
```

**Contoh nyata:**
```
BUG: Upload desain gagal di Android
FILE: mobile/src/screens/customer/UploadDesignScreen.tsx
GEJALA: Error "Network Error" saat upload file
EKSPEKTASI: File ter-upload ke backend dan hasil AI muncul
PRD REF: F-DESIGN-01
```

---

### Template 3: Update Fitur yang Ada
```
UPDATE: [nama fitur yang mau diupdate]
FILE: [file yang akan diubah]
PERUBAHAN: [apa yang mau diubah]
PRD REF: [F-XXX-XX]
JANGAN UBAH: [bagian yang tidak boleh disentuh]
```

---

### Template 4: Sinkronisasi PRD
```
SYNC PRD: Update PRD section [nomor section]
PERUBAHAN: [apa yang berubah di kode]
FILE YANG BERUBAH: [daftar file]
VERSI PRD BARU: [v2.x.x]
```

---

## 🔄 Cara Agar PRD Selalu Update

Setiap kali ada fitur baru selesai, minta AI untuk:

```
UPDATE DOCS:
1. Update GAP-ANALYSIS.md → ubah status [fitur] dari ❌/🔄 menjadi ✅
2. Update PRD → tambahkan ke changelog (Section 20)
3. Buat session log baru di docs/sessions/
```

---

## 📝 Format Session Log Otomatis

Setiap sesi kerja dicatat di `docs/sessions/YYYY-MM-DD_session-XXX.md`

### Format Isi Session Log:
```markdown
# Session Log — [Tanggal] — Session [Nomor]

## 📥 Prompt Input
[Prompt yang kamu tulis]

## 🎯 Task yang Dikerjakan
- [ ] Task 1
- [ ] Task 2

## 📁 File yang Diubah/Dibuat
| File | Aksi | Deskripsi |
|------|------|-----------|
| path/file.tsx | CREATE | Screen baru |
| path/store.ts | MODIFY | Tambah action |

## ✅ Output / Hasil
[Deskripsi apa yang berhasil dibuat]

## 🔗 PRD Ref yang Tercakup
- F-AUTH-06: User Management ✅

## 📊 Update Gap Analysis
| Fitur | Sebelum | Sesudah |
|-------|---------|---------|
| User Management Screen | ❌ | ✅ |

## ⚠️ Catatan / Masalah
[Jika ada masalah atau hal yang perlu diperhatikan]

## 🔜 Next Steps
[Apa yang perlu dilakukan selanjutnya]
```

---

## 💡 Contoh Prompt Lengkap yang Baik

### Contoh 1 — Terbaik ✅
```
TASK: Buat UserManagementScreen untuk role manager
PRD REF: F-AUTH-06
TARGET FILE: mobile/src/screens/manager/UserManagementScreen.tsx
API: GET /api/admin/users | PUT /api/admin/users/:id/status
ROLE: manager/owner

Tampilkan:
- Daftar semua user (nama, email, role, status aktif/nonaktif)
- Toggle untuk aktifkan/nonaktifkan user
- Badge warna untuk role (customer=biru, staff=oranye, owner=merah)

Setelah selesai:
1. Daftarkan screen ini di ManagerNavigator.tsx
2. Update GAP-ANALYSIS.md → ubah status ke ✅
3. Catat di docs/sessions/
```

### Contoh 2 — Dashboard Manager
```
TASK: Upgrade ManagerDashboardScreen agar lebih lengkap
PRD REF: F-REPORT-01, F-REPORT-02
FILE: mobile/src/screens/manager/ManagerDashboardScreen.tsx

Tambahkan:
- Card total revenue hari ini, minggu ini, bulan ini
- List top 3 produk terlaris
- Jumlah pesanan per status (waiting, printing, ready, completed)

API yang sudah tersedia:
- GET /api/admin/reports/revenue
- GET /api/admin/reports/products
- GET /api/admin/orders

Setelah selesai update GAP-ANALYSIS.md
```

### Contoh 3 — Minta analisis
```
Cek apakah implementasi StaffOrderVerificationScreen sudah sesuai PRD F-DESIGN-03 dan F-PAY-02.
Jika ada yang tidak sesuai, list dulu sebelum mengubah kode.
```

---

## ⚡ Prompt Singkat yang Bisa Langsung Digunakan

Copy-paste prompt ini sesuai kebutuhanmu:

### 🔴 High Priority (dari GAP-ANALYSIS)

**Buat User Management Screen:**
```
Buat UserManagementScreen untuk manager. PRD: F-AUTH-06.
API: GET /api/admin/users dan PUT /api/admin/users/:id/status.
Tampilkan list user dengan toggle aktif/nonaktif.
Daftarkan di ManagerNavigator. Update GAP-ANALYSIS.md setelah selesai.
```

**Buat Audit Log Screen:**
```
Buat AuditLogScreen untuk manager. PRD: F-REPORT-03.
API: GET /api/admin/logs/audit.
Tampilkan list log dengan filter user dan tanggal.
Daftarkan di ManagerNavigator. Update GAP-ANALYSIS.md.
```

**Buat Login Log Screen:**
```
Buat LoginLogScreen untuk manager. PRD: F-REPORT-04.
API: GET /api/admin/logs/login.
Tampilkan riwayat login/logout semua user.
Update GAP-ANALYSIS.md setelah selesai.
```

### 🟡 Medium Priority

**Upgrade Product Management:**
```
Lengkapi ProductManagementScreen dengan fitur Add/Edit/Delete produk.
PRD: F-PROD-03. API: POST/PUT/DELETE /api/admin/products.
Update GAP-ANALYSIS.md setelah selesai.
```

**Upgrade Manager Dashboard:**
```
Upgrade ManagerDashboardScreen dengan chart revenue dan filter periode (hari/minggu/bulan).
PRD: F-REPORT-01, F-REPORT-02.
Update GAP-ANALYSIS.md setelah selesai.
```

---

## 📊 Shortcut: Cek Status Saat Ini

Untuk melihat kondisi terkini project, ketik:
```
Tampilkan status gap analysis terbaru antara kode dan PRD.
```

Untuk minta AI update semua dokumen setelah kerja:
```
Update semua docs: GAP-ANALYSIS.md, PRD changelog, dan buat session log baru untuk sesi ini.
```

---

## 🔁 Workflow yang Direkomendasikan

```
1. Buka PROMPT-GUIDE.md → pilih template
2. Tulis prompt sesuai template
3. AI mengerjakan task
4. Minta AI: "Update docs setelah ini"
5. AI update GAP-ANALYSIS.md + buat session log
6. PRD changelog juga diperbarui
```

---

*Dokumen ini dibuat oleh AI Assistant pada 28 Mei 2026.*
*Selalu gunakan template di atas agar hasil kerja terdokumentasi dengan baik.*
