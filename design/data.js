/* Shared reader for the data saved by the Update page (localStorage key ft.v1). Never writes. */
(function () {
  var GROUPS = ['Cash and bank', 'Investments', 'Fixed and retirement', 'Insurance and policies', 'Liabilities'];
  var store = null;
  try { var raw = localStorage.getItem('ft.v1'); if (raw) store = JSON.parse(raw); } catch (e) { store = null; }
  if (!store && window.FT_SEED) { store = JSON.parse(JSON.stringify(window.FT_SEED)); try { localStorage.setItem('ft.v1', JSON.stringify(store)); } catch (e) {} }
  if (store && (!Array.isArray(store.accounts) || !Array.isArray(store.snaps))) store = null;
  var f0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }), f2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var FT = {
    GROUPS: GROUPS,
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
    groupsAt: function (date) {
      var g = {}; store.accounts.forEach(function (a) { var l = FT.last(a.id, date); g[a.group] = (g[a.group] || 0) + (l ? l.v : 0); }); return g;
    },
    netAt: function (date) { var n = 0; store.accounts.forEach(function (a) { var l = FT.last(a.id, date); if (l) n += FT.sign(a) * l.v; }); return n; },
    months: function () {
      var by = {}; store.snaps.forEach(function (s) { var k = s.date.slice(0, 7); if (!by[k] || s.date > by[k]) by[k] = s.date; });
      return Object.keys(by).sort().map(function (k) { var d = by[k]; return { key: k, date: d, label: MON[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4), net: FT.netAt(d), groups: FT.groupsAt(d) }; });
    },
    ageDays: function (d) { var t = new Date(); t.setHours(0, 0, 0, 0); var x = new Date(d + 'T00:00:00'); return Math.max(0, Math.round((t - x) / 864e5)); },
    settings: function () { var s = {}; try { s = JSON.parse(localStorage.getItem('ft.settings') || '{}'); } catch (e) {} return { synced: +s.synced || 7, manual: +s.manual || 35, red: +s.red || 60, short: !!s.short }; },
    sev: function (days) { var c = FT.settings(); return days > c.red ? 'red' : days > c.manual ? 'amber' : ''; },
    rows: function () {
      return FT.accounts().map(function (a) { var l = FT.last(a.id); return { a: a, v: l ? l.v : null, d: l ? l.d : null, age: l ? FT.ageDays(l.d) : null }; });
    },
    fmtDate: function (d) { return d ? (+d.slice(8, 10)) + ' ' + MON[+d.slice(5, 7) - 1] + ' ' + d.slice(0, 4) : ''; }
  };
  window.FT = FT;
})();
