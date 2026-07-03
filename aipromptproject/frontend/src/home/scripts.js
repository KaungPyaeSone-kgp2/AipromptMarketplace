// Navbar Show/Hide
let lastScrollTop = 0;
const navbar = document.getElementById('main-nav');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) navbar.classList.add('shadow-2xl', 'shadow-black/80');
    else navbar.classList.remove('shadow-2xl', 'shadow-black/80');

    if (scrollTop > lastScrollTop && scrollTop > 80) navbar.style.transform = 'translateY(-100%)';
    else navbar.style.transform = 'translateY(0)';
    lastScrollTop = scrollTop;
});

// Mobile Menu
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const icon = menuBtn.querySelector('i');
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    if(mobileMenu.classList.contains('hidden')) {
        icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
    } else {
        icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark');
    }
});

// Carousel Scroll Logic
const carousels = document.querySelectorAll('.carousel-container');

carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const btnLeft = carousel.querySelector('.btn-left');
    const btnRight = carousel.querySelector('.btn-right');
    
    // Scroll by roughly 2 cards width
    const scrollAmount = 600; 

    if (track && btnLeft && btnRight) {
        btnRight.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        btnLeft.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        track.addEventListener('scroll', () => {
            if (track.scrollLeft <= 0) {
                btnLeft.classList.add('!opacity-0', 'pointer-events-none');
            } else {
                btnLeft.classList.remove('!opacity-0', 'pointer-events-none');
            }

            if (Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 1) {
                btnRight.classList.add('!opacity-0', 'pointer-events-none');
            } else {
                btnRight.classList.remove('!opacity-0', 'pointer-events-none');
            }
        });
        
        btnLeft.classList.add('!opacity-0', 'pointer-events-none');
    }
});

// Scrollytelling for Why Dream Key Section
document.addEventListener('DOMContentLoaded', () => {
    const featureBlocks = document.querySelectorAll('.why-feature-block');
    
    if (featureBlocks.length > 0) {
        // Observer to detect which text block is active
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Make active block full opacity and translate to 0
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    
                    // Dim others (hide them completely)
                    featureBlocks.forEach(b => {
                        if (b !== entry.target) {
                            b.classList.remove('opacity-100', 'translate-y-0');
                            b.classList.add('opacity-0', 'translate-y-8');
                        }
                    });

                    // Slide up images to cover
                    const activeIndex = parseInt(entry.target.getAttribute('data-index'));
                    for (let i = 1; i <= 3; i++) {
                        const img = document.getElementById('feature-img-' + i);
                        if (img) {
                            if (i <= activeIndex) {
                                // Images up to the active one should be revealed (slide up into view)
                                img.classList.replace('translate-y-full', 'translate-y-0');
                            } else {
                                // Images after the active one should be hidden below
                                img.classList.replace('translate-y-0', 'translate-y-full');
                            }
                        }
                    }
                }
            });
        }, {
            rootMargin: '-35% 0px -40% 0px', // Trigger when block is near the center
            threshold: 0
        });

        featureBlocks.forEach(block => observer.observe(block));
    }
});
