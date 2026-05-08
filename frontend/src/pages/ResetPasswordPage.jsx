import { Link } from 'react-router-dom'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Reset Password</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Fitur reset password sedang disiapkan</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            TODO: hubungkan halaman ini ke endpoint reset password backend setelah email service dan token reset tersedia.
            Untuk sementara, hubungi admin Sistem Informasi Magang DPRD Banyumas untuk bantuan pemulihan akun.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
