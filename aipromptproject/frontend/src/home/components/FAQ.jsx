import { useState } from "react";
import Footer from "./Footer";

export default function Faq() {
  // Converted PHP array to a JavaScript object
  const faqGroups = {
    "General Questions": [
      [
        "What is Dream Key?",
        "Dream Key is an AI prompt platform where users can discover, share, and use high-quality prompts crafted for models like ChatGPT, Claude, Gemini, Midjourney and StableDiffusion.",
      ],
      [
        "Who can use Dream Key?",
        "Anyone over the age of 13 can browse and copy prompts for free. To upload and share your own prompts, you must apply for Creator mode and be approved by our moderation team.",
      ],
      [
        "Which AI models are supported?",
        "We currently support prompts for ChatGPT, Claude, Gemini, Midjourney and StableDiffusion. We expand the list as new models gain adoption.",
      ],
    ],
    "Account & Security": [
      [
        "How do I create an account?",
        "Sign up using your email address and a strong password. You will receive an OTP email to verify your ownership.",
      ],
      [
        "Is it completely free?",
        "Yes! Using Dream Key to discover and copy prompts is 100% free. We believe in open access to AI knowledge.",
      ],
    ],
    "Creator Mode": [
      [
        "How do I become a creator?",
        'Log in, click "Become a Creator" in the top menu, and submit the short form. Our team reviews each application manually to ensure quality.',
      ],
      [
        "Why do I need to apply to be a Creator?",
        "To maintain the highest quality of prompts on our platform, we verify all creators. This prevents spam and low-quality submissions.",
      ],
      [
        "Can I charge for my prompts?",
        "No. Dream Key is a free, community-driven platform. All prompts shared must be freely available to other users.",
      ],
      [
        "Do I lose ownership of my prompts?",
        "No, you retain ownership of your original ideas. By posting them here, you simply grant the community the right to use and build upon them.",
      ],
    ],
    "Reports & Moderation": [
      [
        "How do I report a bad prompt or user?",
        'Use the "Report" button on any prompt or profile. Provide as much detail as possible so our moderators can investigate quickly.',
      ],
      [
        "What happens after I report something?",
        "Reports enter the moderation queue. Moderators review the content and may remove it, warn the user, or suspend the account if policies were broken.",
      ],
      [
        "What content is not allowed?",
        "Illegal content, harassment, hate speech, spam, scams, and prompts that infringe other people's intellectual property are strictly prohibited.",
      ],
    ],
  };

  // State to track which FAQ is open
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (key) => {
    setOpenFaq(openFaq === key ? null : key);
  };

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
            Frequently Asked Questions
          </h1>
          <p className="text-[#71717a]">
            Everything you need to know about using Dream Key as a buyer or a
            creator.
          </p>
        </header>

        <section>
          {Object.entries(faqGroups).map(([group, items], groupIndex) => (
            <div className="mb-10" key={groupIndex}>
              <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
                {group}
              </h2>
              <div>
                {items.map(([question, answer], itemIndex) => {
                  const faqKey = `${groupIndex}-${itemIndex}`;
                  const isActive = openFaq === faqKey;

                  return (
                    <div
                      key={faqKey}
                      className={`mb-3 overflow-hidden rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "border-[#fca311]/30 bg-white/10"
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <button
                        className="w-full text-left py-5 px-6 flex justify-between items-center font-semibold text-white transition-colors hover:text-[#fca311]"
                        onClick={() => toggleFaq(faqKey)}
                      >
                        <span>{question}</span>
                        <i
                          className={`fa-solid fa-chevron-down text-[#71717a] transition-transform duration-300 ${
                            isActive ? "rotate-180 text-[#fca311]" : ""
                          }`}
                        ></i>
                      </button>
                      <div
                        className={`px-6 text-[#a1a1aa] leading-relaxed overflow-hidden transition-all duration-400 ease-in-out ${
                          isActive
                            ? "max-h-[300px] pb-6 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p>{answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
