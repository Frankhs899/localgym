export default function PageShell({ title, children }) {
  return (
    // Page title: display face at --text-title/700, as the artboard's pagehead.
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-title font-bold tracking-[-0.01em] text-text">
        {title}
      </h1>
      <div className="mt-group">{children}</div>
    </section>
  )
}
