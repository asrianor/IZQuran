# IZQuran 📖

**IZQuran** adalah aplikasi antarmuka pembelajaran interaktif berbasis web yang didesain secara khusus untuk memfasilitasi hafalan Al-Quran. Aplikasi ini menggunakan metode tebakan berulang dari potongan-potongan awal suatu ayat maupun dari nomor urutan ayat.

Aplikasi ini menggunakan teknologi HTML, CSS Vanilla, dan JavaScript (Client-side) tanpa framework untuk memberikan performa yang cepat dan antarmuka *Glassmorphism* yang modern.

👉 **[Akses Aplikasi IZQuran di Sini](https://asrianor.github.io/IZQuran)**

---

## 🎯 Fitur Utama

- **Mode Persiapan:** Mode untuk membaca dan mereview hafalan surah secara utuh. Memiliki variasi layout untuk mempermudah pemetaan visual memori (Layout Daftar Biasa, Kotak Per-X Ayat, Split Kiri-Kanan, Fokus Ayat Tengah, dan 4 Kuadran). Terdapat tombol "Tampilkan Penuh/Sembunyikan".
- **Mode Potongan Awal:** Bermain dan melatih ingatan dengan menebak kelanjutan ayat hanya berdasarkan satu lafazh (kata) pertama. 
- **Mode Angka Dulu:** Melatih *Random Access Memory* hafalan dengan hanya dimunculkan nomor urutan ayat, lalu awalan, baru ayat penuh.
- **Filter Rentang Ayat:** Ingin fokus ke beberapa ayat saja? (Misal ayat 1-5 atau ayat 11-20). Pengguna dapat memfilter dataset hafalan sesuai kebutuhan.
- **Opsi Pengurutan:** Pilihan melatih hafalan secara Sekuensial (Urut), Acak (Random), atau *Reversed* (Urut Mundur).
- **Audio Murottal Terintegrasi:** Memutar langsung audio qari (secara *default* Yasser Al-Dosari) di tiap baris hafalan.

---

## ⚙️ Cara Penggunaan Lokal
Aplikasi ini *stand-alone* murni berjalan di sisi klien (browser). Tidak perlu di *build* ataupun membutuhkan database server (MySQL/PHP).
1. Clone repositori ini: `git clone https://github.com/asrianor/IZQuran.git`
2. Buka folder proyek.
3. Klik dua kali file `index.html` menggunakan browser modern apa pun (Chrome, Edge, Firefox, Safari).

---

## ⚠️ Disclaimer & Kredit API

* IZQuran adalah aplikasi antarmuka independen dan **TIDAK MEMILIKI KERJASAMA LANGSUNG, AFILIASI, ATAU IZIN RESMI** dari pengelola **EQuran.id**.
* Aplikasi ini hanya memanfaatkan layanan Endpoint API Terbuka dari `equran.id/api/v2` untuk mengambil metadata pembelajaran (Teks Arab Al-Quran, Terjemahan, dan Audio mp3) secara langsung (berjalan di *client-side*).
* Seluruh hak cipta terjemahan, konten intelektual Al-Quran terjemahan dari Kemenag, dan Audio Murottal sepenuhnya adalah hak milik dari penyedia data atau pihak ketiga asal (EQuran.id para Qari).

*(Untuk Kebijakan Privasi dan Aturan ToS API selengkapnya dari penyedia data, silakan klik menu Dokumentasi di dalam aplikasi).*