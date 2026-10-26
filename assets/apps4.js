/* Apps part 4 — Instagram and Spotify. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
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
  const attr = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const grad = (t) => `linear-gradient(150deg,${t.colors.join(',')})`;
  const fmt = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`;
  const SP_KO = [
    { title: '미드나이트 시티 라이트', artist: '네온 드림스', album: '애프터글로우' },
    { title: '오션 드라이브', artist: '코스탈', album: '타이즈' },
    { title: '골든 아워', artist: '선다이얼', album: '호라이즌스' },
    { title: '스태틱 블룸', artist: '오로라 필드', album: '시그널' },
    { title: '그래비티', artist: '오비트', album: '딥 스페이스' }
  ];
  const MEDIA = window.MEDIA || {};
  const IG_MEDIA = MEDIA.instagram || {};
  const SP_MEDIA = MEDIA.spotify || {};
  const IG_USERS = IG_MEDIA.users || {};
  const IG_POSTS = IG_MEDIA.posts || {};
  const IG_STORIES = IG_MEDIA.stories || {};
  const IG_REELS = IG_MEDIA.reels || {};
  const IG_DM_IMAGES = IG_MEDIA.dmImages || {};
  const SP_COVERS = SP_MEDIA.trackCovers || [];
  const userAvatar = (user) => IG_USERS[user] || '';
  const postImage = (post) => IG_POSTS[post.id] || post.image || '';
  const storyImage = (story) => IG_STORIES[story.id] || story.image || '';
  const reelImage = (reel) => IG_REELS[reel.id] || reel.image || '';
  const dmImage = (key) => IG_DM_IMAGES[key] || '';
  const playlistCover = (pl) => (SP_MEDIA.playlistCovers && SP_MEDIA.playlistCovers[pl.id]) || pl.cover || '';
  const trackCover = (index) => SP_COVERS[index] || '';

  const IG_NOTES = [
    { user: 'emma.k', text: '출시 행사 🎉' },
    { user: 'alex.chen', text: '촬영 중' },
    { user: 'sora', text: '바다 🌊' },
    { user: 'design.team', text: '새 목업' }
  ];

  const IG_REPLIES = [
    '좋아! 바로 확인할게 😊',
    '완전 좋다. 조금 이따 연락할게!',
    '나도 그렇게 생각해 🔥',
    '사진 더 보내줄까?',
    '고마워! 주말에 보자.'
  ];

  const IG_DMS = [
    {
      id: 'dm-emma',
      user: 'emma.k',
      name: 'Emma Kim',
      online: true,
      unread: 2,
      time: '방금',
      messages: [
        { id: 'emma-1', from: 'them', text: '저녁 출시 행사에 올 거야?', time: '오후 6:48' },
        { id: 'emma-2', from: 'me', text: '응, 7시까지 갈게.', time: '오후 6:50', read: true },
        { id: 'emma-3', from: 'them', text: '좋아! 입구에서 만나자 🎉', time: '오후 6:51', reaction: '❤️' },
        { id: 'emma-4', from: 'them', image: 'rooftop', time: '오후 6:52' },
        { id: 'emma-5', from: 'me', text: '사진 진짜 예쁘다. 어디서 찍었어?', time: '오후 6:54', read: true },
        { id: 'emma-6', from: 'them', text: '성수 쪽 루프탑!', time: '오후 6:55', reaction: '🔥' },
        { id: 'emma-7', from: 'them', text: '조금만 늦어도 괜찮아 😊', time: '오후 6:56' }
      ]
    },
    {
      id: 'dm-alex',
      user: 'alex.chen',
      name: 'Alex Chen',
      online: false,
      unread: 0,
      time: '오후 5:13',
      messages: [
        { id: 'alex-1', from: 'them', text: '새 iPhone 카메라 진짜 대박이야.', time: '오후 4:58' },
        { id: 'alex-2', from: 'me', text: '그치? 48MP 센서는 차원이 달라.', time: '오후 5:00', read: true },
        { id: 'alex-3', from: 'them', postId: 'igp3', time: '오후 5:08', reaction: '😍' },
        { id: 'alex-4', from: 'them', text: '이 사진 보면 알 거야.', time: '오후 5:08' },
        { id: 'alex-5', from: 'me', text: '와, 빛이 미쳤다. 나도 저장했어.', time: '오후 5:10', read: true },
        { id: 'alex-6', from: 'them', voice: '0:12', time: '오후 5:12' },
        { id: 'alex-7', from: 'them', text: '다음 주에 같이 촬영 가자.', time: '오후 5:13' }
      ]
    },
    {
      id: 'dm-design',
      user: 'design.team',
      group: ['design.team', 'min.j', 'yuna'],
      name: '디자인 팀',
      online: false,
      unread: 4,
      time: '오후 4:37',
      messages: [
        { id: 'design-1', from: 'them', sender: 'min.j', text: '새 목업 공유 폴더에 올렸어.', time: '오후 4:12' },
        { id: 'design-2', from: 'them', sender: 'yuna', text: '아이콘 톤 너무 좋다 👏', time: '오후 4:14' },
        { id: 'design-3', from: 'me', text: '확인했어. DM 화면도 같이 봐줘.', time: '오후 4:20', read: true },
        { id: 'design-4', from: 'them', sender: 'design.team', image: 'studio', time: '오후 4:25' },
        { id: 'design-5', from: 'them', sender: 'min.j', text: '이 방향으로 가자!', time: '오후 4:37', reaction: '✅' }
      ]
    },
    {
      id: 'dm-sora',
      user: 'sora',
      name: 'Sora',
      online: true,
      unread: 0,
      time: '오후 2:08',
      messages: [
        { id: 'sora-1', from: 'them', text: '바다 사진 보냈어 🌊', time: '오후 1:55' },
        { id: 'sora-2', from: 'them', image: 'ocean', time: '오후 1:56' },
        { id: 'sora-3', from: 'me', text: '여기 어디야? 너무 좋다.', time: '오후 2:01', read: true },
        { id: 'sora-4', from: 'them', text: '강릉! 주말에 같이 가자.', time: '오후 2:08' }
      ]
    },
    {
      id: 'dm-travel',
      user: 'travel.kr',
      name: 'travel.kr',
      online: false,
      unread: 1,
      request: true,
      time: '오전 11:20',
      messages: [
        { id: 'travel-1', from: 'them', text: '안녕하세요! 서울 여행 사진을 공유해도 될까요?', time: '오전 11:20' }
      ]
    }
  ];

  function igIcon(name, filled = false) {
    const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const icons = {
      home: `<path d="M3.5 10.4 12 3.2l8.5 7.2V21h-6v-6.2h-5V21h-6V10.4Z" ${filled ? 'fill="currentColor" stroke="none"' : stroke}/>`,
      search: `<circle cx="10.5" cy="10.5" r="6.8" ${stroke}/><path d="m15.6 15.6 5 5" ${stroke}/>`,
      reels: `<rect x="3" y="3" width="18" height="18" rx="5" ${stroke}/><path d="m8 3 4 5M16 3l4 5M3 8h18" ${stroke}/><path d="m10.5 11.4 4.2 2.5-4.2 2.5v-5Z" fill="currentColor"/>`,
      profile: `<circle cx="12" cy="8" r="4" ${stroke}/><path d="M4.5 21c.6-4.1 3.6-6.3 7.5-6.3s6.9 2.2 7.5 6.3" ${stroke}/>`,
      heart: `<path d="M12 21s-7.6-4.7-9.5-9.2C1.2 8.2 3.3 4.8 6.7 4.8c2 0 3.4 1.1 4.3 2.4.9-1.3 2.3-2.4 4.3-2.4 3.4 0 5.5 3.4 4.1 7.1C19.6 16.3 12 21 12 21Z" ${filled ? 'fill="currentColor" stroke="none"' : stroke}/>`,
      comment: `<path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3c-1.4 0-2.7-.3-3.8-.8L4 20l1.1-4.1a8 8 0 0 1-1.6-4.9A8.4 8.4 0 0 1 12 2.7a8.4 8.4 0 0 1 9 8.8Z" ${stroke}/>`,
      share: `<path d="m21 3-7.2 18-3.1-7.7L3 10.2 21 3Z" ${stroke}/><path d="M21 3 10.7 13.3" ${stroke}/>`,
      save: `<path d="M6 3.5h12v18l-6-4.5-6 4.5v-18Z" ${filled ? 'fill="currentColor" stroke="none"' : stroke}/>`,
      more: `<g fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></g>`,
      plus: `<path d="M12 5v14M5 12h14" ${stroke}/>`,
      close: `<path d="m6 6 12 12M18 6 6 18" ${stroke}/>`,
      send: `<path d="m3.5 11.5 17-8-5.2 17-4.1-6.6-7.7-2.4Z" ${stroke}/>`,
      back: `<path d="m15 5-7 7 7 7" ${stroke}/>`,
      phone: `<path d="M7.2 3.8c.6-.2 1.2.1 1.6.7l1.2 2.1c.3.6.2 1.3-.3 1.7l-.8.7c-.2.2-.3.5-.1.8.8 1.4 1.9 2.5 3.3 3.3.3.2.6.1.8-.1l.7-.8c.4-.5 1.1-.6 1.7-.3l2.1 1.2c.6.4.9 1 .7 1.6-.4 1.6-1.9 2.7-3.5 2.5-3.9-.4-7.4-3.9-7.8-7.8-.2-1.6.9-3.1 2.5-3.5Z" ${stroke}/>`,
      video: `<rect x="3" y="6.5" width="12.5" height="11" rx="3" ${stroke}/><path d="m15.5 10 5-2.5v9L15.5 14" ${stroke}/>`,
      camera: `<path d="M4 7.5h3l1.5-2h7l1.5 2h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a1 1 0 0 1 1-1Z" ${stroke}/><circle cx="12" cy="13" r="3.5" ${stroke}/>`,
      image: `<rect x="3" y="4.5" width="18" height="15" rx="3" ${stroke}/><circle cx="8.5" cy="9.5" r="1.6" fill="currentColor"/><path d="m4.5 17 5-5 3.5 3.5 2.5-2.5 4 4" ${stroke}/>`,
      mic: `<rect x="9" y="3" width="6" height="11" rx="3" ${stroke}/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" ${stroke}/>`,
      smile: `<circle cx="12" cy="12" r="9" ${stroke}/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" ${stroke}/>`,
      check: `<path d="m5 12.5 4.2 4.2L19 7" ${stroke}/>`
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ''}</svg>`;
  }

  function spIcon(name) {
    const stroke = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
    const icons = {
      home: `<path d="M3.5 10.4 12 3.2l8.5 7.2V21h-6v-6.2h-5V21h-6V10.4Z" ${stroke}/>`,
      search: `<circle cx="10.5" cy="10.5" r="6.8" ${stroke}/><path d="m15.6 15.6 5 5" ${stroke}/>`,
      library: `<path d="M4 4v16M8 4v16M12 5v15M16 4v16M20 6v12" ${stroke}/>`,
      play: `<path d="m8 5 11 7-11 7V5Z" fill="currentColor"/>`,
      pause: `<path d="M8 5h3v14H8zM14 5h3v14h-3z" fill="currentColor"/>`,
      next: `<path d="m5 5 9 7-9 7V5ZM17 5h2v14h-2z" fill="currentColor"/>`,
      prev: `<path d="m19 5-9 7 9 7V5ZM5 5h2v14H5z" fill="currentColor"/>`,
      shuffle: `<path d="M3 7h3.5c4 0 4 10 8 10H21M3 17h3.5c1.6 0 2.6-1.6 3.5-3.5M17 4l4 3-4 3M17 14l4 3-4 3" ${stroke}/>`,
      repeat: `<path d="M17 2.8 21 7l-4 4.2M21 7H7a4 4 0 0 0-4 4v1M7 21.2 3 17l4-4.2M3 17h14a4 4 0 0 0 4-4v-1" ${stroke}/>`,
      heart: `<path d="M12 21s-7.6-4.7-9.5-9.2C1.2 8.2 3.3 4.8 6.7 4.8c2 0 3.4 1.1 4.3 2.4.9-1.3 2.3-2.4 4.3-2.4 3.4 0 5.5 3.4 4.1 7.1C19.6 16.3 12 21 12 21Z" ${stroke}/>`,
      heartFill: `<path d="M12 21s-7.6-4.7-9.5-9.2C1.2 8.2 3.3 4.8 6.7 4.8c2 0 3.4 1.1 4.3 2.4.9-1.3 2.3-2.4 4.3-2.4 3.4 0 5.5 3.4 4.1 7.1C19.6 16.3 12 21 12 21Z" fill="currentColor" stroke="none"/>`,
      plus: `<path d="M12 5v14M5 12h14" ${stroke}/>`,
      close: `<path d="m6 6 12 12M18 6 6 18" ${stroke}/>`,
      chevron: `<path d="m6 9 6 6 6-6" ${stroke}/>`,
      back: `<path d="m15 5-7 7 7 7" ${stroke}/>`,
      more: `<g fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></g>`
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ''}</svg>`;
  }

  /* =========================================================
     INSTAGRAM
     ========================================================= */
  Apps.instagram = {
    render(view, ctx) {
      theme(view, false);
      view.classList.add('ig-app');
      const data = ctx.db.get('instagram', null) || { profile: {}, posts: [], stories: [], reels: [] };
      if (!data.profile) data.profile = {};
      if (!Array.isArray(data.posts)) data.posts = [];
      if (!Array.isArray(data.stories)) data.stories = [];
      if (!Array.isArray(data.reels)) data.reels = [];
      if (!Array.isArray(data.dms)) data.dms = [];
      let tab = 'home';
      let profileTab = 'posts';
      let modal = null;
      let storyIndex = -1;
      let storyTimer = null;
      let query = '';
      let dmQuery = '';
      let dmReplyTimer = null;
      let lastTap = 0;
      let lastTapId = null;
      const clean = bag();
      const save = () => ctx.db.set('instagram', data);
      if (!data.dms.length) { data.dms = JSON.parse(JSON.stringify(IG_DMS)); save(); }
      const profile = data.profile;

      view.innerHTML = `<div class="ig-shell">
        <div class="ig-top" id="igTop"></div>
        <div class="ig-content" id="igContent"></div>
        <div class="ig-tabs" id="igTabs"></div>
        <div class="ig-modal" id="igModal"></div>
      </div>`;

      function avatar(src, cls = '') {
        return `<span class="ig-avatar ${cls}" style="background:linear-gradient(150deg,#feda75,#d62976,#4f5bd5)"><img src="${attr(src)}" alt="" loading="lazy" onerror="this.remove()"></span>`;
      }
      function photo(src, cls = '', inner = '') {
        return `<span class="${cls}" style="background:linear-gradient(150deg,#2b2b31,#0b0b0e)"><img src="${attr(src)}" alt="" loading="lazy" onerror="this.style.opacity='0'">${inner}</span>`;
      }
      function postCard(p) {
        const comments = p.comments || [];
        return `<article class="ig-post" data-ig-post="${p.id}">
          <header class="ig-post-head">
            ${avatar(userAvatar(p.user) || p.avatar, 'sm')}
            <span class="ig-post-user"><b>${esc(p.user)}</b><span>${esc(p.location)}</span></span>
            <button class="ig-more" data-ig-post-menu="${p.id}" aria-label="게시물 메뉴">${igIcon('more')}</button>
          </header>
          <div class="ig-photo" data-ig-post-img="${p.id}">
            <img src="${attr(postImage(p))}" alt="" loading="lazy" onerror="this.style.opacity='0'">
          </div>
          <div class="ig-actions">
            <button class="ig-act ${p.liked ? 'liked' : ''}" data-ig-like="${p.id}" aria-label="좋아요">${igIcon('heart', p.liked)}</button>
            <button class="ig-act" data-ig-comments="${p.id}" aria-label="댓글">${igIcon('comment')}</button>
            <button class="ig-act" data-ig-share="${p.id}" aria-label="공유">${igIcon('share')}</button>
            <span class="ig-spacer"></span>
            <button class="ig-act ${p.saved ? 'saved' : ''}" data-ig-save="${p.id}" aria-label="저장">${igIcon('save', p.saved)}</button>
          </div>
          <div class="ig-post-body">
            <div class="ig-likes">좋아요 ${Number(p.likes || 0).toLocaleString('ko-KR')}개</div>
            <div class="ig-caption"><b>${esc(p.user)}</b> ${esc(p.caption)}</div>
            ${comments.length ? `<button class="ig-comments-link" data-ig-comments="${p.id}">댓글 ${comments.length}개 모두 보기</button>` : ''}
            ${comments.slice(0, 2).map((c) => `<div class="ig-comment"><b>${esc(c.user)}</b> ${esc(c.text)}</div>`).join('')}
            <div class="ig-time">${esc(p.time)}</div>
          </div>
        </article>`;
      }
      function renderTop() {
        if (tab === 'home') {
          $('#igTop', view).innerHTML = `<div class="ig-topbar">
            <span class="ig-logo">Instagram</span>
            <div class="ig-top-actions">
              <button class="ig-iconbtn" data-ig-open="create" aria-label="새 게시물">${igIcon('plus')}</button>
              <button class="ig-iconbtn" data-ig-open="activity" aria-label="활동">${igIcon('heart')}</button>
              <button class="ig-iconbtn" data-ig-open="messages" aria-label="메시지">${igIcon('send')}</button>
            </div>
          </div>`;
        } else if (tab === 'explore') {
          $('#igTop', view).innerHTML = `<div class="ig-topbar"><span class="ig-top-title">탐색</span><button class="ig-iconbtn" data-ig-open="create" aria-label="새 게시물">${igIcon('plus')}</button></div>`;
        } else if (tab === 'reels') {
          $('#igTop', view).innerHTML = `<div class="ig-topbar"><span class="ig-top-title">릴스</span><button class="ig-iconbtn" data-ig-open="create" aria-label="새 게시물">${igIcon('plus')}</button></div>`;
        } else {
          $('#igTop', view).innerHTML = `<div class="ig-topbar"><span class="ig-top-title">${esc(profile.username || 'alex.morgan')}</span><button class="ig-iconbtn" data-ig-open="create" aria-label="새 게시물">${igIcon('plus')}</button></div>`;
        }
      }
      function storyRail() {
        return `<div class="ig-stories">
          <button class="ig-story" data-ig-open="create-story"><span class="ig-story-ring add"><span class="ig-story-avatar">${igIcon('plus')}</span></span><span>내 스토리</span></button>
          ${data.stories.map((s, i) => `<button class="ig-story" data-ig-story="${i}"><span class="ig-story-ring ${s.seen ? 'seen' : ''}"><span class="ig-story-avatar"><img src="${attr(userAvatar(s.user) || s.avatar)}" alt="" loading="lazy" onerror="this.remove()"></span></span><span>${esc(s.user)}</span></button>`).join('')}
        </div>`;
      }
      function renderHome() {
        return `${storyRail()}<div class="ig-feed">${data.posts.map(postCard).join('')}</div>`;
      }
      function filteredPosts() {
        const q = query.trim().toLowerCase();
        if (!q) return data.posts;
        return data.posts.filter((p) => `${p.user} ${p.caption} ${p.location}`.toLowerCase().includes(q));
      }
      function exploreResults() {
        const posts = filteredPosts();
        if (!posts.length) return `<div class="ig-empty">검색 결과가 없습니다.</div>`;
        return `<div class="ig-explore-grid">${posts.map((p) => `<button class="ig-explore-cell" data-ig-open-post="${p.id}"><img src="${attr(postImage(p))}" alt="" loading="lazy" onerror="this.style.opacity='0'"><span class="ig-explore-likes">${igIcon('heart', true)} ${Number(p.likes || 0).toLocaleString('ko-KR')}</span></button>`).join('')}</div>`;
      }
      function renderExplore() {
        return `<div class="ig-searchbar">${igIcon('search')}<input id="igSearch" placeholder="검색" value="${attr(query)}" aria-label="검색"></div><div id="igExploreResults">${exploreResults()}</div>`;
      }
      function renderReels() {
        return `<div class="ig-reels">${data.reels.map((r, i) => `<div class="ig-reel">
          <img src="${attr(reelImage(r))}" alt="" loading="lazy" onerror="this.style.opacity='0'">
          <div class="ig-reel-grad"></div>
          <div class="ig-reel-meta">
            <div class="ig-reel-user">${avatar(userAvatar(r.user) || profile.avatar, 'sm')}<b>${esc(r.user)}</b></div>
            <p>${esc(r.caption)}</p>
            <div class="ig-reel-actions">
              <button class="ig-act ${r.liked ? 'liked' : ''}" data-ig-reel-like="${i}" aria-label="좋아요">${igIcon('heart', r.liked)}<span>${Number(r.likes || 0).toLocaleString('ko-KR')}</span></button>
              <button class="ig-act" data-ig-comments="${data.posts[0] ? data.posts[0].id : ''}" aria-label="댓글">${igIcon('comment')}</button>
              <button class="ig-act" data-ig-share="${data.posts[0] ? data.posts[0].id : ''}" aria-label="공유">${igIcon('share')}</button>
            </div>
          </div>
        </div>`).join('')}</div>`;
      }
      function profileGrid() {
        const posts = profileTab === 'saved' ? data.posts.filter((p) => p.saved) : data.posts;
        if (!posts.length) return `<div class="ig-empty">${profileTab === 'saved' ? '저장한 게시물이 없습니다.' : '게시물이 없습니다.'}</div>`;
        return `<div class="ig-grid">${posts.map((p) => `<div class="ig-grid-cell" data-ig-open-post="${p.id}">
          <img src="${attr(postImage(p))}" alt="" loading="lazy" onerror="this.style.opacity='0'">
          <button class="ig-grid-menu" data-ig-post-menu="${p.id}" aria-label="게시물 메뉴">${igIcon('more')}</button>
        </div>`).join('')}</div>`;
      }
      function renderProfile() {
        return `<div class="ig-profile">
          <div class="ig-profile-head">${avatar(userAvatar(profile.username) || profile.avatar, 'lg')}
            <div class="ig-stats">
              <div><b>${data.posts.length}</b><span>게시물</span></div>
              <div><b>${esc(profile.followers || '0')}</b><span>팔로워</span></div>
              <div><b>${esc(profile.following || '0')}</b><span>팔로잉</span></div>
            </div>
          </div>
          <div class="ig-profile-name"><b>${esc(profile.name || '')}</b><span>${esc(profile.bio || '')}</span></div>
          <div class="ig-profile-actions"><button class="ig-edit-btn" data-ig-open="profile">프로필 편집</button><button class="ig-edit-btn" data-ig-share-profile>공유</button></div>
          <div class="ig-profile-tabs">
            <button class="${profileTab === 'posts' ? 'active' : ''}" data-ig-profile-tab="posts">▦ 게시물</button>
            <button class="${profileTab === 'saved' ? 'active' : ''}" data-ig-profile-tab="saved">▢ 저장됨</button>
          </div>
          ${profileGrid()}
        </div>`;
      }
      function renderContent() {
        const el = $('#igContent', view);
        if (tab === 'home') el.innerHTML = renderHome();
        else if (tab === 'explore') el.innerHTML = renderExplore();
        else if (tab === 'reels') el.innerHTML = renderReels();
        else el.innerHTML = renderProfile();
      }
      function renderTabs() {
        $('#igTabs', view).innerHTML = `
          <button class="ig-tab ${tab === 'home' ? 'active' : ''}" data-ig-tab="home">${igIcon('home', tab === 'home')}<span>홈</span></button>
          <button class="ig-tab ${tab === 'explore' ? 'active' : ''}" data-ig-tab="explore">${igIcon('search')}<span>탐색</span></button>
          <button class="ig-tab ${tab === 'reels' ? 'active' : ''}" data-ig-tab="reels">${igIcon('reels', tab === 'reels')}<span>릴스</span></button>
          <button class="ig-tab ${tab === 'profile' ? 'active' : ''}" data-ig-tab="profile">${igIcon('profile', tab === 'profile')}<span>프로필</span></button>`;
      }
      function dmNow() {
        const d = new Date();
        return `${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
      function dmPreview(dm) {
        const m = dm.messages[dm.messages.length - 1] || {};
        if (m.image) return '사진을 보냈습니다.';
        if (m.postId) return '게시물을 공유했습니다.';
        if (m.voice) return '음성 메시지';
        return m.text || '';
      }
      function dmAvatar(dm, cls = 'sm') {
        if (dm.group) {
          return `<span class="ig-dm-stack">${dm.group.slice(0, 2).map((u) => avatar(userAvatar(u), 'xs')).join('')}</span>`;
        }
        return avatar(userAvatar(dm.user), cls);
      }
      function dmRows() {
        const q = dmQuery.trim().toLowerCase();
        const rows = data.dms.filter((dm) => !q || `${dm.name} ${dm.user} ${dmPreview(dm)}`.toLowerCase().includes(q));
        if (!rows.length) return `<div class="ig-dm-empty">대화를 찾을 수 없습니다.</div>`;
        return rows.map((dm) => `<button class="ig-dm-row ${dm.unread ? 'unread' : ''}" data-ig-dm-open="${dm.id}">
          ${dmAvatar(dm)}
          <span class="ig-dm-row-main"><b>${esc(dm.name)}</b><small>${esc(dmPreview(dm))} · ${esc(dm.time)}</small></span>
          ${dm.unread ? `<span class="ig-dm-unread">${dm.unread}</span>` : ''}
          ${dm.request ? '<span class="ig-dm-request">요청</span>' : ''}
        </button>`).join('');
      }
      function dmInbox() {
        return `<div class="ig-dm">
          <header class="ig-dm-head"><button class="ig-iconbtn" data-ig-modal-close aria-label="닫기">${igIcon('back')}</button><b>메시지</b><button class="ig-iconbtn" data-ig-dm-new aria-label="새 메시지">${igIcon('plus')}</button></header>
          <div class="ig-dm-userbar">${avatar(userAvatar(profile.username) || profile.avatar, 'sm')}<b>${esc(profile.username)}</b><span>${data.dms.reduce((n, dm) => n + (dm.unread || 0), 0)}개의 새 메시지</span></div>
          <div class="ig-dm-search"><span>${igIcon('search')}</span><input id="igDmSearch" value="${attr(dmQuery)}" placeholder="검색" aria-label="메시지 검색"></div>
          <div class="ig-dm-notes">${IG_NOTES.map((n) => `<button class="ig-dm-note" data-ig-dm-note="${n.user}">${avatar(userAvatar(n.user), 'xs')}<span>${esc(n.text)}</span><small>${esc(n.user)}</small></button>`).join('')}</div>
          <div class="ig-dm-list" id="igDmList">${dmRows()}</div>
        </div>`;
      }
      function dmBubble(m, dm) {
        const mine = m.from === 'me';
        let body = `<span>${esc(m.text || '')}</span>`;
        let media = false;
        if (m.image) { body = `<img class="ig-dm-image" src="${attr(dmImage(m.image))}" alt="" loading="lazy" onerror="this.style.opacity='0'">`; media = true; }
        else if (m.postId) {
          const p = data.posts.find((x) => x.id === m.postId);
          body = `<span class="ig-dm-post"><img src="${attr(p ? postImage(p) : '')}" alt="" loading="lazy" onerror="this.style.opacity='0'"><span>${esc(p ? p.caption : '공유된 게시물')}</span></span>`;
          media = true;
        } else if (m.voice) {
          body = `<span class="ig-dm-voice"><span class="ig-dm-wave">${Array.from({ length: 14 }, (_, i) => `<i style="height:${5 + (i * 7) % 13}px"></i>`).join('')}</span><b>${esc(m.voice)}</b></span>`;
        }
        return `<div class="ig-dm-msg ${mine ? 'me' : 'them'}" data-ig-dm-msg="${m.id}">
          ${!mine && dm.group && m.sender ? `<span class="ig-dm-sender">${esc(m.sender)}</span>` : ''}
          <div class="ig-dm-bubble ${media ? 'media' : ''}">${body}${m.reaction ? `<span class="ig-dm-react">${m.reaction}</span>` : ''}</div>
          <span class="ig-dm-meta">${esc(m.time)}${mine && m.read ? ' · 읽음' : ''}</span>
        </div>`;
      }
      function dmThread(dm) {
        return `<div class="ig-dm">
          <header class="ig-dm-head ig-dm-thread-head"><button class="ig-iconbtn" data-ig-dm-back aria-label="뒤로">${igIcon('back')}</button>${dmAvatar(dm, 'sm')}<span class="ig-dm-title"><b>${esc(dm.name)}</b><small>${dm.online ? '지금 활동 중' : '최근 활동'}</small></span><button class="ig-iconbtn" data-ig-dm-call="phone" aria-label="통화">${igIcon('phone')}</button><button class="ig-iconbtn" data-ig-dm-call="video" aria-label="영상 통화">${igIcon('video')}</button></header>
          <div class="ig-dm-thread" id="igDmThread">
            <div class="ig-dm-profile">${dmAvatar(dm, 'lg')}<b>${esc(dm.name)}</b><small>${esc(dm.user)} · Instagram</small></div>
            <div class="ig-dm-date">오늘</div>
            ${dm.messages.map((m) => dmBubble(m, dm)).join('')}
            ${dm.group ? '' : `<div class="ig-dm-seen">${avatar(userAvatar(dm.user), 'xs')}<span>${esc(dm.name)}님이 읽음</span></div>`}
          </div>
          <div class="ig-dm-compose">
            <button class="ig-iconbtn" data-ig-dm-image aria-label="사진 보내기">${igIcon('image')}</button>
            <button class="ig-iconbtn" data-ig-dm-mic aria-label="음성 메시지">${igIcon('mic')}</button>
            <input id="igDmInput" placeholder="메시지 보내기..." aria-label="메시지 입력">
            <button class="ig-dm-send" data-ig-dm-send aria-label="보내기">${igIcon('send')}</button>
          </div>
        </div>`;
      }
      function openDm(id) {
        const dm = data.dms.find((x) => x.id === id);
        if (!dm) return;
        dm.unread = 0;
        dm.request = false;
        save();
        modal = { type: 'messages', threadId: id };
        renderModal();
      }
      function sendDm(dm, msg) {
        dm.messages.push({ id: `m-${Date.now()}`, from: 'me', time: dmNow(), read: false, ...msg });
        dm.time = '방금';
        dm.unread = 0;
        save();
        renderModal();
        clearTimeout(dmReplyTimer);
        dmReplyTimer = setTimeout(() => {
          if (!modal || modal.type !== 'messages' || modal.threadId !== dm.id) return;
          const last = dm.messages[dm.messages.length - 1];
          if (last) last.read = true;
          const reply = IG_REPLIES[Math.floor(Math.random() * IG_REPLIES.length)];
          dm.messages.push({ id: `m-${Date.now()}`, from: 'them', text: reply, time: dmNow(), reaction: Math.random() > 0.65 ? '❤️' : '' });
          dm.time = '방금';
          save();
          renderModal();
        }, 1100);
      }
      function scrollDmThread() {
        const thread = $('#igDmThread', view);
        if (thread) thread.scrollTop = thread.scrollHeight;
      }

      function renderModal() {
        const el = $('#igModal', view);
        if (!modal) { el.innerHTML = ''; return; }
        if (modal.type === 'story') {
          const s = data.stories[storyIndex];
          if (!s) { modal = null; el.innerHTML = ''; return; }
          el.innerHTML = `<div class="ig-story-viewer">
            <div class="ig-story-progress">${data.stories.map((_, i) => `<i class="${i < storyIndex ? 'done' : i === storyIndex ? 'active' : ''}"></i>`).join('')}</div>
            <div class="ig-story-head">${avatar(s.avatar, 'sm')}<b>${esc(s.user)}</b><span class="ig-story-count">${storyIndex + 1}/${data.stories.length}</span><button data-ig-story-close aria-label="닫기">${igIcon('close')}</button></div>
            <img class="ig-story-img" src="${attr(storyImage(s))}" alt="" onerror="this.style.opacity='0'">
            <button class="ig-story-zone prev" data-ig-story-prev aria-label="이전"></button>
            <button class="ig-story-zone next" data-ig-story-next aria-label="다음"></button>
          </div>`;
          return;
        }
        if (modal.type === 'comments') {
          const p = data.posts.find((x) => x.id === modal.id);
          if (!p) { modal = null; el.innerHTML = ''; return; }
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>댓글</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-comments-list">${(p.comments || []).map((c) => `<div class="ig-comment-row">${avatar(userAvatar(c.user) || profile.avatar, 'sm')}<span><b>${esc(c.user)}</b> ${esc(c.text)}</span></div>`).join('') || '<div class="ig-empty">첫 댓글을 남겨 보세요.</div>'}</div>
            <div class="ig-comment-input"><input id="igCommentInput" placeholder="댓글 추가..." aria-label="댓글 추가"><button data-ig-comment-send="${p.id}">게시</button></div>
          </div></div>`;
          return;
        }
        if (modal.type === 'profile') {
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>프로필 편집</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-form">
              <label>사용자 이름<input id="igEditUsername" value="${attr(profile.username)}"></label>
              <label>이름<input id="igEditName" value="${attr(profile.name)}"></label>
              <label>소개<textarea id="igEditBio" rows="3">${esc(profile.bio)}</textarea></label>
              <button class="ig-primary" data-ig-save-profile>저장</button>
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'create') {
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>새 게시물</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-form">
              <label>위치<input id="igNewLocation" placeholder="서울, 대한민국" value="서울, 대한민국"></label>
              <label>문구<textarea id="igNewCaption" rows="3" placeholder="문구를 입력하세요..."></textarea></label>
              <button class="ig-primary" data-ig-create-post>게시</button>
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'post') {
          const p = data.posts.find((x) => x.id === modal.id);
          if (!p) { modal = null; el.innerHTML = ''; return; }
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>게시물 편집</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-form">
              <label>위치<input id="igPostLocation" value="${attr(p.location)}"></label>
              <label>문구<textarea id="igPostCaption" rows="3">${esc(p.caption)}</textarea></label>
              <button class="ig-primary" data-ig-save-post="${p.id}">저장</button>
              <button class="ig-danger" data-ig-del-post="${p.id}">게시물 삭제</button>
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'create-story') {
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>스토리 추가</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-form">
              <button class="ig-primary" data-ig-create-story>스토리에 추가</button>
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'activity') {
          el.innerHTML = `<div class="ig-sheet-wrap"><div class="ig-sheet">
            <div class="ig-sheet-head"><span></span><b>활동</b><button data-ig-modal-close aria-label="닫기">${igIcon('close')}</button></div>
            <div class="ig-activity-list">
              <div class="ig-activity-row">${avatar(userAvatar('emma.k'), 'sm')}<span><b>emma.k</b>님이 회원님의 게시물을 좋아합니다.<small>2분 전</small></span></div>
              <div class="ig-activity-row">${avatar(userAvatar('alex.chen'), 'sm')}<span><b>alex.chen</b>님이 회원님을 팔로우하기 시작했습니다.<small>18분 전</small></span></div>
              <div class="ig-activity-row">${avatar(userAvatar('design.team'), 'sm')}<span><b>design.team</b>님이 댓글을 남겼습니다: “멋져요!”<small>1시간 전</small></span></div>
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'messages') {
          const dm = modal.threadId ? data.dms.find((x) => x.id === modal.threadId) : null;
          el.innerHTML = dm ? dmThread(dm) : dmInbox();
          if (dm) requestAnimationFrame(scrollDmThread);
          return;
        }
        el.innerHTML = '';
      }
      function renderAll() {
        const scroller = $('#igContent', view);
        const scrollTop = scroller ? scroller.scrollTop : 0;
        renderTop(); renderContent(); renderTabs(); renderModal();
        const nextScroller = $('#igContent', view);
        if (nextScroller) nextScroller.scrollTop = scrollTop;
      }
      function openStory(i) {
        if (!data.stories.length) return;
        storyIndex = (i + data.stories.length) % data.stories.length;
        modal = { type: 'story' };
        data.stories[storyIndex].seen = true;
        save(); renderAll(); startStoryTimer();
      }
      function startStoryTimer() {
        clearTimeout(storyTimer);
        storyTimer = setTimeout(() => {
          if (!modal || modal.type !== 'story') return;
          if (storyIndex >= data.stories.length - 1) { modal = null; storyIndex = -1; renderAll(); return; }
          storyIndex++; data.stories[storyIndex].seen = true; save(); renderAll(); startStoryTimer();
        }, 6000);
      }
      function closeStory() {
        clearTimeout(storyTimer); storyIndex = -1; modal = null; renderAll();
      }
      function toggleLike(id) {
        const p = data.posts.find((x) => x.id === id);
        if (!p) return;
        p.liked = !p.liked;
        p.likes = Math.max(0, Number(p.likes || 0) + (p.liked ? 1 : -1));
        save(); renderAll();
      }
      function showHeart(el) {
        const heart = document.createElement('span');
        heart.className = 'ig-heart-pop';
        heart.innerHTML = igIcon('heart', true);
        el.appendChild(heart);
        setTimeout(() => heart.remove(), 850);
      }
      function openPost(id) {
        tab = 'home'; modal = null; renderAll();
        requestAnimationFrame(() => {
          const el = view.querySelector(`[data-ig-post="${id}"]`);
          if (el) el.scrollIntoView({ block: 'start' });
        });
      }

      view.addEventListener('click', (e) => {
        const dmOpen = e.target.closest('[data-ig-dm-open]');
        if (dmOpen) { openDm(dmOpen.dataset.igDmOpen); return; }
        const dmBack = e.target.closest('[data-ig-dm-back]');
        if (dmBack) { modal = { type: 'messages' }; renderModal(); return; }
        const dmNote = e.target.closest('[data-ig-dm-note]');
        if (dmNote) {
          const target = data.dms.find((dm) => dm.user === dmNote.dataset.igDmNote || (dm.group || []).includes(dmNote.dataset.igDmNote));
          if (target) openDm(target.id); else ctx.toast('아직 대화가 없습니다.', '💬');
          return;
        }
        const dmNew = e.target.closest('[data-ig-dm-new]');
        if (dmNew) { ctx.toast('새 메시지는 곧 추가됩니다.', '✎'); return; }
        const dmCall = e.target.closest('[data-ig-dm-call]');
        if (dmCall) { ctx.toast(dmCall.dataset.igDmCall === 'video' ? '영상 통화를 거는 중...' : '통화를 거는 중...', dmCall.dataset.igDmCall === 'video' ? '📹' : '📞'); return; }
        const activeDm = modal && modal.type === 'messages' && modal.threadId ? data.dms.find((x) => x.id === modal.threadId) : null;
        if (activeDm && e.target.closest('[data-ig-dm-image]')) { sendDm(activeDm, { image: 'coffee' }); return; }
        if (activeDm && e.target.closest('[data-ig-dm-mic]')) { sendDm(activeDm, { voice: '0:08' }); ctx.toast('음성 메시지를 보냈습니다.', '🎙'); return; }
        if (activeDm && e.target.closest('[data-ig-dm-send]')) {
          const input = $('#igDmInput', view);
          const text = (input ? input.value : '').trim();
          if (text) sendDm(activeDm, { text });
          return;
        }
        const tabBtn = e.target.closest('[data-ig-tab]');
        if (tabBtn) { tab = tabBtn.dataset.igTab; modal = null; const sc = $('#igContent', view); if (sc) sc.scrollTop = 0; renderAll(); return; }
        const profileTabBtn = e.target.closest('[data-ig-profile-tab]');
        if (profileTabBtn) { profileTab = profileTabBtn.dataset.igProfileTab; const sc = $('#igContent', view); if (sc) sc.scrollTop = 0; renderAll(); return; }
        const story = e.target.closest('[data-ig-story]');
        if (story) { openStory(+story.dataset.igStory); return; }
        const storyClose = e.target.closest('[data-ig-story-close]');
        if (storyClose) { closeStory(); return; }
        const storyNext = e.target.closest('[data-ig-story-next]');
        if (storyNext) { clearTimeout(storyTimer); if (storyIndex >= data.stories.length - 1) closeStory(); else openStory(storyIndex + 1); return; }
        const storyPrev = e.target.closest('[data-ig-story-prev]');
        if (storyPrev) { clearTimeout(storyTimer); openStory(storyIndex - 1); return; }
        const open = e.target.closest('[data-ig-open]');
        if (open) {
          const kind = open.dataset.igOpen;
          if (kind === 'create-story') modal = { type: 'create-story' };
          else modal = { type: kind };
          renderAll(); return;
        }
        const menu = e.target.closest('[data-ig-post-menu]');
        if (menu) { e.stopPropagation(); modal = { type: 'post', id: menu.dataset.igPostMenu }; renderAll(); return; }
        const openPostBtn = e.target.closest('[data-ig-open-post]');
        if (openPostBtn) { openPost(openPostBtn.dataset.igOpenPost); return; }
        const like = e.target.closest('[data-ig-like]');
        if (like) { toggleLike(like.dataset.igLike); return; }
        const saveBtn = e.target.closest('[data-ig-save]');
        if (saveBtn) { const p = data.posts.find((x) => x.id === saveBtn.dataset.igSave); if (p) { p.saved = !p.saved; save(); renderAll(); } return; }
        const comments = e.target.closest('[data-ig-comments]');
        if (comments) { if (comments.dataset.igComments) { modal = { type: 'comments', id: comments.dataset.igComments }; renderAll(); } return; }
        const share = e.target.closest('[data-ig-share]');
        if (share) { ctx.toast('게시물을 공유할 사람을 선택하세요.', '↗'); return; }
        if (e.target.closest('[data-ig-share-profile]')) { ctx.toast('프로필 링크가 복사되었습니다.', '🔗'); return; }
        const reelLike = e.target.closest('[data-ig-reel-like]');
        if (reelLike) { const r = data.reels[+reelLike.dataset.igReelLike]; if (r) { r.liked = !r.liked; r.likes = Math.max(0, Number(r.likes || 0) + (r.liked ? 1 : -1)); save(); renderAll(); } return; }
        const close = e.target.closest('[data-ig-modal-close]');
        if (close) { modal = null; renderAll(); return; }
        const saveProfile = e.target.closest('[data-ig-save-profile]');
        if (saveProfile) {
          const oldUsername = profile.username;
          profile.username = ($('#igEditUsername', view) || {}).value || profile.username;
          profile.name = ($('#igEditName', view) || {}).value || profile.name;
          profile.bio = ($('#igEditBio', view) || {}).value || '';
          profile.avatar = userAvatar(profile.username) || profile.avatar;
          data.posts.forEach((p) => { if (p.user === oldUsername || p.user === profile.username) { p.user = profile.username; p.avatar = profile.avatar; } });
          data.stories.forEach((s) => { if (s.user === oldUsername) { s.user = profile.username; s.avatar = profile.avatar; } });
          data.reels.forEach((r) => { if (r.user === oldUsername) r.user = profile.username; });
          save(); modal = null; renderAll(); ctx.toast('프로필이 저장되었습니다.', '✓'); return;
        }
        const createPost = e.target.closest('[data-ig-create-post]');
        if (createPost) {
          const image = IG_MEDIA.defaultPost || '';
          const caption = ($('#igNewCaption', view) || {}).value || '새로운 순간을 기록했습니다.';
          const location = ($('#igNewLocation', view) || {}).value || '서울';
          data.posts.unshift({ id: `igp-${Date.now()}`, user: profile.username, avatar: profile.avatar, location, image, caption, likes: 0, liked: false, saved: false, time: '방금 전', comments: [] });
          save(); modal = null; tab = 'profile'; profileTab = 'posts'; renderAll(); ctx.toast('게시물이 게시되었습니다.', '✓'); return;
        }
        const savePost = e.target.closest('[data-ig-save-post]');
        if (savePost) {
          const p = data.posts.find((x) => x.id === savePost.dataset.igSavePost);
          if (p) { p.location = ($('#igPostLocation', view) || {}).value || p.location; p.caption = ($('#igPostCaption', view) || {}).value || ''; save(); modal = null; renderAll(); ctx.toast('게시물이 수정되었습니다.', '✓'); }
          return;
        }
        const delPost = e.target.closest('[data-ig-del-post]');
        if (delPost) { data.posts = data.posts.filter((x) => x.id !== delPost.dataset.igDelPost); save(); modal = null; renderAll(); ctx.toast('게시물이 삭제되었습니다.', '🗑'); return; }
        const createStory = e.target.closest('[data-ig-create-story]');
        if (createStory) {
          const image = IG_MEDIA.defaultStory || '';
          data.stories.unshift({ id: `st-${Date.now()}`, user: profile.username, avatar: profile.avatar, image, seen: false });
          save(); modal = null; renderAll(); ctx.toast('스토리가 추가되었습니다.', '✓'); return;
        }
        const send = e.target.closest('[data-ig-comment-send]');
        if (send) {
          const p = data.posts.find((x) => x.id === send.dataset.igCommentSend);
          const input = $('#igCommentInput', view);
          if (p && input && input.value.trim()) { p.comments = p.comments || []; p.comments.push({ user: profile.username, text: input.value.trim() }); save(); renderAll(); ctx.toast('댓글이 추가되었습니다.', '✓'); }
          return;
        }
        const photoEl = e.target.closest('[data-ig-post-img]');
        if (photoEl) {
          const id = photoEl.dataset.igPostImg;
          const now = Date.now();
          if (lastTapId === id && now - lastTap < 330) {
            const p = data.posts.find((x) => x.id === id);
            if (p && !p.liked) { p.liked = true; p.likes = Number(p.likes || 0) + 1; save(); }
            showHeart(photoEl); lastTap = 0; lastTapId = null;
            setTimeout(renderAll, 860);
          } else { lastTap = now; lastTapId = id; }
        }
      });

      view.addEventListener('input', (e) => {
        if (e.target.id === 'igSearch') {
          query = e.target.value;
          const box = $('#igExploreResults', view);
          if (box) box.innerHTML = exploreResults();
        }
        if (e.target.id === 'igDmSearch') {
          dmQuery = e.target.value;
          const list = $('#igDmList', view);
          if (list) list.innerHTML = dmRows();
        }
      });
      view.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.id === 'igCommentInput') {
          const btn = view.querySelector('[data-ig-comment-send]');
          if (btn) btn.click();
        }
        if (e.key === 'Enter' && e.target.id === 'igDmInput') {
          e.preventDefault();
          const btn = view.querySelector('[data-ig-dm-send]');
          if (btn) btn.click();
        }
      });
      view.addEventListener('dblclick', (e) => {
        const bubble = e.target.closest('[data-ig-dm-msg]');
        const dm = modal && modal.type === 'messages' && modal.threadId ? data.dms.find((x) => x.id === modal.threadId) : null;
        if (!bubble || !dm) return;
        const msg = dm.messages.find((m) => m.id === bubble.dataset.igDmMsg);
        if (!msg) return;
        msg.reaction = msg.reaction ? '' : '❤️';
        save();
        renderModal();
      });

      clean.add(() => { clearTimeout(storyTimer); clearTimeout(dmReplyTimer); });
      renderAll();
      return () => clean.run();
    }
  };

  /* =========================================================
     SPOTIFY
     ========================================================= */
  Apps.spotify = {
    render(view, ctx) {
      theme(view, true);
      view.classList.add('sp-app');
      const music = ctx.music;
      const data = ctx.db.get('spotify', null) || { playlists: [], liked: [], recent: [], shuffle: false, repeat: false };
      if (!Array.isArray(data.playlists)) data.playlists = [];
      if (!Array.isArray(data.liked)) data.liked = [];
      if (!Array.isArray(data.recent)) data.recent = [];
      data.shuffle = music.shuffle;
      data.repeat = music.repeat;
      let tab = 'home';
      let playlistId = null;
      let fullPlayer = false;
      let modal = null;
      let query = '';
      const clean = bag();
      const save = () => ctx.db.set('spotify', data);
      const tracks = () => music.state().tracks;

      view.innerHTML = `<div class="sp-shell">
        <div class="sp-content" id="spContent"></div>
        <div class="sp-mini" id="spMini"></div>
        <div class="sp-tabs" id="spTabs"></div>
        <div class="sp-player" id="spPlayer"></div>
        <div class="sp-modal" id="spModal"></div>
      </div>`;

      function cover(src, cls = '', glyph = '', colors = ['#333', '#111']) {
        return `<span class="sp-cover ${cls}" style="background:linear-gradient(150deg,${colors.join(',')})">${glyph ? `<i>${glyph}</i>` : ''}${src ? `<img src="${attr(src)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span>`;
      }
      function trackCard(i) {
        const t = tracks()[i]; if (!t) return '';
        return `<button class="sp-track-card" data-sp-track="${i}">${cover(SP_COVERS[i], 'square', t.glyph, t.colors)}<b>${esc(t.title)}</b><span>${esc(t.artist)}</span></button>`;
      }
      function playlistCard(pl) {
        return `<button class="sp-card" data-sp-playlist="${pl.id}">${cover(pl.cover, 'square', '', ['#3a3a3a', '#111'])}<b>${esc(pl.name)}</b><span>${esc(pl.description)}</span></button>`;
      }
      function section(title, more, inner) {
        return `<section class="sp-section"><div class="sp-section-head"><h3>${title}</h3>${more ? `<span>${more}</span>` : ''}</div>${inner}</section>`;
      }
      function greeting() {
        const h = new Date().getHours();
        return h < 6 ? '좋은 새벽이에요' : h < 12 ? '좋은 아침이에요' : h < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
      }
      function renderHome() {
        const recents = data.recent.map((i) => trackCard(i)).filter(Boolean).join('');
        const playlists = data.playlists.map(playlistCard).join('');
        const picks = data.playlists.slice(0, 4).map(playlistCard).join('');
        return `<div class="sp-home-head"><div><span class="sp-kicker">${greeting()}</span><h2>Alex</h2></div><span class="sp-avatar">A</span></div>
          <div class="sp-chips"><button class="active">전체</button><button>음악</button><button>팟캐스트</button></div>
          ${section('최근 재생한 항목', '모두 보기', `<div class="sp-recent-grid">${recents}</div>`)}
          ${section('나를 위한 추천', '', `<div class="sp-hscroll">${picks}</div>`)}
          ${section('인기 플레이리스트', '', `<div class="sp-hscroll">${playlists}</div>`)}
          ${section('다시 듣기', '', `<div class="sp-track-list">${data.recent.map((i) => trackRow(i, -1)).join('')}</div>`)}`;
      }
      function trackRow(i, n = -1, opts = {}) {
        const t = tracks()[i]; if (!t) return '';
        const s = music.state();
        const active = s.index === i;
        return `<div class="sp-track-row ${active ? 'playing' : ''}" data-sp-track="${i}">
          <span class="sp-track-num">${active && s.playing ? '❚❚' : (n >= 0 ? n + 1 : '♪')}</span>
          <span class="sp-track-main"><b>${esc(t.title)}</b><span>${esc(t.artist)} · ${esc(t.album)}</span></span>
          ${opts.playlist ? `<button class="sp-track-remove" data-sp-remove-track="${i}" aria-label="플레이리스트에서 제거">−</button>` : opts.liked ? `<button class="sp-track-remove liked" data-sp-unlike="${i}" aria-label="좋아요 해제">♥</button>` : ''}
          <span class="sp-track-dur">${fmt(t.dur)}</span>
        </div>`;
      }
      function renderSearchResults() {
        const q = query.trim().toLowerCase();
        if (!q) {
          const cats = [['K-Pop', '#e13300'], ['팟캐스트', '#1e3264'], ['신나는 음악', '#e8115b'], ['집중', '#503750'], ['최신 히트', '#148a08'], ['R&B', '#8d67ab'], ['여행', '#0d73ec'], ['밤', '#1e3264']];
          return `<div class="sp-cat-grid">${cats.map(([name, color]) => `<button class="sp-cat" data-sp-cat="${attr(name)}" style="background:${color}"><b>${name}</b></button>`).join('')}</div>`;
        }
        const playlists = data.playlists.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q));
        const matched = tracks().map((t, i) => ({ t, i })).filter(({ t, i }) => {
          const ko = SP_KO[i] || {};
          return `${t.title} ${t.artist} ${t.album} ${ko.title || ''} ${ko.artist || ''} ${ko.album || ''}`.toLowerCase().includes(q);
        });
        return `${playlists.length ? `<div class="sp-result-label">플레이리스트</div><div class="sp-search-playlists">${playlists.map(playlistCard).join('')}</div>` : ''}
          ${matched.length ? `<div class="sp-result-label">곡</div><div class="sp-track-list">${matched.map(({ i }) => trackRow(i)).join('')}</div>` : ''}
          ${!playlists.length && !matched.length ? '<div class="sp-empty">검색 결과가 없습니다.</div>' : ''}`;
      }
      function renderSearch() {
        return `<div class="sp-search-head"><h2>검색</h2><input id="spSearch" placeholder="어떤 걸 듣고 싶으세요?" value="${attr(query)}" aria-label="검색"></div><div id="spSearchResults">${renderSearchResults()}</div>`;
      }
      function renderLibrary() {
        return `<div class="sp-lib-head"><h2>내 라이브러리</h2><button class="sp-round" data-sp-open="create-playlist" aria-label="플레이리스트 만들기">${spIcon('plus')}</button></div>
          <div class="sp-chips"><button class="active">플레이리스트</button><button>앨범</button><button>아티스트</button></div>
          <div class="sp-lib-list">
            <button class="sp-lib-row" data-sp-liked><span class="sp-liked-cover">♥</span><span><b>좋아요한 곡</b><span>${data.liked.length}곡</span></span></button>
            ${data.playlists.map((pl) => `<button class="sp-lib-row" data-sp-playlist="${pl.id}">${cover(pl.cover, 'sm', '', ['#333', '#111'])}<span><b>${esc(pl.name)}</b><span>플레이리스트 · ${pl.trackIds.length}곡</span></span></button>`).join('')}
          </div>`;
      }
      function playlist() {
        if (playlistId === 'liked') return { id: 'liked', name: '좋아요한 곡', description: '내가 좋아하는 모든 곡', cover: '', trackIds: data.liked };
        return data.playlists.find((p) => p.id === playlistId);
      }
      function renderPlaylist() {
        const pl = playlist();
        if (!pl) { playlistId = null; return renderHome(); }
        const liked = playlistId === 'liked';
        return `<div class="sp-pl-head">
          <button class="sp-back" data-sp-back aria-label="뒤로">${spIcon('back')}</button>
          <div class="sp-pl-hero">${liked ? `<span class="sp-pl-cover liked">♥</span>` : cover(pl.cover, 'pl', '', ['#3a3a3a', '#111'])}</div>
          <span class="sp-pl-type">${liked ? '모음' : '플레이리스트'}</span>
          <h2>${esc(pl.name)}</h2>
          <p>${esc(pl.description)}</p>
          <span class="sp-pl-meta">${pl.trackIds.length}곡 · ${liked ? '나' : 'Alex Morgan'}</span>
        </div>
        <div class="sp-pl-actions">
          <button class="sp-play-pl" data-sp-play-playlist="${pl.id}">${spIcon('play')}</button>
          ${liked ? '' : `<button class="sp-outline" data-sp-edit-playlist="${pl.id}">편집</button><button class="sp-outline" data-sp-add-track="${pl.id}">＋ 곡 추가</button>`}
        </div>
        <div class="sp-track-list">${pl.trackIds.map((i, n) => trackRow(i, n, { playlist: !liked, liked })).join('')}</div>`;
      }
      function renderContent() {
        const el = $('#spContent', view);
        if (playlistId) { el.innerHTML = renderPlaylist(); return; }
        if (tab === 'home') el.innerHTML = renderHome();
        else if (tab === 'search') el.innerHTML = renderSearch();
        else el.innerHTML = renderLibrary();
      }
      function renderTabs() {
        $('#spTabs', view).innerHTML = `
          <button class="sp-tab ${tab === 'home' ? 'active' : ''}" data-sp-tab="home">${spIcon('home')}<span>홈</span></button>
          <button class="sp-tab ${tab === 'search' ? 'active' : ''}" data-sp-tab="search">${spIcon('search')}<span>검색</span></button>
          <button class="sp-tab ${tab === 'library' ? 'active' : ''}" data-sp-tab="library">${spIcon('library')}<span>내 라이브러리</span></button>`;
      }
      let miniKey = '';
      function renderMini() {
        const s = music.state(), t = s.track;
        const key = `${s.index}:${s.playing}`;
        if (key === miniKey) return;
        miniKey = key;
        $('#spMini', view).innerHTML = `<div class="sp-mini-bar" data-sp-open-player>
          ${cover(SP_COVERS[s.index], 'mini', t.glyph, t.colors)}
          <span class="sp-mini-meta"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></span>
          <button class="sp-mini-play" data-sp-play aria-label="${s.playing ? '일시정지' : '재생'}">${spIcon(s.playing ? 'pause' : 'play')}</button>
        </div>`;
      }
      function renderPlayer() {
        if (!fullPlayer) { $('#spPlayer', view).innerHTML = ''; return; }
        const s = music.state(), t = s.track;
        const liked = data.liked.includes(s.index);
        $('#spPlayer', view).innerHTML = `<div class="sp-player-overlay" id="spPlayerOverlay" style="background:linear-gradient(180deg,${t.colors[0]},#121212 72%)">
          <div class="sp-player-top"><button data-sp-close-player aria-label="닫기">${spIcon('chevron')}</button><span>지금 재생 중</span><button data-sp-more-player aria-label="더보기">${spIcon('more')}</button></div>
          <div class="sp-player-cover" id="spPlayerCover" style="background:linear-gradient(150deg,${t.colors.join(',')})"><img src="${attr(SP_COVERS[s.index])}" alt="" onerror="this.remove()"><span>${t.glyph}</span></div>
          <div class="sp-player-meta"><h2 id="spPlayerTitle">${esc(t.title)}</h2><p id="spPlayerArtist">${esc(t.artist)}</p></div>
          <button class="sp-player-like ${liked ? 'liked' : ''}" data-sp-like aria-label="좋아요">${spIcon(liked ? 'heartFill' : 'heart')}</button>
          <div class="sp-progress" id="spProgress"><div class="fill" id="spFill"></div><div class="knob" id="spKnob"></div></div>
          <div class="sp-times"><span id="spElapsed">${fmt(s.elapsed)}</span><span id="spRemain">-${fmt(t.dur - s.elapsed)}</span></div>
          <div class="sp-controls">
            <button class="${data.shuffle ? 'on' : ''}" data-sp-shuffle aria-label="셔플">${spIcon('shuffle')}</button>
            <button data-sp-prev aria-label="이전">${spIcon('prev')}</button>
            <button class="sp-play-big" data-sp-play aria-label="${s.playing ? '일시정지' : '재생'}">${spIcon(s.playing ? 'pause' : 'play')}</button>
            <button data-sp-next aria-label="다음">${spIcon('next')}</button>
            <button class="${data.repeat ? 'on' : ''}" data-sp-repeat aria-label="반복">${spIcon('repeat')}</button>
          </div>
          <div class="sp-device">iPhone 18 Pro</div>
        </div>`;
      }
      let playerKey = '';
      function paintPlayer() {
        if (!fullPlayer) return;
        const s = music.state(), t = s.track;
        const overlay = $('#spPlayerOverlay', view); if (overlay) overlay.style.background = `linear-gradient(180deg,${t.colors[0]},#121212 72%)`;
        if (playerKey !== String(s.index)) {
          playerKey = String(s.index);
          const coverEl = $('#spPlayerCover', view); if (coverEl) { coverEl.style.background = `linear-gradient(150deg,${t.colors.join(',')})`; coverEl.innerHTML = `<img src="${attr(SP_COVERS[s.index])}" alt="" onerror="this.remove()"><span>${t.glyph}</span>`; }
          const title = $('#spPlayerTitle', view); if (title) title.textContent = t.title;
          const artist = $('#spPlayerArtist', view); if (artist) artist.textContent = t.artist;
        }
        const play = $('#spPlayer [data-sp-play]', view); if (play) play.innerHTML = spIcon(s.playing ? 'pause' : 'play');
        const fill = $('#spFill', view); if (fill) fill.style.width = `${(s.elapsed / t.dur) * 100}%`;
        const knob = $('#spKnob', view); if (knob) knob.style.left = `${(s.elapsed / t.dur) * 100}%`;
        const elapsed = $('#spElapsed', view); if (elapsed) elapsed.textContent = fmt(s.elapsed);
        const remain = $('#spRemain', view); if (remain) remain.textContent = `-${fmt(t.dur - s.elapsed)}`;
        const like = $('#spPlayer [data-sp-like]', view); if (like) { const liked = data.liked.includes(s.index); like.classList.toggle('liked', liked); like.innerHTML = spIcon(liked ? 'heartFill' : 'heart'); }
        const shuffle = $('#spPlayer [data-sp-shuffle]', view); if (shuffle) shuffle.classList.toggle('on', !!data.shuffle);
        const repeat = $('#spPlayer [data-sp-repeat]', view); if (repeat) repeat.classList.toggle('on', !!data.repeat);
        $$('.sp-track-row', view).forEach((el) => el.classList.toggle('playing', +el.dataset.spTrack === s.index));
      }
      function renderModal() {
        const el = $('#spModal', view);
        if (!modal) { el.innerHTML = ''; return; }
        if (modal.type === 'playlist') {
          const pl = modal.id ? data.playlists.find((p) => p.id === modal.id) : { name: '', description: '', cover: '', trackIds: [] };
          if (!pl) { modal = null; el.innerHTML = ''; return; }
          el.innerHTML = `<div class="sp-sheet-wrap"><div class="sp-sheet">
            <div class="sp-sheet-head"><span></span><b>${modal.id ? '플레이리스트 편집' : '플레이리스트 만들기'}</b><button data-sp-modal-close aria-label="닫기">${spIcon('close')}</button></div>
            <div class="sp-form">
              <label>이름<input id="spPlName" value="${attr(pl.name)}" placeholder="플레이리스트 이름"></label>
              <label>설명<input id="spPlDesc" value="${attr(pl.description)}" placeholder="설명 추가"></label>
              <label>커버 이미지 링크<input id="spPlCover" value="${attr(pl.cover)}" placeholder="https://..."></label>
              <button class="sp-primary" data-sp-save-playlist="${modal.id || ''}">${modal.id ? '저장' : '만들기'}</button>
              ${modal.id ? `<button class="sp-danger" data-sp-delete-playlist="${modal.id}">플레이리스트 삭제</button>` : ''}
            </div>
          </div></div>`;
          return;
        }
        if (modal.type === 'tracks') {
          const pl = data.playlists.find((p) => p.id === modal.id);
          if (!pl) { modal = null; el.innerHTML = ''; return; }
          el.innerHTML = `<div class="sp-sheet-wrap"><div class="sp-sheet">
            <div class="sp-sheet-head"><span></span><b>곡 추가</b><button data-sp-modal-close aria-label="닫기">${spIcon('close')}</button></div>
            <div class="sp-add-list">${tracks().map((t, i) => `<button class="sp-add-row ${pl.trackIds.includes(i) ? 'added' : ''}" data-sp-toggle-track="${i}">${cover('', 'sm', t.glyph, t.colors)}<span><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></span><i>${pl.trackIds.includes(i) ? '✓' : '+'}</i></button>`).join('')}</div>
          </div></div>`;
          return;
        }
        el.innerHTML = '';
      }
      function renderAll() {
        const scroller = $('#spContent', view);
        const scrollTop = scroller ? scroller.scrollTop : 0;
        renderContent(); renderTabs(); renderMini(); renderPlayer(); renderModal();
        const nextScroller = $('#spContent', view);
        if (nextScroller) nextScroller.scrollTop = scrollTop;
      }
      function openPlaylist(id) { playlistId = id; fullPlayer = false; modal = null; const sc = $('#spContent', view); if (sc) sc.scrollTop = 0; renderAll(); }
      function toggleLiked(i) {
        const at = data.liked.indexOf(i);
        if (at >= 0) data.liked.splice(at, 1); else data.liked.unshift(i);
        save(); renderAll();
      }
      function playPlaylist(id) {
        const pl = id === 'liked' ? { trackIds: data.liked } : data.playlists.find((p) => p.id === id);
        if (pl && pl.trackIds.length) { music.select(pl.trackIds[0], true); ctx.toast('재생을 시작합니다.', '▶'); }
        else ctx.toast('재생할 곡이 없습니다.', '♪');
      }

      const unsub = music.onChange(() => { renderMini(); paintPlayer(); $$('.sp-track-row', view).forEach((el) => el.classList.toggle('playing', +el.dataset.spTrack === music.state().index)); });
      clean.add(unsub);

      view.addEventListener('click', (e) => {
        if (e.target.closest('[data-sp-play]')) { music.toggle(); return; }
        if (e.target.closest('[data-sp-next]')) { music.next(); return; }
        if (e.target.closest('[data-sp-prev]')) { music.prev(); return; }
        if (e.target.closest('[data-sp-open-player]')) { fullPlayer = true; renderPlayer(); return; }
        if (e.target.closest('[data-sp-close-player]')) { fullPlayer = false; renderPlayer(); return; }
        if (e.target.closest('[data-sp-more-player]')) { ctx.toast('곡이 라이브러리에 추가되었습니다.', '＋'); return; }
        const tabBtn = e.target.closest('[data-sp-tab]');
        if (tabBtn) { tab = tabBtn.dataset.spTab; playlistId = null; modal = null; const sc = $('#spContent', view); if (sc) sc.scrollTop = 0; renderAll(); return; }
        const back = e.target.closest('[data-sp-back]');
        if (back) { playlistId = null; const sc = $('#spContent', view); if (sc) sc.scrollTop = 0; renderAll(); return; }
        const playlistBtn = e.target.closest('[data-sp-playlist]');
        if (playlistBtn) { openPlaylist(playlistBtn.dataset.spPlaylist); return; }
        if (e.target.closest('[data-sp-liked]')) { openPlaylist('liked'); return; }
        const remove = e.target.closest('[data-sp-remove-track]');
        if (remove) {
          e.stopPropagation();
          const pl = data.playlists.find((p) => p.id === playlistId);
          if (pl) { pl.trackIds = pl.trackIds.filter((i) => i !== +remove.dataset.spRemoveTrack); save(); renderAll(); ctx.toast('곡을 제거했습니다.', '−'); }
          return;
        }
        const unlike = e.target.closest('[data-sp-unlike]');
        if (unlike) { e.stopPropagation(); toggleLiked(+unlike.dataset.spUnlike); return; }
        const track = e.target.closest('[data-sp-track]');
        if (track) { music.select(+track.dataset.spTrack, true); return; }
        const like = e.target.closest('[data-sp-like]');
        if (like) { toggleLiked(music.state().index); return; }
        if (e.target.closest('[data-sp-shuffle]')) { data.shuffle = !data.shuffle; save(); music.setShuffle(data.shuffle); return; }
        if (e.target.closest('[data-sp-repeat]')) { data.repeat = !data.repeat; save(); music.setRepeat(data.repeat); return; }
        const open = e.target.closest('[data-sp-open]');
        if (open) { if (open.dataset.spOpen === 'create-playlist') { modal = { type: 'playlist', id: '' }; renderAll(); } return; }
        const edit = e.target.closest('[data-sp-edit-playlist]');
        if (edit) { modal = { type: 'playlist', id: edit.dataset.spEditPlaylist }; renderAll(); return; }
        const addTrack = e.target.closest('[data-sp-add-track]');
        if (addTrack) { modal = { type: 'tracks', id: addTrack.dataset.spAddTrack }; renderAll(); return; }
        const playPl = e.target.closest('[data-sp-play-playlist]');
        if (playPl) { playPlaylist(playPl.dataset.spPlayPlaylist); return; }
        const close = e.target.closest('[data-sp-modal-close]');
        if (close) { modal = null; renderAll(); return; }
        const savePl = e.target.closest('[data-sp-save-playlist]');
        if (savePl) {
          const name = ($('#spPlName', view) || {}).value || '새 플레이리스트';
          const description = ($('#spPlDesc', view) || {}).value || '';
          const coverUrl = ($('#spPlCover', view) || {}).value || '';
          if (savePl.dataset.spSavePlaylist) {
            const pl = data.playlists.find((p) => p.id === savePl.dataset.spSavePlaylist);
            if (pl) { pl.name = name; pl.description = description; pl.cover = coverUrl; }
          } else {
            data.playlists.push({ id: `sp-${Date.now()}`, name, description, cover: coverUrl, trackIds: [] });
          }
          save(); modal = null; renderAll(); ctx.toast('플레이리스트가 저장되었습니다.', '✓'); return;
        }
        const delPl = e.target.closest('[data-sp-delete-playlist]');
        if (delPl) { data.playlists = data.playlists.filter((p) => p.id !== delPl.dataset.spDeletePlaylist); save(); modal = null; playlistId = null; renderAll(); ctx.toast('플레이리스트가 삭제되었습니다.', '🗑'); return; }
        const toggleTrack = e.target.closest('[data-sp-toggle-track]');
        if (toggleTrack) {
          const pl = data.playlists.find((p) => p.id === modal.id);
          if (pl) { const i = +toggleTrack.dataset.spToggleTrack; const at = pl.trackIds.indexOf(i); if (at >= 0) pl.trackIds.splice(at, 1); else pl.trackIds.push(i); save(); renderAll(); }
          return;
        }
        const cat = e.target.closest('[data-sp-cat]');
        if (cat) { query = cat.dataset.spCat; const input = $('#spSearch', view); if (input) input.value = query; const box = $('#spSearchResults', view); if (box) box.innerHTML = renderSearchResults(); return; }
      });

      view.addEventListener('input', (e) => {
        if (e.target.id === 'spSearch') {
          query = e.target.value;
          const box = $('#spSearchResults', view);
          if (box) box.innerHTML = renderSearchResults();
        }
      });

      view.addEventListener('pointerdown', (e) => {
        const bar = e.target.closest('#spProgress');
        if (!bar) return;
        const r = bar.getBoundingClientRect();
        const move = (ev) => music.seek((ev.clientX - r.left) / r.width);
        move(e);
      });

      renderAll();
      return () => clean.run();
    }
  };

  window.Apps = Apps;
})();
