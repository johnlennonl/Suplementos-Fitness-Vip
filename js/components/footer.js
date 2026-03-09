/**
 * Footer Component
 * Suplementos Fitness VIP
 */

export function initFooter() {
    const footerContainer = document.getElementById('footer-container');

    const footerHTML = `
        <div class="footer-section section-padding">
            <div class="footer-content">
                <div class="footer-brand">
                    <h2 class="footer-logo">FITNESS<span class="green">VIP</span></h2>
                    <p>La mejor selección de suplementos elite para atletas que no aceptan menos que la perfección.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>

                <div class="footer-grid">
                    <div class="footer-col">
                        <h4>Enlaces</h4>
                        <ul>
                            <li><a href="#hero-container">Inicio</a></li>
                            <li><a href="#products-container">Productos</a></li>
                            <li><a href="#categories-container">Categorías</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Categorías</h4>
                        <ul>
                            <li><a href="#">Proteínas</a></li>
                            <li><a href="#">Creatinas</a></li>
                            <li><a href="#">Pre-entrenos</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Contacto</h4>
                        <ul>
                            <li><i class="fas fa-location-dot green"></i> Valencia , Venezuela</li>
                            <li><i class="fas fa-phone green"></i> +58 412 6581304</li>
                            <li><i class="fas fa-envelope green"></i> info@fitnessvip.com</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 <span class="green">Suplementos Fitness VIP</span>. Todos los derechos reservados.</p>
                <p class="dev-tag">Diseñado para el Élite</p>
            </div>
        </div>
    `;

    footerContainer.innerHTML = footerHTML;

    const styles = `
        .footer-section {
            background: #050505;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: 50px;
        }

        .footer-content {
            display: grid;
            grid-template-columns: 1.5fr 2fr;
            gap: 80px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .footer-brand p {
            color: var(--text-muted);
            margin: 20px 0 30px;
            max-width: 350px;
        }

        .footer-logo {
            font-size: 2.5rem;
            letter-spacing: -0.05em;
        }

        .social-links {
            display: flex;
            gap: 15px;
        }

        .social-links a {
            width: 45px;
            height: 45px;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: white;
            text-decoration: none;
            transition: var(--transition-smooth);
            font-size: 18px;
        }

        .social-links a:hover {
            background: var(--primary-color);
            color: black;
            transform: translateY(-5px);
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
        }

        .footer-col h4 {
            font-size: 14px;
            margin-bottom: 25px;
            color: white;
            letter-spacing: 0.1em;
        }

        .footer-col ul {
            list-style: none;
        }

        .footer-col ul li {
            margin-bottom: 12px;
            color: var(--text-muted);
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .footer-col ul li a {
            color: var(--text-muted);
            text-decoration: none;
            transition: var(--transition-smooth);
        }

        .footer-col ul li a:hover {
            color: var(--primary-color);
            padding-left: 5px;
        }

        .footer-bottom {
            max-width: 1200px;
            margin: 80px auto 0;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-muted);
        }

        .dev-tag {
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: 700;
        }

        @media (max-width: 992px) {
            .footer-content { grid-template-columns: 1fr; gap: 50px; }
            .footer-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        }
    `;

    const head = document.head;
    const style = document.createElement('style');
    style.textContent = styles;
    head.appendChild(style);
}
