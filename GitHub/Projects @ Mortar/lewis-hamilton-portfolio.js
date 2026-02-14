// Cursor and Interaction Handler
class PortfolioInteraction {
    constructor() {
        // Cursor position
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        // Smooth cursor position (with delay)
        this.smoothX = this.mouseX;
        this.smoothY = this.mouseY;

        // Previous position for velocity calculation
        this.prevX = this.mouseX;
        this.prevY = this.mouseY;

        // Elements
        this.spotlight = document.querySelector('.cursor-spotlight');
        this.revealImage = document.querySelector('.reveal-image');
        this.echoesContainer = document.querySelector('.cursor-echoes');
        this.textElements = document.querySelectorAll('.content-overlay > div');

        // Grid canvas
        this.canvas = document.getElementById('gridCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Settings
        this.spotlightRadius = 150;
        this.smoothing = 0.15; // Lower = more delay
        this.echoThreshold = 15; // Minimum velocity to create echo
        this.lastEchoTime = 0;
        this.echoInterval = 100; // Minimum time between echoes (ms)

        // Parallax settings
        this.parallaxStrength = 20;

        // Initialize
        this.init();
    }

    init() {
        // Event listeners
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.setupCanvas());

        // Start animation loop
        this.animate();
        this.animateGrid();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    animate() {
        // Smooth cursor following with delay
        this.smoothX += (this.mouseX - this.smoothX) * this.smoothing;
        this.smoothY += (this.mouseY - this.smoothY) * this.smoothing;

        // Calculate velocity
        const velocityX = this.smoothX - this.prevX;
        const velocityY = this.smoothY - this.prevY;
        const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        // Update spotlight position
        this.updateSpotlight();

        // Create echo if moving fast enough
        const now = Date.now();
        if (velocity > this.echoThreshold && now - this.lastEchoTime > this.echoInterval) {
            this.createEcho();
            this.lastEchoTime = now;
        }

        // Update text inversion
        this.updateTextInversion();

        // Update parallax
        this.updateParallax();

        // Store previous position
        this.prevX = this.smoothX;
        this.prevY = this.smoothY;

        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    updateSpotlight() {
        // Show spotlight
        this.spotlight.style.opacity = '1';

        // Update reveal image clip-path
        const clipPath = `circle(${this.spotlightRadius}px at ${this.smoothX}px ${this.smoothY}px)`;
        this.revealImage.style.clipPath = clipPath;
    }

    createEcho() {
        const echo = document.createElement('div');
        echo.className = 'cursor-echo';
        echo.style.left = `${this.smoothX}px`;
        echo.style.top = `${this.smoothY}px`;

        this.echoesContainer.appendChild(echo);

        // Remove echo after animation
        setTimeout(() => {
            echo.remove();
        }, 800);
    }

    updateTextInversion() {
        this.textElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;

            // Calculate distance from cursor to element center
            const distance = Math.sqrt(
                Math.pow(this.smoothX - elementCenterX, 2) +
                Math.pow(this.smoothY - elementCenterY, 2)
            );

            // Invert if cursor is close enough
            const threshold = this.spotlightRadius + Math.max(rect.width, rect.height) / 2;

            if (distance < threshold) {
                element.classList.add('inverted');
            } else {
                element.classList.remove('inverted');
            }
        });
    }

    updateParallax() {
        // Normalize mouse position (-1 to 1)
        const normalizedX = (this.mouseX / window.innerWidth) * 2 - 1;
        const normalizedY = (this.mouseY / window.innerHeight) * 2 - 1;

        this.textElements.forEach(element => {
            const parallaxValue = parseFloat(element.dataset.parallax) || 0;
            const moveX = -normalizedX * this.parallaxStrength * parallaxValue;
            const moveY = -normalizedY * this.parallaxStrength * parallaxValue;

            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    animateGrid() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid settings
        const gridSize = 50;
        const lineWidth = 1;

        // Normalize cursor position
        const cursorInfluence = 100;

        // Draw grid
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = lineWidth;

        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();

            for (let y = 0; y <= this.canvas.height; y += 10) {
                // Calculate distance from cursor
                const dx = this.smoothX - x;
                const dy = this.smoothY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Apply subtle wave effect based on cursor proximity
                const influence = Math.max(0, 1 - distance / cursorInfluence);
                const offset = Math.sin(y * 0.01 + Date.now() * 0.001) * influence * 10;

                if (y === 0) {
                    this.ctx.moveTo(x + offset, y);
                } else {
                    this.ctx.lineTo(x + offset, y);
                }
            }

            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();

            for (let x = 0; x <= this.canvas.width; x += 10) {
                // Calculate distance from cursor
                const dx = this.smoothX - x;
                const dy = this.smoothY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Apply subtle wave effect based on cursor proximity
                const influence = Math.max(0, 1 - distance / cursorInfluence);
                const offset = Math.sin(x * 0.01 + Date.now() * 0.001) * influence * 10;

                if (x === 0) {
                    this.ctx.moveTo(x, y + offset);
                } else {
                    this.ctx.lineTo(x, y + offset);
                }
            }

            this.ctx.stroke();
        }

        // Continue animation
        requestAnimationFrame(() => this.animateGrid());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioInteraction();
});
