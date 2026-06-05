/* ==========================================================================
   MAIN CORE APPLICATION ORCHESTRATOR WITH AUDIO & THEME ENGINE
   ========================================================================== */

/* ── CURSOR INTERACTION ENGINE ── */
if (!window.isMob) {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let cx = 0, cy = 0, rx = 0, ry = 0;
  
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
  }, { passive: true });

  (function loopCur() {
    if (cur && ring) {
      cur.style.transform = `translate3d(${cx - 5}px, ${cy - 5}px, 0)`;
      rx += (cx - rx) * .15; 
      ry += (cy - ry) * .15;
      ring.style.transform = `translate3d(${rx - 17}px, ${ry - 17}px, 0)`;
    }
    requestAnimationFrame(loopCur);
  })();
  
  document.querySelectorAll('a,button,.tl-card,.sk-card,.proj-card,.stat,.edu-card,.clink,.cert-card,.form-btn,.testi-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}

/* ── MAGNETIC BUTTON INTERACTIONS ── */
if (!window.isMob) {
  document.querySelectorAll('.mag-btn').forEach(wrap => {
    const btn = wrap.querySelector('a,button');
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = e.clientY - r.top - r.height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) { btn.style.transform = `translate(${dx * .35}px,${dy * .35}px)`; }
    });
    wrap.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── 3D COMPONENT CARD TILT ── */
if (!window.isMob) {
  document.querySelectorAll('.sk-card,.proj-card,.tl-card,.cert-card,.edu-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
      if (card.classList.contains('sk-card')) {
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
  
  const pf = document.getElementById('photo-frame');
  if (pf) {
    pf.parentElement.addEventListener('mousemove', e => {
      const r = pf.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      pf.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
    });
    pf.parentElement.addEventListener('mouseleave', () => { pf.style.transform = ''; });
  }
}

/* ── INTERACTIVE INLINE BUTTON RIPPLES ── */
document.querySelectorAll('.btn-p,.btn-g,.form-btn,.pla').forEach(btn => {
  btn.style.position = 'relative'; btn.style.overflow = 'hidden';
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.left = (e.clientX - r.left) + 'px'; rip.style.top = (e.clientY - r.top) + 'px';
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  });
});

/* ── SCROLL DETECTOR AND PROGRESS MAPPING ── */
const scrollBarEl = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
  const s = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollBarEl) scrollBarEl.style.width = (s / h * 100) + '%';
  document.getElementById('btt').classList.toggle('show', s > 400);
  document.getElementById('site-header').classList.toggle('scrolled', s > 80);
  document.querySelectorAll('section[id]').forEach(sec => {
    if (s >= sec.offsetTop - 140)
      document.querySelectorAll('.nav-links a').forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id); });
  });
}, { passive: true });
document.getElementById('btt').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── MOBILE NAV OVERLAY CONTROLLERS ── */
function toggleMobNav() { document.getElementById('mob-nav').classList.toggle('open'); document.getElementById('hamburger').classList.toggle('open'); }
function closeMobNav() { document.getElementById('mob-nav').classList.remove('open'); document.getElementById('hamburger').classList.remove('open'); }

/* ── HERO TEXT WRITER LOOP ── */
const phrases = ['ML Engineer', 'LLM Engineer', 'RAG Architect', 'MLOps Builder', 'AI Platform Engineer'];
let pi = 0, ci = 0, del = false;
const twEl = document.getElementById('tw');
function typeWrite() {
  const w = phrases[pi];
  if (!del) { twEl.textContent = w.slice(0, ++ci); if (ci === w.length) { del = true; setTimeout(typeWrite, 1500); return; } }
  else { twEl.textContent = w.slice(0, --ci); if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; } }
  setTimeout(typeWrite, del ? 48 : 82);
}
setTimeout(typeWrite, 600);

/* ── TERMINAL LOG PRINT OUT INTERSECTION EXECUTION ── */
const termLines = [
  { type: 'cmd', prompt: 'pranav@ml', cmd: 'whoami' },
  { type: 'out', html: `<strong>Pranav Murali</strong> — ML Engineer · <span class="hl">LLM/RAG Architect</span> · Chicago, IL` },
  { type: 'cmd', prompt: 'pranav@ml', cmd: 'cat stack.json' },
  { type: 'out', html: `<span class="hl3">languages</span>: Python · SQL · R` },
  { type: 'out', html: `<span class="hl3">frameworks</span>: PyTorch · LangChain · HuggingFace · Scikit-learn` },
  { type: 'out', html: `<span class="hl3">cloud</span>: AWS SageMaker · Azure ML · GCP Vertex AI` },
  { type: 'out', html: `<span class="hl3">infra</span>: Docker · Kubernetes · Airflow · Kafka` },
  { type: 'cmd', prompt: 'pranav@ml', cmd: 'cat mission.txt' },
  { type: 'out', html: `Building <span class="hl">production-grade AI</span> that runs at <span class="hl2">10M+ records/day</span>.` },
  { type: 'out', html: `From raw data streams to deployed, monitored, <span class="hl">self-healing</span> ML systems.` },
  { type: 'out', html: `Currently @ <span class="hl3">Comcast</span> — open to <span class="hl">senior ML/LLM roles</span> <span class="hl2">globally</span>.` },
  { type: 'cmd', prompt: 'pranav@ml', cmd: '_', 'cursor': true }
];
const tbody = document.getElementById('terminal-body');
let termIdx = 0;
const termIO = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { runTerminal(); termIO.disconnect(); }
}, { threshold: .3 });
if (document.getElementById('about')) termIO.observe(document.getElementById('about'));
function runTerminal() {
  if (termIdx >= termLines.length) return;
  const line = termLines[termIdx++];
  const el = document.createElement('div');
  if (line.type === 'cmd') {
    el.className = 'term-line';
    el.innerHTML = `<span class="term-prompt">${line.prompt} ~$</span><span class="term-cmd">${line.cmd}</span>${line.cursor ? '<span class="term-cursor-blink"></span>' : ''}`;
    tbody.appendChild(el);
  } else {
    el.className = 'term-out'; el.innerHTML = line.html; tbody.appendChild(el);
  }
  tbody.scrollTop = tbody.scrollHeight;
  setTimeout(runTerminal, line.type === 'cmd' ? 280 : 180);
}

/* ── TEXT GLITCH MATRIX TRIGGER ON MENU LINKS ── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el) {
  const orig = el.textContent;
  let iter = 0;
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((c, i) => {
      if (c === ' ') return ' ';
      if (i < iter) return orig[i];
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    if (iter >= orig.length) clearInterval(iv);
    iter += .5;
  }, 40);
}
document.querySelectorAll('.nav-links a').forEach(a => { a.addEventListener('mouseenter', () => scramble(a)); });

/* ── ELEMENT VISIBILITY ANIMATION LOOPS ── */
document.querySelectorAll('.sec-title span').forEach(span => {
  const words = span.textContent.split(' ');
  span.innerHTML = words.map((w, i) => `<span class="word" style="transition-delay:${i * .1}s">${w}</span>`).join(' ');
});
const wordIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.querySelectorAll('.word').forEach(w => w.classList.add('visible'));
  });
}, { threshold: .2 });
document.querySelectorAll('.sec-title').forEach(t => wordIO.observe(t));

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.anim-item').forEach((el, i) => {
  el.style.transition = `opacity .6s ${i * .08}s ease, transform .6s ${i * .08}s ease`;
  io.observe(el);
});
document.head.insertAdjacentHTML('beforeend', `<style>.anim-item{opacity:0;transform:translateY(40px);}.anim-item.visible{opacity:1!important;transform:none!important;}</style>`);

/* ── METRIC COUNTER TRIGGERS ── */
document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  const ioS = new IntersectionObserver(en => {
    if (en[0].isIntersecting) {
      const target = parseFloat(el.dataset.target), isF = target % 1 !== 0;
      let n = 0, step = target / 70;
      const iv = setInterval(() => {
        n = Math.min(n + step, target);
        el.textContent = isF ? n.toFixed(1) : Math.round(n);
        if (n >= target) clearInterval(iv);
      }, 16);
      ioS.disconnect();
    }
  }, { threshold: .5 });
  ioS.observe(el);
});

/* ── PROGRESS FILL LOADS ── */
document.querySelectorAll('.sk-fill').forEach(bar => {
  const ioB = new IntersectionObserver(en => {
    if (en[0].isIntersecting) { setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 200); ioB.disconnect(); }
  }, { threshold: .3 });
  ioB.observe(bar);
});

/* ── ENDPOINT CONTACT PIPELINE ── */
const form = document.getElementById('contact-form');
if (form) {
  const btn = form.querySelector('.form-btn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.textContent = 'Transmitting...'; btn.disabled = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' })
      .then(() => { btn.textContent = 'Signal Sent ✓'; form.reset(); setTimeout(() => { btn.textContent = 'Send Message →'; btn.disabled = false; }, 4000); })
      .catch(() => { btn.textContent = 'Error — Retry'; setTimeout(() => { btn.textContent = 'Send Message →'; btn.disabled = false; }, 3000); });
  });
}

/* ── COSMIC AUDIO ENGINE & THEME CONTROLLER ── */
const themeBtn = document.getElementById('theme-toggle');
const bodyEl = document.body;

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    bodyEl.classList.toggle('supernova');
    const isSupernova = bodyEl.classList.contains('supernova');
    themeBtn.innerHTML = isSupernova ? `<i class="fas fa-moon"></i>` : `<i class="fas fa-sun"></i>`;
    if (window.playCosmicSound) window.playCosmicSound('click');
  });
}

let audioCtx = null;
let isMuted = true;
const audioBtn = document.getElementById('audio-toggle');

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

window.playCosmicSound = function(type) {
  if (isMuted) return;
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  } 
  else if (type === 'implode') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }
};

if (audioBtn) {
  audioBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    initAudio();
    audioBtn.innerHTML = isMuted ? `<i class="fas fa-volume-mute"></i>` : `<i class="fas fa-volume-up"></i>`;
    audioBtn.style.color = isMuted ? 'var(--muted)' : 'var(--cyan)';
    audioBtn.style.borderColor = isMuted ? 'rgba(108,47,255,0.2)' : 'var(--cyan)';
    if (!isMuted) window.playCosmicSound('click');
  });
}

document.querySelectorAll('a, button, .tl-card, .sk-card, .proj-card, .cert-card, .edu-card').forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (!isMuted) window.playCosmicSound('click');
  });
});