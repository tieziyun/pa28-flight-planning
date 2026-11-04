// Abbreviations: every page wraps known abbreviations in <abbr title="..."> (hover / long-press to read)
// and lists the ones used on that page in an "Abbreviations" card at the bottom.
const GLOSSARY = {
  'POH': "Pilot's Operating Handbook (Piper Report VB-1360 for G-CEZO)",
  'AFM': 'Aircraft Flight Manual',
  'WS': 'Weight and Centre of Gravity Schedule (G-CEZO, LW 4072)',
  'XLS': "club spreadsheets (PA28 Mass & Balance Calculator / Quick Ref Calculation Sheet)",
  'W&B': 'weight and balance',
  'C.G.': 'centre of gravity', 'CG': 'centre of gravity',
  'MAUW': 'maximum all-up weight',
  'TODR': 'take-off distance required: distance to 50 ft, multiplied by the factors',
  'LDR': 'landing distance required: distance from 50 ft, multiplied by the factors',
  'TORA': 'take-off run available (published runway length for take-off)',
  'LDA': 'landing distance available (published runway length for landing)',
  'PA': 'pressure altitude: altitude with the altimeter set to 1013 hPa',
  'QNH': 'altimeter setting that makes the altimeter read altitude above mean sea level',
  'QFE': 'altimeter setting that makes the altimeter read height above the aerodrome',
  'RPS': 'regional pressure setting (lowest forecast QNH in an altimeter setting region)',
  'hPa': 'hectopascal (pressure unit; 1013 hPa = standard pressure)',
  'OAT': 'outside air temperature',
  'ISA': 'International Standard Atmosphere (15 °C and 1013 hPa at sea level)',
  'TAS': 'true airspeed',
  'KIAS': 'knots indicated airspeed',
  'GS': 'ground speed',
  'TC': 'true course (track over the ground, measured from true north)',
  'TH': 'true heading',
  'MH': 'magnetic heading',
  'WCA': 'wind correction angle',
  'W/V': 'wind velocity (direction / speed)',
  'HW': 'headwind', 'TW': 'tailwind',
  'kt': 'knots (nautical miles per hour)',
  'nm': 'nautical miles',
  'USG': 'US gallons (1 USG = 3.78541 litres)',
  'GPH': 'US gallons per hour',
  'RPM': 'revolutions per minute (engine speed)',
  'UTC': 'Coordinated Universal Time',
  'ETD': 'estimated time of departure', 'ETA': 'estimated time of arrival',
  'DEP': 'departure aerodrome', 'DEST': 'destination aerodrome',
  'PLOG': "pilot's navigation log",
  'MEF': 'maximum elevation figure (highest terrain/obstacle in a chart area, no safety margin)',
  'VRP': 'visual reference point',
  'VFR': 'visual flight rules', 'IFR': 'instrument flight rules',
  'VMC': 'visual meteorological conditions', 'IMC': 'instrument meteorological conditions',
  'METAR': 'routine aerodrome weather report', 'METARs': 'routine aerodrome weather reports',
  'TAF': 'terminal aerodrome forecast', 'TAFs': 'terminal aerodrome forecasts',
  'NOTAM': 'notice to aviation (temporary aeronautical information)', 'NOTAMs': 'notices to aviation',
  'AIP': 'Aeronautical Information Publication (UK: NATS AIS)',
  'AIS': 'Aeronautical Information Service',
  'AD': 'aerodrome (AIP Part 3 section)',
  'NATS': 'the UK air navigation service provider',
  'CAA': 'UK Civil Aviation Authority',
  'SERA': 'Standardised European Rules of the Air (as retained in UK law)',
  'Part-NCO': 'UK air operations rules for non-commercial flights in non-complex aircraft',
  'SS05': 'CAA Safety Sense Leaflet 05 "Flight under VFR" (Oct 2022)',
  'SWC': 'CAA Skyway Code (CAP 1535)',
  'INF': 'CAA airspace-infringement guidance (infringements.caa.co.uk)',
  'CAS': 'controlled airspace',
  'RA(T)': 'temporary restricted area',
  'TDA': 'temporary danger area',
  'RMZ': 'radio mandatory zone', 'TMZ': 'transponder mandatory zone',
  'RMZ/TMZ': 'radio / transponder mandatory zone',
  'MATZ': 'military aerodrome traffic zone',
  'LARS': 'Lower Airspace Radar Service',
  'ATSOCAS': 'air traffic services outside controlled airspace',
  'ATC': 'air traffic control',
  'PPR': 'prior permission required (to land at an aerodrome)',
  'IMSAFE': 'fitness check: Illness, Medication, Stress, Alcohol, Fatigue, Eating',
  'PAVE': 'risk check: Pilot, Aircraft, enVironment, External pressures',
  'TEM': 'threat and error management',
  'FREDA': 'in-flight check: Fuel, Radio, Engine, Direction indicator, Altimeter',
  'EC': 'electronic conspicuity',
  'AMSL': 'above mean sea level',
  'FL100': 'flight level 100: 10,000 ft with the altimeter set to 1013 hPa',
  'CAP': 'Civil Aviation Publication (a numbered UK CAA document)',
  'CRP-5': 'circular slide-rule flight computer used for navigation calculations',
  'EU': 'European Union', 'UK': 'United Kingdom',
  'GA': 'general aviation',
  'IAS': 'indicated airspeed',
  'kts': 'knots (nautical miles per hour)',
  'G-CEZO': 'registration of this aircraft: Piper PA-28-161 Cadet, serial 2841226',
  'G-CMKX': 'another club aircraft; its sheet in the club spreadsheet supplied the 1.1 aircraft factor',
  'PA-28-161': 'Piper PA-28-161 (Cadet / Warrior), the aircraft type',
  'PA28': 'Piper PA-28 Cherokee family of aircraft',
  'VB-1360': 'Piper report number of the G-CEZO POH',
  'LW 4072': 'reference of the G-CEZO Weight and Centre of Gravity Schedule (Loadmasters)',
  '08JA4072': 'weighing report reference for G-CEZO (29 January 2008)',
  'T/O': 'take-off', 'LDG': 'landing',
};

(function () {
  const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const RE = new RegExp('(?<![A-Za-z0-9&-])(' + keys.map(escRe).join('|') + ')(?![A-Za-z0-9&-])', 'g');
  const SKIP = new Set(['SCRIPT', 'STYLE', 'ABBR', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'MATH', 'SVG', 'TITLE', 'CODE']);
  function skip(n) {
    for (let p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP.has(p.nodeName.toUpperCase()) || p.namespaceURI === 'http://www.w3.org/1998/Math/MathML' || p.namespaceURI === 'http://www.w3.org/2000/svg') return true;
      if (p.classList && p.classList.contains('noabbr')) return true;
    }
    return false;
  }
  // Grid labels (label.f): keep the label text in one grid cell before abbreviations are wrapped.
  function groupLabels(root) {
    root.querySelectorAll('label.f:not([data-grouped])').forEach(l => {
      const span = document.createElement('span'); span.className = 'lt';
      while (l.firstChild && !(l.firstChild.nodeType === 1 && /^(SMALL|INPUT|SELECT|SPAN)$/.test(l.firstChild.nodeName))) span.appendChild(l.firstChild);
      if (span.childNodes.length) l.insertBefore(span, l.firstChild);
      l.dataset.grouped = '1';
    });
    // Flex rows (label.row): group runs of loose text into one span so wrapped words stay inline.
    root.querySelectorAll('label.row:not([data-grouped])').forEach(l => {
      let run = null;
      [...l.childNodes].forEach(c => {
        const inline = c.nodeType === 3 || (c.nodeType === 1 && /^(ABBR|B|I|SMALL|EM|STRONG)$/.test(c.nodeName));
        if (inline) { if (!run) { run = document.createElement('span'); l.insertBefore(run, c); } run.appendChild(c); }
        else run = null;
      });
      l.dataset.grouped = '1';
    });
  }
  function abbrify(root) {
    root = root || document.body;
    groupLabels(root);
    const found = new Set();
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; let n;
    while ((n = tw.nextNode())) if (!skip(n)) nodes.push(n);
    root.querySelectorAll('abbr[data-g]').forEach(a => found.add(a.dataset.g));
    nodes.forEach(t => {
      const s = t.nodeValue; RE.lastIndex = 0;
      if (!RE.test(s)) return;
      RE.lastIndex = 0;
      const frag = document.createDocumentFragment(); let last = 0, m;
      while ((m = RE.exec(s))) {
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        const a = document.createElement('abbr'); a.title = GLOSSARY[m[1]]; a.dataset.g = m[1]; a.textContent = m[1];
        frag.appendChild(a); found.add(m[1]); last = m.index + m[1].length;
      }
      frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
    return found;
  }
  function glossaryCard() {
    const main = document.querySelector('main'); if (!main) return;
    let card = document.getElementById('glossary');
    if (!card) {
      card = document.createElement('section'); card.className = 'card noabbr'; card.id = 'glossary'; card.style.marginTop = '16px';
      main.appendChild(card);
    }
    const used = abbrify(document.body);
    const list = [...used].filter(k => GLOSSARY[k]).sort((a, b) => a.localeCompare(b));
    card.innerHTML = `<h2>Abbreviations used on this page</h2><div class="kv gl">${list.map(k => `<b>${k}</b><span>${GLOSSARY[k]}</span>`).join('')}</div>`;
  }
  let pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; obs.disconnect(); glossaryCard(); obs.observe(document.body, { childList: true, subtree: true }); }); }
  const obs = new MutationObserver(schedule);
  window.addEventListener('DOMContentLoaded', () => { glossaryCard(); obs.observe(document.body, { childList: true, subtree: true }); });
  window.abbrify = abbrify;
})();
