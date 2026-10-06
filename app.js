/* ============================================================
   Achilles Media, interface
   Títulos palavra a palavra, navbar, menu, revelar ao rolar,
   contadores, filtro de soluções, etapas, cards de ganho,
   logo em partículas sobre o dourado, poeira de luz e os
   formulários que abrem o WhatsApp.
   ============================================================ */
(function () {
  'use strict';

  var WA = '5541984991690';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Título em palavras: cada uma sobe de trás de uma máscara ---- */
  document.querySelectorAll('.split').forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var inner = document.createElement('span');
            inner.style.setProperty('--d', 120 + i++ * 75);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    /* setTimeout e não requestAnimationFrame: aba aberta em segundo plano
       não roda rAF, e o título ficaria escondido até a pessoa voltar. */
    setTimeout(function () { el.classList.add('in'); }, 40);
  });

  /* ---- Navbar: transparente sobre o dourado, branca depois ---- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = nav.querySelector('.nav-toggle');
    if (toggle) {
      var setMenu = function (open) {
        nav.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      };
      toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
      nav.querySelectorAll('.nav-mobile a').forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }
  }

  /* ---- Revelar ao rolar (também liga as cenas animadas) ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !hasIO) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Contadores ---- */
  var counters = document.querySelectorAll('[data-count]');
  var finalText = function (el) { return el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); };
  if (counters.length && !reduced && hasIO) {
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1600, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0' + (el.getAttribute('data-suffix') || ''); cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = finalText(el); });
  }

  /* ---- Filtro de soluções ---- */
  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var chips = filterRoot.querySelectorAll('.chip');
    var grid = filterRoot.querySelector('.svc-grid');
    var cards = grid.querySelectorAll('[data-category]');
    var countEl = filterRoot.querySelector('.filter-count');
    var emptyEl = filterRoot.querySelector('.svc-empty');
    var total = cards.length;
    var catsOf = function (card) { return (card.getAttribute('data-category') || '').split(/\s+/); };

    var counts = { todos: total };
    cards.forEach(function (card) {
      catsOf(card).forEach(function (c) { if (c) counts[c] = (counts[c] || 0) + 1; });
    });
    chips.forEach(function (chip) {
      var b = document.createElement('b');
      b.textContent = counts[chip.getAttribute('data-filter')] || 0;
      chip.appendChild(b);
    });

    var setCount = function (n) {
      if (countEl) countEl.innerHTML = 'Mostrando <strong>' + n + '</strong> de ' + total;
    };
    var apply = function (cat) {
      var visible = 0;
      cards.forEach(function (card) {
        var match = cat === 'todos' || catsOf(card).indexOf(cat) !== -1;
        card.classList.toggle('hidden', !match);
        if (match) { visible++; card.classList.add('in'); }
      });
      if (emptyEl) emptyEl.hidden = visible !== 0;
      setCount(visible);
      grid.classList.remove('refresh');
      void grid.offsetWidth;
      grid.classList.add('refresh');
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply(chip.getAttribute('data-filter'));
      });
    });
    setCount(total);
  }

  /* ---- Etapas: a barra corre e os números acendem em sequência ---- */
  var steps = document.querySelector('.steps');
  if (steps) {
    if (reduced || !hasIO) steps.classList.add('run');
    else {
      var sio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { steps.classList.add('run'); sio.disconnect(); }
      }, { threshold: 0.3 });
      sio.observe(steps);
    }
  }

  /* ---- Onde entramos: abre, carrega, fecha, próximo ---- */
  var gains = document.querySelectorAll('.gain');
  if (gains.length) {
    var LOAD = 3400;
    var GAP = 480;
    var gIdx = 0;
    var tLoad = null;
    var tGap = null;
    var cycling = false;

    var openGain = function (i) {
      clearTimeout(tLoad);
      clearTimeout(tGap);
      gains.forEach(function (g) { g.classList.remove('active'); g.setAttribute('aria-pressed', 'false'); });
      gIdx = (i + gains.length) % gains.length;
      var card = gains[gIdx];
      void card.offsetWidth;
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');
      if (reduced || !cycling) return;
      tLoad = setTimeout(function () {
        card.classList.remove('active');
        tGap = setTimeout(function () { openGain(gIdx + 1); }, GAP);
      }, LOAD);
    };

    gains[0].parentElement.style.setProperty('--gain-dur', LOAD + 'ms');
    if (!reduced && hasIO) {
      var gio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { cycling = true; openGain(0); gio.disconnect(); }
      }, { threshold: 0.35 });
      gio.observe(gains[0].parentElement);
    } else {
      gains[0].classList.add('active');
    }
    gains.forEach(function (g, idx) {
      g.addEventListener('click', function () {
        if (!reduced) cycling = true;
        openGain(idx);
      });
    });
  }

  /* ============================================================
     Sprites de luz: cada partícula é uma imagem pronta desenhada
     com drawImage. Traçar arco a arco milhares de vezes por quadro
     é o que pesa; carimbar um bitmap é barato.
     ============================================================ */
  var sprite = function (r, g, b, core) {
    var S = 48;
    var off = document.createElement('canvas');
    off.width = off.height = S;
    var c = off.getContext('2d');
    var grad = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
    grad.addColorStop(core, 'rgba(' + r + ',' + g + ',' + b + ',1)');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, S, S);
    return off;
  };

  /* ============================================================
     HERO: a marca se constrói em partículas sobre o dourado.
     Mesma construção do site anterior (nuvem que converge, rede
     entre vizinhos, flutuação lenta), agora em luz branca.
     ============================================================ */
  var canvas = document.querySelector('.hero-canvas');
  if (canvas && canvas.getContext) {
    var hero = canvas.closest('.hero') || canvas.parentElement;
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var dotWhite = sprite(255, 255, 255, 0.55);
    var dotCream = sprite(255, 236, 190, 0.5);
    var glow = sprite(255, 248, 228, 0.0);
    var particles = [];
    var ambient = [];
    var edges = [];
    var W = 0, H = 0;
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    var startTime = null;
    var visible = true;
    var box = null;
    var img = new Image();

    var cores = navigator.hardwareConcurrency || 4;
    var tier = reduced ? 'reduced'
      : (cores >= 8 && window.innerWidth >= 1200) ? 'high'
      : (cores >= 4 && window.innerWidth >= 768) ? 'mid' : 'low';
    var TIERS = {
      high:    { cap: 3400, ambient: 120, edges: 1400, form: 2.2, stagger: 0.9 },
      mid:     { cap: 2300, ambient: 90,  edges: 900,  form: 1.9, stagger: 0.7 },
      low:     { cap: 1400, ambient: 50,  edges: 480,  form: 1.6, stagger: 0.5 },
      reduced: { cap: 1400, ambient: 30,  edges: 0,    form: 0.01, stagger: 0 }
    };
    var cfg = TIERS[tier];
    var degraded = false, slowFrames = 0, lastFrame = 0;

    var layout = function () {
      var wide = W > 1080;
      if (wide) {
        var h = Math.min(H * 0.92, W * 0.62);
        return { wide: true, h: h, cx: W * 0.735, cy: H * 0.52, alpha: 1 };
      }
      /* No celular a marca fica atrás do texto: vai para a direita e baixa
         a intensidade para o título branco continuar mandando. */
      var hm = Math.min(W * 1.15, H * 0.66);
      return { wide: false, h: hm, cx: W * 0.74, cy: H * 0.4, alpha: 0.48 };
    };

    var buildAmbient = function () {
      ambient = [];
      for (var i = 0; i < cfg.ambient; i++) {
        ambient.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.12, vy: -(0.04 + Math.random() * 0.14),
          r: Math.random() * 1.4 + 0.6, base: Math.random() * 0.35 + 0.12,
          tw: Math.random() * Math.PI * 2, tws: Math.random() * 0.8 + 0.3,
          sp: Math.random() * Math.PI * 2, ss: Math.random() * 0.3 + 0.12, sa: Math.random() * 18 + 8
        });
      }
    };

    /* Rede entre vizinhos por grade espacial: O(n), não O(n²). */
    var buildEdges = function (list, maxD) {
      edges = [];
      if (!cfg.edges || !list.length) return;
      var cell = maxD, grid = {};
      var key = function (x, y) { return x + ',' + y; };
      for (var i = 0; i < list.length; i++) {
        var k = key(Math.floor(list[i].tx / cell), Math.floor(list[i].ty / cell));
        (grid[k] || (grid[k] = [])).push(i);
      }
      var max2 = maxD * maxD;
      for (var a = 0; a < list.length; a++) {
        var gx = Math.floor(list[a].tx / cell), gy = Math.floor(list[a].ty / cell), found = 0;
        for (var ny = -1; ny <= 1 && found < 3; ny++) {
          for (var nx = -1; nx <= 1 && found < 3; nx++) {
            var bucket = grid[key(gx + nx, gy + ny)];
            if (!bucket) continue;
            for (var bi = 0; bi < bucket.length; bi++) {
              var b = bucket[bi];
              if (b <= a) continue;
              var dx = list[a].tx - list[b].tx, dy = list[a].ty - list[b].ty, d2 = dx * dx + dy * dy;
              if (d2 < max2) {
                /* A opacidade da linha cai em quatro degraus: assim cada
                   degrau vira um único traço por quadro. */
                var lvl = Math.min(3, Math.floor((Math.sqrt(d2) / maxD) * 4));
                edges.push([a, b, lvl]);
                if (++found >= 3) break;
              }
            }
          }
        }
      }
    };

    var build = function () {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (!W || !H || !img.width) return;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      startTime = null; degraded = false; slowFrames = 0;
      buildAmbient();

      box = layout();
      var sample = box.wide ? 380 : 240;
      var ar = img.width / img.height;
      var sw = sample, sh = Math.max(1, Math.round(sample / ar));
      var off = document.createElement('canvas');
      off.width = sw; off.height = sh;
      var octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, sw, sh);
      var data;
      try { data = octx.getImageData(0, 0, sw, sh).data; } catch (e) { return; }

      var scale = box.h / sh;
      var ox = box.cx - (sw * scale) / 2, oy = box.cy - (sh * scale) / 2;

      /* Os alvos saem de uma GRADE sobre o desenho, não de um sorteio:
         sorteio deixa aglomerado e buraco, e o contorno vira mancha. O passo
         cresce até caber no limite do aparelho, então o espaçamento na tela
         fica parelho do monitor ao celular. */
      var collect = function (step) {
        var found = [];
        for (var y = 0; y < sh; y += step) {
          for (var x = 0; x < sw; x += step) {
            var alpha = data[(y * sw + x) * 4 + 3];
            if (alpha > 90) found.push({ x: x, y: y, a: alpha / 255 });
          }
        }
        return found;
      };
      var step = 1, pts = collect(step);
      while (pts.length > cfg.cap) { step++; pts = collect(step); }
      var gap = step * scale;
      var baseR = Math.max(0.8, gap * (box.wide ? 0.34 : 0.3));

      particles = pts.map(function (pt) {
        var bright = Math.random() < 0.04;
        var tx = ox + pt.x * scale + (Math.random() - 0.5) * gap * 0.35;
        var ty = oy + pt.y * scale + (Math.random() - 0.5) * gap * 0.35;
        /* A nuvem nasce espalhada pela hero inteira e converge: é a
           marca se montando, não aparecendo. */
        var ang = Math.random() * Math.PI * 2;
        var dist = Math.random() * Math.max(W, H) * 0.55 + 80;
        var sx = tx + Math.cos(ang) * dist, sy = ty + Math.sin(ang) * dist;
        return {
          tx: tx, ty: ty, sx: sx, sy: sy, px: sx, py: sy, ny: pt.y / sh,
          r: baseR * (bright ? 1.9 : 0.8 + Math.random() * 0.4),
          bright: bright, cream: Math.random() < 0.26,
          phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.34 + 0.22,
          amp: Math.random() * 1.1 + 0.4, depth: Math.random() * 0.6 + 0.3,
          a: pt.a, delay: Math.random() * cfg.stagger
        };
      });
      /* Embaralha para que a fatia que ganha rede (e a que sobra quando o
         aparelho pede menos partículas) se espalhe pela marca inteira. A
         distância da rede acompanha o passo da grade, senão no celular
         ninguém se alcança. */
      var linkList = particles.slice();
      for (var s2 = linkList.length - 1; s2 > 0; s2--) {
        var j2 = Math.floor(Math.random() * (s2 + 1));
        var t2 = linkList[s2]; linkList[s2] = linkList[j2]; linkList[j2] = t2;
      }
      particles = linkList;
      buildEdges(particles.slice(0, cfg.edges), Math.max(gap * 3.2, box.wide ? 26 : 20));
      draw(performance.now());
    };

    var degrade = function () {
      degraded = true;
      particles = particles.slice(0, Math.ceil(particles.length * 0.6));
      ambient = ambient.slice(0, Math.ceil(ambient.length * 0.6));
      edges = [];
    };

    var draw = function (now) {
      if (!box) return;
      if (!startTime) startTime = now;
      var elapsed = (now - startTime) / 1000;
      var t = now / 1000;
      var formDur = cfg.form;
      ctx.clearRect(0, 0, W, H);

      var pxs = mx * 10, pys = my * 10;
      var bob = Math.sin(t * 0.5) * (box.wide ? 14 : 8);
      var pulse = 1 + Math.sin(t * 0.6) * 0.004;
      var cx = box.cx, cy = box.cy;
      var formed = Math.min(1, elapsed / (formDur + cfg.stagger));

      /* Brilho atrás da marca: acende junto com a formação. */
      var hr = box.h * 0.62;
      ctx.globalAlpha = 0.34 * formed * box.alpha;
      ctx.drawImage(glow, cx - hr + pxs * 0.3, cy - hr + bob, hr * 2, hr * 2);

      /* Poeira de luz subindo pela hero inteira. */
      for (var i = 0; i < ambient.length; i++) {
        var m = ambient[i];
        m.x += m.vx; m.y += m.vy;
        if (m.x < -10) m.x = W + 10; else if (m.x > W + 10) m.x = -10;
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        var sway = Math.sin(t * m.ss + m.sp) * m.sa;
        ctx.globalAlpha = m.base * (0.6 + Math.sin(t * m.tws + m.tw) * 0.4);
        var mr = m.r * 1.6;
        ctx.drawImage(dotWhite, m.x + sway + pxs * 0.4 - mr, m.y + pys * 0.4 - mr, mr * 2, mr * 2);
      }

      /* Varredura de luz de cima a baixo depois que a marca fecha. */
      var sweep = elapsed > formDur + 1.2 ? ((elapsed - formDur - 1.2) % 5.5) / 4 : -1;

      for (var p = 0; p < particles.length; p++) {
        var q = particles[p];
        var raw = (elapsed - q.delay) / formDur;
        var prog = raw < 0 ? 0 : raw > 1 ? 1 : raw;
        var eased = 1 - Math.pow(1 - prog, 4);
        var wave = Math.sin(t * q.speed + q.phase);
        var ttx = cx + (q.tx - cx) * pulse + Math.cos(t * q.speed + q.phase) * q.amp + pxs * q.depth;
        var tty = cy + (q.ty - cy) * pulse + wave * q.amp + pys * q.depth + bob;
        q.px = q.sx + (ttx - q.sx) * eased;
        q.py = q.sy + (tty - q.sy) * eased;
        if (eased <= 0.01) continue;

        var a = (0.38 + 0.5 * q.a) * eased;
        var r = q.r;
        if (sweep >= 0 && sweep <= 1) {
          var d = Math.abs(q.ny - sweep);
          if (d < 0.07) { var f = 1 - d / 0.07; a += f * 0.4; r *= 1 + f * 0.45; }
        }
        a *= box.alpha;
        if (q.bright) {
          ctx.globalAlpha = 0.16 * eased * box.alpha;
          var gr = r * 4.2;
          ctx.drawImage(glow, q.px - gr, q.py - gr, gr * 2, gr * 2);
        }
        ctx.globalAlpha = a > 1 ? 1 : a;
        var rr = r * 1.35;
        ctx.drawImage(q.cream ? dotCream : dotWhite, q.px - rr, q.py - rr, rr * 2, rr * 2);
      }

      /* A rede aparece depois que a nuvem começou a fechar. */
      var edgeVis = Math.max(0, Math.min(1, (elapsed - formDur * 0.5) / 1.4));
      if (edgeVis > 0 && edges.length) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 0.7;
        for (var lvl = 0; lvl < 4; lvl++) {
          ctx.strokeStyle = 'rgba(255,255,255,' + ((0.3 - lvl * 0.07) * edgeVis * box.alpha).toFixed(3) + ')';
          ctx.beginPath();
          for (var k = 0; k < edges.length; k++) {
            if (edges[k][2] !== lvl) continue;
            var pa = particles[edges[k][0]], pb = particles[edges[k][1]];
            if (!pa || !pb) continue;
            ctx.moveTo(pa.px, pa.py);
            ctx.lineTo(pb.px, pb.py);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    var loop = function (now) {
      requestAnimationFrame(loop);
      if (!visible) { lastFrame = 0; return; }
      mx += (tmx - mx) * 0.045;
      my += (tmy - my) * 0.045;
      if (!degraded && lastFrame && startTime && (now - startTime) > (cfg.form + cfg.stagger + 0.6) * 1000) {
        if (now - lastFrame > 34) { if (++slowFrames > 40) degrade(); }
        else if (slowFrames > 0) slowFrames--;
      }
      lastFrame = now;
      draw(now);
    };

    img.onload = function () {
      build();
      if (reduced) {
        startTime = performance.now() - 99000;
        draw(performance.now());
      } else {
        requestAnimationFrame(loop);
      }
    };
    img.src = window.HERO_LOGO_SRC || canvas.getAttribute('data-src');

    if (hasIO) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }
    if (!reduced && window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', function (ev) {
        var r = hero.getBoundingClientRect();
        tmx = (ev.clientX - r.left) / r.width - 0.5;
        tmy = (ev.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('mouseleave', function () { tmx = 0; tmy = 0; });
    }
    var rt, lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      /* No celular a barra do navegador muda a altura ao rolar; só
         refaz a marca quando a largura muda de verdade. */
      if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 900) return;
      lastW = window.innerWidth;
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    }, { passive: true });
  }

  /* ---- Poeira de luz nas faixas douradas (heros internas e chamada) ---- */
  var sparkCanvases = document.querySelectorAll('.spark-canvas');
  if (sparkCanvases.length) {
    var dot = sprite(255, 255, 255, 0.5);
    sparkCanvases.forEach(function (sc) {
      if (!sc.getContext) return;
      var host = sc.parentElement;
      var sctx = sc.getContext('2d');
      var SD = Math.min(window.devicePixelRatio || 1, 2);
      var sw = 0, sh = 0, motes = [], on = true;

      var setup = function () {
        var r = sc.getBoundingClientRect();
        sw = r.width; sh = r.height;
        if (!sw || !sh) return;
        sc.width = Math.round(sw * SD); sc.height = Math.round(sh * SD);
        sctx.setTransform(SD, 0, 0, SD, 0, 0);
        var n = Math.min(110, Math.round((sw * sh) / 9000));
        motes = [];
        for (var i = 0; i < n; i++) {
          motes.push({
            x: Math.random() * sw, y: Math.random() * sh,
            vx: (Math.random() - 0.5) * 0.14, vy: -(0.06 + Math.random() * 0.22),
            r: Math.random() * 1.8 + 0.6, base: Math.random() * 0.4 + 0.12,
            tw: Math.random() * 6.28, tws: Math.random() * 1 + 0.4
          });
        }
        if (reduced) frame(performance.now());
      };
      var frame = function (now) {
        var t = now / 1000;
        sctx.clearRect(0, 0, sw, sh);
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          if (!reduced) {
            m.x += m.vx; m.y += m.vy;
            if (m.y < -8) { m.y = sh + 8; m.x = Math.random() * sw; }
            if (m.x < -8) m.x = sw + 8; else if (m.x > sw + 8) m.x = -8;
          }
          sctx.globalAlpha = m.base * (0.55 + Math.sin(t * m.tws + m.tw) * 0.45);
          var rr = m.r * 1.5;
          sctx.drawImage(dot, m.x - rr, m.y - rr, rr * 2, rr * 2);
        }
        sctx.globalAlpha = 1;
      };
      var loopS = function (now) {
        requestAnimationFrame(loopS);
        if (on) frame(now);
      };
      if (hasIO) new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(host);
      setup();
      if (!reduced) requestAnimationFrame(loopS);
      var srt;
      window.addEventListener('resize', function () { clearTimeout(srt); srt = setTimeout(setup, 200); }, { passive: true });
    });
  }

  /* ---- Ano no rodapé ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Formulários que abrem o WhatsApp já escritos ---- */
  var openWa = function (text) {
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };

  var askForm = document.querySelector('#ask-form');
  if (askForm) {
    askForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = (askForm.dor.value || '').trim();
      openWa(val
        ? 'Olá! Vim pelo site. O que mais toma tempo aqui na empresa: ' + val
        : 'Olá! Vim pelo site e quero entender o que dá para automatizar na minha empresa.');
    });
  }

  var form = document.querySelector('#contato-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var nome = (form.nome.value || '').trim();
      var empresa = (form.empresa.value || '').trim();
      var servico = form.servico.value || '';
      var msg = (form.mensagem.value || '').trim();
      openWa(
        'Olá! Sou ' + nome + (empresa ? ', da ' + empresa : '') + '.' +
        (servico ? ' Tenho interesse em: ' + servico + '.' : '') +
        (msg ? '\n\n' + msg : '')
      );
    });
  }
})();
