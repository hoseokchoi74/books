/* 식각 書 공용 단면 시뮬레이터 — 격자 위 입자 추적(이온·중성 라디칼·폴리머 전구체) */
window.ES = (function(){
  const VAC = 0, MASK = 1, FILM = 2, STOP = 3, SUB = 4, POLY = 5;
  const NAMES = {1:'마스크', 2:'식각 대상막', 3:'정지막', 4:'기판', 5:'폴리머'};
  const COL = {1:'#9c7bd1', 2:'#8cc6e6', 3:'#d9a441', 4:'#8f96a3', 5:'#5f9a45'};
  /* o: {W, H, dx(nm/칸), gap(위 진공 칸), stack:[[재질, 두께칸],…], open:[[x0, x1],…] (마스크 틈, 칸)} */
  function create(o){
    const W = o.W, H = o.H, m = new Uint8Array(W*H), hp = new Float32Array(W*H), dep = new Float32Array(W*H), act = new Float32Array(W*H);
    let y = o.gap; const tops = {};
    for(const [mat, t] of o.stack){ tops[mat] = tops[mat] ?? y; for(let yy = y; yy < Math.min(H, y + t); yy++) for(let x = 0; x < W; x++){ m[yy*W + x] = mat; hp[yy*W + x] = 1; } y += t; }
    const last = o.stack[o.stack.length - 1][0]; for(let yy = y; yy < H; yy++) for(let x = 0; x < W; x++){ m[yy*W + x] = last; hp[yy*W + x] = 1; }
    (o.open || []).forEach(([a, b]) => { for(let yy = 0; yy < H; yy++) for(let x = Math.max(0, a); x < Math.min(W, b); x++) if(m[yy*W + x] === MASK){ m[yy*W + x] = VAC; hp[yy*W + x] = 0; } });
    return {W, H, dx:o.dx || 2, m, hp, dep, act, gap:o.gap, tops, open:o.open || [], n:{ion:0, neu:0, poly:0}, removed:{}, t:0};
  }
  const solid = (s, x, y) => { if(y < 0) return false; if(y >= s.H) return true; x = ((x % s.W) + s.W) % s.W; return s.m[y*s.W + x] !== VAC; };
  function normal(s, xi, yi){ let nx = 0, ny = 0; for(let j = -2; j <= 2; j++) for(let i = -2; i <= 2; i++){ if(!i && !j) continue; if(solid(s, xi + i, yi + j)){ const w = 1/(i*i + j*j); nx -= i*w; ny -= j*w; } } const L = Math.hypot(nx, ny) || 1; return [nx/L, ny/L]; }
  /* (x, y)에서 (vx, vy) 방향으로 첫 고체 칸을 찾는다. 위로 빠져나가면 null */
  function trace(s, x, y, vx, vy){ const st = 0.45; let px = x, py = y;
    for(let k = 0; k < 4*(s.H + s.W); k++){ const nx = px + vx*st, ny = py + vy*st; if(ny < 0) return null;
      const xi = Math.floor(nx), yi = Math.floor(ny); if(solid(s, xi, yi)) return {xi:((xi % s.W) + s.W) % s.W, yi, px, py}; px = nx; py = ny; if(px < 0) px += s.W; if(px >= s.W) px -= s.W; }
    return null; }
  const lambert = (r, n) => { // 법선 n 주위 코사인 분포 방향
    const st = Math.sqrt(r()), ct = Math.sqrt(1 - st*st), sg = r() < .5 ? -1 : 1, tx = -n[1], ty = n[0]; return [n[0]*ct + tx*st*sg, n[1]*ct + ty*st*sg]; };
  function hit(s, c, amt){ const mat = s.m[c]; s.hp[c] -= amt; if(s.hp[c] <= 0){ s.m[c] = VAC; s.hp[c] = 0; s.removed[mat] = (s.removed[mat] || 0) + 1; } }
  /* p: {ionE(eV), ionSig(도), ion, neu, poly(입자 수/스텝), sN(대상막 라디칼 반응 확률), Ymask(마스크 상대 수율), Ystop, sSub, reflect(0~1), sPoly(폴리머 부착), neuMask} */
  function step(s, p, r){
    r = r || Math.random; const W = s.W, sqE = Math.max(0, Math.sqrt(p.ionE || 100) - Math.sqrt(20));
    const Yi = {1:(p.Ymask ?? 0.15), 2:(p.Yfilm ?? 1), 3:(p.Ystop ?? 0.08), 4:(p.Ysub ?? 0.7), 5:(p.Ypoly ?? 1.6)};
    const Sn = {1:(p.sN || 0)*(p.neuMask ?? 0.03), 2:(p.sN || 0), 3:(p.sN || 0)*(p.neuStop ?? 0.05), 4:(p.sSub ?? (p.sN || 0)), 5:0};
    const kI = 0.022*sqE, kN = 0.08, sp = p.spont ?? 0.1;
    for(let i = 0; i < s.act.length; i++) if(s.act[i]) s.act[i] *= 0.8;
    // 이온
    for(let i = 0; i < (p.ion || 0); i++){ s.n.ion++; let x = r()*W, y = 0.01, th = J.gauss(r)*(p.ionSig || 2)*Math.PI/180, vx = Math.sin(th), vy = Math.cos(th), e = 1;
      for(let b = 0; b < 3; b++){ const h = trace(s, x, y, vx, vy); if(!h) break; const c = h.yi*W + h.xi, n = normal(s, h.xi, h.yi), ca = Math.max(0, -(vx*n[0] + vy*n[1])), sa2 = 1 - ca*ca;
        if(ca < 0.34 && r() < (p.reflect ?? 0.6)){ const d = vx*n[0] + vy*n[1]; vx -= 2*d*n[0]; vy -= 2*d*n[1]; x = h.px; y = h.py; e *= 0.7; continue; }
        const mat = s.m[c], ang = mat === MASK ? (ca + 2.2*sa2*ca) : (0.35 + 0.65*ca); s.act[c] = Math.min(2, s.act[c] + 1); const c2 = Math.min(s.H - 1, h.yi + 1)*W + h.xi; s.act[c2] = Math.min(2, s.act[c2] + 0.6); hit(s, c, kI*e*Yi[mat]*ang); break; } }
    // 중성 라디칼
    for(let i = 0; i < (p.neu || 0); i++){ s.n.neu++; let x = r()*W, y = 0.01, n0 = [0, 1], d = lambert(r, n0), vx = d[0], vy = d[1];
      for(let b = 0; b < 40; b++){ const h = trace(s, x, y, vx, vy); if(!h) break; const c = h.yi*W + h.xi, mat = s.m[c];
        if(r() < Sn[mat]*Math.min(1, sp + s.act[c])){ hit(s, c, kN); break; }
        const n = normal(s, h.xi, h.yi), q = lambert(r, n); vx = q[0]; vy = q[1]; x = h.px; y = h.py; } }
    // 폴리머 전구체
    for(let i = 0; i < (p.poly || 0); i++){ s.n.poly++; let x = r()*W, y = 0.01, d = lambert(r, [0, 1]), vx = d[0], vy = d[1];
      for(let b = 0; b < 20; b++){ const h = trace(s, x, y, vx, vy); if(!h) break;
        if(r() < (p.sPoly ?? 0.3)){ const vx0 = Math.floor(h.px), vy0 = Math.floor(h.py); if(vy0 >= 0 && !solid(s, vx0, vy0)){ const c = vy0*W + ((vx0 % W) + W) % W; s.dep[c] += 0.25; if(s.dep[c] >= 1){ s.m[c] = POLY; s.hp[c] = 1; s.dep[c] = 0; } } break; }
        const n = normal(s, h.xi, h.yi), q = lambert(r, n); vx = q[0]; vy = q[1]; x = h.px; y = h.py; } }
    s.t++;
  }
  function draw(ctx, w, h, s, o = {}){
    const sc = Math.min(w/s.W, h/s.H), ox = (w - sc*s.W)/2, oy = o.oy ?? 0;
    ctx.fillStyle = o.bg || (J.isDark() ? '#1d1b18' : '#fbf7ee'); ctx.fillRect(ox, oy, s.W*sc, s.H*sc);
    for(let y = 0; y < s.H; y++){ let x = 0; while(x < s.W){ const v = s.m[y*s.W + x]; let e = x; while(e < s.W && s.m[y*s.W + e] === v) e++; if(v){ ctx.fillStyle = COL[v]; ctx.fillRect(ox + x*sc, oy + y*sc, (e - x)*sc + .5, sc + .5); } x = e; } }
    return {sc, ox, oy};
  }
  /* 측정: 틈 [a,b]의 중심 열에서 깊이·윗/중간/바닥 CD·최대 폭(보잉)·언더컷 */
  function measure(s, a, b){
    const W = s.W, xc = Math.floor((a + b)/2), ft = s.tops[FILM] ?? s.gap, mt = s.tops[MASK] ?? s.gap;
    let y = 0; while(y < s.H && !solid(s, xc, y)) y++; const depth = Math.max(0, y - ft);
    const width = yy => { if(yy < 0 || yy >= s.H || solid(s, xc, yy)) return 0; let l = xc, r = xc; while(l > xc - W/2 && !solid(s, l - 1, yy)) l--; while(r < xc + W/2 && !solid(s, r + 1, yy)) r++; return r - l + 1; };
    const bottom = ft + depth - 1, top = ft + 1, wTop = width(top), wMid = width(Math.round(ft + depth/2)), wBot = depth > 3 ? width(bottom - 1) : 0;
    let wMax = 0, yMax = ft; for(let yy = ft; yy < ft + depth; yy++){ const wd = width(yy); if(wd > wMax){ wMax = wd; yMax = yy; } }
    // 마스크 남은 두께(틈에서 떨어진 열)
    const nx = s.open.find(o => o[0] >= b), xm = Math.floor(((nx ? nx[0] : (s.open[0] ? s.open[0][0] + W : b + W/2)) + b)/2) % W; let mtop = 0; while(mtop < s.H && s.m[mtop*W + xm] !== MASK && s.m[mtop*W + xm] !== FILM) mtop++;
    const maskLeft = s.m[mtop*W + xm] === MASK ? Math.max(0, ft - mtop) : 0;
    const under = wTop ? Math.max(0, (wTop - (b - a))/2) : 0;
    const swa = depth > 4 && wBot > 0 ? Math.atan2(depth, Math.max(0.001, (wTop - wBot)/2))*180/Math.PI : 90;
    const dx = s.dx; return {depth:depth*dx, wTop:wTop*dx, wMid:wMid*dx, wBot:wBot*dx, wMax:wMax*dx, bow:Math.max(0, wMax - Math.max(wTop, wBot))*dx, yBow:(yMax - ft)*dx, maskLeft:maskLeft*dx, under:under*dx, swa, reachedStop:solid(s, xc, y) && s.m[Math.min(s.H - 1, y)*W + xc] === STOP};
  }
  return {VAC, MASK, FILM, STOP, SUB, POLY, NAMES, COL, create, step, draw, measure, solid, normal, trace};
})();
