import { QRCodeSVG } from 'qrcode.react'

export default function QRCode() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">QR Code</h2>
      <p className="mt-2 text-sm text-slate-400">
        Share a quick verification snapshot for your profile.
      </p>
      <div className="mt-6 inline-flex rounded-3xl bg-white p-4">
        <QRCodeSVG value="https://skill-galaxy.example/profile/demo-user" size={160} />
      </div>
    </section>
  )
}