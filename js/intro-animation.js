/* ==========================================================================
   ENTRANCE GATE & CANVAS INTRO ENG (UNMUTED OVERRIDE AUTOPLAY CLEAR)
   ========================================================================== */
(function(){
  const canvas = document.getElementById('intro-canvas');
  const enterBtn = document.getElementById('enter-system-btn');
  const introGate = document.getElementById('intro-gate');
  const progressFill = document.querySelector('.intro-progress');

  if (!canvas || !enterBtn) return;
  const ctx = canvas.getContext('2d');
  let W, H, CX, CY;
  
  const localIsMob = window.isMob || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
  }

  function getPMPoints(count) {
    const off = document.createElement('canvas');
    const LH = Math.min(H * .45, 260); 
    off.width = W; off.height = H;
    const ox = off.getContext('2d');
    ox.fillStyle = '#fff';
    ox.font = `900 ${LH}px 'Bebas Neue',sans-serif`;
    ox.textAlign = 'center'; ox.textBaseline = 'middle';
    ox.fillText('PM', W / 2, H / 2);
    
    const data = ox.getImageData(0, 0, W, H).data;
    const pts = [];
    const step = localIsMob ? 14 : 10; 
    
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y });
      }
    }
    
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts.slice(0, count);
  }

  let shards = [];
  const SHARD_N = localIsMob ? 35 : 65; 

  function makeVerts(size, sides) {
    const v = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + Math.random() * .4 - .2;
      v.push({ a, r: size * (.5 + Math.random() * .5) });
    }
    return v;
  }

  function initializeShards() {
    const targets = getPMPoints(SHARD_N);
    shards = [];
    targets.forEach(t => {
      const r = Math.random();
      const hue = r < .55 ? 265 : (r < .82 ? 190 : 320);
      const size = localIsMob ? (8 + Math.random() * 12) : (10 + Math.random() * 18);
      shards.push({
        cx: t.x, cy: t.y, fx: t.x, fy: t.y,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - .5) * .015,
        verts: makeVerts(size, 3), 
        size, hue,
        baseAlpha: .4 + Math.random() * .4,
        vx: 0, vy: 0
      });
    });
  }

  function easeInExpo(t) { return t === 0 ? 0 : Math.pow(2, 8 * t - 8); }

  function drawShard(s, alpha) {
    ctx.save();
    ctx.translate(s.cx, s.cy);
    ctx.rotate(s.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.beginPath();
    s.verts.forEach((v, i) => {
      const x = Math.cos(v.a) * v.r, y = Math.sin(v.a) * v.r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    
    const g = ctx.createLinearGradient(-s.size, -s.size, s.size, s.size);
    g.addColorStop(0, `hsla(${s.hue + 10},90%,85%,${alpha})`);
    g.addColorStop(1, `hsla(${s.hue - 10},60%,40%,${alpha * .6})`);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }

  const sparks = [];
  function spawnSparks() {
    shards.forEach(s => {
      for (let i = 0; i < 2; i++) { 
        const ang = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 9; 
        sparks.push({ x: s.fx, y: s.fy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1, life: 1, hue: s.hue, r: 1 + Math.random() * 1.5 });
      }
    });
  }

  let phase = 'hold';
  let holdTimer = 0, explodeProgress = 0;
  
  const HOLD_DUR = 2500;    
  const EXPLODE_DUR = 1400; 
  
  let lastTS = null, introRunning = true;
  const barEl = document.getElementById('intro-bar');
  let barFill = 0;

  function introFrame(ts) {
    if (!introRunning || document.hidden) return;
    if (!lastTS) lastTS = ts;
    const dt = Math.min(ts - lastTS, 33); 
    lastTS = ts;

    ctx.clearRect(0, 0, W, H);

    if (phase === 'hold') {
      holdTimer += dt;
      barFill = Math.min(holdTimer / HOLD_DUR, 1);
      if (barEl) barEl.style.width = (barFill * 100) + '%';

      ctx.fillStyle = 'rgba(0,0,0,.95)';
      ctx.fillRect(0, 0, W, H);

      const pulse = .94 + Math.sin(holdTimer * .002) * .06;

      shards.forEach(s => {
        s.rot += s.rotV;
        const ox = (s.fx - CX) * (pulse - 1);
        const oy = (s.fy - CY) * (pulse - 1);
        s.cx = s.fx + ox; s.cy = s.fy + oy;
        drawShard(s, s.baseAlpha);
      });

      const gProg = Math.min(holdTimer / 500, 1);
      const LH = Math.min(H * .45, 260);
      ctx.save();
      ctx.globalAlpha = gProg * .85;
      
      const tg = ctx.createLinearGradient(W/2-150, H/2-LH/2, W/2+150, H/2+LH/2);
      tg.addColorStop(0, '#fff'); tg.addColorStop(0.5, '#c8b4ff'); tg.addColorStop(1, '#00e5ff');
      
      ctx.fillStyle = tg;
      ctx.font = `900 ${LH}px 'Bebas Neue',sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('PM', W / 2, H / 2);
      ctx.restore();

      if (holdTimer > 800) {
        const sp = Math.min((holdTimer - 800) / 500, 1);
        ctx.save(); ctx.globalAlpha = sp;
        ctx.font = `400 ${localIsMob ? '.6rem' : '.85rem'} 'Space Mono',monospace`;
        ctx.fillStyle = 'rgba(0,229,255,.8)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('ML ENGINEER  ·  AI ARCHITECT  ·  CHICAGO IL', W / 2, H / 2 + LH * .6);
        ctx.restore();
      }

      if (holdTimer >= HOLD_DUR) {
        phase = 'explode';
        spawnSparks();
        shards.forEach(s => {
          const ang = Math.atan2(s.fy - CY, s.fx - CX);
          const spd = 8 + Math.random() * 12; 
          s.vx = Math.cos(ang) * spd + (Math.random() - .5) * 3;
          s.vy = Math.sin(ang) * spd + (Math.random() - .5) * 3 - 1;
          s.rotV = (Math.random() - .5) * .1;
        });
        explodeProgress = 0;
      }

    } else if (phase === 'explode') {
      explodeProgress = Math.min(explodeProgress + dt / EXPLODE_DUR, 1);
      const life = 1 - easeInExpo(explodeProgress);
      ctx.fillStyle = `rgba(0,0,0,${.95 * (1 - explodeProgress * .8)})`;
      ctx.fillRect(0, 0, W, H);

      shards.forEach(s => {
        s.cx += s.vx * (1 + explodeProgress * 0.8);
        s.cy += s.vy * (1 + explodeProgress * 0.8);
        s.vy += .35; s.rot += s.rotV * 1.5;
        drawShard(s, s.baseAlpha * life);
      });

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += .15; sp.life -= dt / 800; 
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${sp.hue},90%,75%,${sp.life * .7})`; ctx.fill();
      }

      const tf = Math.max(0, 1 - explodeProgress * 2.2);
      if (tf > 0) {
        const LH = Math.min(H * .45, 260);
        ctx.save(); ctx.globalAlpha = tf;
        const tg = ctx.createLinearGradient(W/2-150, H/2-LH/2, W/2+150, H/2+LH/2);
        tg.addColorStop(0, '#fff'); tg.addColorStop(1, '#9b6dff');
        ctx.font = `900 ${LH}px 'Bebas Neue',sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = tg; ctx.fillText('PM', W / 2, H / 2);
        ctx.restore();
      }

      if (explodeProgress >= 1) {
        introRunning = false;
        ctx.clearRect(0, 0, W, H);
        
        const videoEl = document.getElementById('intro-video');
        const skipBtn = document.getElementById('skip-intro-btn');
        const introEl = document.getElementById('intro');
        
        function completeIntroExit() {
          if (!introEl) return;
          videoEl.pause();
          
          let op = 1;
          function doFade() {
            introEl.style.opacity = op; 
            op -= .04; 
            if (op > 0) {
              requestAnimationFrame(doFade);
            } else {
              introEl.style.display = 'none';
              
              // INITIATE ACTIVE 3D ASSET WORLD PIPELINES UPON FADEOUT
              if (window.threeEcosystem) { window.threeEcosystem.init(); }
            }
          }
          requestAnimationFrame(doFade);
        }

        if (videoEl) {
          canvas.style.display = 'none';
          if (barEl) barEl.parentElement.style.display = 'none';
          
          videoEl.style.display = 'block';
          setTimeout(() => videoEl.classList.add('visible'), 50);
          if (skipBtn) skipBtn.style.display = 'block';

          videoEl.muted = false;
          videoEl.play().catch(err => {
            console.log("Audio pipeline interaction fallback:", err);
            completeIntroExit();
          });

          videoEl.onended = function() { completeIntroExit(); };
          if (skipBtn) { skipBtn.onclick = function() { completeIntroExit(); }; }
        } else {
          completeIntroExit();
        }
        return;
      }
    }
    requestAnimationFrame(introFrame);
  }

  enterBtn.addEventListener('click', () => {
    introGate.style.display = 'none';
    canvas.style.display = 'block';
    if (progressFill) progressFill.style.display = 'block';
    resize();
    initializeShards();
    lastTS = performance.now();
    requestAnimationFrame(introFrame);
  });
})();