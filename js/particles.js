/**
 * Ambient Glowing Fireflies & Floating Particles for Nature/Resort Vibe
 */
(function() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let particles = [];
  const PARTICLE_COUNT = 36;
  const colors = [
    'rgba(52, 211, 153, ',  // emerald
    'rgba(56, 189, 248, ',  // cyan
    'rgba(251, 191, 36, ',  // amber
    'rgba(244, 114, 182, '  // pink
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = Math.random() * 2.2 + 0.8;
      this.speedY = -(Math.random() * 0.45 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulsePhase += this.pulseSpeed;

      // Glow pulse
      this.currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.pulsePhase));

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.currentAlpha + ')';
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.colorBase + '0.8)';
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
})();
