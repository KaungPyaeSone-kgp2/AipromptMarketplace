// src/components/Footer.jsx
// import { ChevronRight, Wand2 } from "lucide-react";

// export default function Footer() {
//   const currentYear = new Date().getFullYear();

//   // Translated from your PHP arrays
//   const categories = [
//     "Art & Illustration",
//     "Photography",
//     "Marketing",
//     "Productivity",
//     "Coding",
//     "Writing",
//   ];

//   const models = [
//     "ChatGPT",
//     "Claude",
//     "Gemini",
//     "Midjourney",
//     "StableDiffusion",
//   ];

//   const quickLinks = [
//     { label: "Home", href: "/" },
//     { label: "Explore Prompts", href: "/explore" },
//   ];

//   const legalLinks = [
//     { label: "FAQ", href: "/faq" },
//     { label: "Contact Us", href: "/contact" },
//     { label: "Privacy Policy", href: "/privacy" },
//     { label: "Terms & Conditions", href: "/terms" },
//   ];

//   return (
//     <footer className="w-full bg-[#050505] border-t border-white/10 pt-16 pb-8 relative z-30 mt-auto">
//       <div className="max-w-[1400px] mx-auto px-6 md:px-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
//           {/* Brand Section */}
//           <div className="flex flex-col">
//             <a
//               href="/"
//               className="text-[24px] font-black tracking-tight flex items-center mb-4 text-white"
//             >
//               Dream<span className="font-normal">Key</span>
//             </a>
//             <p className="text-[#71717a] text-sm leading-relaxed mb-6">
//               A curated platform for AI prompts. Discover and share
//               high-performing prompts for ChatGPT, Claude, Gemini, Midjourney
//               and more &mdash; crafted by a global creator community.
//             </p>

//             <div className="flex items-center gap-4">
//               <a
//                 href="https://tiktok.com"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#ff0050] hover:text-white hover:border-[#ff0050] transition-all duration-300"
//               >
//                 <i className="fa-brands fa-tiktok"></i>
//               </a>
//               <a
//                 href="https://discord.com"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#c084fc] hover:text-white hover:border-[#c084fc] transition-all duration-300"
//               >
//                 <i className="fa-brands fa-discord"></i>
//               </a>
//               <a
//                 href="https://facebook.com"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all duration-300"
//               >
//                 <i className="fa-brands fa-facebook-f"></i>
//               </a>
//             </div>
//           </div>

//           {/* Quick Links & Legal */}
//           <div className="flex flex-col gap-8">
//             <div>
//               <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
//                 Quick Links
//               </h4>
//               <ul className="flex flex-col gap-3">
//                 {quickLinks.map((link, idx) => (
//                   <li key={idx}>
//                     <a
//                       href={link.href}
//                       className="text-[#71717a] text-sm hover:text-[#fca311] transition-colors flex items-center gap-2"
//                     >
//                       <ChevronRight className="w-3 h-3" strokeWidth={3} />{" "}
//                       {link.label}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
//                 Support & Legal
//               </h4>
//               <ul className="flex flex-col gap-3">
//                 {legalLinks.map((link, idx) => (
//                   <li key={idx}>
//                     <a
//                       href={link.href}
//                       className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
//                     >
//                       <ChevronRight className="w-3 h-3" strokeWidth={3} />{" "}
//                       {link.label}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Categories */}
//           <div className="flex flex-col">
//             <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
//               Categories
//             </h4>
//             <ul className="flex flex-col gap-3">
//               {categories.slice(0, 10).map((cat, idx) => (
//                 <li key={idx}>
//                   <a
//                     href={`/explore?category=${encodeURIComponent(cat)}`}
//                     className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
//                   >
//                     {cat}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Models */}
//           <div className="flex flex-col">
//             <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
//               AI Models
//             </h4>
//             <ul className="flex flex-col gap-3">
//               {models.map((model, idx) => (
//                 <li key={idx}>
//                   <a
//                     href={`/explore?model=${encodeURIComponent(model)}`}
//                     className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
//                   >
//                     {model}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         {/* Bottom */}
//         <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 gap-4">
//           <p className="text-[#71717a] text-sm">
//             &copy; {currentYear} Dream Key. All rights reserved.
//           </p>
//           <p className="text-[#71717a] text-sm flex items-center gap-2">
//             Crafted for creators of the{" "}
//             <Wand2 className="w-4 h-4 text-[#fca311]" /> AI era.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// src/components/Footer.jsx
import { useState, useEffect } from "react";
import { ChevronRight, Wand2 } from "lucide-react";
import API_BASE from "../../config/api";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // State to hold dynamically fetched categories from cache
  const [categories, setCategories] = useState([]);

  // Fetch categories from the cache API endpoint
  useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/home/get_filtered_prompts.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              search: "",
              model: "All",
              category: "All",
            }),
          },
        );

        const data = await response.json();
        if (data.success && data.categories) {
          // Extract just the category names from the objects
          const categoryNames = data.categories.map((cat) => cat.category_name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Failed to fetch footer categories:", error);
      }
    };

    fetchFooterCategories();
  }, []);

  const models = [
    "ChatGPT",
    "Claude",
    "Gemini",
    "Midjourney",
    "StableDiffusion",
  ];

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Prompts", href: "/explore" },
  ];

  const legalLinks = [
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 pt-16 pb-8 relative z-30 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col">
            <a
              href="/"
              className="text-[24px] font-black tracking-tight flex items-center mb-4 text-white"
            >
              Dream<span className="font-normal">Key</span>
            </a>
            <p className="text-[#71717a] text-sm leading-relaxed mb-6">
              A curated platform for AI prompts. Discover and share
              high-performing prompts for ChatGPT, Claude, Gemini, Midjourney
              and more &mdash; crafted by a global creator community.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#ff0050] hover:text-white hover:border-[#ff0050] transition-all duration-300"
              >
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#c084fc] hover:text-white hover:border-[#c084fc] transition-all duration-300"
              >
                <i className="fa-brands fa-discord"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[#a1a1aa] hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all duration-300"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>

          {/* Quick Links & Legal */}
          <div className="flex flex-col gap-8">
            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[#71717a] text-sm hover:text-[#fca311] transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" strokeWidth={3} />{" "}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
                Support & Legal
              </h4>
              <ul className="flex flex-col gap-3">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" strokeWidth={3} />{" "}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
              Categories
            </h4>
            <ul className="flex flex-col gap-3">
              {categories.length > 0 ? (
                categories.slice(0, 10).map((cat, idx) => (
                  <li key={idx}>
                    <a
                      href={`/explore?category=${encodeURIComponent(cat)}`}
                      className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
                    >
                      {cat}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-[#71717a] text-sm">Loading...</li>
              )}
            </ul>
          </div>

          {/* Models */}
          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">
              AI Models
            </h4>
            <ul className="flex flex-col gap-3">
              {models.map((model, idx) => (
                <li key={idx}>
                  <a
                    href={`/explore?model=${encodeURIComponent(model)}`}
                    className="text-[#71717a] text-sm hover:text-white transition-colors flex items-center gap-2"
                  >
                    {model}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 gap-4">
          <p className="text-[#71717a] text-sm">
            &copy; {currentYear} Dream Key. All rights reserved.
          </p>
          <p className="text-[#71717a] text-sm flex items-center gap-2">
            Crafted for creators of the{" "}
            <Wand2 className="w-4 h-4 text-[#fca311]" /> AI era.
          </p>
        </div>
      </div>
    </footer>
  );
}
