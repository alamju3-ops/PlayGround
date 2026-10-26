/* App icon artwork + app catalogue.
   Every glyph is inline SVG so the simulator stays fully self-contained. */
(function () {
  const stroke = (d, w = 1.8) =>
    `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  const ICONS = {
    phone: `<path d="M6.6 3.2c.7-.2 1.5.1 1.9.8l1.5 2.6c.4.7.2 1.6-.4 2.1l-1 .8c-.3.2-.4.6-.2.9 1 1.8 2.4 3.2 4.2 4.2.3.2.7.1.9-.2l.8-1c.5-.6 1.4-.8 2.1-.4l2.6 1.5c.7.4 1 1.2.8 1.9-.5 2-2.3 3.4-4.3 3.2-4.8-.5-9.1-4.8-9.6-9.6-.2-2 1.2-3.8 3.2-4.3Z" fill="currentColor" opacity=".96"/>`,
    messages: `<path d="M12 3.2c-5 0-9 3.4-9 7.6 0 2.4 1.3 4.5 3.4 5.9-.2 1-.7 2.1-1.5 3 1.7-.1 3.2-.8 4.2-1.6 1 .2 1.9.3 2.9.3 5 0 9-3.4 9-7.6s-4-7.6-9-7.6Z" fill="currentColor"/>`,
    safari: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15.8 8.2 13.4 13.4 8.2 15.8l2.4-5.2 5.2-2.4Z" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m12 4.4.8 1.7M19.6 12l-1.7.8M12 19.6l-.8-1.7M4.4 12l1.7-.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,
    camera: `<rect x="1.8" y="6.2" width="20.4" height="13.6" rx="3.4" fill="currentColor"/><path d="M8 6.2 9.5 4h5L16 6.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="13" r="4.4" fill="#000" opacity=".82"/><circle cx="12" cy="13" r="2.6" fill="#6fd3ff" opacity=".9"/><circle cx="18.9" cy="9.1" r="1" fill="#fff" opacity=".8"/>`,
    photos: `<g fill="currentColor"><ellipse cx="12" cy="7.1" rx="2.3" ry="4.1"/><ellipse cx="12" cy="16.9" rx="2.3" ry="4.1"/><ellipse cx="7.1" cy="12" rx="4.1" ry="2.3"/><ellipse cx="16.9" cy="12" rx="4.1" ry="2.3"/></g><g fill="#fff" opacity=".42"><ellipse cx="8.5" cy="8.5" rx="2.2" ry="4" transform="rotate(-45 8.5 8.5)"/><ellipse cx="15.5" cy="15.5" rx="2.2" ry="4" transform="rotate(-45 15.5 15.5)"/><ellipse cx="15.5" cy="8.5" rx="4" ry="2.2" transform="rotate(-45 15.5 8.5)"/><ellipse cx="8.5" cy="15.5" rx="4" ry="2.2" transform="rotate(-45 8.5 15.5)"/></g>`,
    music: `<path d="M9 17.4V6.2l9-1.8v11.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="6.9" cy="17.6" rx="2.9" ry="2.3" fill="currentColor"/><ellipse cx="15.9" cy="15.8" rx="2.9" ry="2.3" fill="currentColor"/>`,
    clock: `<circle cx="12" cy="12" r="9.2" fill="currentColor" opacity=".18"/><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 6.6V12l3.7 2.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
    weather: `<circle cx="9" cy="8.6" r="3.9" fill="#ffd60a"/><path d="M9 2.4v1.5M3.5 8.6H2M15 8.6h1.5M4.8 4.4 3.8 3.4M13.2 4.4l1-1" stroke="#ffd60a" stroke-width="1.6" stroke-linecap="round"/><path d="M7.2 19.5h9.3a3.5 3.5 0 0 0 .3-7 5.2 5.2 0 0 0-9.9 1.3 3 3 0 0 0 .3 5.7Z" fill="#fff"/>`,
    calendar: `<path d="M4 6.5h16v13H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 10h16" stroke="currentColor" stroke-width="1.4"/><path d="M7.5 3.5v4M16.5 3.5v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="12" y="17.4" text-anchor="middle" font-size="7.2" font-family="-apple-system,sans-serif" font-weight="600" fill="currentColor">24</text>`,
    calculator: `<rect x="4" y="2.6" width="16" height="18.8" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="6.6" y="5.2" width="10.8" height="3.2" rx="1" fill="currentColor" opacity=".9"/><g fill="currentColor"><circle cx="8" cy="11.6" r="1.1"/><circle cx="12" cy="11.6" r="1.1"/><circle cx="16" cy="11.6" r="1.1"/><circle cx="8" cy="15.4" r="1.1"/><circle cx="12" cy="15.4" r="1.1"/><circle cx="16" cy="15.4" r="1.1"/><circle cx="8" cy="19.2" r="1.1"/><circle cx="12" cy="19.2" r="1.1"/></g><rect x="14.8" y="17.9" width="2.6" height="2.6" rx=".9" fill="#ff9f0a"/>`,
    notes: `<rect x="4" y="3" width="16" height="18" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7.4 8h9.2M7.4 11.6h9.2M7.4 15.2h5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16.8 3v6.2" stroke="currentColor" stroke-width="1.2" opacity=".4"/>`,
    settings: `<path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0-6 1 2.2 2.4-.6 1.1 2.2 2.3.8-.6 2.4 1.6 1.8-1.6 1.8.6 2.4-2.3.8-1.1 2.2-2.4-.6-1 2.2-1-2.2-2.4.6-1.1-2.2-2.3-.8.6-2.4L2.4 12l1.6-1.8-.6-2.4 2.3-.8L6.8 4l2.4.6L10.2 2.4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
    mail: `<rect x="2.6" y="5.2" width="18.8" height="13.6" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    maps: `<path d="m3 6.4 6-2.4 6 2.4 6-2.4v13.6l-6 2.4-6-2.4-6 2.4V6.4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 4v13.6M15 7v13.6" stroke="currentColor" stroke-width="1.4" opacity=".7"/><circle cx="12" cy="10" r="2.4" fill="#ff453a"/><path d="M12 16.4s-3.4-3-3.4-6.1a3.4 3.4 0 0 1 6.8 0c0 3.1-3.4 6.1-3.4 6.1Z" fill="#ff453a"/>`,
    appstore: `<path d="m12 3.4 8.6 15.2M12 3.4 3.4 18.6M6.4 15h11.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8.6 21h6.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
    reminders: `<g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7" cy="7" r="2.4"/><circle cx="7" cy="16.6" r="2.4"/></g><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 7h8M12 16.6h8"/></g><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="16.6" r="1.1" fill="currentColor"/>`,
    files: `<path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h4l2 2.4h7.6A2.2 2.2 0 0 1 21 9.6v8.2a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8V7.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 10.4h18" stroke="currentColor" stroke-width="1.4" opacity=".55"/>`,
    health: `<path d="M12 20.4S3.6 15.5 3.6 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.4 2.4c0 5.9-8.4 10.8-8.4 10.8Z" fill="#ff375f"/><path d="M7 12.2h2.4l1.4-2.4 1.8 4.4 1.2-2h3.2" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    wallet: `<rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2.6 9.4h18.8" stroke="currentColor" stroke-width="1.5"/><rect x="14.6" y="11.8" width="6.8" height="4.4" rx="1.4" fill="currentColor" opacity=".9"/>`,
    podcasts: `<circle cx="12" cy="9" r="3.1" fill="currentColor"/><path d="M9.6 13.6 8.5 21h7l-1.1-7.4" fill="currentColor"/><path d="M5.4 12.2a7.5 7.5 0 0 1 0-6.4M18.6 5.8a7.5 7.5 0 0 1 0 6.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>`,
    facetime: `<rect x="2.4" y="6" width="12.4" height="12" rx="3.2" fill="currentColor"/><path d="m15.2 10.4 5-2.8v8.8l-5-2.8" fill="currentColor"/><circle cx="8.6" cy="12" r="4.6" fill="none" stroke="#000" stroke-width="1.3" opacity=".25"/>`,
    books: `<path d="M12 6.6C10.4 5 8 4.4 4 4.6v13.2c4-.2 6.4.4 8 2 1.6-1.6 4-2.2 8-2V4.6c-4-.2-6.4.4-8 2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6.6v13.2" stroke="currentColor" stroke-width="1.3" opacity=".6"/>`,
    freeform: `<rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m7 15 3.4-3.6 2.6 2.2 4-5.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.2" cy="9" r="1.3" fill="currentColor"/>`,
    stocks: `<path d="M3 17.6 8 12l3.4 3.2L20 6.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.4 6.4H20v4.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
    voicememo: `<g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10.5v3M7.4 7.5v9M10.8 4.6v14.8M14.2 8.2v7.6M17.6 6.2v11.6M21 10v4"/></g>`,
    home: `<path d="m3.4 10.6 8.6-7 8.6 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.4 9.6v10h13.2v-10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.8 19.6v-5.4h4.4v5.4" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    translate: `<path d="M3 4.6h9M7.5 3v1.6M10.4 4.6c-.6 3.6-3 6.6-6.4 8.2M5.2 8.6c.9 1.8 2.4 3.2 4.4 4.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 20.4l3.6-8.8 3.6 8.8M14.4 17.4h4.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    shortcuts: `<rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".7"/><rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".7"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".4"/>`,
    tv: `<rect x="2.4" y="4.4" width="19.2" height="13.4" rx="2.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m10 8.4 4.4 2.8-4.4 2.8V8.4Z" fill="currentColor"/><path d="M8 21h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    findmy: `<circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3"/><path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" stroke="currentColor" stroke-width="1.2" opacity=".5"/>`,
    tips: `<path d="M12 2.8a6.2 6.2 0 0 0-3.8 11.1c.8.6 1.2 1.4 1.2 2.3v.6h5.2v-.6c0-.9.4-1.7 1.2-2.3A6.2 6.2 0 0 0 12 2.8Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.6 20h4.8M10.2 22h3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    watch: `<rect x="6.4" y="3.2" width="11.2" height="17.6" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 3.2 8.4 1h7.2l-.6 2.2M9 20.8 8.4 23h7.2l-.6-2.2" fill="currentColor"/><path d="M12 7v5l2.8 1.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
    fitness: `<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2.4" opacity=".25"/><path d="M12 3.4a8.6 8.6 0 0 1 7.4 13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 7.4a4.6 4.6 0 1 0 4.6 4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`,
    journal: `<rect x="4" y="2.8" width="16" height="18.4" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 8h8M8 11.6h8M8 15.2h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="m15.4 18.4 1.2-1.2 1.4 1.4-1.2 1.2" fill="currentColor"/>`,
    measure: `<path d="m3 16.8 13.8-13.8 4.2 4.2L7.2 21 3 16.8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m7 12.8 2 2M10 9.8l2 2M13 6.8l2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
    compass: `<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m16 8-2.6 6-5.4 2 2.6-6L16 8Z" fill="currentColor"/><path d="M12 2.8v1.6M12 19.6v1.6M2.8 12h1.6M19.6 12h1.6" stroke="currentColor" stroke-width="1.2" opacity=".6"/>`,
    clock2: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    screentime: `<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12V4.2A7.8 7.8 0 0 1 19.8 12H12Z" fill="currentColor"/>`,
    news: `<path d="M4 4h13v16H6a2 2 0 0 1-2-2V4Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M17 8h3v10a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h7M7 11.5h7M7 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
    instagram: `<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4.15" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.2" cy="6.9" r="1.18" fill="currentColor"/>`,
    spotify: `<circle cx="12" cy="12" r="9.3" fill="none" stroke="#1ed760" stroke-width="1.4" opacity=".38"/><path d="M6.3 9.1c3.8-1.15 7.8-.8 11.4 1.05M7.05 12.15c3.1-.85 6.35-.5 9.2.95M7.8 15.05c2.4-.6 4.9-.3 7.1.85" fill="none" stroke="#1ed760" stroke-width="2" stroke-linecap="round"/>`
  };

  const A = (id, name, icon, grad, page, extra = {}) => ({
    id, name, icon, grad, page, ...extra
  });

  const APPS = [
    A('weather', '날씨', 'weather', 'linear-gradient(180deg,#4fa8ff,#1b69dc)', 0),
    A('clock', '시계', 'clock', 'linear-gradient(180deg,#2c2c2e,#000)', 0),
    A('calendar', '캘린더', 'calendar', 'linear-gradient(180deg,#ffffff,#ececf0)', 0, { darkIcon: true }),
    A('photos', '사진', 'photos', 'linear-gradient(180deg,#ffffff,#f2f2f7)', 0, { darkIcon: true }),
    A('music', '음악', 'music', 'linear-gradient(160deg,#fb5c74,#e8174a 55%,#b3082f)', 0),
    A('notes', '메모', 'notes', 'linear-gradient(180deg,#fff9d6,#ffd60a)', 0, { darkIcon: true }),
    A('calculator', '계산기', 'calculator', 'linear-gradient(180deg,#5a5a5e,#1c1c1e)', 0),
    A('maps', '지도', 'maps', 'linear-gradient(160deg,#a8e6a1,#5cc46b 55%,#2e9e5b)', 0),
    A('mail', '메일', 'mail', 'linear-gradient(160deg,#4fb2ff,#1373e6)', 0),
    A('appstore', '앱 스토어', 'appstore', 'linear-gradient(160deg,#39a8ff,#0a63e8)', 0),
    A('reminders', '미리 알림', 'reminders', 'linear-gradient(180deg,#ffffff,#f0f0f4)', 0, { darkIcon: true }),
    A('files', '파일', 'files', 'linear-gradient(160deg,#4cc9ff,#106ee8)', 0),
    A('health', '건강', 'health', 'linear-gradient(180deg,#ffffff,#f4f4f7)', 0, { darkIcon: true }),
    A('wallet', '지갑', 'wallet', 'linear-gradient(180deg,#3a3a3c,#000)', 0),
    A('podcasts', '팟캐스트', 'podcasts', 'linear-gradient(160deg,#c86bff,#7a2cf0)', 0),
    A('settings', '설정', 'settings', 'linear-gradient(180deg,#8e8e93,#5a5a5f)', 0),
    A('facetime', 'FaceTime', 'facetime', 'linear-gradient(160deg,#5ee87a,#1fae4a)', 1),
    A('books', '도서', 'books', 'linear-gradient(160deg,#ffb340,#ff7a00)', 1),
    A('freeform', '프리폼', 'freeform', 'linear-gradient(160deg,#ffffff,#e9e9ef)', 1, { darkIcon: true }),
    A('stocks', '주식', 'stocks', 'linear-gradient(180deg,#2c2c2e,#000)', 1),
    A('voicememo', '음성 메모', 'voicememo', 'linear-gradient(180deg,#3a3a3c,#000)', 1),
    A('home', '홈', 'home', 'linear-gradient(160deg,#ffb267,#ff7a1a)', 1),
    A('translate', '번역', 'translate', 'linear-gradient(160deg,#5aaeff,#0b5fe0)', 1),
    A('shortcuts', '단축어', 'shortcuts', 'linear-gradient(150deg,#ff77b8,#8b5cf6 55%,#3b82f6)', 1),
    A('tv', 'TV', 'tv', 'linear-gradient(180deg,#2f2f31,#000)', 1),
    A('findmy', '나의 찾기', 'findmy', 'linear-gradient(160deg,#63e6a1,#16a34a)', 1),
    A('tips', '팁', 'tips', 'linear-gradient(180deg,#ffffff,#f2f2f7)', 1, { darkIcon: true }),
    A('watch', 'Watch', 'watch', 'linear-gradient(180deg,#3a3a3c,#000)', 1),
    A('fitness', '피트니스', 'fitness', 'linear-gradient(160deg,#2c2c2e,#000)', 1),
    A('journal', '저널', 'journal', 'linear-gradient(160deg,#ffffff,#f3f3f6)', 1, { darkIcon: true }),
    A('measure', '측정', 'measure', 'linear-gradient(180deg,#2c2c2e,#000)', 0),
    A('compass', '나침반', 'compass', 'linear-gradient(180deg,#1c1c1e,#000)', 0),
    A('screentime', '스크린 타임', 'screentime', 'linear-gradient(160deg,#6c8bff,#3b4ce0)', 0),
    A('news', '뉴스', 'news', 'linear-gradient(160deg,#ff5d5d,#e01b24)', 0),
    A('instagram', '인스타그램', 'instagram', 'linear-gradient(135deg,#feda75 0%,#fa7e1e 28%,#d62976 52%,#962fbf 76%,#4f5bd5 100%)', 1),
    A('spotify', 'Spotify', 'spotify', 'linear-gradient(180deg,#202020,#000)', 1)
  ];

  const DOCK = [
    A('phone', '전화', 'phone', 'linear-gradient(160deg,#5ee87a,#12b34a)', 0, { dock: true }),
    A('safari', 'Safari', 'safari', 'linear-gradient(160deg,#42c6ff,#1273e6)', 0, { dock: true }),
    A('messages', '메시지', 'messages', 'linear-gradient(160deg,#5ee87a,#12b34a)', 0, { dock: true }),
    A('camera', '카메라', 'camera', 'linear-gradient(180deg,#4a4a4e,#1c1c1e)', 0, { dock: true })
  ];

  window.ICONS = ICONS;
  window.APPS = APPS;
  window.DOCK = DOCK;
  window.appById = (id) => APPS.concat(DOCK).find((a) => a.id === id);
  window.iconMarkup = (app, size) => {
    const svg = ICONS[app.icon] || '';
    const color = app.darkIcon ? '#111' : '#fff';
    const media = (window.MEDIA && window.MEDIA.appIcons) || {};
    const photo = String(app.photo || media[app.id] || '').replace(/"/g, '&quot;');
    return `<span class="icon-tile" style="background:${app.grad};color:${color}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>
      ${photo ? `<img class="icon-photo" src="${photo}" alt="" loading="lazy" onerror="this.remove()">` : ''}
    </span>`;
  };
})();
