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
    const onScroll = debounce(() => {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }, 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Mobile menu ── */
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
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
});
