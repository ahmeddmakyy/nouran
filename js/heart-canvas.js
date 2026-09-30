// Interactive Connect-the-Dots Heart Drawing Canvas with Grand Celebration
class HeartCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isDrawing = false;
    this.strokes = [];
    this.currentStroke = [];
    this.particles = [];
    this.waypoints = [];
    this.guidePoints = [];
    this.connectedNodes = new Set();
    this.isUnlocked = false;
    this.celebrationInterval = null;
    this.fillProgress = 0;

    this.hintEl = document.getElementById('heart-hint-text');
    this.nextBtn = document.getElementById('heart-next-slide-btn');
    this.celebrationLayer = document.getElementById('heart-celebration-layer');

    this.initCanvas();
    this.generateWaypoints();
    this.bindEvents();
    this.loop();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // perf: cap DPR (retina 3x was 9x pixels)
    this.width = rect.width || 340;
    this.height = rect.height || 340;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.center = { x: this.width / 2, y: this.height / 2 - 8 };
    this.scale = this.width / 37;
  }

  generateWaypoints() {
    this.waypoints = [];
    this.guidePoints = [];
    const nodeCount = 14;

    // 14 distinct checkpoints around the heart perimeter
    // 0: top cleft, 1-6: right lobe, 7: bottom tip, 8-13: left lobe
    for (let i = 0; i < nodeCount; i++) {
      const t = (i / nodeCount) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      this.waypoints.push({
        id: i,
        num: i + 1,
        x: this.center.x + x * this.scale,
        y: this.center.y + y * this.scale,
        side: (i === 0 || i === 7) ? 'center' : (i < 7 ? 'right' : 'left'),
        connected: false,
        pulse: (i / nodeCount) * Math.PI * 2
      });
    }

    // Dense guide points for smooth dashed outline
    const denseCount = 64;
    for (let i = 0; i < denseCount; i++) {
      const t = (i / denseCount) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      this.guidePoints.push({
        x: this.center.x + x * this.scale,
        y: this.center.y + y * this.scale
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
      const raw = getPos(e);
      const pos = this.checkNodes(raw);
      this.currentStroke = [pos];
      this.strokes.push(this.currentStroke);
      this.spawnParticles(pos.x, pos.y, 3);
    };

    const move = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const raw = getPos(e);
      const pos = this.checkNodes(raw);
      this.currentStroke.push(pos);
      this.spawnParticles(pos.x, pos.y, 1);
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

    const container = this.canvas.parentElement;
    if (container) {
      container.addEventListener('mousedown', start);
      container.addEventListener('touchstart', start, { passive: false });
    }
  }

  magnetize(pos) {
    // Snap to nearest unconnected node within 34px for satisfying feel
    let best = null;
    let bestDist = 34;
    this.waypoints.forEach(node => {
      if (node.connected) return;
      const d = Math.hypot(node.x - pos.x, node.y - pos.y);
      if (d < bestDist) {
        bestDist = d;
        best = node;
      }
    });
    if (best) return { x: best.x, y: best.y };
    return pos;
  }

  checkNodes(rawPos) {
    const pos = this.magnetize(rawPos);
    const radius = 24;
    let newlyConnected = false;

    this.waypoints.forEach(node => {
      const dist = Math.hypot(node.x - pos.x, node.y - pos.y);
      if (dist < radius && !node.connected) {
        node.connected = true;
        this.connectedNodes.add(node.id);
        newlyConnected = true;
        this.spawnParticles(node.x, node.y, 6, true);
        if (window.soundEngine) {
          window.soundEngine.playPop();
        }
        if (window.haptics) window.haptics(12);
      }
    });

    if (newlyConnected && !this.isUnlocked) {
      this.evaluateProgress();
    }
    return pos;
  }

  evaluateProgress() {
    const coreRight = [2, 3, 4, 5];
    const coreLeft = [9, 10, 11, 12];

    const rightCoreCount = coreRight.filter(id => this.connectedNodes.has(id)).length;
    const leftCoreCount = coreLeft.filter(id => this.connectedNodes.has(id)).length;
    const totalCount = this.connectedNodes.size;

    // Update dynamic guidance hint
    if (this.hintEl) {
      if (rightCoreCount >= 3 && leftCoreCount < 2) {
        this.hintEl.innerHTML = '<span class="text-rose-600 font-semibold">شاطرة! وصلي النقط الباقية على الشمال كمان 😉</span>';
      } else if (leftCoreCount >= 3 && rightCoreCount < 2) {
        this.hintEl.innerHTML = '<span class="text-rose-600 font-semibold">شاطرة! وصلي النقط الباقية على اليمين كمان 😉</span>';
      } else if (totalCount < 11) {
        this.hintEl.innerHTML = `وصلي النقط ببعض عشان تفتحي القلب ❤️ (${totalCount} / 14)`;
      }
    }

    // Must connect BOTH right lobe (>= 3 of 4 core) AND left lobe (>= 3 of 4 core), and total >= 11
    // Half a heart can NEVER trigger this!
    if (rightCoreCount >= 3 && leftCoreCount >= 3 && totalCount >= 11 && !this.isUnlocked) {
      this.onComplete();
    }
  }

  onComplete() {
    this.isUnlocked = true;

    // Mark all waypoints connected for seamless visuals
    this.waypoints.forEach(w => w.connected = true);

    if (this.hintEl) {
      this.hintEl.innerHTML = '<span class="text-rose-600 font-bold text-base animate-pulse">القلب ده ليكي لوحدك يا نينو ❤️</span>';
    }

    if (this.nextBtn) {
      this.nextBtn.classList.remove('hidden');
      this.nextBtn.classList.add('animate-bounce');
      setTimeout(() => this.nextBtn.classList.remove('animate-bounce'), 2500);
    }

    // Play victory sound
    if (window.soundEngine) {
      window.soundEngine.playFanfare();
    }

    // Canvas confetti burst
    if (window.confetti) {
      window.confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Sparkle burst around the heart canvas
    for (let i = 0; i < 40; i++) {
      const node = this.waypoints[i % this.waypoints.length];
      this.spawnParticles(node.x, node.y, 2, true);
    }

    // Launch Grand Celebration Layer (Repeated Hearts & Flying Phrases across whole screen)
    this.triggerGrandCelebration();
  }

  triggerGrandCelebration() {
    const layer = document.getElementById('heart-celebration-layer');
    if (!layer) return;
    layer.classList.remove('hidden');

    const phrases = [
      "بحبك ❤️",
      "خلاص بقى اتصالحي 🥺",
      "بموت فيكي 🥰",
      "وحشتيني أوي أوي أوي 🫂",
      "وحشتيني 💖"
    ];

    const heartColors = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#BE123C'];

    // 1. Burst repeated hearts radially from center of the screen (perf: 14 not 22)
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.45;

    for (let i = 0; i < 14; i++) {
      const heart = document.createElement('div');
      heart.className = 'celebration-heart-clone celebration-heart-burst';
      const size = 26 + Math.random() * 44;
      const color = heartColors[Math.floor(Math.random() * heartColors.length)];

      heart.innerHTML = `<svg viewBox="0 0 32 32" style="width:${size}px; height:${size}px; fill:${color}; filter:drop-shadow(0 4px 10px ${color}66);"><path d="M16 28.5l-2.1-1.9C6.4 19.8 1.5 15.3 1.5 9.7 1.5 5.2 5 1.7 9.5 1.7c2.5 0 4.9 1.2 6.5 3.1 1.6-1.9 4-3.1 6.5-3.1 4.5 0 8 3.5 8 8 0 5.6-4.9 10.1-12.4 16.9L16 28.5z"/></svg>`;
      heart.style.left = `${cx}px`;
      heart.style.top = `${cy}px`;

      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 120 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.55);
      const hDx = Math.cos(angle) * dist;
      const hDy = Math.sin(angle) * dist;
      const hRot = (Math.random() - 0.5) * 50;
      const hScale = 0.8 + Math.random() * 0.8;

      heart.style.setProperty('--h-dx', `${hDx}px`);
      heart.style.setProperty('--h-dy', `${hDy}px`);
      heart.style.setProperty('--h-rot', `${hRot}deg`);
      heart.style.setProperty('--h-scale', `${hScale}`);

      layer.appendChild(heart);
      setTimeout(() => heart.remove(), 3400);
    }

    // 2. Spawn Flying Love Phrases across the screen with staggered delays
    const spawnPhrase = (text, delay = 0, posX = null) => {
      setTimeout(() => {
        if (!layer) return;
        const phraseEl = document.createElement('div');
        phraseEl.className = 'celebration-phrase-item';
        phraseEl.textContent = text;

        const x = posX !== null ? posX : 25 + Math.random() * 50; // percentage
        const y = 50 + Math.random() * 25; // percentage
        phraseEl.style.left = `${x}%`;
        phraseEl.style.top = `${y}%`;

        phraseEl.style.setProperty('--rot-start', `${(Math.random() - 0.5) * 12}deg`);
        phraseEl.style.setProperty('--rot-mid', `${(Math.random() - 0.5) * 8}deg`);
        phraseEl.style.setProperty('--rot-end', `${(Math.random() - 0.5) * 10}deg`);

        layer.appendChild(phraseEl);
        setTimeout(() => phraseEl.remove(), 4900);
      }, delay);
    };

    // Staggered launch of the 5 requested phrases
    phrases.forEach((phrase, idx) => {
      spawnPhrase(phrase, idx * 550);
    });

    // Start recurring celebration loop
    this.resumeCelebration();
  }

  pauseCelebration() {
    if (this.celebrationInterval) {
      clearInterval(this.celebrationInterval);
      this.celebrationInterval = null;
    }
  }

  resumeCelebration() {
    if (!this.isUnlocked || this.celebrationInterval) return;
    const layer = document.getElementById('heart-celebration-layer');
    if (!layer) return;

    const phrases = [
      "بحبك ❤️",
      "خلاص بقى اتصالحي 🥺",
      "بموت فيكي 🥰",
      "وحشتيني أوي أوي أوي 🫂",
      "وحشتيني 💖"
    ];
    const heartColors = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#BE123C'];

    let phraseLoopIdx = 0;
    this.celebrationInterval = setInterval(() => {
      if (!this.isUnlocked) return;
      if (layer.childElementCount > 22) return; // perf cap: skip tick when layer is full

      const p = phrases[phraseLoopIdx % phrases.length];
      phraseLoopIdx++;

      const phraseEl = document.createElement('div');
      phraseEl.className = 'celebration-phrase-item';
      phraseEl.textContent = p;
      phraseEl.style.left = `${22 + Math.random() * 54}%`;
      phraseEl.style.top = `${48 + Math.random() * 26}%`;
      phraseEl.style.setProperty('--rot-start', `${(Math.random() - 0.5) * 12}deg`);
      phraseEl.style.setProperty('--rot-mid', `${(Math.random() - 0.5) * 8}deg`);
      phraseEl.style.setProperty('--rot-end', `${(Math.random() - 0.5) * 10}deg`);
      layer.appendChild(phraseEl);
      setTimeout(() => phraseEl.remove(), 4900);

      // Floating heart rising
      const fHeart = document.createElement('div');
      fHeart.className = 'celebration-heart-clone celebration-heart-float';
      const size = 24 + Math.random() * 40;
      const color = heartColors[Math.floor(Math.random() * heartColors.length)];
      fHeart.innerHTML = `<svg viewBox="0 0 32 32" style="width:${size}px; height:${size}px; fill:${color}; filter:drop-shadow(0 4px 8px ${color}55);"><path d="M16 28.5l-2.1-1.9C6.4 19.8 1.5 15.3 1.5 9.7 1.5 5.2 5 1.7 9.5 1.7c2.5 0 4.9 1.2 6.5 3.1 1.6-1.9 4-3.1 6.5-3.1 4.5 0 8 3.5 8 8 0 5.6-4.9 10.1-12.4 16.9L16 28.5z"/></svg>`;
      fHeart.style.left = `${10 + Math.random() * 80}%`;
      fHeart.style.setProperty('--h-rot', `${(Math.random() - 0.5) * 40}deg`);
      layer.appendChild(fHeart);
      setTimeout(() => fHeart.remove(), 5600);
    }, 1800);
  }

  spawnParticles(x, y, count = 2, isCelebration = false) {
    const icons = ['❤️', '✨', '💖', '⭐', '🌸'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isCelebration ? 2.5 + Math.random() * 4 : 0.6 + Math.random() * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isCelebration ? 1.8 : 0.8),
        icon: icons[Math.floor(Math.random() * icons.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.025
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const time = Date.now() * 0.003;

    // 0. Fill morph when unlocked
    if (this.isUnlocked && this.fillProgress < 1) {
      this.fillProgress = Math.min(1, this.fillProgress + 0.012);
    }
    if (this.fillProgress > 0) {
      this.ctx.save();
      this.ctx.beginPath();
      this.guidePoints.forEach((p, idx) => {
        if (idx === 0) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      });
      this.ctx.closePath();
      this.ctx.fillStyle = `rgba(225, 29, 72, ${0.14 * this.fillProgress})`;
      this.ctx.shadowColor = 'rgba(225,29,72,0.3)';
      this.ctx.shadowBlur = 8 * this.fillProgress;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 1. Draw dashed guide heart outline connecting all waypoints
    this.ctx.save();
    this.ctx.beginPath();
    this.guidePoints.forEach((p, idx) => {
      if (idx === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    });
    this.ctx.closePath();
    this.ctx.strokeStyle = this.isUnlocked ? 'rgba(225, 29, 72, 0.55)' : 'rgba(225, 29, 72, 0.22)';
    this.ctx.lineWidth = this.isUnlocked ? 3 : 2;
    this.ctx.setLineDash(this.isUnlocked ? [] : [4, 6]);
    if (this.isUnlocked) {
      this.ctx.shadowColor = 'rgba(225,29,72,0.5)';
      this.ctx.shadowBlur = 6;
    }
    this.ctx.stroke();
    this.ctx.restore();

    // 2. Draw user hand strokes with glow trail
    this.ctx.save();
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#E11D48';
    this.ctx.shadowColor = 'rgba(225,29,72,0.5)';
    this.ctx.shadowBlur = 4;

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

    // 3. Draw Connect-the-Dots Waypoint Circles
    this.waypoints.forEach(node => {
      this.ctx.save();
      const isConn = node.connected || this.isUnlocked;

      if (isConn) {
        // Connected Node: Solid glowing rose badge with white center
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#E11D48';
        this.ctx.shadowColor = 'rgba(225, 29, 72, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();

        // Inner white dot
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
      } else {
        // Unconnected Node: Animated pulsing target with node number
        const pulseScale = 1 + 0.18 * Math.sin(time * 3 + node.pulse);
        const radius = 8 * pulseScale;

        // Outer soft aura
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(225, 29, 72, 0.12)';
        this.ctx.fill();

        // White circle with rose border
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#E11D48';
        this.ctx.stroke();

        // Node number inside circle
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.fillStyle = '#E11D48';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.num.toString(), node.x, node.y + 0.5);
      }
      this.ctx.restore();
    });

    // 4. Draw Particles
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
      this.ctx.font = '13px sans-serif';
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
