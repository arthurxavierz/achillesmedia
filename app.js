/* ============================================================
   Achilles Media, interface
   Navbar, word reveal, reveal on scroll, contadores, filtro de
   serviços, menu mobile, formulários WhatsApp
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Word reveal do headline (sobe palavra a palavra) ---- */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var html = el.innerHTML;
    // Divide por espaços preservando marcações simples de linha (<br>)
    var parts = html.split(/(<br\s*\/?>)/i);
    var i = 0;
    var out = parts
      .map(function (part) {
        if (/<br/i.test(part)) return part;
        return part
          .split(/\s+/)
          .filter(function (w) {
            return w.length;
          })
          .map(function (word) {
            return '<span class="word-reveal" style="transition-delay:' + i++ * 70 + 'ms">' + word + '</span>';
          })
          .join(' ');
      })
      .join('');
    el.innerHTML = out;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelectorAll('.word-reveal').forEach(function (w) {
          w.classList.add('in');
        });
      });
    });
  });

  /* ---- Navbar sombra ao scrollar ---- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) {
        el.classList.add('in');
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---- Contadores ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !prefersReduced && 'IntersectionObserver' in window) {
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1500;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---- Filtro de serviços por categoria ---- */
  var chips = document.querySelectorAll('[data-filter]');
  if (chips.length) {
    var cards = document.querySelectorAll('[data-category]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        cards.forEach(function (card) {
          var match = cat === 'todos' || card.getAttribute('data-category') === cat;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  /* ---- Timeline animada (processo): acende ao entrar na viewport ---- */
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      timeline.classList.add('run');
    } else {
      var tio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              timeline.classList.add('run');
              tio.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      tio.observe(timeline);
    }
  }

  /* ---- Retorno real: abre -> carrega -> fecha -> próximo ---- */
  var rCards = document.querySelectorAll('.retorno-card');
  if (rCards.length) {
    var rIdx = 0;
    var rLoad = 3400; /* tempo carregando (barra enche) — casa com --retorno-dur */
    var rGap = 520; /* intervalo fechado antes do próximo abrir */
    var tLoad = null;
    var tGap = null;
    var running = false;

    var clearAll = function () {
      rCards.forEach(function (c) { c.classList.remove('active'); });
    };
    var stopTimers = function () {
      clearTimeout(tLoad);
      clearTimeout(tGap);
    };

    /* Abre um card, deixa carregar, fecha e agenda o próximo */
    var openCard = function (i) {
      stopTimers();
      clearAll();
      rIdx = (i + rCards.length) % rCards.length;
      var card = rCards[rIdx];
      /* reflow: garante que a barra reinicie do zero a cada abertura */
      void card.offsetWidth;
      card.classList.add('active');
      if (prefersReduced || !running) return;
      tLoad = setTimeout(function () {
        card.classList.remove('active'); /* fecha */
        tGap = setTimeout(function () {
          openCard(rIdx + 1);
        }, rGap);
      }, rLoad);
    };

    var startR = function () {
      if (running) return;
      running = true;
      openCard(0);
    };

    if (!prefersReduced && 'IntersectionObserver' in window) {
      /* Só começa o ciclo quando a seção entra na viewport (barra inicia do zero) */
      var rio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              startR();
              rio.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      rio.observe(rCards[0].parentElement);
    } else {
      /* Sem IO ou movimento reduzido: mostra o primeiro card aberto, estático */
      rCards[0].classList.add('active');
    }

    /* Clique: reinicia o ciclo a partir do card escolhido */
    rCards.forEach(function (c, idx) {
      c.addEventListener('click', function () {
        if (prefersReduced) return;
        running = true;
        openCard(idx);
      });
    });
  }

  /* ---- Hero: logo em partículas + partículas ambientes ---- */
  var canvas = document.querySelector('.hero-canvas');
  if (canvas && canvas.getContext) {
    var hero = canvas.closest('.hero') || canvas.parentElement;
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var ambient = [];
    var edges = [];
    var W = 0;
    var H = 0;
    var mx = 0;
    var my = 0;
    var tmx = 0;
    var tmy = 0;
    var startTime = null;
    var fallbackImage = false;
    var logoBox = null;
    var img = new Image();

    /* Nível de performance escolhido pelo hardware, para nunca travar.
       Define quantidade de partículas, conexões, ambiente e duração. */
    var cores = navigator.hardwareConcurrency || 4;
    var tier;
    if (prefersReduced) tier = 'reduced';
    else if (cores >= 8 && window.innerWidth >= 1200) tier = 'high';
    else if (cores >= 4 && window.innerWidth >= 768) tier = 'mid';
    else tier = 'low';

    var TIERS = {
      high:    { cap: 3600, ambient: 170, edges: true,  edgeLimit: 1300, form: 1.7, stagger: 0.5 },
      mid:     { cap: 2400, ambient: 120, edges: true,  edgeLimit: 820,  form: 1.4, stagger: 0.4 },
      low:     { cap: 1500, ambient: 72,  edges: true,  edgeLimit: 460,  form: 1.1, stagger: 0.3 },
      reduced: { cap: 1400, ambient: 40,  edges: false, edgeLimit: 0,    form: 0.01, stagger: 0 }
    };
    var cfg = TIERS[tier];
    var FORM_DUR = cfg.form;

    /* Guarda de FPS: se rodar pesado após a formação, reduz densidade. */
    var degraded = false;
    var slowFrames = 0;
    var lastFrame = 0;

    var buildAmbient = function () {
      ambient = [];
      for (var i = 0; i < cfg.ambient; i++) {
        ambient.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.12 - 0.02,
          r: Math.random() * 1.2 + 0.55,
          white: Math.random() < 0.28,
          base: Math.random() * 0.3 + 0.14,
          tw: Math.random() * Math.PI * 2,
          twSpeed: Math.random() * 0.7 + 0.3,
          /* Balanço horizontal suave, de um lado para o outro */
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.35 + 0.15,
          swayAmp: Math.random() * 26 + 12
        });
      }
    };

    /* Conexões via grade espacial: O(n) em vez de O(n²), sem travar no load. */
    var buildEdges = function (scan, maxD) {
      edges = [];
      if (!cfg.edges || !scan.length) return;
      var cell = maxD;
      var grid = {};
      var keyOf = function (gx, gy) { return gx + ',' + gy; };
      for (var i = 0; i < scan.length; i++) {
        var gx = Math.floor(scan[i].tx / cell);
        var gy = Math.floor(scan[i].ty / cell);
        var k = keyOf(gx, gy);
        (grid[k] || (grid[k] = [])).push(i);
      }
      var maxD2 = maxD * maxD;
      for (var a = 0; a < scan.length; a++) {
        var cgx = Math.floor(scan[a].tx / cell);
        var cgy = Math.floor(scan[a].ty / cell);
        var found = 0;
        for (var ny = -1; ny <= 1 && found < 4; ny++) {
          for (var nx = -1; nx <= 1 && found < 4; nx++) {
            var bucket = grid[keyOf(cgx + nx, cgy + ny)];
            if (!bucket) continue;
            for (var bi = 0; bi < bucket.length; bi++) {
              var b = bucket[bi];
              if (b <= a) continue;
              var dx = scan[a].tx - scan[b].tx;
              var dy = scan[a].ty - scan[b].ty;
              var d2 = dx * dx + dy * dy;
              if (d2 < maxD2) {
                edges.push([a, b, Math.sqrt(d2), maxD]);
                if (++found >= 4) break;
              }
            }
          }
        }
      }
    };

    var build = function () {
      var rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (!W || !H || !img.width) return;

      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      startTime = null;
      degraded = false;
      slowFrames = 0;

      buildAmbient();

      var wide = W > 900;
      var sample = wide ? 420 : 260;
      var ar = img.width / img.height;
      var sw = sample;
      var sh = Math.max(1, Math.round(sample / ar));
      var off = document.createElement('canvas');
      off.width = sw;
      off.height = sh;
      var octx = off.getContext('2d');
      octx.clearRect(0, 0, sw, sh);
      octx.drawImage(img, 0, 0, sw, sh);

      /* Logo grande: cobre de uma extremidade à outra (referência Automy) */
      var logoH = wide ? H * 0.96 : Math.min(W, H) * 0.82;
      var scale = logoH / sh;
      var cx = wide ? W * 0.72 : W * 0.5;
      var cy = wide ? H * 0.5 : H * 0.54;
      var ox = cx - (sw * scale) / 2;
      var oy = cy - (sh * scale) / 2;
      logoBox = { x: ox, y: oy, w: sw * scale, h: sh * scale, cx: cx, cy: cy };

      var data;
      try {
        data = octx.getImageData(0, 0, sw, sh).data;
      } catch (e) {
        /* Canvas "sujo" (imagem carregada via file:// sem data URI).
           Fallback: desenha a logo diretamente para não ficar invisível. */
        fallbackImage = true;
        draw(performance.now());
        return;
      }
      fallbackImage = false;

      var pts = [];
      var step = wide ? 1 : 2;

      for (var y = 0; y < sh; y += step) {
        for (var x = 0; x < sw; x += step) {
          var alpha = data[(y * sw + x) * 4 + 3];
          if (alpha > 28) {
            pts.push({
              x: ox + x * scale,
              y: oy + y * scale,
              a: alpha / 255
            });
          }
        }
      }

      /* Fisher-Yates shuffle */
      for (var s = pts.length - 1; s > 0; s--) {
        var j = Math.floor(Math.random() * (s + 1));
        var tmp = pts[s];
        pts[s] = pts[j];
        pts[j] = tmp;
      }

      pts = pts.slice(0, Math.min(pts.length, cfg.cap));

      particles = pts.map(function (pt) {
        /* Poucos nós de destaque: partículas mais uniformes (nós de rede) */
        var bright = Math.random() < 0.05;
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * Math.max(W, H) * 0.5 + 60;
        var sx = pt.x + Math.cos(angle) * dist;
        var sy = pt.y + Math.sin(angle) * dist;
        return {
          tx: pt.x,
          ty: pt.y,
          sx: sx,
          sy: sy,
          px: sx,
          py: sy,
          r: bright ? Math.random() * 1.6 + 1.6 : Math.random() * 0.8 + 0.9,
          bright: bright,
          white: Math.random() < 0.22,
          phase: Math.random() * Math.PI * 2,
          /* Movimento minimalista: oscilação lenta e curta */
          speed: Math.random() * 0.34 + 0.22,
          amp: Math.random() * 1.1 + 0.4,
          depth: Math.random() * 0.6 + 0.3,
          a: pt.a,
          delay: Math.random() * cfg.stagger
        };
      });

      buildEdges(particles.slice(0, cfg.edgeLimit), wide ? 52 : 40);

      draw(performance.now());
    };

    /* Reduz densidade em tempo real se o quadro estiver custando caro. */
    var degrade = function () {
      degraded = true;
      particles = particles.slice(0, Math.ceil(particles.length * 0.6));
      ambient = ambient.slice(0, Math.ceil(ambient.length * 0.6));
      edges = [];
    };

    var drawAmbient = function (t, pxs, pys) {
      for (var i = 0; i < ambient.length; i++) {
        var p = ambient[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
        var tw = 0.6 + Math.sin(t * p.twSpeed + p.tw) * 0.4;
        var alpha = p.base * tw;
        var sway = Math.sin(t * p.swaySpeed + p.swayPhase) * p.swayAmp;
        ctx.beginPath();
        ctx.arc(p.x + sway + pxs * 0.4, p.y + pys * 0.4, p.r, 0, 6.2832);
        ctx.fillStyle = p.white
          ? 'rgba(248,244,232,' + alpha.toFixed(3) + ')'
          : 'rgba(224,196,138,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    };

    var draw = function (now) {
      if (!startTime) startTime = now;
      var elapsed = (now - startTime) * 0.001;
      var t = now * 0.001;

      ctx.clearRect(0, 0, W, H);

      var wide = W > 900;

      /* Fallback: canvas sujo (file:// sem data URI). Mostra a logo com um
         brilho pulsante para nunca ficar invisível. */
      if (fallbackImage && logoBox && img.width) {
        var fade = 0.6 + Math.sin(t * 1.2) * 0.16;
        var fglow = ctx.createRadialGradient(
          logoBox.cx, logoBox.cy, 0,
          logoBox.cx, logoBox.cy, Math.max(logoBox.w, logoBox.h) * 0.8
        );
        fglow.addColorStop(0, 'rgba(224,196,138,0.18)');
        fglow.addColorStop(1, 'rgba(224,196,138,0)');
        ctx.fillStyle = fglow;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.drawImage(img, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
        ctx.restore();
        return;
      }

      var pulse = 1 + Math.sin(t * 0.6) * 0.005;
      var cx = wide ? W * 0.72 : W * 0.5;
      var cy = wide ? H * 0.5 : H * 0.54;
      var pxs = mx * 9;
      var pys = my * 9;
      /* Balanço global do ícone: sobe e desce suave, como flutuando */
      var bob = Math.sin(t * 0.5) * (wide ? 16 : 10);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.44);
      halo.addColorStop(0, 'rgba(224,196,138,0.22)');
      halo.addColorStop(0.42, 'rgba(224,196,138,0.06)');
      halo.addColorStop(1, 'rgba(224,196,138,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      /* Ambiente: partículas soltas dando vida a todo o hero */
      drawAmbient(t, pxs, pys);

      /* Partículas do logo: voam da posição inicial até o ponto do logo */
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var raw = (elapsed - p.delay) / FORM_DUR;
        var prog = raw < 0 ? 0 : (raw > 1 ? 1 : raw);
        /* ease-out quart: começa rápido, freia no destino */
        var eased = 1 - Math.pow(1 - prog, 4);

        var wave = Math.sin(t * p.speed + p.phase);
        var ttx = cx + (p.tx - cx) * pulse + Math.cos(t * p.speed + p.phase) * p.amp + pxs * p.depth;
        var tty = cy + (p.ty - cy) * pulse + wave * p.amp + pys * p.depth + bob;

        p.px = p.sx + (ttx - p.sx) * eased;
        p.py = p.sy + (tty - p.sy) * eased;

        if (eased <= 0.01) continue;

        if (p.bright) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.r * 3.2, 0, 6.2832);
          ctx.fillStyle = 'rgba(224,196,138,' + ((0.05 + 0.03 * (wave + 1) * 0.5) * eased).toFixed(3) + ')';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, 6.2832);
        ctx.fillStyle = p.white
          ? 'rgba(248,244,232,' + (0.82 * p.a * eased).toFixed(3) + ')'
          : 'rgba(224,196,138,' + (0.86 * p.a * eased).toFixed(3) + ')';
        ctx.fill();
      }

      /* Arestas: aparecem após a formação começar */
      var edgeVis = Math.max(0, Math.min(1, (elapsed - FORM_DUR * 0.4) / 1.2));
      if (edgeVis > 0 && edges.length) {
        for (var k = 0; k < edges.length; k++) {
          var pa = particles[edges[k][0]];
          var pb = particles[edges[k][1]];
          if (!pa || !pb) continue;
          var lineAlpha = 0.34 * (1 - edges[k][2] / edges[k][3]) * edgeVis;
          if (lineAlpha < 0.005) continue;
          ctx.strokeStyle = 'rgba(224,196,138,' + lineAlpha.toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(pa.px, pa.py);
          ctx.lineTo(pb.px, pb.py);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    var loop = function (now) {
      if (!prefersReduced) requestAnimationFrame(loop);
      mx += (tmx - mx) * 0.045;
      my += (tmy - my) * 0.045;

      /* Monitora custo do quadro só depois da formação; degrada uma vez. */
      if (!degraded && lastFrame && (now - startTime) > (FORM_DUR + 0.5) * 1000) {
        var dt = now - lastFrame;
        if (dt > 34) { /* abaixo de ~30fps */
          if (++slowFrames > 30) degrade();
        } else if (slowFrames > 0) {
          slowFrames--;
        }
      }
      lastFrame = now;

      draw(now);
    };

    img.onload = function () {
      build();
      if (!prefersReduced) requestAnimationFrame(loop);
    };
    img.src = window.HERO_LOGO_SRC || canvas.getAttribute('data-src');

    if (!prefersReduced) {
      hero.addEventListener('mousemove', function (ev) {
        var r = hero.getBoundingClientRect();
        tmx = (ev.clientX - r.left) / r.width - 0.5;
        tmy = (ev.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('mouseleave', function () {
        tmx = 0;
        tmy = 0;
      });
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    }, { passive: true });
  }

  /* ---- Campos de sparks: partículas ambientes leves em seções escuras ---- */
  var sparkCanvases = document.querySelectorAll('.spark-canvas');
  if (sparkCanvases.length && !prefersReduced) {
    sparkCanvases.forEach(function (sc) {
      if (!sc.getContext) return;
      var host = sc.closest('section') || sc.parentElement;
      var sctx = sc.getContext('2d');
      var SDPR = Math.min(window.devicePixelRatio || 1, 2);
      var sw = 0;
      var sh = 0;
      var sCores = navigator.hardwareConcurrency || 4;
      var count = sCores >= 8 ? 60 : sCores >= 4 ? 40 : 24;
      var dots = [];
      var visible = true;

      var setup = function () {
        var r = sc.getBoundingClientRect();
        sw = r.width;
        sh = r.height;
        if (!sw || !sh) return;
        sc.width = sw * SDPR;
        sc.height = sh * SDPR;
        sctx.setTransform(SDPR, 0, 0, SDPR, 0, 0);
        dots = [];
        for (var i = 0; i < count; i++) {
          dots.push({
            x: Math.random() * sw,
            y: Math.random() * sh,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.42 - 0.06,
            r: Math.random() * 1.7 + 0.6,
            white: Math.random() < 0.32,
            base: Math.random() * 0.32 + 0.12,
            tw: Math.random() * Math.PI * 2,
            twSpeed: Math.random() * 1.1 + 0.4,
            near: Math.random() < 0.5
          });
        }
      };

      var sdraw = function (now) {
        if (!sw || !sh) return;
        var t = now * 0.001;
        sctx.clearRect(0, 0, sw, sh);
        sctx.save();
        sctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < dots.length; i++) {
          var p = dots[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -8) p.x = sw + 8; else if (p.x > sw + 8) p.x = -8;
          if (p.y < -8) p.y = sh + 8; else if (p.y > sh + 8) p.y = -8;
          var tw = 0.55 + Math.sin(t * p.twSpeed + p.tw) * 0.45;
          var alpha = p.base * tw;
          sctx.beginPath();
          sctx.arc(p.x, p.y, p.r, 0, 6.2832);
          sctx.fillStyle = p.white
            ? 'rgba(248,244,232,' + alpha.toFixed(3) + ')'
            : 'rgba(224,196,138,' + alpha.toFixed(3) + ')';
          sctx.fill();
        }
        /* Linhas curtas entre partículas próximas */
        for (var a = 0; a < dots.length; a++) {
          if (!dots[a].near) continue;
          for (var b = a + 1; b < dots.length; b++) {
            if (!dots[b].near) continue;
            var dx = dots[a].x - dots[b].x;
            var dy = dots[a].y - dots[b].y;
            var d2 = dx * dx + dy * dy;
            if (d2 < 12100) {
              var la = 0.12 * (1 - Math.sqrt(d2) / 110);
              sctx.strokeStyle = 'rgba(224,196,138,' + la.toFixed(3) + ')';
              sctx.lineWidth = 0.5;
              sctx.beginPath();
              sctx.moveTo(dots[a].x, dots[a].y);
              sctx.lineTo(dots[b].x, dots[b].y);
              sctx.stroke();
            }
          }
        }
        sctx.restore();
      };

      var sloop = function (now) {
        requestAnimationFrame(sloop);
        if (visible) sdraw(now);
      };

      /* Só anima quando a seção está na tela (economia) */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { visible = e.isIntersecting; });
        }, { threshold: 0.02 }).observe(host);
      }

      setup();
      requestAnimationFrame(sloop);

      var srt;
      window.addEventListener('resize', function () {
        clearTimeout(srt);
        srt = setTimeout(setup, 200);
      }, { passive: true });
    });
  }

  /* ---- Ano ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Campo livre "E muito mais" -> WhatsApp ---- */
  var askForm = document.querySelector('#ask-form');
  if (askForm) {
    askForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = (askForm.dor.value || '').trim();
      var base = 'Ola, tenho uma dor na minha empresa: ';
      var fallback = 'Ola, quero entender como IA pode ajudar minha empresa.';
      var texto = val ? base + val : fallback;
      window.open('https://wa.me/5541984991690?text=' + encodeURIComponent(texto), '_blank');
    });
  }

  /* ---- Formulário de contato -> WhatsApp ---- */
  var form = document.querySelector('#contato-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (form.nome.value || '').trim();
      var whats = (form.whatsapp.value || '').trim();
      var servico = form.servico.value || '';
      var msg = (form.mensagem.value || '').trim();
      var texto =
        'Ola, meu nome e ' + nome + '.' +
        (servico ? ' Tenho interesse em: ' + servico + '.' : '') +
        (msg ? ' ' + msg : '') +
        (whats ? ' Meu contato: ' + whats + '.' : '');
      window.open('https://wa.me/5541984991690?text=' + encodeURIComponent(texto), '_blank');
    });
  }
})();
