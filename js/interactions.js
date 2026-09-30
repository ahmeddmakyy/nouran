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

  // Ambient hearts (full set — perf handled via transform-only animation + preload)
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

  // Perf root fix: preload all celebration emoji PNGs once, so mid-burst
  // image decode never janks the animation
  if ('Image' in window) {
    const emojiPreloads = [
      'assets/emojis/heart.png', 'assets/emojis/smile_hearts.png',
      'assets/emojis/heart_eyes.png', 'assets/emojis/kiss.png',
      'assets/emojis/ring.png', 'assets/emojis/sparkles.png',
      'assets/emojis/crown.png', 'assets/emojis/party.png',
      'assets/emojis/revolving_hearts.png', 'assets/emojis/heart_hands.png',
      'assets/emojis/pizza.png', 'assets/emojis/cake.png',
      'assets/emojis/honey.png', 'assets/emojis/strawberry.png',
      'assets/emojis/pleading.png'
    ];
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    idle(() => emojiPreloads.forEach(src => { const im = new Image(); im.src = src; }));
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

    // perf: rAF-throttle the scroll handler (was running layout reads every scroll tick)
    let scrollQueued = false;
    container.addEventListener('scroll', () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
      handleScroll();
      });
    }, { passive: true });

    function handleScroll() {
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
    }
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

  // 3. Evasive "لسه زعلانة" Button — smart roaming, always visible & inside viewport
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
  const DODGE_COOLDOWN = 320;

  function isFinaleVisible() {
    const finale = document.getElementById('slide-finale');
    if (!finale) return false;
    const r = finale.getBoundingClientRect();
    return r.bottom > window.innerHeight * 0.3 && r.top < window.innerHeight * 0.7;
  }

  // Safety net: clamp the button back inside the viewport no matter what
  function clampIntoViewport() {
    if (!evasiveBtn || !isEscaped) return;
    const b = evasiveBtn.getBoundingClientRect();
    const marginX = 16;
    const marginTop = 75; // avoid floating audio dock
    const marginBottom = 96; // avoid swipe hint
    let fixX = 0, fixY = 0;
    if (b.left < marginX) fixX = marginX - b.left;
    else if (b.right > window.innerWidth - marginX) fixX = (window.innerWidth - marginX) - b.right;
    if (b.top < marginTop) fixY = marginTop - b.top;
    else if (b.bottom > window.innerHeight - marginBottom) fixY = (window.innerHeight - marginBottom) - b.bottom;
    if (fixX !== 0 || fixY !== 0) {
      const curL = parseFloat(evasiveBtn.style.left || '0');
      const curT = parseFloat(evasiveBtn.style.top || '0');
      if (!isNaN(curL)) evasiveBtn.style.left = `${curL + fixX}px`;
      if (!isNaN(curT)) evasiveBtn.style.top = `${curT + fixY}px`;
    }
  }

  function dodge(cursorX = null, cursorY = null) {
    if (!evasiveBtn || evasiveBtn.style.display === 'none') return;
    if (!isFinaleVisible()) return;

    const now = Date.now();
    if (now - lastDodgeTime < DODGE_COOLDOWN) return;
    lastDodgeTime = now;

    if (window.soundEngine) {
      window.soundEngine.playPop();
    }
    if (window.haptics) window.haptics(12);

    // 1. Change the phrase FIRST, then measure the real size
    remarkIdx = (remarkIdx + 1) % remarks.length;
    const txt = evasiveBtn.querySelector('.btn-text');
    if (txt) txt.textContent = remarks[remarkIdx];

    if (!isEscaped) {
      isEscaped = true;
      // Root fix: the decision card has a CSS transform (reveal animation),
      // which makes position:fixed children position relative to the CARD
      // instead of the viewport — that's what threw the button off-screen.
      // Moving it to <body> makes fixed coords = viewport coords.
      const b = evasiveBtn.getBoundingClientRect();
      document.body.appendChild(evasiveBtn);
      evasiveBtn.classList.remove('w-full');
      evasiveBtn.classList.add('escaped');
      // Anchor at its current visual spot so it doesn't jump on first escape
      evasiveBtn.style.left = `${b.left}px`;
      evasiveBtn.style.top = `${b.top}px`;
      // Force reflow so the fixed positioning applies before animating
      void evasiveBtn.offsetWidth;
    }

    // Measure AFTER text change + fixed positioning
    const btnWidth = evasiveBtn.offsetWidth || 180;
    const btnHeight = evasiveBtn.offsetHeight || 48;

    // Safe play zone: inside viewport, clear of dock + swipe hint
    const marginX = 16;
    const marginTop = 75;
    const marginBottom = 96;
    const minX = marginX;
    const maxX = Math.max(minX, window.innerWidth - btnWidth - marginX);
    const minY = marginTop;
    const maxY = Math.max(minY, window.innerHeight - btnHeight - marginBottom);

    let newX = minX, newY = minY;
    let attempts = 0;
    // Prefer a spot far from the cursor, but ALWAYS land inside bounds
    do {
      newX = minX + Math.random() * (maxX - minX);
      newY = minY + Math.random() * (maxY - minY);
      attempts++;
      if (cursorX === null || cursorY === null) break;
      const dist = Math.hypot(newX + btnWidth / 2 - cursorX, newY + btnHeight / 2 - cursorY);
      if (dist > 170 || attempts >= 25) break;
    } while (attempts < 25);

    // Hard clamp (belt & suspenders — never off-screen)
    newX = Math.min(Math.max(newX, minX), maxX);
    newY = Math.min(Math.max(newY, minY), maxY);

    evasiveBtn.style.left = `${newX}px`;
    evasiveBtn.style.top = `${newY}px`;
    evasiveBtn.style.transform = `rotate(${(Math.random() - 0.5) * 14}deg)`;

    // Verify after the transition lands
    clearTimeout(dodge._clampT);
    dodge._clampT = setTimeout(clampIntoViewport, 380);
  }

  // Laptop/Desktop mouse proximity: the mouse can NEVER touch the button
  window.addEventListener('mousemove', (e) => {
    if (!evasiveBtn || evasiveBtn.style.display === 'none') return;
    if (!isFinaleVisible()) return;
    const bRect = evasiveBtn.getBoundingClientRect();
    // Ignore if the button is currently off-screen (e.g. mid-scroll)
    if (bRect.width === 0) return;
    const dist = Math.hypot(e.clientX - (bRect.left + bRect.width / 2), e.clientY - (bRect.top + bRect.height / 2));
    if (dist < 110) dodge(e.clientX, e.clientY);
  });

  // Keep it inside on rotate/resize while escaped
  window.addEventListener('resize', clampIntoViewport);
  window.addEventListener('orientationchange', () => setTimeout(clampIntoViewport, 300));

  if (evasiveBtn) {
    evasiveBtn.addEventListener('mouseenter', (e) => dodge(e.clientX, e.clientY));
    evasiveBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      dodge(touch ? touch.clientX : null, touch ? touch.clientY : null);
    }, { passive: false });
    evasiveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dodge(e.clientX, e.clientY);
    });
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

        // Floating GIF stickers in the corners (looping, cleaned up after a while)
        const gifStickers = [
          { src: 'assets/gifs/heart-beat.gif', left: '8px', top: '70px' },
          { src: 'assets/gifs/party.gif', right: '8px', top: '70px' },
          { src: 'assets/gifs/love-bounce.gif', left: '8px', bottom: '24px' },
          { src: 'assets/gifs/sparkles.gif', right: '8px', bottom: '24px' }
        ];
        gifStickers.forEach(g => {
          const im = document.createElement('img');
          im.src = g.src;
          im.alt = '';
          im.className = 'gif-float-sticker';
          im.style.width = '64px';
          im.style.height = '64px';
          if (g.left) im.style.left = g.left;
          if (g.right) im.style.right = g.right;
          if (g.top) im.style.top = g.top;
          if (g.bottom) im.style.bottom = g.bottom;
          document.body.appendChild(im);
          setTimeout(() => im.remove(), 12000);
        });

        // Continuous stream of Apple emojis flying up
        const streamInterval = setInterval(() => {
          spawnFloatingEmoji();
          spawnFloatingEmoji();
        }, 220);

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
          const dateEl = document.getElementById('cert-date');
          if (dateEl) {
            try {
              dateEl.textContent = 'القاهرة في ' + new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
            } catch (e) {}
          }
          if (window.confetti) {
            window.confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 }, shapes: ['heart'] });
          }
        }, 2200);

        // Tap the document itself to fly hearts (no buttons on a real document)
        const certPaper = document.getElementById('forgive-cert-paper');
        if (certPaper) {
          certPaper.addEventListener('pointerdown', (e) => {
            window.haptics([15, 40, 15]);
            spawnBurstEmoji(e.clientX, e.clientY, 14);
            spawnLoveText(e.clientX, e.clientY);
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

  // 5. Main song autoplay: instantly if the browser allows, otherwise on the
  // very first interaction. Retried aggressively (gestures, tab return,
  // delayed retries) because browsers block audible autoplay until the user
  // interacts with the page — there is no way around that policy.
  const audio = document.getElementById('bg-music');
  let audioUnlocked = false;
  const tryPlayAudio = () => {
    if (audioUnlocked) return;
    // Route through the player: it unmutes a muted-autoplay session,
    // otherwise starts audible playback. Either way the song keeps the
    // timeline that started at page open.
    if (window.musicPlayer) {
      const mp = window.musicPlayer;
      if (mp.audio && mp.audio.muted && mp.mutedAutoplay) {
        mp.play(); // unmutes, keeps position
        audioUnlocked = true;
        return;
      }
    }
    if (audio && audio.paused) {
      audio.volume = 1.0;
      audio.muted = false;
      const pr = audio.play();
      if (pr && pr.then) {
        pr.then(() => {
          audioUnlocked = true;
          if (window.musicPlayer) {
            window.musicPlayer.isPlaying = true;
            window.musicPlayer.mutedAutoplay = false;
            window.musicPlayer.updateUI();
          }
        }).catch(() => {
          // Autoplay policy prevented, will play on first touch
        });
      } else {
        audioUnlocked = true;
      }
    } else if (audio && !audio.paused) {
      if (audio.muted && window.musicPlayer) {
        window.musicPlayer.play(); // unmute path
      }
      audioUnlocked = true;
    }
  };

  tryPlayAudio();
  // A few delayed retries in case the element wasn't ready yet
  [800, 2000, 4000].forEach(ms => setTimeout(tryPlayAudio, ms));
  const touchEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'scroll', 'keydown'];
  touchEvents.forEach(evt => {
    window.addEventListener(evt, tryPlayAudio, { capture: true });
    document.addEventListener(evt, tryPlayAudio, { capture: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlayAudio();
  });
  window.addEventListener('pageshow', tryPlayAudio);
});
