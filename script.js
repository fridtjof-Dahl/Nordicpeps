document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initScrollAnimations();
    initHeroCounters();
    initHeroParticles();
    initProductFilters();
    initStoriesCarousel();
    initFAQ();
    initContactForm();
    initFloatingCTA();
    initSmoothScroll();
});

/* ===== Preloader ===== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 800);
    });
    setTimeout(() => preloader.classList.add('hidden'), 3000);
}

/* ===== Navigation ===== */
function initNavigation() {
    const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('navMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    });

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ===== Hero Counter Animation ===== */
function initHeroCounters() {
    const counters = document.querySelectorAll('.hero-trust-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = target * eased;

        if (isDecimal) {
            el.textContent = current.toFixed(1);
        } else if (target >= 1000) {
            el.textContent = Math.floor(current).toLocaleString('nb-NO');
        } else {
            el.textContent = Math.floor(current);
        }

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

/* ===== Hero Particles ===== */
function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(particle);
    }
}

/* ===== Product Filters ===== */
function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            productCards.forEach(card => {
                const categories = card.dataset.category || '';
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.4s, transform 0.4s';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });
}

/* ===== Stories Carousel ===== */
function initStoriesCarousel() {
    const track = document.querySelector('.stories-track');
    const cards = document.querySelectorAll('.story-card');
    const prevBtn = document.querySelector('.stories-prev');
    const nextBtn = document.querySelector('.stories-next');
    const dotsContainer = document.getElementById('storiesDots');

    if (!track || !cards.length) return;

    let currentIndex = 0;
    const isMobile = window.innerWidth < 1024;
    const cardsPerView = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(cards.length / cardsPerView);

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'stories-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function goToSlide(index) {
        currentIndex = index;
        const cardWidth = cards[0].offsetWidth + 28;
        const offset = -currentIndex * cardWidth * cardsPerView;
        track.style.transform = `translateX(${offset}px)`;

        document.querySelectorAll('.stories-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
    });

    let autoplayInterval = setInterval(() => {
        goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
    }, 6000);

    track.closest('.stories-carousel').addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.closest('.stories-carousel').addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
        }, 6000);
    });

    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextBtn.click();
            else prevBtn.click();
        }
        isDragging = false;
    }, { passive: true });
}

/* ===== FAQ Accordion ===== */
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            items.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

/* ===== Contact Form ===== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = `
            <span>Sender...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
        `;
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `
                <span>Sendt!</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                </svg>
            `;
            btn.style.background = '#10B981';

            setTimeout(() => {
                form.reset();
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 2500);
        }, 1500);
    });
}

/* ===== Floating CTA ===== */
function initFloatingCTA() {
    const floatingCta = document.getElementById('floatingCta');
    if (!floatingCta) return;

    window.addEventListener('scroll', () => {
        floatingCta.classList.toggle('visible', window.scrollY > 600);
    });
}

/* ===== Smooth Scroll ===== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (!target) return;
            
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ===== Spin animation for loading ===== */
const style = document.createElement('style');
style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);
