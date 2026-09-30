// Web Audio API Sound Effects Synthesizer + Tul8te Music Player
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft romantic harp chime
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + index * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.08);
      osc.stop(this.ctx.currentTime + index * 0.08 + 0.85);
    });
  }

  // Cute bubble / button pop
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // Sparkling magic chime for drawing heart
  playMagic() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 880 + Math.random() * 440;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.19);
  }

  // Rubber stamp thud
  playStamp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Victory fanfare for finale
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99], // C
      [587.33, 739.99, 880.00], // D
      [659.25, 830.61, 987.77], // E
      [783.99, 987.77, 1174.66], // G
      [1046.50, 1318.51, 1567.98] // High C
    ];

    chords.forEach((chord, i) => {
      const time = this.ctx.currentTime + i * 0.12;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.08, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + (i === chords.length - 1 ? 1.2 : 0.25));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + (i === chords.length - 1 ? 1.3 : 0.28));
      });
    });
  }
}

class MusicPlayer {
  constructor() {
    this.audio = document.getElementById('bg-music');
    this.playBtn = document.getElementById('music-toggle-btn');
    this.vinyl = document.getElementById('vinyl-disc');
    this.lyricsBanner = document.getElementById('lyrics-ticker');
    this.equalizer = document.getElementById('music-equalizer');
    this.progressBar = document.getElementById('music-progress');
    this.timeDisplay = document.getElementById('music-time');

    this.isPlaying = false;
    this.lyrics = [
      { time: 0, text: "ولا عاش ولا كان دا اللي يبكيك.. ده أنا أبيع الناس ولا أفرط فيك ❤️" },
      { time: 16, text: "العينين سابقة الكلام.. وأنا عيني ليك مفهاش كلام ✨" },
      { time: 24, text: "نفسي أعيش كل الليالي وياك.. وياك 🌙" },
      { time: 32, text: "واللي قالوا هسيب ايديك.. يا حبيبي دول ضاحكين عليك 🫂" },
      { time: 39, text: "مهما كان دايماً مكاني وياك.. وياك 💖" },
      { time: 46, text: "آه ولا عاش ولا كان دا اللي يبكيك.. ده أنا أبيع الناس ولا أفرط فيك 🌹" },
      { time: 54, text: "بقى ده اسمه كلام.. يا حبيبي الله يخليك خليك 🥺" },
      { time: 61, text: "ولا تيجي في يوم وتلاقي الباب مقفول.. معقول؟ 🚪" },
      { time: 108, text: "إنتي فين والباقي فين؟ بقى دول عينين ينفع يناموا يوم زعلانين؟ 🥺❤️" },
      { time: 123, text: "هوه إنتي مين زيك هنا؟ إنتي جايبالي الكلام.. بيسألوني زعلانة ليه وموقعاني في مشكلة!" },
      { time: 146, text: "آه ولا عاش ولا كان دا اللي يبكيك.. ده أنا أبيع الناس ولا أفرط فيك! 👑" }
    ];

    this.initEvents();
  }

  initEvents() {
    if (!this.audio) return;

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        window.soundEngine.playPop();
        this.toggle();
      });
    }

    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
      this.updateLyrics();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updateUI();
    });
  }

  play() {
    if (!this.audio) return;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
    }).catch(err => {
      console.log("Audio autoplay prevented by browser policy:", err);
    });
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateUI() {
    if (this.vinyl) {
      if (this.isPlaying) {
        this.vinyl.classList.add('spinning');
      } else {
        this.vinyl.classList.remove('spinning');
      }
    }

    if (this.equalizer) {
      if (this.isPlaying) {
        this.equalizer.classList.add('playing');
      } else {
        this.equalizer.classList.remove('playing');
      }
    }

    if (this.playBtn) {
      const playIcon = this.playBtn.querySelector('.icon-play');
      const pauseIcon = this.playBtn.querySelector('.icon-pause');
      if (playIcon && pauseIcon) {
        playIcon.style.display = this.isPlaying ? 'none' : 'block';
        pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
      }
    }
  }

  updateProgress() {
    if (!this.audio || !this.progressBar) return;
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = `${progress || 0}%`;

    if (this.timeDisplay) {
      const curM = Math.floor(this.audio.currentTime / 60);
      const curS = Math.floor(this.audio.currentTime % 60).toString().padStart(2, '0');
      const durM = Math.floor((this.audio.duration || 0) / 60);
      const durS = Math.floor((this.audio.duration || 0) % 60).toString().padStart(2, '0');
      this.timeDisplay.textContent = `${curM}:${curS} / ${durM}:${durS}`;
    }
  }

  updateLyrics() {
    if (!this.audio || !this.lyricsBanner) return;
    const current = this.audio.currentTime;
    let activeLyric = this.lyrics[0].text;

    for (let i = this.lyrics.length - 1; i >= 0; i--) {
      if (current >= this.lyrics[i].time) {
        activeLyric = this.lyrics[i].text;
        break;
      }
    }

    if (this.lyricsBanner.textContent !== activeLyric) {
      this.lyricsBanner.style.opacity = '0';
      setTimeout(() => {
        this.lyricsBanner.textContent = activeLyric;
        this.lyricsBanner.style.opacity = '1';
      }, 200);
    }
  }
}

window.soundEngine = new SoundEngine();
document.addEventListener('DOMContentLoaded', () => {
  window.musicPlayer = new MusicPlayer();
});
