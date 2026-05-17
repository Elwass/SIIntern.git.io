# Backend OTP Auth (Express + MySQL)

## Endpoint utama
- `POST /api/auth/signup`
- `POST /api/auth/verify-signup`
- `POST /api/auth/signin`
- `POST /api/auth/verify-signin`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Ketentuan keamanan yang sudah diimplementasikan
- OTP 6 digit.
- OTP di-hash dengan bcrypt (OTP asli **tidak** disimpan di DB).
- Maksimal 5 percobaan OTP.
- OTP expire 10 menit.
- Password di-hash dengan bcrypt.
- Session refresh token disimpan hash SHA-256 di tabel `sessions`.
- Cookie refresh token menggunakan `httpOnly`.
- Rate limiter IP + window + max request.

## Step manual developer
1. Import `backend/src/db/schema.sql` ke MySQL XAMPP.
2. Buat Gmail App Password untuk akun `SMTP_USER`.
3. Salin `backend/.env.example` menjadi `backend/.env`, lalu sesuaikan nilai DB dan SMTP.
4. Jalankan MySQL XAMPP sebelum start server.
5. Jalankan `npm install` di folder `backend`.
6. Start server: `npm run dev` atau `npm start`.

## Alur uji cepat
1. Signup (`/api/auth/signup`) -> cek email OTP.
2. Verify signup (`/api/auth/verify-signup`) -> user aktif.
3. Signin (`/api/auth/signin`) -> OTP login terkirim.
4. Verify signin (`/api/auth/verify-signin`) -> dapat access token + refresh cookie.
5. Akses `/api/auth/me` pakai header `Authorization: Bearer <token>`.
