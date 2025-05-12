document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
     window.addEventListener('load', () => {
        if(preloader){
            preloader.classList.add('hidden');
            preloader.addEventListener('transitionend', () => {
               if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, { once: true });
        }
    });

    // --- Sticky Header ---
    const header = document.getElementById('main-header');
    const heroSection = document.getElementById('hero');
    let headerHeight = 0;
    if (header) {
         headerHeight = header.offsetHeight;
    }
     const stickyNav = () => {
         if (header && heroSection && window.scrollY > heroSection.offsetHeight - headerHeight) {
             header.classList.add('sticky');
         } else if (header) {
             header.classList.remove('sticky');
         }
     };
    window.addEventListener('scroll', stickyNav);
    stickyNav();

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        const navLinks = navMenu.querySelectorAll('.nav-link');
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            menuToggle.textContent = isActive ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', isActive);
            body.style.overflow = isActive ? 'hidden' : '';
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                     navMenu.classList.remove('active');
                     menuToggle.textContent = '☰';
                     menuToggle.setAttribute('aria-expanded', 'false');
                     body.style.overflow = '';
                }
            });
        });
         document.addEventListener('click', (event) => {
             const isClickInsideNav = navMenu.contains(event.target);
             const isClickOnToggle = menuToggle.contains(event.target);
             if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                  navMenu.classList.remove('active');
                  menuToggle.textContent = '☰';
                  menuToggle.setAttribute('aria-expanded', 'false');
                  body.style.overflow = '';
             }
         });
    }


    // --- Active Nav Link Highlighting ---
    const sections = document.querySelectorAll('main section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-links .nav-link');
     const highlightNav = () => {
         let currentSectionId = 'hero';
         const scrollPosition = window.scrollY;
         const currentHeaderHeight = header ? header.offsetHeight : 0;
         const headerOffset = header && header.classList.contains('sticky') ? currentHeaderHeight : 0;
         const triggerOffset = headerOffset + 80;

         sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop - triggerOffset &&
                scrollPosition < sectionTop + sectionHeight - triggerOffset) {
                currentSectionId = section.getAttribute('id');
            }
         });

         if (heroSection && scrollPosition < heroSection.offsetHeight / 2) {
             currentSectionId = 'hero';
         }

         navLinksForHighlight.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
         });
    };
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (typeof IntersectionObserver !== 'undefined') {
         const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.setProperty('--animation-order', index);
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
         }, {
             threshold: 0.1,
         });
         revealElements.forEach(el => {
             if (el) revealObserver.observe(el);
         });
    } else {
        revealElements.forEach(el => {
            if (el) el.classList.add('visible');
        });
    }

    // --- Team Carousel Logic ---
    const teamCarouselViewport = document.querySelector('.team-carousel-viewport');
    const carouselTrack = document.querySelector('.team-carousel-track');
    const carouselItems = document.querySelectorAll('.player-carousel-item');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const dotsContainer = document.querySelector('.carousel-dots-container');

    let currentIndex = 0;
    let totalItems = carouselItems.length;
    let touchStartX = 0;
    let touchEndX = 0;
    let itemWidth = 0; // Will be calculated

    function calculateItemWidth() {
        if (carouselItems.length > 0 && teamCarouselViewport) {
            // For center mode, an item might not be 100% of viewport.
            // Let's assume on desktop we want to show one main item.
            // On mobile, one item fills most of the space.
            if (window.innerWidth <= 768) { // Mobile
                 itemWidth = teamCarouselViewport.offsetWidth * 0.9; // 90% of viewport
                 carouselItems.forEach(item => item.style.width = `${itemWidth}px`);
            } else { // Desktop
                 itemWidth = teamCarouselViewport.offsetWidth * 0.7; // 70% for center focus, allows peeking
                 carouselItems.forEach(item => item.style.width = `${itemWidth}px`);
            }
        }
    }


    function updateCarousel() {
        if (!carouselTrack || !teamCarouselViewport) return;
        calculateItemWidth(); // Recalculate on update, useful for resize

        const trackWidth = itemWidth * totalItems;
        carouselTrack.style.width = `${trackWidth}px`;

        // Calculate offset to center the active slide
        let offsetValue = (teamCarouselViewport.offsetWidth / 2) - (itemWidth / 2) - (currentIndex * itemWidth);
        
        // On smaller screens, we might want to align to left edge of viewport mostly
        if (window.innerWidth <= 768) {
            offsetValue = - (currentIndex * itemWidth) + (teamCarouselViewport.offsetWidth - itemWidth) / 2; // Center it
        }


        carouselTrack.style.transform = `translateX(${offsetValue}px)`;

        carouselItems.forEach((item, index) => {
            item.classList.remove('active-slide');
            if (index === currentIndex) {
                item.classList.add('active-slide');
            }
        });
        updateDots();
        // Reset content display for non-active slides if needed, or ensure active slide is correctly set up
        resetAndSetupActiveSlideContent();
    }
    
    function resetAndSetupActiveSlideContent() {
        carouselItems.forEach((item, index) => {
            const bioArea = item.querySelector('.carousel-bio-area');
            const gifArea = item.querySelector('.carousel-gif-area');
            const bioToggle = item.querySelector('.toggle-bio');
            const gifToggle = item.querySelector('.toggle-gif');
            const gifImg = item.querySelector('.carousel-player-gif-main');

            if (index !== currentIndex) {
                // Optional: Reset non-active slides to bio, hide GIF to save resources
                if (bioArea) bioArea.style.display = 'block';
                if (gifArea) gifArea.style.display = 'none';
                if (bioToggle) bioToggle.classList.add('active');
                if (gifToggle) gifToggle.classList.remove('active');
                if (gifImg) gifImg.src = ''; // Clear GIF src for non-active slides
            } else {
                // Ensure the active slide's default (bio) is shown
                // The toggle buttons will handle if user had selected GIF before slide change
                if (bioToggle && bioToggle.classList.contains('active')) {
                    if (bioArea) bioArea.style.display = 'block';
                    if (gifArea) gifArea.style.display = 'none';
                } else if (gifToggle && gifToggle.classList.contains('active')) {
                    if (bioArea) bioArea.style.display = 'none';
                    if (gifArea) gifArea.style.display = 'block';
                     // Potentially reload GIF if it was cleared
                    loadCarouselGif(
                        gifImg,
                        gifImg.dataset.gifSrc,
                        item.querySelector('.loading-message-carousel'),
                        item.querySelector('.no-gif-message-carousel')
                    );
                }
            }
        });
    }


    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalItems; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    // Swipe functionality
    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
    }

    function handleTouchMove(event) {
        // Optional: Add visual feedback or prevent vertical scroll if horizontal swipe is significant
    }

    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].clientX;
        const swipeThreshold = 50; // Minimum swipe distance

        if (touchStartX - touchEndX > swipeThreshold) {
            nextSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            prevSlide();
        }
    }
    
    // Bio/GIF toggle logic for each carousel item
    carouselItems.forEach(item => {
        const bioToggle = item.querySelector('.toggle-bio');
        const gifToggle = item.querySelector('.toggle-gif');
        const bioArea = item.querySelector('.carousel-bio-area');
        const gifArea = item.querySelector('.carousel-gif-area');
        const gifImg = item.querySelector('.carousel-player-gif-main');
        const loadingMsg = item.querySelector('.loading-message-carousel');
        const noGifMsg = item.querySelector('.no-gif-message-carousel');

        if (bioToggle) {
            bioToggle.addEventListener('click', () => {
                if (bioArea) bioArea.style.display = 'block';
                if (gifArea) gifArea.style.display = 'none';
                bioToggle.classList.add('active');
                gifToggle.classList.remove('active');
                bioToggle.setAttribute('aria-pressed', 'true');
                gifToggle.setAttribute('aria-pressed', 'false');
            });
        }

        if (gifToggle) {
            gifToggle.addEventListener('click', () => {
                if (bioArea) bioArea.style.display = 'none';
                if (gifArea) gifArea.style.display = 'block';
                gifToggle.classList.add('active');
                bioToggle.classList.remove('active');
                gifToggle.setAttribute('aria-pressed', 'true');
                bioToggle.setAttribute('aria-pressed', 'false');
                
                const gifSrc = gifImg.dataset.gifSrc;
                loadCarouselGif(gifImg, gifSrc, loadingMsg, noGifMsg);
            });
        }
        // Initial state for each item (show bio)
        if (bioArea) bioArea.style.display = 'block';
        if (gifArea) gifArea.style.display = 'none';
        if (bioToggle) { bioToggle.classList.add('active'); bioToggle.setAttribute('aria-pressed', 'true');}
        if (gifToggle) { gifToggle.classList.remove('active'); gifToggle.setAttribute('aria-pressed', 'false');}
    });

    function loadCarouselGif(gifImgElement, gifSrc, loadingMsgElement, noGifMsgElement) {
        if (!gifImgElement || !loadingMsgElement || !noGifMsgElement) return;

        loadingMsgElement.style.display = 'none';
        gifImgElement.style.display = 'none';
        noGifMsgElement.style.display = 'none';
        gifImgElement.src = ''; // Clear previous src to ensure onload fires if same src is set

        if (!gifSrc) {
            noGifMsgElement.style.display = 'block';
            return;
        }

        loadingMsgElement.style.display = 'block';
        const img = new Image();
        img.src = gifSrc;

        img.onload = () => {
            loadingMsgElement.style.display = 'none';
            gifImgElement.src = gifSrc;
            gifImgElement.style.display = 'block';
        };
        img.onerror = () => {
            loadingMsgElement.style.display = 'none';
            noGifMsgElement.style.display = 'block';
            console.error("Failed to load carousel GIF:", gifSrc);
        };
    }

    if (totalItems > 0) {
        if (prevButton) prevButton.addEventListener('click', prevSlide);
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        
        if (teamCarouselViewport) {
            teamCarouselViewport.addEventListener('touchstart', handleTouchStart, { passive: true });
            teamCarouselViewport.addEventListener('touchmove', handleTouchMove, { passive: true });
            teamCarouselViewport.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        
        window.addEventListener('resize', () => {
            calculateItemWidth();
            updateCarousel();
        });

        createDots();
        calculateItemWidth();
        updateCarousel(); // Initial setup
    } else {
        if(teamCarouselViewport) teamCarouselViewport.style.display = 'none'; // Hide carousel if no items
    }

    // Removed Player Modal and All Members Modal logic

    // --- Global Modal Closing Logic (No longer needed for player/allmembers modals) ---
    // Kept for potential future modals, or can be removed if no other modals exist.
    /*
    const closeModalsOnClickOutside = (event) => {
         // ... logic for other modals if any
    };
    document.addEventListener('click', closeModalsOnClickOutside);

    const closeModalsOnEscape = (event) => {
        if (event.key === 'Escape') {
            // ... logic for other modals if any
        }
    };
    document.addEventListener('keydown', closeModalsOnEscape);
    */

}); // End DOMContentLoaded