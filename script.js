/* ==========================================================================
   STARK.DEV — interactions & animation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initBoot();
  initWireframeSphere();
  initPowerCells();
  initProjectCards();
  initGlitchNav();
  initFriday();
  initHouseParty();
});

/* ── Ambient particles ─────────────────────────────────────────────────── */

function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  const COUNT = 32;
  const colors = ['#F5C518', '#00F0FF', '#FF3131'];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const left = ((i * 43 + 7) * 13) % 100;
    const top = ((i * 67 + 11) * 7) % 100;
    const size = 2 + (i % 3);
    const color = colors[i % 3];
    const dur = 7 + (i % 8);
    const delay = (i * 0.7) % 6;
    const blur = 1 + (i % 2);

    const dot = document.createElement('div');
    dot.className = 'particle';
    dot.style.left = left + '%';
    dot.style.top = top + '%';
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.background = color;
    dot.style.filter = `blur(${blur}px)`;
    dot.style.animation = `float-particle ${dur}s ${delay}s ease-in-out infinite alternate`;
    frag.appendChild(dot);
  }
  container.appendChild(frag);
}

/* ── Boot sequence (home page only, once per session) ─────────────────── */

function initBoot() {
  const overlay = document.querySelector('.boot-overlay');
  if (!overlay) return;

  if (sessionStorage.getItem('stark_boot_played') === '1') {
    overlay.classList.add('boot-skip');
    return;
  }
  sessionStorage.setItem('stark_boot_played', '1');

  const typedEl = overlay.querySelector('.boot-typed-text');
  const percentEl = overlay.querySelector('.boot-percent-value');
  const ringEl = overlay.querySelector('.boot-ring-progress');

  const bootText = '> Initializing Neural Interface...';
  const R = 80;
  const circ = 2 * Math.PI * R;
  if (ringEl) {
    ringEl.style.strokeDasharray = String(circ);
    ringEl.style.strokeDashoffset = String(circ);
  }

  let i = 0;
  const typeTimer = setInterval(() => {
    i++;
    if (typedEl) typedEl.textContent = bootText.slice(0, i);
    if (i >= bootText.length) clearInterval(typeTimer);
  }, 52);

  let p = 0;
  const progTimer = setInterval(() => {
    p++;
    if (percentEl) percentEl.textContent = String(p).padStart(3, '0') + '%';
    if (ringEl) ringEl.style.strokeDashoffset = String(circ - (p / 100) * circ);
    if (p >= 100) {
      clearInterval(progTimer);
      setTimeout(() => {
        overlay.classList.add('boot-fade');
        setTimeout(() => {
          overlay.classList.add('boot-skip');
        }, 650);
      }, 550);
    }
  }, 24);
}

/* ── Wireframe sphere (canvas) ─────────────────────────────────────────── */

function initWireframeSphere() {
  const canvas = document.getElementById('wireframe-sphere');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 500, H = 500, R = 180;
  let rotY = 0;
  const rotX = 0.28;
  let animId;

  function rot(x, y, z) {
    const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
    const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
    const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    return [x1, y2, z2];
  }

  function proj(x, y, z) {
    const fov = 750;
    const s = fov / (fov + z);
    return [x * s + W / 2, y * s + H / 2];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    rotY += 0.004;
    const LATS = 10, LONS = 16, SEG = 80;

    for (let i = 1; i < LATS; i++) {
      const phi = (i / LATS) * Math.PI;
      const yr = R * Math.cos(phi);
      const hr = R * Math.sin(phi);
      ctx.beginPath();
      for (let j = 0; j <= SEG; j++) {
        const th = (j / SEG) * 2 * Math.PI;
        const [rx, ry] = proj(...rot(hr * Math.cos(th), yr, hr * Math.sin(th)));
        j === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
      }
      ctx.strokeStyle = 'rgba(0,240,255,0.22)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let j = 0; j < LONS; j++) {
      const th = (j / LONS) * 2 * Math.PI;
      ctx.beginPath();
      for (let i = 0; i <= SEG; i++) {
        const phi = (i / SEG) * Math.PI;
        const [rx, ry] = proj(...rot(R * Math.sin(phi) * Math.cos(th), -R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th)));
        i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
      }
      ctx.strokeStyle = 'rgba(245,197,24,0.16)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    const coreGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 35);
    coreGrad.addColorStop(0, 'rgba(0,240,255,1)');
    coreGrad.addColorStop(0.4, 'rgba(0,240,255,0.6)');
    coreGrad.addColorStop(1, 'rgba(0,240,255,0)');
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 35, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    animId = requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
}

/* ── Power cell fill-on-load ───────────────────────────────────────────── */

function initPowerCells() {
  const cells = document.querySelectorAll('.power-cell-fill');
  cells.forEach((el, i) => {
    const level = el.dataset.level || '0';
    setTimeout(() => {
      el.style.height = level + '%';
    }, 150 + i * 90);
  });
}

/* ── Project card power bar fill-on-load ───────────────────────────────── */

function initProjectCards() {
  const bars = document.querySelectorAll('.project-card-power-bar');
  bars.forEach((el, i) => {
    const power = el.dataset.power || '0';
    setTimeout(() => {
      el.style.width = power + '%';
    }, 200 + i * 120);
  });
}

/* ── Glitch flash on internal navigation ───────────────────────────────── */

function initGlitchNav() {
  const overlay = document.querySelector('.glitch-overlay');
  const links = document.querySelectorAll('a[data-glitch-nav]');
  if (!overlay || !links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (link.target === '_blank') return;
      if (window.location.pathname === href) return;

      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 260);
    });
  });
}

/* ── FRIDAY widget ──────────────────────────────────────────────────────── */

function initFriday() {
  const toggle = document.querySelector('.friday-toggle');
  const panel = document.querySelector('.friday-panel');
  const dismiss = document.querySelector('.friday-dismiss');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
  });

  if (dismiss) {
    dismiss.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.classList.remove('open');
    });
  }
}

/* ── House Party Protocol easter egg ──────────────────────────────────── */

function initHouseParty() {
  const btn = document.querySelector('.house-party-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    document.body.classList.add('house-party-active');
    setTimeout(() => {
      document.body.classList.remove('house-party-active');
    }, 2400);
  });
}
