// ---- Tema (arkaplan rengi + müzik) haritası ----
// Her ekran/bölüm için: sayfanın en arkasındaki renk ve (varsa) çalınacak parça.
const themeMap = {
  main:         { color: '#1a0508', track: 'aria.mp3', song: 'Aria of The Soul', artist: 'Shoji Meguro' },
  stats:        { color: '#2a0a0d', track: 'specialist.mp3', song: 'specialist', artist: 'ATLUS Sound Team' },
  work:         { color: '#34090f', track: 'beneath-the-mask-rain.mp3', song: 'Beneath the Mask -rain-', artist: 'Lyn' },
  edu:          { color: '#400f14', track: 'iwatodai_dorm.mp3', song: 'Iwatodai Dorm', artist: 'Shoji Meguro' },
  equip:        { color: '#24080a', track: 'last_surprise.mp3', song: 'Last Surprise', artist: 'Lyn' },
  quests:       { color: '#3a0d12', track: 'triumph.mp3', song: 'Triumph', artist: 'ATLUS Sound Team' },
  system:       { color: '#2e0b0e', track: 'signs-of-love.mp3', song: 'Signs Of Love', artist: 'Shihoko Hirata' },
  subscription: { color: '#3d0d10', track: 'Heartbeat_Heartbreak.mp3', song: 'Heartbeat Heartbreak', artist: 'Shihoko Hirata' },
  quit:         { color: '#150304', track: 'time-of-joy.mp3', song: 'Time of Joy', artist: 'SEGA' },
};


const bgm = document.getElementById('bgm');
const audioToggleBtn = document.getElementById('audio-toggle');
const trackInfoDiv = document.getElementById('track-info');
let audioOn = false;

function applyTheme(id) {
  const theme = themeMap[id];
  if (!theme) return;

  document.body.style.backgroundColor = theme.color;
  
  // Şarkı bilgisini arayüzde güncelle
  if (trackInfoDiv) {
    trackInfoDiv.textContent = `♪ ${theme.song} - ${theme.artist}`;
  }

  if (bgm.getAttribute('data-current') !== theme.track) {
    bgm.setAttribute('data-current', theme.track);
    bgm.src = theme.track;
    if (audioOn) {
      bgm.play().catch(() => {});
    }
  }
}

function toggleAudio() {
  audioOn = !audioOn;
  audioToggleBtn.textContent = audioOn ? '🔊' : '🔇';

  if (audioOn) {
    if (!bgm.getAttribute('data-current')) applyTheme('main');
    bgm.play().catch(() => {});
  } else {
    bgm.pause();
  }
}

// Ana ekranlar arası geçiş (Main, GTK, Subscription, Quit)
function showScreen(screenId) {
  playSelectSound();

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  if (screenId === 'gtk') {
    const activeInner = document.querySelector('#screen-gtk .section-content.active');
    applyTheme(activeInner ? activeInner.id : 'stats');
  } else {
    applyTheme(screenId);
  }
}

// Alt menü sekmeleri arası geçiş (Stats, Work, Edu vb.)
function showSection(sectionId) {
  playSelectSound();

  // Tüm içerikleri gizle
  document.querySelectorAll('.section-content').forEach(el => {
    el.classList.remove('active');
  });

  // Seçilen içeriği göster
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  applyTheme(sectionId);
}

// Troll Quit Butonu Fonksiyonu
function attemptQuit() {
  const messages = [
    "Nice try. This tab isn't going anywhere.",
    "You really thought it'd be that easy?",
    "Quitting requires a boss key. You don't have one.",
    "Error 404: exit not found.",
    "The only way out is through (my LinkedIn)."
  ];
  document.getElementById('quit-message').textContent =
    messages[Math.floor(Math.random() * messages.length)];

  try { window.close(); } catch (e) {}
}

// Ses Efektleri (Hover ve Click)
function playHoverSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function playSelectSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

// Butonlara hover efektlerini ekle
document.querySelectorAll('.menu-item, .main-menu-item').forEach(item => {
  item.addEventListener('mouseenter', playHoverSound);
});

// Troll Buton Işınlanma Özelliği
const trollBtn = document.querySelector('.btn-troll-yes');
if (trollBtn) {
  trollBtn.addEventListener('mouseenter', function() {
    // Fare butona değdiği AN, butonu -200px ile 200px arasında rastgele bir yere fırlat
    const randomX = Math.floor(Math.random() * 400) - 200; 
    const randomY = Math.floor(Math.random() * 300) - 150;
    
    // CSS geçişlerini (gecikmeyi) iptal et ki anında ışınlansın
    this.style.transition = 'none'; 
    this.style.position = 'relative'; // Hareket edebilmesi için
    this.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    // Sesi de ekleyelim ki kaçarken sinir bozucu olsun :)
    playHoverSound();
  });
}

// Başlangıç teması (ana menü)
applyTheme('main');