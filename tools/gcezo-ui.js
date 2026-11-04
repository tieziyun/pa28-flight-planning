// Shared UI helpers for the G-CEZO tools.
const $ = id => document.getElementById(id);
const num = id => { const v = parseFloat($(id).value); return isNaN(v) ? 0 : v; };
const fx = (v, d = 0) => (isFinite(v) ? v.toFixed(d) : '-');
const pill = (ok, okTxt = 'OK', badTxt = 'NO') => `<span class="pill ${ok ? 'ok' : 'bad'}">${ok ? okTxt : badTxt}</span>`;
const FT_TO_M = 0.3048;

const DISCLAIMER_HTML = `<div class="disclaimer" role="alert">
  <div class="dz-big">FOR REFERENCE AND DOUBLE-CHECKING ONLY &mdash; DO NOT USE FOR YOUR MAIN CALCULATIONS</div>
  <div class="dz-small">Unofficial, unapproved and untested training aid. It is <b>not</b> a substitute for the aircraft's POH/AFM, the operator's procedures,
  official weather, NOTAMs and charts, or an instructor. Chart values were digitised from a scanned POH and any figure here may be wrong.
  Do your primary planning from the official sources and use this only to cross-check them. The pilot in command alone is responsible for the flight
  and for verifying every figure (SERA.2010). Provided "as is", without warranty of any kind, express or implied. To the fullest extent permitted by law,
  the author(s) accept no responsibility or liability for any loss, damage, injury or death arising from its use or from reliance on it.
  By using it you accept these terms. Nothing here excludes liability that cannot lawfully be excluded.</div>
</div>`;

function navBar(active) {
  const pages = [
    ['preflight.html', 'Pre-flight planning'],
    ['weight-balance.html', 'Weight & balance'],
    ['performance.html', 'Take-off / landing'],
    ['nav-legs.html', 'Nav legs'],
    ['fuel.html', 'Fuel'],
    ['settings.html', 'Aircraft settings'],
  ];
  document.body.insertAdjacentHTML('afterbegin', DISCLAIMER_HTML +
    `<header><h1>${GCEZO.reg} &middot; PA-28-161 Cadet</h1><nav>` +
    pages.map(([h, t]) => `<a href="${h}" class="${h === active ? 'on' : ''}">${t}</a>`).join('') +
    `</nav></header>`);
}

// Distance factor rows for side s ('to' or 'ld'): checkbox + editable multiplier (defaults from the club sheet).
function factorBoxes(s) {
  const row = (id, label, v, on) => `<label class="row fac"><input type="checkbox" id="${s}_${id}" ${on ? 'checked' : ''}> <span style="flex:1">${label}</span>
    &times;<input id="${s}_${id}_v" type="number" step="0.01" min="1" value="${v}" style="width:72px"></label>`;
  return GCEZO_FACTORS.filter(f => s === 'to' ? f.to : f.ld).map(f => row(f.id, f.label, s === 'to' ? f.to : f.ld, f.on)).join('') +
    row('saf', 'Safety factor', GCEZO_SAFETY[s], true);
}
// Returns {product, used:[[label,value],...]}
function factorDetail(s) {
  const used = []; let f = 1;
  const take = (id, label) => { const v = parseFloat($(`${s}_${id}_v`).value); if ($(`${s}_${id}`).checked && v > 0) { f *= v; used.push([label, v]); } };
  GCEZO_FACTORS.forEach(x => { if (s === 'to' ? x.to : x.ld) take(x.id, x.label); });
  take('saf', 'Safety factor');
  return { product: f, used };
}
function factorProduct(s) { return factorDetail(s).product; }

// Flight assumptions panel (wind credit, pressure-altitude rule). Shared by all pages via localStorage 'gcezo-assume'.
function assumptionsPanel(containerId, onChange) {
  $(containerId).innerHTML = `<div class="kv2">
   <label class="f">Headwind credit % <small>conservative 50</small><input id="as_head" type="number" min="0" max="100" step="5" value="${GCEZO.wind.headPct}"></label>
   <label class="f">Tailwind applied % <small>conservative 150</small><input id="as_tail" type="number" min="100" step="5" value="${GCEZO.wind.tailPct}"></label>
   <label class="f">Pressure alt ft per hPa <input id="as_fph" type="number" step="0.1" value="${GCEZO.pa.ftPerHpa}"></label>
   <label class="row"><input type="checkbox" id="as_noq" ${GCEZO.pa.noHighQnhCredit ? 'checked' : ''}> No credit for QNH above 1013 (conservative)</label></div>`;
  const upd = () => {
    GCEZO.wind.headPct = parseFloat($('as_head').value) || 0; GCEZO.wind.tailPct = parseFloat($('as_tail').value) || 0;
    GCEZO.pa.ftPerHpa = parseFloat($('as_fph').value) || 0; GCEZO.pa.noHighQnhCredit = $('as_noq').checked;
    try { localStorage.setItem('gcezo-assume', JSON.stringify({ 'wind.headPct': GCEZO.wind.headPct, 'wind.tailPct': GCEZO.wind.tailPct, 'pa.ftPerHpa': GCEZO.pa.ftPerHpa, 'pa.noHighQnhCredit': GCEZO.pa.noHighQnhCredit })); } catch (e) {}
    onChange();
  };
  ['as_head', 'as_tail', 'as_fph', 'as_noq'].forEach(i => $(i).addEventListener('input', upd));
}
function windNote() {
  return `Wind into charts: ${GCEZO.wind.headPct}% of headwind, ${GCEZO.wind.tailPct}% of tailwind (flight assumptions).`;
}

// ---------------------------------------------------------------------
// Runway side-view drawing (metres). kind 'to' | 'ld'
// ---------------------------------------------------------------------
function runwaySVG(kind, grM, d50M, reqM, availM) {
  const W = 640, H = 175, L = 20, R = 20, base = 120, top = 40;
  const span = Math.max(reqM, availM || 0, d50M) * 1.08 || 1;
  const X = m => L + m / span * (W - L - R);
  const ok = !(availM > 0) || reqM <= availM;
  const col = ok ? 'var(--ok)' : 'var(--bad)';
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${kind === 'to' ? 'Take-off' : 'Landing'} distance diagram">`;
  if (availM > 0) {
    s += `<rect x="${X(0)}" y="${base}" width="${X(availM) - X(0)}" height="10" fill="var(--line)"/>`;
    s += `<line x1="${X(availM)}" y1="${top - 10}" x2="${X(availM)}" y2="${base + 16}" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<text x="${X(availM) - 4}" y="${top - 14}" text-anchor="end" style="fill:var(--ink)">${kind === 'to' ? 'TORA' : 'LDA'} ${fx(availM)} m</text>`;
  } else s += `<line x1="${X(0)}" y1="${base + 5}" x2="${W - R}" y2="${base + 5}" stroke="var(--line)" stroke-width="10" stroke-dasharray="6 6"/>`;
  s += `<line x1="${X(0)}" y1="${top}" x2="${W - R}" y2="${top}" stroke="var(--mute)" stroke-dasharray="3 4"/><text x="${W - R}" y="${top + 12}" text-anchor="end">50 ft</text>`;
  if (kind === 'to') {
    s += `<line x1="${X(0)}" y1="${base}" x2="${X(grM)}" y2="${base}" stroke="var(--acc)" stroke-width="4"/>`;
    s += `<path d="M${X(grM)},${base} Q${X((grM + d50M) / 2)},${base} ${X(d50M)},${top}" fill="none" stroke="var(--acc)" stroke-width="3"/>`;
    s += `<text x="${X(grM / 2)}" y="${base - 6}" text-anchor="middle" style="fill:var(--ink)">ground roll ${fx(grM)} m</text>`;
    s += `<circle cx="${X(d50M)}" cy="${top}" r="4" fill="var(--acc)"/><text x="${X(d50M)}" y="${top - 6}" text-anchor="middle" style="fill:var(--ink)">50 ft at ${fx(d50M)} m</text>`;
  } else {
    const td = d50M - grM;
    s += `<path d="M${X(0)},${top} Q${X(td * 0.6)},${top} ${X(td)},${base}" fill="none" stroke="var(--acc)" stroke-width="3"/>`;
    s += `<line x1="${X(td)}" y1="${base}" x2="${X(d50M)}" y2="${base}" stroke="var(--acc)" stroke-width="4"/>`;
    s += `<circle cx="${X(0)}" cy="${top}" r="4" fill="var(--acc)"/><text x="${X(0) + 6}" y="${top - 6}" style="fill:var(--ink)">over 50 ft</text>`;
    s += `<text x="${X(td + grM / 2)}" y="${base - 6}" text-anchor="middle" style="fill:var(--ink)">ground roll ${fx(grM)} m</text>`;
  }
  s += `<line x1="${X(0)}" y1="${base + 26}" x2="${X(reqM)}" y2="${base + 26}" stroke="${col}" stroke-width="3"/>` +
       `<line x1="${X(reqM)}" y1="${base + 18}" x2="${X(reqM)}" y2="${base + 34}" stroke="${col}" stroke-width="3"/>` +
       `<text x="${X(0)}" y="${base + 48}" style="fill:${col};font-weight:600;font-size:12px">${kind === 'to' ? 'TODR' : 'LDR'} (factored) ${fx(reqM)} m${availM > 0 ? (ok ? ' &le; ' : ' &gt; ') + (kind === 'to' ? 'TORA' : 'LDA') : ''}</text>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------------
// "Show the maths" blocks: LaTeX equations (rendered to MathML by gcezo-math.js) with live numbers.
// Each line: symbolic form = numbers substituted = **result**
// ---------------------------------------------------------------------
const tx = s => String(s).replace(/[{}\\]/g, '');          // safe text inside \text{}
const nm = v => { const s = String(v); return s.startsWith('-') ? `(${s})` : s; }; // wrap negatives
const eq = (tex, note) => `<div class="eq">${tex2mml(tex, false)}${note ? `<div class="eqnote">${note}</div>` : ''}</div>`;
const res = (v, unit) => String.raw`\mathbf{${v}\,\text{${unit}}}`;
const mh = t => `<h4>${t}</h4>`;
const where = items => `<div class="eqnote">where ${items.join('; ')}</div>`;

function mathsWB(r, cat, kgTotal) {
  const F = GCEZO.fuel.lbPerUSG, c = GCEZO.cg[cat === 'utility' ? 'utility' : 'normal'];
  let h = mh('Weight &amp; balance (POH 6.7)');
  if (kgTotal !== undefined) h += eq(String.raw`W_{\text{lb}} = W_{\text{kg}}\times 2.20462262 = ${fx(kgTotal, 1)}\times 2.20462262 = ${res(fx(kgTotal * GCEZO.conv.kgToLb, 1), 'lb')}`);
  h += eq(String.raw`W_{\text{fuel}} = V_{\text{USG}}\times ${F} = ${fx(r.rows[3].w / F, 2)}\times ${F} = ${res(fx(r.rows[3].w, 1), 'lb')}`);
  h += eq(String.raw`M_i = W_i\times \text{arm}_i`);
  r.rows.forEach(x => h += eq(String.raw`M_{\text{${tx(x.item)}}} = ${fx(x.w, 1)}\times ${fx(x.arm, 2)} = ${res(fx(x.m, 1), 'lb in')}`));
  const cg = (n, t) => eq(String.raw`\text{CG}_{\text{${n}}} = \frac{\sum M}{\sum W} = \frac{${fx(t.m, 1)}}{${fx(t.w, 1)}} = ${res(fx(t.cg, 2), 'in')}`);
  h += eq(String.raw`W_{\text{ramp}} = \sum W_i = ${r.rows.map(x => fx(x.w, 1)).join(' + ')} = ${res(fx(r.ramp.w, 1), 'lb')}`) + cg('ramp', r.ramp);
  h += eq(String.raw`W_{\text{T/O}} = W_{\text{ramp}} + W_{\text{taxi}} = ${fx(r.ramp.w, 1)} + ${nm(fx(r.taxi.w, 1))} = ${res(fx(r.takeoff.w, 1), 'lb')}`) + cg('T/O', r.takeoff);
  h += eq(String.raw`W_{\text{LDG}} = W_{\text{T/O}} - W_{\text{trip}} = ${fx(r.takeoff.w, 1)} - ${fx(-r.trip.w, 1)} = ${res(fx(r.landing.w, 1), 'lb')}`) + cg('LDG', r.landing);
  const fl = (n, w, f) => w <= c.w1
    ? eq(String.raw`\text{fwd}(${fx(w, 1)}) = ${c.fwd1}\,\text{in}\quad (W \le ${c.w1})`)
    : eq(String.raw`\text{fwd}(W) = f_1 + (W - W_1)\frac{f_2 - f_1}{W_2 - W_1} = ${c.fwd1} + (${fx(w, 1)} - ${c.w1})\frac{${c.fwd2} - ${c.fwd1}}{${c.w2} - ${c.w1}} = ${res(fx(f, 2), 'in')}`);
  h += fl('T/O', r.takeoff.w, r.takeoff.chk.fwd) + fl('LDG', r.landing.w, r.landing.chk.fwd);
  h += eq(String.raw`\text{fwd}(W) \le \text{CG} \le ${GCEZO.cg.aft}\,\text{in}, \quad W \le W_{\max}`, 'POH 2.11 / 2.13: within limits when both hold.');
  return h;
}

// p: {kind, elev, qnh, pa, oat, weight, wdir, wkt, rwy, wc, cw, chart, fac}
function mathsPerf(p) {
  let h = mh(p.kind === 'to' ? 'Take-off' : 'Landing');
  const k = GCEZO.pa.ftPerHpa, raw = (1013 - p.qnh) * k;
  h += eq(String.raw`\text{PA} = h + (1013 - \text{QNH})\times ${k} = ${fx(p.elev)} + (1013 - ${fx(p.qnh, 1)})\times ${k} = ${res(fx(p.pa), 'ft')}`,
    GCEZO.pa.noHighQnhCredit && raw < 0 ? 'QNH above 1013: correction set to 0 (no credit taken).' : '');
  const th = p.wdir - p.rwy;
  h += eq(String.raw`\theta = \text{wind} - \text{runway} = ${fx(p.wdir)} - ${fx(p.rwy)} = ${res(fx(th), '°')}`);
  h += eq(String.raw`V_{\text{head}} = V\cos\theta = ${fx(p.wkt, 1)}\cos ${nm(fx(th))}^\circ = ${res(fx(p.wc.head, 1), 'kt')}`);
  h += eq(String.raw`V_{\text{cross}} = V\,|\sin\theta| = ${fx(p.wkt, 1)}\,|\sin ${nm(fx(th))}^\circ| = ${res(fx(Math.abs(p.wc.cross), 1), 'kt')}`);
  h += p.wc.head >= 0
    ? eq(String.raw`V_{\text{chart}} = V_{\text{head}}\times ${GCEZO.wind.headPct / 100} = ${fx(p.wc.head, 1)}\times ${GCEZO.wind.headPct / 100} = ${res(fx(p.cw, 1), 'kt headwind')}`)
    : eq(String.raw`V_{\text{chart}} = V_{\text{tail}}\times ${GCEZO.wind.tailPct / 100} = ${fx(-p.wc.head, 1)}\times ${GCEZO.wind.tailPct / 100} = ${res(fx(-p.cw, 1), 'kt tailwind')}`);
  h += eq(String.raw`D = (1 - f)\,D_{\text{lower}} + f\,D_{\text{upper}}, \quad f = \frac{x - x_{\text{lower}}}{x_{\text{upper}} - x_{\text{lower}}}`,
    'Each chart step: straight-line interpolation between the two nearest printed guide lines.');
  const steps = (n, c) => eq(String.raw`D_{\text{${n}}}:\; ${fx(c.ref)}\,\text{ft} \to ${fx(c.afterWeight)}\,\text{ft} \to ${res(fx(c.dist), 'ft')}`,
    `${n === 'gr' ? 'Ground roll' : 'Over 50 ft'}: reference line at OAT ${fx(p.oat)}&deg;C and PA ${fx(p.pa)} ft &rarr; weight ${fx(p.weight)} lb &rarr; wind ${fx(p.cw, 1)} kt.`);
  let d50;
  if (p.kind === 'to') { h += steps('gr', p.chart.gr) + steps('50', p.chart.a50); d50 = p.chart.a50.dist; }
  else {
    const l = p.chart.lines; d50 = p.chart.over50;
    h += eq(String.raw`D_{0}\ (\text{no wind}) = ${fx(l.a50_0)}\,\text{ft}, \quad D_{\text{gr},0} = ${fx(l.gr0)}\,\text{ft}`, `Fig 5-35 (2325 lb only, no weight credit) at OAT ${fx(p.oat)}°C and PA ${fx(p.pa)} ft.`);
    h += p.cw >= 0
      ? eq(String.raw`D_{50} = D_0 + (D_{15\text{HW}} - D_0)\frac{V_{\text{chart}}}{15} = ${fx(l.a50_0)} + (${fx(l.a50HW15)} - ${fx(l.a50_0)})\frac{${fx(p.cw, 1)}}{15} = ${res(fx(d50), 'ft')}`)
      : eq(String.raw`D_{50} = D_0 + (D_{5\text{TW}} - D_0)\frac{V_{\text{chart}}}{5} = ${fx(l.a50_0)} + (${fx(l.a50TW5)} - ${fx(l.a50_0)})\frac{${fx(-p.cw, 1)}}{5} = ${res(fx(d50), 'ft')}`);
  }
  const fs = p.fac.used.map(u => fx(u[1], 2));
  h += eq(String.raw`F = \prod f_i = ${fs.length ? fs.join('\\times ') : '1'} = ${res(fx(p.fac.product, 3), '')}`,
    p.fac.used.length ? 'Ticked factors: ' + p.fac.used.map(u => `${u[0]} &times;${u[1]}`).join(', ') + '.' : 'No factors ticked.');
  const n = p.kind === 'to' ? 'TODR' : 'LDR';
  h += eq(String.raw`\text{${n}} = D_{50}\times F\times 0.3048 = ${fx(d50)}\times ${fx(p.fac.product, 3)}\times 0.3048 = ${res(fx(d50 * p.fac.product * 0.3048), 'm')}`);
  return h;
}

// f: {taxi, climb, gph, cruiseMin, cruise, contPct, cont, altMin, alt, resMin, res, req, fob, endur}
function mathsFuel(f) {
  const trip = f.climb + f.cruise;
  let h = mh('Fuel');
  h += eq(String.raw`F_{\text{taxi}} = \frac{${-GCEZO.taxiAllowance.weight}\,\text{lb}}{${GCEZO.fuel.lbPerUSG}\,\text{lb/USG}} = ${res(fx(f.taxi, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{cruise}} = \text{GPH}\times\frac{t}{60} = ${fx(f.gph, 1)}\times\frac{${fx(f.cruiseMin, 1)}}{60} = ${res(fx(f.cruise, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{trip}} = F_{\text{climb}} + F_{\text{cruise}} = ${fx(f.climb, 2)} + ${fx(f.cruise, 2)} = ${res(fx(trip, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{cont}} = F_{\text{trip}}\times\frac{${fx(f.contPct)}}{100} = ${fx(trip, 2)}\times ${fx(f.contPct / 100, 2)} = ${res(fx(f.cont, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{alt}} = \text{GPH}\times\frac{t_{\text{alt}}}{60} = ${fx(f.gph, 1)}\times\frac{${fx(f.altMin)}}{60} = ${res(fx(f.alt, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{res}} = \text{GPH}\times\frac{t_{\text{res}}}{60} = ${fx(f.gph, 1)}\times\frac{${fx(f.resMin)}}{60} = ${res(fx(f.res, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{req}} = F_{\text{taxi}} + F_{\text{trip}} + F_{\text{cont}} + F_{\text{alt}} + F_{\text{res}} = ${fx(f.taxi, 2)} + ${fx(trip, 2)} + ${fx(f.cont, 2)} + ${fx(f.alt, 2)} + ${fx(f.res, 2)} = ${res(fx(f.req, 2), 'USG')}`);
  h += eq(String.raw`F_{\text{req}}\ \text{(L)} = ${fx(f.req, 2)}\times 3.78541 = ${res(fx(f.req * GCEZO.conv.usgToL, 1), 'L')}, \quad F_{\text{req}}\ \text{(lb)} = ${fx(f.req, 2)}\times ${GCEZO.fuel.lbPerUSG} = ${res(fx(f.req * GCEZO.fuel.lbPerUSG, 1), 'lb')}`);
  h += eq(String.raw`t_{\text{end}} = \frac{F_{\text{board}} - F_{\text{taxi}}}{\text{GPH}}\times 60 = \frac{${fx(f.fob, 1)} - ${fx(f.taxi, 2)}}{${fx(f.gph, 1)}}\times 60 = ${res(fx(f.endur), 'min')}`);
  return h;
}

function mathsNav(nc, st) {
  let h = mh('Nav legs (wind triangle)');
  h += eq(String.raw`A = W_{\text{dir}} - \text{TC}, \quad \text{WCA} = \arcsin\left(\frac{W}{\text{TAS}}\sin A\right), \quad \text{TH} = \text{TC} + \text{WCA}`);
  h += eq(String.raw`\text{GS} = \text{TAS}\cos(\text{WCA}) - W\cos A, \quad \text{MH} = \text{TH} + \text{var}_{W} - \text{var}_{E}, \quad t = \frac{d}{\text{GS}}\times 60`);
  nc.rows.forEach(({ leg, r }, i) => {
    const name = esc(leg.name || 'Leg ' + (i + 1));
    if (r.err) { h += `<div class="eqnote"><b>${name}</b>: ${r.err}</div>`; return; }
    const tc = parseFloat(leg.tc), A = r.wd - tc, vs = st.vew === 'W' ? st.v : -st.v;
    h += `<div class="eqnote" style="margin-top:8px"><b>${name}</b></div>`;
    h += eq(String.raw`A = ${fx(r.wd)} - ${fx(tc)} = ${fx(A)}^\circ, \quad \text{WCA} = \arcsin\left(\frac{${fx(r.ws, 1)}}{${fx(st.tas)}}\sin ${nm(fx(A))}^\circ\right) = ${res(fx(r.wca, 1), '°')}`);
    h += eq(String.raw`\text{GS} = ${fx(st.tas)}\cos ${nm(fx(r.wca, 1))}^\circ - ${fx(r.ws, 1)}\cos ${nm(fx(A))}^\circ = ${res(fx(r.gs, 1), 'kt')}`);
    h += eq(String.raw`\text{TH} = ${fx(tc)} + ${nm(fx(r.wca, 1))} = ${fx(r.th, 1)}^\circ, \quad \text{MH} = ${fx(r.th, 1)} ${vs >= 0 ? '+' : '-'} ${fx(Math.abs(vs), 1)} = ${res(fx(r.mh, 1), '°')}, \quad t = \frac{${leg.d}}{${fx(r.gs, 1)}}\times 60 = ${res(fx(r.time, 1), 'min')}`);
  });
  return h;
}

// ---------------------------------------------------------------------
// Shared nav-leg state (used by nav-legs.html and preflight.html)
// ---------------------------------------------------------------------
const NAV_KEY = 'gcezo-nav';
function navDefault() {
  return { tas: GCEZO.plan.tas, wd: 240, ws: 20, v: 0, vew: 'W', fuel: '', fuelUnit: 'usg', perLeg: false,
    legs: [{ name: 'Leg 1', tc: 172, d: 30 }, { name: 'Leg 2', tc: 38, d: 27 }, { name: 'Leg 3', tc: 290, d: 30 }] };
}
function navLoad() {
  const st = navDefault();
  const n = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  try {
    const s = JSON.parse(localStorage.getItem(NAV_KEY) || 'null');
    if (s && Array.isArray(s.legs)) {
      st.tas = n(s.tas, st.tas); st.wd = n(s.wd, 0); st.ws = n(s.ws, 0); st.v = n(s.v, 0);
      st.vew = s.vew === 'E' ? 'E' : 'W'; st.fuel = s.fuel === '' ? '' : n(s.fuel, '');
      st.fuelUnit = s.fuelUnit === 'l' ? 'l' : 'usg'; st.perLeg = s.perLeg === true;
      st.legs = s.legs.slice(0, 40).map((l, i) => ({ name: String(l.name || ('Leg ' + (i + 1))).slice(0, 40), tc: n(l.tc, ''), d: n(l.d, ''), wd: n(l.wd, ''), ws: n(l.ws, ''),
        alt: n(l.alt, ''), msa: n(l.msa, ''), freq: String(l.freq || '').slice(0, 30) }));
    }
  } catch (e) {}
  return st;
}
function navSave(st) { try { localStorage.setItem(NAV_KEY, JSON.stringify(st)); } catch (e) {} }
// Wind for a leg: its own W/V when per-leg wind is on and both values are entered, else the main wind
function legWind(st, leg) {
  const wd = parseFloat(leg.wd), ws = parseFloat(leg.ws);
  if (st.perLeg && isFinite(wd) && isFinite(ws)) return { wd, ws, own: true };
  return { wd: st.wd, ws: st.ws, own: false };
}
// Compute every leg; returns {rows:[{leg,r}], totT, totD, allOk}
function navCompute(st) {
  let totT = 0, totD = 0, allOk = st.legs.length > 0;
  const rows = st.legs.map(leg => {
    const tc = parseFloat(leg.tc), d = parseFloat(leg.d);
    const w = legWind(st, leg);
    const r = navLeg(isFinite(tc) ? tc : NaN, isFinite(d) ? d : NaN, st.tas, w.wd, w.ws, st.v, st.vew);
    r.wd = w.wd; r.ws = w.ws; r.own = w.own;
    if (r.err) allOk = false; else { totT += r.time; totD += d; r.cum = totT; }
    return { leg, r };
  });
  return { rows, totT, totD, allOk, perLeg: st.perLeg };
}
// Flight log table (fuelRate per hour in any unit; 0 = hide fuel column)
function navLogHTML(nc, fuelRate, fuelUnitTxt) {
  const showFuel = fuelRate > 0;
  const pl = nc.perLeg;
  let h = `<table><thead><tr><th>Leg</th><th>TC</th>${pl ? '<th>W/V</th>' : ''}<th>WCA</th><th>TH</th><th>MH</th><th>Dist</th><th>GS</th><th>Time</th><th>Total</th>${showFuel ? `<th>Fuel ${fuelUnitTxt}</th>` : ''}<th>Alt ft</th><th>Safety alt</th><th>Freq</th></tr></thead><tbody>`;
  nc.rows.forEach(({ leg, r }, i) => {
    const nm = esc(leg.name || ('Leg ' + (i + 1)));
    const wv = pl ? `<td>${isFinite(r.wd) ? String(Math.round(r.wd)).padStart(3, '0') + '/' + Math.round(r.ws) : '-'}${r.own ? '' : '*'}</td>` : '';
    const plog = `<td>${leg.alt === '' || leg.alt == null ? '' : leg.alt}</td><td>${leg.msa === '' || leg.msa == null ? '' : leg.msa}</td><td>${esc(leg.freq || '')}</td>`;
    if (r.err) h += `<tr><td>${nm}</td><td colspan="${(showFuel ? 9 : 8) + (pl ? 1 : 0)}" style="text-align:left;color:var(--warn)">${r.err}</td>${plog}</tr>`;
    else h += `<tr><td>${nm}</td><td>${hdgTxt(parseFloat(leg.tc))}</td>${wv}<td>${wcaTxt(r.wca)}</td><td>${hdgTxt(r.th)}</td><td class="mh">${hdgTxt(r.mh)}</td><td>${leg.d} nm</td><td>${Math.round(r.gs)} kt</td><td>${mmss(r.time)}</td><td>${mmss(r.cum)}</td>${showFuel ? `<td>${(fuelRate * r.time / 60).toFixed(1)}</td>` : ''}${plog}</tr>`;
  });
  if (nc.rows.length) h += `</tbody><tfoot><tr class="tot"><td>${nc.allOk ? 'Total' : 'Total (valid legs)'}</td><td></td>${pl ? '<td></td>' : ''}<td></td><td></td><td></td><td>${Math.round(nc.totD * 10) / 10} nm</td><td></td><td>${mmss(nc.totT)}</td><td></td>${showFuel ? `<td>${(fuelRate * nc.totT / 60).toFixed(1)}</td>` : ''}<td></td><td></td><td></td></tr></tfoot>`;
  h += '</table>';
  if (pl && nc.rows.some(x => !x.r.own)) h += '<p class="note">* main wind used (no per-leg W/V entered).</p>';
  return h;
}
// PLOG sense checks: planned altitude below safety altitude, missing safety altitude
function navPlogChecks(nc) {
  const out = [], noMsa = [], noAlt = [];
  nc.rows.forEach(({ leg }, i) => {
    const nm = esc(leg.name || ('Leg ' + (i + 1)));
    const a = parseFloat(leg.alt), m = parseFloat(leg.msa);
    if (!isFinite(m)) noMsa.push(nm);
    else if (isFinite(a) && a < m) out.push([false, `${nm}: planned altitude ${a} ft is below safety altitude ${m} ft`]);
    if (!isFinite(a)) noAlt.push(nm);
  });
  if (noMsa.length) out.push([null, `PLOG: no safety altitude for ${noMsa.join(', ')}`]);
  if (noAlt.length) out.push([null, `PLOG: no planned altitude for ${noAlt.join(', ')}`]);
  return out;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// Set a field's default from settings (before saved values are restored)
function setDefault(id, v) { const el = $(id); if (el) el.value = v; }

// Remember inputs between visits (per browser). Silently ignored if storage is unavailable.
function persist(key, ids) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    ids.forEach(id => {
      const el = $(id); if (!el || !(id in saved)) return;
      if (el.type === 'checkbox') el.checked = saved[id]; else el.value = saved[id];
    });
  } catch (e) {}
  return () => {
    try {
      const o = {}; ids.forEach(id => { const el = $(id); if (el) o[id] = el.type === 'checkbox' ? el.checked : el.value; });
      localStorage.setItem(key, JSON.stringify(o));
    } catch (e) {}
  };
}

// C.G. envelope plot (POH Fig 6-15 / 2.13) with loading points
function envelopeSVG(points, category) {
  const W = 440, H = 300, m = { l: 44, r: 12, t: 12, b: 32 };
  const cx = cg => m.l + (cg - 82) / (94 - 82) * (W - m.l - m.r);
  const cy = w => H - m.b - (w - 1200) / (2400 - 1200) * (H - m.t - m.b);
  const c = GCEZO.cg[category === 'utility' ? 'utility' : 'normal'], a = GCEZO.cg.aft;
  const env = [[c.fwd1, 1200], [c.fwd1, c.w1], [c.fwd2, c.w2], [a, c.w2], [a, 1200]];
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="C.G. envelope">`;
  for (let c = 82; c <= 94; c++) s += `<line x1="${cx(c)}" y1="${cy(1200)}" x2="${cx(c)}" y2="${cy(2400)}" stroke="var(--line)"/>` + (c % 2 ? '' : `<text x="${cx(c)}" y="${H - 14}" text-anchor="middle">${c}</text>`);
  for (let w = 1200; w <= 2400; w += 100) s += `<line x1="${cx(82)}" y1="${cy(w)}" x2="${cx(94)}" y2="${cy(w)}" stroke="var(--line)"/>` + (w % 200 ? '' : `<text x="${m.l - 6}" y="${cy(w) + 4}" text-anchor="end">${w}</text>`);
  s += `<polygon points="${env.map(p => cx(p[0]) + ',' + cy(p[1])).join(' ')}" fill="none" stroke="var(--acc)" stroke-width="2"/>`;
  s += `<text x="${W / 2}" y="${H - 1}" text-anchor="middle">C.G. (inches aft of datum)</text>`;
  if (points.length > 1) s += `<polyline points="${points.map(p => cx(p.cg) + ',' + cy(p.w)).join(' ')}" fill="none" stroke="var(--mute)" stroke-dasharray="4 3"/>`;
  points.forEach((p, i) => {
    s += `<circle cx="${cx(p.cg)}" cy="${cy(p.w)}" r="5" fill="${p.ok ? 'var(--ok)' : 'var(--bad)'}"/>` +
         `<text x="${cx(p.cg) + 8}" y="${cy(p.w) + (i ? 14 : -4)}" style="fill:var(--ink)">${p.label}</text>`;
  });
  return s + '</svg>';
}

function wbTableHTML(r) {
  const row = (t, w, a, mm, cls = '') => `<tr class="${cls}"><td>${t}</td><td>${fx(w, 1)}</td><td>${fx(a, 2)}</td><td>${fx(mm, 1)}</td></tr>`;
  let h = '<table><tr><th>Item</th><th>Weight lb</th><th>Arm in</th><th>Moment lb.in</th></tr>';
  r.rows.forEach(x => h += row(x.item, x.w, x.arm, x.m));
  h += row('Ramp weight', r.ramp.w, r.ramp.cg, r.ramp.m, 'tot');
  h += row(r.taxi.item, r.taxi.w, r.taxi.arm, r.taxi.m);
  h += row('Take-off weight', r.takeoff.w, r.takeoff.cg, r.takeoff.m, 'tot');
  h += row(r.trip.item, r.trip.w, r.trip.arm, r.trip.m);
  h += row('Landing weight', r.landing.w, r.landing.cg, r.landing.m, 'tot');
  return h + '</table>';
}

function wbMessages(r, cat) {
  const L = GCEZO.limits[cat]; const out = [];
  const chk = (n, x, max) => {
    if (x.chk.overweight) out.push(`${n} weight ${fx(x.w, 1)} lb exceeds ${max} lb`);
    if (x.chk.tooFwd) out.push(`${n} C.G. ${fx(x.cg, 2)} forward of limit ${fx(x.chk.fwd, 2)}`);
    if (x.chk.tooAft) out.push(`${n} C.G. ${fx(x.cg, 2)} aft of limit ${fx(x.chk.aft, 2)}`);
  };
  chk('Ramp', r.ramp, L.ramp); chk('Take-off', r.takeoff, L.takeoff); chk('Landing', r.landing, L.landing);
  if (r.baggageOver) out.push(`Baggage exceeds ${L.baggage} lb (POH 2.11)`);
  if (r.rearNotAllowed) out.push('Utility category: no aft passengers allowed (POH 2.23)');
  if (r.fuelOver) out.push(`Fuel exceeds ${GCEZO.fuel.usableUSG} USG usable`);
  return out;
}
