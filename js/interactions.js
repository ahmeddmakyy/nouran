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

  // 3. Evasive "لسه زعلانة" Button
  const evasiveBtn = document.getElementById('evasive-btn');
  const remarks = [
    "طب عشان خاطري أنا؟ 🥺",
    "طب عزومة بيتزا تانية في باسيلكو؟ 🍕",
    "طب بسبوسة وكيكة؟ 😋",
    "طب يا بنتي بطلي غلاسة بقى! 😂",
    "الزرار ده هربان أصلاً! 🏃‍♂️💨",
    "مفيش مفر.. دوسي صافية لبن ❤️"
  ];
  let remarkIdx = 0;

  function dodge(e) {
    if (!evasiveBtn) return;
    if (e) e.preventDefault();

    const parent = evasiveBtn.parentElement;
    const pRect = parent.getBoundingClientRect();

    const moveX = (Math.random() - 0.5) * Math.min(pRect.width * 0.7, 180);
    const moveY = (Math.random() - 0.5) * 80;

    evasiveBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;

    remarkIdx = (remarkIdx + 1) % remarks.length;
    const txt = evasiveBtn.querySelector('.btn-text');
    if (txt) txt.textContent = remarks[remarkIdx];
  }

  if (evasiveBtn) {
    evasiveBtn.addEventListener('mouseenter', dodge);
    evasiveBtn.addEventListener('touchstart', dodge, { passive: false });
    evasiveBtn.addEventListener('click', dodge);
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
      // 1. Hide the decision card completely - no text on the final screen!
      if (decisionCard) {
        decisionCard.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        decisionCard.style.transform = 'scale(0.8) translateY(-20px)';
        decisionCard.style.opacity = '0';
        setTimeout(() => {
          decisionCard.style.display = 'none';
        }, 500);
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

      // Also trigger canvas confetti
      if (window.confetti) {
        window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }
    });
  }

  // 5. Instant Audio Autoplay
  const audio = document.getElementById('bg-music');
  const tryPlayAudio = () => {
    if (audio && audio.paused) {
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
  window.addEventListener('click', tryPlayAudio, { once: true });
  window.addEventListener('touchstart', tryPlayAudio, { once: true });
  window.addEventListener('scroll', tryPlayAudio, { once: true });
});
