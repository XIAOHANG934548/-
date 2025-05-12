document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;

    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        if (preloader) {
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
    const carouselSlidesContainer = document.getElementById('teamCarouselSlides');
    const slides = carouselSlidesContainer ? Array.from(carouselSlidesContainer.querySelectorAll('.player-slide')) : [];
    const prevButton = document.getElementById('teamCarouselPrev');
    const nextButton = document.getElementById('teamCarouselNext');

    const focusedPlayerImage = document.getElementById('focusedPlayerImage');
    const focusedPlayerName = document.getElementById('focusedPlayerName');
    const focusedPlayerSkill = document.getElementById('focusedPlayerSkill');
    const focusedCaptainBadge = document.querySelector('.focused-captain-badge');

    const focusedShowTextBtn = document.getElementById('focusedShowTextBtn');
    const focusedShowGifBtn = document.getElementById('focusedShowGifBtn');
    const focusedPlayerBioContainer = document.getElementById('focusedPlayerBioContainer');
    const focusedPlayerBioText = document.getElementById('focusedPlayerBioText');
    const focusedGifContainer = document.getElementById('focusedGifContainer');
    const focusedPlayerGif = document.getElementById('focusedPlayerGif');
    const focusedLoadingMessage = document.getElementById('focusedLoadingMessage');
    const focusedNoGifMessage = document.getElementById('focusedNoGifMessage');

    let currentFocusedGifUrl = '';
    let isFocusedGifLoading = false;
    let isFocusedGifLoaded = false;
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function updateFocusedPlayerInfo(slide) {
        if (!slide) return;
        const playerData = {
            id: slide.dataset.playerId,
            name: slide.dataset.playerName,
            skill: slide.dataset.playerSkill,
            image: slide.dataset.playerImage,
            bio: slide.dataset.playerBio,
            gif: slide.dataset.playerGif
        };

        if (focusedPlayerImage) focusedPlayerImage.src = playerData.image || "https://via.placeholder.com/250x250/cccccc/333333?text=头像";
        if (focusedPlayerName) focusedPlayerName.textContent = playerData.name || "[蛋仔ID]";
        if (focusedPlayerSkill) focusedPlayerSkill.textContent = playerData.skill || "[擅长/特点]";
        if (focusedPlayerBioText) focusedPlayerBioText.textContent = playerData.bio || "[暂无简介]";

        if (focusedCaptainBadge) {
            focusedCaptainBadge.style.display = (playerData.id === "shaopianxiang") ? 'inline-block' : 'none';
        }

        currentFocusedGifUrl = playerData.gif || '';
        resetFocusedPlayerContentArea(); // Show bio by default
        isFocusedGifLoading = false;
        isFocusedGifLoaded = false;

        if (currentFocusedGifUrl) {
            preloadFocusedGif(currentFocusedGifUrl);
        }
    }

    function resetFocusedPlayerContentArea() {
        if (!focusedPlayerBioContainer || !focusedGifContainer || !focusedShowTextBtn || !focusedShowGifBtn || !focusedLoadingMessage || !focusedNoGifMessage || !focusedPlayerGif) return;

        focusedPlayerBioContainer.style.display = 'block';
        focusedGifContainer.style.display = 'none';
        focusedShowTextBtn.classList.add('active');
        focusedShowGifBtn.classList.remove('active');
        focusedShowTextBtn.setAttribute('aria-pressed', 'true');
        focusedShowGifBtn.setAttribute('aria-pressed', 'false');
        focusedLoadingMessage.style.display = 'none';
        focusedNoGifMessage.style.display = 'none';
        focusedPlayerGif.style.display = 'none';
        if (focusedPlayerGif) focusedPlayerGif.src = ''; // Clear previous GIF
    }

    function preloadFocusedGif(gifUrl) {
        if (!gifUrl) return;
        isFocusedGifLoading = true;
        isFocusedGifLoaded = false;
        const img = new Image();
        img.src = gifUrl;

        img.onload = () => {
            isFocusedGifLoading = false;
            isFocusedGifLoaded = true;
            if (focusedShowGifBtn && focusedShowGifBtn.classList.contains('active')) {
                showFocusedGifContent();
            }
        };
        img.onerror = () => {
            isFocusedGifLoading = false;
            isFocusedGifLoaded = false;
            console.error("Failed to load GIF for focused player:", gifUrl);
            if (focusedShowGifBtn && focusedShowGifBtn.classList.contains('active')) {
                showFocusedGifContent();
            }
        };
    }

    function showFocusedTextContent() {
        resetFocusedPlayerContentArea(); // This already sets text to visible and resets GIF state
    }

    function showFocusedGifContent() {
        if (!focusedPlayerBioContainer || !focusedGifContainer || !focusedShowTextBtn || !focusedShowGifBtn || !focusedLoadingMessage || !focusedNoGifMessage || !focusedPlayerGif) return;

        focusedPlayerBioContainer.style.display = 'none';
        focusedGifContainer.style.display = 'block';
        focusedShowTextBtn.classList.remove('active');
        focusedShowGifBtn.classList.add('active');
        focusedShowTextBtn.setAttribute('aria-pressed', 'false');
        focusedShowGifBtn.setAttribute('aria-pressed', 'true');

        if (isFocusedGifLoading) {
            focusedLoadingMessage.style.display = 'block';
            focusedPlayerGif.style.display = 'none';
            focusedNoGifMessage.style.display = 'none';
        } else if (isFocusedGifLoaded && currentFocusedGifUrl) {
            focusedPlayerGif.src = currentFocusedGifUrl;
            focusedLoadingMessage.style.display = 'none';
            focusedPlayerGif.style.display = 'block';
            focusedNoGifMessage.style.display = 'none';
        } else {
            focusedLoadingMessage.style.display = 'none';
            focusedPlayerGif.style.display = 'none';
            focusedNoGifMessage.style.display = 'block';
        }
    }

    if (focusedShowTextBtn) focusedShowTextBtn.addEventListener('click', showFocusedTextContent);
    if (focusedShowGifBtn) focusedShowGifBtn.addEventListener('click', showFocusedGifContent);


    function updateCarousel() {
        if (!carouselSlidesContainer || slides.length === 0) return;

        const slideWidth = slides[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(slides[0]).marginRight) * 2; // Assuming equal left/right margins or use margin-left + margin-right
        const totalSlideWidth = slideWidth + gap;

        // Center the active slide. Calculation needs to consider the container's width and slide widths.
        // This simple translation centers the start of the active slide; centering the middle is more complex with variable # of slides.
        // For a robust centering, you might calculate offset based on container width / 2 - slideWidth / 2
        const baseOffset = (carouselSlidesContainer.parentElement.offsetWidth / 2) - (slideWidth / 2);
        const translateXValue = baseOffset - (currentIndex * totalSlideWidth);

        carouselSlidesContainer.style.transform = `translateX(${translateXValue}px)`;

        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev-slide', 'next-slide');
            if (index === currentIndex) {
                slide.classList.add('active');
            } else if (index === currentIndex - 1) {
                slide.classList.add('prev-slide');
            } else if (index === currentIndex + 1) {
                slide.classList.add('next-slide');
            }
        });

        updateFocusedPlayerInfo(slides[currentIndex]);
    }


    function goToSlide(index) {
        if (slides.length === 0) return;
        currentIndex = (index + slides.length) % slides.length; // Loop
        updateCarousel();
    }

    if (slides.length > 0) {
        if (prevButton) prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
        if (nextButton) nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));

        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                if (index !== currentIndex) {
                    goToSlide(index);
                }
            });
        });

        // Swipe functionality
        if (carouselSlidesContainer) {
            carouselSlidesContainer.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carouselSlidesContainer.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
        }

        // Initial setup
        goToSlide(0); // Start with the first player
        window.addEventListener('resize', updateCarousel); // Adjust on resize
    }

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum pixels for a swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            goToSlide(currentIndex + 1); // Swiped left
        } else if (touchEndX > touchStartX + swipeThreshold) {
            goToSlide(currentIndex - 1); // Swiped right
        }
    }


    // --- All Members Modal Logic (remains mostly the same) ---
    const allMembersModal = document.getElementById('allMembersModal');
    const allMembersBtn = document.getElementById('viewAllMembersBtn');
    const allMembersCloseButton = allMembersModal ? allMembersModal.querySelector('.modal-close') : null;
    const allMembersListContainer = document.getElementById('allMembersListContainer');

    const allMembers = [
        "白蜡", "拌龟", "背化学", "背化学前夫", "波搜", "c²", "缠协", "clues", "dsnv", "寒炀 捂瓜", "好坏", "喝胖猫", "焦颂", "接驾", "卡拉", "看惯他", "靠靠我的肩膀", "Kcir", "leaky", "累泪.", "勒蠡", "黎安有景行", "lsta", "妹儿哟", "萌的罪", "萌妹品味", "萌妹肢", "讴只", "#o要开心", "拼颖", "钱蔷", "青奶皇", "秋庋（要叫小秋奶奶）", "s", "桑宝好困呀！", "嫂子开门，我是我哥", "少偏向（陨落版", "事议", "售誓", "讨买", "体美劳", "偷偷幻想", "T~T", "兔灵篇", "往屹", "诬鸦", "小奩", "小驷", "小妍蝶", "幸运", "携诛", "妍", "隐语儿", "阴郁吻痕", "舆迟", "昱急", "以以", "耀忣", "择鬼", "Zeo", "争吹", "住歪", "ZzzA",];
    const uniqueSortedMembers = [...new Set(allMembers)].sort((a, b) => a.localeCompare(b, 'zh-CN'));


    const populateAllMembersList = () => {
        if (!allMembersListContainer) return;
        allMembersListContainer.innerHTML = '';
        uniqueSortedMembers.forEach(memberName => {
            const item = document.createElement('div');
            item.className = 'member-item-small';
            const avatar = document.createElement('div');
            avatar.className = 'member-avatar-small';
            const initial = (typeof memberName === 'string' && memberName.length > 0) ? memberName.charAt(0) : '?';
            avatar.textContent = initial;
            avatar.title = memberName;
            const nameDiv = document.createElement('div');
            nameDiv.className = 'member-name-small';
            nameDiv.textContent = memberName;
            item.appendChild(avatar);
            item.appendChild(nameDiv);
            allMembersListContainer.appendChild(item);
        });
    };

    const openAllMembersModal = () => {
        if (!allMembersModal) return;
        populateAllMembersList();
        allMembersModal.classList.add('active');
        body.classList.add('modal-open');
        if (allMembersCloseButton) allMembersCloseButton.focus();
    };

    const closeAllMembersModal = () => {
        if (allMembersModal) allMembersModal.classList.remove('active');
        // Check if any other modal is active before removing body class
        if (!document.querySelector('.modal-overlay.active')) {
            body.classList.remove('modal-open');
        }
    };

    if (allMembersBtn) {
        allMembersBtn.addEventListener('click', openAllMembersModal);
    }
    if (allMembersCloseButton) {
        allMembersCloseButton.addEventListener('click', closeAllMembersModal);
    }


    // --- Global Modal Closing Logic (now only for allMembersModal) ---
    const closeModalsOnClickOutside = (event) => {
        if (allMembersModal && allMembersModal.classList.contains('active') && event.target === allMembersModal) {
            closeAllMembersModal();
        }
    };
    document.addEventListener('click', closeModalsOnClickOutside);

    const closeModalsOnEscape = (event) => {
        if (event.key === 'Escape') {
            if (allMembersModal && allMembersModal.classList.contains('active')) {
                closeAllMembersModal();
            }
        }
    };
    document.addEventListener('keydown', closeModalsOnEscape);

}); // End DOMContentLoaded