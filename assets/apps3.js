/* Apps part 3 — The rest of the Home Screen. */
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
  function bag() {
    const fns = [];
    return { add: (f) => fns.push(f), run: () => fns.forEach((f) => { try { f(); } catch (e) { console.error(e); } }) };
  }
  const nav = (title) => `<div class="app-nav"><button class="nav-btn"></button><span class="nav-title">${title}</span><button class="nav-btn"></button></div>`;

  /* =========================================================
     REMINDERS
     ========================================================= */
  Apps.reminders = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('rem-app');
      let items = ctx.db.get('reminders', []);
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Reminders</div>
        <div class="app-search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" stroke-width="2"/></svg><input id="remSearch" placeholder="Search" aria-label="Search reminders" /></div>
        <div id="remList"></div>
        <div style="display:flex;gap:8px;padding:0 18px 24px">
          <input class="input-line" id="remInput" placeholder="New reminder" />
          <button class="pill-btn" id="remAdd">Add</button>
        </div>
      </div>`;
      function render(filter = '') {
        const f = filter.toLowerCase();
        const groups = {};
        items.filter((i) => !f || i.text.toLowerCase().includes(f)).forEach((i) => {
          (groups[i.group] = groups[i.group] || []).push(i);
        });
        $('#remList', view).innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([g, list]) => `
          <div class="rem-group"><h3>${esc(g)} · ${list.filter((x) => !x.done).length}</h3>
            ${list.map((i) => `<button class="rem-item ${i.done ? 'done' : ''}" data-rem="${i.id}" style="width:100%;text-align:left;background:none">
              <span class="rem-check">${i.done ? '✓' : ''}</span>
              <span style="flex:1"><span class="rem-text">${esc(i.text)}</span>${i.done ? '<span class="rem-sub">Completed</span>' : ''}</span>
            </button>`).join('')}
          </div>`).join('') : `<div class="empty-state"><span class="big">☑︎</span>No Reminders</div>`;
      }
      view.addEventListener('click', (e) => {
        const r = e.target.closest('[data-rem]');
        if (r) {
          const item = items.find((x) => x.id === r.dataset.rem);
          item.done = !item.done; ctx.db.set('reminders', items); render($('#remSearch', view).value);
          if (item.done) { ctx.audio.tone(880, .1, 'sine', .03); }
        }
      });
      $('#remSearch', view).addEventListener('input', (e) => render(e.target.value));
      $('#remAdd', view).addEventListener('click', () => {
        const v = $('#remInput', view).value.trim(); if (!v) return;
        items.push({ id: 'r' + Date.now(), text: v, group: '오늘', done: false });
        ctx.db.set('reminders', items); $('#remInput', view).value = ''; render(); ctx.toast('Reminder added', '☑︎');
      });
      $('#remInput', view).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#remAdd', view).click(); });
      render();
      return () => { };
    }
  };

  /* =========================================================
     FILES
     ========================================================= */
  Apps.files = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('files-app');
      const files = {
        'iCloud Drive': [
          { n: 'Keynote — iPhone 18.key', i: '📊', s: '12.4 MB', d: 'Today' },
          { n: 'Launch shots.zip', i: '🗜️', s: '248 MB', d: 'Yesterday' },
          { n: 'Project Aurora', i: '📁', s: 'Folder', d: 'Yesterday' },
          { n: 'notes.txt', i: '📄', s: '4 KB', d: 'Monday' },
          { n: 'Wallpaper.png', i: '🖼️', s: '3.2 MB', d: 'Sunday' }
        ],
        Recents: [
          { n: 'Screenshot 2026-10-24.png', i: '🖼️', s: '2.1 MB', d: '9:24 AM' },
          { n: 'Design review.pdf', i: '📕', s: '1.8 MB', d: 'Today' },
          { n: 'voice-memo.m4a', i: '🎙️', s: '820 KB', d: 'Yesterday' }
        ],
        'On My iPhone': [
          { n: 'Camera Roll', i: '📁', s: 'Folder', d: 'Today' },
          { n: 'Downloads', i: '📁', s: 'Folder', d: 'Today' },
          { n: 'Freeform.board', i: '🎨', s: '540 KB', d: 'Monday' }
        ],
        Downloads: [
          { n: 'iPhone18-wallpaper.jpg', i: '🖼️', s: '4.8 MB', d: 'Today' }
        ]
      };
      let folder = 'Recents';
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Files</div>
        <div class="app-search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" stroke-width="2"/></svg><input placeholder="Search" aria-label="Search files" /></div>
        <div style="display:flex;gap:8px;overflow-x:auto;padding:0 16px 14px" id="fileTabs"></div>
        <div id="fileContent" style="padding:0 16px"></div>
      </div>`;
      function render() {
        $('#fileTabs', view).innerHTML = Object.keys(files).map((f) => `<button class="pill-btn ${f === folder ? '' : 'ghost'}" data-folder="${f}" style="flex:none;font-size:12px;padding:6px 12px">${f}</button>`).join('');
        $('#fileContent', view).innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:17px">${folder}</b><span style="font-size:12px;color:#8e8e93">${files[folder].length} items</span></div>
          <div class="file-grid">${files[folder].map((f, i) => `
            <button class="file-card" data-file="${i}" style="text-align:left">
              <span class="fc-ico">${f.i}</span><b>${esc(f.n)}</b><span>${f.s} · ${f.d}</span>
            </button>`).join('')}</div>
          <div class="section-label">Storage</div>
          <div class="list-card" style="margin:0 0 24px"><div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
            <div style="display:flex;justify-content:space-between;font-size:13px"><span>iPhone</span><span style="color:#8e8e93">241 GB of 1 TB used</span></div>
            <div style="height:7px;border-radius:4px;background:#e5e5ea;overflow:hidden;display:flex">
              <span style="width:14%;background:#0a84ff"></span><span style="width:9%;background:#bf5af2"></span><span style="width:7%;background:#ff9f0a"></span><span style="width:6%;background:#30d158"></span>
            </div>
          </div></div>`;
      }
      view.addEventListener('click', (e) => {
        const t = e.target.closest('[data-folder]');
        if (t) { folder = t.dataset.folder; render(); return; }
        const f = e.target.closest('[data-file]');
        if (f) {
          const item = files[folder][+f.dataset.file];
          if (item.s === 'Folder') { ctx.toast('Opening ' + item.n, '📁'); return; }
          ctx.toast(item.n + ' · Quick Look', '👁️');
        }
      });
      render();
      return () => { };
    }
  };

  /* =========================================================
     HEALTH
     ========================================================= */
  Apps.health = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('health-app');
      const fit = ctx.db.get('fitness', { move: 420, exercise: 24, stand: 9 });
      const R = 74, C = 2 * Math.PI * R;
      const move = Math.min(1, fit.move / 650), ex = Math.min(1, fit.exercise / 30), stand = Math.min(1, fit.stand / 12);
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Summary</div>
        <div class="health-hero">
          <div class="health-rings">
            <svg viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="${R}" fill="none" stroke="#ff2d55" stroke-opacity=".18" stroke-width="14"/>
              <circle cx="90" cy="90" r="${R}" fill="none" stroke="#ff2d55" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - move)}"/>
              <circle cx="90" cy="90" r="${R - 19}" fill="none" stroke="#a3f56b" stroke-opacity=".18" stroke-width="14"/>
              <circle cx="90" cy="90" r="${R - 19}" fill="none" stroke="#a3f56b" stroke-width="14" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * (R - 19)}" stroke-dashoffset="${2 * Math.PI * (R - 19) * (1 - ex)}"/>
              <circle cx="90" cy="90" r="${R - 38}" fill="none" stroke="#5ee0f0" stroke-opacity=".18" stroke-width="14"/>
              <circle cx="90" cy="90" r="${R - 38}" fill="none" stroke="#5ee0f0" stroke-width="14" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * (R - 38)}" stroke-dashoffset="${2 * Math.PI * (R - 38) * (1 - stand)}"/>
            </svg>
            <div class="hr-center"><b>${Math.round(move * 100)}%</b><span>Daily goal</span></div>
          </div>
          <div style="display:flex;justify-content:center;gap:18px;font-size:10px;color:#8e8e93;margin-top:6px">
            <span><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ff2d55;margin-right:4px"></i>Move ${fit.move}/650</span>
            <span><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#a3f56b;margin-right:4px"></i>Exercise ${fit.exercise}/30</span>
            <span><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#5ee0f0;margin-right:4px"></i>Stand ${fit.stand}/12</span>
          </div>
        </div>
        <div class="health-stats">
          <div class="hs-card"><small>Steps</small><b>8,412</b><span>+12% vs last week</span></div>
          <div class="hs-card"><small>Distance</small><b>3.8 mi</b><span>Today</span></div>
          <div class="hs-card"><small>Heart Rate</small><b>68 bpm</b><span>Resting · 2 min ago</span></div>
          <div class="hs-card"><small>Sleep</small><b>7h 24m</b><span>Last night · Good</span></div>
        </div>
        <div class="section-label">Activity</div>
        <div class="list-card" style="padding:16px">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;height:90px;gap:8px">
            ${[62, 78, 45, 90, 70, 84, 52].map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end">
              <span style="width:100%;height:${v}%;background:linear-gradient(180deg,#ff2d55,#ff6482);border-radius:6px"></span>
              <small style="font-size:9px;color:#8e8e93">${['월', '화', '수', '목', '금', '토', '일'][i]}</small></div>`).join('')}
          </div>
        </div>
        <div class="section-label">Highlights</div>
        <div class="list-card" style="margin-bottom:24px">
          <div class="list-row"><span class="lr-icon" style="background:#30d158">🏃</span><span class="lr-main"><b>Outdoor Walk</b><span>2.4 mi · 32 min · Yesterday</span></span></div>
          <div class="list-row"><span class="lr-icon" style="background:#5e5ce6">🧘</span><span class="lr-main"><b>Mindfulness</b><span>10 min · 2 days ago</span></span></div>
        </div>
      </div>`;
      return () => { };
    }
  };

  /* =========================================================
     WALLET
     ========================================================= */
  Apps.wallet = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('wallet-app');
      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 18px 8px">
          <button class="nav-btn" style="color:#fff">＋</button><span class="nav-title">Wallet</span><button class="nav-btn" style="color:#fff">⋯</button>
        </div>
        <div class="card-stack">
          <div class="credit-card" style="background:linear-gradient(150deg,#2f2f31,#0b0b0d)">
            <div class="cc-head"><span>Apple Card</span><span>Mastercard</span></div>
            <div style="font-size:11px;opacity:.7">Titanium · Mastercard</div>
            <div class="cc-num">•••• 4812</div>
            <div class="cc-foot"><span>Alex Morgan</span><span>12/29</span></div>
          </div>
          <div class="credit-card" style="height:150px;background:linear-gradient(150deg,#0a84ff,#5e5ce6 60%,#bf5af2)">
            <div class="cc-head"><span>Transit</span><span>Clipper</span></div>
            <div class="cc-num" style="font-size:26px">$24.50</div>
            <div class="cc-foot"><span>Auto-reload on</span><span>Bay Area</span></div>
          </div>
          <div class="credit-card" style="height:130px;background:linear-gradient(150deg,#1f7a4d,#0a3d26)">
            <div class="cc-head"><span>Boarding Pass</span><span>SFO → JFK</span></div>
            <div class="cc-num" style="font-size:20px">Gate 24 · 6:40 PM</div>
            <div class="cc-foot"><span>Seat 14A</span><span>Terminal 2</span></div>
          </div>
        </div>
        <div class="wallet-tx">
          <h3>Latest Transactions</h3>
          ${[['Apple Store', 'Today · iPhone 18 Pro case', '-$49.00'], ['Blue Bottle', 'Today · Coffee', '-$6.25'], ['Apple Pay', 'Yesterday · Groceries', '-$84.12'], ['Salary', 'Oct 20 · Deposit', '+$4,250.00']].map(([n, s, v]) => `<div class="tx-row"><span><b style="color:#fff">${n}</b><span>${s}</span></span><b style="color:${v.startsWith('+') ? '#30d158' : '#fff'}">${v}</b></div>`).join('')}
        </div>
      </div>`;
      return () => { };
    }
  };

  /* =========================================================
     PODCASTS
     ========================================================= */
  Apps.podcasts = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('podcast-app');
      const clean = bag();
      let playing = -1, progress = 0, timer = null;
      const episodes = [
        { t: 'The future of the smartphone', s: 'Tech Today · 42 min', g: '📱', c: 'linear-gradient(150deg,#ff5f6d,#ffc371)' },
        { t: 'Designing the Dynamic Island', s: 'Studio Notes · 31 min', g: '🏝️', c: 'linear-gradient(150deg,#5ee7df,#b490ca)' },
        { t: 'Inside Apple silicon', s: 'Deep Dive · 55 min', g: '⚙️', c: 'linear-gradient(150deg,#667eea,#764ba2)' },
        { t: 'The art of the pixel', s: 'Creative Process · 38 min', g: '🎨', c: 'linear-gradient(150deg,#f093fb,#f5576c)' },
        { t: 'Why we love cameras', s: 'Photo Hour · 47 min', g: '📷', c: 'linear-gradient(150deg,#4facfe,#00f2fe)' }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Listen Now</div>
        <div class="pod-hero"><small>Featured show</small><h2>The Daily Loop</h2><p>New episode every weekday · 24 min</p>
          <button class="pill-btn" data-play="0" style="align-self:flex-start;margin-top:10px;background:#fff;color:#5c2a9d">▶ Play latest</button></div>
        <div class="section-label">Latest Episodes</div>
        <div>${episodes.map((e, i) => `<div class="pod-ep">
          <span class="pe-art" style="background:${e.c}">${e.g}</span>
          <span style="flex:1"><b>${e.t}</b><span>${e.s}</span></span>
          <button class="pe-play" data-play="${i}">${playing === i ? '❚❚' : '▶'}</button>
        </div>`).join('')}</div>
        <div id="podPlayer" style="position:sticky;bottom:0;margin:12px 14px 24px;background:#fff;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.12);padding:10px 12px;display:none">
          <div style="display:flex;align-items:center;gap:10px"><span id="podArt" style="width:38px;height:38px;border-radius:8px;display:grid;place-items:center">🎧</span>
            <span style="flex:1;min-width:0"><b id="podTitle" style="font-size:12px;display:block"></b><span id="podSub" style="font-size:10px;color:#8e8e93"></span></span>
            <button id="podControl" style="font-size:16px">❚❚</button></div>
          <div style="height:3px;background:#eee;border-radius:2px;margin-top:8px"><div id="podBar" style="height:100%;width:0;background:#5c2a9d;border-radius:2px"></div></div>
        </div>
        <div style="height:12px"></div>
      </div>`;
      function paint() {
        const player = $('#podPlayer', view);
        player.style.display = playing >= 0 ? 'block' : 'none';
        if (playing >= 0) {
          const e = episodes[playing];
          $('#podArt', view).style.background = e.c;
          $('#podArt', view).textContent = e.g;
          $('#podTitle', view).textContent = e.t;
          $('#podSub', view).textContent = playing === -1 ? '' : (timer ? 'Playing · ' : 'Paused · ') + e.s;
          $('#podControl', view).textContent = timer ? '❚❚' : '▶';
          $('#podBar', view).style.width = progress + '%';
        }
        $$('[data-play]', view).forEach((b) => {
          const i = +b.dataset.play;
          if (b.classList.contains('pe-play')) b.textContent = playing === i ? (timer ? '❚❚' : '▶') : '▶';
        });
      }
      function stop() { clearInterval(timer); timer = null; }
      function play(i) {
        if (playing === i && timer) { stop(); paint(); return; }
        stop(); playing = i; progress = 0;
        timer = setInterval(() => {
          progress += 0.6;
          if (progress >= 100) { progress = 100; stop(); ctx.toast('Episode finished', '🎧'); }
          paint();
        }, 400);
        paint();
      }
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-play]');
        if (b) { play(+b.dataset.play); return; }
        if (e.target.closest('#podControl')) { timer ? (stop(), paint()) : play(playing); }
      });
      clean.add(() => clearInterval(timer));
      paint();
      return () => clean.run();
    }
  };

  /* =========================================================
     FACETIME
     ========================================================= */
  Apps.facetime = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('facetime-app');
      const clean = bag();
      let inCall = false;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 18px 8px">
          <button class="nav-btn" style="color:#0a84ff">‹</button><span class="nav-title">FaceTime</span><button class="nav-btn" style="color:#0a84ff">＋</button>
        </div>
        <div class="ft-preview" id="ftPreview">
          <div class="ft-avatar">👤</div>
          <div class="ft-name">Emma</div>
          <div class="ft-sub">Tap to start a FaceTime call</div>
          <div style="display:flex;gap:10px;margin-top:12px">
            <button class="pill-btn" data-ft-call style="background:#30d158">Video</button>
            <button class="pill-btn ghost" data-ft-audio style="color:#fff;background:rgba(255,255,255,.15)">Audio</button>
          </div>
        </div>
        <div class="section-label" style="color:#8e8e93">Recents</div>
        <div style="padding:0 18px 20px">
          ${[['Alex Chen', 'Outgoing · 12 min', 'AC'], ['Mom', 'Missed · Yesterday', 'M'], ['Design Team', 'Incoming · 34 min', 'DT']].map(([n, s, i]) => `<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <span class="msg-avatar" style="width:38px;height:38px;font-size:14px;background:linear-gradient(150deg,#6a5cff,#c44cff)">${i}</span>
            <span style="flex:1"><b style="font-size:14px;color:#fff">${n}</b><span style="display:block;font-size:11px;color:#8e8e93">${s}</span></span>
            <button style="color:#30d158;font-size:17px" data-ft-call>📹</button>
          </div>`).join('')}
        </div>
      </div>`;
      view.addEventListener('click', (e) => {
        if (e.target.closest('[data-ft-call]')) {
          inCall = true;
          const p = $('#ftPreview', view);
          p.innerHTML = `<div class="ft-avatar">E</div><div class="ft-name">Emma</div><div class="ft-sub" id="ftStatus">Connecting…</div>
            <div class="ft-actions"><button>🔇</button><button>🎥</button><button class="end" data-ft-end>✕</button></div>`;
          window.Sim.startCall('Emma', 'FaceTime');
          setTimeout(() => { const s = $('#ftStatus', view); if (s) s.textContent = 'FaceTime · 00:00'; }, 1500);
          let n = 0;
          const t = setInterval(() => { n++; const s = $('#ftStatus', view); if (s) s.textContent = `FaceTime · ${pad(Math.floor(n / 60))}:${pad(n % 60)}`; }, 1000);
          clean.add(() => { clearInterval(t); });
        }
        if (e.target.closest('[data-ft-end]')) {
          window.Sim.endCall();
          ctx.goHome();
        }
      });
      clean.add(() => { if (inCall) window.Sim.endCall(); });
      return () => clean.run();
    }
  };

  /* =========================================================
     BOOKS
     ========================================================= */
  Apps.books = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('books-app');
      const clean = bag();
      const books = [
        { id: 'b1', title: 'The Cartographer’s Garden', author: 'A. Morgan', g: '🗺️', c: 'linear-gradient(150deg,#2a9d8f,#264653)', text: [`The map began as a doodle on the back of a receipt.`, `Mira drew one line for the river and another for the road, and then, without meaning to, she drew a garden. It was not on any survey. It sat in the blank space between the old mill and the sea, a place the town had forgotten to name.`, `She walked there the next morning. The garden was exactly where she had drawn it: a low brick wall, a gate of rusted iron, and behind it, flowers the color of a sky just before rain.`, `“You found it,” said a voice. An old woman was pruning roses that had no thorns. “Most people walk right past.”`, `“I drew it,” Mira said. “On a receipt.”`, `The woman smiled. “That is how all the good places begin.”`, `For the rest of the summer Mira drew. She drew a bench beneath the apple tree. She drew a path of white stones. She drew a small fountain that sang in a key she could almost remember. Each morning the garden had changed to meet her pencil.`, `By autumn the town had a new park. Nobody could say who had made it. The maps were updated, the surveyors confused, and the old woman was never seen again.`, `But if you look closely at the corner of the park, where the wall is lowest, you can still find a single line of ink on the bricks — the first line Mira ever drew.`, `And on quiet evenings, the fountain still sings.`] },
        { id: 'b2', title: 'Notes on Light', author: 'J. Rivera', g: '☀️', c: 'linear-gradient(150deg,#f4a261,#e76f51)', text: [`Light is the only material that cannot be owned.`, `You can hold a shadow, briefly, by standing in the sun. You can keep a photograph, which is only a promise that light was once in a particular place.`, `In the morning the light comes in low and orange and makes every object look forgiven. By noon it is honest and unkind. In the evening it becomes generous again, gilding the edges of things we are about to lose.`, `I have spent years trying to describe the color of the hour before dark. The closest I have come is this: it is the color of a room you remember from childhood, though you cannot remember which room.`, `There is no such thing as bad light. There are only days when we are looking the wrong way.`] }
      ];
      let reading = null;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="large-title pt">Reading Now</div>
        <div style="padding:0 16px 20px">
          <div style="background:#fff;border-radius:14px;padding:13px;display:flex;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
            <span class="book-cover" style="background:linear-gradient(150deg,#2a9d8f,#264653);width:56px;height:80px">🗺️</span>
            <div style="flex:1"><b style="font-size:15px">The Cartographer’s Garden</b><span style="display:block;font-size:11px;color:#8e8e93;margin:2px 0 8px">A. Morgan · 2h 14m left</span>
              <div style="height:3px;background:#eee;border-radius:2px"><div style="width:38%;height:100%;background:#2a9d8f;border-radius:2px"></div></div></div>
            <button class="pe-play" data-read="b1" style="width:34px;height:34px;border-radius:50%;background:#f2f2f7;display:grid;place-items:center;font-size:13px">▶</button>
          </div>
        </div>
        <div class="section-label">My Library</div>
        <div class="books-shelf">
          ${books.map((b) => `<button class="shelf-book" data-read="${b.id}"><span class="sb-cover" style="background:${b.c}">${b.g}</span><span>${b.title}</span></button>`).join('')}
          <div class="shelf-book"><span class="sb-cover" style="background:linear-gradient(150deg,#adb5bd,#495057)">＋</span><span>Add Book</span></div>
        </div>
        <div class="section-label">Want to Read</div>
        <div class="list-card" style="margin:0 16px 24px">
          <div class="list-row"><span class="lr-icon" style="background:#5e5ce6">📘</span><span class="lr-main"><b>Twelve Kinds of Quiet</b><span>Sample available</span></span></div>
          <div class="list-row"><span class="lr-icon" style="background:#ff9f0a">📙</span><span class="lr-main"><b>The Shape of Cities</b><span>Sample available</span></span></div>
        </div>
      </div>`;
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-read]');
        if (!b) return;
        const book = books.find((x) => x.id === b.dataset.read);
        const r = document.createElement('div');
        r.className = 'reader';
        r.innerHTML = `<div class="app-nav" style="height:auto;padding:56px 16px 8px;background:#f7f2e7"><button class="nav-btn" data-close-reader style="color:#b07d3f">‹ Library</button><span class="nav-title" style="color:#2b2118">${esc(book.title)}</span><button class="nav-btn" style="color:#b07d3f">Aa</button></div>
          <div class="rd-body"><h2>${esc(book.title)}</h2><div class="rd-by">${esc(book.author)}</div>
          ${book.text.map((p) => `<p>${p}</p>`).join('')}</div>
          <div class="rd-bar"><span>Page 1 of 264</span><span>38% read</span></div>`;
        view.querySelector('.app-body').appendChild(r);
        r.querySelector('[data-close-reader]').addEventListener('click', () => r.remove());
      });
      return () => clean.run();
    }
  };

  /* =========================================================
     FREEFORM
     ========================================================= */
  Apps.freeform = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('freeform-app');
      const clean = bag();
      let color = '#0a84ff', size = 4, drawing = false, last = null;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 16px 6px"><button class="nav-btn"></button><span class="nav-title">Freeform</span><button class="nav-btn" data-ff-clear style="color:#0a84ff">Clear</button></div>
        <div class="ff-canvas" id="ffCanvas"><canvas id="ffBoard"></canvas></div>
        <div class="ff-tools">
          ${['#0a84ff', '#ff453a', '#30d158', '#ffd60a', '#bf5af2', '#111111'].map((c, i) => `<button data-color="${c}" class="${i === 0 ? 'active' : ''}"><span class="swatch" style="background:${c}"></span></button>`).join('')}
          <button data-ff-undo>↺</button>
          <button data-size="2" style="font-size:10px">S</button><button data-size="4" class="active" style="font-size:13px">M</button><button data-size="8" style="font-size:17px">L</button>
        </div>
      </div>`;
      const canvas = $('#ffBoard', view);
      const wrap = $('#ffCanvas', view);
      const g = canvas.getContext('2d');
      let saved = [];
      function resize() {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        if (!w || !h) return;
        const data = canvas.width ? canvas.toDataURL() : null;
        canvas.width = w * dpr; canvas.height = h * dpr;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.lineCap = 'round'; g.lineJoin = 'round';
        if (data) { const img = new Image(); img.onload = () => g.drawImage(img, 0, 0, w, h); img.src = data; }
      }
      requestAnimationFrame(resize);
      const ro = new ResizeObserver(() => resize());
      ro.observe(wrap); clean.add(() => ro.disconnect());

      function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      canvas.addEventListener('pointerdown', (e) => {
        drawing = true; last = pos(e);
        saved.push(canvas.toDataURL());
        if (saved.length > 12) saved.shift();
        canvas.setPointerCapture(e.pointerId);
        g.strokeStyle = color; g.lineWidth = size; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(last.x + .1, last.y); g.stroke();
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        const p = pos(e);
        g.lineWidth = size; g.strokeStyle = color;
        g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke();
        last = p;
      });
      canvas.addEventListener('pointerup', () => { drawing = false; });
      view.addEventListener('click', (e) => {
        const c = e.target.closest('[data-color]');
        if (c) { color = c.dataset.color; $$('[data-color]', view).forEach((b) => b.classList.toggle('active', b === c)); return; }
        const s = e.target.closest('[data-size]');
        if (s) { size = +s.dataset.size; $$('[data-size]', view).forEach((b) => b.classList.toggle('active', b === s)); return; }
        if (e.target.closest('[data-ff-undo]')) {
          const data = saved.pop();
          g.clearRect(0, 0, wrap.clientWidth, wrap.clientHeight);
          if (data) { const img = new Image(); img.onload = () => g.drawImage(img, 0, 0, wrap.clientWidth, wrap.clientHeight); img.src = data; }
          return;
        }
        if (e.target.closest('[data-ff-clear]')) { g.clearRect(0, 0, wrap.clientWidth, wrap.clientHeight); saved = []; ctx.toast('Board cleared', '🧽'); }
      });
      return () => clean.run();
    }
  };

  /* =========================================================
     STOCKS
     ========================================================= */
  Apps.stocks = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('stocks-app');
      const clean = bag();
      const stocks = [
        { s: 'AAPL', n: 'Apple Inc.', p: 242.18, c: 1.42, color: '#30d158', seed: 1 },
        { s: 'MSFT', n: 'Microsoft', p: 438.92, c: -0.64, color: '#ff453a', seed: 2 },
        { s: 'NVDA', n: 'NVIDIA', p: 152.44, c: 2.31, color: '#30d158', seed: 3 },
        { s: 'TSLA', n: 'Tesla', p: 271.09, c: -1.18, color: '#ff453a', seed: 4 },
        { s: 'AMZN', n: 'Amazon', p: 228.71, c: 0.83, color: '#30d158', seed: 5 },
        { s: 'GOOGL', n: 'Alphabet', p: 196.35, c: 0.27, color: '#30d158', seed: 6 }
      ];
      function spark(seed, up) {
        const pts = [];
        for (let i = 0; i < 24; i++) {
          const v = Math.sin(i * 1.3 + seed) * .5 + Math.sin(i * .4 + seed * 2) * .3 + (up ? i * .02 : -i * .015);
          pts.push(v);
        }
        const min = Math.min(...pts), max = Math.max(...pts);
        return pts.map((v, i) => `${(i / 23) * 70},${26 - ((v - min) / (max - min || 1)) * 22}`).join(' ');
      }
      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px"><button class="nav-btn" style="color:#fff">✎</button><span class="nav-title">Stocks</span><button class="nav-btn" style="color:#fff">＋</button></div>
        <div style="padding:0 18px 14px"><div style="font-size:34px;font-weight:700;letter-spacing:-.03em">Markets</div><div style="font-size:12px;color:#8e8e93">As of ${ctx.now().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })} · Real-time simulation</div></div>
        <div style="padding:0 12px">
          ${stocks.map((st) => `<div class="list-row" data-stock="${st.s}" style="background:#111;border-radius:12px;margin:6px 0;border:0;cursor:pointer">
            <span style="flex:1"><b style="color:#fff">${st.s}</b><span style="color:#8e8e93">${st.n}</span></span>
            <svg viewBox="0 0 70 30" style="width:70px;height:30px"><polyline points="${spark(st.seed, st.c >= 0)}" fill="none" stroke="${st.color}" stroke-width="1.6"/></svg>
            <span style="text-align:right;min-width:66px"><b style="color:#fff;font-variant-numeric:tabular-nums">${st.p.toFixed(2)}</b><span style="color:${st.color};font-weight:600">${st.c >= 0 ? '+' : ''}${st.c.toFixed(2)}%</span></span>
          </div>`).join('')}
        </div>
        <div class="section-label" style="color:#8e8e93">Business News</div>
        <div style="padding:0 18px 24px">
          ${[['Apple unveils iPhone 18 Pro with A20 chip', '9:12 AM'], ['Markets rally as tech earnings beat expectations', '8:45 AM'], ['NVIDIA announces next-gen data center platform', 'Yesterday']].map(([h, t]) => `<div style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,.1)"><b style="font-size:13.5px;display:block;color:#fff">${h}</b><span style="font-size:10px;color:#8e8e93">${t} · Markets Daily</span></div>`).join('')}
        </div>
      </div>`;
      const t = setInterval(() => {
        stocks.forEach((st) => { st.p = Math.max(1, st.p + (Math.random() - 0.5) * st.p * 0.0015); });
      }, 3000);
      clean.add(() => clearInterval(t));
      view.addEventListener('click', (e) => { const s = e.target.closest('[data-stock]'); if (s) ctx.toast(`${s.dataset.stock} · market data (simulated)`, '📈'); });
      return () => clean.run();
    }
  };

  /* =========================================================
     VOICE MEMOS
     ========================================================= */
  Apps.voicememo = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      const clean = bag();
      const memos = window.__memos = window.__memos || [];
      let recording = false, seconds = 0, recTimer = null, stream = null, recorder = null, chunks = [];
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px"><button class="nav-btn" style="color:#fff">⋯</button><span class="nav-title">Voice Memos</span><button class="nav-btn" style="color:#fff">＋</button></div>
        <div style="text-align:center;padding:18px 0 8px">
          <div style="font-size:46px;font-weight:200;font-variant-numeric:tabular-nums" id="vmTime">00:00</div>
          <div style="font-size:11px;color:#8e8e93" id="vmHint">Tap the red button to record</div>
        </div>
        <div style="height:54px;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 30px" id="vmWave">
          ${Array.from({ length: 42 }, (_, i) => `<span style="width:3px;height:${8 + (i * 7) % 26}px;background:rgba(255,255,255,.25);border-radius:2px"></span>`).join('')}
        </div>
        <div style="display:flex;justify-content:center;padding:14px 0 24px">
          <button id="vmRecord" style="width:70px;height:70px;border-radius:50%;background:#ff453a;display:grid;place-items:center"><span style="width:24px;height:24px;border-radius:${recording ? '4px' : '50%'};background:#fff;display:block"></span></button>
        </div>
        <div class="section-label" style="color:#8e8e93">Recordings</div>
        <div id="vmList" style="padding:0 18px 24px"></div>
      </div>`;
      function renderList() {
        $('#vmList', view).innerHTML = memos.length ? memos.map((m, i) => `
          <div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <button data-vm-play="${i}" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center;font-size:12px">▶</button>
            <span style="flex:1"><b style="font-size:13px;color:#fff;display:block">${m.name}</b><span style="font-size:10px;color:#8e8e93">${m.dur} · ${m.date}</span></span>
            <button data-vm-del="${i}" style="color:#6a6a70">🗑</button>
          </div>`).join('') : `<div style="color:#6a6a70;font-size:12px;text-align:center;padding:20px">No recordings yet</div>`;
      }
      function stopStream() { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; }
      async function toggleRecord() {
        if (!recording) {
          recording = true; seconds = 0;
          $('#vmRecord', view).querySelector('span').style.borderRadius = '4px';
          $('#vmHint', view).textContent = 'Recording… tap to stop';
          const wave = $('#vmWave', view).children;
          recTimer = setInterval(() => {
            seconds++;
            $('#vmTime', view).textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
            Array.from(wave).forEach((w, i) => { w.style.height = (8 + Math.random() * 30) + 'px'; w.style.background = 'rgba(255,69,58,.85)'; });
          }, 1000);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorder = new MediaRecorder(stream);
            chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.start();
          } catch (e) { recorder = null; }
        } else {
          recording = false; clearInterval(recTimer); recTimer = null;
          $('#vmRecord', view).querySelector('span').style.borderRadius = '50%';
          $('#vmHint', view).textContent = 'Saved to Voice Memos';
          if (recorder && recorder.state !== 'inactive') {
            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              memos.unshift({ name: `New Recording ${memos.length + 1}`, dur: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`, date: 'Just now', url: URL.createObjectURL(blob) });
              renderList();
            };
            recorder.stop();
          } else {
            memos.unshift({ name: `New Recording ${memos.length + 1}`, dur: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`, date: 'Just now' });
            renderList();
          }
          stopStream(); recorder = null;
          Array.from($('#vmWave', view).children).forEach((w) => { w.style.height = '10px'; w.style.background = 'rgba(255,255,255,.25)'; });
          ctx.toast('Recording saved', '🎙️');
        }
      }
      view.addEventListener('click', (e) => {
        if (e.target.closest('#vmRecord')) { toggleRecord(); return; }
        const p = e.target.closest('[data-vm-play]');
        if (p) {
          const m = memos[+p.dataset.vmPlay];
          if (m.url) { const a = new Audio(m.url); a.play().catch(() => ctx.toast('Playing recording', '▶')); p.textContent = '❚❚'; }
          else ctx.toast('Playing · ' + m.name, '▶');
          return;
        }
        const d = e.target.closest('[data-vm-del]');
        if (d) { memos.splice(+d.dataset.vmDel, 1); renderList(); }
      });
      renderList();
      clean.add(() => { clearInterval(recTimer); stopStream(); });
      return () => clean.run();
    }
  };

  /* =========================================================
     HOME
     ========================================================= */
  Apps.home = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      let state = ctx.db.get('homekit', { lights: true, lock: true, climate: true, temp: 72, fan: false, shades: false });
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">My Home</div>
        <div style="padding:0 16px 6px;font-size:12px;color:#8e8e93">Cupertino · ${state.temp}° inside · 72° outside</div>
        <div class="section-label">Favorites</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px">
          ${[
            ['lights', 'Living Room Lights', '💡', state.lights ? 'On' : 'Off'],
            ['lock', 'Front Door', '🔒', state.lock ? 'Locked' : 'Unlocked'],
            ['climate', 'Thermostat', '🌡️', state.temp + '°'],
            ['fan', 'Ceiling Fan', '🌀', state.fan ? 'On' : 'Off']
          ].map(([k, n, i, v]) => `<button class="home-tile" data-home="${k}" style="background:${state[k] ? 'linear-gradient(160deg,#ffb267,#ff7a1a)' : '#fff'};border-radius:16px;padding:12px;text-align:left;color:${state[k] ? '#fff' : '#000'};min-height:110px;display:flex;flex-direction:column;justify-content:space-between">
            <span style="font-size:22px">${i}</span><span><b style="display:block;font-size:13px">${n}</b><span style="font-size:11px;opacity:.7">${v}</span></span>
          </button>`).join('')}
        </div>
        <div class="section-label">Climate</div>
        <div class="list-card" style="margin:0 16px 16px;padding:14px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <b style="font-size:15px">Thermostat</b><span style="font-size:12px;color:#8e8e93">Cooling to</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:26px;padding:10px 0">
            <button data-temp="-1" style="font-size:26px;color:#0a84ff">−</button>
            <span style="font-size:54px;font-weight:200;letter-spacing:-.04em">${state.temp}°</span>
            <button data-temp="1" style="font-size:26px;color:#0a84ff">＋</button>
          </div>
        </div>
        <div class="section-label">Rooms</div>
        <div class="list-card" style="margin:0 16px 24px">
          <div class="list-row"><span class="lr-icon" style="background:#ff9f0a">🛋️</span><span class="lr-main"><b>Living Room</b><span>3 accessories · 1 on</span></span><span class="chev">›</span></div>
          <div class="list-row"><span class="lr-icon" style="background:#0a84ff">🛏️</span><span class="lr-main"><b>Bedroom</b><span>2 accessories</span></span><span class="chev">›</span></div>
          <div class="list-row"><span class="lr-icon" style="background:#30d158">🍳</span><span class="lr-main"><b>Kitchen</b><span>4 accessories · 2 on</span></span><span class="chev">›</span></div>
        </div>
      </div>`;
      const paint = () => {
        $$('[data-home]', view).forEach((b) => {
          const k = b.dataset.home;
          const on = state[k];
          b.style.background = on ? 'linear-gradient(160deg,#ffb267,#ff7a1a)' : '#fff';
          b.style.color = on ? '#fff' : '#000';
          const label = b.querySelector('span:last-child span');
          if (label) {
            const map = { lights: on ? 'On' : 'Off', lock: on ? 'Locked' : 'Unlocked', climate: state.temp + '°', fan: on ? 'On' : 'Off' };
            label.textContent = map[k];
          }
        });
      };
      view.addEventListener('click', (e) => {
        const t = e.target.closest('[data-home]');
        if (t) { const k = t.dataset.home; state[k] = !state[k]; ctx.db.set('homekit', state); paint(); ctx.audio.click(600); return; }
        const temp = e.target.closest('[data-temp]');
        if (temp) {
          state.temp = Math.max(60, Math.min(86, state.temp + (+temp.dataset.temp)));
          ctx.db.set('homekit', state);
          const el = view.querySelector('[style*="font-size:54px"]'); if (el) el.textContent = state.temp + '°';
          paint();
        }
      });
      return () => { };
    }
  };

  /* =========================================================
     TRANSLATE
     ========================================================= */
  Apps.translate = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const LANGS = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian' };
      const DICT = {
        es: { hello: 'hola', 'good morning': 'buenos días', 'thank you': 'gracias', 'where is the train station': '¿dónde está la estación de tren?', 'how much does this cost': '¿cuánto cuesta esto?', 'i would like a coffee': 'quisiera un café', goodnight: 'buenas noches', please: 'por favor', goodbye: 'adiós' },
        fr: { hello: 'bonjour', 'good morning': 'bonjour', 'thank you': 'merci', 'where is the train station': 'où est la gare ?', 'how much does this cost': 'combien ça coûte ?', 'i would like a coffee': 'je voudrais un café', goodnight: 'bonne nuit', please: 's’il vous plaît', goodbye: 'au revoir' },
        de: { hello: 'hallo', 'good morning': 'guten Morgen', 'thank you': 'danke', 'where is the train station': 'wo ist der Bahnhof?', 'how much does this cost': 'wie viel kostet das?', 'i would like a coffee': 'ich hätte gern einen Kaffee', goodnight: 'gute Nacht', please: 'bitte', goodbye: 'auf Wiedersehen' },
        ja: { hello: 'こんにちは', 'good morning': 'おはようございます', 'thank you': 'ありがとう', 'where is the train station': '駅はどこですか', 'how much does this cost': 'これはいくらですか', 'i would like a coffee': 'コーヒーをください', goodnight: 'おやすみなさい', please: 'お願いします', goodbye: 'さようなら' },
        it: { hello: 'ciao', 'good morning': 'buongiorno', 'thank you': 'grazie', 'where is the train station': 'dov’è la stazione?', 'how much does this cost': 'quanto costa?', 'i would like a coffee': 'vorrei un caffè', goodnight: 'buonanotte', please: 'per favore', goodbye: 'arrivederci' }
      };
      let from = 'en', to = 'es', text = 'Hello', out = 'hola';
      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 16px 4px"><button class="nav-btn"></button><span class="nav-title">Translate</span><button class="nav-btn">⇄</button></div>
        <div style="display:flex;align-items:center;justify-content:center;gap:22px;padding:6px 20px 12px">
          <button id="fromLang" style="color:#0a84ff;font-size:13px;font-weight:600">${LANGS[from]}</button>
          <span style="color:#8e8e93">→</span>
          <button id="toLang" style="color:#0a84ff;font-size:13px;font-weight:600">${LANGS[to]}</button>
        </div>
        <div style="margin:0 16px 12px;background:#fff;border-radius:14px;padding:14px">
          <textarea id="trInput" style="width:100%;height:88px;border:0;outline:0;resize:none;font-size:17px;font-family:inherit" placeholder="Enter text">${esc(text)}</textarea>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#8e8e93"><span>Detected language</span><span>🔊</span></div>
        </div>
        <div style="margin:0 16px;background:linear-gradient(160deg,#eef4ff,#e3edff);border-radius:14px;padding:14px;min-height:120px">
          <div id="trOut" style="font-size:20px;font-weight:500;line-height:1.35">${esc(out)}</div>
          <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:11px;color:#6b7a90"><span>${LANGS[to]} · ${LANGS[from]}</span><button id="speakOut">🔊 Listen</button></div>
        </div>
        <div style="text-align:center;padding:16px"><button class="pill-btn" id="translateBtn">Translate</button></div>
        <div class="section-label">Phrases</div>
        <div class="list-card" style="margin:0 16px 24px">
          ${Object.keys(DICT[to] || {}).slice(0, 5).map((k) => `<button class="list-row" data-phrase="${esc(k)}" style="width:100%;text-align:left;background:none"><span style="flex:1"><b>${esc(k)}</b><span style="display:block;font-size:11px;color:#8e8e93">${esc(DICT[to][k])}</span></span><span class="chev">🔊</span></button>`).join('')}
        </div>
      </div>`;
      function translate() {
        const src = $('#trInput', view).value.trim();
        const key = src.toLowerCase();
        const dict = DICT[to] || {};
        let result = dict[key];
        if (!result) {
          result = Object.keys(dict).find((k) => key.includes(k)) ? dict[Object.keys(dict).find((k) => key.includes(k))] : `“${src}” (${LANGS[to]} translation simulated)`;
        }
        $('#trOut', view).textContent = result;
        ctx.toast('Translated', '🌐');
      }
      view.addEventListener('click', (e) => {
        if (e.target.closest('#translateBtn')) { translate(); return; }
        if (e.target.closest('#speakOut')) {
          const txt = $('#trOut', view).textContent;
          if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(txt); u.lang = to; speechSynthesis.speak(u); }
          else ctx.toast('Speaking…', '🔊');
          return;
        }
        const p = e.target.closest('[data-phrase]');
        if (p) { $('#trInput', view).value = p.dataset.phrase; translate(); return; }
        if (e.target.closest('#toLang') || e.target.closest('#fromLang')) {
          const keys = Object.keys(LANGS);
          const next = keys[(keys.indexOf(to) + 1) % keys.length];
          to = next;
          $('#toLang', view).textContent = LANGS[to];
          $('#fromLang', view).textContent = LANGS[from];
          translate();
        }
      });
      $('#trInput', view).addEventListener('input', () => { clearTimeout(window.__trT); window.__trT = setTimeout(translate, 420); });
      return () => { };
    }
  };

  /* =========================================================
     SHORTCUTS
     ========================================================= */
  Apps.shortcuts = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const actions = [
        { n: 'Start Focus', s: 'Turn on Do Not Disturb', i: '☾', c: 'linear-gradient(150deg,#5e5ce6,#3634a3)', run: () => { const t = ctx.db.get('toggles', {}); t.focus = true; ctx.db.set('toggles', t); } },
        { n: 'Play Focus Mix', s: 'Start the Music app', i: '♪', c: 'linear-gradient(150deg,#fb5c74,#b3082f)', run: () => { window.Sim.music.play(); } },
        { n: 'Aurora Wallpaper', s: 'Set a new wallpaper', i: '🖼', c: 'linear-gradient(150deg,#ff9a3d,#7a1aff)', run: () => window.Sim.setWallpaper('aurora') },
        { n: 'Toggle Flashlight', s: 'Control Center shortcut', i: '✦', c: 'linear-gradient(150deg,#ffd60a,#ff9f0a)', run: () => window.Sim.toggleSetting('flash') },
        { n: 'New Note', s: 'Quick capture', i: '✎', c: 'linear-gradient(150deg,#ffd60a,#ff9f0a)', run: () => ctx.open('notes') },
        { n: 'Open Camera', s: 'Capture a moment', i: '📷', c: 'linear-gradient(150deg,#3a3a3c,#000)', run: () => ctx.open('camera') },
        { n: 'Message Emma', s: 'Send a quick hello', i: '💬', c: 'linear-gradient(150deg,#5ee87a,#12b34a)', run: () => ctx.open('messages') },
        { n: 'Morning Brief', s: 'Weather + calendar + music', i: '☀️', c: 'linear-gradient(150deg,#4fa8ff,#1b69dc)', run: () => ctx.open('weather') }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Shortcuts</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 10px">
          ${actions.map((a, i) => `<button data-sc="${i}" style="border-radius:16px;overflow:hidden;text-align:left;background:#fff;padding:0;box-shadow:0 1px 4px rgba(0,0,0,.06)">
            <div style="height:74px;background:${a.c};display:grid;place-items:center;font-size:30px;color:#fff">${a.i}</div>
            <div style="padding:8px 10px 10px"><b style="font-size:12.5px;display:block">${a.n}</b><span style="font-size:10px;color:#8e8e93">${a.s}</span></div>
          </button>`).join('')}
        </div>
        <div class="section-label">Automation</div>
        <div class="list-card" style="margin:0 16px 20px">
          <div class="list-row"><span class="lr-icon" style="background:#0a84ff">⏰</span><span class="lr-main"><b>When I arrive home</b><span>Turn on lights · 2 actions</span></span><span class="ios-switch on"></span></div>
          <div class="list-row"><span class="lr-icon" style="background:#5e5ce6">☾</span><span class="lr-main"><b>Sleep Focus</b><span>Daily at 11:00 PM</span></span><span class="ios-switch on"></span></div>
        </div>
        <div class="settings-note">Shortcuts run inside the simulator and modify its live state.</div>
      </div>`;
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-sc]');
        if (!b) return;
        const a = actions[+b.dataset.sc];
        a.run(); ctx.toast(a.n + ' ✓', '⚡');
        ctx.audio.tone(920, .1, 'sine', .03);
      });
      return () => { };
    }
  };

  /* =========================================================
     TV
  ========================================================= */
  Apps.tv = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      const clean = bag();
      let overlay = null, playing = false, timer = null, pct = 0;
      const shows = [
        { t: 'The Silicon Coast', s: 'Season 2 · Episode 4', g: '🌉', c: 'linear-gradient(150deg,#0f2027,#2c5364)' },
        { t: 'Orbit', s: 'Season 1 · Episode 1', g: '🛰️', c: 'linear-gradient(150deg,#1a2a6c,#b21f1f)' },
        { t: 'Design Language', s: 'Documentary · 52 min', g: '✏️', c: 'linear-gradient(150deg,#42275a,#734b6d)' },
        { t: 'Night Drive', s: 'Film · 1h 48m', g: '🌃', c: 'linear-gradient(150deg,#000428,#004e92)' },
        { t: 'Wild Cupertino', s: 'Season 1 · Episode 2', g: '🦌', c: 'linear-gradient(150deg,#134e5e,#71b280)' }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px"><button class="nav-btn" style="color:#fff">‹</button><span class="nav-title">Apple TV</span><button class="nav-btn" style="color:#fff">👤</button></div>
        <div style="margin:6px 16px 18px;height:190px;border-radius:16px;background:linear-gradient(150deg,#0f2027,#2c5364);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:16px">
          <div style="position:absolute;right:10px;top:0;font-size:130px;opacity:.18">🌉</div>
          <span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8ecae6;font-weight:700">Apple TV+ Original</span>
          <b style="font-size:26px;letter-spacing:-.02em;color:#fff">The Silicon Coast</b>
          <span style="font-size:11px;color:#a9b6c4">New episode Fridays</span>
          <button data-tv="0" style="align-self:flex-start;margin-top:10px;background:#fff;color:#000;padding:7px 18px;border-radius:999px;font-size:12px;font-weight:600">▶ Play</button>
        </div>
        <div class="section-label" style="color:#8e8e93">Up Next</div>
        <div style="display:flex;gap:12px;overflow-x:auto;padding:0 16px 10px">
          ${shows.map((s, i) => `<button data-tv="${i}" style="flex:none;width:150px;text-align:left">
            <span style="height:92px;border-radius:10px;background:${s.c};display:grid;place-items:center;font-size:34px">${s.g}</span>
            <b style="display:block;font-size:12px;margin-top:6px;color:#fff">${s.t}</b><span style="font-size:10px;color:#8e8e93">${s.s}</span>
          </button>`).join('')}
        </div>
        <div class="section-label" style="color:#8e8e93">Trending</div>
        <div style="padding:0 16px 24px">
          ${shows.slice().reverse().map((s, i) => `<div style="display:flex;gap:11px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <span style="width:52px;height:52px;border-radius:8px;background:${s.c};display:grid;place-items:center;font-size:22px">${s.g}</span>
            <span style="flex:1"><b style="font-size:13px;color:#fff;display:block">${s.t}</b><span style="font-size:10px;color:#8e8e93">${s.s}</span></span>
            <button data-tv="${shows.length - 1 - i}" style="color:#fff;font-size:16px">▶</button>
          </div>`).join('')}
        </div>
      </div>`;
      function openPlayer(i) {
        const s = shows[i];
        overlay = document.createElement('div');
        overlay.className = 'photo-viewer';
        pct = 0; playing = true;
        overlay.innerHTML = `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;background:${s.c};position:relative">
            <span style="font-size:70px">${s.g}</span><b style="font-size:22px;margin-top:10px">${s.t}</b><span style="font-size:12px;opacity:.8">${s.s}</span>
            <button data-tv-close style="position:absolute;top:56px;left:18px;color:#fff;font-size:22px">✕</button>
            <div style="position:absolute;left:18px;right:18px;bottom:30px">
              <div style="height:4px;background:rgba(255,255,255,.3);border-radius:2px"><div id="tvBar" style="height:100%;width:0;background:#fff;border-radius:2px"></div></div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:rgba(255,255,255,.8)"><span id="tvTime">0:00</span><span>52:00</span></div>
              <button data-tv-toggle style="margin:12px auto 0;display:block;width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);color:#fff;font-size:20px">❚❚</button>
            </div>
          </div>`;
        view.querySelector('.app-body').appendChild(overlay);
        timer = setInterval(() => {
          if (!playing) return;
          pct += 0.5;
          if (pct >= 100) { pct = 100; playing = false; }
          const bar = overlay.querySelector('#tvBar'), tm = overlay.querySelector('#tvTime');
          if (bar) bar.style.width = pct + '%';
          if (tm) { const sec = Math.floor(pct * 31.2); tm.textContent = `${Math.floor(sec / 60)}:${pad(sec % 60)}`; }
          if (pct >= 100) { const btn = overlay.querySelector('[data-tv-toggle]'); if (btn) btn.textContent = '▶'; }
        }, 200);
        clean.add(() => clearInterval(timer));
        overlay.addEventListener('click', (e) => {
          if (e.target.closest('[data-tv-close]')) { clearInterval(timer); overlay.remove(); overlay = null; return; }
          if (e.target.closest('[data-tv-toggle]')) { playing = !playing; e.target.closest('[data-tv-toggle]').textContent = playing ? '❚❚' : '▶'; }
        });
      }
      view.addEventListener('click', (e) => {
        const t = e.target.closest('[data-tv]');
        if (t) openPlayer(+t.dataset.tv);
      });
      return () => clean.run();
    }
  };

  /* =========================================================
     FIND MY
  ========================================================= */
  Apps.findmy = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const devices = [
        { n: 'iPhone 18 Pro', s: 'This device · Cupertino', i: '📱', c: '#0a84ff', on: true },
        { n: 'AirPods Pro', s: 'Nearby · 12:04 PM', i: '🎧', c: '#5e5ce6', on: true },
        { n: 'MacBook Pro', s: 'Home · 2 hours ago', i: '💻', c: '#8e8e93', on: false },
        { n: 'Apple Watch', s: 'On your wrist', i: '⌚', c: '#30d158', on: true },
        { n: 'AirTag — Backpack', s: 'Last seen near Apple Park', i: '🏷️', c: '#ff9f0a', on: true }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Find My</div>
        <div style="margin:0 16px 14px;height:150px;border-radius:14px;position:relative;overflow:hidden;background:#dfe7dc">
          <div style="position:absolute;inset:0;background-image:linear-gradient(#c8d3c4 1px,transparent 1px),linear-gradient(90deg,#c8d3c4 1px,transparent 1px);background-size:30px 30px"></div>
          <div style="position:absolute;left:52%;top:46%"><span class="map-user" style="position:absolute;left:0;top:0"></span></div>
          <div style="position:absolute;right:12px;bottom:10px;background:rgba(255,255,255,.9);border-radius:8px;padding:4px 8px;font-size:9px;color:#555">Cupertino</div>
        </div>
        <div class="section-label">Devices</div>
        <div class="list-card" style="margin:0 16px 14px">
          ${devices.map((d, i) => `<button class="list-row" data-device="${i}" style="width:100%;text-align:left;background:none">
            <span class="lr-icon" style="background:${d.c}">${d.i}</span>
            <span class="lr-main"><b>${d.n}</b><span>${d.s}</span></span>
            <span class="chev">›</span></button>`).join('')}
        </div>
        <div class="list-card" style="margin:0 16px 20px">
          <div class="list-row"><span class="lr-icon" style="background:#30d158">✓</span><span class="lr-main"><b>Share My Location</b><span>Sharing with Family</span></span><span class="ios-switch on"></span></div>
          <div class="list-row"><span class="lr-icon" style="background:#0a84ff">👨‍👩‍👧</span><span class="lr-main"><b>People</b><span>3 people</span></span><span class="chev">›</span></div>
        </div>
      </div>`;
      view.addEventListener('click', (e) => {
        const d = e.target.closest('[data-device]');
        if (d) { const dev = devices[+d.dataset.device]; ctx.toast(`Playing sound on ${dev.n}`, '🔔'); ctx.audio.tone(1180, .3, 'sine', .05); }
      });
      return () => { };
    }
  };

  /* =========================================================
     TIPS
  ========================================================= */
  Apps.tips = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const tips = [
        { t: 'Meet the Dynamic Island', d: 'Calls, timers, and music live at the top of your screen. Tap it to jump back into an activity.', i: '🏝️', c: 'linear-gradient(150deg,#000,#2c2c2e)' },
        { t: 'Make your Lock Screen yours', d: 'Change the wallpaper from Settings. The clock, widgets, and notifications adapt automatically.', i: '🔒', c: 'linear-gradient(150deg,#ff9a3d,#7a1aff)' },
        { t: 'Control everything fast', d: 'Swipe down from the top right for Control Center. Toggle Wi‑Fi, dark mode, flashlight, and music.', i: '🎛️', c: 'linear-gradient(150deg,#0a84ff,#5e5ce6)' },
        { t: 'Your camera, upgraded', d: 'Open Camera to use your browser’s camera, flip between lenses, and save photos to Photos.', i: '📷', c: 'linear-gradient(150deg,#3a3a3c,#000)' },
        { t: 'Search from anywhere', d: 'Swipe down on the Home Screen to open Spotlight. Find apps, notes, and messages instantly.', i: '🔍', c: 'linear-gradient(150deg,#8e8e93,#48484a)' }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Tips</div>
        <div style="margin:0 16px 16px;border-radius:16px;height:150px;background:linear-gradient(150deg,#0a84ff,#5e5ce6,#bf5af2);color:#fff;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;position:relative;overflow:hidden">
          <span style="position:absolute;right:8px;top:-20px;font-size:120px;opacity:.18">💡</span>
          <b style="font-size:22px">Get the most from iPhone</b><span style="font-size:11px;opacity:.85">A few gestures worth knowing</span>
        </div>
        ${tips.map((t, i) => `<button class="list-row" data-tip="${i}" style="width:100%;text-align:left;background:#fff;border-bottom:1px solid #eee;padding:12px 16px">
          <span class="lr-icon" style="background:${t.c}">${t.i}</span>
          <span class="lr-main"><b>${t.t}</b><span style="white-space:normal">${t.d}</span></span>
          <span class="chev">›</span></button>`).join('')}
        <div style="height:20px"></div>
      </div>`;
      view.addEventListener('click', (e) => {
        const t = e.target.closest('[data-tip]');
        if (t) { const tip = tips[+t.dataset.tip]; ctx.toast(tip.t, '💡'); }
      });
      return () => { };
    }
  };

  /* =========================================================
     WATCH
  ========================================================= */
  Apps.watch = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      const clean = bag();
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column;align-items:center">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px;width:100%"><button class="nav-btn" style="color:#fff">‹</button><span class="nav-title">Watch</span><button class="nav-btn" style="color:#fff">⋯</button></div>
        <div style="width:250px;height:300px;border-radius:64px;background:linear-gradient(160deg,#3a3a3c,#0a0a0c);padding:16px;box-shadow:0 24px 50px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.1);margin:8px 0 18px;position:relative;overflow:hidden">
          <div style="position:absolute;right:-20px;top:20px;width:36px;height:76px;border-radius:12px;background:linear-gradient(160deg,#5a5a5e,#1c1c1e)"></div>
          <div style="position:absolute;inset:16px;border-radius:52px;background:radial-gradient(circle at 40% 30%,#182430,#05080c);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
            <div style="font-size:11px;color:#ff9f0a;letter-spacing:.12em;text-transform:uppercase">Activity</div>
            <div id="watchTime" style="font-size:54px;font-weight:200;letter-spacing:-.04em;font-variant-numeric:tabular-nums">9:41</div>
            <div style="display:flex;gap:12px;font-size:10px;color:#8e8e93;margin-top:4px"><span>❤️ 68</span><span>🔥 420</span><span>👟 8,412</span></div>
            <div style="display:flex;gap:8px;margin-top:18px">
              ${[['#ff2d55', '78%'], ['#a3f56b', '86%'], ['#5ee0f0', '75%']].map(([c, v]) => `<span style="width:34px;height:34px;border-radius:50%;border:4px solid ${c};display:grid;place-items:center;font-size:8px;color:#fff;opacity:.9">${v}</span>`).join('')}
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:0 26px;width:100%">
          ${[['⌚', 'Faces'], ['🏃', 'Workout'], ['❤️', 'Heart'], ['🎵', 'Music'], ['🌤', 'Weather'], ['⏰', 'Alarm'], ['🗺️', 'Maps'], ['💬', 'Messages']].map(([i, n]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><span style="width:46px;height:46px;border-radius:50%;background:#1c1c1e;display:grid;place-items:center;font-size:18px">${i}</span><span style="font-size:9px;color:#8e8e93">${n}</span></div>`).join('')}
        </div>
        <div style="color:#6a6a70;font-size:11px;text-align:center;padding:22px 30px">Apple Watch Ultra · 49mm titanium · Paired to Alex’s iPhone</div>
      </div>`;
      const tick = setInterval(() => {
        const el = $('#watchTime', view);
        if (el) el.textContent = window.Sim.fmtTime();
      }, 1000);
      clean.add(() => clearInterval(tick));
      return () => clean.run();
    }
  };

  /* =========================================================
     FITNESS
  ========================================================= */
  Apps.fitness = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('health-app');
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Fitness</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 16px">
          ${[['Move', '420/650', '#ff2d55', 'kcal'], ['Exercise', '24/30', '#a3f56b', 'min'], ['Stand', '9/12', '#5ee0f0', 'hrs'], ['Steps', '8,412', '#ff9f0a', 'today']].map(([n, v, c, u]) => `<div style="background:#f7f7f9;border-radius:14px;padding:12px;border-left:4px solid ${c}"><small style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#8e8e93;font-weight:600">${n}</small><b style="display:block;font-size:22px;margin-top:3px">${v}</b><span style="font-size:10px;color:#8e8e93">${u}</span></div>`).join('')}
        </div>
        <div class="section-label">Weekly Summary</div>
        <div class="list-card" style="margin:0 16px 16px;padding:14px">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;height:110px;gap:8px">
            ${[55, 72, 48, 88, 66, 80, 58].map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end">
              <span style="width:100%;height:${v}%;background:${i === 4 ? 'linear-gradient(180deg,#ff2d55,#ff6482)' : '#e8e8ed'};border-radius:6px"></span>
              <small style="font-size:9px;color:#8e8e93">${['월', '화', '수', '목', '금', '토', '일'][i]}</small></div>`).join('')}
          </div>
        </div>
        <div class="section-label">Workouts</div>
        <div class="list-card" style="margin:0 16px 24px">
          <div class="list-row"><span class="lr-icon" style="background:#30d158">🏃</span><span class="lr-main"><b>Outdoor Walk</b><span>2.4 mi · 32 min · 218 kcal</span></span><span class="chev">›</span></div>
          <div class="list-row"><span class="lr-icon" style="background:#5e5ce6">🏋️</span><span class="lr-main"><b>Strength Training</b><span>24 min · 186 kcal</span></span><span class="chev">›</span></div>
          <div class="list-row"><span class="lr-icon" style="background:#0a84ff">🚴</span><span class="lr-main"><b>Cycling</b><span>6.2 mi · 28 min · 340 kcal</span></span><span class="chev">›</span></div>
        </div>
      </div>`;
      return () => { };
    }
  };

  /* =========================================================
     JOURNAL
  ========================================================= */
  Apps.journal = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const clean = bag();
      let entries = ctx.db.get('journal', []);
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Journal</div>
        <div style="margin:0 16px 14px;border-radius:16px;padding:16px;background:linear-gradient(150deg,#fff,#f3f3f6);border:1px solid #e8e8ed">
          <b style="font-size:15px">What made you smile today?</b>
          <div style="font-size:11px;color:#8e8e93;margin:3px 0 10px">Reflect on a small moment</div>
          <textarea id="jInput" placeholder="Start writing…" style="width:100%;height:76px;border:1px solid #e0e0e6;border-radius:10px;padding:10px;font-size:14px;font-family:inherit;outline:0;resize:none"></textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span style="font-size:11px;color:#8e8e93">${new Date().toLocaleDateString('ko-KR', { weekday: 'long', month: 'short', day: 'numeric' })}</span><button class="pill-btn" id="jSave">Save Entry</button></div>
        </div>
        <div class="section-label">Previous Entries</div>
        <div id="jList" style="padding:0 16px 24px">${entries.length ? entries.map((e) => `<div style="background:#fff;border-radius:12px;padding:12px;margin-bottom:10px"><div style="font-size:10px;color:#8e8e93;margin-bottom:4px">${esc(e.date)}</div><div style="font-size:14px;line-height:1.45;white-space:pre-line">${esc(e.text)}</div></div>`).join('') : '<div class="empty-state"><span class="big">📓</span>No entries yet<br><span style="font-size:12px">Your reflections appear here.</span></div>'}</div>
      </div>`;
      $('#jSave', view).addEventListener('click', () => {
        const text = $('#jInput', view).value.trim();
        if (!text) { ctx.toast('Write something first', '✎'); return; }
        entries.unshift({ date: new Date().toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' }), text });
        ctx.db.set('journal', entries);
        $('#jInput', view).value = '';
        $('#jList', view).innerHTML = entries.map((e) => `<div style="background:#fff;border-radius:12px;padding:12px;margin-bottom:10px"><div style="font-size:10px;color:#8e8e93;margin-bottom:4px">${esc(e.date)}</div><div style="font-size:14px;line-height:1.45;white-space:pre-line">${esc(e.text)}</div></div>`).join('');
        ctx.toast('Entry saved', '📓');
      });
      return () => clean.run();
    }
  };

  /* =========================================================
     MEASURE
     ========================================================= */
  Apps.measure = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      let measured = false;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px"><button class="nav-btn" style="color:#fff">‹</button><span class="nav-title">Measure</span><button class="nav-btn" style="color:#fff">⋯</button></div>
        <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;min-height:380px;overflow:hidden">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(255,255,255,.06),transparent 55%)"></div>
          <div style="width:200px;height:200px;border:1.5px solid rgba(255,255,255,.15);border-radius:50%;display:grid;place-items:center;position:relative">
            <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.12)"></div>
            <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.12)"></div>
            <div id="measureLine" style="position:absolute;left:38px;right:38px;top:96px;height:2px;background:#ffd60a;display:none"></div>
            <span id="measureVal" style="font-size:38px;font-weight:200;color:#ffd60a">—</span>
          </div>
          <div style="position:absolute;bottom:24px;font-size:11px;color:#8e8e93;text-align:center">Point your camera at an object<br>then tap Measure</div>
        </div>
        <div style="display:flex;justify-content:center;gap:22px;padding:16px 0 28px">
          <button class="pill-btn" id="measureBtn" style="background:rgba(255,214,10,.18);color:#ffd60a">Measure</button>
          <button class="pill-btn ghost" style="background:rgba(255,255,255,.14);color:#fff">Level</button>
        </div>
      </div>`;
      $('#measureBtn', view).addEventListener('click', () => {
        measured = !measured;
        $('#measureLine', view).style.display = measured ? 'block' : 'none';
        const val = (Math.random() * 3 + .4).toFixed(1);
        $('#measureVal', view).textContent = measured ? `${val} cm` : '—';
        ctx.toast(measured ? 'Measurement captured' : 'Measurement cleared', '📐');
        ctx.audio.click(900);
      });
      return () => { };
    }
  };

  /* =========================================================
     COMPASS
  ========================================================= */
  Apps.compass = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      const clean = bag();
      let heading = 42;
      let usingDevice = false;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column;align-items:center">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px;width:100%"><button class="nav-btn" style="color:#fff">‹</button><span class="nav-title">Compass</span><button class="nav-btn" style="color:#fff">⋯</button></div>
        <div style="position:relative;width:280px;height:280px;margin-top:10px">
          <div id="compassDial" style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:radial-gradient(circle,#141416,#050506)">
            <div style="position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,255,255,.12) 0deg 1deg,transparent 1deg 10deg);opacity:.5"></div>
            ${[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(${a}deg) translateY(-118px);font-size:12px;font-weight:600;color:${a === 0 ? '#ff453a' : '#fff'}">${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][i]}</span>`).join('')}
            <div id="compassNeedle" style="position:absolute;inset:0;transition:transform .3s ease">
              <span style="position:absolute;left:50%;top:50%;width:7px;height:108px;background:linear-gradient(#ff453a 0 50%,#fff 50%);transform:translate(-50%,-100%);border-radius:4px 4px 0 0"></span>
              <span style="position:absolute;left:50%;top:50%;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:14px solid #ff453a;transform:translate(-50%,-116px)"></span>
            </div>
            <span style="position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;background:#fff;transform:translate(-50%,-50%)"></span>
          </div>
        </div>
        <div style="text-align:center;padding:18px 0 6px"><div id="headingVal" style="font-size:46px;font-weight:200;letter-spacing:-.03em">42°</div><div style="font-size:12px;color:#8e8e93">NE · Cupertino, CA</div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:20px 20px 30px;width:100%">
          ${[['Elevation', '58 ft'], ['Incline', '2°'], ['Accuracy', 'Good']].map(([n, v]) => `<div style="background:rgba(255,255,255,.07);border-radius:12px;padding:10px;text-align:center"><span style="font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#8e8e93">${n}</span><b style="display:block;font-size:14px;margin-top:2px;color:#fff">${v}</b></div>`).join('')}
        </div>
      </div>`;
      const paint = () => {
        const dial = $('#compassDial', view);
        if (!dial) return;
        const needle = $('#compassNeedle', view);
        if (needle) needle.style.transform = `rotate(${-heading}deg)`;
        const val = $('#headingVal', view);
        if (val) val.textContent = Math.round(heading) + '°';
      };
      const onOrient = (e) => {
        if (typeof e.webkitCompassHeading === 'number') { heading = e.webkitCompassHeading; usingDevice = true; paint(); }
        else if (typeof e.alpha === 'number') { heading = (360 - e.alpha) % 360; usingDevice = true; paint(); }
      };
      window.addEventListener('deviceorientationabsolute', onOrient, true);
      window.addEventListener('deviceorientation', onOrient, true);
      clean.add(() => { window.removeEventListener('deviceorientationabsolute', onOrient, true); window.removeEventListener('deviceorientation', onOrient, true); });
      const drift = setInterval(() => {
        if (!usingDevice) { heading = (heading + (Math.random() - .5) * 2 + 360) % 360; paint(); }
      }, 1200);
      clean.add(() => clearInterval(drift));
      paint();
      return () => clean.run();
    }
  };

  /* =========================================================
     SCREEN TIME
  ========================================================= */
  Apps.screentime = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const apps = [['Social', '1h 42m', '#ff453a', 62], ['Entertainment', '58m', '#bf5af2', 40], ['Productivity', '34m', '#0a84ff', 24], ['Creativity', '21m', '#30d158', 15], ['Other', '12m', '#8e8e93', 9]];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="large-title pt">Screen Time</div>
        <div style="margin:0 16px 16px;background:#fff;border-radius:14px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06)">
          <div style="font-size:11px;color:#8e8e93">Daily Average</div>
          <div style="font-size:44px;font-weight:300;letter-spacing:-.03em">3h 47m</div>
          <div style="font-size:11px;color:#30d158">▼ 18% from last week</div>
          <div style="display:flex;align-items:flex-end;justify-content:space-between;height:80px;gap:7px;margin-top:14px">
            ${[48, 66, 54, 82, 70, 38, 58].map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><span style="width:100%;height:${v}%;background:${i === 3 ? '#0a84ff' : '#e8e8ed'};border-radius:5px"></span><small style="font-size:9px;color:#8e8e93">${['월', '화', '수', '목', '금', '토', '일'][i]}</small></div>`).join('')}
          </div>
        </div>
        <div class="section-label">Most Used</div>
        <div class="list-card" style="margin:0 16px 16px">
          ${apps.map(([n, t, c, p]) => `<div style="padding:11px 14px;border-bottom:1px solid #eee">
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>${n}</span><span style="color:#8e8e93">${t}</span></div>
            <div style="height:7px;border-radius:4px;background:#f0f0f4;overflow:hidden"><div style="width:${p}%;height:100%;background:${c};border-radius:4px"></div></div>
          </div>`).join('')}
        </div>
        <div class="section-label">Limits</div>
        <div class="list-card" style="margin:0 16px 24px">
          <div class="list-row"><span class="lr-icon" style="background:#ff453a">⏳</span><span class="lr-main"><b>Social</b><span>Limit 1 hour · 42 min remaining</span></span><span class="ios-switch on"></span></div>
          <div class="list-row"><span class="lr-icon" style="background:#0a84ff">📱</span><span class="lr-main"><b>Downtime</b><span>10:00 PM – 7:00 AM</span></span><span class="ios-switch on"></span></div>
        </div>
      </div>`;
      return () => { };
    }
  };

  /* =========================================================
     NEWS
  ========================================================= */
  Apps.news = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('store-app');
      const clean = bag();
      const stories = [
        { h: 'iPhone 18 Pro review: the camera that changed everything', s: 'The Verge · 6 min read', i: '📱', c: 'linear-gradient(150deg,#0a84ff,#5e5ce6)', body: 'The iPhone 18 Pro is the most refined iPhone yet. The new 48MP Fusion camera captures remarkable detail, the A20 Pro chip makes everything feel instant, and the titanium frame is lighter than ever. After a week of testing, it is clear that this is a meaningful step forward rather than a spec-sheet update.' },
        { h: 'Apple’s next big bet is on-device intelligence', s: 'Bloomberg · 4 min read', i: '🧠', c: 'linear-gradient(150deg,#bf5af2,#ff375f)', body: 'Apple is doubling down on privacy-first, on-device AI. The company believes the best assistant is one that never sends your data to the cloud. Early results are promising, and developers are already building experiences that take advantage of the new capabilities.' },
        { h: 'The best accessories for your new iPhone', s: 'Wired · 8 min read', i: '🎧', c: 'linear-gradient(150deg,#30d158,#0a84ff)', body: 'From cases to chargers, these are the accessories worth buying for your iPhone 18 Pro. We tested dozens of options and picked the ones that add real value without compromising the design.' },
        { h: 'How the Dynamic Island became a design icon', s: 'Design Weekly · 5 min read', i: '🏝️', c: 'linear-gradient(150deg,#ff9f0a,#ff375f)', body: 'When the Dynamic Island first appeared, it was divisive. Now it is one of the most recognizable interface elements in modern computing. We spoke to designers about what makes it work.' }
      ];
      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 18px 6px"><button class="nav-btn"></button><span class="nav-title" style="color:#ff453a;font-weight:800">News</span><button class="nav-btn">🔍</button></div>
        ${stories.map((st, i) => `<button data-story="${i}" style="display:block;width:100%;text-align:left;padding:0 16px 16px">
          <span style="display:block;height:170px;border-radius:14px;background:${st.c};position:relative;overflow:hidden"><span style="position:absolute;right:12px;top:8px;font-size:90px;opacity:.25">${st.i}</span></span>
          <b style="display:block;font-size:18px;line-height:1.25;letter-spacing:-.02em;margin:8px 0 4px">${st.h}</b>
          <span style="font-size:11px;color:#8e8e93">${st.s}</span>
        </button>`).join('')}
      </div>`;
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-story]');
        if (!b) return;
        const st = stories[+b.dataset.story];
        const r = document.createElement('div');
        r.className = 'mail-reader';
        r.innerHTML = `<div class="app-nav" style="height:auto;padding:56px 16px 8px;border-bottom:1px solid #e5e5ea"><button class="nav-btn" data-close-story style="color:#ff453a">‹ News</button><span class="nav-title"></span><button class="nav-btn">□↑</button></div>
          <div class="mr-body"><div style="height:140px;border-radius:14px;background:${st.c};display:grid;place-items:center;font-size:56px;margin-bottom:14px">${st.i}</div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#ff453a;font-weight:700">${esc(st.s.split(' · ')[0])}</div>
          <h2 style="font-size:23px;letter-spacing:-.02em;margin:6px 0 10px;line-height:1.25">${esc(st.h)}</h2>
          <p style="font-size:15px;line-height:1.6;color:#333">${esc(st.body)}</p>
          <p style="font-size:11px;color:#8e8e93;margin-top:20px">Demo article for the iPhone 18 simulator.</p></div>`;
        view.querySelector('.app-body').appendChild(r);
        r.querySelector('[data-close-story]').addEventListener('click', () => r.remove());
      });
      return () => clean.run();
    }
  };

  window.Apps = Apps;
})();
