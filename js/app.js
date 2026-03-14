/* ============================================================
   WORK SOURCE SUPPLY — APP.JS
   Three.js 3D scene, GSAP ScrollTrigger animations, orbital
   carousel, glass-card interactions, text scramble, loader,
   custom cursor, magnetic buttons.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0.  GLOBALS
  ---------------------------------------------------------- */
  const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
  let isMobile = window.innerWidth < 769;

  /* ----------------------------------------------------------
     1.  CUSTOM CURSOR
  ---------------------------------------------------------- */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let cx = 0, cy = 0, fx = 0, fy = 0;

  function moveCursor() {
    cx += (mouse.x - cx) * 0.22;
    cy += (mouse.y - cy) * 0.22;
    fx += (mouse.x - fx) * 0.09;
    fy += (mouse.y - fy) * 0.09;
    if (cursor) {
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
    }
    if (follower) {
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
    }
    requestAnimationFrame(moveCursor);
  }
  if (!isMobile) moveCursor();

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* hover states */
  function setupCursorHover() {
    var hoverEls = document.querySelectorAll('a, button, .glass, input, textarea, select, .orbital-card');
    hoverEls.forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
    });
  }

  /* ----------------------------------------------------------
     2.  TEXT SCRAMBLE
  ---------------------------------------------------------- */
  function TextScramble(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#';
    this.update = this.update.bind(this);
  }
  TextScramble.prototype.setText = function (newText) {
    var self = this;
    var oldText = this.el.innerText;
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function (resolve) { self.resolve = resolve; });
    this.queue = [];
    for (var i = 0; i < length; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 30);
      var end = start + Math.floor(Math.random() * 30);
      this.queue.push({ from: from, to: to, start: start, end: end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  };
  TextScramble.prototype.update = function () {
    var output = '';
    var complete = 0;
    for (var i = 0; i < this.queue.length; i++) {
      var q = this.queue[i];
      if (this.frame >= q.end) {
        complete++;
        output += q.to;
      } else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.28) {
          q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += '<span class="scramble-char">' + q.char + '</span>';
      } else {
        output += q.from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };

  /* apply scramble on hover to buttons with data-text */
  function setupScrambleButtons() {
    document.querySelectorAll('.btn-text[data-text]').forEach(function (el) {
      var fx = new TextScramble(el);
      var original = el.getAttribute('data-text');
      el.closest('.btn, .orbital-btn, .nav-link').addEventListener('mouseenter', function () {
        fx.setText(original);
      });
    });
  }

  /* ----------------------------------------------------------
     3.  MAGNETIC BUTTONS
  ---------------------------------------------------------- */
  function setupMagneticButtons() {
    if (isMobile) return;
    document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.25) + 'px)';
        var inner = btn.querySelector('.btn-text');
        if (inner) inner.style.transform = 'translate(' + (x * 0.1) + 'px,' + (y * 0.1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        var inner = btn.querySelector('.btn-text');
        if (inner) inner.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     4.  GLASS CARD TILT + LIGHT FOLLOW
  ---------------------------------------------------------- */
  function setupGlassCards() {
    if (isMobile) return;
    document.querySelectorAll('.glass').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -6;
        var ry = ((x - cx) / cx) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.02,1.02,1.02)';

        var light = card.querySelector('.card-light');
        if (light) {
          light.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,.08) 0%, transparent 60%)';
        }
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     5.  THREE.JS SCENE
  ---------------------------------------------------------- */
  var scene, camera, renderer, particles, shapes = [];
  var loaderScene, loaderCamera, loaderMesh, loaderParticles;
  var bgCanvas = document.getElementById('bg-canvas');
  var loaderCanvas = document.getElementById('loader-canvas');

  function initLoader3D() {
    if (!window.THREE) return;
    var T = THREE;
    loaderScene = new T.Scene();
    loaderCamera = new T.PerspectiveCamera(60, loaderCanvas.clientWidth / loaderCanvas.clientHeight, 0.1, 100);
    loaderCamera.position.z = 5;

    var loaderRenderer = new T.WebGLRenderer({ canvas: loaderCanvas, alpha: true, antialias: true });
    loaderRenderer.setSize(loaderCanvas.clientWidth, loaderCanvas.clientHeight);
    loaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* central wireframe icosahedron */
    var geo = new T.IcosahedronGeometry(1.6, 1);
    var mat = new T.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.35 });
    loaderMesh = new T.Mesh(geo, mat);
    loaderScene.add(loaderMesh);

    /* second inner shape */
    var geo2 = new T.OctahedronGeometry(0.8, 0);
    var mat2 = new T.MeshBasicMaterial({ color: 0x7b2fff, wireframe: true, transparent: true, opacity: 0.25 });
    var inner = new T.Mesh(geo2, mat2);
    loaderScene.add(inner);

    /* orbiting particles */
    var pCount = 300;
    var pGeo = new T.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount; i++) {
      var r = 2 + Math.random() * 2.5;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.random() * Math.PI * 2;
      pPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pPos[i * 3 + 2] = r * Math.cos(theta);
    }
    pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
    var pMat = new T.PointsMaterial({ color: 0x00d4ff, size: 1.5, transparent: true, opacity: 0.5, sizeAttenuation: true });
    loaderParticles = new T.Points(pGeo, pMat);
    loaderScene.add(loaderParticles);

    function animateLoader() {
      if (!loaderMesh) return;
      loaderMesh.rotation.x += 0.005;
      loaderMesh.rotation.y += 0.008;
      inner.rotation.x -= 0.008;
      inner.rotation.y -= 0.005;
      loaderParticles.rotation.y += 0.002;
      loaderRenderer.render(loaderScene, loaderCamera);
      loaderAnimFrame = requestAnimationFrame(animateLoader);
    }
    var loaderAnimFrame = requestAnimationFrame(animateLoader);
    window._loaderAnimFrame = loaderAnimFrame;
    window._loaderRenderer = loaderRenderer;
  }

  function initMainScene() {
    if (!window.THREE) return;
    var T = THREE;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 32;

    renderer = new T.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    /* ambient light */
    scene.add(new T.AmbientLight(0x222244, 0.5));

    /* particles */
    var pCount = isMobile ? 800 : 2000;
    var pGeo = new T.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    var pColors = new Float32Array(pCount * 3);
    var blue = new T.Color(0x00d4ff);
    var purple = new T.Color(0x7b2fff);
    for (var i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 120;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      var c = blue.clone().lerp(purple, Math.random());
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }
    pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new T.BufferAttribute(pColors, 3));
    var pMat = new T.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.45, sizeAttenuation: true });
    particles = new T.Points(pGeo, pMat);
    scene.add(particles);

    /* floating wireframe shapes */
    var shapeDefs = [
      { geo: new T.IcosahedronGeometry(2, 1), pos: [-18, 8, -15], color: 0x00d4ff },
      { geo: new T.TorusGeometry(2.5, 0.5, 8, 16), pos: [20, -6, -20], color: 0x7b2fff },
      { geo: new T.OctahedronGeometry(2, 0), pos: [-15, -10, -10], color: 0xff006e },
      { geo: new T.TorusKnotGeometry(1.5, 0.4, 48, 8), pos: [18, 12, -25], color: 0x00ffaa },
      { geo: new T.TetrahedronGeometry(2, 0), pos: [0, -14, -18], color: 0x00d4ff },
    ];
    shapeDefs.forEach(function (d) {
      var mat = new T.MeshBasicMaterial({ color: d.color, wireframe: true, transparent: true, opacity: 0.12 });
      var mesh = new T.Mesh(d.geo, mat);
      mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      mesh.userData = { ry: (0.001 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1), rx: (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1), floatOffset: Math.random() * Math.PI * 2, origY: d.pos[1] };
      scene.add(mesh);
      shapes.push(mesh);
    });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      isMobile = window.innerWidth < 769;
    });
  }

  var scrollY = 0;
  window.addEventListener('scroll', function () { scrollY = window.pageYOffset; });

  function animateMain() {
    if (!renderer) return;
    requestAnimationFrame(animateMain);

    var time = performance.now() * 0.001;

    /* camera parallax */
    camera.position.x += (mouse.nx * 2 - camera.position.x) * 0.02;
    camera.position.y += (mouse.ny * 1.5 - camera.position.y) * 0.02;

    /* particles gentle rotation */
    if (particles) {
      particles.rotation.y = time * 0.015;
      particles.rotation.x = Math.sin(time * 0.01) * 0.1;
    }

    /* floating shapes */
    shapes.forEach(function (m) {
      m.rotation.y += m.userData.ry;
      m.rotation.x += m.userData.rx;
      m.position.y = m.userData.origY + Math.sin(time + m.userData.floatOffset) * 0.8;
    });

    renderer.render(scene, camera);
  }

  /* ----------------------------------------------------------
     6.  LOADER SEQUENCE
  ---------------------------------------------------------- */
  function runLoader() {
    var progress = document.getElementById('loaderProgress');
    var pct = document.getElementById('loaderPct');
    var loader = document.getElementById('loader');
    var title = document.getElementById('loaderTitle');

    /* decode text effect on title */
    var finalText = 'WORK SOURCE SUPPLY';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    var decoded = new Array(finalText.length).fill('');
    var decodeInterval = setInterval(function () {
      var allDone = true;
      for (var i = 0; i < finalText.length; i++) {
        if (decoded[i] !== finalText[i]) {
          if (finalText[i] === ' ') { decoded[i] = ' '; continue; }
          if (Math.random() < 0.08) {
            decoded[i] = finalText[i];
          } else {
            decoded[i] = chars[Math.floor(Math.random() * chars.length)];
            allDone = false;
          }
        }
      }
      if (title) title.textContent = decoded.join('');
      if (allDone) clearInterval(decodeInterval);
    }, 40);

    /* progress bar */
    var p = 0;
    var loadInterval = setInterval(function () {
      p += Math.random() * 12 + 2;
      if (p > 100) p = 100;
      if (progress) progress.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
      if (p >= 100) {
        clearInterval(loadInterval);
        setTimeout(finishLoading, 600);
      }
    }, 120);

    function finishLoading() {
      /* stop loader 3d */
      if (window._loaderAnimFrame) cancelAnimationFrame(window._loaderAnimFrame);
      if (window._loaderRenderer) window._loaderRenderer.dispose();

      /* fade out loader */
      if (loader) {
        loader.style.transition = 'opacity .8s ease, transform .8s ease';
        loader.style.opacity = '0';
        loader.style.transform = 'scale(1.05)';
        setTimeout(function () {
          loader.style.display = 'none';
        }, 800);
      }

      /* show main scene */
      if (bgCanvas) bgCanvas.classList.add('visible');

      /* reveal hero */
      setTimeout(function () {
        document.querySelectorAll('.hero .reveal-up').forEach(function (el) {
          el.classList.add('revealed');
        });
      }, 300);

      /* init everything else */
      setTimeout(initAfterLoad, 400);
    }
  }

  /* ----------------------------------------------------------
     7.  ORBITAL CAROUSEL
  ---------------------------------------------------------- */
  function OrbitalCarousel(container) {
    this.container = container;
    this.ring = container.querySelector('#orbitalRing');
    this.cards = Array.from(this.ring.querySelectorAll('.orbital-card'));
    this.total = this.cards.length;
    this.angle = 360 / this.total;
    this.radius = isMobile ? 0 : Math.max(380, Math.min(550, window.innerWidth * 0.32));
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.autoSpeed = 0.15;
    this.isDragging = false;
    this.startX = 0;
    this.dragStartRotation = 0;
    this.autoRotate = true;

    if (!isMobile) {
      this.positionCards();
      this.setupDrag();
      this.setupControls();
      this.animate();
    }
  }

  OrbitalCarousel.prototype.positionCards = function () {
    var self = this;
    this.cards.forEach(function (card, i) {
      var a = i * self.angle;
      card.style.transform = 'rotateY(' + a + 'deg) translateZ(' + self.radius + 'px)';
    });
  };

  OrbitalCarousel.prototype.setupDrag = function () {
    var self = this;
    var viewport = this.container.closest('.orbital-viewport');

    viewport.addEventListener('mousedown', function (e) {
      self.isDragging = true;
      self.autoRotate = false;
      self.startX = e.clientX;
      self.dragStartRotation = self.targetRotation;
    });
    window.addEventListener('mousemove', function (e) {
      if (!self.isDragging) return;
      var dx = e.clientX - self.startX;
      self.targetRotation = self.dragStartRotation + dx * 0.3;
    });
    window.addEventListener('mouseup', function () {
      if (self.isDragging) {
        self.isDragging = false;
        setTimeout(function () { self.autoRotate = true; }, 3000);
      }
    });
  };

  OrbitalCarousel.prototype.setupControls = function () {
    var self = this;
    var prev = document.querySelector('.orbital-prev');
    var next = document.querySelector('.orbital-next');
    if (prev) prev.addEventListener('click', function () {
      self.targetRotation += self.angle;
      self.autoRotate = false;
      setTimeout(function () { self.autoRotate = true; }, 4000);
    });
    if (next) next.addEventListener('click', function () {
      self.targetRotation -= self.angle;
      self.autoRotate = false;
      setTimeout(function () { self.autoRotate = true; }, 4000);
    });
  };

  OrbitalCarousel.prototype.animate = function () {
    var self = this;
    if (this.autoRotate && !this.isDragging) {
      this.targetRotation -= this.autoSpeed;
    }
    this.currentRotation += (this.targetRotation - this.currentRotation) * 0.04;
    this.ring.style.transform = 'rotateY(' + this.currentRotation + 'deg)';

    /* fade cards based on facing direction */
    var baseAngle = ((this.currentRotation % 360) + 360) % 360;
    this.cards.forEach(function (card, i) {
      var cardAngle = ((i * self.angle + baseAngle) % 360 + 360) % 360;
      var dist = Math.min(cardAngle, 360 - cardAngle);
      var opacity = Math.max(0.15, 1 - dist / 180);
      card.style.opacity = opacity;
    });

    requestAnimationFrame(function () { self.animate(); });
  };

  /* ----------------------------------------------------------
     8.  SCROLL REVEAL (GSAP ScrollTrigger)
  ---------------------------------------------------------- */
  function setupScrollReveal() {
    if (!window.gsap || !window.ScrollTrigger) {
      /* fallback: reveal everything */
      document.querySelectorAll('.reveal-up').forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* reveal elements */
    gsap.utils.toArray('.reveal-up:not(.hero .reveal-up)').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: function () { el.classList.add('revealed'); },
        once: true
      });
    });

    /* animated counters */
    gsap.utils.toArray('.stat-number').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.floor(this.targets()[0].val);
            }
          });
        }
      });
    });

    /* nav scroll state */
    ScrollTrigger.create({
      start: 80,
      onUpdate: function (self) {
        document.getElementById('nav').classList.toggle('scrolled', self.progress > 0 || window.pageYOffset > 80);
      }
    });
  }

  /* ----------------------------------------------------------
     9.  NAV TOGGLE (MOBILE)
  ---------------------------------------------------------- */
  function setupNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('.nav-link').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ----------------------------------------------------------
     10. CONTACT FORM
  ---------------------------------------------------------- */
  function setupForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn');
      var btnText = btn.querySelector('.btn-text');
      btnText.textContent = 'Sending...';
      /* Simulate send — replace with real endpoint */
      setTimeout(function () {
        btnText.textContent = 'Message Sent!';
        btn.style.background = 'linear-gradient(135deg,var(--accent-green),var(--accent-blue))';
        form.reset();
        setTimeout(function () {
          btnText.textContent = 'Send Message';
          btn.style.background = '';
        }, 3000);
      }, 1500);
    });
  }

  /* ----------------------------------------------------------
     11. HORIZONTAL SCROLL for STORIES (drag)
  ---------------------------------------------------------- */
  function setupStoriesDrag() {
    var track = document.querySelector('.stories-scroll');
    if (!track) return;
    var isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });
    track.addEventListener('mouseleave', function () { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mouseup', function () { isDown = false; track.style.cursor = ''; });
    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  /* ----------------------------------------------------------
     12. SMOOTH SCROLL
  ---------------------------------------------------------- */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     13. INIT
  ---------------------------------------------------------- */
  function initAfterLoad() {
    setupCursorHover();
    setupScrambleButtons();
    setupMagneticButtons();
    setupGlassCards();
    setupScrollReveal();
    setupNav();
    setupForm();
    setupStoriesDrag();
    setupSmoothScroll();

    var orbitalContainer = document.getElementById('orbitalContainer');
    if (orbitalContainer) new OrbitalCarousel(orbitalContainer);
  }

  /* kick off */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader3D();
    initMainScene();
    animateMain();
    runLoader();
  });
})();
