/* 포토 書 공용 리소그래피 엔진 — 아베 결상(1D 주기 무늬, 2D 광원), 광원 모양, CD·NILS 측정 */
window.L = (function(){
  /* 광원 점 목록 [sx, sy, w] (σ 단위, 동공 반지름 = 1) */
  function source(type, a = 0.6, b = 0.3, c = 0.2, step = 0.1){
    const P = [];
    for(let y = -1; y <= 1.0001; y += step) for(let x = -1; x <= 1.0001; x += step){
      const r = Math.hypot(x, y); if(r > 1) continue; let on = false;
      if(type === 'conv') on = r <= a;
      else if(type === 'coh') on = false;
      else if(type === 'ann') on = r <= a && r >= b;
      else if(type === 'dip') on = Math.hypot(Math.abs(x) - a, y) <= c;
      else if(type === 'dipy') on = Math.hypot(x, Math.abs(y) - a) <= c;
      else if(type === 'quasar'){ const k = a/Math.SQRT2; on = Math.hypot(Math.abs(x) - k, Math.abs(y) - k) <= c; }
      else if(type === 'quad'){ on = Math.hypot(Math.abs(x) - a, y) <= c || Math.hypot(x, Math.abs(y) - a) <= c; }
      if(on) P.push([x, y, 1]);
    }
    if(!P.length) P.push([0, 0, 1]);
    return P;
  }
  /* 한 주기 안의 구간별 복소 투과율 → 푸리에 계수. seg: [x0, x1, re, im] (주기 비율, -0.5~0.5) */
  function coefSeg(seg, bg = [0, 0]){
    return m => { let re = 0, im = 0;
      const add = (x0, x1, tr, ti) => { if(m === 0){ re += tr*(x1 - x0); im += ti*(x1 - x0); return; }
        const k = 2*Math.PI*m, cr = (Math.sin(k*x1) - Math.sin(k*x0))/k, ci = (Math.cos(k*x1) - Math.cos(k*x0))/k; // ∫e^{-ikx} = ∫cos − i∫sin
        // ∫cos = cr, −i∫sin = i·(cos(kx1) − cos(kx0))/k = i·ci
        re += tr*cr - ti*ci; im += ti*cr + tr*ci; };
      add(-0.5, 0.5, bg[0], bg[1]);
      seg.forEach(([x0, x1, tr, ti]) => add(x0, x1, tr - bg[0], ti - bg[1]));
      return [re, im]; };
  }
  /* 선·간격: 가운데 투과 틈 폭 du(주기 비율) */
  const coefLS = du => coefSeg([[-du/2, du/2, 1, 0]]);
  /* 결상: x ∈ [-p/2, p/2) 위의 세기 */
  function image(o){
    const N = 2*Math.round((o.N || 128)/2), p = o.p, n = o.n || 1, lam = o.lam, fc = o.na/lam, lm = lam/n, I = new Float64Array(N);
    const src = o.src || [[0, 0, 1]], coef = o.coef || coefLS(0.5), z = o.z || 0, M = Math.ceil(2*fc*p) + 1;
    const cache = new Map(); const C = m => { if(!cache.has(m)) cache.set(m, coef(m)); return cache.get(m); };
    let W = 0; const aber = o.aber || null;
    for(const [sx, sy, w] of src){ W += w; const fx0 = sx*fc, fy = sy*fc;
      const ords = [];
      for(let m = -M; m <= M; m++){ const fx = m/p + fx0, f2 = fx*fx + fy*fy; if(f2 > fc*fc*1.0000001) continue; const c = C(m); if(Math.abs(c[0]) + Math.abs(c[1]) < 1e-9) continue;
        let ph = 2*Math.PI*z*(Math.sqrt(Math.max(0, 1/(lm*lm) - f2)) - 1/lm); if(aber) ph += aber(fx/fc, fy/fc);
        ords.push([2*Math.PI*m/p, c[0], c[1], ph]); }
      for(let i = 0; i < N; i++){ const x = (i - N/2)/N*p; let re = 0, im = 0;
        for(const [k, cr, ci, ph] of ords){ const a = k*x + ph, cs = Math.cos(a), sn = Math.sin(a); re += cr*cs - ci*sn; im += cr*sn + ci*cs; }
        I[i] += w*(re*re + im*im); } }
    for(let i = 0; i < N; i++) I[i] /= W;
    if(o.blur){ blur(I, o.blur/p*N); }
    return I;
  }
  /* 감광액 확산(가우스) 흐림, 주기 경계 */
  function blur(I, s){ if(s < 0.3) return I; const N = I.length, R = Math.ceil(3*s), k = []; let S = 0; for(let j = -R; j <= R; j++){ const v = Math.exp(-j*j/(2*s*s)); k.push(v); S += v; }
    const T = Float64Array.from(I); for(let i = 0; i < N; i++){ let a = 0; for(let j = -R; j <= R; j++) a += T[((i + j) % N + N) % N]*k[j + R]; I[i] = a/S; } return I; }
  /* 가운데(x=0)를 포함한 I > th 구간 폭 */
  function cd(I, p, th){
    const N = I.length, c = N >> 1, dx = p/N;
    if(I[c] <= th) return 0;
    let r = c; while(r < N - 1 && I[r + 1] > th) r++; if(r >= N - 1) return p;
    let l = c; while(l > 0 && I[l - 1] > th) l--; if(l <= 0) return p;
    const xr = r + (I[r] - th)/(I[r] - I[r + 1]), xl = l - (I[l] - th)/(I[l] - I[l - 1]);
    return (xr - xl)*dx;
  }
  /* 가장자리에서의 NILS = CD·|dI/dx|/I */
  function nils(I, p, th){
    const N = I.length, c = N >> 1, dx = p/N; const w = cd(I, p, th); if(!(w > 0 && w < p)) return 0;
    let r = c; while(r < N - 1 && I[r + 1] > th) r++;
    const g = Math.abs(I[r + 1] - I[r])/dx; return w*g/th;
  }
  function contrast(I){ let a = 0, b = 9; I.forEach(v => { a = Math.max(a, v); b = Math.min(b, v); }); const c = (a - b)/(a + b + 1e-12); return c < 1e-6 ? 0 : c; }
  /* 목표 CD가 되는 문턱 찾기 (초점 0) */
  function thFor(I, p, target){ let lo = 1e-4, hi = Math.max(...I); for(let k = 0; k < 40; k++){ const m = (lo + hi)/2; if(cd(I, p, m) > target) lo = m; else hi = m; } return (lo + hi)/2; }
  /* 동공 그리기: 광원 + 회절 차수 복사본 */
  function drawPupil(ctx, w, h, o){
    const cx = w/2, cy = h/2, R = Math.min(w, h)*0.3, src = o.src, fc = o.na/o.lam;
    ctx.strokeStyle = J.c('--ink2'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    const cols = ['--ink', '--red', '--gold', '--jade'];
    for(let m = -3; m <= 3; m++){ const c = o.coef ? o.coef(m) : [1, 0]; if(Math.abs(c[0]) + Math.abs(c[1]) < 1e-6) continue;
      const off = m/o.p/fc*R; if(Math.abs(off) > w) continue;
      ctx.fillStyle = J.c(cols[Math.min(3, Math.abs(m))]); ctx.globalAlpha = m === 0 ? .55 : .45;
      src.forEach(([sx, sy]) => { const x = cx + sx*R + off, y = cy - sy*R; const inside = Math.hypot(sx*R + off, sy*R) <= R; ctx.globalAlpha = inside ? (m === 0 ? .7 : .6) : .12; ctx.fillRect(x - 2, y - 2, 4, 4); });
      ctx.globalAlpha = 1; ctx.font = '11px "JetBrains Mono"'; ctx.textAlign = 'center'; ctx.fillText((m > 0 ? '+' : '') + m, cx + off, cy + R + 16); }
    ctx.fillStyle = J.c('--ink3'); ctx.font = '11px "Noto Sans KR"'; ctx.textAlign = 'center'; ctx.fillText('동공 (NA 경계)', cx, cy - R - 8);
  }
  return {source, coefSeg, coefLS, image, blur, cd, nils, contrast, thFor, drawPupil};
})();
