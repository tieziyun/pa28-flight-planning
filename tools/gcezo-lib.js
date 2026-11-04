// G-CEZO PA-28-161 Cadet - shared data and calculation functions.
// Sources (every default below is copied from one of these; see CLAUDE.md):
//   POH  = G-CEZO Pilot's Operating Handbook, Report VB-1360
//   WS   = G-CEZO Weight and Centre of Gravity Schedule, LW 4072 (Loadmasters, 29-Jan-08)
//   XLS  = "PA28 Mass & Balance Calculator.xlsx" / "Mass Balance and Performance Quick Ref Calculation Sheet Template.xlsx"
// Where sources differ, the default is the most conservative value.
// Aircraft data can be overridden on settings.html; flight assumptions on the pages that use them (this browser only).

const GCEZO_DEFAULTS = {
  reg: 'G-CEZO',
  type: 'Piper PA-28-161 Cadet',

  // WS Part A: Basic weight
  basic: { weight: 1533, arm: 85.05, moment: 130383 },

  // POH Fig 6-11 loading form: arms (inches aft of datum)
  arms: { front: 80.5, rear: 118.1, fuel: 95.0, baggage: 142.8 },

  // POH 2.11 Weight limits. Baggage: POH 50 lb (XLS says 200 lb - POH is the lower, used here)
  limits: {
    normal:  { ramp: 2332, takeoff: 2325, landing: 2325, baggage: 50 },
    utility: { ramp: 2027, takeoff: 2020, landing: 2020, baggage: 0 }, // POH 2.23: utility - no aft passengers
  },

  // POH 2.13 C.G. limits (straight line variation between points given)
  cg: {
    normal:  { w1: 1950, fwd1: 83.0, w2: 2325, fwd2: 87.0 },
    utility: { w1: 1950, fwd1: 83.0, w2: 2020, fwd2: 83.8 },
    aft: 93.0,
  },

  // POH Fig 6-11: fuel allowance for engine start, taxi & run up
  taxiAllowance: { weight: -7, arm: 95.0 },

  // POH 2.21 Fuel limitations; 6 lb/gal: POH Fig 6-13 loading graph
  fuel: { totalUSG: 50, unusableUSG: 2, usableUSG: 48, lbPerUSG: 6, tabsUSG: 34 }, // tabs 204 lb: XLS (not in POH)

  // POH 5 Fuel consumption (Fig 5-21 best power / Fig 5-23 best economy)
  fuelFlowGPH: {
    bestPower:   { 75: 10.0, 65: 8.8, 55: 7.8 },
    bestEconomy: { 75: 8.5,  65: 7.5, 55: 6.6 },
  },

  // POH 3.2 / 4.3 airspeeds
  speeds: { maxXwind: 17 },


  // Distance factors - XLS Quick Ref sheet "Further Factors (not included in charts)"; cumulative.
  // on: ticked by default.
  factors: [
    { id: 'uphill',   label: '2% uphill slope',         to: 1.1,  ld: null, on: false },
    { id: 'downhill', label: '2% downhill slope',       to: null, ld: 1.1,  on: false },
    { id: 'wetgrass', label: 'Wet grass',               to: 1.3,  ld: 1.35, on: false },
    { id: 'wetpaved', label: 'Wet paved surface',       to: null, ld: 1.15, on: false },
    { id: 'soft',     label: 'Soft ground or snow',     to: 1.25, ld: 1.25, on: false },
    { id: 'acft',     label: 'Factor for relevant a/c', to: 1.1,  ld: null, on: true },
  ],
  // Safety factor: XLS Template 1.33 / G-CMKX sheet 1.25 -> 1.33 (conservative). Landing 1.43 in both.
  safety: { to: 1.33, ld: 1.43 },

  // Wind credit applied to chart wind (conservative defaults: 50% of headwind, 150% of tailwind)
  wind: { headPct: 50, tailPct: 150 },

  // Pressure altitude = elevation + (1013 - QNH) x ftPerHpa
  pa: { ftPerHpa: 30, noHighQnhCredit: true },

  // Planning defaults (pilot / operator policy, not POH)
  plan: { reservePct: 0, reserveMin: 45, contingencyPct: 10, mixture: 'bestPower', power: 75, tas: 90, flightType: 'day', sunsetMarginMin: 0 },
};

// Settings page registry: AIRCRAFT data only (things that change only when the aircraft changes).
// [path, label, source]
const GCEZO_PARAMS = [
  ['basic.weight', 'Basic weight (lb)', 'WS'], ['basic.moment', 'Basic moment (lb.in)', 'WS'], ['basic.arm', 'Basic C.G. (in) - info only, moment is used', 'WS'],
  ['arms.front', 'Arm: pilot & front passenger', 'POH Fig 6-11'], ['arms.rear', 'Arm: rear seats', 'POH Fig 6-11'],
  ['arms.fuel', 'Arm: fuel', 'POH Fig 6-11'], ['arms.baggage', 'Arm: baggage', 'POH Fig 6-11'],
  ['limits.normal.ramp', 'Normal: max ramp weight', 'POH 2.11'], ['limits.normal.takeoff', 'Normal: max take-off weight', 'POH 2.11'],
  ['limits.normal.landing', 'Normal: max landing weight', 'POH 2.11'], ['limits.normal.baggage', 'Normal: max baggage (XLS: 200)', 'POH 2.11'],
  ['limits.utility.ramp', 'Utility: max ramp weight', 'POH 2.11'], ['limits.utility.takeoff', 'Utility: max take-off weight', 'POH 2.11'],
  ['limits.utility.landing', 'Utility: max landing weight', 'POH 2.11'], ['limits.utility.baggage', 'Utility: max baggage', 'POH 2.11'],
  ['cg.normal.w1', 'Normal: weight for fwd limit 1', 'POH 2.13'], ['cg.normal.fwd1', 'Normal: fwd limit 1 (in)', 'POH 2.13'],
  ['cg.normal.w2', 'Normal: weight for fwd limit 2', 'POH 2.13'], ['cg.normal.fwd2', 'Normal: fwd limit 2 (in)', 'POH 2.13'],
  ['cg.utility.w1', 'Utility: weight for fwd limit 1', 'POH 2.13'], ['cg.utility.fwd1', 'Utility: fwd limit 1 (in)', 'POH 2.13'],
  ['cg.utility.w2', 'Utility: weight for fwd limit 2', 'POH 2.13'], ['cg.utility.fwd2', 'Utility: fwd limit 2 (in)', 'POH 2.13'],
  ['cg.aft', 'Aft limit (in)', 'POH 2.13'],
  ['taxiAllowance.weight', 'Start/taxi/run-up fuel allowance (lb, negative)', 'POH Fig 6-11'], ['taxiAllowance.arm', 'Allowance arm', 'POH Fig 6-11'],
  ['fuel.usableUSG', 'Usable fuel (USG)', 'POH 2.21'], ['fuel.lbPerUSG', 'Fuel density (lb/USG)', 'POH Fig 6-13'], ['fuel.tabsUSG', 'Fuel to tabs (USG)', 'XLS'],
  ['fuelFlowGPH.bestPower.75', 'Best power 75% (GPH)', 'POH Fig 5-21'], ['fuelFlowGPH.bestPower.65', 'Best power 65% (GPH)', 'POH Fig 5-21'], ['fuelFlowGPH.bestPower.55', 'Best power 55% (GPH)', 'POH Fig 5-21'],
  ['fuelFlowGPH.bestEconomy.75', 'Best economy 75% (GPH)', 'POH Fig 5-23'], ['fuelFlowGPH.bestEconomy.65', 'Best economy 65% (GPH)', 'POH Fig 5-23'], ['fuelFlowGPH.bestEconomy.55', 'Best economy 55% (GPH)', 'POH Fig 5-23'],
  ['speeds.maxXwind', 'Max demonstrated crosswind (kt)', 'POH 4.3'],
  ['factors.5.to', 'Aircraft-specific T/O factor ("factor for relevant a/c", G-CMKX sheet)', 'XLS'], ['factors.5.on', 'Apply aircraft factor by default (true/false)', 'conservative'],
];
// Flight assumptions: editable on the pages where they are used (not on Settings), shared between pages.
const GCEZO_ASSUME = ['wind.headPct', 'wind.tailPct', 'pa.ftPerHpa', 'pa.noHighQnhCredit'];

function _get(o, p) { return p.split('.').reduce((a, k) => a == null ? a : a[k], o); }
function _set(o, p, v) { const k = p.split('.'); const last = k.pop(); k.reduce((a, x) => a[x], o)[last] = v; }
function gcezoLoadOverrides() {
  try { return JSON.parse(localStorage.getItem('gcezo-settings') || '{}'); } catch (e) { return {}; }
}
// Unit conversions (XLS). Fixed - not editable. Verified against exact definitions:
//   1 lb = 0.45359237 kg exactly -> 2.2046226218 lb/kg ; 1 USG = 231 in^3 = 3.785411784 L exactly.
//   lbToKg is 1/kgToLb so conversions round-trip exactly.
const GCEZO_CONV = Object.freeze({ kgToLb: 2.20462262, lbToKg: 1 / 2.20462262, usgToL: 3.78541, lToUSG: 0.264172 });

const GCEZO = JSON.parse(JSON.stringify(GCEZO_DEFAULTS));
(() => {
  const ov = gcezoLoadOverrides();
  const allowed = new Set(GCEZO_PARAMS.map(x => x[0]));
  for (const [p, v] of Object.entries(ov)) if (allowed.has(p) && _get(GCEZO, p) !== undefined) _set(GCEZO, p, v);
  let as = {}; try { as = JSON.parse(localStorage.getItem('gcezo-assume') || '{}'); } catch (e) {}
  for (const p of GCEZO_ASSUME) if (p in as && typeof as[p] === typeof _get(GCEZO, p)) _set(GCEZO, p, as[p]);
})();
GCEZO.conv = GCEZO_CONV;
const GCEZO_FACTORS = GCEZO.factors;
const GCEZO_SAFETY = GCEZO.safety;

// ---------------------------------------------------------------------
// Weight & balance  (POH 6.7: moment = weight x arm; C.G. = total moment / total weight)
// ---------------------------------------------------------------------
function cgFwdLimit(weight, category) {
  const c = GCEZO.cg[category === 'utility' ? 'utility' : 'normal'];
  if (weight <= c.w1) return c.fwd1;
  return c.fwd1 + (weight - c.w1) * (c.fwd2 - c.fwd1) / (c.w2 - c.w1);
}
function cgAftLimit() { return GCEZO.cg.aft; }

function cgCheck(weight, cg, category, maxWeight) {
  const fwd = cgFwdLimit(weight, category), aft = cgAftLimit();
  return {
    fwd, aft,
    overweight: weight > maxWeight + 1e-9,
    tooFwd: cg < fwd - 1e-9,
    tooAft: cg > aft + 1e-9,
    ok: weight <= maxWeight + 1e-9 && cg >= fwd - 1e-9 && cg <= aft + 1e-9,
  };
}

function wbCalc(inp) {
  // inp: {front, rear, baggage, fuelUSG, tripFuelUSG, category}
  const A = GCEZO.arms, B = GCEZO.basic, F = GCEZO.fuel.lbPerUSG;
  const cat = inp.category || 'normal', L = GCEZO.limits[cat];
  const rows = [
    { item: 'Basic Empty Weight', w: B.weight, arm: B.moment / B.weight, m: B.moment },
    { item: 'Pilot and Front Passenger', w: inp.front, arm: A.front },
    { item: 'Passengers (Rear Seat)', w: inp.rear, arm: A.rear },
    { item: 'Fuel', w: inp.fuelUSG * F, arm: A.fuel },
    { item: 'Baggage', w: inp.baggage, arm: A.baggage },
  ];
  rows.forEach(r => { if (r.m === undefined) r.m = r.w * r.arm; });
  const sum = rs => rs.reduce((a, r) => ({ w: a.w + r.w, m: a.m + r.m }), { w: 0, m: 0 });
  const ramp = sum(rows);
  const taxi = { item: 'Fuel Allowance (start, taxi & run up)', w: GCEZO.taxiAllowance.weight, arm: GCEZO.taxiAllowance.arm };
  taxi.m = taxi.w * taxi.arm;
  const to = { w: ramp.w + taxi.w, m: ramp.m + taxi.m };
  const trip = { item: 'Trip Fuel', w: -inp.tripFuelUSG * F, arm: A.fuel };
  trip.m = trip.w * trip.arm;
  const ldg = { w: to.w + trip.w, m: to.m + trip.m };
  return {
    rows, taxi, trip,
    ramp: { ...ramp, cg: ramp.m / ramp.w, chk: cgCheck(ramp.w, ramp.m / ramp.w, cat, L.ramp) },
    takeoff: { ...to, cg: to.m / to.w, chk: cgCheck(to.w, to.m / to.w, cat, L.takeoff) },
    landing: { ...ldg, cg: ldg.m / ldg.w, chk: cgCheck(ldg.w, ldg.m / ldg.w, cat, L.landing) },
    baggageOver: inp.baggage > L.baggage,
    rearNotAllowed: cat === 'utility' && inp.rear > 0,
    fuelOver: inp.fuelUSG > GCEZO.fuel.usableUSG,
  };
}

// ---------------------------------------------------------------------
// Chart evaluation: follows the chart exactly as done by hand
//   OAT + pressure altitude -> reference line value
//   -> weight guide lines (from ref line 2325 lb)
//   -> wind guide lines (from ref line no wind)
// Interpolation between guide lines is linear.
// ---------------------------------------------------------------------
function _interp(x, xs, ys) {
  if (x <= xs[0]) return ys[0] + (ys[1] - ys[0]) * (x - xs[0]) / (xs[1] - xs[0]);
  const n = xs.length;
  if (x >= xs[n - 1]) return ys[n - 2] + (ys[n - 1] - ys[n - 2]) * (x - xs[n - 2]) / (xs[n - 1] - xs[n - 2]);
  let i = 0; while (xs[i + 1] < x) i++;
  return ys[i] + (ys[i + 1] - ys[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]);
}
function _family(fam, x, ref) {
  const c = fam.c; let i;
  if (ref <= c[0][0]) i = 0;
  else if (ref >= c[c.length - 1][0]) i = c.length - 2;
  else { i = 0; while (c[i + 1][0] < ref) i++; }
  const a = c[i], b = c[i + 1], f = (ref - a[0]) / (b[0] - a[0]);
  return (1 - f) * _interp(x, fam.x, a[1]) + f * _interp(x, fam.x, b[1]);
}
function _paLine(ch, pa, T) {
  const p = ch.pa; let i = Math.min(Math.max(Math.floor(pa / 1000), 0), p.length - 2);
  const a = p[i], b = p[i + 1], f = (pa - a[0]) / (b[0] - a[0]);
  return (1 - f) * _interp(T, ch.T, a[1]) + f * _interp(T, ch.T, b[1]);
}

// Wind actually entered into the charts after applying the wind credit settings.
// component: +ve headwind, -ve tailwind (kt)
function chartWind(component) {
  return component >= 0 ? component * GCEZO.wind.headPct / 100 : component * GCEZO.wind.tailPct / 100;
}

// wind: +ve = headwind kt, -ve = tailwind kt (already factored by chartWind)
function takeoffChart(key, pa, oat, weight, wind) {
  const ch = GCEZO_CHARTS[key];
  const d1 = _paLine(ch, pa, oat);
  const d2 = _family(ch.weight, weight, d1);
  const d3 = wind >= 0 ? _family(ch.headwind, wind, d2) : _family(ch.tailwind, -wind, d2);
  const warn = [];
  if (pa < 0 || pa > 7000) warn.push('Pressure altitude outside chart (0-7000 ft)');
  if (oat < -40 || oat > 40) warn.push('OAT outside chart (-40 to 40 C)');
  if (weight < 1600 || weight > 2325) warn.push('Weight outside chart (1600-2325 lb)');
  if (wind > 15) warn.push('Headwind beyond chart (15 kt)');
  if (wind < -5) warn.push('Tailwind beyond chart (5 kt)');
  return { ref: d1, afterWeight: d2, dist: d3, warn };
}

// Fig 5-35 landing: gross weight 2325 lb only (no weight correction on chart).
// Wind lines given for 15 kt headwind, no wind, 5 kt tailwind; linear interpolation between them.
function landingChart(pa, oat, wind) {
  const L = GCEZO_CHARTS.land;
  const xT = _interp(oat, L.xT.T, L.xT.x);
  const i = Math.min(Math.max(Math.floor(pa / 1000), 0), L.b.length - 2), f = pa / 1000 - i;
  const y = L.slope * xT + (L.b[i] * (1 - f) + L.b[i + 1] * f);
  const ft = x => L.ft.ft0 + (x - L.ft.x0) / L.ft.pxft;
  const d = L.lines.map(l => ft(l.p[0] * y + l.p[1]));
  const w = (h, z, t) => wind >= 0 ? z + (h - z) * wind / 15 : z + (t - z) * (-wind) / 5;
  const warn = [];
  if (pa < 0 || pa > 8000) warn.push('Pressure altitude outside chart (0-8000 ft)');
  if (oat < -40 || oat > 40) warn.push('OAT outside chart (-40 to 40 C)');
  if (wind > 15) warn.push('Headwind beyond chart (15 kt)');
  if (wind < -5) warn.push('Tailwind beyond chart (5 kt)');
  return { groundRoll: w(d[0], d[1], d[2]), over50: w(d[3], d[4], d[5]), warn,
    lines: { grHW15: d[0], gr0: d[1], grTW5: d[2], a50HW15: d[3], a50_0: d[4], a50TW5: d[5] } };
}

// ---------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------
// Pressure altitude = elevation + (1013 - QNH) x ft/hPa; optionally no credit when QNH > 1013
function pressureAlt(elevFt, qnh) {
  let d = (1013 - qnh) * GCEZO.pa.ftPerHpa;
  if (GCEZO.pa.noHighQnhCredit && d < 0) d = 0;
  return elevFt + d;
}

// Runway wind components. windDir/rwyHdg in degrees (wind FROM). +HW, +XW right
function windComponents(windDir, windKt, rwyHdg) {
  const a = (windDir - rwyHdg) * Math.PI / 180;
  return { head: windKt * Math.cos(a), cross: windKt * Math.sin(a) };
}

// Nav leg wind triangle (from nav-leg-calculator.html, unchanged maths):
// A = wind direction - track. WCA = arcsin[(wind / TAS) x sin A]. True heading = track + WCA.
// Groundspeed = TAS x cos WCA - wind x cos A. Time = distance / groundspeed x 60.
// Magnetic = True + West variation, - East variation.
function navLeg(tc, d, tas, wd, ws, v, vew) {
  const rad = Math.PI / 180;
  if (!(tas > 0)) return { err: 'Enter a TAS above zero.' };
  if (!isFinite(tc) || tc < 0 || tc > 360) return { err: 'Track must be 0–360°.' };
  if (!(d > 0)) return { err: 'Enter a distance above zero.' };
  if (!isFinite(wd) || wd < 0 || wd > 360 || !(ws >= 0)) return { err: 'Check the wind direction (0–360°) and speed.' };
  const A = (wd - tc) * rad;
  const x = (ws / tas) * Math.sin(A);
  if (Math.abs(x) >= 1) return { err: "Crosswind is stronger than TAS: this track can't be held." };
  const wca = Math.asin(x);
  const gs = tas * Math.cos(wca) - ws * Math.cos(A);
  if (!(gs > 1)) return { err: 'Groundspeed is zero or negative: headwind too strong.' };
  const th = tc + wca / rad;
  const varSigned = vew === 'W' ? v : -v;
  const mh = th + varSigned;
  return { wca: wca / rad, th, mh, gs, time: d / gs * 60 };
}
function hdgNorm(h) { h = ((h % 360) + 360) % 360; const r = Math.round(h) % 360; return r === 0 ? 360 : r; }
function hdgTxt(h) { return String(hdgNorm(h)).padStart(3, '0') + '°'; }
function mmss(min) { let s = Math.round(min * 60); const m = Math.floor(s / 60); s = s % 60; return m + ':' + String(s).padStart(2, '0'); }
function wcaTxt(wca) { const w = Math.round(wca); return w === 0 ? '0°' : Math.abs(w) + '° ' + (w > 0 ? 'R' : 'L'); }

// Wind triangle. Returns heading, ground speed, wind correction angle.
function windTriangle(tc, tas, windDir, windKt) {
  const r = Math.PI / 180, wa = (windDir - tc) * r;
  const s = windKt * Math.sin(wa) / tas;
  if (Math.abs(s) > 1) return null;
  const wca = Math.asin(s);
  const gs = tas * Math.cos(wca) - windKt * Math.cos(wa);
  let hdg = (tc + wca / r) % 360; if (hdg < 0) hdg += 360;
  return { wca: wca / r, gs, hdg };
}

if (typeof module !== 'undefined') module.exports = { GCEZO, GCEZO_DEFAULTS, GCEZO_PARAMS, wbCalc, cgFwdLimit, takeoffChart, landingChart, chartWind, GCEZO_FACTORS, GCEZO_SAFETY, pressureAlt, windComponents, windTriangle, navLeg, hdgTxt, mmss, wcaTxt };
