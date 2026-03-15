/**
 * main.js — Navigation, Scroll Events, IntersectionObserver, Contact Population
 * Plain script — no ES module. CONFIG is global from config.js.
 *
 * Responsibilities:
 * - Mobile menu toggle with accessibility
 * - Header scroll effect (background blur)
 * - Intersection observer for reveal animations
 * - Populate contact header/footer from CONFIG
 * - Social link visibility based on CONFIG
 */

'use strict';

/**
 * Debounce function to limit function execution frequency
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

document.addEventListener('DOMContentLoaded', () => {

    /* ── Reveal on scroll ── */
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.willChange = 'opacity, transform';
                entry.target.classList.add('active');
                entry.target.addEventListener('transitionend', () => {
                    entry.target.style.willChange = 'auto';
                }, { once: true });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));

    /* ── Nav: scrolled class ── */
    const header = document.querySelector('.site-header');
    const updateHeader = () => {
        header?.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // Initial check

    /* ── Mobile menu ── */
    const menuBtn = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', String(!isOpen));
            mainNav.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link click
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('open');
                document.body.classList.remove('menu-open');
            });
        });
    }

    /* ── Magnetic Buttons ── */
    const magneticBtns = document.querySelectorAll('.magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const bound = btn.getBoundingClientRect();
            const x = e.clientX - bound.left - bound.width / 2;
            const y = e.clientY - bound.top - bound.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });

    /* ── Portfolio Filtering ── */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            portfolioItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 400);
                }
            });
        });
    });

    /* ── Animated Counters ── */
    const counters = document.querySelectorAll('.counter-value');
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 2000; // 2 seconds
            const increment = target / (speed / 16); // 60fps approx

            let count = 0;
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    counter.textContent = Math.ceil(count);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target;
                }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                statsObserver.unobserve(statsSection);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    /* ── Populate contact from CONFIG ── */
    /**
     * Set text content of an element by ID
     * @param {string} id - Element ID
     * @param {string|number} val - Value to set as textContent
     */
    const set = (id, val) => { 
        const el = document.getElementById(id); 
        if (el) el.textContent = val; 
    };

    set('contact-address', CONFIG.agency.address);
    set('contact-phone1',  CONFIG.agency.phone1);
    set('contact-phone2',  CONFIG.agency.phone2);
    set('contact-email',   CONFIG.agency.email);
    set('contact-hours',   CONFIG.agency.hours);
    set('footer-agency-name', CONFIG.agency.name.split('—')[0].trim());
    set('current-year', new Date().getFullYear());

    const tkLink = document.getElementById('link-tiktok');
    if (tkLink) {
        if (CONFIG.agency.social.tiktok) {
            tkLink.href = CONFIG.agency.social.tiktok;
            tkLink.style.display = 'inline-flex';
        } else {
            tkLink.style.display = 'none';
        }
    }

    const fbLink = document.getElementById('link-facebook');
    if (fbLink) {
        if (CONFIG.agency.social.facebook) {
            fbLink.href = CONFIG.agency.social.facebook;
            fbLink.style.display = 'inline-flex';
        } else {
            fbLink.style.display = 'none';
        }
    }

    const igLink = document.getElementById('link-instagram');
    if (igLink) {
        if (CONFIG.agency.social.instagram) {
            igLink.href = CONFIG.agency.social.instagram;
            igLink.style.display = 'inline-flex';
        } else {
            igLink.style.display = 'none';
        }
    }
});
