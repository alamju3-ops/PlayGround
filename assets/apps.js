/* Apps part 1 — Media & communication. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const esc = window.esc;
  const Apps = window.Apps = window.Apps || {};

  function theme(view, dark) {
    view.dataset.dark = dark ? 'true' : 'false';
    window.Sim.setStatusTheme(dark ? 'light' : 'dark');
  }
  function cleanupBag() {
    const fns = [];
    return { add: (fn) => fns.push(fn), run: () => fns.forEach((f) => { try { f(); } catch (e) { console.error(e); } }) };
  }
  function nav(title, right = '', left = '') {
    return `<div class="app-nav"><button class="nav-btn" data-nav-left>${left}</button><span class="nav-title">${title}</span><button class="nav-btn" data-nav-right>${right}</button></div>`;
  }

  /* ---------------- generated photography ---------------- */
  const ART = [
    { name: 'Aurora', a: '#ff9a3d', b: '#7a1aff', c: '#00c6ff' },
    { name: 'Tide', a: '#6fffd2', b: '#0090ff', c: '#04264f' },
    { name: 'Ember', a: '#ffd166', b: '#ff5e5b', c: '#4a1942' },
    { name: 'Graphite', a: '#c9c9d1', b: '#5a5a63', c: '#17171a' },
    { name: 'Blossom', a: '#ffd0dd', b: '#ff6f91', c: '#87324f' },
    { name: 'Grove', a: '#d9ffcf', b: '#5eead4', c: '#115e59' },
    { name: 'Dusk', a: '#ff7043', b: '#8e24aa', c: '#1a1024' },
    { name: 'Frost', a: '#e8f4ff', b: '#82c8ff', c: '#0b3d75' },
    { name: 'Orchid', a: '#e0aaff', b: '#9d4edd', c: '#240046' },
    { name: 'Citrus', a: '#fff176', b: '#ffb300', c: '#7a3e00' },
    { name: 'Lagoon', a: '#b2fefa', b: '#0ed2f7', c: '#003b5c' },
    { name: 'Cocoa', a: '#f5d5b8', b: '#c08552', c: '#4b2e1d' },
    { name: 'Neon', a: '#f72585', b: '#7209b7', c: '#10002b' },
    { name: 'Sage', a: '#e7f5dc', b: '#8fbc8f', c: '#2f4f3e' },
    { name: 'Midnight', a: '#7289da', b: '#2c2f6b', c: '#05060f' },
    { name: 'Sunrise', a: '#ffe29f', b: '#ffa99f', c: '#a06cd5' },
    { name: 'Marble', a: '#f8f9fa', b: '#ced4da', c: '#495057' },
    { name: 'Solar', a: '#fff3b0', b: '#ff9f0a', c: '#6a1b00' }
  ];

  function artSvg(i) {
    const p = ART[i % ART.length];
    const rot = (i * 37) % 360;
    const cx = 30 + (i * 13) % 40;
    const cy = 25 + (i * 19) % 45;
    const shapes = i % 3 === 0
      ? `<circle cx="${cx}%" cy="${cy}%" r="26%" fill="${p.c}" opacity=".55"/><circle cx="${100 - cx}%" cy="${100 - cy}%" r="18%" fill="#fff" opacity=".22"/>`
      : i % 3 === 1
        ? `<path d="M0 ${60 + i % 12} Q 25 ${20 + i % 22} 50 ${48 + i % 14} T 100 ${36 + i % 20} V 100 H 0 Z" fill="${p.c}" opacity=".5"/><circle cx="${cx}%" cy="${cy}%" r="20%" fill="#fff" opacity=".18"/>`
        : `<rect x="${10 + i % 20}%" y="${15 + i % 30}%" width="42%" height="42%" rx="40" fill="${p.c}" opacity=".45" transform="rotate(${rot} 300 300)"/><circle cx="${cx}%" cy="${cy}%" r="14%" fill="#fff" opacity=".3"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p.a}"/><stop offset=".55" stop-color="${p.b}"/><stop offset="1" stop-color="${p.c}"/>
      </linearGradient>
      <radialGradient id="r" cx="25%" cy="18%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <rect width="600" height="600" fill="url(#g)"/>${shapes}<rect width="600" height="600" fill="url(#r)"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function stockPhotos() {
    return ART.map((p, i) => ({ id: 'art' + i, src: artSvg(i), title: p.name, stock: true }));
  }
  window.SimArt = { artSvg, stockPhotos };

  /* =========================================================
     PHONE
     ========================================================= */
  Apps.phone = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('phone-app');
      let tab = 'keypad';
      let dial = '';
      let call = null;
      const bag = cleanupBag();

      const contacts = [
        { name: 'Emma', sub: 'mobile', color: 'linear-gradient(150deg,#ff9a8b,#ff6a88)', initials: 'E' },
        { name: 'Alex Chen', sub: 'iPhone', color: 'linear-gradient(150deg,#6a8dff,#3b5bdb)', initials: 'A' },
        { name: 'Mom', sub: 'home', color: 'linear-gradient(150deg,#ffb88c,#ff8b6b)', initials: 'M' },
        { name: 'Design Team', sub: 'work', color: 'linear-gradient(150deg,#7ee8c4,#28b487)', initials: 'D' },
        { name: 'Apple Support', sub: 'toll free', color: 'linear-gradient(150deg,#8e8e93,#48484a)', initials: 'A' }
      ];

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="large-title pt">Phone</div>
        <div id="phoneContent" style="flex:1;display:flex;flex-direction:column"></div>
        <div class="phone-tabs">
          <button data-tab="keypad" class="active"><span class="pi">⌨︎</span>Keypad</button>
          <button data-tab="recents"><span class="pi">🕘</span>Recents</button>
          <button data-tab="contacts"><span class="pi">👤</span>Contacts</button>
          <button data-tab="voicemail"><span class="pi">◉</span>Voicemail</button>
        </div>
        <div class="call-screen" id="callScreen" style="display:none"></div>
      </div>`;

      const content = $('#phoneContent', view);

      function render() {
        $$('.phone-tabs button', view).forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
        if (tab === 'keypad') {
          content.innerHTML = `<div class="keypad-wrap">
            <div class="dial-display" id="dialDisplay">${dial ? esc(dial) : '<small>Enter a number</small>'}</div>
            <div class="keypad">${[
              ['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
              ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']
            ].map(([k, sub]) => `<button class="key ${k === '0' ? 'zero' : ''}" data-key="${k}">${k}${sub ? `<small>${sub}</small>` : ''}</button>`).join('')}</div>
            <div class="call-row">
              <button class="call-btn delete" data-key="del" aria-label="Delete">⌫</button>
              <button class="call-btn" data-call aria-label="Call">📞</button>
              <span style="width:60px"></span>
            </div>
          </div>`;
        } else if (tab === 'recents') {
          const recents = ctx.db.get('recentCalls', []);
          content.innerHTML = `<div style="flex:1;overflow-y:auto"><div class="section-label">Recent</div>
            <div class="list-card">${recents.map((r) => `
              <button class="list-row" data-recall="${esc(r.number)}" data-name="${esc(r.name)}">
                <span class="lr-icon" style="background:${r.missed ? '#ff453a' : '#30d158'}">${r.type === 'missed' ? '↙' : '↗'}</span>
                <span class="lr-main"><b style="${r.missed ? 'color:#ff453a' : ''}">${esc(r.name)}</b><span>${esc(r.type)} · ${esc(r.time)}</span></span>
                <span class="chev">ⓘ</span>
              </button>`).join('')}</div></div>`;
        } else if (tab === 'contacts') {
          content.innerHTML = `<div style="flex:1;overflow-y:auto"><div class="section-label">Contacts</div>
            <div class="list-card">${contacts.map((c) => `
              <button class="list-row" data-contact="${esc(c.name)}">
                <span class="msg-avatar" style="background:${c.color};width:32px;height:32px;font-size:14px">${c.initials}</span>
                <span class="lr-main"><b>${esc(c.name)}</b><span>${esc(c.sub)}</span></span>
                <span class="chev">📞</span>
              </button>`).join('')}</div></div>`;
        } else {
          content.innerHTML = `<div style="flex:1;display:grid;place-items:center;color:#8e8e93;font-size:14px;text-align:center;padding:30px">
            <div><div style="font-size:42px;margin-bottom:8px">◉</div>No voicemail<br><span style="font-size:12px">Voicemails will appear here.</span></div></div>`;
        }
      }

      function renderDial() {
        const d = $('#dialDisplay', view);
        if (d) d.innerHTML = dial ? esc(dial) : '<small>Enter a number</small>';
        const callBtn = $('[data-call]', view);
        if (callBtn) callBtn.style.opacity = dial ? '1' : '.5';
      }

      function startCall(name, number) {
        const scr = $('#callScreen', view);
        scr.style.display = 'flex';
        scr.innerHTML = `<div class="call-avatar">${esc((name || 'Unknown').charAt(0))}</div>
          <div class="call-name">${esc(name || number || 'Unknown')}</div>
          <div class="call-status" id="callStatus">calling…</div>
          <div class="call-grid">
            <button data-cc="mute"><span class="cb">🔇</span>mute</button>
            <button data-cc="keypad"><span class="cb">⌨︎</span>keypad</button>
            <button data-cc="audio"><span class="cb">🔊</span>audio</button>
            <button data-cc="add"><span class="cb">＋</span>add call</button>
            <button data-cc="facetime"><span class="cb">🎥</span>FaceTime</button>
            <button data-cc="contacts"><span class="cb">👤</span>contacts</button>
          </div>
          <button class="call-end" data-end aria-label="End call"><svg viewBox="0 0 24 24"><path d="M3.6 14.9c4.8-4.7 12-4.7 16.8 0l-2 2.5c-.5.6-1.2.8-1.9.5l-2.3-1.1c-.5-.2-.8-.7-.8-1.2v-1.4c-2.5-.8-5.2-.8-7.7 0v1.4c0 .5-.3 1-.8 1.2l-2.3 1.1c-.7.3-1.4.1-1.9-.5l-2-2.5Z" fill="currentColor"/></svg></button>`;
        ctx.audio.tone(440, 0.5, 'sine', 0.005);
        const started = Date.now();
        const status = $('#callStatus', view);
        setTimeout(() => {
          if (!status || !status.isConnected) return;
          status.textContent = '00:00';
          call = setInterval(() => {
            const s = Math.floor((Date.now() - started) / 1000);
            if (status.isConnected) status.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
          }, 1000);
          window.Sim.startCall(name || number, number);
        }, 1700);
      }

      function endCall() {
        clearInterval(call); call = null;
        window.Sim.endCall();
        const scr = $('#callScreen', view);
        if (scr) scr.style.display = 'none';
        const recents = ctx.db.get('recentCalls', []);
        recents.unshift({ name: name || dial, number: dial, type: 'outgoing', time: window.Sim.fmtTime(), missed: false });
        ctx.db.set('recentCalls', recents.slice(0, 12));
      }

      let name = '';
      $$('.phone-tabs button', view).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
      content.addEventListener('click', (e) => {
        const key = e.target.closest('[data-key]');
        if (key) {
          const k = key.dataset.key;
          if (k === 'del') { dial = dial.slice(0, -1); renderDial(); ctx.audio.click(500); }
          else {
            if (dial.length < 20) dial += k;
            renderDial(); ctx.audio.dtmf(k);
          }
          return;
        }
        if (e.target.closest('[data-call]') && dial) {
          name = '';
          startCall(dial, dial);
          return;
        }
        const recall = e.target.closest('[data-recall]');
        if (recall) { dial = recall.dataset.recall; name = recall.dataset.name; startCall(name, dial); return; }
        const contact = e.target.closest('[data-contact]');
        if (contact) {
          const c = contacts.find((x) => x.name === contact.dataset.contact);
          name = c.name; dial = '+1 (415) 555-01' + (10 + contacts.indexOf(c));
          startCall(c.name, dial);
        }
      });
      view.addEventListener('click', (e) => {
        if (e.target.closest('[data-end]')) { endCall(); return; }
        const cc = e.target.closest('[data-cc]');
        if (cc) {
          cc.classList.toggle('on');
          ctx.audio.click(760);
        }
      });
      render();
      return () => { clearInterval(call); bag.run(); };
    }
  };

  /* =========================================================
     MESSAGES
     ========================================================= */
  Apps.messages = {
    render(view, ctx) {
      theme(view, false);
      let threads = ctx.db.get('messages', []);
      const bag = cleanupBag();
      let active = null;

      const replies = ['Sounds great!', 'Haha, love that 😄', 'I’ll be there!', 'Let me check and get back to you.', 'Yes! The camera on this thing is amazing.', 'Perfect, see you soon 🙌', 'Can you send me the photos?', 'Just saw it — wow.', 'That works for me.', 'Let’s do it 🎉'];

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 16px 4px">
          <button class="nav-btn" data-compose style="color:#0a84ff">✎</button>
          <span class="nav-title">Messages</span>
          <button class="nav-btn" style="color:#0a84ff">⋯</button>
        </div>
        <div class="app-search" style="margin-top:6px">
          <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" stroke-width="2"/></svg>
          <input id="msgSearch" placeholder="Search" aria-label="Search messages" />
        </div>
        <div class="msg-list" id="msgList" style="flex:1;overflow-y:auto"></div>
        <div class="chat-view" id="chatView" style="display:none"></div>
      </div>`;

      function avatar(t) {
        return `<span class="msg-avatar" style="background:${t.color}">${t.initials}</span>`;
      }
      function renderList(filter = '') {
        const f = filter.toLowerCase();
        const list = threads.filter((t) => !f || t.name.toLowerCase().includes(f) || t.messages.some((m) => m.text.toLowerCase().includes(f)));
        $('#msgList', view).innerHTML = list.map((t) => {
          const last = t.messages[t.messages.length - 1] || { text: '' };
          return `<button class="msg-row" data-thread="${t.id}">
            ${avatar(t)}
            <span class="msg-main"><b>${esc(t.name)}</b><p>${esc(last.text)}</p></span>
            <span class="msg-meta"><span>${esc(t.time)}</span>${t.unread ? '<span class="unread-dot"></span>' : ''}</span>
          </button>`;
        }).join('') || `<div class="empty-state"><span class="big">💬</span>No conversations</div>`;
      }

      function openChat(id) {
        const t = threads.find((x) => x.id === id);
        if (!t) return;
        active = id;
        t.unread = false;
        ctx.db.set('messages', threads);
        ctx.refreshHome();
        const cv = $('#chatView', view);
        cv.style.display = 'flex';
        cv.innerHTML = `
          <div class="chat-head">
            <button class="back" data-close-chat>‹</button>
            ${avatar(t)}
            <b>${esc(t.name)}</b>
          </div>
          <div class="chat-body" id="chatBody">${renderBubbles(t)}</div>
          <div class="chat-input">
            <input id="chatInput" placeholder="iMessage" aria-label="Message" autocomplete="off" />
            <button class="send-btn" id="sendBtn" disabled aria-label="Send">↑</button>
          </div>`;
        const input = $('#chatInput', view);
        const send = $('#sendBtn', view);
        input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSend(); });
        send.addEventListener('click', doSend);
        scrollChat();
        setTimeout(() => { if (input.isConnected) input.focus(); }, 220);

        function doSend() {
          const text = input.value.trim();
          if (!text) return;
          t.messages.push({ from: 'me', text, at: window.Sim.fmtTime() });
          t.time = window.Sim.fmtTime(); t.unread = false;
          ctx.db.set('messages', threads);
          input.value = ''; send.disabled = true;
          refreshBubbles();
          ctx.audio.tone(880, .08, 'sine', .025);
          const body = $('#chatBody', view);
          const typing = document.createElement('div');
          typing.className = 'typing'; typing.id = 'typing';
          typing.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(typing); scrollChat();
          const reply = replies[Math.floor(Math.random() * replies.length)];
          const timer = setTimeout(() => {
            const ty = $('#typing', view); if (ty) ty.remove();
            t.messages.push({ from: 'them', text: reply, at: window.Sim.fmtTime() });
            t.time = window.Sim.fmtTime();
            ctx.db.set('messages', threads);
            if (active === id) refreshBubbles();
            ctx.refreshHome();
          }, 1200 + Math.random() * 900);
          bag.add(() => clearTimeout(timer));
          ctx.refreshHome();
        }
        ctx.refreshHome();
      }

      function renderBubbles(t) {
        return t.messages.map((m) => `<div class="bubble ${m.from === 'me' ? 'me' : 'them'}">${esc(m.text)}<span class="bt">${esc(m.at || '')}</span></div>`).join('');
      }
      function refreshBubbles() {
        const t = threads.find((x) => x.id === active); if (!t) return;
        const body = $('#chatBody', view); if (!body) return;
        body.innerHTML = renderBubbles(t);
        scrollChat();
      }
      function scrollChat() {
        const body = $('#chatBody', view);
        if (body) requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
      }

      view.addEventListener('click', (e) => {
        const row = e.target.closest('[data-thread]');
        if (row) { openChat(row.dataset.thread); return; }
        if (e.target.closest('[data-close-chat]')) {
          $('#chatView', view).style.display = 'none'; active = null; renderList($('#msgSearch', view).value); return;
        }
        if (e.target.closest('[data-compose]')) {
          const name = prompt('New message to:');
          if (!name) return;
          const t = { id: 'c' + Date.now(), name, color: 'linear-gradient(150deg,#8e8e93,#48484a)', initials: name.charAt(0).toUpperCase(), unread: false, time: 'now', messages: [{ from: 'them', text: `Hi! This is ${name}.`, at: window.Sim.fmtTime() }] };
          threads.unshift(t); ctx.db.set('messages', threads); renderList(); openChat(t.id);
        }
      });
      $('#msgSearch', view).addEventListener('input', (e) => renderList(e.target.value));

      const onOpenChat = (e) => { if (!view.isConnected) return; openChat(e.detail); };
      document.addEventListener('sim:openchat', onOpenChat);
      bag.add(() => document.removeEventListener('sim:openchat', onOpenChat));

      renderList();
      return () => bag.run();
    }
  };

  /* =========================================================
     SAFARI
     ========================================================= */
  Apps.safari = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('safari-app');
      const bag = cleanupBag();
      let history = [];
      let page = 'start';
      let query = '';

      const PAGES = {
        apple: {
          url: 'apple.com', html: `<div class="safari-page">
            <div class="sp-kicker">Apple</div><h2>iPhone 18 Pro</h2>
            <p>Built for Apple Intelligence. Forged in titanium. The most powerful iPhone ever made.</p>
            <div class="hero" style="background:linear-gradient(150deg,#ff9a3d,#ff2f7a 45%,#3d2bff)">📱</div>
            <h3>Designed to be extraordinary</h3>
            <p>The new 48MP Fusion camera system captures incredible detail in any light. A18 Pro delivers console-level performance with astonishing efficiency. And the all-day battery keeps up with everything you do.</p>
            <div class="hero" style="height:90px;background:linear-gradient(120deg,#0f172a,#334155);color:#fff;font-size:14px">◆ From $999 or $41.62/mo.</div>
            <p style="font-size:12px;color:#8e8e93">This is a built-in demo page inside the simulator. Actual browsing is represented with realistic, offline content.</p>
          </div>`
        },
        wikipedia: {
          url: 'wikipedia.org/wiki/IPhone', html: `<div class="safari-page">
            <div class="sp-kicker">Wikipedia</div><h2>iPhone</h2>
            <p><b>The iPhone</b> is a line of smartphones developed and marketed by Apple. It combines a mobile phone, a digital camera, a music player, and a touchscreen computer into one device.</p>
            <h3>History</h3>
            <p>The first iPhone was announced in January 2007 and released later that year. Since then, Apple has released new generations annually, introducing features such as the App Store, Retina display, Face ID, and the Dynamic Island.</p>
            <h3>Design</h3>
            <p>Modern iPhones feature an edge-to-edge Super Retina XDR display, a titanium or aluminum frame, Ceramic Shield glass, and the A-series family of chips.</p>
            <p style="font-size:12px;color:#8e8e93">Demo article — content paraphrased for this simulator.</p>
          </div>`
        },
        weather: {
          url: 'weather.com', html: `<div class="safari-page"><div class="sp-kicker">Weather</div><h2>Cupertino, CA</h2>
            <div class="hero" style="height:120px;background:linear-gradient(150deg,#4fa8ff,#1b69dc);color:#fff;font-size:40px">72° ☀️</div>
            <p>Sunny. High 78°, low 61°. Winds light and variable. Clear skies through the evening.</p>
            <h3>Hourly</h3><p>Now 72° · 1PM 74° · 2PM 76° · 3PM 77° · 4PM 78° · 5PM 76°</p></div>`
        },
        simulator: {
          url: 'iphone18.sim', html: `<div class="safari-page"><div class="sp-kicker">Simulator</div><h2>You found the built-in web</h2>
            <p>This Safari is a fully offline demonstration browser. Tap the address bar to search, or open one of the favorites on the start page.</p>
            <h3>Try this</h3>
            <p>Search for “iPhone 18”, “sketchbook”, or “weather” to generate results. Every page opens instantly — no network required.</p>
            <div class="hero" style="height:110px;background:linear-gradient(140deg,#0a84ff,#5e5ce6,#bf5af2);color:#fff;font-size:32px">Safari</div></div>`
        }
      };

      view.innerHTML = `
        <div class="safari-top">
          <div class="safari-url">
            <span style="font-size:11px;color:#8e8e93">Aa</span>
            <input id="safariInput" value="" placeholder="Search or enter website name" aria-label="Address" />
            <span style="font-size:12px;color:#8e8e93">⟳</span>
          </div>
        </div>
        <div class="safari-content" id="safariContent"></div>
        <div class="safari-bottom">
          <button id="safariBack" style="opacity:.9">‹</button>
          <button id="safariFwd" style="opacity:.9">›</button>
          <button id="safariShare">□↑</button>
          <button id="safariBook">▢</button>
          <button class="tabs">1</button>
        </div>`;

      function startPage() {
        return `<div class="safari-start">
          <h3>Favorites</h3>
          <div class="fav-grid">
            ${[['apple', 'Apple', '🍎'], ['wikipedia', 'Wikipedia', 'W'], ['weather', 'Weather', '☀️'], ['simulator', 'Simulator', '◈']].map(([k, n, i]) => `
              <button class="fav" data-go="${k}"><span class="fb">${i}</span>${n}</button>`).join('')}
            ${['S', 'N', 'M', 'X'].map((n, i) => `<button class="fav" data-search="${['sketchbook', 'news', 'music', 'iPhone 18'][i]}"><span class="fb">${n}</span>${['Sketch', 'News', 'Music', 'iPhone'][i]}</button>`).join('')}
          </div>
          <h3>Privacy Report</h3>
          <div class="list-card" style="margin:0 0 20px"><div class="list-row"><span class="lr-icon" style="background:#30d158">🛡</span><span class="lr-main"><b>14 trackers prevented</b><span>In the last 7 days</span></span></div></div>
          <h3>Reading List</h3>
          <div class="list-card" style="margin:0"><div class="list-row"><span class="lr-icon" style="background:#ff9f0a">📖</span><span class="lr-main"><b>Designing for the Dynamic Island</b><span>developer.apple.com</span></span></div></div>
        </div>`;
      }

      function searchPage(q) {
        const results = [
          { u: 'apple.com › iphone-18', t: `iPhone 18 Pro — ${q}`, d: 'Built for Apple Intelligence with the A18 Pro chip, a 48MP Fusion camera, and all-day battery life.' },
          { u: 'en.wikipedia.org › wiki › ' + q.replace(/\s+/g, '_'), t: `${q} - Wikipedia`, d: `An overview of ${q}, including history, design, features, and cultural impact.` },
          { u: 'news.example.com › tech', t: `Everything we know about ${q}`, d: `The latest reporting and hands-on impressions covering ${q}, updated today.` },
          { u: 'reviews.example.com', t: `${q} review: a closer look`, d: `Our in-depth review of ${q}, with benchmarks, camera samples, and battery testing.` }
        ];
        return `<div class="safari-page"><div class="sp-kicker">Search results</div><h2>${esc(q)}</h2>
          ${results.map((r) => `<button class="search-result" data-result="${esc(r.t)}" style="display:block;width:100%;text-align:left;background:none">
            <div class="sr-url">${esc(r.u)}</div><h4>${esc(r.t)}</h4><p>${esc(r.d)}</p></button>`).join('')}
          <p style="font-size:11px;color:#8e8e93;margin-top:18px">Demo results, generated locally by the simulator.</p></div>`;
      }

      function render() {
        const content = $('#safariContent', view);
        const input = $('#safariInput', view);
        if (page === 'start') {
          content.innerHTML = startPage();
          input.value = '';
        } else if (page === 'search') {
          content.innerHTML = searchPage(query);
          input.value = query;
        } else {
          content.innerHTML = PAGES[page].html;
          input.value = PAGES[page].url;
        }
        content.scrollTop = 0;
        $('#safariBack', view).style.opacity = history.length ? '1' : '.35';
      }

      function go(key) {
        if (page !== 'start') history.push({ page, query });
        page = key;
        render();
      }

      view.addEventListener('click', (e) => {
        const fav = e.target.closest('[data-go]');
        if (fav) { go(fav.dataset.go); return; }
        const s = e.target.closest('[data-search]');
        if (s) { history.push({ page, query }); page = 'search'; query = s.dataset.search; render(); return; }
        if (e.target.closest('[data-result]')) { go('apple'); return; }
        if (e.target.closest('#safariBack')) {
          if (history.length) { const p = history.pop(); page = p.page; query = p.query || query; render(); }
          return;
        }
        if (e.target.closest('#safariShare')) { ctx.toast('Page added to Reading List', '📖'); return; }
        if (e.target.closest('#safariFwd')) { ctx.toast('No forward history', '›'); return; }
        if (e.target.closest('#safariBook')) { go('start'); return; }
      });

      $('#safariInput', view).addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const v = e.target.value.trim();
        if (!v) return;
        const map = { 'apple.com': 'apple', 'wikipedia.org': 'wikipedia', 'weather.com': 'weather' };
        if (map[v.toLowerCase()]) { go(map[v.toLowerCase()]); return; }
        history.push({ page, query }); query = v; page = 'search'; render();
        e.target.blur();
      });

      render();
      return () => bag.run();
    }
  };

  /* =========================================================
     CAMERA
     ========================================================= */
  Apps.camera = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('camera-app');
      const bag = cleanupBag();
      let stream = null, facing = 'environment', mode = 'Photo';
      let flashOn = false;

      view.innerHTML = `
        <div class="cam-stage" id="camStage"><div class="cam-fallback"><div class="cf-inner"><div class="cf-art">📷</div><b>Camera preview</b><span style="font-size:11px;max-width:210px;line-height:1.5">Allow camera access or capture a generated photo</span></div></div></div>
        <div class="cam-top"><span class="cam-chip">${ctx.now().getHours() < 19 ? '☀︎ Outdoor' : '☾ Night'}</span><span class="cam-chip" id="camFacing">Rear</span></div>
        <div class="cam-bottom">
          <div class="cam-zoom"><span data-zoom="0.5">.5×</span><span class="active" data-zoom="1">1×</span><span data-zoom="3">3×</span></div>
          <div class="cam-modes">${['Video', 'Portrait', 'Photo', 'Pano'].map((m) => `<span class="${m === 'Photo' ? 'active' : ''}" data-mode="${m}">${m}</span>`).join('')}</div>
          <div class="cam-controls">
            <button class="cam-gallery-btn" id="camGallery"></button>
            <button class="shutter" id="shutter" aria-label="Take photo"></button>
            <button class="cc-side" id="camFlip" aria-label="Flip camera">⇄</button>
          </div>
        </div>
        <div class="cam-flash" id="camFlash"></div>
        <div class="cam-thumb-toast" id="camThumb"></div>`;

      const stage = $('#camStage', view);
      const gallery = $('#camGallery', view);
      const photos = ctx.db.get('photos', []);
      if (photos.length) gallery.innerHTML = `<img src="${photos[0].src}" alt="Latest photo" />`;
      else gallery.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(140deg,#7a2cf0,#ff2f7a)"></div>`;

      async function startCamera() {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unsupported');
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 } }, audio: false });
          stage.innerHTML = `<video autoplay playsinline muted id="camVideo"></video>`;
          const v = $('#camVideo', view);
          v.srcObject = stream;
          v.play().catch(() => { });
          stage.classList.toggle('front', facing === 'user');
        } catch (err) {
          stage.innerHTML = `<div class="cam-fallback"><div class="cf-inner"><div class="cf-art">📷</div><b>Camera unavailable</b><span style="font-size:11px;max-width:210px;line-height:1.5">Tap the shutter to capture a generated photo instead</span></div></div>`;
        }
      }

      function capture() {
        let src = '';
        const video = $('#camVideo', view);
        if (video && video.videoWidth) {
          const c = document.createElement('canvas');
          c.width = video.videoWidth; c.height = video.videoHeight;
          const g = c.getContext('2d');
          if (facing === 'user') { g.translate(c.width, 0); g.scale(-1, 1); }
          g.drawImage(video, 0, 0);
          src = c.toDataURL('image/jpeg', 0.82);
        } else {
          const idx = Math.floor(Math.random() * 18);
          src = window.SimArt.artSvg(idx);
        }
        const shot = { id: 'p' + Date.now(), src, at: Date.now() };
        const list = ctx.db.get('photos', []);
        list.unshift(shot);
        ctx.db.set('photos', list.slice(0, 60));
        gallery.innerHTML = `<img src="${src}" alt="Latest photo" />`;
        const thumb = $('#camThumb', view);
        thumb.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="Captured" />`;
        thumb.classList.remove('show'); void thumb.offsetWidth; thumb.classList.add('show');
        $('#camFlash', view).classList.remove('fire'); void $('#camFlash', view).offsetWidth; $('#camFlash', view).classList.add('fire');
        ctx.audio.tone(1200, 0.06, 'square', 0.02);
        ctx.toast('Photo saved to Recents', '🖼️');
      }

      view.addEventListener('click', (e) => {
        if (e.target.closest('#shutter')) { capture(); return; }
        if (e.target.closest('#camGallery')) { ctx.open('photos'); return; }
        if (e.target.closest('#camFlip')) {
          facing = facing === 'environment' ? 'user' : 'environment';
          $('#camFacing', view).textContent = facing === 'user' ? 'Front' : 'Rear';
          if (stream) stream.getTracks().forEach((t) => t.stop());
          startCamera();
          return;
        }
        const m = e.target.closest('[data-mode]');
        if (m) {
          mode = m.dataset.mode;
          $$('.cam-modes span', view).forEach((s) => s.classList.toggle('active', s === m));
          return;
        }
        const z = e.target.closest('[data-zoom]');
        if (z) {
          $$('.cam-zoom span', view).forEach((s) => s.classList.toggle('active', s === z));
          const scaler = $('#camVideo', view);
          if (scaler) scaler.style.transform = `scale(${z.dataset.zoom})`;
          return;
        }
      });

      startCamera();
      return () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        bag.run();
      };
    }
  };

  /* =========================================================
     PHOTOS
     ========================================================= */
  Apps.photos = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('photos-app');
      const bag = cleanupBag();
      let tab = 'library';
      let current = 0;

      const stock = window.SimArt.stockPhotos();
      function allPhotos() {
        const captured = ctx.db.get('photos', []).map((p) => ({ ...p, title: 'Recents' }));
        return captured.concat(stock);
      }

      view.innerHTML = `
        <div class="app-body no-pad" style="display:flex;flex-direction:column">
          <div class="app-nav" style="height:auto;padding:56px 16px 4px">
            <button class="nav-btn"></button>
            <span class="nav-title">Photos</span>
            <button class="nav-btn">Select</button>
          </div>
          <div class="seg" style="margin:4px 16px 12px" id="photoSeg">
            <button class="active" data-ptab="library">Library</button>
            <button data-ptab="albums">Albums</button>
          </div>
          <div id="photoContent" style="flex:1;overflow-y:auto"></div>
          <div class="photo-viewer" id="photoViewer" style="display:none"></div>
        </div>`;

      function render() {
        $$('#photoSeg button', view).forEach((b) => b.classList.toggle('active', b.dataset.ptab === tab));
        const el = $('#photoContent', view);
        if (tab === 'albums') {
          const list = allPhotos();
          el.innerHTML = `<div class="photo-albums">
            <button class="album" data-album="Recents"><img src="${list[0].src}" alt=""><b>Recents</b></button>
            <button class="album" data-album="Favorites"><img src="${list[3].src}" alt=""><b>Favorites</b></button>
            <button class="album" data-album="Wallpapers"><img src="${list[1].src}" alt=""><b>Wallpapers</b></button>
            <button class="album" data-album="Camera"><img src="${list[5].src}" alt=""><b>Camera</b></button>
          </div>
          <div class="section-label">Media Types</div>
          <div class="list-card" style="margin:0 16px 24px">
            <div class="list-row"><span class="lr-icon" style="background:#0a84ff">▣</span><span class="lr-main"><b>Photos</b><span>${list.length} items</span></span><span class="chev">›</span></div>
            <div class="list-row"><span class="lr-icon" style="background:#bf5af2">◉</span><span class="lr-main"><b>Live Photos</b><span>${Math.max(2, list.length - 4)} items</span></span><span class="chev">›</span></div>
          </div>`;
        } else {
          const list = allPhotos();
          el.innerHTML = `<div class="photo-grid">${list.map((p, i) => `
            <button class="photo-cell" data-photo="${i}"><img loading="lazy" src="${p.src}" alt="${esc(p.title)}"></button>`).join('')}</div>
            <div style="text-align:center;color:#8e8e93;font-size:11px;padding:18px">${list.length} Photos</div>`;
        }
      }

      function openViewer(i) {
        current = i;
        const v = $('#photoViewer', view);
        v.style.display = 'flex';
        const p = allPhotos()[i];
        const canDelete = !p.stock;
        v.innerHTML = `
          <div class="pv-top"><button data-pv-close>‹ Library</button><span>${esc(p.title)}</span><button data-pv-wallpaper>⋯</button></div>
          <div class="pv-img"><img src="${p.src}" alt="${esc(p.title)}"></div>
          <div class="pv-bottom"><button data-pv-share>□↑</button><button data-pv-wallpaper>□</button>${canDelete ? '<button data-pv-delete>🗑</button>' : '<button>♡</button>'}</div>`;
        function step(d) {
          const list = allPhotos();
          openViewer((i + d + list.length) % list.length);
        }
        v.onclick = (e) => {
          if (e.target.closest('[data-pv-close]')) { v.style.display = 'none'; return; }
          if (e.target.closest('[data-pv-delete]')) {
            const photos = ctx.db.get('photos', []);
            photos.splice(i, 1); ctx.db.set('photos', photos);
            v.style.display = 'none'; render(); ctx.toast('Photo deleted', '🗑'); return;
          }
          if (e.target.closest('[data-pv-wallpaper]')) {
            ctx.wallpaper((p.src.startsWith('data:image/svg') ? 'photo:' + p.src : 'photo:' + p.src));
            ctx.toast('Wallpaper set', '✓'); return;
          }
          if (e.target.closest('[data-pv-share]')) { ctx.toast('Shared with AirDrop', '□↑'); return; }
          if (e.target.closest('.pv-img')) {
            const r = v.querySelector('.pv-img').getBoundingClientRect();
            if (e.clientX < r.left + r.width / 2) step(-1); else step(1);
          }
        };
      }

      view.addEventListener('click', (e) => {
        const t = e.target.closest('[data-ptab]');
        if (t) { tab = t.dataset.ptab; render(); return; }
        const cell = e.target.closest('[data-photo]');
        if (cell) { openViewer(+cell.dataset.photo); return; }
        const alb = e.target.closest('[data-album]');
        if (alb) { tab = 'library'; render(); ctx.toast('Album opened', '▣'); }
      });

      render();
      return () => bag.run();
    }
  };

  /* =========================================================
     MUSIC
     ========================================================= */
  Apps.music = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('music-app');
      const music = ctx.music;
      let repeat = false, shuffle = false;
      const bag = cleanupBag();

      view.innerHTML = `
        <div class="app-body no-pad" style="display:flex;flex-direction:column">
          <div class="app-nav" style="height:auto;padding:56px 20px 0;color:#fff">
            <button class="nav-btn" style="color:#fff">‹</button>
            <span class="nav-title">Now Playing</span>
            <button class="nav-btn" style="color:#fff">⌄</button>
          </div>
          <div class="music-hero">
            <div class="cover" id="cover">
              <div class="cover-art" id="coverArt"><span class="cv-glyph" id="coverGlyph">🌆</span></div>
              <div class="cover-bars" id="coverBars">${Array.from({ length: 22 }, () => '<i></i>').join('')}</div>
            </div>
            <div class="music-meta"><h2 id="mTitle">—</h2><p id="mArtist">—</p></div>
            <div class="progress-wrap">
              <div class="progress" id="mProgress"><div class="fill" id="mFill"></div><div class="knob" id="mKnob" style="left:0%"></div></div>
              <div class="times"><span id="mElapsed">0:00</span><span id="mRemain">-0:00</span></div>
            </div>
            <div class="transport">
              <button id="mPrev">⏮</button>
              <button class="play-big" id="mPlay">▶</button>
              <button id="mNext">⏭</button>
            </div>
            <div class="music-extra">
              <button id="mShuffle" style="color:#b9a7c9">⤨</button>
              <button id="mLyrics" style="color:#b9a7c9">”</button>
              <button id="mRepeat" style="color:#b9a7c9">↻</button>
              <button id="mMore" style="color:#b9a7c9">⋯</button>
            </div>
          </div>
          <div class="music-list">
            <h3>Up Next</h3>
            <div id="mLibrary"></div>
          </div>
        </div>`;

      const cover = $('#cover', view);
      const coverArt = $('#coverArt', view);

      function renderLibrary() {
        const s = music.state();
        $('#mLibrary', view).innerHTML = s.tracks.map((t, i) => `
          <button class="track ${i === s.index ? 'playing' : ''}" data-track="${i}" style="width:100%;text-align:left;background:none">
            <span class="t-art" style="background:linear-gradient(150deg,${t.colors.join(',')})">${t.glyph}</span>
            <span class="t-main"><b>${esc(t.title)}</b><span>${esc(t.artist)} · ${esc(t.album)}</span></span>
            <span class="t-dur">${music.fmt(t.dur)}</span>
          </button>`).join('');
      }

      function paint() {
        const s = music.state();
        const t = s.track;
        $('#mTitle', view).textContent = t.title;
        $('#mArtist', view).textContent = `${t.artist} — ${t.album}`;
        $('#mPlay', view).textContent = s.playing ? '❚❚' : '▶';
        $('#coverGlyph', view).textContent = t.glyph;
        coverArt.style.background = `linear-gradient(150deg,${t.colors.join(',')})`;
        cover.classList.toggle('playing', s.playing);
        cover.classList.toggle('paused', !s.playing);
        $('#coverBars', view).style.opacity = s.playing ? '.9' : '.25';
        const pct = (s.elapsed / t.dur) * 100;
        $('#mFill', view).style.width = pct + '%';
        $('#mKnob', view).style.left = pct + '%';
        $('#mElapsed', view).textContent = music.fmt(s.elapsed);
        $('#mRemain', view).textContent = '-' + music.fmt(t.dur - s.elapsed);
        $('#mShuffle', view).style.color = shuffle ? '#fa8fff' : '#b9a7c9';
        $('#mRepeat', view).style.color = repeat ? '#fa8fff' : '#b9a7c9';
        $$('#mLibrary .track', view).forEach((el) => el.classList.toggle('playing', +el.dataset.track === s.index));
        const playIcon = document.querySelector('#ccPlay');
        if (playIcon) playIcon.textContent = s.playing ? '❚❚' : '▶';
      }

      const unsub = music.onChange(paint);
      bag.add(unsub);

      view.addEventListener('click', (e) => {
        if (e.target.closest('#mPlay')) { music.toggle(); return; }
        if (e.target.closest('#mNext')) { music.next(); return; }
        if (e.target.closest('#mPrev')) { music.prev(); return; }
        const track = e.target.closest('[data-track]');
        if (track) { music.select(+track.dataset.track); return; }
        if (e.target.closest('#mShuffle')) { shuffle = !shuffle; paint(); ctx.toast(shuffle ? 'Shuffle on' : 'Shuffle off', '⤨'); return; }
        if (e.target.closest('#mRepeat')) { repeat = !repeat; paint(); ctx.toast(repeat ? 'Repeat on' : 'Repeat off', '↻'); return; }
        if (e.target.closest('#mLyrics')) { ctx.toast('Lyrics coming soon', '”'); return; }
        if (e.target.closest('#mMore')) { ctx.toast('Added to your library', '＋'); return; }
        if (e.target.closest('#mProgress')) {
          const r = e.target.closest('#mProgress').getBoundingClientRect();
          music.seek((e.clientX - r.left) / r.width);
        }
      });

      $('#mProgress', view).addEventListener('pointerdown', (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const move = (ev) => music.seek((ev.clientX - r.left) / r.width);
        move(e);
      });

      renderLibrary();
      paint();
      if (!music.playing && music.elapsed === 0) {
        setTimeout(() => { if (view.isConnected) ctx.toast('Tap play to hear a synthesized track', '♪'); }, 900);
      }
      return () => { bag.run(); };
    }
  };

  window.Apps = Apps;
})();
