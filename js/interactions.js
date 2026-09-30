// Haptics helper
window.haptics = function(ms = 20) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {}
};

// Slide-based navigation, Evasive button, Apple Emojis Explosion, and Instant Audio
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.story-container');
  const dots = document.querySelectorAll('.slide-dot');

  // 0. Global: reveal on scroll + progress + ambient hearts
  const slides = document.querySelectorAll('.story-slide');
  const progressFill = document.getElementById('story-progress-fill');
  const ambientBox = document.getElementById('ambient-hearts');

  if ('IntersectionObserver' in window && slides.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          // trigger counter count-up once
          if (en.target.id === 'slide-hero' && window.relationshipCounter && !window.relationshipCounter.counted) {
            window.relationshipCounter.countUp();
          }
        }
      });
    }, { root: container, threshold: 0.45 });
    slides.forEach(s => revealObs.observe(s));
  } else {
    slides.forEach(s => s.classList.add('visible'));
  }

  // Progress bar + dots update on scroll (merged with existing handler below)
  function updateProgress() {
    if (!container || !progressFill) return;
    const max = container.scrollHeight - container.clientHeight;
    const p = max > 0 ? (container.scrollTop / max) * 100 : 0;
    progressFill.style.width = `${p}%`;
  }

  // Ambient hearts (lightweight, pooled)
  if (ambientBox) {
    const icons = ['❤️', '💖', '✨', '🌸', '💕'];
    for (let i = 0; i < 10; i++) {
      const h = document.createElement('div');
      h.className = 'ambient-heart';
      h.textContent = icons[i % icons.length];
      h.style.left = `${Math.random() * 92}%`;
      h.style.fontSize = `${12 + Math.random() * 18}px`;
      h.style.animationDuration = `${9 + Math.random() * 9}s`;
      h.style.animationDelay = `${Math.random() * 9}s`;
      ambientBox.appendChild(h);
    }
  }

  // 0b. Nicknames tap: bounce + flying emoji + haptic
  document.querySelectorAll('.nickname-item').forEach(card => {
    card.addEventListener('click', () => {
      window.haptics(15);
      if (window.soundEngine) window.soundEngine.playPop();
      card.classList.remove('bounce-tap');
      void card.offsetWidth;
      card.classList.add('bounce-tap');
      const emoji = card.dataset.emoji || '❤️';
      for (let i = 0; i < 3; i++) {
        const f = document.createElement('div');
        f.className = 'nick-fly-emoji';
        f.textContent = emoji;
        f.style.setProperty('--nx', `${(Math.random() - 0.5) * 120}px`);
        f.style.setProperty('--nr', `${(Math.random() - 0.5) * 60}deg`);
        f.style.left = `${30 + Math.random() * 40}%`;
        card.appendChild(f);
        setTimeout(() => f.remove(), 1150);
      }
    });
  });

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

      updateProgress();

      // Slide Heart celebration interval management - only run when user is on Slide Heart
      const slideHeart = document.getElementById('slide-heart');
      if (slideHeart && window.heartCanvas) {
        const hRect = slideHeart.getBoundingClientRect();
        const isHeartVisible = (hRect.top < window.innerHeight * 0.6 && hRect.bottom > window.innerHeight * 0.4);
        if (isHeartVisible) {
          window.heartCanvas.resumeCelebration();
        } else {
          window.heartCanvas.pauseCelebration();
        }
      }

      // If user scrolls away from Slide Sound while special sound is playing, pause it and resume bg music!
      const slideSound = document.getElementById('slide-sound');
      if (slideSound && window.specialSoundPlayer && window.specialSoundPlayer.isPlaying) {
        const sRect = slideSound.getBoundingClientRect();
        if (sRect.bottom < 80 || sRect.top > window.innerHeight - 80) {
          window.specialSoundPlayer.pause(true);
        }
      }

      // If user scrolls away from Slide Revenge while revenge sound is playing, pause it and resume bg music!
      const slideRevenge = document.getElementById('slide-revenge');
      if (slideRevenge && window.revengePlayer && window.revengePlayer.isPlaying) {
        const rRect = slideRevenge.getBoundingClientRect();
        if (rRect.bottom < 80 || rRect.top > window.innerHeight - 80) {
          window.revengePlayer.pause(true);
        }
      }
    });
  }

  // 2. Next slide button in canvas & tap-to-spawn phrase in Slide 2
  const canvasNextBtn = document.getElementById('heart-next-slide-btn');
  if (canvasNextBtn && container) {
    canvasNextBtn.addEventListener('click', () => {
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });
  }

  const slideHeart = document.getElementById('slide-heart');
  if (slideHeart) {
    slideHeart.addEventListener('pointerdown', (e) => {
      if (window.heartCanvas && window.heartCanvas.isUnlocked) {
        const phrases = ["بحبك ❤️", "خلاص بقى اتصالحي 🥺", "بموت فيكي 🥰", "وحشتيني أوي أوي أوي 🫂", "وحشتيني 💖"];
        const p = phrases[Math.floor(Math.random() * phrases.length)];
        const layer = document.getElementById('heart-celebration-layer');
        if (layer) {
          const rect = layer.getBoundingClientRect();
          const phraseEl = document.createElement('div');
          phraseEl.className = 'celebration-phrase-item';
          phraseEl.textContent = p;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          phraseEl.style.left = `${x}px`;
          phraseEl.style.top = `${y}px`;
          layer.appendChild(phraseEl);
          setTimeout(() => phraseEl.remove(), 4900);
        }
      }
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
    'assets/emojis/strawberry.png',
    'assets/emojis/pleading.png'
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
    img.style.setProperty('--wob', `${(Math.random() - 0.5) * 36}deg`);

    const duration = 3.6 + Math.random() * 2.8;
    img.style.animationDuration = `${duration}s`;

    emojiLayer.appendChild(img);
    setTimeout(() => img.remove(), duration * 1000 + 200);
  }

  function spawnLoveText(x, y) {
    if (!emojiLayer) return;
    const texts = ['بحبك ❤️', 'صافية لبن 🥛', 'نينو 👑', 'خلاص اتصالحنا 🥺❤️'];
    const el = document.createElement('div');
    el.className = 'forgive-love-text';
    el.textContent = texts[Math.floor(Math.random() * texts.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    emojiLayer.appendChild(el);
    setTimeout(() => el.remove(), 1350);
  }

  if (forgiveBtn) {
    forgiveBtn.addEventListener('click', () => {
      window.haptics([30, 50, 30]);
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
        spawnLoveText(cx, cy - 40);

        // Continuous stream of Apple emojis flying up
        const streamInterval = setInterval(() => {
          spawnFloatingEmoji();
          spawnFloatingEmoji();
        }, 260);

        // Allow tapping anywhere to spawn more emojis + love text
        emojiLayer.addEventListener('pointerdown', (e) => {
          window.haptics(12);
          spawnBurstEmoji(e.clientX, e.clientY, 12);
          spawnLoveText(e.clientX, e.clientY);
        });

        // 3. Show certificate payoff after explosion
        setTimeout(() => {
          const cert = document.getElementById('forgive-certificate');
          if (cert) cert.classList.add('show');
          if (window.confetti) {
            window.confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 }, shapes: ['heart'] });
          }
        }, 2200);

        const certBtn = document.getElementById('forgive-cert-btn');
        if (certBtn) {
          certBtn.addEventListener('click', () => {
            window.haptics([20, 40, 20]);
            spawnBurstEmoji(window.innerWidth / 2, window.innerHeight / 2, 30);
            if (window.confetti) {
              window.confetti({ particleCount: 120, spread: 120, origin: { y: 0.6 } });
            }
          });
        }
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
