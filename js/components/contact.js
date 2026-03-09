/* Contact Section Animations */
export function initContactAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Sections reveal
        if (gsap.utils.toArray(".contact-info h2").length) {
            gsap.from(".contact-info h2", {
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 85%",
                    once: true
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        }

        // No animation for contact items (User request)

        if (gsap.utils.toArray(".contact-brand").length) {
            gsap.from(".contact-brand", {
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 80%",
                    once: true
                },
                opacity: 0,
                scale: 0.9,
                duration: 1,
                ease: "power2.out"
            });
        }

        if (gsap.utils.toArray(".contact-map").length) {
            gsap.from(".contact-map", {
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 70%",
                    once: true
                },
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            });
        }

        // Re-refresh after a small delay to ensure Lenis/DOM are ready
        setTimeout(() => ScrollTrigger.refresh(), 500);
    }
}
