/* Core device shell: state, gestures, system UI, audio engine. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const pad = (n) => String(n).padStart(2, '0');
  const SCREEN_W = 393;
  const SCREEN_H = 852;
  const STORE = 'iphone18sim.v1';
  const MEDIA = window.MEDIA || {};
  const IG_MEDIA = MEDIA.instagram || {};
  const SP_MEDIA = MEDIA.spotify || {};
  const igAvatar = (user) => (IG_MEDIA.users && IG_MEDIA.users[user]) || '';
  const igPostImage = (id) => (IG_MEDIA.posts && IG_MEDIA.posts[id]) || '';
  const igStoryImage = (id) => (IG_MEDIA.stories && IG_MEDIA.stories[id]) || '';
  const igReelImage = (id) => (IG_MEDIA.reels && IG_MEDIA.reels[id]) || '';
  const spPlaylistCover = (id) => (SP_MEDIA.playlistCovers && SP_MEDIA.playlistCovers[id]) || '';

  /* ---------------- store ---------------- */
  const defaults = {
    wallpaper: 'aurora',
    darkMode: true,
    brightness: 100,
    volume: 65,
    toggles: { wifi: true, bluetooth: true, cellular: true, airplane: false, focus: false, flash: false, dark: true },
    notes: [
      { id: 'n1', title: 'iPhone 18에 오신 것을 환영합니다', body: 'iPhone 18에 오신 것을 환영합니다\n\n이 시뮬레이터는 완전히 상호작용할 수 있습니다. 카메라를 써 보거나 메시지를 보내고, 음악을 재생하거나 제어 센터를 둘러보세요.\n\n여기서 만든 모든 것은 이 기기에 저장됩니다.', updated: Date.now() - 3600e3 },
      { id: 'n2', title: '짐 목록', body: '짐 목록\n\n• 여권\n• USB‑C 충전기\n• AirPods\n• 카메라\n• 선글라스', updated: Date.now() - 86400e3 }
    ],
    messages: [
      { id: 'c1', name: 'Emma', color: 'linear-gradient(150deg,#ff9a8b,#ff6a88)', initials: 'E', unread: true, time: '9:32', messages: [
        { from: 'them', text: '저녁 출시 행사에 올 거야?', at: '9:30' },
        { from: 'them', text: '7시에 시작한대 🎉', at: '9:32' }
      ] },
      { id: 'c2', name: 'Alex Chen', color: 'linear-gradient(150deg,#6a8dff,#3b5bdb)', initials: 'A', unread: false, time: '어제', messages: [
        { from: 'them', text: '새 iPhone 카메라 진짜 대박이야.', at: '18:04' },
        { from: 'me', text: '그치? 48MP 센서는 차원이 달라.', at: '18:06' },
        { from: 'them', text: '나중에 사진 좀 보내줘!', at: '18:07' }
      ] },
      { id: 'c3', name: '엄마', color: 'linear-gradient(150deg,#ffb88c,#ff8b6b)', initials: 'M', unread: false, time: '어제', messages: [
        { from: 'them', text: '시간 되면 전화해 ❤️', at: '14:22' }
      ] },
      { id: 'c4', name: '디자인 팀', color: 'linear-gradient(150deg,#7ee8c4,#28b487)', initials: 'D', unread: true, time: '월요일', messages: [
        { from: 'them', text: '새 목업을 공유 폴더에 올렸어.', at: '11:40' }
      ] }
    ],
    events: [
      { id: 'e1', date: todayKey(), title: 'iPhone 18 출시', time: '7:00 PM', color: '#ff453a' },
      { id: 'e2', date: todayKey(), title: '디자인 리뷰', time: '10:30 AM', color: '#0a84ff' }
    ],
    reminders: [
      { id: 'r1', text: 'iPhone 18 Pro 예약 주문', group: '오늘', done: false },
      { id: 'r2', text: '기존 휴대폰 백업', group: '오늘', done: true },
      { id: 'r3', text: 'Apple ID 사진 업데이트', group: '이번 주', done: false },
      { id: 'r4', text: '기존 기기 재활용', group: '이번 주', done: false }
    ],
    notifications: [
      { id: 'nt1', appId: 'messages', icon: '💬', color: 'linear-gradient(150deg,#5ee87a,#12b34a)', title: 'Emma', body: '7시에 시작한대 🎉', time: '9:32', read: false },
      { id: 'nt2', appId: 'mail', icon: '✉️', color: 'linear-gradient(150deg,#4fb2ff,#1373e6)', title: 'Apple', body: 'iPhone 18 Pro 설정 준비가 완료되었습니다.', time: '8:15', read: false },
      { id: 'nt3', appId: 'calendar', icon: '📅', color: '#ff453a', title: '캘린더', body: '오늘 오후 7시에 iPhone 18 출시 행사가 있습니다.', time: '7:00', read: false }
    ],
    alarms: [
      { id: 'a1', time: '6:30', label: '아침', on: true },
      { id: 'a2', time: '8:00', label: '평일', on: false }
    ],
    photos: [],
    sent: [],
    recentCalls: [
      { name: 'Emma', number: '+1 (415) 555-0132', type: 'incoming', time: '9:20', missed: false },
      { name: '엄마', number: '+1 (408) 555-0177', type: 'missed', time: '어제', missed: true }
    ],
    fitness: { move: 420, exercise: 24, stand: 9 },
    instagram: {
      profile: {
        username: 'alex.morgan',
        name: 'Alex Morgan',
        bio: 'iPhone 18 Pro로 담은 일상 📸\n서울 · 디자인 스튜디오',
        avatar: igAvatar('alex.morgan'),
        posts: '6',
        followers: '12.4K',
        following: '318'
      },
      posts: [
        {
          id: 'igp1',
          user: 'alex.morgan',
          avatar: igAvatar('alex.morgan'),
          location: '서울, 대한민국',
          image: igPostImage('igp1'),
          caption: '주말의 빛. iPhone 18 Pro로 담았습니다.',
          likes: 1284,
          liked: false,
          saved: false,
          time: '2시간 전',
          comments: [
            { user: 'emma.k', text: '색감 미쳤다 😍' },
            { user: 'alex.chen', text: '여기 어디야?' }
          ]
        },
        {
          id: 'igp2',
          user: 'alex.morgan',
          avatar: igAvatar('alex.morgan'),
          location: '성수동, 서울',
          image: igPostImage('igp2'),
          caption: '오늘의 커피와 오후의 고요 ☕️',
          likes: 842,
          liked: true,
          saved: true,
          time: '어제',
          comments: [
            { user: 'min.j', text: '분위기 좋다!' }
          ]
        },
        {
          id: 'igp3',
          user: 'alex.morgan',
          avatar: igAvatar('alex.morgan'),
          location: '한강, 서울',
          image: igPostImage('igp3'),
          caption: '파도 소리로 시작한 아침.',
          likes: 2310,
          liked: false,
          saved: false,
          time: '3일 전',
          comments: [
            { user: 'sora', text: '완벽한 순간 🌊' },
            { user: 'travel.kr', text: '저장했어요!' }
          ]
        },
        {
          id: 'igp4',
          user: 'alex.morgan',
          avatar: igAvatar('alex.morgan'),
          location: '북한산',
          image: igPostImage('igp4'),
          caption: '안개 낀 숲은 언제나 옳다.',
          likes: 967,
          liked: false,
          saved: false,
          time: '5일 전',
          comments: []
        }
      ],
      stories: [
        { id: 's1', user: 'emma.k', avatar: igAvatar('emma.k'), image: igStoryImage('s1'), seen: false },
        { id: 's2', user: 'alex.chen', avatar: igAvatar('alex.chen'), image: igStoryImage('s2'), seen: false },
        { id: 's3', user: 'design.team', avatar: igAvatar('design.team'), image: igStoryImage('s3'), seen: false },
        { id: 's4', user: 'sora', avatar: igAvatar('sora'), image: igStoryImage('s4'), seen: true },
        { id: 's5', user: 'travel.kr', avatar: igAvatar('travel.kr'), image: igStoryImage('s5'), seen: false }
      ],
      reels: [
        { id: 'r1', user: 'alex.morgan', image: igReelImage('r1'), caption: '겨울 산의 공기', likes: 4210, liked: false },
        { id: 'r2', user: 'emma.k', image: igReelImage('r2'), caption: '오늘의 디테일', likes: 1890, liked: false },
        { id: 'r3', user: 'sora', image: igReelImage('r3'), caption: '바다로 떠나요', likes: 6320, liked: false }
      ]
    },
    spotify: {
      playlists: [
        { id: 'sp1', name: '레이트 나이트 드라이브', description: '밤에 듣기 좋은 신스팝', cover: spPlaylistCover('sp1'), trackIds: [0, 1, 4] },
        { id: 'sp2', name: '포커스 플로우', description: '집중이 필요한 순간', cover: spPlaylistCover('sp2'), trackIds: [2, 3] },
        { id: 'sp3', name: '골든 아워', description: '노을과 함께하는 플레이리스트', cover: spPlaylistCover('sp3'), trackIds: [2, 0] },
        { id: 'sp4', name: '오션 에어', description: '파도 소리와 함께', cover: spPlaylistCover('sp4'), trackIds: [1, 4, 3] }
      ],
      liked: [0, 2, 3],
      recent: [0, 1, 2, 3],
      shuffle: false,
      repeat: false
    }
  };

  function todayKey(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  const db = {
    data: null,
    load() {
      try {
        const raw = localStorage.getItem(STORE);
        this.data = raw ? Object.assign({}, JSON.parse(JSON.stringify(defaults)), JSON.parse(raw)) : JSON.parse(JSON.stringify(defaults));
      } catch { this.data = JSON.parse(JSON.stringify(defaults)); }
      if (!Array.isArray(this.data.photos)) this.data.photos = [];
      if (!Array.isArray(this.data.sent)) this.data.sent = [];
    },
    save() { try { localStorage.setItem(STORE, JSON.stringify(this.data)); } catch { /* storage full */ } },
    get(k, d) { return this.data[k] === undefined ? d : this.data[k]; },
    set(k, v) { this.data[k] = v; this.save(); },
    reset() { localStorage.removeItem(STORE); this.data = JSON.parse(JSON.stringify(defaults)); this.save(); }
  };
  db.load();

  /* ---------------- audio (UI clicks + music engine) ---------------- */
  const audio = {
    ctx: null,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    },
    click(freq = 620) {
      const ctx = this.ensure(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.08);
    },
    tone(freq, dur = 0.2, type = 'sine', vol = 0.06) {
      const ctx = this.ensure(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur + 0.02);
    },
    dtmf(n) {
      const map = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], 0: [941, 1336], '*': [941, 1209], '#': [941, 1477] };
      const f = map[n]; if (!f) return;
      this.tone(f[0], 0.16, 'sine', 0.04); this.tone(f[1], 0.16, 'sine', 0.03);
    }
  };

  const TRACKS = [
    { id: 't1', title: 'Midnight City Lights', artist: 'Neon Dreams', album: 'Afterglow', dur: 214, glyph: '🌆', colors: ['#ff5f6d', '#8a2be2', '#2b1055'], root: 196, mode: [0, 3, 7, 10] },
    { id: 't2', title: 'Ocean Drive', artist: 'Coastal', album: 'Tides', dur: 187, glyph: '🌊', colors: ['#00c6ff', '#0072ff', '#001f4d'], root: 174.6, mode: [0, 4, 7, 11] },
    { id: 't3', title: 'Golden Hour', artist: 'Sundial', album: 'Horizons', dur: 232, glyph: '🌅', colors: ['#f7b733', '#fc4a1a', '#4b134f'], root: 220, mode: [0, 2, 4, 7] },
    { id: 't4', title: 'Static Bloom', artist: 'Aurora Field', album: 'Signal', dur: 205, glyph: '🌸', colors: ['#f857a6', '#ff5858', '#7a1fa2'], root: 246.9, mode: [0, 3, 5, 7] },
    { id: 't5', title: 'Gravity', artist: 'Orbit', album: 'Deep Space', dur: 198, glyph: '🪐', colors: ['#7f7fd5', '#86a8e7', '#1c1c3c'], root: 164.8, mode: [0, 5, 7, 10] }
  ];

  const music = {
    index: 0,
    playing: false,
    elapsed: 0,
    shuffle: !!db.get('musicShuffle', false),
    repeat: !!db.get('musicRepeat', false),
    gain: null,
    nodes: null,
    timer: null,
    arpTimer: null,
    arpStep: 0,
    listeners: new Set(),
    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    emit() { this.listeners.forEach((fn) => { try { fn(this.state()); } catch (e) { console.error(e); } }); },
    state() { return { track: TRACKS[this.index], playing: this.playing, elapsed: this.elapsed, tracks: TRACKS, index: this.index, shuffle: this.shuffle, repeat: this.repeat }; },
    startEngine() {
      const ctx = audio.ensure(); if (!ctx) return;
      if (!this.gain) {
        this.gain = ctx.createGain();
        this.gain.gain.value = (db.get('volume', 65) / 100) * 0.16;
        this.gain.connect(ctx.destination);
      }
      this.stopNodes();
      const track = TRACKS[this.index];
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(1, now + 1.4);
      master.connect(this.gain);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 1500; filter.Q.value = 0.8;
      filter.connect(master);
      const oscs = [];
      const base = track.root;
      [0, 3, 7, 12].forEach((semi, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = base * Math.pow(2, semi / 12);
        o.detune.value = (i - 1.5) * 4;
        const g = ctx.createGain(); g.gain.value = i === 0 ? 0.32 : 0.12;
        o.connect(g).connect(filter); o.start();
        oscs.push(o);
      });
      const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08; lfoGain.gain.value = 420;
      lfo.connect(lfoGain).connect(filter.frequency); lfo.start();
      oscs.push(lfo);
      this.nodes = { master, oscs };
      this.arpStep = 0;
      clearInterval(this.arpTimer);
      this.arpTimer = setInterval(() => {
        if (!this.playing) return;
        const c = audio.ctx; if (!c) return;
        const t = TRACKS[this.index];
        const semi = t.mode[this.arpStep % t.mode.length] + (this.arpStep % 8 < 4 ? 12 : 24);
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = t.root * Math.pow(2, semi / 12) * 2;
        g.gain.setValueAtTime(0.0001, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.03, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.55);
        o.connect(g).connect(this.gain); o.start(); o.stop(c.currentTime + 0.6);
        this.arpStep++;
      }, 520);
    },
    stopNodes() {
      clearInterval(this.arpTimer); this.arpTimer = null;
      if (this.nodes) {
        const { master, oscs } = this.nodes;
        try {
          oscs.forEach((o) => { try { o.stop(); } catch (e) { } });
          master.disconnect();
        } catch (e) { }
        this.nodes = null;
      }
    },
    play() {
      if (this.playing) return;
      this.playing = true;
      this.startEngine();
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (!this.playing) return;
        this.elapsed++;
        if (this.elapsed >= TRACKS[this.index].dur) this.next();
        this.emit();
      }, 1000);
      this.emit(); Sim.islandMusic(true);
    },
    pause() {
      this.playing = false; clearInterval(this.timer); this.timer = null;
      if (this.gain && audio.ctx) {
        const now = audio.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      }
      setTimeout(() => { if (!this.playing) { this.stopNodes(); if (this.gain && audio.ctx) this.gain.gain.value = (db.get('volume', 65) / 100) * 0.16; } }, 550);
      this.emit(); Sim.islandMusic(false);
    },
    toggle() { this.playing ? this.pause() : this.play(); },
    select(i, autoplay = true) {
      const wasPlaying = this.playing;
      this.pause();
      this.index = (i + TRACKS.length) % TRACKS.length;
      this.elapsed = 0;
      this.emit();
      if (autoplay || wasPlaying) setTimeout(() => this.play(), 30);
    },
    next() {
      if (this.repeat) { this.elapsed = 0; this.emit(); return; }
      if (this.shuffle) {
        let i = this.index;
        while (i === this.index) i = Math.floor(Math.random() * TRACKS.length);
        this.select(i);
        return;
      }
      this.select(this.index + 1);
    },
    prev() { if (this.elapsed > 4) { this.elapsed = 0; this.emit(); } else this.select(this.index - 1); },
    setShuffle(v) { this.shuffle = !!v; db.set('musicShuffle', this.shuffle); this.emit(); },
    setRepeat(v) { this.repeat = !!v; db.set('musicRepeat', this.repeat); this.emit(); },
    seek(frac) { this.elapsed = Math.floor(TRACKS[this.index].dur * clamp(frac, 0, 1)); this.emit(); },
    setVolume(v) { if (this.gain && audio.ctx) this.gain.gain.value = (v / 100) * 0.16; },
    fmt(s) { s = Math.floor(s || 0); return `${Math.floor(s / 60)}:${pad(s % 60)}`; }
  };

  /* ---------------- system state ---------------- */
  const Sim = {
    db, music, audio, TRACKS,
    unlocked: false,
    currentApp: null,
    recent: [],
    page: 0,
    wallpaper: db.get('wallpaper', 'aurora'),
    dark: db.get('darkMode', true),
    notifications: db.get('notifications', []),
    callTimer: null,
    toastTimer: null,
    islandTimer: null,
    booted: false,
    _statusEl: null,
    screen: null,

    now: () => new Date(),
    fmtTime(d = new Date(), sec = false) {
      let h = d.getHours(); const m = pad(d.getMinutes());
      if (!sec) return `${h % 12 === 0 ? 12 : h % 12}:${m}`;
      return `${pad(h)}:${m}`;
    },
    fmt12(d = new Date()) {
      let h = d.getHours(); const m = pad(d.getMinutes());
      const ap = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 === 0 ? 12 : h % 12}:${m} ${ap}`;
    },

    /* ---------- boot ---------- */
    init() {
      this.screen = $('#screen');
      this._statusEl = $('#statusbar');
      this.renderHome();
      this.renderNotifications();
      this.setWallpaper(this.wallpaper, false);
      this.updateTheme();
      this.applyBrightness(db.get('brightness', 100), false);
      this.clockTick();
      setInterval(() => this.clockTick(), 1000);
      this.applyToggles();
      this.bindGlobals();
      this.bindGestures();
      this.fit();
      window.addEventListener('resize', () => this.fit());
      setTimeout(() => { if (!this.unlocked) $('#lockHint').style.opacity = '1'; }, 400);
      this.booted = true;
    },

    fit() {
      const device = $('#device');
      if (!device) return;
      const scale = Math.max(0.3, Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H));
      device.style.transform = `scale(${scale})`;
      device.style.transformOrigin = 'center center';
    },

    clockTick() {
      const d = new Date();
      const t = this.fmtTime(d);
      $('#sbTime').textContent = t;
      $('#lockTime').textContent = t;
      $('#cwTime').textContent = t;
      $('#clockHint').textContent = t;
      $('#lockDate').textContent = d.toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' });
      $('#ncDate').textContent = d.toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' });
      const h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
      const hh = $('.cw-hand.h'), mm = $('.cw-hand.m'), ss = $('.cw-hand.s');
      if (hh) {
        hh.style.transform = `rotate(${h * 30 + m * 0.5}deg)`;
        mm.style.transform = `rotate(${m * 6}deg)`;
        ss.style.transform = `rotate(${s * 6}deg)`;
      }
      document.dispatchEvent(new CustomEvent('sim:tick', { detail: d }));
    },

    /* ---------- home rendering ---------- */
    renderHome() {
      const badge = { messages: db.get('messages', []).filter((c) => c.unread).length, mail: 3 };
      const renderGrid = (apps, el) => {
        el.innerHTML = apps.map((a) => `
          <button class="app-icon" data-app="${a.id}" aria-label="${a.name}">
            ${window.iconMarkup(a)}
            ${badge[a.id] ? `<span class="badge">${badge[a.id] > 9 ? '9+' : badge[a.id]}</span>` : ''}
            <span class="app-label">${a.name}</span>
          </button>`).join('');
      };
      renderGrid(window.APPS.filter((a) => a.page === 0), $('#grid0'));
      renderGrid(window.APPS.filter((a) => a.page === 1), $('#grid1'));
      $('#dock').innerHTML = window.DOCK.map((a) => `
        <button class="app-icon" data-app="${a.id}" aria-label="${a.name}">
          ${window.iconMarkup(a)}
          ${badge[a.id] ? `<span class="badge">${badge[a.id]}</span>` : ''}
        </button>`).join('');
    },

    /* ---------- wall / theme ---------- */
    setWallpaper(key, persist = true) {
      this.wallpaper = key;
      if (persist) db.set('wallpaper', key);
      const wall = $('#wallpaper');
      if (!wall) return;
      wall.className = `wallpaper wp-${key}`;
      if (key.startsWith('photo:')) {
        wall.className = 'wallpaper wallpaper-photo';
        wall.style.background = `#000 url("${key.slice(6)}") center/cover no-repeat`;
        wall.style.backgroundSize = 'cover';
      }
    },
    setWallpaperPhoto(dataUrl) { this.setWallpaper('photo:' + dataUrl); },
    updateTheme() {
      this.dark = db.get('darkMode', true);
      this.screen.dataset.theme = this.dark ? 'dark' : 'light';
    },
    applyBrightness(v, persist = true) {
      if (persist) db.set('brightness', v);
      const dim = $('#dim');
      if (dim) dim.style.opacity = String((100 - v) / 100 * 0.72);
    },

    /* ---------- status bar ---------- */
    setStatusTheme(mode) {
      if (!this._statusEl) return;
      this._statusEl.classList.toggle('dark-text', mode === 'dark');
    },
    setStatusHidden(hidden) { if (this._statusEl) this._statusEl.style.opacity = hidden ? '0' : '1'; },

    /* ---------- lock / unlock ---------- */
    unlock(target) {
      if (this.unlocked) return;
      this.unlocked = true;
      const lock = $('#lockscreen');
      lock.classList.add('unlocked');
      setTimeout(() => lock.classList.add('hidden'), 620);
      $('#home').classList.remove('hidden');
      this.setStatusTheme('light');
      if (target) setTimeout(() => this.openApp(target), 340);
    },
    lock() {
      this.closeApp(true);
      this.closeOverlays();
      this.unlocked = false;
      const lock = $('#lockscreen');
      lock.classList.remove('hidden');
      requestAnimationFrame(() => lock.classList.remove('unlocked'));
      $('#home').classList.add('hidden');
      this.setStatusTheme('light');
      this.renderNotifications();
    },

    /* ---------- notifications ---------- */
    renderNotifications() {
      this.notifications = db.get('notifications', []);
      const list = this.notifications.slice(0, 3);
      const lock = $('#lockNotifications');
      if (lock) {
        lock.innerHTML = list.map((n) => `
          <button class="lock-note" data-note="${n.id}">
            <span class="lock-note-icon" style="background:${n.color}">${n.icon}</span>
            <span class="lock-note-body"><b>${esc(n.title)}</b><span>${esc(n.body)}</span></span>
            <span class="lock-note-time">${esc(n.time || '')}</span>
          </button>`).join('');
      }
      const nc = $('#ncList');
      if (nc) {
        nc.innerHTML = this.notifications.length ? this.notifications.map((n) => `
          <button class="nc-note" data-note="${n.id}">
            <span class="ni" style="background:${n.color}">${n.icon}</span>
            <span class="nb"><b>${esc(n.title)}</b><span>${esc(n.body)}</span></span>
            <time>${esc(n.time || '')}</time>
          </button>`).join('') : `<div class="nc-empty">새로운 알림이 없습니다</div>`;
      }
    },
    notify(title, body, opts = {}) {
      const n = {
        id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5),
        title, body,
        icon: opts.icon || '🔔',
        color: opts.color || 'linear-gradient(150deg,#8e8e93,#48484a)',
        appId: opts.appId || '',
        time: this.fmtTime(),
        read: false
      };
      this.notifications.unshift(n);
      db.set('notifications', this.notifications);
      this.renderNotifications();
      this.toast(body, opts.icon || '🔔');
      return n;
    },
    clearNotifications() {
      this.notifications = [];
      db.set('notifications', []);
      this.renderNotifications();
      this.toast('알림을 지웠습니다', '✓');
    },

    /* ---------- toggles / control center ---------- */
    applyToggles() {
      const t = db.get('toggles', {});
      $$('#controlCenter .cc-toggle').forEach((b) => b.classList.toggle('on', !!t[b.dataset.toggle]));
      const flash = !!t.flash;
      $('#flashlightGlow').classList.toggle('on', flash);
      $('#lockFlash').classList.toggle('on', flash);
      const wifi = $('.sb-right .sb-icon:nth-child(2)');
      if (wifi) wifi.style.opacity = t.airplane || !t.wifi ? '.3' : '1';
      const cell = $('.sb-right .sb-icon:nth-child(1)');
      if (cell) cell.style.opacity = t.airplane ? '.25' : '1';
    },
    toggleSetting(key) {
      const t = db.get('toggles', {});
      if (key === 'dark' && t.dark === undefined) t.dark = db.get('darkMode', true);
      t[key] = !t[key];
      if (key === 'airplane' && t.airplane) { t.cellular = false; t.wifi = false; }
      db.set('toggles', t);
      this.applyToggles();
      if (key === 'dark') { db.set('darkMode', t.dark); this.updateTheme(); }
      if (key === 'flash') this.toast(t.flash ? '손전등 켬' : '손전등 끔', '✦');
      return t[key];
    },

    /* ---------- overlays ---------- */
    openControl() {
      $('#controlCenter').classList.add('open');
      this.syncCC();
    },
    closeControl() { $('#controlCenter').classList.remove('open'); },
    openNC() { this.renderNotifications(); $('#notificationCenter').classList.add('open'); },
    closeNC() { $('#notificationCenter').classList.remove('open'); },
    closeOverlays() {
      this.closeControl(); this.closeNC();
      $('#spotlight').classList.remove('open');
      $('#switcher').classList.remove('open');
    },
    syncCC() {
      const s = music.state();
      $('#ccTrack').textContent = s.playing || s.elapsed ? s.track.title : '재생 중인 음악 없음';
      $('#ccArtist').textContent = s.playing || s.elapsed ? s.track.artist : '음악을 열어 재생하세요';
      $('#ccPlay').textContent = s.playing ? '❚❚' : '▶';
      $('#ccArt').style.background = `linear-gradient(150deg,${s.track.colors.join(',')})`;
      $('#ccArt').textContent = s.track.glyph;
    },

    /* ---------- island ---------- */
    islandMusic(show) {
      const island = $('#island');
      if (!show) {
        if (island.dataset.mode === 'music') this.islandReset();
        return;
      }
      const s = music.state();
      island.dataset.mode = 'music';
      island.classList.add('expanded');
      $('#islandExpanded').innerHTML = `
        <span class="island-art" style="background:linear-gradient(150deg,${s.track.colors.join(',')})">${s.track.glyph}</span>
        <span class="island-meta"><b>${esc(s.track.title)}</b><span>${esc(s.track.artist)}</span></span>
        <span class="island-wave"><i></i><i></i><i></i><i></i><i></i></span>`;
    },
    islandReset() {
      const island = $('#island');
      island.classList.remove('expanded');
      island.dataset.mode = '';
      clearInterval(this.callTimer);
    },
    startCall(name, number) {
      const island = $('#island');
      island.dataset.mode = 'call';
      island.classList.add('expanded');
      $('#islandExpanded').innerHTML = `
        <div class="island-call"><span class="ic-dot">📞</span>
        <span class="ic-body"><b>${esc(name)}</b><span id="islandCallTime">00:00</span></span>
        <span style="font-size:15px;color:#30d158">●</span></div>`;
      clearInterval(this.callTimer);
      const started = Date.now();
      this.callTimer = setInterval(() => {
        const el = $('#islandCallTime');
        if (!el) { clearInterval(this.callTimer); return; }
        const sec = Math.floor((Date.now() - started) / 1000);
        el.textContent = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
      }, 1000);
      this.audio.tone(440, 0.25, 'sine', 0.05);
    },
    endCall() {
      clearInterval(this.callTimer);
      this.islandReset();
      music.playing ? this.islandMusic(true) : null;
    },

    /* ---------- toast ---------- */
    toast(msg, icon = '✓') {
      const t = $('#toast');
      if (!t) return;
      $('#toastMsg').textContent = msg;
      $('#toastIco').textContent = icon;
      t.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    },

    /* ---------- app lifecycle ---------- */
    openApp(id, relaunch = false) {
      if (!this.unlocked) this.unlock(id);
      const app = window.appById(id);
      if (!app) return;
      this.closeOverlays();
      if (this.currentApp && this.currentApp.id === id && !relaunch) return;
      if (this.currentApp) this.destroyApp(this.currentApp);

      const def = (window.Apps || {})[id];
      const view = document.createElement('div');
      view.className = 'app-view';
      if (app.status === 'light') view.dataset.status = 'light';
      const screenRect = this.screen.getBoundingClientRect();
      const iconEl = $(`[data-app="${id}"] .icon-tile`);
      let ox = 50, oy = 50;
      if (iconEl) {
        const r = iconEl.getBoundingClientRect();
        ox = ((r.left + r.width / 2 - screenRect.left) / screenRect.width) * 100;
        oy = ((r.top + r.height / 2 - screenRect.top) / screenRect.height) * 100;
      }
      view.style.setProperty('--ox', `${ox}%`);
      view.style.setProperty('--oy', `${oy}%`);
      $('#appLayer').appendChild(view);
      $('#home').classList.add('pushed');
      $('#globalHome').classList.add('show');
      this.setStatusTheme('light');

      const ctx = this.appCtx(app);
      let cleanup = null;
      try {
        cleanup = def && def.render ? def.render(view, ctx) : this.fallbackApp(app, view, ctx);
        if (cleanup && typeof cleanup === 'object' && cleanup.then) cleanup = null;
      } catch (err) {
        console.error('App render failed', id, err);
        view.innerHTML = `<div class="app-body"><div class="empty-state"><span class="big">⚠️</span>${esc(app.name)} 앱을 여는 중 문제가 발생했습니다.</div></div>`;
      }
      this.currentApp = { id, view, cleanup };
      this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, 8);
      document.dispatchEvent(new CustomEvent('sim:appopen', { detail: id }));
    },

    destroyApp(cur) {
      try { cur.cleanup && cur.cleanup(); } catch (e) { console.error(e); }
      cur.view.remove();
      if (this.currentApp === cur) this.currentApp = null;
    },

    closeApp(instant = false) {
      if (!this.currentApp) return;
      const cur = this.currentApp;
      this.currentApp = null;
      this.setStatusTheme('light');
      $('#globalHome').classList.remove('show');
      $('#home').classList.remove('pushed');
      if (instant) { this.destroyApp(cur); return; }
      cur.view.classList.add('closing');
      setTimeout(() => this.destroyApp(cur), 250);
    },

    goHome() {
      if (!$('#lockscreen').classList.contains('hidden') && !this.unlocked) return;
      this.closeOverlays();
      this.closeApp();
      $('#home').classList.remove('pushed');
      this.setStatusTheme('light');
    },

    openSwitcher() {
      const track = $('#switcherTrack');
      const photos = MEDIA.appIcons || {};
      const items = this.recent.filter((id) => window.appById(id));
      track.innerHTML = items.length ? items.map((id) => {
        const a = window.appById(id);
        const meta = this.appMeta(id);
        return `<div class="switcher-card" data-switch="${id}">
          <button class="sc-close" data-switch-close="${id}" aria-label="${a.name} 닫기">×</button>
          <div class="sc-inner">
            <span class="sc-icon" style="background:${a.grad};color:${a.darkIcon ? '#111' : '#fff'}">${photos[id] ? `<img src="${esc(photos[id])}" alt="">` : `<svg viewBox="0 0 24 24" style="width:24px;height:24px">${window.ICONS[a.icon]}</svg>`}</span>
            <b>${a.name}</b>
            <span>${meta}</span>
          </div>
        </div>`;
      }).join('') : `<div class="switcher-empty">최근 앱 없음<br><br>앱을 연 다음 앱 전환기를 다시 여세요.</div>`;
      $('#switcher').classList.add('open');
      this.closeControl(); this.closeNC();
    },
    appMeta(id) {
      const m = {
        messages: '읽지 않은 대화 2개', weather: '쿠퍼티노 · 72° 맑음', clock: '세계 시계, 알람, 스톱워치, 타이머',
        photos: '나의 보관함과 앨범', music: '재생 중인 음악과 보관함', notes: '이 기기에 동기화된 메모',
        settings: '배경화면, 화면 모드, 기기 정보', camera: '브라우저 카메라로 사진 촬영',
        safari: '내장 웹 브라우저 둘러보기', phone: '키패드, 최근 통화, 연락처', maps: '장소 탐색 및 검색',
        calendar: '나의 일정', calculator: '표준 계산기', instagram: '피드, 릴스, 스토리와 프로필', spotify: '플레이리스트와 지금 재생 중'
      };
      return m[id] || '최근 사용';
    },

    appCtx(app) {
      return {
        app,
        open: (id) => this.openApp(id),
        home: () => this.goHome(),
        back: () => this.closeApp(),
        toast: (m, i) => this.toast(m, i),
        notify: (t, b, o) => this.notify(t, b, o),
        db, music, audio,
        esc, fmt: (s) => music.fmt(s), now: () => new Date(),
        status: (mode) => this.setStatusTheme(mode),
        refreshHome: () => this.renderHome(),
        wallpaper: (k) => this.setWallpaper(k),
        sendSMS: (id, text) => this.sendMessage(id, text)
      };
    },

    fallbackApp(app, view, ctx) {
      view.innerHTML = `<div class="app-body pt"><div class="empty-state"><span class="big">${app.name[0]}</span><b>${app.name}</b><br>이 앱은 시뮬레이터의 일부입니다.</div></div>`;
    },

    sendMessage(threadId, text) {
      const threads = db.get('messages', []);
      const th = threads.find((x) => x.id === threadId);
      if (!th) return;
      th.messages.push({ from: 'me', text, at: this.fmt12() });
      th.time = this.fmtTime(); th.unread = false;
      db.set('messages', threads);
      this.renderHome();
    },

    /* ---------- spotlight ---------- */
    openSpotlight() {
      const sp = $('#spotlight');
      sp.classList.add('open');
      this.closeControl(); this.closeNC();
      const input = $('#spotlightInput');
      input.value = '';
      this.spotlightSearch('');
      setTimeout(() => input.focus(), 180);
    },
    closeSpotlight() { $('#spotlight').classList.remove('open'); },
    spotlightSearch(q) {
      const query = q.trim().toLowerCase();
      const results = [];
      const photos = MEDIA.appIcons || {};
      const terms = ['Siri', 'Search', 'Apps', 'Settings', 'Weather', 'Messages', 'Photos', 'Music', '메모s', 'Calendar', 'Camera', 'Maps', 'Mail', 'Clock'];
      if (!query) {
        ['messages', 'music', 'photos', 'settings', 'notes', 'weather'].forEach((id) => {
          const a = window.appById(id);
          results.push({ kind: 'app', id, title: a.name, sub: '앱', icon: a.icon, grad: a.grad, darkIcon: a.darkIcon, photo: photos[id] });
        });
        results.push({ kind: 'siri', title: 'Siri에게 묻기', sub: '“날씨 어때?”라고 해보세요', icon: 'tips', grad: 'linear-gradient(150deg,#ff5f6d,#7a2cf0)' });
      } else {
        window.APPS.concat(window.DOCK).filter((a) => a.name.toLowerCase().includes(query)).forEach((a) => {
          results.push({ kind: 'app', id: a.id, title: a.name, sub: '앱', icon: a.icon, grad: a.grad, darkIcon: a.darkIcon, photo: photos[a.id] });
        });
        db.get('notes', []).filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(query)).forEach((n) => {
          results.push({ kind: 'note', id: n.id, title: n.title, sub: '메모', icon: 'notes', grad: 'linear-gradient(180deg,#fff9d6,#ffd60a)', darkIcon: true });
        });
        db.get('messages', []).filter((c) => c.name.toLowerCase().includes(query) || c.messages.some((m) => m.text.toLowerCase().includes(query))).forEach((c) => {
          results.push({ kind: 'chat', id: c.id, title: c.name, sub: c.messages[c.messages.length - 1].text, icon: 'messages', grad: 'linear-gradient(160deg,#5ee87a,#12b34a)' });
        });
      }
      const el = $('#spotlightResults');
      if (!results.length) {
        el.innerHTML = `<div class="sp-hint">“${esc(q)}”에 대한 결과 없음</div>`;
        return;
      }
      el.innerHTML = results.slice(0, 9).map((r) => `
        <button class="sp-row" data-sp="${r.kind}" data-id="${r.id}" data-title="${esc(r.title)}">
          <span class="sp-ico" style="background:${r.grad};color:${r.darkIcon ? '#111' : '#fff'}">
            ${r.photo ? `<img src="${esc(r.photo)}" alt="">` : `<svg viewBox="0 0 24 24" style="width:18px;height:18px">${window.ICONS[r.icon] || '✦'}</svg>`}
          </span>
          <span><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></span>
        </button>`).join('');
    },

    /* ---------- gestures & events ---------- */
    bindGlobals() {
      document.addEventListener('click', (e) => {
        const appBtn = e.target.closest('[data-app]');
        if (appBtn && !e.target.closest('.app-view')) { this.openApp(appBtn.dataset.app); return; }
        const widget = e.target.closest('[data-open]');
        if (widget && !e.target.closest('.app-view, .control-center, .notification-center')) { this.openApp(widget.dataset.open); return; }
        const note = e.target.closest('[data-note]');
        if (note) {
          const n = this.notifications.find((x) => x.id === note.dataset.note);
          if (n && n.appId) { this.unlock(); this.closeOverlays(); setTimeout(() => this.openApp(n.appId), 120); }
          else { this.closeOverlays(); }
          return;
        }
        const sp = e.target.closest('[data-sp]');
        if (sp) {
          this.closeSpotlight();
          if (sp.dataset.sp === 'app') this.openApp(sp.dataset.id);
          else if (sp.dataset.sp === 'note') { this.openApp('notes'); setTimeout(() => document.dispatchEvent(new CustomEvent('sim:opennote', { detail: sp.dataset.id })), 120); }
          else if (sp.dataset.sp === 'chat') { this.openApp('messages'); setTimeout(() => document.dispatchEvent(new CustomEvent('sim:openchat', { detail: sp.dataset.id })), 120); }
          else if (sp.dataset.sp === 'siri') this.toast('Siri가 듣고 있습니다… (데모)', '🎙️');
          return;
        }
        if (e.target.closest('#spotlight') && !e.target.closest('.spotlight-panel')) this.closeSpotlight();
      });

      $('#lockIndicator').addEventListener('click', () => this.unlock());
      $('#lockHint').addEventListener('click', () => this.unlock());
      $('#lockCamera').addEventListener('click', () => this.unlock('camera'));
      $('#lockFlash').addEventListener('click', () => this.toggleSetting('flash'));

      $('#homeIndicator').addEventListener('click', (e) => {
        if (e.detail === 0) return;
        this.goHome();
      });
      $('#globalHome').addEventListener('click', () => this.goHome());
      $('#island').addEventListener('click', () => {
        const mode = $('#island').dataset.mode;
        if (mode === 'call') { this.openApp('phone'); return; }
        if (mode === 'music') { this.openApp('music'); return; }
        this.toast('다이나믹 아일랜드', '✦');
      });

      $('#spotlightClose').addEventListener('click', () => this.closeSpotlight());
      $('#spotlightInput').addEventListener('input', (e) => this.spotlightSearch(e.target.value));
      $('#spotlightInput').addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeSpotlight(); });

      $('#controlCenter').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.closeControl();
      });
      $('#notificationCenter').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.closeNC();
      });
      $$('#controlCenter [data-toggle]').forEach((b) => b.addEventListener('click', () => {
        const key = b.dataset.toggle;
        if (key === 'dark') { this.toggleSetting('dark'); this.updateTheme(); }
        else this.toggleSetting(key);
        audio.click(700);
      }));
      $$('#controlCenter [data-open]').forEach((b) => b.addEventListener('click', () => {
        this.closeControl();
        this.openApp(b.dataset.open);
      }));
      $('#ccPlay').addEventListener('click', () => music.toggle());
      $('#brightness').addEventListener('input', (e) => this.applyBrightness(+e.target.value));
      $('#volume').addEventListener('input', (e) => { db.set('volume', +e.target.value); music.setVolume(+e.target.value); });
      $('#ncClear').addEventListener('click', () => this.clearNotifications());

      $('#switcherHome').addEventListener('click', () => this.goHome());
      $('#switcher').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.goHome();
        const close = e.target.closest('[data-switch-close]');
        if (close) {
          e.stopPropagation();
          this.recent = this.recent.filter((x) => x !== close.dataset.switchClose);
          if (this.currentApp && this.currentApp.id === close.dataset.switchClose) this.closeApp();
          this.openSwitcher();
          return;
        }
        const card = e.target.closest('[data-switch]');
        if (card) this.openApp(card.dataset.switch);
      });

      $$('.page-dots .dot').forEach((dot, i) => dot.addEventListener('click', () => this.setPage(i)));

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if ($('#spotlight').classList.contains('open')) return this.closeSpotlight();
          if ($('#controlCenter').classList.contains('open')) return this.closeControl();
          if ($('#notificationCenter').classList.contains('open')) return this.closeNC();
          if ($('#switcher').classList.contains('open')) return this.goHome();
          if (this.currentApp) return this.goHome();
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.openSpotlight(); }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') { e.preventDefault(); this.goHome(); }
        if (e.key === 'l' && e.metaKey) { e.preventDefault(); this.lock(); }
      });

      music.onChange(() => this.syncCC());
      this.syncCC();

      const b = db.get('brightness', 100);
      $('#brightness').value = b;
      $('#volume').value = db.get('volume', 65);
    },

    setPage(i) {
      this.page = clamp(i, 0, 1);
      $('#homePages').style.transform = `translateX(-${this.page * 100}%)`;
      $$('.page-dots .dot').forEach((d, di) => d.classList.toggle('active', di === this.page));
    },

    bindGestures() {
      const screen = this.screen;
      let start = null;

      screen.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        start = { x: e.clientX, y: e.clientY, t: Date.now(), target: e.target };
        if (e.target.closest('input, textarea, .cc-slider, .ff-canvas')) start.blocked = true;
      }, { passive: true });

      screen.addEventListener('pointerup', (e) => {
        if (!start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        const dt = Date.now() - start.t;
        const rect = screen.getBoundingClientRect();
        const sx = (start.x - rect.left) / rect.width;
        const sy = (start.y - rect.top) / rect.height;
        const locked = !this.unlocked;
        if (start.blocked) { start = null; return; }

        if (locked) {
          if (dy < -46 || (Math.abs(dy) < 8 && dt < 300 && (sy > 0.82 || e.target.closest('.lock-hint')))) {
            this.unlock();
          } else if (dy > 46 && sy < 0.25) {
            this.openNC();
          }
          start = null; return;
        }

        if (sy < 0.06 && dy > 24 && dt < 700) {
          if (sx > 0.55) this.openControl();
          else if (sx < 0.45) this.openNC();
          start = null; return;
        }
        if (sy > 0.94 && dy < -34) {
          if (this.currentApp) this.goHome();
          else if (this.recent.length && dt < 250) this.openSwitcher();
          start = null; return;
        }
        if (this.currentApp) {
          if (dy > 40 && sy < 0.12) { /* reserved */ }
          if (dy > 65 && Math.abs(dx) < 50) { /* swipe down inside app - no-op */ }
          start = null; return;
        }
        if ($('#switcher').classList.contains('open')) { start = null; return; }
        const inHome = !$('#home').classList.contains('hidden');
        if (inHome && Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5 && sy > 0.15 && sy < 0.8) {
          if (dy > 0) this.openSpotlight();
          start = null; return;
        }
        if (e.target.closest('#controlCenter.open, #notificationCenter.open')) { start = null; return; }
        if (!this.currentApp && Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4 && sy > 0.2 && sy < 0.9) {
          if (dx < 0) this.setPage(this.page + 1);
          else this.setPage(this.page - 1);
        }
        start = null;
      }, { passive: true });

      $('#island').addEventListener('pointerdown', (e) => e.stopPropagation());
    }
  };

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* extra DOM bits created by JS */
  function injectChrome() {
    const screen = document.getElementById('screen');
    const dim = document.createElement('div');
    dim.id = 'dim';
    dim.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:89;transition:opacity .15s';
    screen.appendChild(dim);

    const gh = document.createElement('div');
    gh.id = 'globalHome';
    gh.className = 'home-indicator';
    gh.setAttribute('aria-label', '홈');
    gh.style.cssText = 'position:absolute;left:50%;bottom:8px;transform:translateX(-50%);z-index:78;display:none;background:rgba(255,255,255,.9);box-shadow:0 1px 4px rgba(0,0,0,.3)';
    screen.appendChild(gh);

    const style = document.createElement('style');
    style.textContent = `
      .home-indicator.show{display:block!important}
      .badge{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ff3b30;color:#fff;font-size:10px;font-weight:600;display:grid;place-items:center;border:1.5px solid rgba(0,0,0,.15);z-index:2}
      .app-icon{position:relative}
      .pt{padding-top:54px}
    `;
    document.head.appendChild(style);
  }

  window.Sim = Sim;
  window.esc = esc;

  document.addEventListener('DOMContentLoaded', () => {
    injectChrome();
    Sim.init();
  });
})();
