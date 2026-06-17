const topBtn = document.getElementById('topBtn');
const sections = document.querySelectorAll('section, header');
const navLi = document.querySelectorAll('.nav-links a');

// ── Mobile drawer-nav state/elements ────────────────────────────────
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navBackdrop  = document.getElementById('navBackdrop');
let menuOpen = false;
let pendingMenuOpen = false;

// ── Typing cursor effect ──────────────────────────────────────────
const words = ["Aspiring Full Stack Developer", "Passionate Web Developer", "CS Student @ JNTU Kakinada"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const element = document.getElementById("job-title");

function typeEffect() {
    if (!element) return;
    const current = words[wordIndex];
    if (isDeleting) {
        element.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        element.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex === current.length) {
        speed = 1800;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 400;
    }
    setTimeout(typeEffect, speed);
}
typeEffect();

// ── Particle canvas background ────────────────────────────────────
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1
    };
}

for (let i = 0; i < 110; i++) particles.push(createParticle());

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    // Draw subtle connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(251, 146, 60, ${0.06 * (1 - dist / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(drawParticles);
}
drawParticles();

// ── Scroll reveal ─────────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));



function openMenu() {
    if (!hamburgerBtn) return;
    menuOpen = true;
    hamburgerBtn.classList.add('open');
    const navLinksEl = document.querySelector('.nav-links');
    if (navLinksEl) {
        navLinksEl.classList.remove('open');
        void navLinksEl.offsetWidth; // restart the scan-line/item animations each time it opens
        navLinksEl.classList.add('open');
    }
    if (navBackdrop) navBackdrop.classList.add('open');
}

function closeMenu() {
    if (!hamburgerBtn) return;
    menuOpen = false;
    hamburgerBtn.classList.remove('open');
    const navLinksEl = document.querySelector('.nav-links');
    if (navLinksEl) navLinksEl.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
}

function toggleMenu() {
    if (window.innerWidth > 768) return; // desktop nav doesn't use the drawer

    if (!document.body.classList.contains('scrolled')) {
        // Locked: the photo hasn't finished morphing into the logo yet.
        // Nudge the page down so it does, then open once it has.
        pendingMenuOpen = true;
        window.scrollTo({ top: 300, behavior: 'smooth' });
        return;
    }

    menuOpen ? closeMenu() : openMenu();
}

if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMenu);
}

navLi.forEach(link => {
    link.addEventListener('click', () => {
        navLi.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        closeMenu();
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
});

function filterProjects(category) {
    const items = document.querySelectorAll('.project-item');
    const buttons = document.querySelectorAll('.filter-link');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function redirectToLinkedIn() {
    window.open('https://www.linkedin.com/in/k-jagadeesh-138670321/', '_blank');
}

// ── Butter-smooth profile img → navbar logo animation ─────────────
const profileImg  = document.getElementById('profileImg');
const heroSlot    = document.getElementById('heroImgSlot');
const logoSlot    = document.querySelector('.logo-avatar-placeholder');

// Move the profile image to be a direct child of <body>.
// Reason: <section> elements have "position: relative; z-index: 1"
// (to sit above the particle canvas), which creates a stacking context.
// That traps the image's z-index:9999 *inside* the section instead of
// the page root, so it was rendering behind the fixed header (z-index:1000)
// once it scrolled into the navbar area. Moving it to <body> lets its
// z-index compete directly with the header's, fixing the overlap.
if (profileImg && profileImg.parentNode !== document.body) {
    document.body.appendChild(profileImg);
}

// Sizes
const HERO_SIZE   = 320;
const NAV_SIZE    = 35;
const HERO_RADIUS = 24;
const NAV_RADIUS  = 6;

// Current animated values (start at hero)
let cur = { x: 0, y: 0, size: HERO_SIZE, radius: HERO_RADIUS, shadow: 1 };
let initialized = false;

function getHeroRect() {
    return heroSlot ? heroSlot.getBoundingClientRect() : null;
}
function getNavRect() {
    return logoSlot ? logoSlot.getBoundingClientRect() : null;
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Ease in-out cubic
function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

// scroll progress: 0 = hero, 1 = fully in navbar
// transition zone: scrollY 0–180px
function scrollProgress() {
    return Math.min(Math.max(window.scrollY / 180, 0), 1);
}

let rafId = null;

function animateImg() {
    if (!profileImg) return;

    const heroRect = getHeroRect();
    const navRect  = getNavRect();
    if (!heroRect || !navRect) { rafId = requestAnimationFrame(animateImg); return; }

    // Initialise cur to hero position on first frame
    if (!initialized) {
        cur.x      = heroRect.left + (heroRect.width  - HERO_SIZE) / 2;
        cur.y      = heroRect.top  + (heroRect.height - HERO_SIZE) / 2;
        cur.size   = HERO_SIZE;
        cur.radius = HERO_RADIUS;
        initialized = true;
    }

    const p = ease(scrollProgress());

    const targetX      = lerp(heroRect.left + (heroRect.width  - HERO_SIZE) / 2,
                               navRect.left  + (navRect.width   - NAV_SIZE)  / 2, p);
    const targetY      = lerp(heroRect.top  + (heroRect.height - HERO_SIZE) / 2,
                               navRect.top   + (navRect.height  - NAV_SIZE)  / 2, p);
    const targetSize   = lerp(HERO_SIZE,   NAV_SIZE,   p);
    const targetRadius = lerp(HERO_RADIUS, NAV_RADIUS, p);

    // Smooth lerp toward target (0.18 = smoothing factor)
    const s = 0.18;
    cur.x      = lerp(cur.x,      targetX,      s);
    cur.y      = lerp(cur.y,      targetY,      s);
    cur.size   = lerp(cur.size,   targetSize,   s);
    cur.radius = lerp(cur.radius, targetRadius, s);

    profileImg.style.left         = cur.x + 'px';
    profileImg.style.top          = cur.y + 'px';
    profileImg.style.width        = cur.size + 'px';
    profileImg.style.height       = cur.size + 'px';
    profileImg.style.borderRadius = cur.radius + 'px';

    // Interpolate box-shadow: big hero shadow → accent ring in nav
    const shadowBlur   = lerp(32, 8, p);
    const shadowAlpha  = lerp(0.5, 0.3, p);
    const ringSize     = lerp(0, 2, p);
    const ringAlpha    = lerp(0, 1, p);
    profileImg.style.boxShadow = `0 0 0 ${ringSize.toFixed(1)}px rgba(251,146,60,${ringAlpha.toFixed(2)}), 0 4px ${shadowBlur.toFixed(0)}px rgba(0,0,0,${shadowAlpha.toFixed(2)})`;

    // LinkedIn click only when mostly in nav
    const wasUnlocked = document.body.classList.contains('scrolled');
    if (p > 0.85) {
        profileImg.onclick = redirectToLinkedIn;
        profileImg.style.cursor = 'pointer';
        document.body.classList.add('scrolled');
        if (!wasUnlocked && pendingMenuOpen) {
            pendingMenuOpen = false;
            setTimeout(openMenu, 160);
        }
    } else {
        profileImg.onclick = null;
        profileImg.style.cursor = 'default';
        document.body.classList.remove('scrolled');
        if (wasUnlocked && menuOpen) closeMenu();
    }

    rafId = requestAnimationFrame(animateImg);
}

animateImg();

window.addEventListener('scroll', () => {
    // Top button
    if (topBtn) {
        topBtn.style.display = document.documentElement.scrollTop > 300 ? 'block' : 'none';
    }

    // Active nav highlight
    let current = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 150) {
            current = section.getAttribute('id');
        }
    });
    navLi.forEach(a => {
        const isCurrent = a.getAttribute('href') === `#${current}`;
        a.style.color = isCurrent
            ? 'var(--text-main)'
            : 'var(--text-muted)';
        a.classList.toggle('active', isCurrent);
    });
});



if (topBtn) {
    topBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for reaching out! (Frontend validation successfully executed)');
        this.reset();
    });
}



const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});
