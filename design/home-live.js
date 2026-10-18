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
  var months = FT.months(), last = months[months.length - 1], prev = months.length > 1 ? months[months.length - 2] : null;
  var asof = FT.latestDate(), net = last.net;
  $('fig').textContent = FT.money(net); $('topfig').textContent = FT.money(net);
  document.querySelector('#hero .label').textContent = 'Net worth · ' + FT.fmtDate(asof);
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
  $('views').style.display = 'none';
  // allocation (assets only)
  var g = FT.groupsAt(asof), assets = FT.GROUPS.filter(function (n) { return n !== 'Liabilities' && g[n] > 0; }), tot = assets.reduce(function (s, n) { return s + g[n]; }, 0);
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
  // groups
  var rows = FT.rows(), host = $('groups'); host.textContent = '';
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
      row.appendChild(m); row.appendChild(el('span', 'badge', 'Manual')); row.appendChild(el('div', 'amt', r.v == null ? '–' : FT.money(r.v)));
      var sv = r.age == null ? 'amber' : FT.sev(r.age), ag = el('div', 'age ' + sv); ag.appendChild(el('span', 'dot ' + sv));
      ag.appendChild(document.createTextNode(r.age == null ? 'no value' : r.age === 0 ? 'today' : r.age + 'd ago')); row.appendChild(ag); sec.appendChild(row);
      if (sv) stale.push({ name: r.a.name, age: r.age });
    });
    host.appendChild(sec);
  });
  $('noneline').style.display = rows.some(function (r) { return r.a.group === 'Liabilities'; }) ? 'none' : '';
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
