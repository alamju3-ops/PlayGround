/* Apps part 2 — Productivity & information. */
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
  function nav(title, right = '', left = '') {
    return `<div class="app-nav"><button class="nav-btn" data-nav-left>${left}</button><span class="nav-title">${title}</span><button class="nav-btn" data-nav-right>${right}</button></div>`;
  }

  /* =========================================================
     CLOCK
     ========================================================= */
  Apps.clock = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('clock-app');
      const clean = bag();
      let tab = 'world';
      const sw = { running: false, elapsed: 0, laps: [], last: 0 };
      let timer = { remaining: 0, running: false, total: 0 };
      const cities = [
        { city: 'Cupertino', zone: 'America/Los_Angeles', label: 'Today' },
        { city: 'New York', zone: 'America/New_York', label: 'Today' },
        { city: 'London', zone: 'Europe/London', label: 'Today' },
        { city: 'Tokyo', zone: 'Asia/Tokyo', label: 'Tomorrow' }
      ];

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="large-title pt" style="padding-top:58px">Clock</div>
        <div id="clockTabsContent" style="flex:1;overflow-y:auto"></div>
        <div class="clock-tabs">
          ${[['world', '🌐', 'World Clock'], ['alarms', '⏰', 'Alarms'], ['stopwatch', '⏱', 'Stopwatch'], ['timer', '⏳', 'Timers']].map(([k, i, n]) => `<button data-ctab="${k}" class="${k === 'world' ? 'active' : ''}"><span class="ci">${i}</span>${n}</button>`).join('')}
        </div>
      </div>`;

      const body = $('#clockTabsContent', view);
      let tick = null;

      function render() {
        $$('.clock-tabs button', view).forEach((b) => b.classList.toggle('active', b.dataset.ctab === tab));
        clearInterval(tick); tick = null;
        if (tab === 'world') renderWorld();
        if (tab === 'alarms') renderAlarms();
        if (tab === 'stopwatch') renderStopwatch();
        if (tab === 'timer') renderTimer();
      }

      function timeFor(zone) {
        try {
          return new Intl.DateTimeFormat('ko-KR', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: false }).format(new Date());
        } catch { return '--:--'; }
      }
      function renderWorld() {
        body.innerHTML = `<div class="section-label" style="color:#8e8e93">World Clock</div><div class="world-clock-list" id="worldList">
          ${cities.map((c) => `<div class="world-row" data-city="${c.city}">
            <div class="wc-main"><small>${c.label} · ${c.city}</small><b>${c.city === 'Cupertino' ? 'Cupertino' : c.city}</b></div>
            <div class="wc-time" data-zone="${c.zone}">${timeFor(c.zone)}</div>
          </div>`).join('')}
        </div>
        <div style="text-align:center;color:#6a6a70;font-size:11px;padding:20px">World clock updates live · tap a city for details</div>`;
        tick = setInterval(() => {
          $$('[data-zone]', body).forEach((el) => { el.textContent = timeFor(el.dataset.zone); });
        }, 1000);
        clean.add(() => clearInterval(tick));
      }

      function renderAlarms() {
        const alarms = ctx.db.get('alarms', []);
        body.innerHTML = `<div class="section-label" style="color:#8e8e93">Alarms</div>
          ${alarms.map((a) => `<div class="alarm-row ${a.on ? '' : 'dim'}" data-alarm="${a.id}">
            <div><div class="a-time">${a.time}</div><small>${esc(a.label)}</small></div>
            <button class="ios-switch ${a.on ? 'on' : ''}" data-alarm-toggle="${a.id}" aria-label="Toggle alarm"></button>
          </div>`).join('')}
          <div style="text-align:center;padding:26px"><button class="pill-btn ghost" data-add-alarm style="background:rgba(255,159,10,.16);color:#ff9f0a">＋ Add Alarm</button></div>`;
        body.querySelectorAll('[data-alarm-toggle]').forEach((b) => b.addEventListener('click', () => {
          const list = ctx.db.get('alarms', []);
          const a = list.find((x) => x.id === b.dataset.alarmToggle);
          a.on = !a.on; ctx.db.set('alarms', list); renderAlarms();
        }));
        const add = $('[data-add-alarm]', body);
        if (add) add.addEventListener('click', () => {
          const t = prompt('Alarm time (HH:MM)', '7:00');
          if (!t) return;
          const list = ctx.db.get('alarms', []);
          list.push({ id: 'a' + Date.now(), time: t, label: 'Alarm', on: true });
          ctx.db.set('alarms', list); renderAlarms(); ctx.toast('Alarm added', '⏰');
        });
      }

      function swTime(ms) {
        const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60;
        return `${pad(m)}:${pad(s)}.${pad(cs)}`;
      }
      function renderStopwatch() {
        body.innerHTML = `<div class="stopwatch-time" id="swTime">${swTime(sw.elapsed)}</div>
          <div class="sw-controls">
            <button class="sw-btn ${sw.running ? 'lap' : 'lap'}" id="swLap">${sw.running ? 'Lap' : 'Reset'}</button>
            <button class="sw-btn ${sw.running ? 'stop' : 'start'}" id="swToggle">${sw.running ? 'Stop' : 'Start'}</button>
          </div>
          <div class="sw-laps" id="swLaps">${sw.laps.map((l, i) => `<div class="sw-lap"><span>Lap ${sw.laps.length - i}</span><span>${swTime(l)}</span></div>`).join('')}</div>`;
        const timeEl = $('#swTime', body);
        const paint = () => { if (timeEl.isConnected) timeEl.textContent = swTime(sw.elapsed + (sw.running ? performance.now() - sw.last : 0)); };
        paint();
        tick = setInterval(paint, 32);
        $('#swToggle', body).addEventListener('click', () => {
          if (sw.running) {
            sw.elapsed += performance.now() - sw.last; sw.running = false;
          } else {
            sw.running = true; sw.last = performance.now(); ctx.audio.click(800);
          }
          renderStopwatch();
        });
        $('#swLap', body).addEventListener('click', () => {
          if (!sw.running) { sw.elapsed = 0; sw.laps = []; renderStopwatch(); return; }
          sw.laps.unshift(sw.elapsed + performance.now() - sw.last);
          renderStopwatch();
        });
        clean.add(() => clearInterval(tick));
      }

      function renderTimer() {
        const total = timer.total || 300;
        const rem = timer.running ? timer.remaining : (timer.total ? timer.remaining : total);
        const pct = 1 - rem / total;
        const R = 118, C = 2 * Math.PI * R;
        body.innerHTML = `<div class="timer-dial">
          <svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="${R}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/>
          <circle id="timerRing" cx="130" cy="130" r="${R}" fill="none" stroke="#ff9f0a" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
          <div class="t-time" id="timerText">${pad(Math.floor(rem / 60))}:${pad(Math.floor(rem % 60))}</div>
        </div>
        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 24px">
          ${[1, 5, 10, 15, 30].map((m) => `<button class="pill-btn ghost" style="background:rgba(255,159,10,.14);color:#ff9f0a" data-minute="${m}">${m} min</button>`).join('')}
        </div>
        <div class="sw-controls" style="padding-top:22px"><button class="sw-btn ${timer.running ? 'stop' : 'start'}" id="timerToggle">${timer.running ? 'Pause' : 'Start'}</button><button class="sw-btn lap" id="timerReset">Reset</button></div>`;
        tick = setInterval(() => {
          if (!timer.running) return;
          const now = performance.now();
          const delta = (now - timer.last) / 1000; timer.last = now;
          timer.remaining = Math.max(0, timer.remaining - delta);
          const txt = $('#timerText', body);
          if (txt) txt.textContent = `${pad(Math.floor(timer.remaining / 60))}:${pad(Math.floor(timer.remaining % 60))}`;
          const ring = $('#timerRing', body);
          if (ring) ring.setAttribute('stroke-dashoffset', String(C * (1 - timer.remaining / timer.total)));
          if (timer.remaining <= 0) {
            timer.running = false; ctx.audio.tone(880, .5, 'sine', .1); setTimeout(() => ctx.audio.tone(660, .6, 'sine', .1), 350);
            ctx.toast('Timer finished', '⏳'); renderTimer();
          }
        }, 200);
        clean.add(() => clearInterval(tick));
        $('#timerToggle', body).addEventListener('click', () => {
          if (!timer.total) timer.total = 300;
          if (!timer.remaining) timer.remaining = timer.total;
          timer.running = !timer.running; timer.last = performance.now();
          renderTimer();
        });
        $('#timerReset', body).addEventListener('click', () => { timer = { remaining: 0, running: false, total: 0 }; renderTimer(); });
        body.querySelectorAll('[data-minute]').forEach((b) => b.addEventListener('click', () => {
          const m = +b.dataset.minute; timer = { total: m * 60, remaining: m * 60, running: false }; renderTimer();
        }));
      }

      body.addEventListener('click', (e) => {
        const row = e.target.closest('[data-city]');
        if (row) ctx.toast(`${row.dataset.city} · ${timeFor(cities.find((c) => c.city === row.dataset.city).zone)}`, '🌐');
      });
      view.querySelector('.clock-tabs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-ctab]'); if (!b) return;
        tab = b.dataset.ctab; render();
      });
      render();
      return () => clean.run();
    }
  };

  /* =========================================================
     WEATHER
     ========================================================= */
  Apps.weather = {
    render(view, ctx) {
      theme(view, true);
      const night = ctx.now().getHours() < 6 || ctx.now().getHours() >= 19;
      view.classList.add('weather-app');
      if (night) view.classList.add('night');
      const hourly = [
        { t: 'Now', i: night ? '🌙' : '☀️', d: 72 }, { t: '1PM', i: '☀️', d: 74 }, { t: '2PM', i: '☀️', d: 76 },
        { t: '3PM', i: '⛅', d: 77 }, { t: '4PM', i: '⛅', d: 78 }, { t: '5PM', i: '🌤', d: 76 }, { t: '6PM', i: '🌤', d: 73 },
        { t: '7PM', i: '🌙', d: 70 }, { t: '8PM', i: '🌙', d: 68 }, { t: '9PM', i: '🌙', d: 66 }
      ];
      const days = [
        ['Today', '☀️', 61, 78], ['Sun', '⛅', 60, 76], ['Mon', '🌤', 59, 74], ['Tue', '🌧', 58, 69],
        ['Wed', '🌦', 57, 71], ['Thu', '☀️', 60, 77], ['Fri', '☀️', 62, 80], ['Sat', '⛅', 61, 79], ['Sun', '🌤', 60, 75], ['Mon', '☀️', 61, 78]
      ];
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="wx-hero" style="padding-top:66px">
          <div class="wx-city">Cupertino</div>
          <div class="wx-temp">72°</div>
          <div class="wx-cond">${night ? 'Clear' : 'Sunny'}</div>
          <div class="wx-range">H:78° L:61°</div>
          <div style="font-size:12px;opacity:.8;margin-top:4px">Feels like 72° · Air quality Good</div>
        </div>
        <div class="wx-card"><h4>☀︎ Hourly forecast</h4><div class="wx-hourly">
          ${hourly.map((h) => `<div class="wx-hour"><span>${h.t}</span><span class="wi">${h.i}</span><b>${h.d}°</b></div>`).join('')}
        </div></div>
        <div class="wx-card"><h4>📅 10-day forecast</h4>
          ${days.map(([n, i, lo, hi]) => `<div class="wx-day"><span class="wd-name">${n}</span><span class="wd-icon">${i}</span><span class="wd-lo">${lo}°</span><span class="wd-bar"></span><span class="wd-hi">${hi}°</span></div>`).join('')}
        </div>
        <div class="wx-stats">
          <div class="wx-stat"><small>🌬 Wind</small><b>8 mph</b><p>West-northwest</p></div>
          <div class="wx-stat"><small>💧 Humidity</small><b>42%</b><p>Dew point 48°</p></div>
          <div class="wx-stat"><small>☀︎ UV Index</small><b>5</b><p>Moderate</p></div>
          <div class="wx-stat"><small>🌅 Sunrise</small><b>7:21</b><p>Sunset 6:18 PM</p></div>
        </div>
        <div class="wx-card" style="margin-bottom:24px"><h4>☂ Precipitation</h4><p style="font-size:12px;margin:0;opacity:.8">No precipitation expected for the next 10 days.</p></div>
      </div>`;
      return () => { };
    }
  };

  /* =========================================================
     CALENDAR
     ========================================================= */
  Apps.calendar = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('calendar-app');
      const clean = bag();
      let cursor = new Date();
      let selected = window.Sim.db.data ? new Date() : new Date();
      let selectedKey = keyOf(selected);

      function keyOf(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
      function events() { return ctx.db.get('events', []); }

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div style="padding-top:56px;display:flex;align-items:center;justify-content:space-between;padding-left:18px;padding-right:18px">
          <div><div style="font-size:11px;font-weight:700;color:#ff453a;letter-spacing:.08em">${cursor.getFullYear()}</div>
            <div style="font-size:26px;font-weight:700;letter-spacing:-.02em">${cursor.toLocaleDateString('ko-KR', { month: 'long' })}</div></div>
          <div style="display:flex;gap:14px;color:#0a84ff;font-size:16px">
            <button id="calPrev">‹</button><button id="calToday">Today</button><button id="calNext">›</button>
          </div>
        </div>
        <div class="cal-weekdays">${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<span>${d}</span>`).join('')}</div>
        <div class="cal-grid" id="calGrid"></div>
        <div class="cal-agenda" id="calAgenda"></div>
      </div>`;

      function render() {
        const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const startDay = first.getDay();
        const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        const prevDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate();
        const cells = [];
        for (let i = startDay - 1; i >= 0; i--) cells.push({ d: new Date(cursor.getFullYear(), cursor.getMonth() - 1, prevDays - i), other: true });
        for (let d = 1; d <= daysInMonth; d++) cells.push({ d: new Date(cursor.getFullYear(), cursor.getMonth(), d), other: false });
        while (cells.length % 7 !== 0 || cells.length < 35) cells.push({ d: new Date(cursor.getFullYear(), cursor.getMonth() + 1, cells.length - startDay - daysInMonth + 1), other: true });
        const evs = events();
        $('#calGrid', view).innerHTML = cells.map((c) => {
          const k = keyOf(c.d);
          const today = k === keyOf(new Date());
          const dots = evs.filter((e) => e.date === k).slice(0, 3);
          return `<button class="cal-day ${c.other ? 'other' : ''} ${today ? 'today' : ''} ${k === selectedKey ? 'sel' : ''}" data-date="${k}" style="${k === selectedKey && !today ? 'outline:2px solid #0a84ff;outline-offset:-4px;border-radius:10px' : ''}">
            <span class="num">${c.d.getDate()}</span>
            ${dots.map((e) => `<span class="evdot" style="background:${e.color}"></span>`).join('')}
          </button>`;
        }).join('');
        renderAgenda();
      }

      function renderAgenda() {
        const d = new Date(selectedKey + 'T12:00:00');
        const list = events().filter((e) => e.date === selectedKey);
        $('#calAgenda', view).innerHTML = `<div class="ca-title">${d.toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          ${list.length ? list.map((e) => `<div class="cal-event"><span class="ce-bar" style="background:${e.color}"></span><span style="flex:1"><b>${esc(e.title)}</b><span>${esc(e.time || 'All day')}</span></span><button data-del-event="${e.id}" style="color:#c4c4c8">✕</button></div>`).join('') : '<div style="font-size:13px;color:#8e8e93;padding:8px 0 14px">No events</div>'}
          <div style="display:flex;gap:8px;margin-top:12px">
            <input class="input-line" id="eventTitle" placeholder="New event" style="flex:1;padding:9px 12px;font-size:14px" />
            <input class="input-line" id="eventTime" placeholder="Time" style="width:88px;padding:9px 10px;font-size:13px" value="7:00 PM" />
            <button class="pill-btn" id="eventAdd" style="padding:9px 14px">Add</button>
          </div>`;
        const add = $('#eventAdd', view);
        add.addEventListener('click', () => {
          const title = $('#eventTitle', view).value.trim();
          if (!title) { ctx.toast('Enter an event title', '✎'); return; }
          const colors = ['#ff453a', '#0a84ff', '#30d158', '#ff9f0a', '#bf5af2'];
          const list = events();
          list.push({ id: 'e' + Date.now(), date: selectedKey, title, time: $('#eventTime', view).value || 'All day', color: colors[list.length % colors.length] });
          ctx.db.set('events', list); render(); ctx.toast('Event added', '📅');
        });
        $$('[data-del-event]', view).forEach((b) => b.addEventListener('click', () => {
          const list = events().filter((e) => e.id !== b.dataset.delEvent);
          ctx.db.set('events', list); render();
        }));
      }

      view.addEventListener('click', (e) => {
        if (e.target.closest('#calPrev')) { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); render(); return; }
        if (e.target.closest('#calNext')) { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); render(); return; }
        if (e.target.closest('#calToday')) { cursor = new Date(); selectedKey = keyOf(new Date()); render(); return; }
        const d = e.target.closest('[data-date]');
        if (d) { selectedKey = d.dataset.date; render(); }
      });
      render();
      return () => clean.run();
    }
  };

  /* =========================================================
     CALCULATOR
     ========================================================= */
  Apps.calculator = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('calc-app');
      let current = '0', prev = null, op = null, fresh = true;
      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="calc-display" id="calcDisplay" style="padding-top:70px">0</div>
        <div class="calc-grid">
          <button class="calc-key gray" data-k="AC">AC</button>
          <button class="calc-key gray" data-k="±">±</button>
          <button class="calc-key gray" data-k="%">%</button>
          <button class="calc-key orange" data-k="÷">÷</button>
          <button class="calc-key" data-k="7">7</button><button class="calc-key" data-k="8">8</button><button class="calc-key" data-k="9">9</button><button class="calc-key orange" data-k="×">×</button>
          <button class="calc-key" data-k="4">4</button><button class="calc-key" data-k="5">5</button><button class="calc-key" data-k="6">6</button><button class="calc-key orange" data-k="−">−</button>
          <button class="calc-key" data-k="1">1</button><button class="calc-key" data-k="2">2</button><button class="calc-key" data-k="3">3</button><button class="calc-key orange" data-k="+">+</button>
          <button class="calc-key zero" data-k="0">0</button><button class="calc-key" data-k=".">.</button><button class="calc-key orange" data-k="=">=</button>
        </div>
      </div>`;
      const display = $('#calcDisplay', view);
      const fmt = (n) => {
        if (!isFinite(n)) return 'Error';
        const s = String(Math.round(n * 1e9) / 1e9);
        return s.length > 12 ? Number(n).toExponential(5) : s;
      };
      function compute(a, b, o) {
        switch (o) { case '+': return a + b; case '−': return a - b; case '×': return a * b; case '÷': return b === 0 ? NaN : a / b; default: return b; }
      }
      function paint() {
        display.textContent = current.replace(/-/g, '−');
        display.classList.toggle('shift', current.length > 9);
        $$('.calc-key.orange', view).forEach((b) => b.classList.toggle('active', b.dataset.k === op));
      }
      function press(k) {
        if (/[0-9]/.test(k)) {
          if (fresh) { current = k; fresh = false; }
          else current = current === '0' ? k : (current.replace('-', '').length < 11 ? current + k : current);
        } else if (k === '.') {
          if (fresh) { current = '0.'; fresh = false; }
          else if (!current.includes('.')) current += '.';
        } else if (k === 'AC') {
          current = '0'; prev = null; op = null; fresh = true;
        } else if (k === '±') {
          current = current.startsWith('-') ? current.slice(1) : '-' + current;
        } else if (k === '%') {
          current = fmt(parseFloat(current) / 100); fresh = true;
        } else if (['+', '−', '×', '÷'].includes(k)) {
          if (op && !fresh) { prev = compute(parseFloat(prev), parseFloat(current), op); current = fmt(prev); }
          else prev = parseFloat(current);
          op = k; fresh = true;
        } else if (k === '=') {
          if (op !== null) {
            const result = compute(parseFloat(prev), parseFloat(current), op);
            current = fmt(result); prev = null; op = null; fresh = true;
          }
        }
        ctx.audio.click(560);
        paint();
      }
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]'); if (!b) return;
        press(b.dataset.k);
      });
      view.tabIndex = 0;
      const keys = { '/': '÷', '*': '×', '-': '−', '+': '+', 'Enter': '=', '=': '=', 'Escape': 'AC', 'Backspace': 'AC', '%': '%' };
      const onKey = (e) => {
        if (!window.Sim.currentApp || window.Sim.currentApp.id !== 'calculator') return;
        if (/^[0-9.]$/.test(e.key)) { press(e.key); e.preventDefault(); }
        else if (keys[e.key]) { press(keys[e.key]); e.preventDefault(); }
      };
      document.addEventListener('keydown', onKey);
      paint();
      return () => document.removeEventListener('keydown', onKey);
    }
  };

  /* =========================================================
     NOTES
     ========================================================= */
  Apps.notes = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('notes-app');
      const clean = bag();
      let editing = null;
      let saveTimer = null;
      let query = '';

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div class="app-nav" style="height:auto;padding:56px 16px 4px">
          <button class="nav-btn" style="color:#ff9f0a">‹ Folders</button>
          <span class="nav-title"></span>
          <button class="nav-btn" data-new-note style="color:#ff9f0a">✎</button>
        </div>
        <div class="large-title sm" style="padding-top:2px">Notes</div>
        <div class="app-search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" stroke-width="2"/></svg><input id="noteSearch" placeholder="Search" aria-label="Search notes" /></div>
        <div id="notesList" style="flex:1;overflow-y:auto"></div>
        <div class="note-editor" id="noteEditor" style="display:none"></div>
      </div>`;

      function noteTitle(n) { return (n.body || '').split('\n')[0].slice(0, 40) || 'New Note'; }
      function renderList() {
        const notes = ctx.db.get('notes', []).filter((n) => !query || (n.title + n.body).toLowerCase().includes(query.toLowerCase()));
        $('#notesList', view).innerHTML = notes.length ? notes.map((n) => `
          <button class="note-row" data-open-note="${n.id}" style="width:100%;text-align:left;background:none">
            <b>${esc(n.title)}</b>
            <p>${esc((n.body || '').split('\n').slice(1).join(' ').slice(0, 80) || 'No additional text')}</p>
            <span class="nt">${new Date(n.updated).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · ${new Date(n.updated).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}</span>
          </button>`).join('') : `<div class="empty-state"><span class="big">🗒️</span>No Notes</div>`;
      }

      function openNote(id) {
        const notes = ctx.db.get('notes', []);
        let n = notes.find((x) => x.id === id);
        if (!n) { n = { id: 'n' + Date.now(), title: 'New Note', body: '', updated: Date.now() }; notes.unshift(n); ctx.db.set('notes', notes); }
        editing = n.id;
        const ed = $('#noteEditor', view);
        ed.style.display = 'flex';
        ed.innerHTML = `
          <div class="app-nav" style="height:auto;padding:56px 16px 8px;background:#fbfbfb">
            <button class="nav-btn" data-close-note style="color:#ff9f0a">‹ Notes</button>
            <span class="nav-title"></span>
            <div style="display:flex;gap:14px;color:#ff9f0a;font-size:15px"><button data-share-note>□↑</button><button data-delete-note>🗑</button></div>
          </div>
          <div class="note-tools" style="justify-content:flex-start;gap:18px;padding:8px 20px 6px;border-bottom:1px solid #eee">
            <span class="active">Aa</span><span>☑︎</span><span>📷</span><span>✏️</span><span>＋</span>
          </div>
          <textarea id="noteText" placeholder="Start writing…">${esc(n.body)}</textarea>
          <div class="note-tools"><span>☑︎</span><span>✎</span><span>＋</span><span>⌫</span><span>⊙</span></div>`;
        const ta = $('#noteText', ed);
        setTimeout(() => ta.focus(), 160);
        ta.addEventListener('input', () => {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            const list = ctx.db.get('notes', []);
            const target = list.find((x) => x.id === editing);
            if (!target) return;
            target.body = ta.value;
            target.title = (ta.value.split('\n')[0] || 'New Note').slice(0, 50);
            target.updated = Date.now();
            ctx.db.set('notes', list);
            renderList();
          }, 350);
        });
        ed.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-note]')) {
            saveNow(); ed.style.display = 'none'; editing = null; renderList(); return;
          }
          if (e.target.closest('[data-delete-note]')) {
            const list = ctx.db.get('notes', []).filter((x) => x.id !== editing);
            ctx.db.set('notes', list); ed.style.display = 'none'; editing = null; renderList(); ctx.toast('Note deleted', '🗑'); return;
          }
          if (e.target.closest('[data-share-note]')) ctx.toast('Note copied to clipboard', '□↑');
        });
        function saveNow() {
          const list = ctx.db.get('notes', []);
          const target = list.find((x) => x.id === editing);
          if (target) { target.body = ta.value; target.title = (ta.value.split('\n')[0] || 'New Note').slice(0, 50); target.updated = Date.now(); ctx.db.set('notes', list); }
        }
        clean.add(saveNow);
      }

      view.addEventListener('click', (e) => {
        const open = e.target.closest('[data-open-note]');
        if (open) { openNote(open.dataset.openNote); return; }
        if (e.target.closest('[data-new-note]')) {
          const notes = ctx.db.get('notes', []);
          const n = { id: 'n' + Date.now(), title: 'New Note', body: '', updated: Date.now() };
          notes.unshift(n); ctx.db.set('notes', notes);
          renderList(); openNote(n.id);
        }
      });
      $('#noteSearch', view).addEventListener('input', (e) => { query = e.target.value; renderList(); });
      const onOpen = (e) => { if (!view.isConnected) return; openNote(e.detail); };
      document.addEventListener('sim:opennote', onOpen);
      clean.add(() => document.removeEventListener('sim:opennote', onOpen));

      renderList();
      return () => clean.run();
    }
  };

  /* =========================================================
     SETTINGS
     ========================================================= */
  Apps.settings = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('settings-app');
      const clean = bag();
      let page = 'main';

      const wallpapers = [
        ['aurora', 'Aurora', 'linear-gradient(160deg,#ff9a3d,#ff2f7a 45%,#3d2bff)'],
        ['ocean', 'Ocean', 'linear-gradient(160deg,#6fffd2,#0090ff 50%,#00101f)'],
        ['sunset', 'Sunset', 'linear-gradient(160deg,#ffd166,#ff5e5b 50%,#4a1942)'],
        ['graphite', 'Graphite', 'linear-gradient(160deg,#9ca3af,#2b2f38 60%,#07080b)'],
        ['rose', 'Rose', 'linear-gradient(160deg,#ffd0dd,#ff6f91 50%,#87324f)'],
        ['mint', 'Mint', 'linear-gradient(160deg,#d9ffcf,#5eead4 50%,#115e59)']
      ];

      function row(icon, color, label, value = '', attrs = '', toggle = '') {
        return `<${toggle ? 'div' : 'button'} class="settings-row ${toggle ? '' : 'tap'}" ${attrs}>
          ${icon ? `<span class="sr-icon" style="background:${color}">${icon}</span>` : ''}
          <span style="flex:1">${label}</span>
          ${toggle ? `<span class="ios-switch ${toggle.on ? 'on' : ''}" data-toggle-key="${toggle.key}"></span>` : (value ? `<span class="sr-value">${value}</span>` : '<span class="chev">›</span>')}
        </${toggle ? 'div' : 'button'}>`;
      }

      function header() {
        return `<div class="app-nav" style="height:auto;padding:56px 16px 4px">
          <button class="nav-btn" data-settings-back style="color:#0a84ff">${page === 'main' ? '' : '‹ Settings'}</button>
          <span class="nav-title">${page === 'main' ? '' : pageTitle()}</span>
          <button class="nav-btn"></button></div>`;
      }
      function pageTitle() {
        return { display: 'Display & Brightness', wallpaper: 'Wallpaper', about: 'About', wifi: 'Wi-Fi', general: 'General', privacy: 'Privacy & Security', battery: 'Battery' }[page] || '';
      }

      function mainPage() {
        const toggles = ctx.db.get('toggles', {});
        const dark = ctx.db.get('darkMode', true);
        return `${header()}
          <div class="app-body" style="padding-top:2px">
            <div class="settings-profile">
              <span class="profile-avatar">A</span>
              <span style="flex:1"><b>Alex Morgan</b><span>Apple Account, iCloud, and more</span></span><span class="chev">›</span>
            </div>
            <div class="list-card" style="margin-bottom:14px">
              ${row('✈︎', '#ff9f0a', 'Airplane Mode', '', 'data-setting="airplane"', { key: 'airplane', on: toggles.airplane })}
              ${row('≋', '#0a84ff', 'Wi‑Fi', toggles.wifi ? 'HomeNet‑5G' : 'Off', 'data-setting="wifi"')}
              ${row('ᛒ', '#0a84ff', 'Bluetooth', toggles.bluetooth ? 'On' : 'Off', 'data-setting="bluetooth"')}
              ${row('▮', '#30d158', 'Cellular', 'On', 'data-setting="cellular"')}
            </div>
            <div class="list-card">
              ${row('🔔', '#ff453a', 'Notifications', '')}
              ${row('🔊', '#ff2d55', 'Sounds & Haptics', '')}
              ${row('☾', '#5e5ce6', 'Focus', toggles.focus ? 'On' : 'Off', 'data-setting="focus"')}
              ${row('⏳', '#5856d6', 'Screen Time', '')}
            </div>
            <div class="list-card">
              ${row('◐', '#0a84ff', 'Display & Brightness', '', 'data-page="display"')}
              ${row('🖼', '#30d158', 'Wallpaper', '', 'data-page="wallpaper"')}
              ${row('🔋', '#30d158', 'Battery', '92%', 'data-page="battery"')}
              ${row('⚙️', '#8e8e93', 'General', '', 'data-page="general"')}
              ${row('🔒', '#0a84ff', 'Privacy & Security', '', 'data-page="privacy"')}
            </div>
            <div class="list-card">
              ${row('ℹ️', '#8e8e93', 'About', '', 'data-page="about"')}
              ${row('🔄', '#ff9f0a', 'Reset Simulator', '', 'data-reset')}
            </div>
            <div class="settings-note">iPhone 18 Pro · iOS 26.1 · This simulator stores your data locally in this browser.</div>
          </div>`;
      }

      function displayPage() {
        const b = ctx.db.get('brightness', 100);
        const dark = ctx.db.get('darkMode', true);
        return `${header()}<div class="app-body" style="padding-top:2px">
          <div class="section-label">Appearance</div>
          <div class="list-card">
            ${row('', '', 'Dark Mode', '', '', { key: 'dark', on: dark })}
            <div class="list-row"><span class="lr-main"><b>Brightness</b><span>Adjust the simulated display</span></span></div>
            <div style="padding:0 16px 14px"><input type="range" min="20" max="100" value="${b}" id="setBrightness" style="width:100%;accent-color:#0a84ff" /></div>
          </div>
          <div class="section-label">Display</div>
          <div class="list-card">
            ${row('', '', 'True Tone', 'On')}
            ${row('', '', 'ProMotion', 'Always On')}
            ${row('', '', 'Text Size', 'Default')}
            ${row('', '', 'Bold Text', '', '', { key: 'bold', on: false })}
          </div></div>`;
      }

      function wallpaperPage() {
        return `${header()}<div class="app-body" style="padding-top:2px">
          <div class="section-label">Choose a Wallpaper</div>
          <div class="wallpaper-grid">
            ${wallpapers.map(([k, n, g]) => `<button class="wallpaper-opt ${ctx.db.get('wallpaper') === k ? 'active' : ''}" data-wall="${k}">
              <span style="position:absolute;inset:0;background:${g}"></span><span>${n}</span></button>`).join('')}
          </div>
          ${ctx.db.get('photos', []).length ? `<div class="section-label">Your Photos</div><div class="wallpaper-grid">
            ${ctx.db.get('photos', []).slice(0, 6).map((p) => `<button class="wallpaper-opt" data-wall-photo="${p.id}"><img src="${p.src}" style="width:100%;height:100%;object-fit:cover" alt=""><span>Recent</span></button>`).join('')}
          </div>` : ''}
        </div>`;
      }

      function aboutPage() {
        return `${header()}<div class="app-body" style="padding-top:2px">
          <div class="about-hero"><div class="ah-phone"></div><h3>iPhone 18 Pro</h3><p>Interactive Simulator Edition</p></div>
          <div class="list-card about-list">
            ${row('', '', 'Name', 'Alex’s iPhone')}
            ${row('', '', 'Model Name', 'iPhone 18 Pro')}
            ${row('', '', 'Model Number', 'A3901')}
            ${row('', '', 'Chip', 'A20 Pro')}
            ${row('', '', 'Capacity', '1 TB')}
            ${row('', '', 'Serial Number', 'F2L18P2026')}
            ${row('', '', 'iOS Version', '26.1')}
          </div>
          <div class="settings-note">All product details here are simulated. Built as a browser experience.</div>
        </div>`;
      }

      function simplePage(title, rows) {
        return `${header()}<div class="app-body" style="padding-top:2px">
          ${rows.map(([t, v]) => `<div class="list-card" style="margin-bottom:14px">${row('', '', t, v)}</div>`).join('')}
        </div>`;
      }

      function paint() {
        const el = $('#settingsBody', view);
        if (page === 'main') el.innerHTML = mainPage();
        else if (page === 'display') el.innerHTML = displayPage();
        else if (page === 'wallpaper') el.innerHTML = wallpaperPage();
        else if (page === 'about') el.innerHTML = aboutPage();
        else if (page === 'battery') el.innerHTML = simplePage('Battery', [['Battery Health', '100%'], ['Last Charge', 'Today, 7:12 AM'], ['Screen On', '4h 21m'], ['Low Power Mode', 'Off']]);
        else if (page === 'general') el.innerHTML = simplePage('General', [['Software Update', 'Up to date'], ['AirDrop', 'Contacts Only'], ['AirPlay & Continuity', ''], ['iPhone Storage', '241 GB available'], ['Background App Refresh', 'On'], ['Date & Time', 'Automatic'], ['Reset', '']]);
        else if (page === 'privacy') el.innerHTML = simplePage('Privacy & Security', [['Location Services', 'On'], ['Tracking', 'Ask App Not to Track'], ['Analytics & Improvements', 'Share with Apple'], ['App Privacy Report', '14 trackers blocked'], ['Lockdown Mode', 'Off']]);
        bind();
      }

      function bind() {
        const el = $('#settingsBody', view);
        el.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => { page = b.dataset.page; paint(); }));
        const back = el.querySelector('[data-settings-back]');
        if (back) back.addEventListener('click', () => { page = 'main'; paint(); });
        el.querySelectorAll('[data-setting]').forEach((b) => b.addEventListener('click', () => {
          const key = b.dataset.setting;
          if (key === 'wifi' || key === 'bluetooth' || key === 'cellular' || key === 'airplane') {
            window.Sim.toggleSetting(key);
          } else if (key === 'focus') {
            window.Sim.toggleSetting('focus');
          }
          paint();
        }));
        el.querySelectorAll('[data-toggle-key]').forEach((sw) => sw.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = sw.dataset.toggleKey;
          if (key === 'dark') {
            ctx.db.set('darkMode', !ctx.db.get('darkMode', true));
            window.Sim.updateTheme();
          } else {
            const t = ctx.db.get('toggles', {});
            t[key] = !t[key]; ctx.db.set('toggles', t);
          }
          paint();
        }));
        const brightness = el.querySelector('#setBrightness');
        if (brightness) brightness.addEventListener('input', (e) => window.Sim.applyBrightness(+e.target.value));
        el.querySelectorAll('[data-wall]').forEach((b) => b.addEventListener('click', () => {
          window.Sim.setWallpaper(b.dataset.wall);
          ctx.toast('Wallpaper set', '🖼'); paint();
        }));
        el.querySelectorAll('[data-wall-photo]').forEach((b) => b.addEventListener('click', () => {
          const p = ctx.db.get('photos', []).find((x) => x.id === b.dataset.wallPhoto);
          if (p) { window.Sim.setWallpaperPhoto(p.src); ctx.toast('Wallpaper set', '🖼'); paint(); }
        }));
        const reset = el.querySelector('[data-reset]');
        if (reset) reset.addEventListener('click', () => {
          if (!confirm('Reset the simulator and erase local data?')) return;
          ctx.db.reset(); window.Sim.updateTheme(); window.Sim.setWallpaper(ctx.db.get('wallpaper')); window.Sim.renderHome(); window.Sim.renderNotifications();
          page = 'main'; paint(); ctx.toast('Simulator reset', '✓');
        });
      }

      view.innerHTML = `<div id="settingsBody" style="flex:1;display:flex;flex-direction:column;overflow:hidden"></div>`;
      paint();
      return () => clean.run();
    }
  };

  /* =========================================================
     MAIL
     ========================================================= */
  Apps.mail = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('mail-app');
      const clean = bag();
      const base = [
        { id: 'm1', from: 'Apple', email: 'no_reply@apple.com', subject: 'Your iPhone 18 Pro is ready', time: '8:15 AM', read: false, body: 'Hello Alex,\n\nYour new iPhone 18 Pro is ready to set up. Use Quick Start to transfer your data from your current iPhone — just bring it close.\n\nYour carrier settings and Apple Account will be transferred automatically.\n\n— Apple' },
        { id: 'm2', from: 'Emma', email: 'emma@example.com', subject: 'Launch party tonight 🎉', time: '9:30 AM', read: false, body: 'Hey!\n\nJust confirming — launch party is at 7pm tonight at the studio. Bring your new phone so we can test that camera.\n\nSee you there!\nEmma' },
        { id: 'm3', from: 'Design Team', email: 'design@example.com', subject: 'New mockups + feedback', time: 'Yesterday', read: true, body: 'Hi team,\n\nThe latest mockups are in the shared folder. Please leave comments by Friday.\n\nHighlights:\n• New Dynamic Island states\n• Refined app icon grid\n• Updated Control Center\n\nThanks!' },
        { id: 'm4', from: 'App Store', email: 'no_reply@appstore.com', subject: 'This week’s editors’ picks', time: 'Monday', read: true, body: 'Discover the apps and games our editors are loving this week, handpicked for iPhone 18 Pro.' },
        { id: 'm5', from: 'Mom', email: 'mom@example.com', subject: 'Sunday lunch?', time: 'Sunday', read: true, body: 'Hi honey, are you free for lunch on Sunday? Let me know what time works. Love you!' }
      ];
      let mails = ctx.db.get('mail', base);
      if (!ctx.db.get('mail', null)) ctx.db.set('mail', base);
      let composing = false;

      view.innerHTML = `<div class="app-body no-pad" style="display:flex;flex-direction:column">
        <div id="mailShell" style="flex:1;display:flex;flex-direction:column;overflow:hidden"></div>
        <div class="mail-reader" id="mailReader" style="display:none"></div>
        <div class="mail-reader" id="mailCompose" style="display:none"></div>
      </div>`;

      function listPage() {
        const unread = mails.filter((m) => !m.read).length;
        return `<div class="app-nav" style="height:auto;padding:56px 16px 6px">
            <button class="nav-btn" style="color:#0a84ff">‹ Mailboxes</button>
            <span class="nav-title">Inbox</span>
            <button class="nav-btn" data-compose style="color:#0a84ff">✎</button>
          </div>
          <div style="padding:0 16px 6px;font-size:12px;color:#8e8e93">${unread} unread · Updated just now</div>
          <div style="flex:1;overflow-y:auto" id="mailList">${mails.map((m) => `
            <button class="mail-row" data-mail="${m.id}" style="width:100%;text-align:left;background:none">
              <span class="mdot ${m.read ? 'read' : ''}"></span>
              <span class="mmain"><b>${esc(m.from)}<span>${m.time}</span></b><p class="msub">${esc(m.subject)}</p><p class="mprev">${esc(m.body.split('\n')[0])}</p></span>
            </button>`).join('')}</div>`;
      }

      function paint() {
        $('#mailShell', view).innerHTML = listPage();
        const comp = $('#mailShell', view).querySelector('[data-compose]');
        if (comp) comp.addEventListener('click', compose);
      }

      function openMail(id) {
        const m = mails.find((x) => x.id === id);
        if (!m) return;
        m.read = true; ctx.db.set('mail', mails);
        const r = $('#mailReader', view);
        r.style.display = 'flex';
        r.innerHTML = `<div class="app-nav" style="height:auto;padding:56px 16px 8px;background:#f9f9f9;border-bottom:1px solid #e5e5ea">
            <button class="nav-btn" data-reader-close style="color:#0a84ff">‹ Inbox</button><span class="nav-title"></span><button class="nav-btn" style="color:#0a84ff">↩︎</button>
          </div>
          <div class="mr-body">
            <div class="mr-from"><span class="msg-avatar" style="background:linear-gradient(150deg,#6a8dff,#3b5bdb);width:38px;height:38px;font-size:16px">${esc(m.from.charAt(0))}</span>
              <span style="flex:1"><b style="font-size:14px">${esc(m.from)}</b><span style="display:block;font-size:11px;color:#8e8e93">${esc(m.email)}</span></span>
              <span style="font-size:11px;color:#8e8e93">${esc(m.time)}</span></div>
            <h2>${esc(m.subject)}</h2>
            <div style="white-space:pre-line">${esc(m.body)}</div>
            <div style="margin-top:26px;display:flex;gap:10px"><button class="pill-btn" data-reply>Reply</button><button class="pill-btn ghost" data-forward>Forward</button></div>
          </div>`;
        paint();
        r.querySelector('[data-reader-close]').addEventListener('click', () => { r.style.display = 'none'; });
        r.querySelector('[data-reply]').addEventListener('click', () => { r.style.display = 'none'; compose(m.email, 'Re: ' + m.subject); });
        r.querySelector('[data-forward]').addEventListener('click', () => ctx.toast('Forwarded', '↩︎'));
      }

      function compose(to = '', subject = '') {
        const c = $('#mailCompose', view);
        c.style.display = 'flex';
        c.innerHTML = `<div class="app-nav" style="height:auto;padding:56px 16px 8px;background:#f9f9f9;border-bottom:1px solid #e5e5ea">
            <button class="nav-btn" data-comp-close style="color:#0a84ff">Cancel</button><span class="nav-title">New Message</span><button class="nav-btn" data-comp-send style="color:#0a84ff;font-weight:600">Send</button>
          </div>
          <div style="padding:8px 16px 0">
            <input class="input-line" id="compTo" placeholder="To:" value="${esc(to)}" style="border-radius:0;border-bottom:1px solid #e5e5ea;background:none;padding:10px 2px" />
            <input class="input-line" id="compSubject" placeholder="Subject:" value="${esc(subject)}" style="border-radius:0;border-bottom:1px solid #e5e5ea;background:none;padding:10px 2px" />
            <textarea id="compBody" placeholder="Write your message…" style="width:100%;height:360px;border:0;outline:0;resize:none;font-size:15px;padding:12px 2px;font-family:inherit;background:none"></textarea>
          </div>`;
        c.querySelector('[data-comp-close]').addEventListener('click', () => { c.style.display = 'none'; });
        c.querySelector('[data-comp-send]').addEventListener('click', () => {
          const to2 = c.querySelector('#compTo').value.trim();
          const sub = c.querySelector('#compSubject').value.trim() || '(No subject)';
          const body = c.querySelector('#compBody').value;
          if (!to2) { ctx.toast('Add a recipient', '✉️'); return; }
          const sent = ctx.db.get('sent', []);
          sent.unshift({ id: 's' + Date.now(), to: to2, subject: sub, body, time: window.Sim.fmt12() });
          ctx.db.set('sent', sent);
          c.style.display = 'none';
          ctx.notify('Mail', `Message sent to ${to2}`, { appId: 'mail', icon: '✉️', color: 'linear-gradient(150deg,#4fb2ff,#1373e6)' });
          paint();
        });
      }

      view.addEventListener('click', (e) => {
        const m = e.target.closest('[data-mail]');
        if (m) { openMail(m.dataset.mail); return; }
      });
      paint();
      return () => clean.run();
    }
  };

  /* =========================================================
     MAPS
     ========================================================= */
  Apps.maps = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('maps-app');
      const clean = bag();
      let zoom = 1;
      let selected = null;
      let routeOn = false;

      const places = [
        { name: 'Apple Park', sub: 'One Apple Park Way · Cupertino', icon: '🏢', dist: '1.2 mi', x: 58, y: 28 },
        { name: 'Cupertino Village', sub: 'Shopping center · 10869 N Wolfe Rd', icon: '🛍️', dist: '1.8 mi', x: 28, y: 44 },
        { name: 'Blue Bottle Coffee', sub: 'Coffee shop · 20000 Stevens Creek Blvd', icon: '☕', dist: '2.4 mi', x: 67, y: 47 },
        { name: 'Rancho San Antonio', sub: 'Park · 22500 Cristo Rey Dr', icon: '🌳', dist: '4.1 mi', x: 18, y: 20 },
        { name: 'Apple Infinite Loop', sub: 'Office · 1 Infinite Loop', icon: '🏛️', dist: '1.9 mi', x: 46, y: 37 }
      ];

      function blocks() {
        let html = '';
        const xs = [4, 16, 28, 40, 52, 64, 76, 88];
        const ys = [4, 15, 27, 39, 51, 63, 75, 87];
        xs.forEach((x, ri) => {
          ys.forEach((y, ci) => {
            if ((ri + ci) % 6 === 0) return;
            const w = 7 + ((ri * 5 + ci * 3) % 6);
            const h = 6 + ((ri * 3 + ci * 5) % 7);
            html += `<span class="map-block" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></span>`;
          });
        });
        [12, 36, 62, 86].forEach((x) => { html += `<span class="map-road v" style="left:${x}%"></span>`; });
        [18, 44, 70, 90].forEach((y) => { html += `<span class="map-road h" style="top:${y}%"></span>`; });
        html += `<span class="map-water" style="left:74%;top:-8%;width:40%;height:22%;transform:rotate(10deg)"></span>`;
        html += `<span class="map-park" style="left:2%;top:20%;width:14%;height:19%"></span>`;
        html += `<span class="map-park" style="left:40%;top:24%;width:8%;height:9%"></span>`;
        html += `<span class="map-user" style="left:50%;top:40%"></span>`;
        places.forEach((p) => {
          html += `<span class="map-pin" style="left:${p.x}%;top:${p.y}%;font-size:17px;opacity:.9">${p.icon}</span>`;
          html += `<span class="map-label" style="left:${p.x}%;top:${p.y + 2.2}%">${p.name}</span>`;
        });
        return html;
      }

      view.innerHTML = `
        <div class="maps-canvas-wrap">
          <div class="maps-canvas" id="mapsCanvas">${blocks()}
            <svg class="map-route" id="mapRoute" style="display:none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path id="routePath" d="M50 56 L50 45 L58 45" fill="none" stroke="#0a84ff" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="2 2"/>
            </svg>
          </div>
        </div>
        <div class="maps-search">
          <div class="ms-box"><span>🔍</span><input id="mapSearch" placeholder="Search for a place or address" /><span style="color:#8e8e93">◉</span></div>
        </div>
        <div class="maps-tools">
          <button id="mapZoomIn">＋</button><button id="mapZoomOut">−</button><button id="mapLocate">◎</button>
        </div>
        <div class="maps-sheet" id="mapsSheet">
          <div class="grab"></div>
          <h3>Cupertino</h3><p>Sunny · 72° · Traffic is light</p>
          <div id="mapPlaces">${places.map((p, i) => `<button class="maps-place" data-place="${i}" style="width:100%;text-align:left;background:none"><span class="mp-ico">${p.icon}</span><span><b>${p.name}</b><span>${p.sub}</span></span><span class="mp-dist">${p.dist}</span></button>`).join('')}</div>
        </div>`;

      function paintSheet() {
        const sheet = $('#mapsSheet', view);
        if (selected === null) {
          sheet.innerHTML = `<div class="grab"></div><h3>Cupertino</h3><p>Sunny · 72° · Traffic is light</p>
            <div id="mapPlaces">${places.map((p, i) => `<button class="maps-place" data-place="${i}" style="width:100%;text-align:left;background:none"><span class="mp-ico">${p.icon}</span><span><b>${p.name}</b><span>${p.sub}</span></span><span class="mp-dist">${p.dist}</span></button>`).join('')}</div>`;
        } else {
          const p = places[selected];
          sheet.innerHTML = `<div class="grab"></div><h3>${esc(p.name)}</h3><p>${esc(p.sub)}</p>
            <div style="display:flex;gap:9px;margin:12px 0 4px">
              <button class="pill-btn" data-directions style="flex:1">Directions · ${p.dist}</button>
              <button class="pill-btn ghost" data-map-call style="flex:none">Call</button>
            </div>
            <div class="maps-place" style="border-top:1px solid var(--ios-sep);margin-top:10px"><span class="mp-ico">🕘</span><span><b>Open now</b><span>Closes at 6:00 PM</span></span></div>
            <div class="maps-place"><span class="mp-ico">★</span><span><b>4.8 · 2,431 reviews</b><span>${esc(p.sub)}</span></span></div>
            <button class="pill-btn ghost" data-map-back style="margin-top:12px">Back to results</button>`;
          $('[data-map-back]', sheet).addEventListener('click', () => { selected = null; routeOn = false; paintSheet(); });
          $('[data-directions]', sheet).addEventListener('click', () => {
            routeOn = !routeOn;
            const r = $('#mapRoute', view);
            r.style.display = routeOn ? 'block' : 'none';
            const path = $('#routePath', view);
            path.setAttribute('d', `M50 56 L50 45 L${p.x} ${p.y}`);
            paintSheet();
            ctx.toast(routeOn ? 'Route ready · 6 min drive' : 'Route cleared', '🧭');
          });
          $('[data-map-call]', sheet).addEventListener('click', () => ctx.toast('Calling ' + p.name, '📞'));
        }
      }

      function selectPlace(i) {
        selected = i;
        const p = places[i];
        const canvas = $('#mapsCanvas', view);
        canvas.style.transform = `scale(${zoom * 1.4}) translate(${(50 - p.x) * 0.3}%, ${(40 - p.y) * 0.3}%)`;
        paintSheet();
      }

      view.addEventListener('click', (e) => {
        const p = e.target.closest('[data-place]');
        if (p) { selectPlace(+p.dataset.place); return; }
        if (e.target.closest('#mapZoomIn')) { zoom = Math.min(2, zoom + .2); $('#mapsCanvas', view).style.transform = `scale(${zoom})`; return; }
        if (e.target.closest('#mapZoomOut')) { zoom = Math.max(.7, zoom - .2); $('#mapsCanvas', view).style.transform = `scale(${zoom})`; return; }
        if (e.target.closest('#mapLocate')) { zoom = 1; $('#mapsCanvas', view).style.transform = 'none'; ctx.toast('You are here', '◎'); return; }
      });
      $('#mapSearch', view).addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const q = e.target.value.toLowerCase().trim();
        if (!q) return;
        const found = places.findIndex((p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q));
        if (found >= 0) selectPlace(found);
        else { ctx.toast('No results nearby', '🔍'); }
        e.target.blur();
      });
      return () => clean.run();
    }
  };

  /* =========================================================
     APP STORE
     ========================================================= */
  Apps.appstore = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('store-app');
      const clean = bag();
      const states = {};
      const items = [
        { id: 'productivity', name: 'Flowstate', sub: 'Focus & habits', icon: '🧘', grad: 'linear-gradient(150deg,#6ee7b7,#0ea5e9)', color: '#0ea5e9' },
        { id: 'photo', name: 'Prism', sub: 'Photo editor', icon: '🔮', grad: 'linear-gradient(150deg,#f0abfc,#7c3aed)', color: '#7c3aed' },
        { id: 'music', name: '루프', sub: '비트 만들기', icon: '🎛️', grad: 'linear-gradient(150deg,#fda4af,#e11d48)', color: '#e11d48' },
        { id: 'games', name: 'Skyline', sub: 'Arcade runner', icon: '🏙️', grad: 'linear-gradient(150deg,#fde68a,#f59e0b)', color: '#f59e0b' },
        { id: 'notes', name: 'Inkwell', sub: 'Smart notes', icon: '🖋️', grad: 'linear-gradient(150deg,#a5b4fc,#4f46e5)', color: '#4f46e5' },
        { id: 'weather', name: 'Atmos', sub: 'Weather, beautifully', icon: '🌤️', grad: 'linear-gradient(150deg,#7dd3fc,#0284c7)', color: '#0284c7' }
      ];

      view.innerHTML = `<div class="app-body no-pad">
        <div class="app-nav" style="height:auto;padding:56px 16px 6px">
          <button class="nav-btn"></button><span class="nav-title">App Store</span><button class="nav-btn" style="font-size:20px">👤</button>
        </div>
        <div class="store-cats">${['Today', 'Games', 'Apps', 'Arcade', 'Search'].map((c, i) => `<button class="${i === 2 ? 'active' : ''}">${c}</button>`).join('')}</div>
        <div class="store-feature"><small>Editors’ Choice</small><h2>Apps for iPhone 18</h2><p>Fresh picks, rebuilt for the Dynamic Island and Apple Intelligence.</p></div>
        <div class="section-label" style="padding-top:0">New This Week</div>
        <div class="store-row" id="storeItems">
          ${items.map((it) => `<div class="store-item" data-store="${it.id}">
            <span class="si-icon" style="background:${it.grad}">${it.icon}</span>
            <span class="si-main"><b>${it.name}</b><span>${it.sub}</span><span style="color:#ff9f0a">★★★★☆</span></span>
            <button class="store-get" data-get="${it.id}">GET</button>
          </div>`).join('')}
        </div>
        <div class="section-label">Top Charts</div>
        <div class="store-row">
          ${items.slice().reverse().map((it, i) => `<div class="store-item">
            <span style="width:20px;color:#8e8e93;font-size:14px">${i + 1}</span>
            <span class="si-icon" style="background:${it.grad}">${it.icon}</span>
            <span class="si-main"><b>${it.name}</b><span>${it.sub}</span></span>
            <button class="store-get" data-get="${it.id}">GET</button>
          </div>`).join('')}
        </div>
        <div style="height:24px"></div>
      </div>`;

      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-get]');
        if (!b) return;
        const id = b.dataset.get;
        if (states[id] === 'open') { ctx.open(id === 'photo' ? 'photos' : id === 'weather' ? 'weather' : id === 'notes' ? 'notes' : 'appstore'); return; }
        if (states[id] === 'installing') return;
        states[id] = 'installing';
        b.textContent = '•••'; b.style.color = '#8e8e93';
        setTimeout(() => {
          states[id] = 'open';
          b.textContent = 'OPEN'; b.style.background = 'rgba(120,120,128,.14)';
          ctx.toast('Installed', '✓');
        }, 1400);
      });
      return () => clean.run();
    }
  };

  window.Apps = Apps;
})();
