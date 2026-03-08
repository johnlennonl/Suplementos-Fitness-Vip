/* Contact Section Animations */
export function initContactAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Sections reveal
        gsap.from(".contact-info h2", {
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        });

        gsap.from(".contact-item", {
            scrollTrigger: {
                trigger: ".contact-details",
                start: "top 85%",
            },
            x: -30,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out"
        });

        gsap.from(".contact-map", {
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 70%",
            },
            scale: 0.8,
            opacity: 0,
            duration: 1.2,
            ease: "expo.out"
        });
    }
}
