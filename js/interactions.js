// Slide-based navigation, Evasive button, Apple Emojis Explosion, and Instant Audio
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.story-container');
  const dots = document.querySelectorAll('.slide-dot');

  // 1. Slide Navigation Dots
  if (container && dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        container.scrollTo({
          top: index * window.innerHeight,
          behavior: 'smooth'
        });
      });
    });

    container.addEventListener('scroll', () => {
      const scrollPos = container.scrollTop;
      const index = Math.round(scrollPos / window.innerHeight);

      dots.forEach((d, i) => {
        if (i === index) d.classList.add('active');
        else d.classList.remove('active');
      });
    });
  }

  // 2. Next slide button in canvas
  const canvasNextBtn = document.getElementById('heart-next-slide-btn');
  if (canvasNextBtn && container) {
    canvasNextBtn.addEventListener('click', () => {
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });
  }

  // 3. Evasive "لسه زعلانة" Button - Fullscreen roaming & mouse proximity fleeing
  const evasiveBtn = document.getElementById('evasive-btn');
  const remarks = [
    "طب عشان خاطري أنا؟ 🥺",
    "طب عزومة بيتزا تانية في باسيلكو؟ 🍕",
    "طب بسبوسة وكيكة؟ 😋",
    "طب يا بنتي بطلي غلاسة بقى! 😂",
    "الزرار ده هربان أصلاً! 🏃‍♂️💨",
    "مش هتعرفي تدوسي عليا 😜",
    "مفيش مفر.. دوسي صافية لبن ❤️"
  ];
  let remarkIdx = 0;
  let isEscaped = false;
  let lastDodgeTime = 0;

  function dodge(cursorX = null, cursorY = null) {
    if (!evasiveBtn || evasiveBtn.style.display === 'none') return;

    if (window.soundEngine) {
      window.soundEngine.playPop();
    }

    const btnWidth = evasiveBtn.offsetWidth || 180;
    const btnHeight = evasiveBtn.offsetHeight || 44;

    // Viewport bounds with safe margins
    const marginX = 24;
    const marginTop = 75; // Avoid floating audio dock
    const marginBottom = 40;

    const maxX = Math.max(marginX, window.innerWidth - btnWidth - marginX);
    const maxY = Math.max(marginTop, window.innerHeight - btnHeight - marginBottom);

    let newX, newY;
    let attempts = 0;

    // Pick a position across the whole screen far from cursor
    do {
      newX = marginX + Math.random() * (maxX - marginX);
      newY = marginTop + Math.random() * (maxY - marginTop);
      attempts++;
      if (cursorX === null || cursorY === null) break;
      const dist = Math.hypot(newX + btnWidth / 2 - cursorX, newY + btnHeight / 2 - cursorY);
      if (dist > 180) break;
    } while (attempts < 20);

    if (!isEscaped) {
      isEscaped = true;
      evasiveBtn.classList.remove('w-full');
      evasiveBtn.style.position = 'fixed';
      evasiveBtn.style.zIndex = '35';
      evasiveBtn.style.width = 'max-content';
      evasiveBtn.style.maxWidth = '280px';
      evasiveBtn.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.22)';
    }

    evasiveBtn.style.transition = 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)';
    evasiveBtn.style.left = `${newX}px`;
    evasiveBtn.style.top = `${newY}px`;
    evasiveBtn.style.transform = `rotate(${(Math.random() - 0.5) * 16}deg)`;

    remarkIdx = (remarkIdx + 1) % remarks.length;
    const txt = evasiveBtn.querySelector('.btn-text');
    if (txt) txt.textContent = remarks[remarkIdx];
  }

  // Laptop/Desktop mouse proximity detection: mouse can NEVER touch the button
  window.addEventListener('mousemove', (e) => {
    if (!evasiveBtn || evasiveBtn.style.display === 'none') return;

    // Check if Slide 5 is visible
    const slide5 = document.getElementById('slide-finale');
    if (!slide5) return;
    const sRect = slide5.getBoundingClientRect();
    if (sRect.bottom < window.innerHeight * 0.3 || sRect.top > window.innerHeight * 0.7) {
      return;
    }

    const bRect = evasiveBtn.getBoundingClientRect();
    const btnCenterX = bRect.left + bRect.width / 2;
    const btnCenterY = bRect.top + bRect.height / 2;
    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    const now = Date.now();
    // Dodge when mouse gets within 110px!
    if (dist < 110 && (now - lastDodgeTime > 120)) {
      lastDodgeTime = now;
      dodge(e.clientX, e.clientY);
    }
  });

  if (evasiveBtn) {
    evasiveBtn.addEventListener('mouseenter', (e) => dodge(e.clientX, e.clientY));
    evasiveBtn.addEventListener('mouseover', (e) => dodge(e.clientX, e.clientY));
    evasiveBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      dodge(touch ? touch.clientX : null, touch ? touch.clientY : null);
    }, { passive: false });
    evasiveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dodge(e.clientX, e.clientY);
    });
    evasiveBtn.addEventListener('focus', () => dodge());
  }

  // 4. Apple Emojis Flying Everywhere Finale
  const forgiveBtn = document.getElementById('forgive-btn');
  const decisionCard = document.getElementById('decision-card');
  const emojiLayer = document.getElementById('apple-emojis-layer');

  const appleEmojis = [
    'assets/emojis/heart.png',
    'assets/emojis/smile_hearts.png',
    'assets/emojis/heart_eyes.png',
    'assets/emojis/kiss.png',
    'assets/emojis/ring.png',
    'assets/emojis/sparkles.png',
    'assets/emojis/crown.png',
    'assets/emojis/party.png',
    'assets/emojis/revolving_hearts.png',
    'assets/emojis/heart_hands.png',
    'assets/emojis/pizza.png',
    'assets/emojis/cake.png',
    'assets/emojis/honey.png',
    'assets/emojis/strawberry.png'
  ];

  function spawnBurstEmoji(x, y, count = 30) {
    if (!emojiLayer) return;
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.src = appleEmojis[Math.floor(Math.random() * appleEmojis.length)];
      img.className = 'apple-emoji-item apple-emoji-burst';

      const size = 38 + Math.random() * 45;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.7);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 60;

      img.style.setProperty('--dx', `${dx}px`);
      img.style.setProperty('--dy', `${dy}px`);
      img.style.setProperty('--rot', `${rot}deg`);

      emojiLayer.appendChild(img);
      setTimeout(() => img.remove(), 2600);
    }
  }

  function spawnFloatingEmoji() {
    if (!emojiLayer || emojiLayer.classList.contains('hidden')) return;
    const img = document.createElement('img');
    img.src = appleEmojis[Math.floor(Math.random() * appleEmojis.length)];
    img.className = 'apple-emoji-item apple-emoji-float';

    const size = 35 + Math.random() * 50;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.left = `${Math.random() * (window.innerWidth - 60)}px`;

    const duration = 3.5 + Math.random() * 3.5;
    img.style.animationDuration = `${duration}s`;

    emojiLayer.appendChild(img);
    setTimeout(() => img.remove(), duration * 1000 + 200);
  }

  if (forgiveBtn) {
    forgiveBtn.addEventListener('click', () => {
      // 1. Hide the decision card and evasive button completely
      if (decisionCard) {
        decisionCard.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        decisionCard.style.transform = 'scale(0.8) translateY(-20px)';
        decisionCard.style.opacity = '0';
        setTimeout(() => {
          decisionCard.style.display = 'none';
        }, 500);
      }
      if (evasiveBtn) {
        evasiveBtn.style.display = 'none';
      }

      // 2. Show the Apple emojis layer
      if (emojiLayer) {
        emojiLayer.classList.remove('hidden');

        // Initial big center explosion of Apple emojis
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        spawnBurstEmoji(cx, cy, 45);

        // Continuous stream of Apple emojis flying up
        const streamInterval = setInterval(() => {
          spawnFloatingEmoji();
          spawnFloatingEmoji();
        }, 220);

        // Allow tapping anywhere to spawn more emojis
        emojiLayer.addEventListener('pointerdown', (e) => {
          spawnBurstEmoji(e.clientX, e.clientY, 12);
        });
      }

      // Also trigger victory chime & canvas confetti
      if (window.soundEngine) {
        window.soundEngine.playFanfare();
      }
      if (window.confetti) {
        window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }
    });
  }

  // 5. Instant Audio Autoplay - fires on first touch/interaction or instantly if allowed
  const audio = document.getElementById('bg-music');
  const tryPlayAudio = () => {
    if (audio && audio.paused) {
      audio.volume = 1.0;
      audio.play().then(() => {
        if (window.musicPlayer) {
          window.musicPlayer.isPlaying = true;
          window.musicPlayer.updateUI();
        }
      }).catch(() => {
        // Autoplay policy prevented, will play on first touch
      });
    }
  };

  tryPlayAudio();
  const touchEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'scroll', 'keydown'];
  touchEvents.forEach(evt => {
    window.addEventListener(evt, tryPlayAudio, { capture: true, once: true });
    document.addEventListener(evt, tryPlayAudio, { capture: true, once: true });
  });
});
