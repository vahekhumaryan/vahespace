/**
 * Vahe Khumaryan - Portfolio Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initInteractions();
    initThreeJS();
    initCalendar();
});

/**
 * Initialize Theme & UI Interactions
 */
function initTheme() {
    // Mouse spotlight effect
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            spotlight.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
        });

        function updateSpotlight() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            spotlight.style.left = currentX + 'px';
            spotlight.style.top = currentY + 'px';
            requestAnimationFrame(updateSpotlight);
        }
        updateSpotlight();
    }

    // Current Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

/**
 * Initialize Scroll Interactions (Back to Top, Sticky CTA)
 */
function initInteractions() {
    const backToTop = document.getElementById('back-to-top');
    const stickyCTA = document.getElementById('sticky-cta');
    const heroSection = document.querySelector('.hero');
    const bookingSection = document.getElementById('book-a-call');

    let lastScrollY = window.scrollY;

    // Scroll Event Listener
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;

        // Back to Top Visibility
        if (backToTop) {
            if (currentScrollY > 500) {
                backToTop.classList.add('visible');
                backToTop.hidden = false;
            } else {
                backToTop.classList.remove('visible');
                // Delay hiding to allow animation to finish
                setTimeout(() => {
                    if (!backToTop.classList.contains('visible')) backToTop.hidden = true;
                }, 300);
            }
        }

        // Sticky CTA Visibility
        if (stickyCTA && heroSection) {
            const heroBottom = heroSection.getBoundingClientRect().bottom;

            // Show if past hero and scrolling down
            if (heroBottom < 0 && isScrollingDown) {
                stickyCTA.classList.add('visible');
                stickyCTA.hidden = false;
            }
            // Hide if near top
            else if (currentScrollY < 100) {
                stickyCTA.classList.remove('visible');
            }
            // Hide if scrolling up (optional UX choice, keeps screen clean)
            else if (!isScrollingDown) {
                // stickyCTA.classList.remove('visible'); 
            }
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // Hide Sticky CTA when reaching booking section
    if (stickyCTA && bookingSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stickyCTA.classList.remove('visible');
                }
            });
        }, { threshold: 0.1 });
        observer.observe(bookingSection);
    }

    // Back to Top Click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/**
 * Initialize Three.js Hero Animation
 */
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Dynamic import check or assume global THREE if loaded via script tag
    if (typeof THREE === 'undefined') return;

    const hero = document.querySelector('.hero');
    const heroRect = hero.getBoundingClientRect();
    const ACCENT_COLOR = 0x7ceaff;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, heroRect.width / heroRect.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(heroRect.width, heroRect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create Objects
    const geometry = new THREE.TorusKnotGeometry(1.4, 0.4, 150, 20, 2, 3);

    const material = new THREE.MeshBasicMaterial({
        color: ACCENT_COLOR,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Glow Effect
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: ACCENT_COLOR,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.set(1.05, 1.05, 1.05);
    scene.add(glow);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 4;
        particlePositions[i3] = (Math.random() - 0.5) * radius;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * radius;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * radius;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: ACCENT_COLOR,
        size: 0.04,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Animation Loop
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Normalize mouse position relative to canvas center
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;

        // Rotation
        torusKnot.rotation.x += 0.002;
        torusKnot.rotation.y += 0.003;

        // Mouse Influence
        torusKnot.rotation.x += mouseY * 0.05;
        torusKnot.rotation.y += mouseX * 0.05;

        glow.rotation.copy(torusKnot.rotation);

        // Particles
        particleSystem.rotation.y = -time * 0.2;
        particleSystem.rotation.x = Math.sin(time * 0.5) * 0.1;

        // Breathing effect
        const scale = 1 + Math.sin(time * 1.5) * 0.03;
        torusKnot.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        const newRect = hero.getBoundingClientRect();
        camera.aspect = newRect.width / newRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(newRect.width, newRect.height);
    });
}

/**
 * Initialize Google Calendar Widget
 */
function initCalendar() {
    const target = document.getElementById('calendar-button');
    if (!target) return;

    // Fallback if calendar fails to load
    const fallbackTimeout = setTimeout(() => {
        if (target.children.length === 0) {
            target.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <p style="margin-bottom: 1rem; color: var(--text-muted);">Calendar widget unavailable.</p>
                    <a href="mailto:vahevahevahe@gmail.com?subject=Book a Strategy Call" class="button button--primary">
                        Email to Book
                    </a>
                </div>
            `;
        }
    }, 4000);

    // Check for Google Calendar API
    if (window.calendar && window.calendar.schedulingButton) {
        clearTimeout(fallbackTimeout);
        window.calendar.schedulingButton.load({
            url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2iVtjuv1amu_Ez6lvKqkXq9PPpnccskOue3zxN2maVGsMWctIDSFgDeCxmkw2E8yKMtH6jTHHo?gv=true',
            color: '#7ceaff',
            label: 'Book a strategy call',
            target
        });
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}
