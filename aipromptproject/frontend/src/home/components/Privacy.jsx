import Footer from "./Footer";

export default function Privacy() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-[#050505] text-white selection:bg-[#fca311] selection:text-black min-h-screen flex flex-col relative font-['Inter']">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/85 backdrop-blur-[20px] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <a
              href="/"
              className="text-[22px] font-black tracking-tight flex items-center"
            >
              Dream<span className="font-normal">Key</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[800px] mx-auto px-6 md:px-10 pt-[120px] pb-24 flex-grow">
        <header className="mb-12 border-b border-white/10 pb-8">
          <p className="text-[#fca311] font-bold tracking-widest uppercase text-xs mb-3 block">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#71717a]">Last updated: {currentDate}</p>
        </header>

        <section className="prose prose-invert max-w-none">
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            This Privacy Policy explains how Dream Key ("we", "us", "our")
            collects, uses, stores and protects information when you use our
            free AI prompt platform (the "Platform"). By creating an account or
            using the Platform you agree to the practices described below.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            1. Account Data Collection
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            When you sign up we collect your display name, email address,
            password, profile image (optional), and basic preferences. Users who
            apply for Creator may provide additional portfolio links or a short
            bio for review.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            2. Email Storage
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            Your email is used for authentication, account security
            notifications (like password resets). You can opt at any time from
            your account settings.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            3. Usage & Activity Records
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            We may keep a record of the prompts you bookmark. We do not track
            personal data across external websites.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            4. Creator Prompts Data
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            Prompts uploaded by Creators are stored publicly. This includes the
            prompt title, instructions, model parameters, and thumbnail. Please
            ensure you do not include sensitive personal information in the
            prompts you upload to the public platform.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            5. Policy Updates
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            We may update this Policy from time to time. Material changes will
            be announced on the Platform and, where appropriate, by email.
            Continued use of Dream Key after an update constitutes acceptance of
            the revised Policy.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
