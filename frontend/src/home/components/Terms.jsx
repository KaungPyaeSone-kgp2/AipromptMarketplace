import { useEffect } from "react";
import { Link } from "react-router";
import Footer from "./Footer";

export default function Terms() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#050505] text-white selection:bg-[#fca311] selection:text-black min-h-screen flex flex-col relative font-['Inter']">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/85 backdrop-blur-[20px] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <Link
              to="/"
              className="text-[22px] font-black tracking-tight flex items-center"
            >
              Dream<span className="font-normal">Key</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
            >
              Back to Home
            </Link>
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
            Terms & Conditions
          </h1>
          <p className="text-[#71717a]">Last updated: {currentDate}</p>
        </header>

        <section className="prose prose-invert max-w-none">
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            These Terms & Conditions ("Terms") govern your access to and use of
            the Dream Key AI prompt platform. By using the Platform you agree to
            be bound by these Terms. If you do not agree, you must not use the
            Platform.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            1. Free Usage & Community Guidelines
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            Dream Key is a 100% free platform designed for the community. All
            prompts listed are free to view, copy, and use for your personal or
            commercial projects. However, you must not use automated scraping
            tools to mass-download our database.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            2. Becoming a Creator
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            Any registered user can apply to become a Creator. Creators must
            adhere to our community guidelines, ensuring that uploaded prompts
            are high quality, safe, and do not violate any intellectual property
            rights. We reserve the right to revoke creator privileges for spam
            or low-quality submissions.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            3. Prompt Ownership & Licensing
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            Creators retain ownership of the prompts they upload. By listing a
            prompt on Dream Key, creators grant us a non-exclusive, worldwide,
            royalty-free license to display and distribute the prompt. Other
            users are granted a free license to copy and use the prompt.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
            4. Termination Rights
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-6">
            You may stop using the Platform at any time. We may terminate or
            suspend your access at our discretion for violations of these Terms
            (e.g., spamming, harassment, illegal content). Sections that by
            their nature should survive termination will continue to apply.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
