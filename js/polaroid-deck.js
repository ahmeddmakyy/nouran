// Swipeable Polaroid Card Stack with Real Touch & Drag Physics
class PolaroidDeck {
  constructor(deckId) {
    this.deck = document.getElementById(deckId);
    if (!this.deck) return;

    this.cards = Array.from(this.deck.querySelectorAll('.polaroid-card'));
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.topCard = null;

    this.prevBtn = document.getElementById('polaroid-prev-btn');
    this.nextBtn = document.getElementById('polaroid-next-btn');
    this.resetBtn = document.getElementById('polaroid-reset-btn');
    this.counterBadge = document.getElementById('polaroid-counter');

    this.rotations = [-2.5, 3, -1.8, 2.2, -0.5];

    this.initStack();
    this.bindEvents();
  }

  initStack() {
    this.cards.forEach((card, index) => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
      const offset = (index - this.currentIndex + this.cards.length) % this.cards.length;

      card.dataset.offset = offset;
      const rot = this.rotations[index % this.rotations.length];
      const scale = Math.max(0.85, 1 - offset * 0.04);
      const translateY = offset * 12;

      card.style.zIndex = this.cards.length - offset;
      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rot}deg)`;
      card.style.opacity = offset > 3 ? '0' : '1';
      card.style.pointerEvents = offset === 0 ? 'auto' : 'none';
    });

    this.topCard = this.cards[this.currentIndex];
    this.updateCounter();
  }

  updateCounter() {
    if (this.counterBadge) {
      this.counterBadge.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
    }
  }

  bindEvents() {
    const onStart = (e) => {
      if (!this.topCard) return;
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.startX = clientX;
      this.startY = clientY;
      this.currentX = 0;
      this.currentY = 0;

      this.topCard.style.transition = 'none';
      this.topCard.classList.add('grabbing');
    };

    const onMove = (e) => {
      if (!this.isDragging || !this.topCard) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.currentX = clientX - this.startX;
      this.currentY = clientY - this.startY;

      const rot = this.rotations[this.currentIndex % this.rotations.length] + this.currentX * 0.06;
      this.topCard.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(${rot}deg)`;

      // Animate next card scaling up slightly
      const nextCard = this.cards[(this.currentIndex + 1) % this.cards.length];
      if (nextCard) {
        const progress = Math.min(1, Math.abs(this.currentX) / 150);
        const nextScale = 0.96 + progress * 0.04;
        const nextY = 12 - progress * 12;
        nextCard.style.transform = `translate3d(0, ${nextY}px, 0) scale(${nextScale}) rotate(${this.rotations[(this.currentIndex + 1) % this.rotations.length]}deg)`;
      }
    };

    const onEnd = () => {
      if (!this.isDragging || !this.topCard) return;
      this.isDragging = false;
      this.topCard.classList.remove('grabbing');

      const threshold = 85;
      if (Math.abs(this.currentX) > threshold) {
        // Swipe away
        const dir = this.currentX > 0 ? 1 : -1;
        this.swipeCard(dir);
      } else {
        // Spring back
        this.topCard.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
        const rot = this.rotations[this.currentIndex % this.rotations.length];
        this.topCard.style.transform = `translate3d(0, 0, 0) scale(1) rotate(${rot}deg)`;

        const nextCard = this.cards[(this.currentIndex + 1) % this.cards.length];
        if (nextCard) {
          nextCard.style.transition = 'transform 0.4s ease';
          nextCard.style.transform = `translate3d(0, 12px, 0) scale(0.96) rotate(${this.rotations[(this.currentIndex + 1) % this.rotations.length]}deg)`;
        }
      }
    };

    // Attach to deck container
    this.deck.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.deck.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        this.swipeCard(1);
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        this.prevCard();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playChime();
        this.currentIndex = 0;
        this.initStack();
      });
    }
  }

  swipeCard(dir = 1) {
    if (!this.topCard) return;
    if (window.soundEngine) window.soundEngine.playPop();

    const targetX = dir * (window.innerWidth > 600 ? 550 : 380);
    const targetRot = dir * 28;

    this.topCard.style.transition = 'transform 0.4s ease-in, opacity 0.35s ease-in';
    this.topCard.style.transform = `translate3d(${targetX}px, ${this.currentY + 30}px, 0) rotate(${targetRot}deg)`;
    this.topCard.style.opacity = '0';

    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
      this.initStack();
    }, 320);
  }

  prevCard() {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.initStack();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.polaroidDeck = new PolaroidDeck('polaroid-deck');
});
