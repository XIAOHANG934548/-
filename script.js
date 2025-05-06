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


    // --- Player Modal Logic ---
    const playerModal = document.getElementById('playerModal');
    const playerModalCloseButton = playerModal ? playerModal.querySelector('.modal-close') : null;
    const playerCards = document.querySelectorAll('.player-card');
    const modalPlayerName = document.getElementById('modalPlayerName');
    const modalPlayerImage = document.getElementById('modalPlayerImage');
    const modalPlayerSkill = document.getElementById('modalPlayerSkill');
    const showTextBtn = document.getElementById('showTextBtn');
    const showGifBtn = document.getElementById('showGifBtn');
    const modalPlayerBioContainer = document.getElementById('modalPlayerBioContainer');
    const modalPlayerBioText = document.getElementById('modalPlayerBioText');
    const modalGifContainer = document.getElementById('modalGifContainer');
    const modalPlayerGif = document.getElementById('modalPlayerGif');
    const loadingMessage = document.getElementById('loadingMessage');
    const noGifMessage = document.getElementById('noGifMessage');

    let currentGifUrl = '';
    let isGifLoading = false;
    let isGifLoaded = false;

    const openPlayerModal = (playerData) => {
         if (!playerModal || !modalPlayerName || !modalPlayerImage || !modalPlayerSkill || !modalPlayerBioText) return;

        modalPlayerName.textContent = playerData.name || "[蛋仔ID]";
        modalPlayerImage.src = playerData.image || "https://via.placeholder.com/150x150/cccccc/333333?text=头像";
        modalPlayerImage.alt = `${playerData.name || '队员'}头像`;
        modalPlayerSkill.textContent = playerData.skill || "[擅长/特点]";
        modalPlayerBioText.textContent = playerData.bio || "[暂无简介]";
        currentGifUrl = playerData.gif || '';

        resetPlayerModalContentArea();
        isGifLoading = false;
        isGifLoaded = false;

        playerModal.classList.add('active');
        body.classList.add('modal-open');
        if (playerModalCloseButton) playerModalCloseButton.focus();

        if (currentGifUrl) {
            preloadGif(currentGifUrl);
        }
    };

    const closePlayerModal = () => {
        if (playerModal) playerModal.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) {
            body.classList.remove('modal-open');
        }
        if (modalPlayerGif) modalPlayerGif.src = '';
        currentGifUrl = '';
    };

    const resetPlayerModalContentArea = () => {
         if (!modalPlayerBioContainer || !modalGifContainer || !showTextBtn || !showGifBtn || !loadingMessage || !noGifMessage || !modalPlayerGif) return;

        modalPlayerBioContainer.style.display = 'block';
        modalGifContainer.style.display = 'none';
        showTextBtn.classList.add('active');
        showGifBtn.classList.remove('active');
        showTextBtn.setAttribute('aria-pressed', 'true');
        showGifBtn.setAttribute('aria-pressed', 'false');
         loadingMessage.style.display = 'none';
         noGifMessage.style.display = 'none';
         modalPlayerGif.style.display = 'none';
    };

    const preloadGif = (gifUrl) => {
         if (!gifUrl) return;
         isGifLoading = true;
         isGifLoaded = false;
         const img = new Image();
         img.src = gifUrl;

         img.onload = () => {
            isGifLoading = false;
            isGifLoaded = true;
            if (showGifBtn && showGifBtn.classList.contains('active')) {
                showGifContent();
            }
         };
         img.onerror = () => {
            isGifLoading = false;
            isGifLoaded = false;
            console.error("Failed to load GIF:", gifUrl);
            if (showGifBtn && showGifBtn.classList.contains('active')) {
                showGifContent();
            }
         };
    };

     const showTextContent = () => {
        resetPlayerModalContentArea();
     };

     const showGifContent = () => {
         if (!modalPlayerBioContainer || !modalGifContainer || !showTextBtn || !showGifBtn || !loadingMessage || !noGifMessage || !modalPlayerGif) return;

         modalPlayerBioContainer.style.display = 'none';
         modalGifContainer.style.display = 'block';
         showTextBtn.classList.remove('active');
         showGifBtn.classList.add('active');
         showTextBtn.setAttribute('aria-pressed', 'false');
         showGifBtn.setAttribute('aria-pressed', 'true');

         if (isGifLoading) {
             loadingMessage.style.display = 'block';
             modalPlayerGif.style.display = 'none';
             noGifMessage.style.display = 'none';
         } else if (isGifLoaded && currentGifUrl) {
             modalPlayerGif.src = currentGifUrl;
             loadingMessage.style.display = 'none';
             modalPlayerGif.style.display = 'block';
             noGifMessage.style.display = 'none';
         } else {
             loadingMessage.style.display = 'none';
             modalPlayerGif.style.display = 'none';
             noGifMessage.style.display = 'block';
         }
     };

    playerCards.forEach(card => {
         card.addEventListener('click', () => {
             const playerData = {
                 name: card.dataset.playerName,
                 skill: card.dataset.playerSkill,
                 image: card.dataset.playerImage,
                 bio: card.dataset.playerBio,
                 gif: card.dataset.playerGif
             };
             openPlayerModal(playerData);
         });
         card.setAttribute('tabindex', '0');
         card.addEventListener('keydown', (event) => {
             if (event.key === 'Enter' || event.key === ' ') {
                 event.preventDefault();
                 const playerData = {
                     name: card.dataset.playerName,
                     skill: card.dataset.playerSkill,
                     image: card.dataset.playerImage,
                     bio: card.dataset.playerBio,
                     gif: card.dataset.playerGif
                 };
                 openPlayerModal(playerData);
             }
         });
    });

     if (showTextBtn) showTextBtn.addEventListener('click', showTextContent);
     if (showGifBtn) showGifBtn.addEventListener('click', showGifContent);
     if (playerModalCloseButton) playerModalCloseButton.addEventListener('click', closePlayerModal);


    // --- All Members Modal Logic ---
    const allMembersModal = document.getElementById('allMembersModal');
    const allMembersBtn = document.getElementById('viewAllMembersBtn');
    const allMembersCloseButton = allMembersModal ? allMembersModal.querySelector('.modal-close') : null;
    const allMembersListContainer = document.getElementById('allMembersListContainer');

    // Hardcoded list of all members (can be updated here)
    const allMembers = [
        "白蜡" , "拌龟" , "背化学" , "背化学老公" , "波搜" , "c²" , "纯情天然呆" , "clues" , "dsnv" , "购醉" , "古煲" , "寒炀" , "好坏" , "喝胖猫" , "焦颂" , "jang&unyo" , "卡拉" , "看惯他" , "靠靠我的肩膀" , "Kcir" , "leaky" , "累泪." , "黎安有景行" , "lsta" , "萌妹品味" , "萌妹肢" , "男刁" , "#o要开心" , "陪陪妹" , "拼颖" , "钱蔷" , "青奶皇" , "桑宝好困呀！" , "少偏向" , "售誓" , "夙" , "兔灵篇" , "讨买" , "往屹" , "诬鸦" , "小少爷" , "小驷" , "携诛" , "小妍蝶" , "妍" , "耀忣" , "隐语儿" , "阴郁吻痕" , "以以" , "舆迟" , "争吹" , "🤗"
    ];
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


    // --- Global Modal Closing Logic ---
    const closeModalsOnClickOutside = (event) => {
         if (playerModal && playerModal.classList.contains('active') && event.target === playerModal) {
             closePlayerModal();
         }
         if (allMembersModal && allMembersModal.classList.contains('active') && event.target === allMembersModal) {
             closeAllMembersModal();
         }
    };
    document.addEventListener('click', closeModalsOnClickOutside);

    const closeModalsOnEscape = (event) => {
        if (event.key === 'Escape') {
            if (playerModal && playerModal.classList.contains('active')) {
                closePlayerModal();
            }
            if (allMembersModal && allMembersModal.classList.contains('active')) {
                closeAllMembersModal();
            }
        }
    };
    document.addEventListener('keydown', closeModalsOnEscape);

}); // End DOMContentLoaded