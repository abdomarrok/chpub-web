import { CONFIG } from './config.js';

// Utilities
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer for scroll animations
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // will-change management to optimize performance as requested
    revealElements.forEach(el => {
        el.addEventListener('transitionstart', () => {
            el.style.willChange = 'opacity, transform';
        });
        el.addEventListener('transitionend', () => {
            el.style.willChange = 'auto';
        });
    });

    // Populate Contact Section from CONFIG
    if (document.getElementById('contact-address')) {
        document.getElementById('contact-address').textContent = CONFIG.agency.address;
        document.getElementById('contact-phone1').textContent = CONFIG.agency.phone1;
        document.getElementById('contact-phone2').textContent = CONFIG.agency.phone2;
        document.getElementById('contact-email').textContent = CONFIG.agency.email;
        document.getElementById('contact-hours').textContent = CONFIG.agency.hours;
        
        const tkLink = document.getElementById('link-tiktok');
        if (CONFIG.agency.social.tiktok) {
            tkLink.href = CONFIG.agency.social.tiktok;
            tkLink.style.display = 'inline-flex';
        } else {
            tkLink.style.display = 'none';
        }
        
        const fbLink = document.getElementById('link-facebook');
        if (CONFIG.agency.social.facebook) {
            fbLink.href = CONFIG.agency.social.facebook;
            fbLink.style.display = 'inline-flex';
        } else {
            fbLink.style.display = 'none';
        }

        const agencyShortName = CONFIG.agency.name.split('—')[0].trim();
        document.getElementById('footer-agency-name').textContent = agencyShortName;
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
    
    // Mobile menu logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', isOpen);
        });
        
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
});
