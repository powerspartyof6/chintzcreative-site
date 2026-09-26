(function () {
  // Pricing set with Bailey, Sept 2026. Painting time is $25/hr: 2 hours for the
  // smallest piece, then 2 more hours for each size up.
  var RATE = 25;
  var CONFIG = {
    extraItemFee: 5,
    extraItems: 2, // items allowed past the included count before the piece moves up a size
    depositPct: 0.5,
    maxFill: 0.65, // share of the mat window items may cover before the piece needs more paper
    sizes: [
      { key: 'letter', label: '8.5 × 11', w: 8.5, h: 11, win: [7.5, 9.5],   frame: '11 × 14', hours: 2, included: 5, frameAdd: 25 },
      { key: '11x14',  label: '11 × 14',  w: 11,  h: 14, win: [10.5, 13.5], frame: '16 × 20', hours: 4, included: 8, frameAdd: 35 },
      { key: '16x20',  label: '16 × 20',  w: 16,  h: 20, win: [15.5, 19.5], frame: '20 × 24', hours: 6, included: 12, frameAdd: 55 },
      { key: '18x24',  label: '18 × 24',  w: 18,  h: 24, win: [17.5, 23.5], frame: '22 × 28', hours: 8, included: 15, frameAdd: 75 }
    ],
    // Painted wash colors behind each item, rotated so neighbors differ.
    washes: ['#F2CFC9', '#F1DEA6', '#CFE0EC', '#CFE2D6'],
    frames: [
      { key: 'none',  name: 'No frame', note: 'Unframed, on a backing board' },
      { key: 'wood',  name: 'Wood',     note: 'Natural wood, white mat' },
      { key: 'gold',  name: 'Gold',     note: 'Gold frame, white mat' },
      { key: 'black', name: 'Black',    note: 'Black frame, white mat' }
    ],
    item: { start: 2.25, min: 1.25, max: 5, step: 0.25 },
    shipping: function (size, framed) {
      var small = size === 'letter' || size === '11x14';
      if (!framed) return small ? 12 : 18;
      return size === 'letter' ? 25 : 35;
    }
  };
  CONFIG.sizes.forEach(function (s) { s.base = s.hours * RATE; s.max = s.included + CONFIG.extraItems; });

  var EXAMPLE = [
    { label: 'Wolf mascot', x: 0.02, y: 0.05 },
    { label: 'Cross', x: 0.5, y: 0.04 },
    { label: 'Thumbs-up badge', x: 0.98, y: 0.05 },
    { label: 'NC State pennant', x: 0.03, y: 0.45 },
    { label: '1986', x: 0.5, y: 0.42 },
    { label: 'Wendell NC', x: 0.97, y: 0.44 },
    { label: 'BEK crest', x: 0.5, y: 0.82, d: 2.75 }
  ];

  var paper = document.getElementById('kb-paper');
  if (!paper) return;
  var S = { size: 'letter', frame: 'none', delivery: 'pickup', items: [], sel: null, notice: null };
  var uid = 0;

  function $(id) { return document.getElementById(id); }
  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function size(k) { return CONFIG.sizes.filter(function (s) { return s.key === (k || S.size); })[0]; }
  function wash(it) { return CONFIG.washes[(it.id - 1) % CONFIG.washes.length]; }
  function frame(k) { return CONFIG.frames.filter(function (f) { return f.key === (k || S.frame); })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function short(s) { return s.length > 14 ? s.split(/\s+/)[0] : s; }
  function inches(n) { return (Math.round(n * 100) / 100) + ' in'; }
  function framed() { return S.frame !== 'none'; }
  function selected() { return S.items.filter(function (it) { return it.id === S.sel; })[0]; }

  // Share of the mat window the items cover, measured on each item's square footprint.
  function fill(k) {
    var s = size(k), area = s.win[0] * s.win[1];
    return S.items.reduce(function (a, it) { return a + it.d * it.d; }, 0) / area;
  }
  function fits(k) { return S.items.length <= size(k).max && fill(k) <= CONFIG.maxFill; }
  function smallestFit() { return CONFIG.sizes.filter(function (s) { return fits(s.key); })[0]; }

  function checkFit() {
    if (fits()) { S.notice = null; return; }
    var s = size(), next = smallestFit();
    var why = S.items.length > s.max
      ? s.label + ' paper holds ' + s.max + ' items.'
      : 'The items cover more of the ' + s.label + ' paper than will leave room to breathe.';
    S.notice = next
      ? { text: why + ' Move up to ' + next.label + ' (' + money(next.base) + ').', next: next.key }
      : { text: why + ' This is more than the largest size holds. Make some items smaller, or Bailey can quote a custom size.', next: null };
  }

  function loadExample() {
    S.items.forEach(function (it) { if (it.src) URL.revokeObjectURL(it.src); });
    S.items = EXAMPLE.map(function (e) { return { id: ++uid, label: e.label, x: e.x, y: e.y, d: e.d || CONFIG.item.start, src: null, file: null }; });
    S.size = 'letter'; S.frame = 'gold'; S.sel = null; S.notice = null;
    render();
  }

  // Put a new item where it overlaps the items already on the paper the least.
  function openSpot(d) {
    var s = size(), best = { x: 0, y: 0 }, bestHit = Infinity;
    var spanX = Math.max(0, s.win[0] - d), spanY = Math.max(0, s.win[1] - d);
    for (var gy = 0; gy <= 6; gy++) {
      for (var gx = 0; gx <= 4; gx++) {
        var x = gx / 4, y = gy / 6, ax = spanX * x, ay = spanY * y, hit = 0;
        S.items.forEach(function (it) {
          var bx = Math.max(0, s.win[0] - it.d) * it.x, by = Math.max(0, s.win[1] - it.d) * it.y;
          var ox = Math.min(ax + d, bx + it.d) - Math.max(ax, bx);
          var oy = Math.min(ay + d, by + it.d) - Math.max(ay, by);
          if (ox > 0 && oy > 0) hit += ox * oy;
        });
        if (hit < bestHit - 1e-6) { bestHit = hit; best = { x: x, y: y }; }
      }
    }
    return best;
  }

  function add(label, src, file) {
    var s = size();
    if (S.items.length >= s.max) {
      var next = CONFIG.sizes[CONFIG.sizes.indexOf(s) + 1];
      S.notice = next
        ? { text: s.label + ' paper holds ' + s.max + ' items. Move up to ' + next.label + ' (' + money(next.base) + ') to add more.', next: next.key }
        : { text: s.label + ' is the largest size on the board. Bailey can quote anything larger.', next: null };
      render();
      return false;
    }
    var spot = openSpot(CONFIG.item.start);
    S.items.push({ id: ++uid, label: label, x: spot.x, y: spot.y, d: CONFIG.item.start, src: src, file: file || null });
    checkFit();
    return true;
  }

  function resize(it, d) {
    it.d = Math.min(CONFIG.item.max, Math.max(CONFIG.item.min, Math.round(d / CONFIG.item.step) * CONFIG.item.step));
    checkFit();
    render();
  }

  function estimate() {
    var s = size(), n = S.items.length, extra = Math.max(0, n - s.included);
    var lines = [{ l: s.label + ' painting, ' + s.included + ' items', v: s.base }];
    if (extra) lines.push({ l: extra + ' more item' + (extra > 1 ? 's' : '') + ' × ' + money(CONFIG.extraItemFee), v: extra * CONFIG.extraItemFee });
    if (framed()) lines.push({ l: frame().name + ' ' + s.frame + ' frame, matted', v: s.frameAdd });
    if (S.delivery === 'ship') lines.push({ l: 'Shipping, estimated', v: CONFIG.shipping(S.size, framed()) });
    return { lines: lines, total: lines.reduce(function (a, x) { return a + x.v; }, 0) };
  }

  function render() {
    var s = size(), n = S.items.length;

    var sizes = $('kb-sizes');
    sizes.innerHTML = '';
    CONFIG.sizes.forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', x.key === S.size);
      b.disabled = !fits(x.key) && x.key !== S.size;
      if (b.disabled) b.title = 'Your items need more room than ' + x.label + ' gives.';
      b.innerHTML = '<b>' + x.label + '</b><span>' + money(x.base) + ' · up to ' + x.max + ' items</span>';
      b.onclick = function () { S.size = x.key; checkFit(); render(); };
      sizes.appendChild(b);
    });

    paper.style.aspectRatio = s.w + ' / ' + s.h;
    paper.style.width = 'min(100%, ' + Math.round(430 * Math.pow(s.w / 8.5, 0.3)) + 'px)';
    paper.innerHTML = '';
    var mx = (s.w - s.win[0]) / 2, my = (s.h - s.win[1]) / 2;
    var mat = document.createElement('div');
    mat.className = 'kb-mat';
    mat.style.cssText = 'left:' + (mx / s.w * 100) + '%;right:' + (mx / s.w * 100) + '%;top:' + (my / s.h * 100) + '%;bottom:' + (my / s.h * 100) + '%';
    mat.innerHTML = '<span>' + s.label + ' in paper · mat window ' + s.win[0] + ' × ' + s.win[1] + '</span>';
    paper.appendChild(mat);
    if (!S.items.length) {
      var empty = document.createElement('p');
      empty.className = 'kb-empty';
      empty.textContent = 'Upload photos or add a date to start your keepsake.';
      paper.appendChild(empty);
    }
    S.items.forEach(function (it) {
      var el = document.createElement('div');
      var pw = it.d / s.w * 100, ph = it.d / s.h * 100;
      var left = mx / s.w * 100, top = my / s.h * 100;
      var spanX = s.win[0] / s.w * 100 - pw, spanY = s.win[1] / s.h * 100 - ph;
      el.className = 'kb-piece' + (S.sel === it.id ? ' is-sel' : '');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', it.label + ', ' + inches(it.d) + '. Arrow keys move, plus and minus resize.');
      el.style.width = pw + '%';
      el.style.left = left + Math.max(0, spanX) * it.x + '%';
      el.style.top = top + Math.max(0, spanY) * it.y + '%';
      el.innerHTML = '<div class="kb-wash" style="background:' + wash(it) + '">' + (it.src ? '<img alt="" src="' + it.src + '">' : '<i>' + esc(short(it.label)) + '</i>') + '</div><small>' + esc(it.label) + '</small>' +
        (S.sel === it.id ? '<span class="kb-grip" aria-hidden="true"></span>' : '');
      drag(el, it);
      keys(el, it);
      paper.appendChild(el);
    });

    var pips = '';
    for (var i = 0; i < s.max; i++) pips += '<i class="' + (i < Math.min(n, s.included) ? 'in' : i < n ? 'ex' : '') + '"></i>';
    $('kb-pips').innerHTML = pips;
    var f = fill();
    $('kb-slot-text').textContent = n + ' of ' + s.max + ' items · ' + s.included + ' included';
    var meter = $('kb-fill');
    meter.style.setProperty('--fill', Math.min(100, f / CONFIG.maxFill * 100) + '%');
    meter.classList.toggle('over', f > CONFIG.maxFill);
    $('kb-fill-text').textContent = 'Paper used ' + Math.round(Math.min(1, f / CONFIG.maxFill) * 100) + '%';

    var sel = selected(), ctl = $('kb-selected');
    ctl.hidden = !sel;
    if (sel) {
      $('kb-sel-name').textContent = sel.label;
      var r = $('kb-sel-size');
      r.min = CONFIG.item.min; r.max = CONFIG.item.max; r.step = CONFIG.item.step; r.value = sel.d;
      $('kb-sel-val').textContent = inches(sel.d) + ' across';
    }

    var note = $('kb-notice');
    note.hidden = !S.notice;
    note.innerHTML = '';
    if (S.notice) {
      var t = document.createElement('span');
      t.textContent = S.notice.text;
      note.appendChild(t);
      if (S.notice.next) {
        var up = document.createElement('button');
        up.type = 'button'; up.className = 'btn'; up.textContent = 'Move up a size';
        var target = S.notice.next;
        up.onclick = function () { S.size = target; checkFit(); render(); };
        note.appendChild(up);
      }
    }
    $('kb-reset').hidden = S.items.length > 0; // the example would replace the customer's work
    $('kb-send').classList.toggle('is-off', !fits());
    $('kb-send').setAttribute('aria-disabled', !fits());

    var list = $('kb-items');
    list.innerHTML = '';
    S.items.forEach(function (it, idx) {
      var li = document.createElement('li');
      if (S.sel === it.id) li.className = 'is-sel';
      li.innerHTML =
        '<span class="kb-dot" style="background:' + wash(it) + '">' + (it.src ? '<img alt="" src="' + it.src + '">' : '') + '</span>' +
        '<span class="kb-name"><input type="text" id="kb-label-' + it.id + '" aria-label="Item name" value="' + esc(it.label) + '">' +
        '<em>' + inches(it.d) + (idx >= s.included ? ' · more item +' + money(CONFIG.extraItemFee) : '') + '</em></span>' +
        '<button type="button" class="kb-remove" aria-label="Remove ' + esc(it.label) + '">×</button>';
      li.querySelector('input').oninput = function (e) { it.label = e.target.value; relabel(it); renderReceipt(); };
      li.querySelector('input').onfocus = function () { if (S.sel !== it.id) { S.sel = it.id; highlight(); } };
      li.querySelector('.kb-remove').onclick = function () {
        if (it.src) URL.revokeObjectURL(it.src);
        S.items = S.items.filter(function (x) { return x !== it; });
        if (S.sel === it.id) S.sel = null;
        checkFit(); render();
      };
      list.appendChild(li);
    });

    var frames = $('kb-frames');
    frames.querySelectorAll('label').forEach(function (l) { l.remove(); });
    CONFIG.frames.forEach(function (fr) {
      var l = document.createElement('label');
      l.className = 'choice';
      l.innerHTML = '<input type="radio" name="kb-frame" value="' + fr.key + '"' + (fr.key === S.frame ? ' checked' : '') + '><strong>' + fr.name + '</strong><span>' +
        (fr.key === 'none' ? 'No charge' : '+' + money(s.frameAdd) + ' · ' + s.frame + ' in') + '</span>';
      l.querySelector('input').onchange = function () { S.frame = fr.key; render(); };
      frames.appendChild(l);
    });

    var del = $('kb-delivery');
    del.querySelectorAll('label').forEach(function (l) { l.remove(); });
    [['pickup', 'Local pickup'], ['ship', 'Ship it']].forEach(function (d) {
      var l = document.createElement('label');
      l.className = 'chip';
      l.innerHTML = '<input type="radio" name="kb-delivery" value="' + d[0] + '"' + (d[0] === S.delivery ? ' checked' : '') + '><span>' + d[1] + '</span>';
      l.querySelector('input').onchange = function () { S.delivery = d[0]; renderReceipt(); };
      del.appendChild(l);
    });

    renderReceipt();
    renderSending();
  }

  function highlight() {
    paper.querySelectorAll('.kb-piece').forEach(function (el, i) { el.classList.toggle('is-sel', S.items[i] && S.items[i].id === S.sel); });
  }

  function relabel(it) {
    var el = paper.querySelectorAll('.kb-piece')[S.items.indexOf(it)];
    if (!el) return;
    el.querySelector('small').textContent = it.label;
    var i = el.querySelector('i');
    if (i) i.textContent = short(it.label);
  }

  function renderReceipt() {
    var e = estimate();
    var h = '<p class="mono" style="color:var(--muted);font-size:11px">Estimate</p>';
    e.lines.forEach(function (x) {
      h += '<div class="kb-line"><span>' + esc(x.l) + '</span><span>' + money(x.v) + '</span></div>';
      (x.subs || []).forEach(function (sub) { h += '<div class="kb-line sub"><span>' + esc(sub.l) + '</span><span>+' + money(sub.v) + '</span></div>'; });
    });
    h += '<div class="kb-line total"><span>Estimated total</span><span>' + money(e.total) + '</span></div>';
    h += '<div class="kb-line dep"><span>50% deposit once Bailey confirms</span><span>' + money(Math.round(e.total * CONFIG.depositPct)) + '</span></div>';
    if (S.delivery === 'ship' && framed()) h += '<p class="kb-hint">Framed pieces ship with acrylic in place of glass.</p>';
    $('kb-receipt').innerHTML = h;
  }

  function place(el, it) {
    var s = size(), pw = it.d / s.w * 100, ph = it.d / s.h * 100;
    var mx = (s.w - s.win[0]) / 2 / s.w * 100, my = (s.h - s.win[1]) / 2 / s.h * 100;
    el.style.left = mx + Math.max(0, s.win[0] / s.w * 100 - pw) * it.x + '%';
    el.style.top = my + Math.max(0, s.win[1] / s.h * 100 - ph) * it.y + '%';
  }

  function drag(el, it) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var s = size();
      var box = paper.getBoundingClientRect(), r = el.getBoundingClientRect();
      var ppi = box.width / s.w;
      var gripping = e.target.classList.contains('kb-grip');
      if (S.sel !== it.id) { S.sel = it.id; render(); el = paper.querySelectorAll('.kb-piece')[S.items.indexOf(it)]; }
      var startD = it.d, sx = e.clientX, sy = e.clientY;
      var ox = e.clientX - r.left, oy = e.clientY - r.top;
      var winL = box.left + (s.w - s.win[0]) / 2 * ppi, winT = box.top + (s.h - s.win[1]) / 2 * ppi;
      var winW = s.win[0] * ppi, winH = s.win[1] * ppi;
      el.setPointerCapture(e.pointerId);
      function move(ev) {
        if (gripping) {
          var grow = Math.max(ev.clientX - sx, ev.clientY - sy) / ppi;
          it.d = Math.min(CONFIG.item.max, Math.max(CONFIG.item.min, startD + grow));
          el.style.width = it.d / s.w * 100 + '%';
          place(el, it);
          return;
        }
        var w = it.d * ppi;
        it.x = Math.min(1, Math.max(0, (ev.clientX - ox - winL) / Math.max(1, winW - w)));
        it.y = Math.min(1, Math.max(0, (ev.clientY - oy - winT) / Math.max(1, winH - w)));
        place(el, it);
      }
      function up() {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        if (gripping) resize(it, it.d); else render();
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
  }

  function keys(el, it) {
    el.addEventListener('keydown', function (e) {
      var step = 0.04, handled = true;
      if (e.key === 'ArrowLeft') it.x = Math.max(0, it.x - step);
      else if (e.key === 'ArrowRight') it.x = Math.min(1, it.x + step);
      else if (e.key === 'ArrowUp') it.y = Math.max(0, it.y - step);
      else if (e.key === 'ArrowDown') it.y = Math.min(1, it.y + step);
      else if (e.key === '+' || e.key === '=') { S.sel = it.id; resize(it, it.d + CONFIG.item.step); refocus(it); return e.preventDefault(); }
      else if (e.key === '-') { S.sel = it.id; resize(it, it.d - CONFIG.item.step); refocus(it); return e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { S.sel = it.id; render(); refocus(it); return e.preventDefault(); }
      else handled = false;
      if (handled) { e.preventDefault(); place(el, it); }
    });
  }

  function refocus(it) {
    var el = paper.querySelectorAll('.kb-piece')[S.items.indexOf(it)];
    if (el) el.focus();
  }

  // ---- Sending the board to Bailey --------------------------------------
  // FormSubmit emails every field of a normal form post, and attaches the files
  // from its file inputs (10 MB total). The board builds that form on the fly:
  // text fields for the order, one file input for a picture of the layout and
  // one per uploaded photo, shrunk to JPEG so the total stays well under 10 MB.
  var FORM_ACTION = 'https://formsubmit.co/mrs.baileypowers@gmail.com';
  var MAX_BYTES = 9 * 1024 * 1024;

  function photos() { return S.items.filter(function (it) { return it.file; }); }

  function renderSending() {
    var el = $('kb-sending');
    if (!el) return;
    var n = photos().length;
    el.textContent = 'A picture of your ' + size().label + ' layout' + (n ? ' and ' + n + ' uploaded photo' + (n > 1 ? 's' : '') : '') +
      ', with the item list and the ' + money(estimate().total) + ' estimate.';
  }

  function loadImage(src) {
    return new Promise(function (ok, fail) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = fail;
      img.src = src;
    });
  }

  function toJpeg(canvas, quality) {
    return new Promise(function (ok) { canvas.toBlob(ok, 'image/jpeg', quality); });
  }

  // Shrink a photo so its longest side is at most maxSide, on white (for transparent PNGs).
  function shrink(src, maxSide, quality) {
    return loadImage(src).then(function (img) {
      var k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      var g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      return toJpeg(c, quality);
    });
  }

  // Draw the board as Bailey should see it: the paper to scale, the mat window,
  // each item at its size and place, and a caption strip with the order.
  function drawLayout(quality) {
    var s = size(), ppi = 110, pad = 40, strip = 150;
    var c = document.createElement('canvas');
    c.width = Math.round(s.w * ppi) + pad * 2;
    c.height = Math.round(s.h * ppi) + pad * 2 + strip;
    var g = c.getContext('2d');
    g.fillStyle = '#F7F1E3'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#FBF7EE'; g.fillRect(pad, pad, s.w * ppi, s.h * ppi);
    g.strokeStyle = 'rgba(30,44,36,.25)'; g.lineWidth = 1; g.strokeRect(pad + .5, pad + .5, s.w * ppi - 1, s.h * ppi - 1);
    var mx = (s.w - s.win[0]) / 2, my = (s.h - s.win[1]) / 2;
    g.setLineDash([6, 5]); g.strokeStyle = 'rgba(30,44,36,.4)';
    g.strokeRect(pad + mx * ppi, pad + my * ppi, s.win[0] * ppi, s.win[1] * ppi);
    g.setLineDash([]);
    var jobs = S.items.map(function (it) { return it.src ? loadImage(it.src).catch(function () { return null; }) : Promise.resolve(null); });
    return Promise.all(jobs).then(function (imgs) {
      S.items.forEach(function (it, i) {
        var d = it.d * ppi;
        var x = pad + (mx + Math.max(0, s.win[0] - it.d) * it.x) * ppi;
        var y = pad + (my + Math.max(0, s.win[1] - it.d) * it.y) * ppi;
        var r = d * 0.4, cx = x + d / 2, cy = y + d * 0.42;
        g.fillStyle = wash(it);
        g.beginPath(); g.ellipse(cx, cy, r, r * 0.96, 0.3, 0, Math.PI * 2); g.fill();
        var img = imgs[i];
        if (img) {
          g.save(); g.beginPath(); g.ellipse(cx, cy, r, r * 0.96, 0.3, 0, Math.PI * 2); g.clip();
          var k = Math.max(2 * r / img.naturalWidth, 2 * r / img.naturalHeight);
          g.globalCompositeOperation = 'multiply';
          g.drawImage(img, cx - img.naturalWidth * k / 2, cy - img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k);
          g.restore();
        } else {
          g.fillStyle = '#1E2C24'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = 'italic ' + Math.round(r * 0.42) + 'px "Instrument Serif", Georgia, serif';
          g.fillText(short(it.label), cx, cy, r * 1.8);
        }
        g.fillStyle = '#1E2C24'; g.textAlign = 'center'; g.textBaseline = 'top';
        g.font = '500 ' + Math.max(11, Math.round(ppi * 0.12)) + 'px "IBM Plex Mono", monospace';
        g.fillText((i + 1) + '. ' + it.label, cx, cy + r + 6, d * 1.2);
      });
      var e = estimate(), ty = pad * 2 + s.h * ppi;
      g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = '#1E2C24';
      g.font = '34px "Instrument Serif", Georgia, serif';
      g.fillText('Keepsake board · ' + s.label + ' in · ' + S.items.length + ' items', pad, ty);
      g.font = '16px "IBM Plex Mono", monospace'; g.fillStyle = '#56695C';
      g.fillText((framed() ? frame().name + ' ' + s.frame + ' frame, matted' : 'No frame') + ' · ' + (S.delivery === 'ship' ? 'Ship' : 'Local pickup'), pad, ty + 48);
      g.fillText('Estimate ' + money(e.total) + ' · mat window ' + s.win[0] + ' × ' + s.win[1] + ' in (dashed line)', pad, ty + 76);
      return toJpeg(c, quality);
    });
  }

  // FormSubmit shows each field name in the email, with spaces turned into
  // underscores, so every name here is a single word.
  function orderText() {
    var s = size(), e = estimate();
    return {
      'Size': s.label + ' in paper, mat window ' + s.win[0] + ' × ' + s.win[1] + ' in',
      'Framing': framed() ? frame().name + ', ' + s.frame + ' in frame with white mat' : 'No frame',
      'Delivery': S.delivery === 'ship' ? 'Ship it' : 'Local pickup',
      'Items': S.items.map(function (it, i) {
        return (i + 1) + '. ' + it.label + ' · ' + inches(it.d) + (it.file ? ' · photo attached' : '');
      }).join('\n'),
      'Estimate': e.lines.map(function (x) { return x.l + ': ' + money(x.v); }).join('\n') + '\n50% deposit once confirmed',
      'Total': money(e.total),
      'Deposit': money(Math.round(e.total * CONFIG.depositPct))
    };
  }

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo'; }

  // Build the attachments, dropping photo size and quality until everything fits.
  function buildFiles() {
    var tries = [[1400, 0.82, 0.88], [1000, 0.75, 0.8], [700, 0.68, 0.72]];
    function attempt(k) {
      var t = tries[k];
      var list = photos();
      return Promise.all([drawLayout(t[2])].concat(list.map(function (it) { return shrink(it.src, t[0], t[1]); }))).then(function (blobs) {
        var total = blobs.reduce(function (a, b) { return a + b.size; }, 0);
        if (total > MAX_BYTES && k < tries.length - 1) return attempt(k + 1);
        if (total > MAX_BYTES) throw new Error('too-big');
        var files = [{ name: 'Layout', file: new File([blobs[0]], 'keepsake-layout.jpg', { type: 'image/jpeg' }) }];
        list.forEach(function (it, i) {
          var n = S.items.indexOf(it) + 1;
          files.push({ name: 'Photo-' + n, file: new File([blobs[i + 1]], String(n).padStart(2, '0') + '-' + slug(it.label) + '.jpg', { type: 'image/jpeg' }) });
        });
        return files;
      });
    }
    return attempt(0);
  }

  function send(ev) {
    ev.preventDefault();
    var status = $('kb-status'), btn = $('kb-submit');
    var name = $('kb-name'), email = $('kb-email');
    if (!fits()) { checkFit(); render(); status.textContent = 'Move up a size first, the paper is full.'; $('kb-notice').scrollIntoView({ block: 'center' }); return; }
    if (!S.items.length) { status.textContent = 'Add at least one item to the paper.'; return; }
    if (!name.value.trim()) { status.textContent = 'Add your name.'; name.focus(); return; }
    if (!email.checkValidity() || !email.value.trim()) { status.textContent = 'Add an email Bailey can reply to.'; email.focus(); return; }
    btn.disabled = true;
    status.textContent = 'Preparing your layout and photos…';
    buildFiles().then(function (files) {
      var f = document.createElement('form');
      f.action = FORM_ACTION; f.method = 'POST'; f.enctype = 'multipart/form-data'; f.hidden = true;
      var fields = {
        '_subject': 'Keepsake board from ' + name.value.trim() + ' · ' + size().label + ' · ' + money(estimate().total),
        '_next': 'https://chintzcreative.com/thanks',
        '_template': 'table',
        '_captcha': 'false',
        'name': name.value.trim(),
        'email': email.value.trim(),
        'Phone': $('kb-phone').value.trim(),
        'Deadline': $('kb-date').value,
        'Notes': $('kb-notes').value.trim()
      };
      var order = orderText();
      Object.keys(order).forEach(function (k) { fields[k] = order[k]; });
      Object.keys(fields).forEach(function (k) {
        if (fields[k] === '') return;
        var i = k === 'Items' || k === 'Estimate' || k === 'Notes' ? document.createElement('textarea') : document.createElement('input');
        i.name = k; i.value = fields[k];
        f.appendChild(i);
      });
      files.forEach(function (x) {
        var i = document.createElement('input');
        i.type = 'file'; i.name = x.name;
        var dt = new DataTransfer(); dt.items.add(x.file); i.files = dt.files;
        f.appendChild(i);
      });
      document.body.appendChild(f);
      status.textContent = 'Sending…';
      f.submit();
    }).catch(function () {
      btn.disabled = false;
      status.textContent = 'The photos are too large to send together. Remove a few or send them by email.';
    });
  }

  $('kb-sel-size').oninput = function (e) {
    var it = selected();
    if (it) resize(it, parseFloat(e.target.value));
    $('kb-sel-size').focus();
  };
  // Name an item from its file: camera names (IMG_4821, PXL_2026..., DSC01234)
  // become "Photo 4", anything else is tidied into title case.
  function nameFor(file) {
    var base = file.name.replace(/\.[^.]+$/, '');
    if (/^\d{1,4}$/.test(base)) return base; // a year like 1986
    if (/^(img|image|dsc|dscn|pxl|photo|screenshot|pic|mvimg|dji)?[\s_-]*\d[\d\s_-]*/i.test(base) && !/[a-z]{3,}/i.test(base.replace(/^(img|image|dsc|dscn|pxl|photo|screenshot|pic|mvimg|dji)/i, ''))) {
      return 'Photo ' + (S.items.length + 1);
    }
    return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28)
      .replace(/\b([a-z])/g, function (c) { return c.toUpperCase(); }) || 'Photo ' + (S.items.length + 1);
  }

  // Add photos one at a time, skipping any the browser cannot open (for
  // example iPhone HEIC photos in some desktop browsers).
  $('kb-upload').onchange = function (e) {
    var files = Array.prototype.slice.call(e.target.files);
    var skipped = [];
    e.target.value = '';
    files.reduce(function (chain, f) {
      return chain.then(function (keepGoing) {
        if (!keepGoing) return false;
        var src = URL.createObjectURL(f);
        return loadImage(src).then(function () {
          return add(nameFor(f), src, f);
        }, function () {
          URL.revokeObjectURL(src);
          skipped.push(f.name);
          return true;
        });
      });
    }, Promise.resolve(true)).then(function () {
      if (skipped.length && !S.notice) {
        S.notice = { text: 'Couldn\u2019t open ' + skipped.join(', ') + '. Save ' + (skipped.length > 1 ? 'them' : 'it') + ' as a JPEG or PNG and upload again. On iPhone, sharing or screenshotting the photo works.', next: null };
      }
      render();
    });
  };
  $('kb-add-text').onclick = function () { if (add('Date or words', null)) render(); };
  $('kb-reset').onclick = loadExample;
  $('kb-send').onclick = function (e) { if (!fits()) { e.preventDefault(); checkFit(); render(); } };
  $('kb-send-form').addEventListener('submit', send);

  $('kb-size-table').innerHTML = CONFIG.sizes.map(function (s) {
    return '<tr><td>' + s.label + ' in</td><td>' + s.win[0] + ' × ' + s.win[1] + ' in</td><td>' + s.frame + ' in</td><td>' + money(s.base) + '</td><td>' + s.included + '</td><td>' + s.max + '</td><td>+' + money(s.frameAdd) + '</td></tr>';
  }).join('');
  $('kb-frame-table').innerHTML = CONFIG.sizes.map(function (s) {
    return '<tr><td>' + s.label + ' in</td><td>' + s.frame + ' in, white mat</td><td>Wood, gold or black</td><td>+' + money(s.frameAdd) + '</td></tr>';
  }).join('');
  $('kb-extra-fee').textContent = money(CONFIG.extraItemFee);

  render();
})();
