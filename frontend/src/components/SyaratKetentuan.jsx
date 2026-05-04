export default function SyaratKetentuan() {
  return (
    <section className="pt-6 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Syarat & Ketentuan</h2>
        <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
          Ketentuan dan persyaratan yang harus dipenuhi oleh mahasiswa sebelum mengikuti program magang di DPRD Banyumas
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Persyaratan Peserta</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Mahasiswa aktif dari perguruan tinggi</li>
              <li>Memiliki surat pengantar dari kampus</li>
              <li>Bersedia mengikuti seluruh rangkaian kegiatan magang</li>
              <li>Memiliki minat di bidang pemerintahan dan pelayanan publik</li>
            </ol>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Ketentuan Umum</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Durasi magang menyesuaikan kebijakan kampus dan instansi</li>
              <li>Jam kegiatan mengikuti operasional instansi</li>
              <li>Peserta wajib menjaga etika dan kedisiplinan</li>
              <li>Wajib mengikuti arahan mentor dan pembimbing</li>
            </ol>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Berkas yang Diperlukan</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Curriculum Vitae (CV)</li>
              <li>Surat pengantar dari kampus</li>
              <li>Transkrip nilai (opsional)</li>
              <li>Dokumen pendukung lainnya (jika diperlukan)</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
