/**
 * Theme Toggle Component (Light/Dark Mode)
 * Suplementos Fitness VIP
 */

export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    injectToggleButton();
}

function injectToggleButton() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-nav';
    toggleBtn.setAttribute('aria-label', 'Cambiar Tema');
    toggleBtn.innerHTML = `
        <i class="fas fa-sun sun-icon"></i>
        <i class="fas fa-moon moon-icon"></i>
    `;

    // Insert before cart icon
    const cartBtn = document.getElementById('nav-cart-btn');
    navActions.insertBefore(toggleBtn, cartBtn);

    toggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        // Add a nice animation or feedback
        gsap.fromTo(toggleBtn.querySelectorAll('i'), 
            { rotation: 0, scale: 0.5, opacity: 0 },
            { rotation: 360, scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }
        );
    });

    // Add styles for the toggle
    const styles = `
        .theme-toggle-nav {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition-smooth);
            position: relative;
            overflow: hidden;
            margin-right: 10px;
        }

        .theme-toggle-nav:hover {
            border-color: var(--primary-color);
            background: rgba(153, 255, 0, 0.1);
            color: var(--primary-color);
        }

        .sun-icon { display: none; }
        .moon-icon { display: block; }

        body.light-mode .sun-icon { display: block; }
        body.light-mode .moon-icon { display: none; }

        body.light-mode .theme-toggle-nav {
            background: rgba(0,0,0,0.05);
            border-color: rgba(0,0,0,0.1);
            color: #1A1C18;
        }

        body.light-mode .theme-toggle-nav:hover {
            border-color: var(--primary-color);
            background: rgba(153, 255, 0, 0.05);
            color: var(--primary-color);
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
