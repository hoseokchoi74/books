/* 집현전 미니 3D — 상자·기둥을 화가 알고리즘으로 그리는 작은 엔진 (드래그 회전) */
window.J3 = (function(){
  function hex(c){
    c = (c || '#888').trim();
    if(c.startsWith('--')) c = getComputedStyle(document.documentElement).getPropertyValue(c).trim();
    if(c.startsWith('#')){
      if(c.length === 4) c = '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
      return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    }
    const m = c.match(/\d+(\.\d+)?/g); return m ? m.slice(0,3).map(Number) : [136,136,136];
  }
  function mix(a, b, t){ return a.map((v,i) => Math.round(v + (b[i]-v)*t)); }
  function rot(p, cam){
    const [x,y,z] = p, cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const x1 = x*cy - z*sy, z1 = x*sy + z*cy;
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    return [x1, y*cp - z1*sp, y*sp + z1*cp];
  }
  /* 장면: 면 목록 */
  function Scene(){ this.F = []; }
  Scene.prototype.box = function(x,y,z, w,h,d, color, o={}){
    const X=[x, x+w], Y=[y, y+h], Z=[z, z+d];
    const c = [x+w/2, y+h/2, z+d/2];
    const q = (a,b,cc,dd,n) => this.F.push({pts:[a,b,cc,dd], n, color, c, layer:o.layer||0, alpha:o.alpha??1, stroke:o.stroke, label:o.label});
    q([X[0],Y[1],Z[0]],[X[1],Y[1],Z[0]],[X[1],Y[1],Z[1]],[X[0],Y[1],Z[1]],[0,1,0]);
    q([X[0],Y[0],Z[0]],[X[1],Y[0],Z[0]],[X[1],Y[0],Z[1]],[X[0],Y[0],Z[1]],[0,-1,0]);
    q([X[0],Y[0],Z[0]],[X[1],Y[0],Z[0]],[X[1],Y[1],Z[0]],[X[0],Y[1],Z[0]],[0,0,-1]);
    q([X[0],Y[0],Z[1]],[X[1],Y[0],Z[1]],[X[1],Y[1],Z[1]],[X[0],Y[1],Z[1]],[0,0,1]);
    q([X[0],Y[0],Z[0]],[X[0],Y[0],Z[1]],[X[0],Y[1],Z[1]],[X[0],Y[1],Z[0]],[-1,0,0]);
    q([X[1],Y[0],Z[0]],[X[1],Y[0],Z[1]],[X[1],Y[1],Z[1]],[X[1],Y[1],Z[0]],[1,0,0]);
    return this;
  };
  Scene.prototype.prism = function(cx,y,cz, r,h, color, o={}){
    const n = o.n || 10, c = o.c || [cx, y+h/2, cz], top = [], bot = [];
    for(let i=0;i<n;i++){ const a = i/n*Math.PI*2 + (o.rot||0); top.push([cx+r*Math.cos(a), y+h, cz+r*Math.sin(a)]); bot.push([cx+r*Math.cos(a), y, cz+r*Math.sin(a)]); }
    for(let i=0;i<n;i++){
      const j = (i+1)%n, a = (i+.5)/n*Math.PI*2 + (o.rot||0);
      this.F.push({pts:[bot[i],bot[j],top[j],top[i]], n:[Math.cos(a),0,Math.sin(a)], color, c, layer:o.layer||0, alpha:o.alpha??1, stroke:o.stroke});
    }
    this.F.push({pts:top, n:[0,1,0], color:o.top||color, c, layer:o.layer||0, alpha:o.alpha??1, stroke:o.stroke});
    return this;
  };
  Scene.prototype.render = function(ctx, cam, W, H){
    const s = cam.scale, ox = W/2 + (cam.ox||0), oy = H/2 + (cam.oy||0);
    const L = [-0.35, 0.75, -0.55], ln = Math.hypot(...L); L.forEach((v,i)=>L[i]=v/ln);
    const items = [];
    for(const f of this.F){
      const n = rot(f.n, cam);
      if(n[2] > 0.02 && f.alpha >= 1) continue; // 뒷면 제거
      const P = f.pts.map(p => rot(p, cam));
      const fd = P.reduce((a,p)=>a+p[2],0)/P.length;
      const od = rot(f.c, cam)[2];
      items.push({f, P, fd, od, k: 0.55 + 0.45*Math.max(0, n[0]*L[0] + n[1]*L[1] + n[2]*L[2])});
    }
    items.sort((a,b) => (a.f.layer - b.f.layer) || (b.od - a.od) || (b.fd - a.fd));
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    for(const it of items){
      const base = hex(it.f.color);
      const c = it.k >= 1 ? base : mix(base, [0,0,0], (1-it.k)*0.9);
      ctx.globalAlpha = it.f.alpha;
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.beginPath();
      it.P.forEach((p,i) => { const x = ox + p[0]*s, y = oy - p[1]*s; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); });
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = it.f.stroke || (dark ? 'rgba(0,0,0,.35)' : 'rgba(40,25,10,.25)'); ctx.lineWidth = .7; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  /* 화면 좌표로 투영 (라벨용) */
  function project(p, cam, W, H){ const r = rot(p, cam); return [W/2 + (cam.ox||0) + r[0]*cam.scale, H/2 + (cam.oy||0) - r[1]*cam.scale]; }
  function drag(cv, cam, redraw){
    let d = null;
    const down = e => { d = {x:e.clientX, y:e.clientY, yaw:cam.yaw, pitch:cam.pitch}; cam.user = true; cv.setPointerCapture?.(e.pointerId); };
    const move = e => { if(!d) return; cam.yaw = d.yaw + (e.clientX - d.x)*0.01; cam.pitch = Math.max(0.12, Math.min(1.45, d.pitch + (e.clientY - d.y)*0.008)); redraw(); };
    const up = () => d = null;
    cv.style.touchAction = 'none'; cv.style.cursor = 'grab';
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
  return {Scene, rot, project, drag, hex, mix};
})();
