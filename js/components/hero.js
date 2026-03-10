/**
 * Hero Component
 * Suplementos Fitness VIP
 */

export function initHero() {
    const heroContainer = document.getElementById('hero-container');

    const heroHTML = `
        <div class="hero-section">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <span class="hero-badge reveal">Elite Supplements</span>
                <h1 class="hero-title reveal">SUPLEMENTOS<br><span class="outline">FITNESS</span> <span class="green">VIP</span></h1>
                <p class="hero-subtitle reveal">Eleva tu rendimiento al siguiente nivel con calidad certificada y resultados garantizados.</p>
                <div class="hero-btns reveal">
                    <a href="#products-container" class="btn btn-primary">Ver Catálogo</a>
                    <a href="https://wa.me/yournumber" class="btn btn-outline" target="_blank">Contactar ahora</a>
                </div>
            </div>
            
            <div class="scroll-indicator reveal">
                <span>SCROLL</span>
                <div class="line"></div>
            </div>
        </div>
    `;

    heroContainer.innerHTML = heroHTML;

    const styles = `
        .hero-section {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: var(--bg-color);
            background-size: cover;
            background-position: center;
            text-align: center;
            overflow: hidden;
            border-bottom: 1px solid rgba(128, 128, 128, 0.05);
        }

        .hero-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 50% 50%, transparent 0%, var(--bg-color) 100%);
            opacity: 0.8;
            pointer-events: none;
        }

        .hero-content {
            z-index: 10;
            max-width: 900px;
            padding: 0 20px;
        }

        .hero-badge {
            display: inline-block;
            padding: 8px 20px;
            background: rgba(153, 255, 0, 0.05);
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: 100px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            margin-bottom: 30px;
            box-shadow: 0 0 20px var(--accent-glow);
        }

        .hero-title {
            font-size: clamp(3rem, 10vw, 8rem);
            line-height: 0.85;
            margin-bottom: 25px;
            color: var(--text-main);
            font-weight: 950;
            letter-spacing: -0.04em;
        }

        .outline {
            color: transparent;
            -webkit-text-stroke: 1.5px var(--text-main);
        }

        .green {
            color: var(--primary-color);
            text-shadow: 0 0 30px var(--accent-glow);
        }

        .hero-subtitle {
            font-size: clamp(1rem, 2vw, 1.25rem);
            color: var(--text-muted);
            margin-bottom: 45px;
            max-width: 650px;
            margin-inline: auto;
            line-height: 1.6;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 20px 45px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-decoration: none;
            border-radius: 100px;
            transition: var(--transition-smooth);
            font-size: 13px;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: black;
            box-shadow: 0 15px 35px var(--accent-glow);
        }

        .btn-primary:hover {
            transform: translateY(-5px) scale(1.02);
            background-color: var(--text-main);
            color: var(--bg-color);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .btn-outline {
            background-color: transparent;
            color: var(--text-main);
            border: 2px solid var(--text-main);
            margin-left: 20px;
        }

        .btn-outline:hover {
            background-color: var(--text-main);
            color: var(--bg-color);
            transform: translateY(-5px);
        }

        .scroll-indicator {
            position: absolute;
            bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            font-size: 10px;
            color: var(--text-muted);
            letter-spacing: 0.4em;
            font-weight: 800;
        }

        .hero-section::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: url("https://grainy-gradients.vercel.app/noise.svg");
            opacity: 0.03;
            pointer-events: none;
            z-index: 15;
        }

        .scroll-indicator .line {
            width: 2px;
            height: 50px;
            background: var(--primary-color);
            mask-image: linear-gradient(to bottom, black, transparent);
        }

        .hero-title, .hero-subtitle, .hero-badge {
            position: relative;
        }

        @media (max-width: 768px) {
            .btn-outline { margin-left: 0; margin-top: 15px; width: 100%; }
            .btn-primary { width: 100%; }
        }
    `;

    injectStyles(styles);
    animateHero();
    initDynamicSpotlight();
}

function injectStyles(css) {
    const head = document.head;
    const style = document.createElement('style');
    style.textContent = css;
    head.appendChild(style);
}

function animateHero() {
    gsap.to(".reveal", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out"
    });

    // Jumping animation for scroll indicator - Short and subtle
    gsap.to(".scroll-indicator", {
        y: 8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                gsap.to(scrollIndicator, { opacity: 0, pointerEvents: 'none', duration: 0.4 });
            } else {
                gsap.to(scrollIndicator, { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
            }
        });
    }
}

function initDynamicSpotlight() {
    const hero = document.querySelector('.hero-section');
    const overlay = document.querySelector('.hero-overlay');
    
    if (!hero || !overlay) return;

    // Add decorative background elements
    const bgElements = document.createElement('div');
    bgElements.className = 'hero-bg-elements';
    bgElements.innerHTML = `
        <div class="hero-blob blob-1"></div>
        <div class="hero-blob blob-2"></div>
        <div class="hero-shape shape-1"></div>
    `;
    hero.appendChild(bgElements);

    const blobStyles = `
        .hero-bg-elements {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
        }
        .hero-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.15;
            background: var(--primary-color);
        }
        .blob-1 { width: 400px; height: 400px; top: -100px; right: -100px; }
        .blob-2 { width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.1; }
        .hero-shape {
            position: absolute;
            border: 1px solid var(--primary-color);
            opacity: 0.05;
            pointer-events: none;
        }
        .shape-1 {
            width: 500px; height: 500px;
            top: 20%; left: 10%;
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            animation: morph 15s linear infinite;
        }
        @keyframes morph {
            0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg); }
            50% { border-radius: 50% 50% 30% 70% / 50% 70% 30% 50%; }
            100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(360deg); }
        }
    `;
    injectStyles(blobStyles);

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const rect = hero.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Custom property for CSS spotlight
        gsap.to(overlay, {
            background: `radial-gradient(circle at ${x}px ${y}px, transparent 0%, var(--bg-color) 80%)`,
            duration: 0.5,
            ease: "power1.out"
        });

        // Subly move blobs
        gsap.to(".blob-1", { x: (clientX/window.innerWidth - 0.5) * 50, y: (clientY/window.innerHeight - 0.5) * 50, duration: 2 });
        gsap.to(".blob-2", { x: (clientX/window.innerWidth - 0.5) * -30, y: (clientY/window.innerHeight - 0.5) * -30, duration: 2 });
    });
}
