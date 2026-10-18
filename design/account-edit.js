/* Edit one account: balance, FD/RD/policy details, due date. Writes through FT.save(). */
(function () {
  var U = window.FTUI, today = function () { return new Date().toISOString().slice(0, 10); };
  function num(v) { var n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? null : n; }
  window.FTEdit = function (id, done) {
    var a = FT.account(id); if (!a) return;
    var m = U.modal(a.name, a.inst + ' · ' + a.type), b = m.body, fds = (a.fds || []).map(function (x) { return Object.assign({}, x); }), rds = (a.rds || []).map(function (x) { return Object.assign({}, x); });
    var l = FT.last(id), bal = U.input('text', l ? l.v : '', '0'); bal.inputMode = 'decimal';
    b.appendChild(U.field('Balance today (₹)', bal));
    var due = U.input('date', a.due || ''); b.appendChild(U.field('A date to be reminded about (optional)', due));
    var box = U.el('div'); b.appendChild(box);
    var pm, pu;
    if (a.premium || a.type === 'Insurance policy') {
      b.appendChild(U.el('div', 'fth', 'Premium'));
      var g = U.el('div', 'ftg'); pm = U.input('text', a.premium ? a.premium.monthly : '', 'Per month'); pm.inputMode = 'decimal'; pu = U.input('text', a.premium ? a.premium.until : '', 'YYYY-MM');
      g.appendChild(U.field('Per month (₹)', pm)); g.appendChild(U.field('Until (YYYY-MM)', pu)); b.appendChild(g);
    }
    function draw() {
      box.textContent = '';
      if (a.type === 'FD' || fds.length) {
        box.appendChild(U.el('div', 'fth', 'Fixed deposits'));
        fds.forEach(function (f, i) {
          var r = U.el('div', 'ftrow'), mat = f.maturity && f.maturity < today();
          var in1 = U.input('text', f.last4 || '', 'Last 4'), in2 = U.input('text', f.amount || '', 'Amount'), in3 = U.input('date', f.maturity || ''), in4 = U.input('text', f.rate || '', 'Rate %'), in5 = U.input('text', f.maturityAmount || '', 'At maturity');
          in2.inputMode = in4.inputMode = in5.inputMode = 'decimal'; in1.maxLength = 4;
          in1.onchange = function () { f.last4 = in1.value.replace(/\D/g, '').slice(-4); }; in2.onchange = function () { f.amount = num(in2.value) || 0; }; in3.onchange = function () { f.maturity = in3.value; draw(); };
          in4.onchange = function () { f.rate = num(in4.value) || 0; }; in5.onchange = function () { f.maturityAmount = num(in5.value) || 0; };
          [['Last 4 digits', in1], ['Deposited (₹)', in2], ['Matures on', in3], ['Rate %', in4], ['At maturity (₹)', in5]].forEach(function (p) { r.appendChild(U.field(p[0], p[1])); });
          var act = U.el('div'); act.style.cssText = 'grid-column:1/-1;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
          if (mat) { var w = U.el('span', '', 'Matured ' + FT.fmtDate(f.maturity) + '. Has the money moved?'); w.style.cssText = 'font-size:13px;color:var(--amber,#B7791F)'; act.appendChild(w); act.appendChild(U.btn('Money has moved out', 'l', function () { f.closed = true; fds.splice(i, 1); recalc(); draw(); })); act.appendChild(U.btn('Renewed: edit the dates above', 'l', function () { in3.focus(); })); }
          act.appendChild(U.btn('Remove', 'l', function () { fds.splice(i, 1); recalc(); draw(); })); r.appendChild(act); box.appendChild(r);
        });
        box.appendChild(U.btn('+ Add a fixed deposit', 'l', function () { fds.push({ no: fds.length + 1, last4: '', start: today(), amount: 0, rate: 7, maturity: '', maturityAmount: 0 }); draw(); }));
      }
      if (a.type === 'RD' || rds.length) {
        box.appendChild(U.el('div', 'fth', 'Recurring deposits'));
        rds.forEach(function (r0, i) {
          var r = U.el('div', 'ftrow'), n = U.input('text', r0.label || '', 'Name'), bl = U.input('text', r0.balance || '', 'Balance'), mt = U.input('date', r0.maturity || ''); bl.inputMode = 'decimal';
          n.onchange = function () { r0.label = n.value; }; bl.onchange = function () { r0.balance = num(bl.value) || 0; recalc(); }; mt.onchange = function () { r0.maturity = mt.value || null; draw(); };
          r.appendChild(U.field('Name', n)); r.appendChild(U.field('Balance (₹)', bl)); r.appendChild(U.field('Matures on', mt));
          var act = U.el('div'); act.style.cssText = 'grid-column:1/-1;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
          if (r0.maturity && r0.maturity < today()) { var w = U.el('span', '', 'Matured ' + FT.fmtDate(r0.maturity) + '. Has the money moved?'); w.style.cssText = 'font-size:13px;color:var(--amber,#B7791F)'; act.appendChild(w); }
          act.appendChild(U.btn('Remove', 'l', function () { rds.splice(i, 1); recalc(); draw(); })); r.appendChild(act); box.appendChild(r);
        });
        box.appendChild(U.btn('+ Add a recurring deposit', 'l', function () { rds.push({ no: rds.length + 1, label: '', balance: 0, maturity: null }); draw(); }));
      }
    }
    function recalc() { /* suggest the balance from the deposits; the person can still overwrite it */
      if (a.type === 'FD' && !fds.length) bal.value = 0;
      else if (fds.length) bal.value = fds.reduce(function (s, f) { return s + (f.amount || 0); }, 0);
      else if (rds.length && a.type === 'RD') bal.value = rds.reduce(function (s, x) { return s + (x.balance || 0); }, 0);
    }
    draw();
    m.foot.appendChild(U.btn('Cancel', '', m.close));
    m.foot.appendChild(U.btn('Save', 'p', function () {
      a.due = due.value || ''; if (a.fds || fds.length) a.fds = fds; if (a.rds || rds.length) a.rds = rds;
      if (pm) { var pmv = num(pm.value); if (pmv && /^\d{4}-\d{2}$/.test(pu.value.trim())) a.premium = { monthly: pmv, until: pu.value.trim() }; else delete a.premium; }
      var n = num(bal.value), cur = FT.last(id);
      if (n != null && (!cur || cur.v !== n || cur.d !== FT.latestDate())) FT.setValue(id, FT.latestDate() > today() ? FT.latestDate() : today(), n);
      if (n === 0 && cur && cur.v !== 0) a.archived = true; else delete a.archived;
      FT.save(); m.close(); if (done) done(); else location.reload();
    }));
  };
})();
