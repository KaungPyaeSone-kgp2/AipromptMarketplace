import Footer from "./Footer";

export default function Contact() {
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
            Support
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-[#71717a]">
            Questions about prompts, creator tools, or your account are welcome
            here.
          </p>
        </header>

        <section>
          <p className="text-[#a1a1aa] leading-relaxed mb-4">
            Please check our{" "}
            <a href="/faq" className="text-[#fca311] hover:underline">
              FAQ page
            </a>{" "}
            first. Your question may already have a quick answer there.
          </p>
          <p className="text-[#a1a1aa] leading-relaxed mb-8">
            If you still need help, have a marketplace enquiry, or want to
            report a prompt issue, reach the Dream Key team through email:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4 transition-all duration-300 hover:border-[#fca311]/50 hover:bg-white/10 flex flex-col items-start group">
              <div className="w-12 h-12 rounded-full bg-[#fca311]/10 flex items-center justify-center text-[#fca311] mb-4 text-xl">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Email Support
              </h3>
              <p className="text-sm flex-grow mb-4 text-[#a1a1aa]">
                For general inquiries, account issues, and creator verification.
              </p>
              <a
                href="mailto:support@dreamkey.com"
                className="text-[#fca311] font-medium hover:text-white transition-colors"
              >
                support@dreamkey.com &rarr;
              </a>
            </div>
          </div>

          <p className="mt-8 text-sm text-[#71717a] border-t border-white/10 pt-8">
            We aim to reply to support messages within 24 hours during business
            days.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
