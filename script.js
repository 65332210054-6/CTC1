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

// ===== Portfolio Data & Slider =====
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
        link: 'https://itsm-1.pages.dev/welcome'
    }
];

let currentSlide = 0;
let itemsPerView = 3;

function renderPortfolio() {
    console.log('Rendering portfolio...');
    const track = document.getElementById('portfolioTrack');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track || !dotsContainer) {
        console.error('Track or dots container not found!', { track, dotsContainer });
        return;
    }

    const lang = localStorage.getItem('preferredLang') || 'th';
    console.log('Current lang:', lang);

    if (!translations[lang]) {
        console.error('Translations for lang not found:', lang);
        return;
    }

    // Render Cards
    track.innerHTML = projectsData.map(project => {
        console.log('Rendering project:', project.id);
        return `
            <div class="portfolio-card fade-in">
                <a href="${project.link}" target="_blank" class="portfolio-card-inner">
                    <div class="portfolio-image">
                        <img src="${project.image}" alt="${translations[lang][project.titleKey]}" loading="lazy">
                        <div class="portfolio-overlay">
                            <span class="portfolio-category">${project.category}</span>
                            <h3>${translations[lang][project.titleKey]}</h3>
                            <p>${translations[lang][project.descKey]}</p>
                            <span class="view-project-btn">
                                <span>${translations[lang]['portfolio_view_project']}</span>
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Re-observe new cards for fade-in effect
    if (typeof observer !== 'undefined') {
        track.querySelectorAll('.portfolio-card').forEach((el, i) => {
            el.style.transitionDelay = `${(i % 6) * 0.1}s`;
            observer.observe(el);
            // Manually add visible class if already in view or just to test
            setTimeout(() => el.classList.add('visible'), 100);
        });
    }

    // Render Dots
    updateItemsPerView();
    const dotsCount = Math.max(0, projectsData.length - itemsPerView + 1);
    console.log('Dots count:', dotsCount);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (i === currentSlide) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentSlide = i;
            updateSlider();
        });
        dotsContainer.appendChild(dot);
    }

    updateSlider();
}

function updateItemsPerView() {
    if (window.innerWidth < 768) {
        itemsPerView = 1;
    } else if (window.innerWidth < 1024) {
        itemsPerView = 2;
    } else {
        itemsPerView = 3;
    }
}

function updateSlider() {
    const track = document.getElementById('portfolioTrack');
    const dots = document.querySelectorAll('.slider-dot');
    if (!track) return;

    const gap = 30; // Matches CSS gap
    const sliderWidth = track.parentElement.offsetWidth;
    const cardWidth = (sliderWidth - (gap * (itemsPerView - 1))) / itemsPerView;
    const move = currentSlide * (cardWidth + gap);

    track.style.transform = `translateX(-${move}px)`;

    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });

    // Update buttons state
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= projectsData.length - itemsPerView;
    }
}



// Initialize Slider Controls
document.addEventListener('DOMContentLoaded', () => {
    // renderPortfolio(); // Already called by updateLanguage

    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSlide < projectsData.length - itemsPerView) {
                currentSlide++;
                updateSlider();
            }
        });
    }

    // Touch Support
    let startX = 0;
    let isDragging = false;
    const slider = document.querySelector('.portfolio-slider');

    if (slider) {
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentSlide < projectsData.length - itemsPerView) {
                    currentSlide++;
                } else if (diff < 0 && currentSlide > 0) {
                    currentSlide--;
                }
                updateSlider();
                isDragging = false;
            }
        });

        slider.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
});

window.addEventListener('resize', () => {
    const oldItemsPerView = itemsPerView;
    updateItemsPerView();
    if (oldItemsPerView !== itemsPerView) {
        // Recalculate dots and reset slide if needed
        const dotsCount = Math.max(0, projectsData.length - itemsPerView + 1);
        if (currentSlide >= dotsCount) currentSlide = Math.max(0, dotsCount - 1);
        renderPortfolio();
    } else {
        updateSlider();
    }
});


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
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
    });
});

// ===== Counter Animation =====
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
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
            // Animate counters when hero stats are visible
            if (entry.target.closest('.hero')) animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in to animated elements
document.querySelectorAll(
    '.service-card, .portfolio-card, .process-step, .testimonial-card, .about-content, .about-image, .contact-form, .contact-info, .cta-card, .hero-content, .hero-image'
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

// ===== Contact Form — ส่งข้อมูลไปที่ Email ผ่าน FormSubmit.co =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const btn = form.querySelector('button[type="submit"]');
    const lang = localStorage.getItem('preferredLang') || 'th';
    const originalText = btn.textContent;
    
    btn.textContent = lang === 'en' ? 'Sending...' : 'กำลังส่ง...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // สร้าง JSON object จากข้อมูลในฟอร์ม
    const formData = new FormData(form);
    const jsonData = {};
    formData.forEach((value, key) => { jsonData[key] = value; });

    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
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
    const acceptBtn = document.getElementById('accept-cookies');
    
    // Check if user has already accepted previously
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        if(typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }
    }

    if (cookieBanner && acceptBtn) {
        // Check if user has already accepted
        if (!localStorage.getItem('cookiesAccepted')) {
            // Delay showing the banner for a better UX
            setTimeout(() => {
                cookieBanner.classList.remove('hidden');
            }, 1000);
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.add('hidden');
            
            // Update GA consent when accepted
            if(typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            }
        });
    }
});

// Initial language update (called at the end to ensure all components are ready)
updateLanguage(localStorage.getItem('preferredLang') || 'th');
