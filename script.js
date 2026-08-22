// ---- Tema (arkaplan rengi + müzik) haritası ----
const themeMap = {
  main:         { color: '#1a0508', track: 'songs/aria.mp3', song: 'Aria of The Soul', artist: 'Shoji Meguro' },
  stats:        { color: '#2a0a0d', track: 'songs/specialist.mp3', song: 'specialist', artist: 'ATLUS Sound Team' },
  work:         { color: '#34090f', track: 'songs/beneath-the-mask-rain.mp3', song: 'Beneath the Mask -rain-', artist: 'Lyn' },
  edu:          { color: '#400f14', track: 'songs/iwatodai_dorm.mp3', song: 'Iwatodai Dorm', artist: 'Shoji Meguro' },
  equip:        { color: '#24080a', track: 'songs/last_surprise.mp3', song: 'Last Surprise', artist: 'Lyn' },
  quests:       { color: '#3a0d12', track: 'songs/triumph.mp3', song: 'Triumph', artist: 'ATLUS Sound Team' },
  system:       { color: '#2e0b0e', track: 'songs/signs-of-love.mp3', song: 'Signs Of Love', artist: 'Shihoko Hirata' },
  subscription: { color: '#3d0d10', track: 'songs/Heartbeat_Heartbreak.mp3', song: 'Heartbeat, Heartbreak', artist: 'Shihoko Hirata' },
  quit:         { color: '#150304', track: 'songs/time-of-joy.mp3', song: 'Time of Joy', artist: 'SEGA' },
};

const bgm = document.getElementById('bgm');
const audioToggleBtn = document.getElementById('audio-toggle');
const trackInfoDiv = document.getElementById('track-info');
let audioOn = true; // Müzik artık default olarak Açık başlar
let suppressAudioStateEvents = false; // sekme değişince şarkı otomatik değişir, bu "kullanıcı durdurdu" sayılmasın

// Simgeyi HER ZAMAN sesin gerçek durumuna göre güncelle (autoplay engeli gibi
// durumlarda simge ile gerçek çalma durumu birbirinden kopmasın diye)
bgm.addEventListener('play', () => {
  if (suppressAudioStateEvents) return;
  audioOn = true;
  audioToggleBtn.textContent = '🔊';
});

bgm.addEventListener('pause', () => {
  if (suppressAudioStateEvents) return;
  audioOn = false;
  audioToggleBtn.textContent = '🔇';
});

function applyTheme(id) {
  const theme = themeMap[id];
  if (!theme) return;

  document.body.style.backgroundColor = theme.color;
  
  if (trackInfoDiv) {
    trackInfoDiv.textContent = `♪ ${theme.song} - ${theme.artist}`;
  }

  if (bgm.getAttribute('data-current') !== theme.track) {
    // Şarkı değişimi sırasında tarayıcının tetiklediği pause/play olaylarını
    // "kullanıcı sesi kapattı/açtı" olarak yorumlama
    suppressAudioStateEvents = true;
    bgm.setAttribute('data-current', theme.track);
    bgm.src = theme.track;

    if (audioOn) {
      bgm.play()
        .then(() => { suppressAudioStateEvents = false; })
        .catch(() => {
          suppressAudioStateEvents = false;
          console.log("Tarayıcı autoplay engeli: İlk tıklamayı bekliyor.");
        });
    } else {
      suppressAudioStateEvents = false;
    }
  }
}

// Tarayıcı kuralları gereği autoplay engellenirse diye sayfaya bir kerelik dinleyici eklenir
document.body.addEventListener('click', () => {
  if (audioOn && bgm.paused) {
     bgm.play().catch(() => {});
  }
}, {once: true});

function toggleAudio() {
  // Gerçek durumu (bgm.paused) baz alarak aç/kapat; audioOn ve ikon
  // yukarıdaki play/pause dinleyicileri tarafından otomatik güncellenir
  if (bgm.paused) {
    bgm.play().catch(() => {});
  } else {
    bgm.pause();
  }
}

// --- IGOR İNTERAKTİF SOHBET SİSTEMİ (görsel tabanlı) ---
let hasLeftMainScreen = false; // Ana ekrandan en az bir kez ayrıldık mı? (welcome / welcome back ayrımı için)

function showChoices() {
  playSelectSound();
  const choicesContainer = document.getElementById('p5-choices');
  if (choicesContainer) {
    choicesContainer.style.display = 'flex';
  }
}

function selectChoice(choice, event) {
  event.stopPropagation(); // Seçime tıklanıldığında alttaki görselin tekrar tıklanmasını engeller
  playSelectSound();

  // Seçenekleri gizle
  document.getElementById('p5-choices').style.display = 'none';

  const scene = document.getElementById('igor-scene');

  if (choice === 'gtk') {
    scene.src = 'speech/igor-as-you-wish.png';
    scene.onclick = () => { showScreen('gtk'); };
  } else if (choice === 'quit') {
    scene.src = 'speech/igor-not-recommend.png';
    scene.onclick = () => { showScreen('quit'); };
  } else if (choice === 'subscription') {
    scene.src = 'speech/igor-interesting-choice.png';
    scene.onclick = () => { showScreen('subscription'); };
  }
}

// Ana ekrana her dönüşte çağrılır: ilk kez mi, yoksa "welcome back" mı?
function resetDialogue() {
  const scene = document.getElementById('igor-scene');
  if (!scene) return;

  scene.src = hasLeftMainScreen ? 'speech/igor-welcome-back.png' : 'speech/igor-welcome.png';
  scene.onclick = showChoices;

  const choicesContainer = document.getElementById('p5-choices');
  if (choicesContainer) choicesContainer.style.display = 'none';
}

// --- ÖMER'İN SUBSCRIPTION DİYALOĞU (görsel tabanlı, 2 adım) ---
let omerDialogueStep = 0;

function advanceOmerDialogue() {
  if (omerDialogueStep !== 0) return;
  playSelectSound();
  document.getElementById('omer-scene').src = 'speech/omer-subscribe-pitch.png';
  document.getElementById('subscribe-actions').classList.add('visible');
  omerDialogueStep = 1;
}

function resetOmerDialogue() {
  omerDialogueStep = 0;
  const scene = document.getElementById('omer-scene');
  const actions = document.getElementById('subscribe-actions');
  if (scene) scene.src = 'speech/omer-hello.png';
  if (actions) actions.classList.remove('visible');
}

// --- EKRAN GEÇİŞLERİ ---
function showScreen(screenId) {
  playSelectSound();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  if (screenId === 'main') {
    resetDialogue(); // ilk kez mi, "welcome back" mı olduğuna karar verir
  } else {
    hasLeftMainScreen = true;
  }

  if (screenId === 'subscription') {
    resetOmerDialogue();
  }

  if (screenId === 'gtk') {
    const activeInner = document.querySelector('#screen-gtk .section-content.active');
    applyTheme(activeInner ? activeInner.id : 'stats');
  } else {
    applyTheme(screenId);
  }
}

function showSection(sectionId) {
  playSelectSound();
  document.querySelectorAll('.section-content').forEach(el => {
    el.classList.remove('active');
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  applyTheme(sectionId);
}

function flipCard() {
  playSelectSound();
  const card = document.querySelector('.quest-card-inner');
  if (card) {
    card.classList.toggle('is-flipped');
  }
}

function openModal(imgSrc) {
  document.getElementById('modal-img').src = imgSrc;
  document.getElementById('cert-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('cert-modal').classList.remove('active');
}

function attemptQuit() {
  const messages = [
    "You shall not pass!",
    "You really thought it'd be that easy?",
    "Quitting requires a boss key. You don't have one. Or do you??",
    "Error 404: exit not found."
  ];
  document.getElementById('quit-message').textContent = messages[Math.floor(Math.random() * messages.length)];
  try { window.close(); } catch (e) {}
}

function playHoverSound() {
  try {
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
  } catch(e) {}
}

function playSelectSound() {
  try {
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
  } catch(e) {}
}

document.querySelectorAll('.menu-item, .p5-choice-btn').forEach(item => {
  item.addEventListener('mouseenter', playHoverSound);
});

// --- "sudo", "sudo quit" ve ":q" ---
let keyBuffer = "";
let sudoMode = false;

document.addEventListener('keydown', (e) => {
  if(!e.key) return; 
  keyBuffer += e.key.toLowerCase();
  if (keyBuffer.length > 20) keyBuffer = keyBuffer.slice(-20);

  if (keyBuffer.endsWith("sudo")) {
    sudoMode = true;
    console.log("As you wish.");
  }
  
  if (keyBuffer.endsWith("sudo quit") || keyBuffer.endsWith(":q")) {
    try { window.close(); } catch(err) {}
  }
});

// --- Kaçan "YES, QUIT" Butonu: Kademeli Alay Mesajları ---
let dodgeCount = 0;

function updateQuitMessage(count) {
  const msgEl = document.getElementById('quit-message');
  if (!msgEl) return;

  if (count === 2112) {
    msgEl.textContent = "Did you know Rush has an album called 2112 which is exactly the same amount you have been dealing with this button? Stop it.";
  } else if (count === 1903) {
    msgEl.textContent = "En Büyük Beşiktaş";
  } else if (count === 987) {
    msgEl.textContent = "TOOL have used Fibonacci Sequence in their song Lateralus.";
  } else if (count > 30) {
    msgEl.textContent = "Just write sudo to stop the button or write sudo quit to quit";
  // } else if (count === 23) {
  //  msgEl.textContent = "It’s my birthday YAY";
  } else if (count > 20) {
    msgEl.textContent = "Stop messing around.";
  } else if (count > 10) {
    msgEl.textContent = "Quitting may require a certain command. You don't have one. Or do you??";
  } else if (count > 5) {
    const pool = [
      "You shall not pass!",
    ];
    msgEl.textContent = pool[Math.floor(Math.random() * pool.length)];
  }
  // count 1-5 arası: mevcut mesaj olduğu gibi kalır
}

const trollBtn = document.querySelector('.btn-troll-yes');
if (trollBtn) {
  trollBtn.addEventListener('mouseenter', function() {
    if (sudoMode) return; 

    dodgeCount++;
    updateQuitMessage(dodgeCount);

    const randomX = Math.floor(Math.random() * 400) - 200; 
    const randomY = Math.floor(Math.random() * 300) - 150;
    
    this.style.transition = 'none'; 
    this.style.position = 'relative';
    this.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    playHoverSound();
  });
}

applyTheme('main');