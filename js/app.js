/* ============================================================
   WORK SOURCE SUPPLY — APP.JS v2
   3D loader, Three.js scene, GSAP, interactions, sales funnel
   ============================================================ */

(function(){
  'use strict';

  /* -------- LOADER -------- */
  const loader = document.getElementById('loader');
  const loaderCanvas = document.getElementById('loader-canvas');
  const loaderProgress = document.getElementById('loaderProgress');
  const loaderPct = document.getElementById('loaderPct');
  const bgCanvas = document.getElementById('bg-canvas');

  // Mini Three.js loader scene
  const lScene = new THREE.Scene();
  const lCam = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
  lCam.position.z = 4;
  const lRenderer = new THREE.WebGLRenderer({canvas:loaderCanvas, alpha:true, antialias:true});
  lRenderer.setSize(window.innerWidth, window.innerHeight);
  lRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const icoMat = new THREE.MeshBasicMaterial({color:0x7b2fff, wireframe:true, transparent:true, opacity:.7});
  const ico = new THREE.Mesh(icoGeo, icoMat);
  lScene.add(ico);

  const outerGeo = new THREE.IcosahedronGeometry(1.8, 0);
  const outerMat = new THREE.MeshBasicMaterial({color:0x00d4ff, wireframe:true, transparent:true, opacity:.15});
  const outerIco = new THREE.Mesh(outerGeo, outerMat);
  lScene.add(outerIco);

  let progress = 0;
  const loaderTick = () => {
    if(progress >= 100) return;
    progress += Math.random() * 3 + 1;
    if(progress > 100) progress = 100;
    loaderProgress.style.width = progress + '%';
    loaderPct.textContent = Math.round(progress) + '%';
  };
  const loaderInterval = setInterval(loaderTick, 60);

  function animateLoader(){
    if(!loader.parentNode) return;
    requestAnimationFrame(animateLoader);
    ico.rotation.x += 0.008;
    ico.rotation.y += 0.012;
    outerIco.rotation.x -= 0.003;
    outerIco.rotation.y += 0.005;
    lRenderer.render(lScene, lCam);
  }
  animateLoader();

  window.addEventListener('load', () => {
    clearInterval(loaderInterval);
    progress = 100;
    loaderProgress.style.width = '100%';
    loaderPct.textContent = '100%';
    setTimeout(() => {
      gsap.to(loader, {opacity:0, duration:.6, onComplete(){ loader.style.display='none'; }});
      bgCanvas.classList.add('visible');
      initReveal();
    }, 800);
  });

  /* -------- MAIN THREE.JS SCENE -------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.z = 50;
  const renderer = new THREE.WebGLRenderer({canvas:bgCanvas, alpha:true, antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for(let i = 0; i < particleCount * 3; i++){
    positions[i] = (Math.random() - 0.5) * 100;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({color:0x7b2fff, size:.12, transparent:true, opacity:.5});
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Floating wireframe shapes
  const shapes = [];
  const shapeGeos = [
    new THREE.OctahedronGeometry(.6, 0),
    new THREE.TetrahedronGeometry(.6, 0),
    new THREE.IcosahedronGeometry(.5, 0),
  ];
  for(let i = 0; i < 6; i++){
    const geo = shapeGeos[i % shapeGeos.length];
    const mat = new THREE.MeshBasicMaterial({color:i%2===0?0x00d4ff:0x7b2fff, wireframe:true, transparent:true, opacity:.2});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random()-.5)*60, (Math.random()-.5)*40, (Math.random()-.5)*30);
    mesh.userData = {
      rx: (Math.random()-.5)*.01,
      ry: (Math.random()-.5)*.01,
      floatSpeed: Math.random()*.3+.1,
      floatAmp: Math.random()*2+1,
      baseY: mesh.position.y,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animateMain(){
    requestAnimationFrame(animateMain);
    const t = Date.now() * .001;
    particles.rotation.y += .0002;
    particles.rotation.x += .0001;
    camera.position.x += (mouseX * 3 - camera.position.x) * .02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * .02;
    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y = s.userData.baseY + Math.sin(t * s.userData.floatSpeed) * s.userData.floatAmp;
    });
    renderer.render(scene, camera);
  }
  animateMain();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    lCam.aspect = window.innerWidth / window.innerHeight;
    lCam.updateProjectionMatrix();
    lRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* -------- CUSTOM CURSOR -------- */
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  let cx = 0, cy = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
  });

  (function moveCursor(){
    requestAnimationFrame(moveCursor);
    fx += (cx - fx) * .15;
    fy += (cy - fy) * .15;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    cursorFollower.style.left = fx + 'px';
    cursorFollower.style.top = fy + 'px';
  })();

  const hoverEls = 'a, button, .biz-card, .auto-tab, .btn, .nav-toggle, input, textarea, select';
  document.addEventListener('mouseover', e => {
    if(e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if(e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });

  /* -------- NAV -------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, {passive:true});

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* -------- SMOOTH SCROLL -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if(id === '#') return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({top:y, behavior:'smooth'});
    });
  });

  /* -------- MAGNETIC BUTTONS -------- */
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*.25}px, ${y*.25}px)`;
      const inner = btn.querySelector('.btn-text');
      if(inner) inner.style.transform = `translate(${x*.15}px, ${y*.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      const inner = btn.querySelector('.btn-text');
      if(inner) inner.style.transform = '';
    });
  });

  /* -------- GLASS CARD TILT -------- */
  document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 8;
      const y = ((e.clientY - r.top) / r.height - .5) * -8;
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg)`;
      // card light
      const light = card.querySelector('.card-light');
      if(light){
        light.style.background = `radial-gradient(300px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(0,212,255,.08), transparent 60%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* -------- SCROLL REVEAL (GSAP) -------- */
  function initReveal(){
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.to(el, {
        scrollTrigger:{
          trigger:el,
          start:'top 88%',
          once:true,
        },
        opacity:1,
        y:0,
        duration:.8,
        ease:'power3.out',
        delay:parseFloat(el.style.getPropertyValue('--d')) || 0,
        onStart(){ el.classList.add('revealed'); },
      });
    });
  }

  /* -------- BUSINESS TYPE SELECTOR -------- */
  const bizGrid = document.getElementById('bizGrid');
  if(bizGrid){
    bizGrid.addEventListener('click', e => {
      const card = e.target.closest('.biz-card');
      if(!card) return;
      // toggle active
      const wasActive = card.classList.contains('active');
      bizGrid.querySelectorAll('.biz-card').forEach(c => c.classList.remove('active'));
      if(!wasActive) card.classList.add('active');
      // Scroll to automations
      const autoSection = document.getElementById('automations');
      if(autoSection && !wasActive){
        setTimeout(() => {
          const y = autoSection.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({top:y, behavior:'smooth'});
        }, 300);
      }
    });
  }

  /* -------- AUTOMATION CATEGORY TABS -------- */
  const autoTabs = document.getElementById('autoTabs');
  const autoGrid = document.getElementById('autoGrid');
  if(autoTabs && autoGrid){
    const items = autoGrid.querySelectorAll('.auto-item');
    autoTabs.addEventListener('click', e => {
      const tab = e.target.closest('.auto-tab');
      if(!tab) return;
      autoTabs.querySelectorAll('.auto-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      items.forEach((item, i) => {
        const show = cat === 'all' || item.getAttribute('data-cat') === cat;
        item.classList.toggle('hidden', !show);
        if(show){
          item.classList.remove('fade-in');
          void item.offsetWidth; // force reflow
          item.classList.add('fade-in');
          item.style.animationDelay = (i * .02) + 's';
        }
      });
      // Update counter
      const visible = autoGrid.querySelectorAll('.auto-item:not(.hidden)').length;
      const counterNum = document.getElementById('autoCountNum');
      if(counterNum) animateCounter(counterNum, visible);
    });
  }

  /* -------- COUNTER ANIMATION -------- */
  function animateCounter(el, target){
    const start = parseInt(el.textContent) || 0;
    const duration = 600;
    const startTime = Date.now();
    (function tick(){
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if(progress < 1) requestAnimationFrame(tick);
    })();
  }

  // Initial counter scroll trigger
  const autoCounterEl = document.getElementById('autoCounter');
  if(autoCounterEl){
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const num = document.getElementById('autoCountNum');
          if(num) animateCounter(num, parseInt(num.textContent) || 150);
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.5});
    io.observe(autoCounterEl);
  }

  /* -------- ROTATING TAGLINES -------- */
  const taglines = [
    "Replace manual tasks with AI systems.",
    "Turn your business into a self-running machine.",
    "Stop paying for 10 different software tools.",
    "Custom-built. Not cookie-cutter.",
    "AI employees that work 24/7.",
    "One system. Everything automated.",
    "Built for YOUR workflow — not a template.",
    "40+ developers ready to build your system.",
  ];
  const taglineEl = document.getElementById('rotatingTagline');
  let taglineIdx = 0;
  if(taglineEl){
    taglineEl.textContent = taglines[0];
    setInterval(() => {
      taglineIdx = (taglineIdx + 1) % taglines.length;
      gsap.to(taglineEl, {
        opacity:0, y:-10, duration:.3,
        onComplete(){
          taglineEl.textContent = taglines[taglineIdx];
          gsap.fromTo(taglineEl, {opacity:0, y:10}, {opacity:1, y:0, duration:.3});
        }
      });
    }, 3500);
  }

  /* -------- EXAMPLES DRAG SCROLL -------- */
  const track = document.querySelector('.examples-track');
  if(track){
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true; track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mousemove', e => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }

  /* -------- BLUEPRINT FORM -------- */
  const form = document.getElementById('blueprintForm');
  if(form){
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const obj = Object.fromEntries(data.entries());
      // For now show success state (no backend)
      const btn = form.querySelector('button[type="submit"] .btn-text');
      if(btn){
        btn.textContent = 'Sent! We\'ll be in touch.';
        btn.setAttribute('data-text', 'Sent! We\'ll be in touch.');
      }
      form.querySelectorAll('input, textarea, select').forEach(f => f.disabled = true);
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }

  /* -------- TEXT SCRAMBLE on hover -------- */
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  document.querySelectorAll('[data-text]').forEach(el => {
    const original = el.getAttribute('data-text');
    let interval;
    el.closest('.btn, .nav-link--cta')?.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(interval);
      interval = setInterval(() => {
        el.textContent = original.split('').map((c, i) => {
          if(i < iteration) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        iteration += 1/2;
        if(iteration >= original.length){ clearInterval(interval); el.textContent = original; }
      }, 25);
    });
    el.closest('.btn, .nav-link--cta')?.addEventListener('mouseleave', () => {
      clearInterval(interval);
      el.textContent = original;
    });
  });

})();
