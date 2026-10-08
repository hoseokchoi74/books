/* 집현전 서책 엔진 — 목차·테마·퀴즈·실험 도우미 (모든 책 공통) */
(function(){
  const J = window.J = {};
  const root = document.documentElement;

  /* ── 테마 ── */
  try{ const t = localStorage.getItem('jade-theme'); if(t) root.dataset.theme = t; }catch(e){}
  J.toggleTheme = function(){
    const dark = J.isDark();
    root.dataset.theme = dark ? 'light' : 'dark';
    try{ localStorage.setItem('jade-theme', root.dataset.theme); }catch(e){}
    J.redrawAll();
  };
  J.isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  J.c = name => getComputedStyle(root).getPropertyValue(name.startsWith('--') ? name : '--' + name).trim();

  /* ── 다시 그리기 레지스트리 ── */
  const drawers = [];
  J.live = function(fn){ drawers.push(fn); fn(); return fn; };
  J.redrawAll = function(){ drawers.forEach(f => { try{ f(); }catch(e){ console.error(e); } }); };
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(J.redrawAll, 120); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => J.redrawAll());

  /* ── 요소 도우미 ── */
  J.$ = (s, r=document) => r.querySelector(s);
  J.$$ = (s, r=document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  J.svg = function(tag, attrs, parent){
    const e = document.createElementNS(NS, tag);
    for(const k in attrs||{}){ if(k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if(parent) parent.appendChild(e);
    return e;
  };
  J.clamp = (x,a,b) => Math.max(a, Math.min(b, x));
  J.lerp = (a,b,t) => a + (b-a)*t;
  J.fmt = function(x, d=2){
    if(!isFinite(x)) return '—';
    const a = Math.abs(x);
    if(a !== 0 && (a >= 1e6 || a < 1e-3)) return x.toExponential(d-1 < 0 ? 0 : d-1).replace('e+','e');
    return (+x.toFixed(d)).toLocaleString('ko-KR', {maximumFractionDigits:d});
  };
  J.si = function(x, unit='', d=3){
    if(x === 0) return '0 ' + unit;
    const pre = [['T',1e12],['G',1e9],['M',1e6],['k',1e3],['',1],['m',1e-3],['µ',1e-6],['n',1e-9],['p',1e-12],['f',1e-15],['a',1e-18]];
    for(const [p,v] of pre){ if(Math.abs(x) >= v*0.9995) return (+(x/v).toPrecision(d)) + ' ' + p + unit; }
    return x.toExponential(2) + ' ' + unit;
  };

  /* 과학 표기: 8.6×10⁹ */
  J.sci = function(x, d=2, unit=''){
    if(!isFinite(x)) return '—'; if(x === 0) return '0' + (unit ? ' ' + unit : '');
    let e = Math.floor(Math.log10(Math.abs(x))), m = x/Math.pow(10, e);
    if(Math.abs(+m.toFixed(Math.max(0, d-1))) >= 10){ m /= 10; e++; }
    const sup = String(e).replace('-', '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
    return (e >= -2 && e <= 3 ? J.fmt(x, d) : (+m.toFixed(Math.max(0, d-1))) + '×10' + sup) + (unit ? ' ' + unit : '');
  };
  /* ── 실험 바인딩: data-k 슬라이더 → 값 객체 → update(v) ── */
  J.sim = function(id, update){
    const box = document.getElementById(id);
    if(!box) return;
    const inputs = J.$$('input[data-k], select[data-k]', box);
    const read = () => {
      const v = {};
      inputs.forEach(i => {
        let x = i.type === 'checkbox' ? i.checked : (i.tagName === 'SELECT' ? i.value : parseFloat(i.value));
        if(i.dataset.log) x = Math.pow(10, x);
        if(i.tagName === 'SELECT' && !isNaN(parseFloat(i.value)) && i.dataset.num !== undefined) x = parseFloat(i.value);
        v[i.dataset.k] = x;
        const out = J.$(`[data-o="${i.dataset.k}"]`, box);
        if(out){
          const d = i.dataset.d !== undefined ? +i.dataset.d : 2;
          out.textContent = typeof x === 'boolean' ? (x ? '켬' : '끔') : typeof x !== 'number' ? String(x) : i.dataset.si !== undefined ? J.si(x, i.dataset.si) : ((i.dataset.raw !== undefined ? String(x) : J.fmt(x, d)) + (i.dataset.u ? ' ' + i.dataset.u : ''));
        }
      });
      return v;
    };
    const run = () => update(read(), box);
    inputs.forEach(i => i.addEventListener('input', run));
    J.live(run);
    return {run, read, box};
  };
  J.out = (box, k, txt, cls) => {
    const e = J.$(`[data-r="${k}"]`, box);
    if(!e) return;
    e.textContent = txt;
    if(cls !== undefined){ const p = e.closest('.ro'); if(p){ p.classList.remove('good','bad','warn'); if(cls) p.classList.add(cls); } }
  };

  /* ── 캔버스 ── */
  J.fit = function(cv, h){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = cv.parentElement.clientWidth || 600;
    h = h || +cv.dataset.h || 300;
    cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
    cv.style.height = h + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.font = '12px "Noto Sans KR", sans-serif';
    return {ctx, w, h};
  };
  function niceTicks(a, b, n=5){
    const span = b - a; if(span <= 0) return [a];
    const step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const r = step0 / mag, step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
    const t = []; for(let x = Math.ceil(a/step)*step; x <= b + step*1e-6; x += step) t.push(+x.toPrecision(12));
    return t;
  }
  J.niceTicks = niceTicks;
  /* 선 그래프 */
  J.plot = function(cv, o){
    const {ctx, w, h} = J.fit(cv, o.h);
    const P = Object.assign({l:54, r:16, t:16, b:40}, o.pad||{});
    const ink = J.c('--ink'), ink3 = J.c('--ink3'), line = J.c('--line2');
    const [x0,x1] = o.x, [y0,y1] = o.y;
    const lx = v => o.logx ? Math.log10(v) : v, ly = v => o.logy ? Math.log10(v) : v;
    const X = v => P.l + (lx(v) - lx(x0)) / (lx(x1) - lx(x0)) * (w - P.l - P.r);
    const Y = v => h - P.b - (ly(v) - ly(y0)) / (ly(y1) - ly(y0)) * (h - P.t - P.b);
    ctx.clearRect(0,0,w,h);
    // 격자
    ctx.lineWidth = 1; ctx.strokeStyle = line; ctx.fillStyle = ink3; ctx.font = '11px "JetBrains Mono", monospace';
    const xt = o.logx ? logTicks(x0,x1) : niceTicks(x0,x1, o.xn||6);
    const yt = o.logy ? logTicks(y0,y1) : niceTicks(y0,y1, o.yn||5);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    xt.forEach(t => { const x = X(t); ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, h-P.b); ctx.stroke(); ctx.fillText(o.xf ? o.xf(t) : J.fmt(t,3), x, h-P.b+5); });
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    yt.forEach(t => { const y = Y(t); ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w-P.r, y); ctx.stroke(); ctx.fillText(o.yf ? o.yf(t) : J.fmt(t,3), P.l-6, y); });
    ctx.strokeStyle = ink3; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, h-P.b); ctx.lineTo(w-P.r, h-P.b); ctx.stroke();
    ctx.fillStyle = J.c('--ink2'); ctx.font = '12px "Noto Sans KR", sans-serif';
    if(o.xlab){ ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xlab, P.l + (w-P.l-P.r)/2, h-2); }
    if(o.ylab){ ctx.save(); ctx.translate(12, P.t + (h-P.t-P.b)/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(o.ylab,0,0); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t-2, w-P.l-P.r, h-P.t-P.b+4); ctx.clip();
    (o.bands||[]).forEach(b => { ctx.fillStyle = col(b.color); ctx.globalAlpha = b.alpha||.15;
      const ya = b.y0 !== undefined ? Y(b.y1) : P.t, yb = b.y0 !== undefined ? Y(b.y0) : h-P.b;
      const xa = b.x0 !== undefined ? X(b.x0) : P.l, xb = b.x1 !== undefined ? X(b.x1) : w-P.r;
      ctx.fillRect(xa, ya, xb-xa, yb-ya); ctx.globalAlpha = 1; });
    (o.series||[]).forEach(s => {
      if(!s.pts.length) return;
      ctx.strokeStyle = col(s.color); ctx.lineWidth = s.w || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      s.pts.forEach((p,i) => { const x = X(p[0]), y = Y(p[1]); if(i && !s.step) ctx.lineTo(x,y); else if(i && s.step){ ctx.lineTo(x, Y(s.pts[i-1][1])); ctx.lineTo(x,y);} else ctx.moveTo(x,y); });
      ctx.stroke(); ctx.setLineDash([]);
      if(s.fill){ ctx.lineTo(X(s.pts[s.pts.length-1][0]), Y(o.logy ? y0 : Math.max(y0,0))); ctx.lineTo(X(s.pts[0][0]), Y(o.logy ? y0 : Math.max(y0,0))); ctx.closePath(); ctx.globalAlpha = s.fill; ctx.fillStyle = col(s.color); ctx.fill(); ctx.globalAlpha = 1; }
    });
    (o.vlines||[]).forEach(v => { ctx.strokeStyle = col(v.color||'--red'); ctx.lineWidth = 1.5; ctx.setLineDash(v.dash||[5,4]);
      ctx.beginPath(); ctx.moveTo(X(v.x), P.t); ctx.lineTo(X(v.x), h-P.b); ctx.stroke(); ctx.setLineDash([]);
      if(v.label){ ctx.fillStyle = col(v.color||'--red'); ctx.textAlign = v.align||'left'; ctx.textBaseline='top'; ctx.font='12px "Noto Sans KR", sans-serif'; ctx.fillText(v.label, X(v.x) + (v.align==='right'?-5:5), P.t+2); } });
    (o.hlines||[]).forEach(v => { ctx.strokeStyle = col(v.color||'--red'); ctx.lineWidth = 1.5; ctx.setLineDash(v.dash||[5,4]);
      ctx.beginPath(); ctx.moveTo(P.l, Y(v.y)); ctx.lineTo(w-P.r, Y(v.y)); ctx.stroke(); ctx.setLineDash([]);
      if(v.label){ ctx.fillStyle = col(v.color||'--red'); ctx.textAlign='right'; ctx.textBaseline='bottom'; ctx.font='12px "Noto Sans KR", sans-serif'; ctx.fillText(v.label, w-P.r-4, Y(v.y)-3); } });
    (o.points||[]).forEach(p => { ctx.fillStyle = col(p.color||'--red'); ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r||4, 0, 7); ctx.fill();
      if(p.label){ ctx.textAlign = p.align||'left'; ctx.textBaseline='bottom'; ctx.font='12px "Noto Sans KR", sans-serif'; ctx.fillText(p.label, X(p.x)+(p.align==='right'?-6:6), Y(p.y)-4); } });
    ctx.restore();
    return {X, Y, ctx, w, h, P};
  };
  function logTicks(a,b){ const t=[]; for(let e=Math.floor(Math.log10(a)); e<=Math.ceil(Math.log10(b)); e++){ const v=Math.pow(10,e); if(v>=a*0.999 && v<=b*1.001) t.push(v);} return t; }
  function col(c){ return c && c.startsWith('--') ? J.c(c) : c; }
  J.col = col;

  /* ── 애니메이션 루프(화면에 보일 때만) ── */
  J.loop = function(el, step){
    let on = false, last = 0, raf;
    const tick = t => { if(!on) return; const dt = Math.min(0.05, (t - (last||t))/1000); last = t; step(dt, t/1000); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting && !on){ on = true; last = 0; raf = requestAnimationFrame(tick); }
      else if(!e.isIntersecting){ on = false; cancelAnimationFrame(raf); }
    }));
    io.observe(el);
    (J._loops = J._loops || []).push(step);
  };
  /* 점검용: 화면 밖에서도 모든 애니메이션을 n프레임 진행 */
  J.stepAll = function(n=60, dt=1/60){ let t = performance.now()/1000; for(let i=0;i<n;i++){ t += dt; (J._loops||[]).forEach(s => s(dt, t)); } };

  /* ── 쉬운 난수 ── */
  J.rng = function(seed){ let s = seed >>> 0 || 1; return () => (s = (s*1664525 + 1013904223) >>> 0) / 4294967296; };
  J.gauss = function(r){ r = r || Math.random; let u=0,v=0; while(!u) u=r(); while(!v) v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };

  /* ── 페이지 꾸미기: 상단바·목차·이전/다음·퀴즈 ── */
  function chrome(){
    const B = window.BOOK; if(!B) return;
    const slug = document.body.dataset.ch;
    const inCh = !!slug;
    const base = inCh ? '../' : '';
    const libRoot = inCh ? '../../' : '../';
    const top = document.getElementById('top');
    if(top){
      top.outerHTML = `<header class="topbar">
        ${inCh ? '<button class="iconbtn tocbtn" id="tocbtn" aria-label="목차">☰</button>' : ''}
        <a class="brand" href="${libRoot}index.html"><span class="seal">集賢</span><span>집현전<small>JADE HALL</small></span></a>
        <a class="brand" href="${base}index.html" style="font-weight:600;color:var(--ink2)">· ${B.title}<small>${B.sub}</small></a>
        <span class="spacer"></span>
        <nav><a href="${base}index.html#chapters">목차</a><a href="${base}chapters/glossary.html">용어집</a><a href="${libRoot}index.html">서가</a></nav>
        <button class="iconbtn" onclick="J.toggleTheme()" aria-label="밝기 전환">◐</button>
      </header>`;
    }
    const toc = document.getElementById('toc');
    if(toc){
      let html = `<h4>目次 · 목차</h4><a href="${base}index.html"><b>00</b>책 머리 · 로드맵</a>`;
      let pv = null;
      B.chapters.forEach(c => {
        if(c.vol && c.vol !== pv && B.vols){ const V = B.vols.find(x => x.id === c.vol); if(V) html += `<div class="vol"><span>${V.hj}</span>${V.name}</div>`; pv = c.vol; }
        html += `<a href="${base}chapters/${c.slug}.html" class="${c.slug===slug?'on':''}"><b>${c.n}</b>${c.title}</a>`;
        if(c.slug === slug){
          const hs = J.$$('main.chapter h2[id]');
          if(hs.length) html += '<div class="sub">' + hs.map(h => `<a href="#${h.id}">${h.textContent.replace(/^\d+/,'')}</a>`).join('') + '</div>';
        }
      });
      toc.innerHTML = html;
      const btn = document.getElementById('tocbtn');
      if(btn) btn.onclick = () => toc.classList.toggle('open');
      toc.addEventListener('click', e => { if(e.target.closest('a') && innerWidth < 980) toc.classList.remove('open'); });
    }
    const pg = document.getElementById('pager');
    if(pg && inCh){
      const i = B.chapters.findIndex(c => c.slug === slug);
      const p = B.chapters[i-1], n = B.chapters[i+1];
      pg.className = 'pager';
      pg.innerHTML = (p ? `<a href="${p.slug}.html"><small>← 이전 장 ${p.n}</small><b>${p.title}</b></a>` : `<a href="../index.html"><small>← 책 머리</small><b>로드맵</b></a>`) +
        (n ? `<a class="next" href="${n.slug}.html"><small>다음 장 ${n.n} →</small><b>${n.title}</b></a>` : `<a class="next" href="../../index.html"><small>서가로 →</small><b>집현전</b></a>`);
    }
    // 장 머리 판심(어미) 장식
    const ch = J.$('.chead');
    if(ch && !J.$('.pansim', ch)){
      ch.insertAdjacentHTML('beforeend', `<svg class="pansim" viewBox="0 0 44 118" aria-hidden="true">
        <rect x="1" y="1" width="42" height="116" fill="none" stroke="var(--line)" stroke-width="1.5"/>
        <path d="M1 30 L43 30 L43 40 L22 50 L1 40 Z" fill="var(--red)" opacity=".85"/>
        <path d="M1 88 L43 88 L43 78 L22 68 L1 78 Z" fill="var(--red)" opacity=".85"/>
        <text x="22" y="62" text-anchor="middle" style="font-family:var(--serif);font-size:13px;fill:var(--ink2)">${(B.chapters.find(c=>c.slug===slug)||{}).n||''}</text>
        <text x="22" y="20" text-anchor="middle" style="font-family:var(--serif);font-size:11px;fill:var(--ink3)">${B.hanja||''}</text>
      </svg>`);
    }
    // 퀴즈
    J.$$('.quiz').forEach((q, qi) => {
      J.$('.q', q)?.setAttribute('data-n', qi+1);
      const ans = +q.dataset.a;
      J.$$('li', q).forEach((li, i) => li.addEventListener('click', () => {
        if(q.classList.contains('done')) return;
        q.classList.add('done');
        li.classList.add(i === ans ? 'right' : 'wrong');
        J.$$('li', q)[ans].classList.add('right');
      }));
    });
  }
  document.addEventListener('DOMContentLoaded', chrome);
  addEventListener('load', () => {
    if(window.renderMathInElement) renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false}], throwOnError:false});
  });
})();
