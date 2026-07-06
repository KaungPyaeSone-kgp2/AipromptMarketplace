const features = [
  "Responsive grid",
  "Hover effects",
  "Gradients",
  "Spacing utilities",
];

function TailwindTest() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-lg border border-cyan-400/30 bg-slate-900 p-6 shadow-2xl shadow-cyan-500/10">
          <p className="text-sm font-semibold uppercase tracking-wide text-yellow-100">
            Tailwind CSS test
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white md:text-6xl">
            If this page is styled, Tailwind is working.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Edit this file at{" "}
            <code className="rounded bg-slate-800 px-2 py-1 text-cyan-200">
              src/TailwindTest.jsx
            </code>{" "}
            and try changing colors, spacing, text sizes, and layout classes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-md bg-cyan-400 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Hover me
            </button>
            <button className="rounded-md border border-slate-600 px-5 py-2 font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200">
              Border test
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300"
            >
              <div className="mb-4 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
              <h2 className="font-semibold text-white">{feature}</h2>
              <p className="mt-2 text-sm text-slate-400">
                This card is styled with Tailwind utility classes.
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-white p-6 text-slate-950">
          <h2 className="text-2xl font-bold">Quick class tests</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
              bg-red-100
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              bg-green-100
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              bg-blue-100
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
              bg-purple-100
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TailwindTest;
