// Minimal LaTeX -> MathML converter (no external libraries; browsers render MathML natively, works offline).
// Supported: \frac{}{}, \text{}, \mathbf{}, \mathrm{}, \sqrt{}, _ and ^ (single token or {group}),
// \times \div \cdot \pm \le \ge \approx \Rightarrow \rightarrow \to \Sigma \Pi \prod \sum \theta \alpha \Delta
// \sin \cos \arcsin \left \right, \, \; \quad \  spacing, \degree, \circ, numbers, letters, + - = ( ) [ ] | , / : < >.
(function (root) {
  const SYM = { times: '×', div: '÷', cdot: '·', pm: '±', le: '≤', ge: '≥', leq: '≤', geq: '≥', approx: '≈', ne: '≠',
    Rightarrow: '⇒', rightarrow: '→', to: '→', Sigma: 'Σ', Pi: 'Π', prod: '∏', sum: '∑', degree: '°', circ: '∘', ldots: '…', cdots: '⋯' };
  const GREEK = { theta: 'θ', alpha: 'α', beta: 'β', Delta: 'Δ', delta: 'δ', phi: 'φ', psi: 'ψ' };
  const FUNCS = { sin: 'sin', cos: 'cos', tan: 'tan', arcsin: 'arcsin', arccos: 'arccos', ln: 'ln', log: 'log', max: 'max', min: 'min' };
  const SPACE = { ',': '0.17em', ';': '0.28em', ':': '0.22em', quad: '1em', qquad: '2em', ' ': '0.25em', '!': '0em' };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function parse(src) {
    let i = 0;
    const peek = () => src[i];
    function readCmd() { // after backslash
      if (!/[A-Za-z]/.test(src[i])) return src[i++];
      let s = ''; while (i < src.length && /[A-Za-z]/.test(src[i])) s += src[i++];
      return s;
    }
    function readRawGroup() { // returns raw text inside {...}
      while (src[i] === ' ') i++;
      if (src[i] !== '{') return src[i++] || '';
      let d = 0, s = ''; i++;
      while (i < src.length) { const c = src[i++]; if (c === '{') d++; else if (c === '}') { if (d === 0) break; d--; } s += c; }
      return s;
    }
    function atom() {
      while (src[i] === ' ') i++;
      if (i >= src.length) return null;
      const c = src[i];
      if (c === '}') return null;
      if (c === '{') { i++; const inner = seq('}'); i++; return `<mrow>${inner}</mrow>`; }
      if (c === '\\') {
        i++; const cmd = readCmd();
        if (cmd === 'frac') { const a = parse(readRawGroup()), b = parse(readRawGroup()); return `<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`; }
        if (cmd === 'dot' || cmd === 'bar' || cmd === 'hat') { const acc = { dot: '˙', bar: '¯', hat: '^' }[cmd]; return `<mover accent="true"><mrow>${parse(readRawGroup())}</mrow><mo>${acc}</mo></mover>`; }
        if (cmd === 'sqrt') return `<msqrt>${parse(readRawGroup())}</msqrt>`;
        if (cmd === 'text') return `<mtext>${esc(readRawGroup()).replace(/ /g, '&#160;')}</mtext>`;
        if (cmd === 'mathbf') return `<mrow style="font-weight:700">${parse(readRawGroup())}</mrow>`;
        if (cmd === 'mathrm') return `<mstyle mathvariant="normal"><mrow>${parse(readRawGroup())}</mrow></mstyle>`;
        if (cmd === 'left' || cmd === 'right') { while (src[i] === ' ') i++; const d = src[i++]; return d === '.' ? '' : `<mo stretchy="true">${esc(d === '\\' ? src[i++] : d)}</mo>`; }
        if (cmd in SPACE) return `<mspace width="${SPACE[cmd]}"/>`;
        if (cmd in SYM) return `<mo>${SYM[cmd]}</mo>`;
        if (cmd in GREEK) return `<mi>${GREEK[cmd]}</mi>`;
        if (cmd in FUNCS) return `<mspace width="0.17em"/><mi mathvariant="normal">${FUNCS[cmd]}</mi><mo>&#8289;</mo>`;
        if (cmd === '{' || cmd === '}' || cmd === '%' || cmd === '&' || cmd === '_') return `<mo>${esc(cmd)}</mo>`;
        return `<mtext>${esc('\\' + cmd)}</mtext>`;
      }
      if (/[0-9.]/.test(c)) { let s = ''; while (i < src.length && /[0-9.]/.test(src[i])) s += src[i++]; return `<mn>${s}</mn>`; }
      if (/[A-Za-z]/.test(c)) { i++; return `<mi>${c}</mi>`; }
      i++;
      if ('()[]|'.includes(c)) return `<mo stretchy="false">${c}</mo>`;
      if (c === '-') return '<mo>−</mo>';
      if (c === '*') return '<mo>×</mo>';
      if (c === "'") return '<mo>′</mo>';
      return `<mo>${esc(c)}</mo>`;
    }
    function scripted() {
      let base = atom(); if (base === null) return null;
      while (true) {
        while (src[i] === ' ') i++;
        const c = src[i];
        if (c !== '_' && c !== '^') break;
        i++;
        const s = atom() || '<mrow></mrow>';
        base = c === '_' ? `<msub><mrow>${base}</mrow>${s}</msub>` : `<msup><mrow>${base}</mrow>${s}</msup>`;
      }
      return base;
    }
    function seq(stop) {
      let out = '';
      while (i < src.length && src[i] !== stop) { const a = scripted(); if (a === null) break; out += a; }
      return out;
    }
    return seq();
  }
  function tex2mml(tex, display = true) {
    try { return `<math${display ? ' display="block"' : ''}><mrow>${parse(tex)}</mrow></math>`; }
    catch (e) { return `<code>${esc(tex)}</code>`; }
  }
  root.tex2mml = tex2mml;
  if (typeof module !== 'undefined') module.exports = { tex2mml };
})(typeof window !== 'undefined' ? window : globalThis);
