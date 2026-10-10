/* 확산 書 공용 엔진 — 도펀트 확산 계수, 1D 확산 방정식(내연 오일러 + 토머스), 이동도·면저항, 이온 주입 분포 */
window.DF = (function(){
  const kB = 8.617e-5, Q = 1.602e-19;
  /* 진성 확산 계수 (cm²/s) */
  const DOP = {
    B:{D0:0.76, Ea:3.46, type:'p', name:'붕소', M:11, col:'#d65a4a'},
    P:{D0:3.85, Ea:3.66, type:'n', name:'인', M:31, col:'#3d7fd0'},
    As:{D0:0.066, Ea:3.44, type:'n', name:'비소', M:75, col:'#3aa36a'},
    Sb:{D0:0.214, Ea:3.65, type:'n', name:'안티몬', M:122, col:'#8a5ac8'}};
  const D = (dop, Tc) => DOP[dop].D0*Math.exp(-DOP[dop].Ea/(kB*(Tc + 273.15)));
  const ni = Tc => { const T = Tc + 273.15; return 3.87e16*Math.pow(T, 1.5)*Math.exp(-7.02e3/T); };
  /* 고용도 (대략, cm⁻³) */
  const solub = (dop, Tc) => ({B:2.5e20, P:1.2e21, As:1.8e21, Sb:7e19}[dop])*Math.exp(-0.3*Math.max(0, 1100 - Tc)/100);
  function erf(x){ const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1/(1 + 0.3275911*x), y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-x*x); return s*y; }
  const erfc = x => 1 - erf(x);
  /* 1D 확산: C (cm⁻³) 배열, dx (cm), 경계: top {type:'refl'|'fixed'|'flux', Cs, h, Ceq}, bottom 'refl' 또는 'fixed'
     Dfun(Ci, i) → D (cm²/s). 내연 오일러, 스텝마다 D를 이전 값으로 고정(반내연). */
  function step(C, dx, dt, Dfun, top, bottom){
    const N = C.length, a = new Float64Array(N), b = new Float64Array(N), c = new Float64Array(N), d = new Float64Array(N);
    const Df = new Float64Array(N + 1); for(let i = 1; i < N; i++){ const d1 = Dfun(C[i - 1], i - 1), d2 = Dfun(C[i], i); Df[i] = 2*d1*d2/(d1 + d2 + 1e-300); }
    const r = dt/(dx*dx);
    for(let i = 0; i < N; i++){ const wl = i > 0 ? Df[i]*r : 0, wr = i < N - 1 ? Df[i + 1]*r : 0; a[i] = -wl; c[i] = -wr; b[i] = 1 + wl + wr; d[i] = C[i]; }
    if(top.type === 'fixed'){ a[0] = 0; c[0] = 0; b[0] = 1; d[0] = top.Cs; }
    else if(top.type === 'flux'){ b[0] += top.h*dt/dx; d[0] += top.h*dt/dx*(top.Ceq || 0); } // 표면 손실 (증발·산화막 흡수)
    if(bottom === 'fixed'){ a[N - 1] = 0; c[N - 1] = 0; b[N - 1] = 1; d[N - 1] = C[N - 1]; }
    for(let i = 1; i < N; i++){ const m = a[i]/b[i - 1]; b[i] -= m*c[i - 1]; d[i] -= m*d[i - 1]; }
    const out = new Float64Array(N); out[N - 1] = d[N - 1]/b[N - 1]; for(let i = N - 2; i >= 0; i--) out[i] = (d[i] - c[i]*out[i + 1])/b[i];
    for(let i = 0; i < N; i++) if(out[i] < 0) out[i] = 0; return out;
  }
  function solve(C, dx, T, Dfun, top = {type:'refl'}, bottom = 'refl', nsteps = 200){
    let X = Float64Array.from(C); const dt = T/nsteps; for(let k = 0; k < nsteps; k++) X = step(X, dx, dt, Dfun, top, bottom); return X; }
  /* 이동도 (Caughey–Thomas) cm²/Vs */
  const mob = (N, type) => type === 'n' ? 65 + 1200/(1 + Math.pow(N/8.5e16, 0.72)) : 47.7 + 399.6/(1 + Math.pow(N/6.3e16, 0.76));
  /* 접합 깊이: C(x) = NB 인 첫 깊이 (cm) */
  function xj(C, dx, NB){ for(let i = 1; i < C.length; i++) if(C[i - 1] >= NB && C[i] < NB) return (i - 1 + (C[i - 1] - NB)/(C[i - 1] - C[i]))*dx; return C[0] < NB ? 0 : C.length*dx; }
  /* 면저항 Ω/□ : 접합 위 순 도핑만 전도에 기여 */
  function rs(C, dx, NB, type){ let g = 0; for(let i = 0; i < C.length; i++){ const n = C[i] - NB; if(n <= 0) break; g += Q*mob(C[i] + NB, type)*n*dx; } return g > 0 ? 1/g : Infinity; }
  /* 이온 주입 표 (keV → nm) */
  const E = [1, 2, 5, 10, 20, 50, 100, 200];
  const RP = {B:[5.5, 10, 20, 37, 70, 160, 300, 520], P:[2.7, 4.5, 8.5, 15, 28, 65, 130, 255], As:[2, 3, 5.5, 9, 16, 35, 65, 125], Sb:[1.8, 2.7, 4.8, 7.8, 13, 28, 52, 98]};
  const DRP = {B:[3.5, 6, 11, 17, 27, 50, 72, 95], P:[1.4, 2.4, 4.2, 7, 12, 25, 45, 75], As:[0.8, 1.3, 2.2, 3.5, 6, 13, 22, 38], Sb:[0.6, 1, 1.7, 2.7, 4.5, 9, 16, 27]};
  const interp = (arr, e) => { const le = Math.log(e); for(let i = 0; i < E.length - 1; i++){ if(e <= E[i + 1] || i === E.length - 2){ const f = (le - Math.log(E[i]))/(Math.log(E[i + 1]) - Math.log(E[i])); return Math.exp(Math.log(arr[i]) + f*(Math.log(arr[i + 1]) - Math.log(arr[i]))); } } };
  const range = (dop, keV) => ({Rp:interp(RP[dop], keV), dRp:interp(DRP[dop], keV)}); // nm
  /* 주입 분포 (cm⁻³) at depth x (nm), 도즈 cm⁻², 채널링 꼬리 비율 ch, 꼬리 길이 lam(nm) */
  function implant(dop, keV, dose, x, ch = 0){ const {Rp, dRp} = range(dop, keV), g = Math.exp(-Math.pow(x - Rp, 2)/(2*dRp*dRp))/(Math.sqrt(2*Math.PI)*dRp*1e-7);
    const lam = 1.5*dRp + 0.2*Rp, nrm = lam + Math.sqrt(Math.PI/2)*dRp, tail = (x > Rp ? Math.exp(-(x - Rp)/lam) : Math.exp(-Math.pow(x - Rp, 2)/(2*dRp*dRp)))/(nrm*1e-7);
    return dose*((1 - ch)*g + ch*tail); }
  return {kB, Q, DOP, D, ni, solub, erf, erfc, step, solve, mob, xj, rs, range, implant};
})();
