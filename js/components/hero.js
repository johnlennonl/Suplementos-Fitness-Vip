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
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('img/hero-placeholder.jpg');
            background-size: cover;
            background-position: center;
            text-align: center;
            overflow: hidden;
        }

        .hero-content {
            z-index: 10;
            max-width: 900px;
            padding: 0 20px;
        }

        .hero-badge {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(153, 255, 0, 0.1);
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: 100px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 30px;
        }

        .hero-title {
            font-size: clamp(3rem, 10vw, 8rem);
            line-height: 0.9;
            margin-bottom: 30px;
        }

        .outline {
            color: transparent;
            -webkit-text-stroke: 1px white;
        }

        .green {
            color: var(--primary-color);
        }

        .hero-subtitle {
            font-size: clamp(1rem, 2vw, 1.2rem);
            color: var(--text-muted);
            margin-bottom: 40px;
            max-width: 600px;
            margin-inline: auto;
        }

        .btn {
            display: inline-block;
            padding: 18px 40px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-decoration: none;
            border-radius: var(--border-radius);
            transition: var(--transition-smooth);
            font-size: 14px;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: black;
            box-shadow: 0 0 20px var(--accent-glow);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            background-color: white;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
        }

        .btn-outline {
            background-color: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-left: 15px;
        }

        .btn-outline:hover {
            background-color: white;
            color: black;
            border-color: white;
        }

        .scroll-indicator {
            position: absolute;
            bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            font-size: 10px;
            color: var(--text-muted);
            letter-spacing: 0.3em;
            transition: opacity 0.3s ease;
        }

        .scroll-indicator .line {
            width: 1px;
            height: 60px;
            background: linear-gradient(to bottom, var(--primary-color), transparent);
        }

        @media (max-width: 768px) {
            .btn-outline { margin-left: 0; margin-top: 15px; width: 100%; }
            .btn-primary { width: 100%; }
        }
    `;

    injectStyles(styles);
    animateHero();
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

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }
}
