// Slide-based navigation, Evasive button, and Reconciliation finale
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.story-container');
  const slides = document.querySelectorAll('.story-slide');
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

  // 4. "صافية لبن" Finale
  const forgiveBtn = document.getElementById('forgive-btn');
  const finaleCard = document.getElementById('finale-success-card');

  if (forgiveBtn) {
    forgiveBtn.addEventListener('click', () => {
      // Confetti burst
      if (window.confetti) {
        window.confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          window.confetti({
            particleCount: 50,
            angle: 60,
            spread: 60,
            origin: { x: 0 }
          });
          window.confetti({
            particleCount: 50,
            angle: 120,
            spread: 60,
            origin: { x: 1 }
          });
        }, 300);
      }

      if (finaleCard) {
        finaleCard.classList.remove('hidden');
        finaleCard.scrollIntoView({ behavior: 'smooth' });
      }

      forgiveBtn.innerHTML = '<span>بحبك أوي يا نينو ❤️</span>';
      forgiveBtn.classList.add('bg-emerald-600');
    });
  }

  // Start music automatically on first user gesture anywhere
  let audioStarted = false;
  const startAudioOnFirstTouch = () => {
    if (audioStarted) return;
    audioStarted = true;
    if (window.musicPlayer && !window.musicPlayer.isPlaying) {
      window.musicPlayer.play();
    }
  };
  window.addEventListener('click', startAudioOnFirstTouch, { once: true });
  window.addEventListener('touchstart', startAudioOnFirstTouch, { once: true });
});
