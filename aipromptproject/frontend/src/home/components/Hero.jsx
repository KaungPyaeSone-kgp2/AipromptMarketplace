// import "../style.css";

// import homepicture_1 from "../../assets/homepicture(1).jpg";
// import homepicture_2 from "../../assets/homepicture(2).jpg";
// import homepicture_3 from "../../assets/homepicture(3).jpg";
// import homepicture_4 from "../../assets/homepicture(4).jpg";
// import homepicture_5 from "../../assets/homepicture(5).jpg";

// export default function Hero() {
//   const galleryImages = [
//     homepicture_1,
//     homepicture_2,
//     homepicture_3,
//     homepicture_4,
//     homepicture_5,
//   ];

//   // Safeguard array rendering if backend payload hasn't mounted yet
//   const hasImages = galleryImages.length >= 5;
//   const track1Images = hasImages
//     ? [...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages]
//     : [];
//   const track2Images = hasImages ? [...galleryImages].reverse() : [];
//   const track2Looped = hasImages
//     ? [...track2Images, ...track2Images, ...track2Images, ...track2Images]
//     : [];

//   // Replicating custom rank ordering array from hero.php line 30
//   const reorderedBase = hasImages
//     ? [
//         galleryImages[4],
//         galleryImages[2],
//         galleryImages[0],
//         galleryImages[1],
//         galleryImages[3],
//       ]
//     : [];
//   const track3Images = hasImages
//     ? [...reorderedBase, ...reorderedBase, ...reorderedBase, ...reorderedBase]
//     : [];

//   return (
//     <div className="relative w-full min-h-screen flex items-center px-6 md:px-10 z-10 pt-20 lg:pt-0 overflow-hidden">
//       {/* 3D Isometric Track Scene Backdrop (Matches hero.php layout perfectly) */}
//       <div className="scene-wrapper">
//         <div className="absolute top-[80%] lg:top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-[0.6] sm:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] 2xl:scale-[1]">
//           <div className="iso-scene">
//             {/* Track Column 1: Animates Down */}
//             <div>
//               <div className="gallery-track anim-down">
//                 {track1Images.map((imgUrl, i) => (
//                   <div className="iso-card" key={`t1-${i}`}>
//                     <img src={imgUrl} alt="Prompt Asset" />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Track Column 2: Animates Up (Reversed Layout) */}
//             <div style={{ marginTop: "115px" }}>
//               <div className="gallery-track anim-up">
//                 {track2Looped.map((imgUrl, i) => (
//                   <div className="iso-card" key={`t2-${i}`}>
//                     <img src={imgUrl} alt="Prompt Asset" />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Track Column 3: Animates Down (Reordered Distribution) */}
//             <div style={{ marginTop: "230px" }}>
//               <div className="gallery-track anim-down">
//                 {track3Images.map((imgUrl, i) => (
//                   <div className="iso-card" key={`t3-${i}`}>
//                     <img src={imgUrl} alt="Prompt Asset" />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent w-[100%] md:w-[60%] z-20 pointer-events-none lg:hidden"></div>
//       <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none"></div>

//       <div className="relative w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center z-30 pointer-events-none mt-10 lg:mt-20 xl:mt-24">
//         <div className="max-w-[650px] xl:max-w-[720px] text-left md:ml-4 lg:ml-0 flex flex-col items-start justify-center">
//           <h1 className="text-white font-black tracking-[-0.03em] leading-[1.05] text-[38px] sm:text-[52px] md:text-[68px] lg:text-[62px] xl:text-[76px] 2xl:text-[84px] uppercase select-none pointer-events-auto">
//             The Ultimate <br />
//             <span className="flex flex-wrap items-center gap-x-3 sm:gap-x-4">
//               Marketplace
//               <span className="text-[#71717a] transition-colors duration-300 font-light lowercase">
//                 for
//               </span>
//             </span>
//             <span className="inline-flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 group">
//               Prompt Engineering
//               <span className="text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300">
//                 +
//               </span>
//               <span className="flex items-center text-[#c084fc] relative">
//                 <div className="absolute inset-0 bg-[#c084fc] blur-[20px] md:blur-[30px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-300"></div>
//                 <i className="fa-solid fa-wand-magic-sparkles text-[35px] sm:text-[50px] md:text-[60px] lg:text-[75px] xl:text-[85px] relative z-10"></i>
//               </span>
//               <span className="text-white font-medium normal-case">AI</span>
//             </span>
//           </h1>

//           <p className="mt-6 md:mt-10 text-[#71717a] max-w-[500px] xl:max-w-[550px] text-[15px] sm:text-[16px] md:text-[17px] leading-[1.6] font-normal text-left pointer-events-auto animate-fade-up">
//             A global community to discover, share, and utilize the most powerful
//             free AI prompts for your daily workflow.
//           </p>

//           <div
//             className="mt-8 md:mt-10 pointer-events-auto relative z-50 animate-fade-up"
//             style={{ animationDelay: "0.2s" }}
//           >
//             <a
//               href="#explore"
//               className="hero-btn-outline inline-block px-8 md:px-10 py-3 md:py-3.5 text-[13px] md:text-[14px] uppercase tracking-wider font-bold rounded-full border border-white/20 text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300"
//             >
//               Explore Prompts
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent w-[100%] md:w-[60%] z-20 pointer-events-none lg:hidden"></div>
//       <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none"></div>
//       <div class="relative w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center z-30 pointer-events-none mt-10 lg:mt-20 xl:mt-24">
//         <div class="flex flex-col items-start w-full group pointer-events-auto w-fit">
//           <h1 class="text-[48px] sm:text-[60px] md:text-[70px] lg:text-[85px] xl:text-[95px] font-medium tracking-[-0.04em] leading-[0.9] lg:leading-[0.85] flex flex-col items-start cursor-default">
//             <span
//               class="block text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
//               style="animation-delay: 0.1s;"
//             >
//               The
//             </span>
//             <span
//               class="block -mt-1 md:-mt-2 text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
//               style="animation-delay: 0.2s;"
//             >
//               future of
//             </span>
//             <span
//               class="block -mt-1 md:-mt-2 text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
//               style="animation-delay: 0.3s;"
//             >
//               creativity is
//             </span>
//             <span
//               class="flex items-center justify-start gap-2 md:gap-4 w-full mt-2 md:mt-1 pl-1 animate-fade-up"
//               style="animation-delay: 0.4s;"
//             >
//               <span class="flex items-center text-[#fca311]">
//                 <i class="fa-solid fa-bolt text-[35px] sm:text-[50px] md:text-[60px] lg:text-[75px] xl:text-[85px]"></i>
//               </span>
//               <span class="text-white font-semibold tracking-[-0.05em]">
//                 Prompts
//               </span>
//               <span class="text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300">
//                 +
//               </span>
//               <span class="flex items-center text-[#c084fc] relative">
//                 <div class="absolute inset-0 bg-[#c084fc] blur-[20px] md:blur-[30px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-300"></div>
//                 <i class="fa-solid fa-wand-magic-sparkles text-[35px] sm:text-[50px] md:text-[60px] lg:text-[75px] xl:text-[85px] relative z-10"></i>
//               </span>
//               <span class="text-white font-medium">AI</span>
//             </span>
//           </h1>
//           <p
//             class="mt-6 md:mt-10 text-[#71717a] max-w-[500px] xl:max-w-[550px] text-[15px] sm:text-[16px] md:text-[17px] leading-[1.6] font-normal text-left pointer-events-auto animate-fade-up"
//             style="animation-delay: 0.5s;"
//           >
//             A global community to discover, share, and utilize the most powerful
//             free AI prompts for your daily workflow.
//           </p>
//           <div
//             class="mt-8 md:mt-10 pointer-events-auto relative z-50 animate-fade-up"
//             style="animation-delay: 0.6s;"
//           >
//             <a
//               href="#explore"
//               class="hero-btn-outline inline-block px-8 md:px-10 py-3 md:py-3.5 text-[13px] md:text-[14px]"
//             >
//               Explore Prompts
//             </a>
//           </div>
//         </div>
//         <div class="hidden lg:block w-full"></div>
//       </div> */}
//     </div>
//   );
// }

import { Zap, Wand2 } from "lucide-react";
import "../style.css";

import homepicture_1 from "../../assets/homepicture(1).jpg";
import homepicture_2 from "../../assets/homepicture(2).jpg";
import homepicture_3 from "../../assets/homepicture(3).jpg";
import homepicture_4 from "../../assets/homepicture(4).jpg";
import homepicture_5 from "../../assets/homepicture(5).jpg";

export default function Hero() {
  const galleryImages = [
    homepicture_1,
    homepicture_2,
    homepicture_3,
    homepicture_4,
    homepicture_5,
  ];

  // Safeguard array rendering if backend payload hasn't mounted yet
  const hasImages = galleryImages.length >= 5;
  const track1Images = hasImages
    ? [...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages]
    : [];
  const track2Images = hasImages ? [...galleryImages].reverse() : [];
  const track2Looped = hasImages
    ? [...track2Images, ...track2Images, ...track2Images, ...track2Images]
    : [];

  // Replicating custom rank ordering array from hero.php line 30
  const reorderedBase = hasImages
    ? [
        galleryImages[4],
        galleryImages[2],
        galleryImages[0],
        galleryImages[1],
        galleryImages[3],
      ]
    : [];
  const track3Images = hasImages
    ? [...reorderedBase, ...reorderedBase, ...reorderedBase, ...reorderedBase]
    : [];

  return (
    <div className="relative w-full min-h-screen flex items-center px-6 md:px-10 z-10 pt-20 lg:pt-0 overflow-hidden">
      {/* 3D Isometric Track Scene Backdrop */}
      <div className="scene-wrapper">
        <div className="absolute top-[80%] lg:top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-[0.6] sm:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] 2xl:scale-[1]">
          <div className="iso-scene">
            {/* Track Column 1: Animates Down */}
            <div>
              <div className="gallery-track anim-down">
                {track1Images.map((imgUrl, i) => (
                  <div className="iso-card" key={`t1-${i}`}>
                    <img src={imgUrl} alt="Prompt Asset" />
                  </div>
                ))}
              </div>
            </div>

            {/* Track Column 2: Animates Up (Reversed Layout) */}
            <div style={{ marginTop: "115px" }}>
              <div className="gallery-track anim-up">
                {track2Looped.map((imgUrl, i) => (
                  <div className="iso-card" key={`t2-${i}`}>
                    <img src={imgUrl} alt="Prompt Asset" />
                  </div>
                ))}
              </div>
            </div>

            {/* Track Column 3: Animates Down (Reordered Distribution) */}
            <div style={{ marginTop: "230px" }}>
              <div className="gallery-track anim-down">
                {track3Images.map((imgUrl, i) => (
                  <div className="iso-card" key={`t3-${i}`}>
                    <img src={imgUrl} alt="Prompt Asset" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent w-[100%] md:w-[60%] z-20 pointer-events-none lg:hidden"></div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none"></div>

      <div className="relative w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center z-30 pointer-events-none mt-10 lg:mt-20 xl:mt-24">
        {/* Restored Original Text and Staggered Animations */}
        <div className="flex flex-col items-start w-full group pointer-events-auto w-fit">
          <h1 className="text-[48px] sm:text-[60px] md:text-[70px] lg:text-[85px] xl:text-[95px] font-medium tracking-[-0.04em] leading-[0.9] lg:leading-[0.85] flex flex-col items-start cursor-default">
            <span
              className="block text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              The
            </span>
            <span
              className="block -mt-1 md:-mt-2 text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              future of
            </span>
            <span
              className="block -mt-1 md:-mt-2 text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              creativity is
            </span>
            <span
              className="flex items-center justify-start gap-2 md:gap-4 w-full mt-2 md:mt-1 pl-1 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="flex items-center text-[#fca311]">
                <Zap
                  strokeWidth={2.5}
                  className="w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] lg:w-[75px] lg:h-[75px] xl:w-[85px] xl:h-[85px]"
                />
              </span>
              <span className="text-white font-semibold tracking-[-0.05em]">
                Prompts
              </span>
              <span className="text-[#71717a] group-hover:text-[#e4e4e7] transition-colors duration-300">
                +
              </span>
              <span className="flex items-center text-[#c084fc] relative">
                <div className="absolute inset-0 bg-[#c084fc] blur-[20px] md:blur-[30px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-300"></div>
                <Wand2
                  strokeWidth={2.5}
                  className="w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] lg:w-[75px] lg:h-[75px] xl:w-[85px] xl:h-[85px] relative z-10"
                />
              </span>
              <span className="text-white font-medium">AI</span>
            </span>
          </h1>
          <p
            className="mt-6 md:mt-10 text-[#71717a] max-w-[500px] xl:max-w-[550px] text-[15px] sm:text-[16px] md:text-[17px] leading-[1.6] font-normal text-left pointer-events-auto animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            A global community to discover, share, and utilize the most powerful
            free AI prompts for your daily workflow.
          </p>
          <div
            className="mt-8 md:mt-10 pointer-events-auto relative z-50 animate-fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            <a
              href="/explore"
              className="hero-btn-outline inline-block px-8 md:px-10 py-3 md:py-3.5 text-[13px] md:text-[14px]"
            >
              Explore Prompts
            </a>
          </div>
        </div>
        <div className="hidden lg:block w-full"></div>
      </div>
    </div>
  );
}
