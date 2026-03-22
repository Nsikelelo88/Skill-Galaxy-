export default function EvidenceUpload() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Evidence Upload</h2>
      <p className="mt-2 text-sm text-slate-400">
        Store certifications, portfolio links, and project proof.
      </p>
      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-12 text-center text-sm text-slate-400">
        <span className="font-medium text-slate-200">Drop files here</span>
        <span className="mt-2">or click to browse</span>
        <input type="file" className="hidden" />
      </label>
    </section>
  )
}