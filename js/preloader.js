/**
 * preloader.js - Handles the initial page loading state
 */
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    
    // Minimum wait time to ensure the animation is seen
    const minWaitTime = 1500; 
    const startTime = Date.now();

    window.addEventListener('load', () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minWaitTime - elapsedTime);

        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
                document.body.classList.add('loaded');
                
                // Remove from DOM after transition
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 800);
            }
        }, remainingTime);
    });
    
    // Fallback: hide if it takes too long
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
            document.body.classList.add('loaded');
        }
    }, 5000);
});
