(function () {
  var form = document.getElementById('intake');
  if (!form) return;
  document.documentElement.classList.add('js');
  var KEY = 'chintz.intake.v1';
  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var marks = Array.prototype.slice.call(document.querySelectorAll('.progress li'));
  var back = form.querySelector('[data-back]');
  var next = form.querySelector('[data-next]');
  var send = form.querySelector('[data-send]');
  var saveNote = form.querySelector('.save');
  var review = form.querySelector('#review');
  var i = 0;

  function fields(root) { return Array.prototype.slice.call(root.querySelectorAll('input,select,textarea')); }

  function show(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    marks.forEach(function (m, k) {
      if (k === i) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
      m.classList.toggle('done', k < i);
    });
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    send.hidden = i !== steps.length - 1;
    if (i === steps.length - 1) buildReview();
    var top = form.getBoundingClientRect().top + window.pageYOffset - 90;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    var first = steps[i].querySelector('legend');
    if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
  }

  function type() { var r = form.querySelector('input[name="project_type"]:checked'); return r ? r.value : ''; }

  function branch() {
    var t = type();
    form.querySelectorAll('.branch').forEach(function (b) {
      var d = b.getAttribute('data-for'); var on = !!t && (d === '*' || d === t);
      b.hidden = !on;
      fields(b).forEach(function (f) { f.disabled = !on; });
    });
    var kind = form.querySelector('[data-kind]');
    if (kind) kind.textContent = t ? t.toLowerCase() : 'project';
  }

  function valid(step) {
    var ok = true;
    var groups = {};
    fields(step).forEach(function (f) {
      if (!ok || f.disabled || f.type === 'hidden') return;
      if (f.type === 'radio') { if (f.required && !groups[f.name]) { groups[f.name] = true; if (!step.querySelector('input[name="' + f.name + '"]:checked')) { f.reportValidity(); ok = false; } } return; }
      if (!f.checkValidity()) { f.reportValidity(); ok = false; }
    });
    return ok;
  }

  var LABELS = {};
  fields(form).forEach(function (f) {
    if (!f.name || f.name.charAt(0) === '_') return;
    var lab = f.getAttribute('data-label') || (f.closest('.field') && f.closest('.field').querySelector('span,legend') && f.closest('.field').querySelector('span,legend').textContent) || (f.closest('fieldset') && f.closest('fieldset').querySelector('legend') && f.closest('fieldset').querySelector('legend').textContent) || f.name;
    LABELS[f.name] = lab.replace(/\s*\*$/, '').trim();
  });

  function buildReview() {
    var fd = new FormData(form);
    var rows = {};
    fd.forEach(function (v, k) {
      if (k.charAt(0) === '_' || v === '' || (v instanceof File)) return;
      rows[k] = rows[k] ? rows[k] + ', ' + v : String(v);
    });
    var files = form.querySelector('input[type=file]');
    if (files && !files.disabled && files.files.length) rows.attachment = Array.prototype.map.call(files.files, function (f) { return f.name; }).join(', ');
    review.innerHTML = '';
    Object.keys(rows).forEach(function (k) {
      var d = document.createElement('div');
      var dt = document.createElement('dt'); dt.textContent = LABELS[k] || k;
      var dd = document.createElement('dd'); dd.textContent = rows[k];
      d.appendChild(dt); d.appendChild(dd); review.appendChild(d);
    });
  }

  var timer;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var data = {};
      fields(form).forEach(function (f) {
        if (!f.name || f.name.charAt(0) === '_' || f.type === 'file') return;
        if (f.type === 'radio' || f.type === 'checkbox') { if (f.checked) (data[f.name] = data[f.name] || []).push(f.value); }
        else data[f.name] = f.value;
      });
      data._step = i;
      try { localStorage.setItem(KEY, JSON.stringify(data)); if (saveNote) saveNote.textContent = 'Draft saved on this device'; } catch (e) {}
    }, 300);
  }

  function restore() {
    var data;
    try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var q = new URLSearchParams(location.search).get('type');
    if (data) {
      fields(form).forEach(function (f) {
        if (!(f.name in data) || f.type === 'file') return;
        if (f.type === 'radio' || f.type === 'checkbox') f.checked = data[f.name].indexOf(f.value) > -1;
        else f.value = data[f.name];
      });
    }
    if (q) {
      var map = { watercolor: 'Custom watercolor', lettering: 'Hand lettering', banner: 'Banner', gifts: 'Painted gifts', wedding: 'Wedding signage', interior: 'Interior design', other: 'Something else' };
      var r = form.querySelector('input[name="project_type"][value="' + (map[q] || q) + '"]');
      if (r) r.checked = true;
    }
    branch();
    show(data && q == null ? (data._step || 0) : 0);
  }

  form.addEventListener('change', function (e) { if (e.target.name === 'project_type') branch(); save(); });
  form.addEventListener('input', save);
  next.addEventListener('click', function () { if (valid(steps[i])) { show(i + 1); save(); } });
  back.addEventListener('click', function () { show(i - 1); save(); });
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && i < steps.length - 1) { e.preventDefault(); next.click(); }
  });
  form.addEventListener('submit', function (e) {
    for (var k = 0; k < steps.length; k++) { steps[k].hidden = false; if (!valid(steps[k])) { e.preventDefault(); show(k); return; } }
    var name = (form.querySelector('[name="name"]') || {}).value || '';
    var date = (form.querySelector('[name="needed_by"]') || {}).value || 'no date';
    form.querySelector('[name="_subject"]').value = 'New ' + (type() || 'commission').toLowerCase() + ' enquiry from ' + name + ' (needed ' + date + ')';
    send.disabled = true; send.textContent = 'Sending...';
    try { localStorage.removeItem(KEY); } catch (err) {}
  });

  restore();
})();
