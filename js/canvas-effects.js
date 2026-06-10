/* ==========================================================================
   PERFECT AMBIENT BACKGROUND SYSTEM: PILOT FLIGHT INJECTED & DEVICE BALANCED
   ========================================================================== */
// Initialize global control switches safely before execution loops spin up
window.isGameMode = window.isGameMode || false;
window.isMob = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
if (window.isMob) document.body.classList.add('mobile');

let scrollY = 0, mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
window.addEventListener('scroll', () => scrollY = window.scrollY, { passive: true });

// Always capture precise pointer coordinates across all form environments
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
}, { passive: true });

document.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

const sc = document.getElementById('c-stars'), sx = sc.getContext('2d');
const pc = document.getElementById('c-particles'), px = pc.getContext('2d');
const tc = document.getElementById('c-cursor-trail'), tx2 = tc.getContext('2d');
const gc = document.getElementById('c-grid'), gx = gc.getContext('2d');

function resizeAll() {
    const w = window.innerWidth, h = window.innerHeight;
    sc.width = pc.width = tc.width = gc.width = w;
    sc.height = pc.height = tc.height = gc.height = h;
}
resizeAll();
window.addEventListener('resize', resizeAll, { passive: true });

const STARS = [];
const N = window.isMob ? 60 : 150;
for (let i = 0; i < N; i++) {
    STARS.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.3 + .2,
        a: Math.random(),
        twOff: Math.random() * Math.PI * 2,
        twSpd: .4 + Math.random() * 1.2,
        hue: Math.random() < .2 ? (Math.random() < .5 ? 270 : 190) : 0
    });
}

const SHOOTS = [];
function spawnShoot() {
    if (document.hidden || SHOOTS.length > 4) return;
    SHOOTS.push({ 
        x: Math.random() * window.innerWidth * 0.9, 
        y: Math.random() * window.innerHeight * 0.3, 
        len: 120 + Math.random() * 180, 
        ang: Math.PI / 4 + Math.random() * 0.15, 
        spd: 16 + Math.random() * 12, 
        life: 1, 
        hue: Math.random() < 0.6 ? 190 : 270 
    });
}
setInterval(spawnShoot, 3500);

const PLANETS = [];
const planetColors = [
    { base: '#6c2fff', accent: '#00e5ff', ring: true },  
    { base: '#ff3cac', accent: '#9b6dff', ring: false }, 
    { base: '#06041a', accent: '#ffb700', ring: true }
];
for (let i = 0; i < planetColors.length; i++) {
    const colors = planetColors[i];
    PLANETS.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 1.8), 
        r: window.isMob ? (20 + Math.random() * 25) : (40 + Math.random() * 55),
        parallaxFactor: 0.04 + Math.random() * 0.08, 
        color1: colors.base, color2: colors.accent, hasRing: colors.ring,
        ringAngle: (Math.random() * 0.4) - 0.2, rotSpd: (Math.random() * 0.002) - 0.001, angle: Math.random() * Math.PI
    });
}

const SHIPS = [];
const LASERS = [];

if (!window.isMob) {
    SHIPS.push({ id: 1, role: 'chaser', team: 'cyan', x: 200, y: 300, vx: 3, vy: 2, r: 22, spinAngle: 0, cooldown: 0, targetId: 2 });
    SHIPS.push({ id: 2, role: 'target', team: 'red', x: window.innerWidth - 200, y: window.innerHeight - 300, vx: -5, vy: -3, r: 18, spinAngle: 0 });
}

function updateBattleSystem() {
    if (window.isMob || document.hidden) return;

    const w = window.innerWidth, h = window.innerHeight;
    const cyanHunter = SHIPS.find(s => s.team === 'cyan');
    const redTarget = SHIPS.find(s => s.team === 'red');

    if (redTarget) {
        if (Math.random() < 0.05) {
            const wanderAngle = Math.random() * Math.PI * 2;
            redTarget.vx += Math.cos(wanderAngle) * 2.8;
            redTarget.vy += Math.sin(wanderAngle) * 2.8;
        }
        const speed = Math.sqrt(redTarget.vx * redTarget.vx + redTarget.vy * redTarget.vy);
        if (speed > 8) { redTarget.vx *= 0.85; redTarget.vy *= 0.85; }
        redTarget.vx *= 0.98; redTarget.vy *= 0.98;
        redTarget.x += redTarget.vx; redTarget.y += redTarget.vy;
        redTarget.spinAngle += 0.22;
        if (redTarget.x < -50) redTarget.x = w + 50;
        else if (redTarget.x > w + 50) redTarget.x = -50;
        if (redTarget.y < -50) redTarget.y = h + 50;
        else if (redTarget.y > h + 50) redTarget.y = -50;
    }

    if (cyanHunter && redTarget) {
        // Evaluate global window boolean states explicitly
        if (window.isGameMode === true) {
            // MANUAL PILOTING MODE: Anchor physics vectors onto mouse cursor position offsets
            const dxMouse = mouseX - cyanHunter.x;
            const dyMouse = mouseY - cyanHunter.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distMouse > 10) {
                cyanHunter.vx += (dxMouse / distMouse) * 0.45;
                cyanHunter.vy += (dyMouse / distMouse) * 0.45;
            }
            // Increase drag coefficient so ship stops precisely with cursor movement
            cyanHunter.vx *= 0.92; cyanHunter.vy *= 0.92;
        } else {
            // AUTONOMOUS AI CHASE MODE (Original Portfolio codebase algorithm)
            const dx = redTarget.x - cyanHunter.x;
            const dy = redTarget.y - cyanHunter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 30) {
                cyanHunter.vx += (dx / distance) * 0.22;
                cyanHunter.vy += (dy / distance) * 0.22;
            }
            cyanHunter.vx *= 0.95; cyanHunter.vy *= 0.95;
        }

        cyanHunter.x += cyanHunter.vx; cyanHunter.y += cyanHunter.vy;
        cyanHunter.spinAngle += window.isGameMode ? 0.15 : 0.06;
        
        if (cyanHunter.x < -50) cyanHunter.x = w + 50;
        else if (cyanHunter.x > w + 50) cyanHunter.x = -50;
        if (cyanHunter.y < -50) cyanHunter.y = h + 50;
        else if (cyanHunter.y > h + 50) cyanHunter.y = -50;

        if (cyanHunter.cooldown > 0) cyanHunter.cooldown--;
        const inBounds = (cyanHunter.x > 50 && cyanHunter.x < w - 50 && cyanHunter.y > 50 && cyanHunter.y < h - 50);
        const currentTargetDistance = Math.sqrt((redTarget.x - cyanHunter.x)**2 + (redTarget.y - cyanHunter.y)**2);
        
        if (cyanHunter.cooldown === 0 && inBounds && currentTargetDistance < 600) {
            const leadX = redTarget.x + redTarget.vx * 1.5;
            const leadY = redTarget.y + redTarget.vy * 1.5;
            const fireAngle = Math.atan2(leadY - cyanHunter.y, leadX - cyanHunter.x);
            LASERS.push({ x: cyanHunter.x, y: cyanHunter.y, vx: Math.cos(fireAngle) * 10, vy: Math.sin(fireAngle) * 10, life: 85 });
            cyanHunter.cooldown = window.isGameMode ? 20 : 32; // Drops cool-off steps down for smooth player weapon response
        }
    }

    for (let i = LASERS.length - 1; i >= 0; i--) {
        const l = LASERS[i];
        l.x += l.vx; l.y += l.vy; l.life--;
        if (l.life <= 0) LASERS.splice(i, 1);
    }
}

const PARTS = [];
const PN = window.isMob ? 15 : 30;
for (let i = 0; i < PN; i++) PARTS.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.5 + 1, a: Math.random() * .4 + .1, hue: Math.random() < .5 ? 270 : 190 });

let gravityWell = null, gravityTimer = 0;
window.addEventListener('click', e => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('form') || e.target.closest('.cosmic-controls')) return;
    gravityWell = { x: e.clientX, y: e.clientY };
    gravityTimer = 90; 
}, { passive: true });

const TRAIL = [];
if (!window.isMob) {
    document.addEventListener('mousemove', e => {
        if (TRAIL.length < 25) {
            TRAIL.push({ x: e.clientX, y: e.clientY, life: 1, r: 2 + Math.random() * 2 });
        }
    }, { passive: true });
}

let T = 0;
function renderEngine() {
    T += .016;
    updateBattleSystem();
    
    sx.clearRect(0, 0, sc.width, sc.height);
    px.clearRect(0, 0, pc.width, pc.height);
    tx2.clearRect(0, 0, tc.width, tc.height);

    const w = sc.width, h = sc.height;
    const pxOffset = window.isMob ? 0 : (mouseX / w - .5);
    const pyOffset = window.isMob ? 0 : (mouseY / h - .5);

    const bg = sx.createRadialGradient(w * .5, h * .3, 0, w * .5, h * .6, h);
    bg.addColorStop(0, '#04021a'); bg.addColorStop(.5, '#03020d'); bg.addColorStop(1, '#020108');
    sx.fillStyle = bg; sx.fillRect(0, 0, w, h);

    STARS.forEach(s => {
        const y = (s.y - scrollY * .012 + h * 10) % h;
        const x = (s.x + pxOffset * 10 + w * 10) % w;
        const tw = .5 + Math.sin(T * s.twSpd + s.twOff) * .5;
        sx.beginPath(); sx.arc(x, y, s.r, 0, Math.PI * 2);
        sx.fillStyle = `hsla(${s.hue},${s.hue ? '60%' : '0%'},100%,${s.a * tw})`; sx.fill();
    });

    for (let i = SHOOTS.length - 1; i >= 0; i--) {
        const sh = SHOOTS[i];
        sh.x += Math.cos(sh.ang) * sh.spd; sh.y += Math.sin(sh.ang) * sh.spd; sh.life -= .025;
        if (sh.life <= 0) { SHOOTS.splice(i, 1); continue; }
        const tx = sh.x - Math.cos(sh.ang) * sh.len, ty = sh.y - Math.sin(sh.ang) * sh.len;
        const g = sx.createLinearGradient(tx, ty, sh.x, sh.y);
        g.addColorStop(0, 'transparent'); g.addColorStop(1, `hsla(${sh.hue},90%,80%,${sh.life * .8})`);
        sx.beginPath(); sx.moveTo(tx, ty); sx.lineTo(sh.x, sh.y);
        sx.strokeStyle = g; sx.lineWidth = 1.2; sx.stroke();
    }

    PLANETS.forEach(p => {
        let pY = (p.y - scrollY * p.parallaxFactor + h * 4) % (h * 2) - (h * 0.5);
        let pX = p.x + (pxOffset * (p.parallaxFactor * 120));
        p.angle += p.rotSpd;

        if (!window.isMob) {
            const dx = mouseX - pX, dy = mouseY - pY, distance = Math.sqrt(dx * dx + dy * dy);
            const evasionRadius = p.r + 120; 
            if (distance < evasionRadius && distance > 1) {
                const force = (evasionRadius - distance) / evasionRadius;
                pX -= (dx / distance) * p.r * force * 0.6; pY -= (dy / distance) * p.r * force * 0.6;
            }
        }

        sx.save(); sx.translate(pX, pY); sx.rotate(p.ringAngle);
        if (p.hasRing) {
            sx.beginPath(); sx.ellipse(0, 0, p.r * 1.8, p.r * 0.25, 0, Math.PI, 0);
            sx.strokeStyle = p.color2 + '44'; sx.lineWidth = p.r * 0.12; sx.stroke();
        }
        sx.rotate(p.angle);
        const grad = sx.createLinearGradient(-p.r, -p.r, p.r, p.r);
        grad.addColorStop(0, p.color1); grad.addColorStop(0.5, p.color2); grad.addColorStop(1, '#020108');
        sx.beginPath(); sx.arc(0, 0, p.r, 0, Math.PI * 2); sx.fillStyle = grad; sx.fill();
        const shadowGrad = sx.createRadialGradient(-p.r * 0.2, -p.r * 0.2, p.r * 0.4, 0, 0, p.r);
        shadowGrad.addColorStop(0, 'transparent'); shadowGrad.addColorStop(0.8, 'rgba(3,2,13,0.7)'); shadowGrad.addColorStop(1, 'rgba(3,2,13,1)');
        sx.beginPath(); sx.arc(0, 0, p.r, 0, Math.PI * 2); sx.fillStyle = shadowGrad; sx.fill();
        if (p.hasRing) {
            sx.beginPath(); sx.ellipse(0, 0, p.r * 1.8, p.r * 0.25, 0, 0, Math.PI);
            sx.strokeStyle = p.color2 + 'aa'; sx.lineWidth = p.r * 0.12; sx.stroke();
        }
        sx.restore();
    });

    if (!window.isMob) {
        SHIPS.forEach(ufo => {
            sx.save(); sx.translate(ufo.x, ufo.y);
            const colorGlow = ufo.team === 'red' ? '#ff3333' : varColor('--cyan');
            sx.strokeStyle = colorGlow; sx.fillStyle = 'rgba(10, 6, 32, 0.9)'; sx.lineWidth = ufo.team === 'red' ? 2.5 : 2;
            sx.beginPath(); sx.ellipse(0, 0, ufo.r * 1.5, ufo.r * 0.5, 0, 0, Math.PI * 2); sx.fill(); sx.stroke();
            sx.beginPath(); sx.arc(0, -ufo.r * 0.15, ufo.r * 0.65, Math.PI, 0); sx.fillStyle = ufo.team === 'red' ? 'rgba(255, 51, 51, 0.15)' : 'rgba(0, 229, 255, 0.1)'; sx.fill(); sx.stroke();
            sx.save(); sx.rotate(ufo.spinAngle);
            const bulbCount = ufo.team === 'red' ? 7 : 6;
            for (let i = 0; i < bulbCount; i++) {
                const nodeAngle = (i / bulbCount) * Math.PI * 2; const nodeX = Math.cos(nodeAngle) * (ufo.r * 1.1); const nodeY = Math.sin(nodeAngle) * (ufo.r * 0.35);
                sx.beginPath(); sx.arc(nodeX, nodeY, 2, 0, Math.PI * 2); sx.fillStyle = (Math.floor(T * 10) + i) % 2 === 0 ? colorGlow : '#ffffff'; sx.fill();
            }
            sx.restore(); sx.restore();
        });
        LASERS.forEach(l => {
            sx.save(); sx.beginPath(); sx.arc(l.x, l.y, 4.5, 0, Math.PI * 2); const lColor = varColor('--cyan'); sx.fillStyle = '#ffffff'; sx.strokeStyle = lColor; sx.lineWidth = 2; sx.shadowBlur = 12; sx.shadowColor = lColor; sx.fill(); sx.stroke(); sx.restore();
        });
    }

    function varColor(variable) { return document.body.classList.contains('supernova') ? '#4c1bc7' : (variable === '--cyan' ? '#00e5ff' : '#ff3cac'); }

    const mox = pxOffset * 6, moy = pyOffset * 4;
    for (let i = 0; i < PARTS.length; i++) {
        for (let j = i + 1; j < PARTS.length; j++) {
            const dx = PARTS[i].x - PARTS[j].x, dy = PARTS[i].y - PARTS[j].y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
                px.beginPath(); px.moveTo(PARTS[i].x + mox, PARTS[i].y + moy); px.lineTo(PARTS[j].x + mox, PARTS[j].y + moy);
                px.strokeStyle = `rgba(108,47,255,${(1 - d / 110) * .07})`; px.lineWidth = 1; px.stroke();
            }
        }
    }
    PARTS.forEach(p => {
        if (gravityWell && gravityTimer > 0) {
            const dx = gravityWell.x - p.x, dy = gravityWell.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400 && dist > 5) { const force = (400 - dist) / 3500; p.vx += (dx / dist) * force; p.vy += (dy / dist) * force; }
        }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98;
        if (Math.abs(p.vx) < 0.05) p.vx = (Math.random() - 0.5) * 0.3;
        if (Math.abs(p.vy) < 0.05) p.vy = (Math.random() - 0.5) * 0.3;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        px.beginPath(); px.arc(p.x + mox, p.y + moy, p.r, 0, Math.PI * 2); px.fillStyle = `hsla(${p.hue},70%,75%,${p.a})`; px.fill();
    });

    if (gravityTimer > 0) { gravityTimer--; if (gravityTimer === 0) gravityWell = null; }
    if (!window.isMob) {
        TRAIL.forEach((p, i) => {
            p.life -= .05; if (p.life <= 0) { TRAIL.splice(i, 1); return; }
            const frac = i / TRAIL.length;
            tx2.beginPath(); tx2.arc(p.x, p.y, p.r * frac * p.life, 0, Math.PI * 2); tx2.fillStyle = `hsla(${220 + frac * 60},80%,75%,${p.life * frac * .4})`; tx2.fill();
        });
    }
    requestAnimationFrame(renderEngine);
}
renderEngine();
if (!window.isMob) {
    gx.clearRect(0, 0, gc.width, gc.height); gx.strokeStyle = 'rgba(108,47,255,.04)'; gx.lineWidth = 1; const size = 60;
    for (let x = 0; x <= gc.width + size; x += size) { gx.beginPath(); gx.moveTo(x, 0); gx.lineTo(x, gc.height); gx.stroke(); }
    for (let y = 0; y <= gc.height + size; y += size) { gx.beginPath(); gx.moveTo(0, y); gx.lineTo(gc.width, y); gx.stroke(); }
}