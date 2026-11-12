export default function PageShell({ title, children }) {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <div className="mt-4">{children}</div>
    </section>
  )
}
