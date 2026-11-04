// Chart worksheets: the POH Section 5 charts (scanned) with this flight's path drawn on them,
// the same way the POH worked example is drawn (dashed line).
// Pixel calibrations come from the same digitisation as gcezo-charts.js (full-size scan pixels);
// the images in charts/ are half size, so every pixel value is multiplied by S.
const S_HALF = 0.5;
const GCEZO_SHEETS = {
  gr0:  { img: 'charts/fig5-7.jpg',  title: 'Fig 5-7 · 0° flaps take-off ground roll',  w: 1257, h: 827,
          T: [[-40, 506], [40, 1104]], D: [[0, 1359.5], [800, 1060]],
          Wt: [[2325, 1311.5], [2200, 1403], [2000, 1553], [1800, 1705], [1600, 1857]], K: [[0, 1934], [15, 2160]], dMin: 0 },
  to0:  { img: 'charts/fig5-9.jpg',  title: 'Fig 5-9 · 0° flaps take-off distance over 50 ft', w: 1272, h: 827,
          T: [[-40, 472.6], [40, 1068.6]], D: [[500, 1423], [4000, 384.9]],
          Wt: [[2325, 1125], [1600, 1667]], K: [[0, 1821], [15, 2051.25]], dMin: 500 },
  gr25: { img: 'charts/fig5-11.jpg', title: 'Fig 5-11 · 25° flaps take-off ground roll', w: 1270, h: 827,
          T: [[-40, 423.5], [40, 1030]], D: [[0, 1371.5], [2400, 467]],
          Wt: [[2325, 1084.5], [2200, 1180], [2000, 1329], [1800, 1479.5], [1600, 1631]], K: [[0, 1778.5], [15, 2005.5]], dMin: 0 },
  to25: { img: 'charts/fig5-13.jpg', title: 'Fig 5-13 · 25° flaps take-off distance over 50 ft', w: 1278, h: 827,
          T: [[-40, 489], [40, 1089]], D: [[500, 1426], [3000, 681.5]],
          Wt: [[2325, 1145.5], [2200, 1238], [2000, 1386], [1800, 1535.5], [1600, 1686]], K: [[0, 1842.5], [10, 1997.1], [15, 2074.4]], dMin: 500 },
  land: { img: 'charts/fig5-35.jpg', title: 'Fig 5-35 · landing distance (2325 lb)', w: 1258, h: 827,
          T: [[-40, 510], [-20, 661], [0, 813], [20, 963], [40, 1113]], yBottom: 1362 },
};

function _pw(pairs, v) { // piecewise-linear map value -> pixel (extrapolates at the ends)
  const p = [...pairs].sort((a, b) => a[0] - b[0]);
  let i = 0; while (i < p.length - 2 && v > p[i + 1][0]) i++;
  const [v0, x0] = p[i], [v1, x1] = p[i + 1];
  return x0 + (v - v0) * (x1 - x0) / (v1 - v0);
}

function _sheetSVG(sh, paths, labels) {
  const S = S_HALF;
  let s = `<svg viewBox="0 0 ${sh.w} ${sh.h}" width="100%" role="img" aria-label="${sh.title} with this flight's path" class="sheet">
    <image href="${sh.img}" x="0" y="0" width="${sh.w}" height="${sh.h}"/>`;
  paths.forEach(p => {
    const pts = p.pts.map(([x, y]) => `${(x * S).toFixed(1)},${(y * S).toFixed(1)}`).join(' ');
    s += `<polyline points="${pts}" fill="none" stroke="${p.col}" stroke-width="${p.w || 3.5}" stroke-linejoin="round" ${p.dash ? `stroke-dasharray="${p.dash}"` : ''} opacity="0.9"/>`;
    const e = p.pts[p.pts.length - 1];
    s += `<circle cx="${e[0] * S}" cy="${e[1] * S}" r="6" fill="${p.col}"/>`;
  });
  (labels || []).forEach(l => {
    s += `<text x="${l.x * S}" y="${l.y * S}" text-anchor="${l.a || 'start'}" class="sheetlbl" style="fill:${l.col}">${l.t}</text>`;
  });
  return s + '</svg>';
}

// Take-off chart worksheet. key: gr0|to0|gr25|to25. wind: +HW / -TW (already credited, i.e. chartWind()).
function takeoffSheetSVG(key, pa, oat, weight, wind) {
  const sh = GCEZO_SHEETS[key], ch = GCEZO_CHARTS[key];
  const X = v => _pw(sh.T, v), Y = d => _pw(sh.D, d), XW = w => _pw(sh.Wt, w), XK = k => _pw(sh.K, k);
  const d1 = _paLine(ch, pa, oat);
  const pts = [[X(oat), Y(sh.dMin)], [X(oat), Y(d1)], [XW(2325), Y(d1)]];
  const wEnd = Math.min(Math.max(weight, 1600), 2325);
  for (let w = 2325; w >= wEnd; w -= 10) pts.push([XW(w), Y(_family(ch.weight, w, d1))]);
  const d2 = _family(ch.weight, wEnd, d1);
  pts.push([XW(wEnd), Y(d2)], [XK(0), Y(d2)]);
  const k = Math.min(Math.abs(wind), wind >= 0 ? 15 : 5), fam = wind >= 0 ? ch.headwind : ch.tailwind;
  for (let kk = 0; kk <= k + 1e-9; kk += 0.25) pts.push([XK(kk), Y(_family(fam, kk, d2))]);
  const d3 = _family(fam, k, d2);
  const xr = XK(15) + (XK(15) - XK(0)) * 0.1;
  pts.push([XK(k), Y(d3)], [xr, Y(d3)]);
  return _sheetSVG(sh, [{ pts, col: '#e00000' }],
    [{ x: xr, y: Y(d3) - 14, t: `${Math.round(d3)} ft`, a: 'end', col: '#e00000' }]);
}

// Landing chart worksheet (Fig 5-35): over 50 ft (solid) and ground roll (dashed).
function landingSheetSVG(pa, oat, wind) {
  const sh = GCEZO_SHEETS.land, L = GCEZO_CHARTS.land;
  const xT = _pw(sh.T, oat);
  const i = Math.min(Math.max(Math.floor(pa / 1000), 0), L.b.length - 2), f = pa / 1000 - i;
  const y = L.slope * xT + (L.b[i] * (1 - f) + L.b[i + 1] * f);
  const r = landingChart(pa, oat, wind);
  const xOf = ft => L.ft.x0 + (ft - L.ft.ft0) * L.ft.pxft;
  const x50 = xOf(r.over50), xgr = xOf(r.groundRoll), yb = sh.yBottom;
  return _sheetSVG(sh, [
    { pts: [[xT, yb], [xT, y], [x50, y], [x50, yb]], col: '#e00000' },
    { pts: [[xT, y], [xgr, y], [xgr, yb]], col: '#0060d0', dash: '10 7', w: 3 },
  ], [
    { x: x50 + 8, y: yb - 10, t: `over 50 ft ${Math.round(r.over50)} ft`, col: '#e00000' },
    { x: xgr - 8, y: yb - 10, t: `ground roll ${Math.round(r.groundRoll)} ft`, a: 'end', col: '#0060d0' },
  ]);
}
