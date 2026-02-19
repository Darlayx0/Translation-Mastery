# Pelatih Terjemahan AI

Aplikasi web modern dan responsif untuk berlatih menerjemahkan Bahasa Inggris ke Bahasa Indonesia, didukung oleh Model AI `openai/gpt-oss-120b` melalui Groq.

## Fitur

- **Generator Soal AI**: Secara otomatis menghasilkan kalimat Bahasa Inggris acak untuk latihan.
- **Umpan Balik AI Instan**: Menilai terjemahan Anda (0-100), memberikan umpan balik, dan menyarankan terjemahan yang lebih baik.
- **Manajemen Kunci API Aman**: Pengguna memasukkan Kunci API Groq/OpenAI mereka sendiri, yang disimpan secara lokal di browser.
- **Desain Responsif**: Tata letak "Mobile-first" dengan estetika modern dan bersih (Deep Navy, Slate Grey, Teal).

## Struktur Proyek

- `src/components`: Komponen React (ExerciseCard, TranslationInput, dll.)
- `src/services`: Logika API (`AIService.js`) untuk berkomunikasi dengan Groq/OpenAI.
- `src/App.jsx`: Logika utama aplikasi.
- `src/index.css`: Gaya Tailwind CSS.

## Persiapan & Pengembangan

1. **Instal Dependensi**
   ```bash
   npm install
   ```

2. **Jalankan Server Lokal**
   ```bash
   npm run dev
   ```

3. **Dapatkan Kunci API**
   - Buka [Groq Console](https://console.groq.com/keys) untuk mendapatkan kunci API gratis.
   - Masukkan kunci tersebut di modal aplikasi saat diminta.

## Deployment

Aplikasi ini adalah aplikasi frontend statis, siap untuk dideploy di platform seperti Vercel, Netlify, atau Firebase Hosting.

### Build Aplikasi
```bash
npm run build
```

Hasil build akan berada di folder `dist`.

### Deploy ke Vercel (Disarankan)
1. Instal Vercel CLI: `npm i -g vercel`
2. Jalankan `vercel` di direktori proyek.
3. Ikuti petunjuk yang muncul.

### Deploy ke Firebase
1. Instal Firebase Tools: `npm i -g firebase-tools`
2. Jalankan `firebase login` dan `firebase init`.
3. Pilih "Hosting", pilih proyek Anda, dan atur `dist` sebagai direktori publik.
4. Jalankan `firebase deploy`.
