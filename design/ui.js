/* Small shared UI helpers: modal, buttons. Injects its own styles so any page can use it. */
(function () {
  var css = '.ftov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.ftpn{background:var(--bg);color:var(--ink);border:1px solid var(--border);border-radius:10px;width:100%;max-width:560px;max-height:90vh;overflow:auto;padding:20px;font:400 15px/1.5 var(--ui)}' +
    '.ftpn h2{font:600 18px/1.3 var(--ui);margin:0 0 4px}.ftpn .fts{font-size:13px;color:var(--muted);margin-bottom:16px}' +
    '.ftpn label{display:block;font-size:12px;color:var(--muted);margin:12px 0 4px}' +
    '.ftpn input[type=text],.ftpn input[type=number],.ftpn input[type=date],.ftpn select{width:100%;font:400 15px var(--ui);color:var(--ink);background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px 10px;min-height:36px}' +
    '.ftpn input:focus,.ftpn select:focus,.ftb:focus-visible{outline:2px solid var(--accent);outline-offset:1px}' +
    '.ftpn .ftg{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.ftpn .ftrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;padding:10px 0;border-bottom:1px solid var(--border)}' +
    '.ftpn .ftck{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:14px;color:var(--ink);margin:0}.ftpn .ftck input{width:18px;height:18px;min-height:0}' +
    '.ftpn .fth{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:16px 0 4px}' +
    '.ftft{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;flex-wrap:wrap}' +
    '.ftb{font:500 14px var(--ui);border-radius:6px;padding:8px 14px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--ink);min-height:36px}' +
    '.ftb.p{background:var(--accent);color:#fff;border-color:transparent}:root[data-theme=dark] .ftb.p{color:#14171A}' +
    '.ftb.l{border:0;color:var(--accent);padding:4px 0;min-height:0;font-size:13px}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .ftb.p{color:#14171A}}' +
    '@media (max-width:600px){.ftov{align-items:flex-end;padding:0}.ftpn{max-width:100%;border-radius:10px 10px 0 0;max-height:92vh}.ftpn .ftg{grid-template-columns:1fr}.ftpn input,.ftpn select{font-size:16px!important;min-height:44px!important}.ftb{min-height:44px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(text, cls, fn) { var b = el('button', 'ftb ' + (cls || ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function modal(title, sub) {
    var ov = el('div', 'ftov'), pn = el('div', 'ftpn'); pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-modal', 'true'); pn.setAttribute('aria-label', title);
    pn.appendChild(el('h2', '', title)); if (sub) pn.appendChild(el('div', 'fts', sub));
    var body = el('div'), foot = el('div', 'ftft'); pn.appendChild(body); pn.appendChild(foot); ov.appendChild(pn); document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', onkey); }
    function onkey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onkey); ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    return { body: body, foot: foot, close: close, panel: pn };
  }
  function field(label, input) { var w = el('div'); var l = el('label', '', label); w.appendChild(l); w.appendChild(input); return w; }
  function input(type, value, ph) { var i = document.createElement('input'); i.type = type; if (value != null) i.value = value; if (ph) i.placeholder = ph; return i; }
  window.FTUI = { el: el, btn: btn, modal: modal, field: field, input: input };
})();
