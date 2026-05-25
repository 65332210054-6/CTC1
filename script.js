// ===== Language Switcher =====
const langBtns = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-i18n]');

function updateLanguage(lang) {
    translatableElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else if (el.tagName === 'META' && el.name === 'description') {
                el.content = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // Update dynamic portfolio content if it exists
    if (document.getElementById('portfolioTrack')) {
        renderPortfolio();
    }

    // Update active button state
    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Save preference
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
}

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        updateLanguage(lang);
    });
});

// Initialize language
const savedLang = localStorage.getItem('preferredLang') || 'th';

// ===== Portfolio Data & Infinite Circular Carousel =====
const projectsData = [
    {
        id: 'gym',
        image: 'images/portfolio-gym.png',
        category: 'Fitness & Health',
        titleKey: 'portfolio_gym_title',
        descKey: 'portfolio_gym_desc',
        link: 'https://gym-demo-five-plum.vercel.app/'
    },
    {
        id: 'cafe',
        image: 'images/portfolio-cafe.png',
        category: 'Food & Beverage',
        titleKey: 'portfolio_cafe_title',
        descKey: 'portfolio_cafe_desc',
        link: 'https://cafe-demo-j2ji1jzn0-65332210054-6s-projects.vercel.app/th'
    },
    {
        id: 'itsm',
        image: 'images/portfolio-itsm.png',
        category: 'Software System',
        titleKey: 'portfolio_itsm_title',
        descKey: 'portfolio_itsm_desc',
        link: 'https://1458ebb9.itsm-1.pages.dev/welcome'
    }
];

let currentSlide = 0;       // 0-based index into projectsData
let isTransitioning = false;

function getPeek() {
    const vw = window.innerWidth;
    if (vw < 640) return 32;
    if (vw < 1024) return 80;
    return Math.round(vw * 0.18); // ~18% each side → card ≈ 64% of viewport
}

// Build HTML for a single card
function buildCardHTML(project, lang) {
    const title     = translations[lang][project.titleKey];
    const desc      = translations[lang][project.descKey];
    const viewLabel = translations[lang]['portfolio_view_project'];
    return `
        <div class="portfolio-card visible">
            <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="portfolio-card-inner">
                <div class="portfolio-image">
                    <img src="${project.image}" alt="${title}" loading="eager">
                    <div class="portfolio-overlay">
                        <span class="portfolio-category">${project.category}</span>
                        <h3>${title}</h3>
                        <p>${desc}</p>
                        <span class="view-project-btn">${viewLabel}</span>
                    </div>
                </div>
            </a>
        </div>`;
}

function renderPortfolio() {
    const track        = document.getElementById('portfolioTrack');
    const navContainer = document.getElementById('portfolioNav');
    if (!track || !navContainer) return;

    const lang = localStorage.getItem('preferredLang') || 'th';
    if (!translations[lang]) return;

    const N = projectsData.length;

    // Infinite loop layout:
    // [clone of last card] [card 0] [card 1] ... [card N-1] [clone of first card]
    // Real card i is at track index i+1
    const cloneLast  = buildCardHTML(projectsData[N - 1], lang);
    const realCards  = projectsData.map(p => buildCardHTML(p, lang)).join('');
    const cloneFirst = buildCardHTML(projectsData[0], lang);
    track.innerHTML  = cloneLast + realCards + cloneFirst;

    // Counter pill — always enabled (no disabled state, it's infinite)
    navContainer.innerHTML = `
        <div class="portfolio-counter-pill">
            <button class="counter-btn counter-prev" aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="counter-text">${currentSlide + 1} / ${N}</span>
            <button class="counter-btn counter-next" aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
        </div>`;

    navContainer.querySelector('.counter-prev').addEventListener('click', () => {
        if (!isTransitioning) goToSlide(currentSlide - 1);
    });
    navContainer.querySelector('.counter-next').addEventListener('click', () => {
        if (!isTransitioning) goToSlide(currentSlide + 1);
    });

    // Initial position without animation
    updateSlider(false);
}

// Navigate: virtualSlide can be -1 (→ clone of last) or N (→ clone of first)
function goToSlide(virtualSlide) {
    const N = projectsData.length;
    isTransitioning = true;
    currentSlide = virtualSlide;
    updateSlider(true);

    // After transition ends, snap to the real card without animation
    setTimeout(() => {
        if (currentSlide < 0) {
            // Showing clone-of-last (track index 0) → snap to real last (track index N)
            currentSlide = N - 1;
            updateSlider(false);
        } else if (currentSlide >= N) {
            // Showing clone-of-first (track index N+1) → snap to real first (track index 1)
            currentSlide = 0;
            updateSlider(false);
        }
        isTransitioning = false;
    }, 820); // slightly longer than the 800ms CSS transition
}

function updateSlider(animate = true) {
    const track = document.getElementById('portfolioTrack');
    if (!track) return;

    const N         = projectsData.length;
    const vw        = window.innerWidth;
    const gap       = 24;
    const peek      = getPeek();
    const cardWidth = vw - 2 * peek;

    // Apply width to all cards including clones
    track.querySelectorAll('.portfolio-card').forEach(card => {
        card.style.flex = `0 0 ${cardWidth}px`;
    });

    // Track index: real card i → track index i+1 (clone-of-last is at index 0)
    // Virtual slide -1 → track index 0 | slide N → track index N+1
    const trackIndex = currentSlide + 1;
    const move       = trackIndex * (cardWidth + gap) - peek;

    track.style.transition = animate
        ? 'transform 0.8s cubic-bezier(0.34, 1.25, 0.64, 1)'
        : 'none';
    track.style.transform = `translateX(${-move}px)`;

    // Counter always shows 1-based real position
    const displayIndex = ((currentSlide % N) + N) % N;
    const counterText  = document.querySelector('.counter-text');
    if (counterText) counterText.textContent = `${displayIndex + 1} / ${N}`;
}

// Touch swipe support + resize handler
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.portfolio-slider');
    if (slider) {
        let startX = 0, isDragging = false;
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });
        slider.addEventListener('touchmove', (e) => {
            if (!isDragging || isTransitioning) return;
            const diff = startX - e.touches[0].clientX;
            if (Math.abs(diff) > 50) {
                goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
                isDragging = false;
            }
        }, { passive: true });
        slider.addEventListener('touchend', () => { isDragging = false; });
    }
});

window.addEventListener('resize', () => { updateSlider(false); });


// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
        const top    = section.offsetTop;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        const link   = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
    });
});

// ===== Counter Animation =====
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
        const target   = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed  = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// ===== Scroll Animations =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.closest('.hero')) animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in to animated elements
document.querySelectorAll(
    '.service-card, .process-step, .testimonial-card, .about-content, .about-image, .contact-form, .contact-info, .cta-card, .hero-content, .hero-image'
).forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 6) * 0.1}s`;
    observer.observe(el);
});

// ===== Smooth scroll for all anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const btn  = form.querySelector('button[type="submit"]');
    const lang = localStorage.getItem('preferredLang') || 'th';
    const originalText = btn.textContent;

    btn.textContent = lang === 'en' ? 'Sending...' : 'กำลังส่ง...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const formData = new FormData(form);
    const jsonData = {};
    formData.forEach((value, key) => { jsonData[key] = value; });

    fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            btn.textContent = lang === 'en' ? '✓ Success!' : '✓ ส่งข้อมูลสำเร็จ!';
            btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
            btn.style.opacity = '1';
            form.reset();
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        } else {
            throw new Error(data.message || 'Server error');
        }
    })
    .catch(error => {
        console.error('Form error:', error);
        btn.textContent = lang === 'en' ? '✗ Error, try again' : '✗ เกิดข้อผิดพลาด ลองอีกครั้ง';
        btn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
        btn.style.opacity = '1';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
});

// ===== Cookie Consent Banner =====
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn    = document.getElementById('accept-cookies');

    if (localStorage.getItem('cookiesAccepted') === 'true') {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'granted', 'ad_user_data': 'granted',
                'ad_personalization': 'granted', 'analytics_storage': 'granted'
            });
        }
    }

    if (cookieBanner && acceptBtn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => { cookieBanner.classList.remove('hidden'); }, 1000);
        }
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.add('hidden');
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted', 'ad_user_data': 'granted',
                    'ad_personalization': 'granted', 'analytics_storage': 'granted'
                });
            }
        });
    }
});

// Initial language update (called at the end to ensure all components are ready)
updateLanguage(localStorage.getItem('preferredLang') || 'th');
