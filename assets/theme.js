(function () {
  var KEY = 'chintz.colourway';
  var T = [
    { k: 'ivory', n: 'Ivory ground', s: '#F7F1E3', v: { pat: '#FFFFFF', cream: '#F7F1E3', paper: '#FBF7EE', ink: '#1E2C24', leaf: '#2F6B52', deep: '#1F4A3E', madder: '#B0453F', muted: '#56695C', rule: 'rgba(30,44,36,.16)', rule2: 'rgba(30,44,36,.32)' } },
    { k: 'leaf', n: 'Leaf green', s: '#2F6B52', v: { pat: '#A9CDB6', cream: '#14241D', paper: '#1B3027', ink: '#F2EBDA', leaf: '#A9CDB6', deep: '#E7B457', madder: '#E9938A', muted: '#A9BFAE', rule: 'rgba(242,235,218,.16)', rule2: 'rgba(242,235,218,.32)' } },
    { k: 'madder', n: 'Madder rose', s: '#B0453F', v: { pat: '#F0B8AE', cream: '#3B2226', paper: '#472A2E', ink: '#FBEFEB', leaf: '#F0B8AE', deep: '#E9938A', madder: '#E7B457', muted: '#CDAEAA', rule: 'rgba(251,239,235,.16)', rule2: 'rgba(251,239,235,.32)' } },
    { k: 'ochre', n: 'Ochre', s: '#D4A437', v: { pat: '#F2D58C', cream: '#F3E6C4', paper: '#FAF1DA', ink: '#2B2416', leaf: '#6E5A1E', deep: '#2B2416', madder: '#A34A2E', muted: '#6C5E40', rule: 'rgba(43,36,22,.16)', rule2: 'rgba(43,36,22,.32)' } },
    { k: 'china', n: 'China blue', s: '#8FB6D1', v: { pat: '#A9C8DE', cream: '#182833', paper: '#20333F', ink: '#EEF3F7', leaf: '#9FC0D8', deep: '#9FC0D8', madder: '#E9938A', muted: '#A3B7C4', rule: 'rgba(238,243,247,.16)', rule2: 'rgba(238,243,247,.32)' } },
    { k: 'clay', n: 'Clay branch', s: '#A88C74', v: { pat: '#DCC7B0', cream: '#EFE5D8', paper: '#F7F0E6', ink: '#2E2620', leaf: '#6B5241', deep: '#4A3A2E', madder: '#A04A3A', muted: '#6E5F52', rule: 'rgba(46,38,32,.16)', rule2: 'rgba(46,38,32,.32)' } }
  ];
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(key) {
    var t = T.filter(function (x) { return x.k === key; })[0] || T[0];
    var r = document.documentElement;
    Object.keys(t.v).forEach(function (p) { r.style.setProperty('--' + p, t.v[p]); });
    r.style.colorScheme = /^#[0-3]/.test(t.v.cream) ? 'dark' : 'light';
    r.setAttribute('data-colourway', t.k);
    document.querySelectorAll('[data-colourway-btn]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-colourway-btn') === t.k); });
    document.querySelectorAll('[data-colourway-name]').forEach(function (n) { n.textContent = t.n; });
    return t;
  }
  apply(get());
  function build() {
    document.querySelectorAll('[data-colourways]').forEach(function (box) {
      T.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.title = t.n; b.setAttribute('aria-label', t.n + ' colourway');
        b.setAttribute('data-colourway-btn', t.k);
        b.style.background = t.s;
        b.addEventListener('click', function () { apply(t.k); try { localStorage.setItem(KEY, t.k); } catch (e) {} });
        box.appendChild(b);
      });
    });
    apply(get());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
