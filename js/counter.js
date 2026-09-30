// Real-time Relationship Counter since 10/7/2025
class RelationshipCounter {
  constructor() {
    this.startDate = new Date('2025-07-10T00:00:00');

    this.daysEl = document.getElementById('counter-days');
    this.hoursEl = document.getElementById('counter-hours');
    this.minsEl = document.getElementById('counter-mins');
    this.secsEl = document.getElementById('counter-secs');
    this.summaryEl = document.getElementById('counter-summary');
    this.counted = false;
    this.displayDays = 0;
    this.lastSecs = -1;

    [this.daysEl, this.hoursEl, this.minsEl, this.secsEl].forEach(el => {
      if (el) el.classList.add('counter-roll');
    });

    this.update();
    setInterval(() => this.update(), 1000);
  }

  countUp() {
    if (this.counted) return;
    this.counted = true;
    const now = new Date();
    const target = Math.floor((now - this.startDate) / 86400000);
    const start = performance.now();
    const dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      this.displayDays = Math.floor(target * eased);
      if (this.daysEl && !this._holding) {
        this.daysEl.textContent = this.displayDays.toLocaleString('ar-EG');
      }
      if (p < 1) requestAnimationFrame(step);
      else this._holding = false;
    };
    this._holding = true;
    requestAnimationFrame(step);
  }

  tick(el) {
    if (!el) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  update() {
    const now = new Date();
    const diffMs = Math.max(0, now - this.startDate);

    const totalSecs = Math.floor(diffMs / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHours = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const mins = totalMins % 60;
    const secs = totalSecs % 60;

    if (this.daysEl && !this._holding) this.daysEl.textContent = totalDays.toLocaleString('ar-EG');
    if (this.hoursEl) this.hoursEl.textContent = hours.toString().padStart(2, '0');
    if (this.minsEl) this.minsEl.textContent = mins.toString().padStart(2, '0');
    if (this.secsEl) {
      if (secs !== this.lastSecs) {
        this.secsEl.textContent = secs.toString().padStart(2, '0');
        this.tick(this.secsEl);
        this.lastSecs = secs;
      }
    }

    // Approximate breakdown in years & months
    const startYear = this.startDate.getFullYear();
    const startMonth = this.startDate.getMonth();
    const startDay = this.startDate.getDate();

    let curYear = now.getFullYear();
    let curMonth = now.getMonth();
    let curDay = now.getDate();

    let years = curYear - startYear;
    let months = curMonth - startMonth;
    let days = curDay - startDay;

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(curYear, curMonth, 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    let breakdownText = "";
    if (years > 0) breakdownText += `${years} سنة `;
    if (months > 0) breakdownText += `و ${months} شهر `;
    if (days > 0) breakdownText += `و ${days} يوم `;

    if (this.summaryEl) {
      this.summaryEl.innerHTML = `بقالنا سوا بالتمام <span class="text-rose-400 font-bold">${breakdownText.trim()}</span>.. أو بالأصح <span class="text-amber-300 font-bold">${totalDays} يوم</span> و <span class="text-rose-300 font-bold">${hours} ساعة</span> و <span class="text-amber-200 font-bold">${mins} دقيقة</span> و <span class="text-pink-300 font-bold">${secs} ثانية</span> من الحب والضحك، وكل ثانية بتمر وأنتي في حياتي بتسوى الدنيا وما فيها!`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.relationshipCounter = new RelationshipCounter();
});
