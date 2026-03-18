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
    const originalText = btn.textContent;
    
    btn.textContent = 'กำลังส่ง...';
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
            btn.textContent = '✓ ส่งข้อมูลสำเร็จ!';
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
        btn.textContent = '✗ เกิดข้อผิดพลาด ลองอีกครั้ง';
        btn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
        btn.style.opacity = '1';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
});
