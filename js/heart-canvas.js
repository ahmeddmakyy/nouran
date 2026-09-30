// Interactive Heart Drawing Canvas with Fluid Ink & Pixel Particle Physics
class HeartCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isDrawing = false;
    this.strokes = [];
    this.currentStroke = [];
    this.particles = [];
    this.heartGuidePoints = [];
    this.coveredPoints = new Set();
    this.isUnlocked = false;

    this.hintEl = document.getElementById('heart-hint-text');
    this.nextBtn = document.getElementById('heart-next-slide-btn');

    this.initCanvas();
    this.generateGuide();
    this.bindEvents();
    this.loop();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 340;
    this.height = rect.height || 340;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.center = { x: this.width / 2, y: this.height / 2 + 5 };
    this.scale = this.width / 34;
  }

  generateGuide() {
    this.heartGuidePoints = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      this.heartGuidePoints.push({
        x: this.center.x + x * this.scale,
        y: this.center.y + y * this.scale,
        id: i
      });
    }
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    };

    const start = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.currentStroke = [pos];
      this.strokes.push(this.currentStroke);
      this.checkPoints(pos);
      this.spawnParticles(pos.x, pos.y, 4);
    };

    const move = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.currentStroke.push(pos);
      this.checkPoints(pos);
      this.spawnParticles(pos.x, pos.y, 2);
    };

    const end = () => {
      this.isDrawing = false;
    };

    this.canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    this.canvas.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
  }

  checkPoints(pos) {
    const threshold = 34;
    this.heartGuidePoints.forEach(pt => {
      const dist = Math.hypot(pt.x - pos.x, pt.y - pos.y);
      if (dist < threshold) {
        this.coveredPoints.add(pt.id);
      }
    });

    const percent = Math.round((this.coveredPoints.size / this.heartGuidePoints.length) * 100);

    if (percent >= 60 && !this.isUnlocked) {
      this.onComplete();
    }
  }

  onComplete() {
    this.isUnlocked = true;
    if (this.hintEl) {
      this.hintEl.innerHTML = '<span class="text-rose-600 font-bold">القلب ده ليكي لوحدك يا نينو ❤️</span>';
    }

    if (this.nextBtn) {
      this.nextBtn.classList.remove('hidden');
    }

    // Celebration burst
    for (let i = 0; i < 35; i++) {
      const pt = this.heartGuidePoints[i % this.heartGuidePoints.length];
      this.spawnParticles(pt.x, pt.y, 1, true);
    }

    if (window.confetti) {
      window.confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }

  spawnParticles(x, y, count = 2, isCelebration = false) {
    const icons = ['❤️', '✨', '🍓', '🍰'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isCelebration ? 2 + Math.random() * 4 : 0.5 + Math.random() * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isCelebration ? 1.5 : 0.6),
        icon: icons[Math.floor(Math.random() * icons.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw dashed guide
    this.ctx.save();
    this.ctx.beginPath();
    this.heartGuidePoints.forEach((p, idx) => {
      if (idx === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    });
    this.ctx.closePath();
    this.ctx.strokeStyle = 'rgba(225, 29, 72, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 6]);
    this.ctx.stroke();

    // Guide dots
    this.heartGuidePoints.forEach(p => {
      const covered = this.coveredPoints.has(p.id);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, covered ? 3.5 : 2, 0, Math.PI * 2);
      this.ctx.fillStyle = covered ? '#E11D48' : 'rgba(225, 29, 72, 0.3)';
      this.ctx.fill();
    });
    this.ctx.restore();

    // 2. Draw user strokes
    this.ctx.save();
    this.ctx.lineWidth = 4.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#E11D48';

    this.strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      this.ctx.beginPath();
      this.ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        this.ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      this.ctx.stroke();
    });
    this.ctx.restore();

    // 3. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.icon, p.x, p.y);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.heartCanvas = new HeartCanvas('heart-canvas');
});
