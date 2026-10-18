/* Shared reader for the data saved by the Update page (localStorage key ft.v1). Never writes. */
(function () {
  var GROUPS = ['Cash and bank', 'Investments', 'Fixed and retirement', 'Insurance and policies', 'Liabilities'];
  var store = null;
  try { var raw = localStorage.getItem('ft.v1'); if (raw) store = JSON.parse(raw); } catch (e) { store = null; }
  if (!store && window.FT_SEED) { store = JSON.parse(JSON.stringify(window.FT_SEED)); try { localStorage.setItem('ft.v1', JSON.stringify(store)); } catch (e) {} }
  if (store && window.FT_SEED && Array.isArray(store.accounts)) {
    store.accounts.forEach(function (a) {
      window.FT_SEED.accounts.forEach(function (sa) {
        if (sa.name !== a.name) return;
        if (!a.fds && sa.fds) a.fds = sa.fds;
        if (!a.premium && sa.premium) a.premium = sa.premium;
        if (!a.rds && sa.rds) { a.rds = sa.rds; a.note = sa.note; }
      });
    });
  }
  if (store && window.FT_SEED && !store.statements && window.FT_SEED.statements) store.statements = window.FT_SEED.statements;
  if (store && (!Array.isArray(store.accounts) || !Array.isArray(store.snaps))) store = null;
  var f0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }), f2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var FT = {
    GROUPS: GROUPS,
    statements: function () { return (store && store.statements) || []; },
    live: function () { return !!(store && store.snaps.length); },
    accounts: function () { return store ? store.accounts.filter(function (a) { return !a.archived; }) : []; },
    sign: function (a) { return a.group === 'Liabilities' ? -1 : 1; },
    num: function (n) { return Math.round(n * 100) % 100 === 0 ? f0.format(n) : f2.format(n); },
    money: function (n) { return (n < 0 ? '−' : '') + '₹' + FT.num(Math.abs(n)); },
    short: function (n) { var a = Math.abs(n); if (a >= 1e7) return '₹' + (a / 1e7).toFixed(2) + ' Cr'; if (a >= 1e5) return '₹' + (a / 1e5).toFixed(2) + ' L'; return FT.money(n); },
    last: function (id, date) {
      var best = null;
      var latest = '';
      store.snaps.forEach(function (s) {
        if ((date && s.date > date) || s.values[id] == null) return;
        if (!best || s.date > latest) { best = { v: s.values[id], d: null }; latest = s.date; }
      });
      if (!best) return null;
      var ent = '';
      store.snaps.forEach(function (s) { if ((!date || s.date <= date) && s.values[id] != null && (!s.entered || s.entered[id]) && s.date > ent) ent = s.date; });
      best.d = ent || latest; return best;
    },
    latestDate: function () { var d = ''; store.snaps.forEach(function (s) { if (s.date > d) d = s.date; }); return d; },
    store: function () { return store; },
    save: function () { try { localStorage.setItem('ft.v1', JSON.stringify(store)); return true; } catch (e) { return false; } },
    account: function (id) { return store.accounts.filter(function (a) { return a.id === id; })[0]; },
    setValue: function (id, date, n) {
      var s = store.snaps.filter(function (x) { return x.date === date; })[0];
      if (!s) { s = { date: date, values: {}, entered: {} }; store.snaps.push(s); store.accounts.forEach(function (a) { var l = FT.last(a.id, date); if (l) s.values[a.id] = l.v; }); }
      s.values[id] = n; (s.entered = s.entered || {})[id] = 1; return FT.save();
    },
    views: function () {
      try { var v = JSON.parse(localStorage.getItem('ft.views')); if (Array.isArray(v)) return v; } catch (e) {}
      return (window.FT_SEED && window.FT_SEED.views) ? JSON.parse(JSON.stringify(window.FT_SEED.views)) : [];
    },
    saveViews: function (v) { try { localStorage.setItem('ft.views', JSON.stringify(v)); } catch (e) {} },
    currentView: function () {
      var n = null; try { n = localStorage.getItem('ft.view'); } catch (e) {}
      if (!n) return null; return FT.views().filter(function (v) { return v.name === n; })[0] || null;
    },
    setView: function (name) { try { if (name) localStorage.setItem('ft.view', name); else localStorage.removeItem('ft.view'); } catch (e) {} },
    exSet: function (view) { var o = {}; if (view) view.exclude.forEach(function (id) { o[id] = 1; }); return o; },
    tier: function (a) {
      var t = a.type;
      if (['Savings', 'Wallet', 'Digital Rupee', 'Cash'].indexOf(t) > -1) return 'now';
      if (['Shares', 'Mutual funds'].indexOf(t) > -1) return 'sell';
      if (['FD', 'RD', 'PPF', 'NPS', 'Insurance policy'].indexOf(t) > -1) return 'locked';
      return a.group === 'Cash and bank' ? 'now' : a.group === 'Investments' ? 'sell' : 'locked';
    },
    groupsAt: function (date, ex) {
      var g = {}; store.accounts.forEach(function (a) { if (ex && ex[a.id]) return; var l = FT.last(a.id, date); g[a.group] = (g[a.group] || 0) + (l ? l.v : 0); }); return g;
    },
    netAt: function (date, ex) { var n = 0; store.accounts.forEach(function (a) { if (ex && ex[a.id]) return; var l = FT.last(a.id, date); if (l) n += FT.sign(a) * l.v; }); return n; },
    months: function (ex) {
      var by = {}; store.snaps.forEach(function (s) { var k = s.date.slice(0, 7); if (!by[k] || s.date > by[k]) by[k] = s.date; });
      return Object.keys(by).sort().map(function (k) { var d = by[k]; return { key: k, date: d, label: MON[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4), net: FT.netAt(d, ex), groups: FT.groupsAt(d, ex) }; });
    },
    ageDays: function (d) { var t = new Date(); t.setHours(0, 0, 0, 0); var x = new Date(d + 'T00:00:00'); return Math.max(0, Math.round((t - x) / 864e5)); },
    settings: function () { var s = {}; try { s = JSON.parse(localStorage.getItem('ft.settings') || '{}'); } catch (e) {} return { synced: +s.synced || 7, manual: +s.manual || 35, red: +s.red || 60, short: !!s.short }; },
    sev: function (days) { var c = FT.settings(); return days > c.red ? 'red' : days > c.manual ? 'amber' : ''; },
    rows: function (ex, withArchived) {
      return (withArchived ? store.accounts : FT.accounts()).filter(function (a) { return !(ex && ex[a.id]); }).map(function (a) { var l = FT.last(a.id); return { a: a, v: l ? l.v : null, d: l ? l.d : null, age: l ? FT.ageDays(l.d) : null }; });
    },
    premiumText: function (a) {
      if (!a.premium) return '';
      var t = new Date(), u = a.premium.until.split('-'), left = (+u[0] - t.getFullYear()) * 12 + (+u[1] - (t.getMonth() + 1));
      return FT.money(a.premium.monthly) + ' a month until ' + MON[+u[1] - 1] + ' ' + u[0] + (left > 0 ? ' (' + left + ' left)' : '');
    },
    premiumTotal: function () { return FT.accounts().reduce(function (s, a) { return s + (a.premium ? a.premium.monthly : 0); }, 0); },
    fmtDate: function (d) { return d ? (+d.slice(8, 10)) + ' ' + MON[+d.slice(5, 7) - 1] + ' ' + d.slice(0, 4) : ''; }
  };
  window.FT = FT;
})();
