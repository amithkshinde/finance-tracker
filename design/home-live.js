/* Home: replaces the sample figures with the data saved on the Update page. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var wrap = document.querySelector('.wrap');
  if (!window.FT || !FT.live()) {
    var b = el('div', 'stale'); b.setAttribute('role', 'status');
    b.appendChild(el('span', '', 'You are looking at sample data. Enter your own balances, one account at a time, and this page becomes yours.'));
    var a = el('a', '', 'Start now'); a.href = 'entry-form.html#wizard'; a.style.cssText = 'margin-left:auto;font:500 13px var(--ui);background:var(--accent);color:#fff;border-radius:6px;padding:8px 14px;text-decoration:none;white-space:nowrap';
    b.appendChild(a); wrap.insertBefore(b, wrap.firstChild); return;
  }
  var view = FT.currentView(), ex = FT.exSet(view);
  var months = FT.months(ex), last = months[months.length - 1], prev = months.length > 1 ? months[months.length - 2] : null;
  var asof = FT.latestDate(), net = last.net;
  $('fig').textContent = FT.money(net); $('topfig').textContent = FT.money(net);
  document.querySelector('#hero .label').textContent = (view ? view.name + ' · ' : 'Net worth · ') + FT.fmtDate(asof);
  var sh = $('short').parentNode;
  if (prev) {
    var d = net - prev.net, p = prev.net ? d / Math.abs(prev.net) * 100 : 0, up = d >= 0;
    $('delta').textContent = (up ? '+' : '−') + FT.money(Math.abs(d)).replace('−', '') + ' (' + (up ? '+' : '−') + Math.abs(p).toFixed(1) + '%)';
    $('delta').className = up ? 'delta' : 'delta'; if (!up) $('delta').style.color = 'var(--loss)';
    sh.lastChild.previousSibling.textContent = ' since ' + prev.label + ' · '; $('short').textContent = FT.short(net);
  } else { sh.textContent = 'First snapshot saved. Save another next month to see the change.'; }
  // trend line
  var sp = $('spark');
  if (months.length > 1) {
    var v = months.slice(-12).map(function (m) { return m.net; }), mn = Math.min.apply(0, v), mx = Math.max.apply(0, v), rg = (mx - mn) || 1;
    var path = v.map(function (x, i) { return (i ? 'L' : 'M') + Math.round(i * 280 / (v.length - 1)) + ' ' + Math.round(66 - (x - mn) / rg * 56); }).join(' ');
    sp.querySelector('path').setAttribute('d', path);
    var pts = path.split(' '); sp.querySelector('.end').setAttribute('cy', pts[pts.length - 1]);
    sp.setAttribute('aria-label', 'Net worth over the last ' + v.length + ' months, from ' + FT.money(v[0]) + ' to ' + FT.money(v[v.length - 1]));
  } else sp.style.display = 'none';
  // saved views
  var vh = $('views'); vh.style.display = ''; vh.textContent = ''; vh.appendChild(el('span', 'label', 'View'));
  function chip(name, on, fn) { var c = el('button', 'chip', name); c.type = 'button'; c.setAttribute('aria-pressed', on ? 'true' : 'false'); c.onclick = fn; vh.appendChild(c); }
  chip('All accounts', !view, function () { FT.setView(null); location.reload(); });
  FT.views().forEach(function (v) { chip(v.name, view && view.name === v.name, function () { FT.setView(v.name); location.reload(); }); });
  var ev = el('button', 'chip', '+ Edit views'); ev.type = 'button'; ev.onclick = editViews; vh.appendChild(ev);
  function editViews() {
    var vs = FT.views(), m = FTUI.modal('Saved views', 'A view leaves some accounts out of the total, for example your savings. Tick the accounts to leave out.');
    function draw() {
      m.body.textContent = '';
      vs.forEach(function (v, i) {
        var nm = FTUI.input('text', v.name); nm.onchange = function () { v.name = nm.value.trim() || v.name; };
        m.body.appendChild(FTUI.field('View name', nm));
        var list = el('div'); list.style.cssText = 'max-height:200px;overflow:auto;border:1px solid var(--border);border-radius:6px;padding:4px 10px;margin-top:6px';
        FT.accounts().forEach(function (a) { var lb = el('label', 'ftck'); var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = v.exclude.indexOf(a.id) > -1; cb.onchange = function () { v.exclude = v.exclude.filter(function (x) { return x !== a.id; }); if (cb.checked) v.exclude.push(a.id); }; lb.appendChild(cb); lb.appendChild(document.createTextNode(a.name)); list.appendChild(lb); });
        m.body.appendChild(list); m.body.appendChild(FTUI.btn('Delete this view', 'l', function () { vs.splice(i, 1); draw(); }));
      });
      m.body.appendChild(FTUI.btn('+ New view', 'l', function () { vs.push({ name: 'New view', exclude: [] }); draw(); }));
    }
    draw(); m.foot.appendChild(FTUI.btn('Cancel', '', m.close));
    m.foot.appendChild(FTUI.btn('Save', 'p', function () { FT.saveViews(vs); if (view && !vs.some(function (v) { return v.name === view.name; })) FT.setView(null); m.close(); location.reload(); }));
  }
  if (view) { var lab = document.querySelector('#hero .label'); }
  // allocation (assets only)
  var g = FT.groupsAt(asof, ex), assets = FT.GROUPS.filter(function (n) { return n !== 'Liabilities' && g[n] > 0; }), tot = assets.reduce(function (s, n) { return s + g[n]; }, 0);
  var al = $('alloc'); al.style.display = tot ? '' : 'none';
  if (tot) {
    var bar = al.querySelector('.bar'), lg = al.querySelector('.legend'); bar.textContent = ''; lg.textContent = '';
    assets.forEach(function (n, i) {
      var pct = g[n] / tot * 100, op = Math.max(.28, 1 - i * .24);
      var s = el('span'); s.style.width = pct + '%'; s.style.opacity = op; bar.appendChild(s);
      var l = el('span'); var ic = el('i'); ic.style.opacity = op; l.appendChild(ic); l.appendChild(document.createTextNode(n + ' ' + pct.toFixed(1) + '%')); lg.appendChild(l);
    });
    bar.setAttribute('aria-label', 'Allocation: ' + assets.map(function (n) { return n + ' ' + (g[n] / tot * 100).toFixed(1) + '%'; }).join(', '));
  }
  // liquid vs locked
  var tiers = { now: 0, sell: 0, locked: 0 }, rows = FT.rows(ex);
  rows.forEach(function (r) { if (r.v != null && r.a.group !== 'Liabilities') tiers[FT.tier(r.a)] += r.v; });
  var liab0 = rows.filter(function (r) { return r.a.group === 'Liabilities'; }).reduce(function (s, r) { return s + (r.v || 0); }, 0);
  var lq = el('section'); lq.id = 'liquid';
  var lh = el('div', 'head'); lh.appendChild(el('span', 'label', 'What you can use')); lq.appendChild(lh);
  [['now', 'In the bank, usable today'], ['sell', 'Shares and funds, a few days to sell'], ['locked', 'Locked in: FDs, RDs, PPF, NPS, policies']].forEach(function (t) {
    var r = el('div', 'row'), m = el('div'); m.appendChild(el('div', 'name', t[1])); r.appendChild(m); r.appendChild(el('div', 'amt', FT.money(tiers[t[0]]))); lq.appendChild(r);
  });
  var anchor = $('alloc'); anchor.parentNode.insertBefore(lq, anchor.nextSibling);
  // what changed
  if (prev) {
    var ch = [];
    FT.accounts().forEach(function (a) { if (ex[a.id]) return; var x = FT.last(a.id, last.date), y = FT.last(a.id, prev.date), dv = (x ? x.v : 0) - (y ? y.v : 0); if (Math.abs(dv) >= 1) ch.push({ n: a.name, d: dv * FT.sign(a) }); });
    ch.sort(function (p, q) { return Math.abs(q.d) - Math.abs(p.d); });
    if (ch.length) {
      var wc = el('div', 'sub'); wc.style.cssText = 'margin:-8px 0 20px'; var sg = function (n) { return (n < 0 ? '−' : '+') + FT.money(Math.abs(n)); };
      wc.textContent = 'Since ' + prev.label + ': ' + ch.slice(0, 3).map(function (c) { return c.n + ' ' + sg(c.d); }).join(', ') + (ch.length > 3 ? ' and ' + (ch.length - 3) + ' other' + (ch.length - 3 > 1 ? 's' : '') : '') + '.';
      $('hero').parentNode.insertBefore(wc, $('hero').nextSibling);
    }
  }
  // groups
  var rows = FT.rows(ex), host = $('groups'); host.textContent = '';
  var stale = [];
  FT.GROUPS.forEach(function (n) {
    var rs = rows.filter(function (r) { return r.a.group === n; }); if (!rs.length) return;
    var sec = el('section'), head = el('div', 'head'), sum = 0;
    rs.forEach(function (r) { sum += r.v || 0; });
    head.appendChild(el('span', 'label', n));
    if (n === 'Insurance and policies' && FT.premiumTotal()) { var pb = el('span', 'sub', FT.money(FT.premiumTotal()) + ' a month in premiums'); pb.style.cssText = 'flex:1;margin-left:12px'; head.appendChild(pb); } head.appendChild(el('span', 'total', FT.money(sum))); sec.appendChild(head);
    rs.forEach(function (r) {
      var row = el('div', 'row'), m = el('div'); m.appendChild(el('div', 'name', r.a.name));
      var sub = (r.a.premium ? [FT.premiumText(r.a)] : [r.a.inst, r.a.basis && r.a.basis !== 'Balance' ? r.a.basis : '']).filter(Boolean).join(' · '); if (sub) m.appendChild(el('div', 'inst', sub));
      row.appendChild(m); row.style.cursor = 'pointer'; row.tabIndex = 0; row.title = 'Edit details'; (function (id) { row.onclick = function () { FTEdit(id); }; row.onkeydown = function (e) { if (e.key === 'Enter') FTEdit(id); }; })(r.a.id); row.appendChild(el('span', 'badge', 'Manual')); row.appendChild(el('div', 'amt', r.v == null ? '–' : FT.money(r.v)));
      var sv = r.age == null ? 'amber' : FT.sev(r.age), ag = el('div', 'age ' + sv); ag.appendChild(el('span', 'dot ' + sv));
      ag.appendChild(document.createTextNode(r.age == null ? 'no value' : r.age === 0 ? 'today' : r.age + 'd ago')); row.appendChild(ag); sec.appendChild(row);
      if (sv) stale.push({ name: r.a.name, age: r.age });
    });
    host.appendChild(sec);
  });
  $('noneline').style.display = rows.some(function (r) { return r.a.group === 'Liabilities'; }) ? 'none' : '';
  // matured deposits
  var td0 = new Date().toISOString().slice(0, 10), mt = [];
  FT.accounts().forEach(function (a) {
    var v = FT.last(a.id); if (!v || !v.v) return;
    (a.fds || []).forEach(function (f) { if (f.maturity && f.maturity < td0 && f.amount) mt.push({ a: a, t: 'FD ending ' + f.last4, d: f.maturity }); });
    (a.rds || []).forEach(function (r) { if (r.maturity && r.maturity < td0) mt.push({ a: a, t: 'RD ' + r.label, d: r.maturity }); });
  });
  if (mt.length) {
    var mb = el('div', 'stale'); mb.setAttribute('role', 'status'); mb.appendChild(el('span', 'dot amber'));
    mb.appendChild(el('span', '', mt.length + (mt.length > 1 ? ' deposits have' : ' deposit has') + ' matured and still count in your total: ' + mt.slice(0, 3).map(function (x) { return x.a.name + ' (' + x.t + ', ' + FT.fmtDate(x.d) + ')'; }).join('; ') + '. Is the money still there, renewed, or moved?'));
    var mbt = el('button', '', 'Review'); mbt.type = 'button'; mbt.style.cssText = 'margin-left:auto;font:500 13px var(--ui);background:var(--accent);color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer'; mbt.onclick = function () { FTEdit(mt[0].a.id); };
    mb.appendChild(mbt); $('stale').parentNode.insertBefore(mb, $('stale'));
  }
  // stale strip
  var st = $('stale'); st.textContent = '';
  if (stale.length) {
    stale.sort(function (a, b) { return (b.age == null ? 1e9 : b.age) - (a.age == null ? 1e9 : a.age); });
    st.appendChild(el('span', 'dot amber'));
    st.appendChild(el('span', '', stale.length + (stale.length === 1 ? ' account needs' : ' accounts need') + ' updating: ' + stale.slice(0, 3).map(function (s) { return s.name + (s.age == null ? '' : ' (' + s.age + ' days)'); }).join(', ') + (stale.length > 3 ? ' and ' + (stale.length - 3) + ' more' : '') + '.'));
    var bt = el('a', '', 'Update all'); bt.href = 'entry-form.html#wizard';
    bt.style.cssText = 'margin-left:auto;font:500 13px var(--ui);background:var(--accent);color:#fff;border-radius:6px;padding:8px 14px;text-decoration:none;white-space:nowrap'; st.appendChild(bt);
  } else { st.style.display = 'none'; }
  // coming up (dates the user added)
  var today = new Date().toISOString().slice(0, 10), items = [];
  FT.accounts().forEach(function (a) {
    if (a.due && a.due >= today) items.push({ d: a.due, n: a.name, s: a.type });
    (a.rds || []).forEach(function (r) { if (r.maturity && r.maturity >= today) items.push({ d: r.maturity, n: a.name + ' · ' + r.label, s: FT.money(r.balance) + ' now, flexible deposits' }); });
    (a.fds || []).forEach(function (f) { if (f.maturity >= today) items.push({ d: f.maturity, n: a.name + ' · ending ' + f.last4, s: FT.money(f.maturityAmount) + ' at maturity, ' + f.rate + '% a year' }); });
  });
  items.sort(function (x, y) { return x.d < y.d ? -1 : 1; }); items = items.slice(0, 5);
  var two = $('twosec'); two.textContent = '';
  if (items.length) {
    two.style.display = 'block'; var hd = el('div', 'head'); hd.appendChild(el('span', 'label', 'Coming up')); hd.appendChild(el('span', 'total')); two.appendChild(hd);
    items.forEach(function (x) { var it = el('div', 'item'), l = el('div'); l.appendChild(document.createTextNode(x.n)); l.appendChild(el('div', 'sub', x.s)); it.appendChild(l); it.appendChild(el('span', 'when', FT.fmtDate(x.d))); two.appendChild(it); });
  } else two.style.display = 'none';
  // history
  var hs = $('histsec'), tb = hs.querySelector('tbody'), thr = hs.querySelector('thead tr');
  thr.textContent = ''; ['Month'].concat(FT.GROUPS.slice(0, 4), ['Net worth']).forEach(function (h) { thr.appendChild(el('th', '', h)); });
  tb.textContent = '';
  months.slice(-4).reverse().forEach(function (m) { var tr = el('tr'); tr.appendChild(el('td', '', m.label)); FT.GROUPS.slice(0, 4).forEach(function (n) { tr.appendChild(el('td', '', FT.money(m.groups[n] || 0))); }); tr.appendChild(el('td', '', FT.money(m.net))); tb.appendChild(tr); });
  var sn = hs.querySelector('.snap'); sn.textContent = 'Update balances'; sn.onclick = function () { location.href = 'entry-form.html#wizard'; };
  $('samplenote').textContent = 'Your data. It is saved only in this browser. Export a backup from the Update page now and then.';
  $('topleft').firstChild.nodeValue = 'Net worth ';
  var oldest = rows.filter(function (r) { return r.age != null; }).reduce(function (m, r) { return Math.max(m, r.age); }, 0);
  var tl = $('topleft'); while (tl.childNodes.length > 2) tl.removeChild(tl.lastChild); tl.appendChild(document.createTextNode(' · oldest balance: ' + oldest + ' days'));
})();

/* Month-end reminder: a banner in the last 3 days of the month or the first 2 of the next, when nothing was entered this month. */
(function () {
  try { var c = JSON.parse(localStorage.getItem('ft.settings') || '{}'); if (c.month === false) return; } catch (e) {}
  if (!window.FT || !FT.live()) return;
  var t = new Date(), dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(), d = t.getDate();
  if (!(d >= dim - 2 || d <= 2)) return;
  var ym = t.toISOString().slice(0, 7), done = FT.rows().some(function (r) { return r.d && r.d.slice(0, 7) === ym; }); if (done) return;
  var b = document.createElement('div'); b.className = 'stale'; b.setAttribute('role', 'status');
  b.innerHTML = '<span class="dot amber"></span><span>It is month end. Take this month\'s snapshot while the balances are fresh.</span>';
  var a = document.createElement('a'); a.href = 'entry-form.html#wizard'; a.textContent = 'Update now'; a.style.cssText = 'margin-left:auto;font:500 13px var(--ui);background:var(--accent);color:#fff;border-radius:6px;padding:8px 14px;text-decoration:none;white-space:nowrap'; b.appendChild(a);
  var w = document.querySelector('.wrap'); w.insertBefore(b, w.firstChild);
})();
