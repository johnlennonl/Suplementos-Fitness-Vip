/**
 * Cyber-Mesh Background Engine
 * Specialized for Suplementos Fitness VIP
 */

class CyberMesh {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bg-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.mouse = { x: null, y: null, radius: 150 };
        this.primaryColor = '#99FF00'; // Var primary

        this.init();
        this.animate();
        this.handleResize();
        this.handleMouse();
    }

    init() {
        // Find existing background container and replace it or append
        const container = document.querySelector('.bg-animation');
        if (container) {
            container.innerHTML = '';
            container.appendChild(this.canvas);
        } else {
            document.body.prepend(this.canvas);
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.zIndex = '-1';
        }

        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.resize();
            this.particles = [];
            this.createParticles();
        });
    }

    handleMouse() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                density: (Math.random() * 30) + 1,
                speedX: (Math.random() * 0.5) - 0.25,
                speedY: (Math.random() * 0.5) - 0.25
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Natural movement
            p.x += p.speedX;
            p.y += p.speedY;

            // Bounce off edges
            if (p.x > this.canvas.width || p.x < 0) p.speedX *= -1;
            if (p.y > this.canvas.height || p.y < 0) p.speedY *= -1;

            // Mouse interaction (repulsion)
            let dx = this.mouse.x - p.x;
            let dy = this.mouse.y - p.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const directionX = dx / distance;
                const directionY = dy / distance;
                p.x -= directionX * force * 5;
                p.y -= directionY * force * 5;
            }

            // Draw particle
            this.ctx.fillStyle = this.primaryColor;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw connections
            for (let j = i; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let dx2 = p.x - p2.x;
                let dy2 = p.y - p2.y;
                let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (dist2 < 150) {
                    this.ctx.strokeStyle = `rgba(153, 255, 0, ${1 - (dist2 / 150)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

export const initBackground = () => new CyberMesh();
