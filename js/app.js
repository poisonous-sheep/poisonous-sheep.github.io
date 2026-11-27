/**
 * 小羊的小小窝 — 主应用脚本（有毒的羊 · 盛夏终电十四幕美术馆版）
 * 功能：双模式三连电车车窗与鼠标视差、首页 35mm 十四幕画廊胶片长卷、
 *       14 幕光影美术馆（4 幕时刻筛选 + 自适应画幅展墙/胶片长廊 + 主色氛围联动）、
 *       暗房策展灯箱 2.0、6 张实体唱片 3×2 展柜、打孔车票、友链明信片、
 *       KaTeX 公式与 C++ 高亮、Ctrl+K 全站速查、BGM 封面进度环与吉他泛音。
 */
(function () {
  const cfg = window.BLOG_CONFIG || {};
  const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];
  const fragments = Array.isArray(window.BLOG_FRAGMENTS) ? window.BLOG_FRAGMENTS : [];
  const albums = Array.isArray(cfg.albums) ? cfg.albums : [];
  const gallery = Array.isArray(cfg.gallery) ? cfg.gallery : [];
  const exhibition = Array.isArray(cfg.exhibition) ? cfg.exhibition : [];
  const exhibitionActs = cfg.exhibitionActs || {};
  const whispers = Array.isArray(cfg.whispers) ? cfg.whispers : [];
  const heroWindows = Array.isArray(cfg.heroWindows) ? cfg.heroWindows : [];
  const heroWindowModes = cfg.heroWindowModes || null;
  const friendLinks = Array.isArray(cfg.friendLinks) ? cfg.friendLinks : [];

  const appEl = document.getElementById("app");
  const ambientWashEl = document.getElementById("ambient-wash");
  const progressEl = document.getElementById("reading-progress");
  const bgmRingEl = document.getElementById("bgm-scroll-ring");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeLabelEl = document.getElementById("theme-label");
  const backToTopBtn = document.getElementById("back-to-top");
  const albumModalEl = document.getElementById("album-modal");
  const lightboxModalEl = document.getElementById("lightbox-modal");
  const searchModalEl = document.getElementById("search-modal");
  const searchTriggerBtn = document.getElementById("search-trigger");
  const toastEl = document.getElementById("toast");

  let activeCategory = "全部";
  let activeFragmentTag = "全部";
  let activeHeroWindowMode = "official";
  let activeGalleryFilter = "all";
  let activeGalleryView = "wall";
  let currentWhisperIdx = 0;
  let currentLightboxIdx = 0;
  let currentLightboxKind = "exhibition";
  let currentLightboxList = exhibition;
  let currentTrackIndex = 0;
  let bgmTrackList = [];
  let bgmRenderFn = null;
  let audioEl = null;
  let ambientCtx = null;
  let ambientTimer = null;
  let isAmbientPlaying = false;
  let toastTimer = null;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  function setAmbientWash(auraColor) {
    if (!ambientWashEl) return;
    if (!auraColor) {
      ambientWashEl.classList.remove("is-active");
      return;
    }
    ambientWashEl.style.setProperty("--ambient-wash", auraColor);
    ambientWashEl.classList.add("is-active");
  }

  function renderMathIfReady(container) {
    if (!container) return;
    if (typeof window.renderMathInElement === "function") {
      try {
        window.renderMathInElement(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      } catch (_) {}
    } else {
      setTimeout(function () {
        if (typeof window.renderMathInElement === "function") {
          try {
            window.renderMathInElement(container, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
              ],
              throwOnError: false
            });
          } catch (_) {}
        }
      }, 600);
    }
  }

  /* ------------------------------------------------------------------------
     1. 双模式切换（盛夏白昼 <-> 终电花火夜）
     ------------------------------------------------------------------------ */
  function applyTheme(theme) {
    const target = theme === "night" ? "night" : "day";
    document.documentElement.setAttribute("data-theme", target);
    if (themeLabelEl) {
      themeLabelEl.textContent = target === "night" ? "终电夜" : "盛夏";
    }
    try {
      localStorage.setItem("xiaoyang-blog-theme", target);
    } catch (_) {}
  }

  function initTheme() {
    let saved = "day";
    try {
      saved = localStorage.getItem("xiaoyang-blog-theme") || "day";
    } catch (_) {}
    applyTheme(saved);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", function (e) {
        const current = document.documentElement.getAttribute("data-theme");
        const nextTheme = current === "night" ? "day" : "night";
        const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!document.startViewTransition || reduced) {
          applyTheme(nextTheme);
          return;
        }

        const rect = themeToggleBtn.getBoundingClientRect();
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);
        const maxR = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );
        document.documentElement.style.setProperty("--vt-x", x + "px");
        document.documentElement.style.setProperty("--vt-y", y + "px");
        document.documentElement.style.setProperty("--vt-r", Math.ceil(maxR) + "px");
        document.documentElement.classList.add("theme-wiping");

        const transition = document.startViewTransition(function () {
          applyTheme(nextTheme);
        });
        transition.finished.finally(function () {
          document.documentElement.classList.remove("theme-wiping");
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. 实体 CD 封套 & 双模式三连电车车窗组件
     ------------------------------------------------------------------------ */
  function renderCdStageHtml(album) {
    return (
      '<div class="cd-stage">' +
        '<div class="cd-disc" aria-hidden="true"></div>' +
        '<div class="cd-sleeve">' +
          '<img src="' + escapeHtml(album.coverImage) + '" alt="' + escapeHtml(album.title) + '" loading="lazy">' +
          '<span class="cd-jewel-tray" aria-hidden="true"></span>' +
          '<span class="cd-sheen" aria-hidden="true"></span>' +
          '<div class="cd-obi" aria-hidden="true">' +
            "<span>" + escapeHtml(album.mood || "") + "</span>" +
            '<span class="cd-obi-cat">' + escapeHtml(album.catalog || "") + "</span>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function getActiveWindowModeSpec() {
    if (heroWindowModes && heroWindowModes[activeHeroWindowMode]) {
      return heroWindowModes[activeHeroWindowMode];
    }
    return {
      id: "official",
      badge: "n-buna 2014–2016",
      hint: "悬停放大 · 点击翻开歌词本",
      items: heroWindows.map(function (w) {
        return {
          actionType: "album",
          targetId: w.albumId,
          no: w.no,
          year: w.year,
          title: w.title,
          label: w.label,
          image: w.image,
          featured: w.featured
        };
      })
    };
  }

  function renderWindowPanesHtml(spec) {
    return (spec.items || []).map(function (win) {
      const cls = win.featured ? "train-pane is-featured" : "train-pane";
      const isEx = win.actionType === "exhibition";
      const actionAttr = isEx
        ? 'data-exhibition-open="' + escapeHtml(win.targetId) + '"'
        : 'data-album-open="' + escapeHtml(win.targetId) + '"';
      const cursorAttr = isEx ? 'data-cursor="VIEW"' : 'data-cursor="OPEN"';
      const aria = isEx
        ? "在暗房灯箱浏览 " + win.title
        : "翻开 " + win.title + " 歌词本";
      return (
        '<button type="button" class="' + cls + '" ' + actionAttr + " " + cursorAttr + ' aria-label="' + escapeHtml(aria) + '">' +
          '<div class="train-pane-glass">' +
            '<img src="' + escapeHtml(win.image) + '" alt="' + escapeHtml(win.title) + '">' +
            '<span class="pane-glint" aria-hidden="true"></span>' +
            '<span class="pane-rails" aria-hidden="true"></span>' +
            '<div class="pane-overlay">' +
              '<span class="pane-year">' + escapeHtml(win.no + " · " + win.year) + "</span>" +
              '<span class="pane-title">' + escapeHtml(win.label) + "</span>" +
            "</div>" +
          "</div>" +
        "</button>"
      );
    }).join("");
  }

  function renderTripleWindowsHtml() {
    const spec = getActiveWindowModeSpec();
    const officialCls = activeHeroWindowMode === "official" ? "window-mode-btn active" : "window-mode-btn";
    const exCls = activeHeroWindowMode === "exhibition" ? "window-mode-btn active" : "window-mode-btn";

    return (
      '<div class="triple-window-wall hero-stagger-2" id="triple-window-wall">' +
        '<div class="triple-window-top">' +
          '<div class="window-mode-tabs" role="tablist" aria-label="车窗画册模式切换">' +
            '<button type="button" class="' + officialCls + '" data-window-mode="official">官方封面</button>' +
            '<button type="button" class="' + exCls + '" data-window-mode="exhibition">十四幕精选</button>' +
          "</div>" +
          '<span class="triple-window-top-right" id="window-mode-badge">' + escapeHtml(spec.badge || "") + "</span>" +
        "</div>" +
        '<div class="triple-windows-row" id="triple-windows-row">' + renderWindowPanesHtml(spec) + "</div>" +
        '<div class="triple-window-foot">' +
          '<span class="triple-motto-inline">' +
            '<span class="motto-seal" aria-hidden="true">' + escapeHtml(cfg.sealText || "羊") + "</span>" +
            "<span>" + escapeHtml(cfg.verticalMotto || "") + "</span>" +
          "</span>" +
          '<span class="triple-hint" id="window-mode-hint">' + escapeHtml(spec.hint || "") + "</span>" +
        "</div>" +
      "</div>"
    );
  }

  function bindTripleWindowInteractions() {
    const wall = document.getElementById("triple-window-wall");
    const row = document.getElementById("triple-windows-row");
    if (!wall || !row) return;

    function wirePaneClicks() {
      row.querySelectorAll("[data-album-open]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          openAlbumModal(btn.getAttribute("data-album-open"));
        });
      });
      row.querySelectorAll("[data-exhibition-open]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          openExhibitionLightboxById(btn.getAttribute("data-exhibition-open"));
        });
      });
    }

    wirePaneClicks();

    wall.querySelectorAll("[data-window-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const nextMode = btn.getAttribute("data-window-mode");
        if (!nextMode || nextMode === activeHeroWindowMode) return;
        activeHeroWindowMode = nextMode;
        wall.querySelectorAll("[data-window-mode]").forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-window-mode") === activeHeroWindowMode);
        });
        const spec = getActiveWindowModeSpec();
        const badgeEl = document.getElementById("window-mode-badge");
        const hintEl = document.getElementById("window-mode-hint");
        row.classList.add("is-swapping");
        setTimeout(function () {
          row.innerHTML = renderWindowPanesHtml(spec);
          if (badgeEl) badgeEl.textContent = spec.badge || "";
          if (hintEl) hintEl.textContent = spec.hint || "";
          row.classList.remove("is-swapping");
          wirePaneClicks();
        }, 160);
      });
    });

    const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (finePointer && !reduced) {
      wall.addEventListener("mousemove", function (e) {
        const rect = wall.getBoundingClientRect();
        const dx = ((e.clientX - rect.left) / rect.width - 0.5) * -10;
        const dy = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        wall.style.setProperty("--px", dx.toFixed(1) + "px");
        wall.style.setProperty("--py", dy.toFixed(1) + "px");
      }, { passive: true });
      wall.addEventListener("mouseleave", function () {
        wall.style.setProperty("--px", "0px");
        wall.style.setProperty("--py", "0px");
      });
    }
  }

  function syncPlayingAlbumCards() {
    const active = bgmTrackList[currentTrackIndex];
    const activeAlbumId = active ? active.albumId : "";
    document.querySelectorAll("[data-album-open]").forEach(function (el) {
      if (el.classList.contains("album-card")) {
        el.classList.toggle("is-now-playing", el.getAttribute("data-album-open") === activeAlbumId);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. 35mm 十四幕画廊胶片长卷组件
     ------------------------------------------------------------------------ */
  function renderFilmFrameHtml(item, idx, listKind) {
    const aspectCls = item.aspect ? " is-" + item.aspect : "";
    const metaRight = item.timeStamp || item.meta || "";
    const artistOrFilm = item.artist ? "画师：" + item.artist : (item.film || "");
    const openAttr = listKind === "official"
      ? 'data-official-idx="' + idx + '"'
      : 'data-ex-idx="' + idx + '"';
    return (
      '<button type="button" class="film-frame' + aspectCls + ' reveal" ' + openAttr +
        ' data-aura="' + escapeHtml(item.aura || "") + '" data-cursor="VIEW">' +
        '<div class="film-frame-media">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="film-frame-tag">' + escapeHtml(item.plateNo || item.no || "") + "</span>" +
        "</div>" +
        '<div class="film-frame-body">' +
          '<div class="film-frame-meta">' +
            "<span>" + escapeHtml(metaRight) + "</span>" +
            "<span>" + escapeHtml(item.sourceBadge || item.film || "") + "</span>" +
          "</div>" +
          '<h3 class="film-frame-title">' + escapeHtml(item.title) + "</h3>" +
          '<span class="film-frame-artist">' + escapeHtml(artistOrFilm) + "</span>" +
        "</div>" +
      "</button>"
    );
  }

  function bindFilmstripControls(trackId, prevId, nextId, itemsList, listKind) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    if (!track) return;
    const targetList = Array.isArray(itemsList) ? itemsList : exhibition;
    const targetKind = listKind || "exhibition";

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        track.scrollBy({ left: -Math.round(track.clientWidth * 0.72), behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        track.scrollBy({ left: Math.round(track.clientWidth * 0.72), behavior: "smooth" });
      });
    }

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let dragMoved = false;

    track.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isDown = true;
      dragMoved = false;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 6) dragMoved = true;
      track.scrollLeft = startScroll - dx;
    });

    window.addEventListener("mouseup", function () {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
      setTimeout(function () { dragMoved = false; }, 40);
    });

    track.querySelectorAll(".film-frame").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        const aura = card.getAttribute("data-aura");
        if (aura) setAmbientWash(aura);
      });
      card.addEventListener("click", function (e) {
        if (dragMoved) {
          e.preventDefault();
          return;
        }
        const rawIdx = card.hasAttribute("data-ex-idx")
          ? card.getAttribute("data-ex-idx")
          : card.getAttribute("data-official-idx");
        openLightboxFromList(targetList, Number(rawIdx || 0), targetKind);
      });
    });

    track.addEventListener("mouseleave", function () {
      setAmbientWash("");
    });
  }

  /* ------------------------------------------------------------------------
     4. 首页渲染
     ------------------------------------------------------------------------ */
  function renderHome() {
    setAmbientWash("");
    const categories = ["全部"].concat(Array.from(new Set(posts.map(function (p) { return p.category; }))));
    const filtered = activeCategory === "全部"
      ? posts
      : posts.filter(function (p) { return p.category === activeCategory; });

    const featured = posts.find(function (p) { return p.featured; }) || posts[0];
    const featuredStats = featured && window.estimateReadingStats
      ? window.estimateReadingStats(featured.fallbackContent)
      : { minutes: 2, chars: 500 };
    const activeTrack = bgmTrackList[currentTrackIndex];
    const activeAlbumId = activeTrack ? activeTrack.albumId : "";

    const filmstripHtml = exhibition.map(function (item, idx) {
      return renderFilmFrameHtml(item, idx, "exhibition");
    }).join("");

    const albumsHtml = albums.map(function (album) {
      const swatches = (album.palette || []).map(function (hex) {
        return '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '"></span>';
      }).join("");
      const playingCls = album.id === activeAlbumId ? " is-now-playing" : "";
      return (
        '<button type="button" class="album-card reveal' + playingCls + '" data-album-open="' + escapeHtml(album.id) + '" data-aura="' + escapeHtml(album.aura || "") + '" data-cursor="OPEN">' +
          renderCdStageHtml(album) +
          '<div class="album-card-meta">' +
            '<div class="album-card-top">' +
              "<span>" + escapeHtml(album.artist) + "</span>" +
              "<span>" + escapeHtml(album.year.slice(0, 4)) + "</span>" +
            "</div>" +
            '<h3 class="album-card-title">' + escapeHtml(album.title) + "</h3>" +
            '<span class="album-card-zh">' + escapeHtml(album.titleZh) + "</span>" +
            '<div class="album-card-bottom">' +
              '<div class="album-swatches" aria-hidden="true">' + swatches + "</div>" +
              '<span class="album-mood-mini">' + escapeHtml(album.mood) + "</span>" +
            "</div>" +
          "</div>" +
        "</button>"
      );
    }).join("");

    const listHtml = filtered.map(function (post) {
      const stats = window.estimateReadingStats ? window.estimateReadingStats(post.fallbackContent) : { minutes: 2 };
      return (
        '<li class="timetable-item reveal">' +
          '<a href="#/post/' + encodeURIComponent(post.id) + '" class="timetable-link" data-cursor="READ">' +
            '<div class="timetable-thumb">' +
              '<img src="' + escapeHtml(post.cover || "images/hero-summer-station.svg") + '" alt="" loading="lazy">' +
            "</div>" +
            '<div class="timetable-meta">' +
              '<span class="timetable-no">No. ' + escapeHtml(post.no) + "</span>" +
              '<span class="timetable-date">' + escapeHtml(post.date) + " · " + escapeHtml(post.weather) + "</span>" +
            "</div>" +
            '<div class="timetable-main">' +
              '<h3 class="timetable-title">' + escapeHtml(post.title) + "</h3>" +
              '<p class="timetable-excerpt">' + escapeHtml(post.excerpt) + "</p>" +
            "</div>" +
            '<div class="timetable-right">' +
              '<span class="timetable-category">' + escapeHtml(post.category) + "</span>" +
              '<span class="timetable-readtime">约 ' + stats.minutes + " min</span>" +
            "</div>" +
          "</a>" +
        "</li>"
      );
    }).join("");

    const recentFragments = fragments.slice(0, 4).map(renderTicketCardHtml).join("");
    const currentWhisper = whispers[currentWhisperIdx] || { text: "", source: "", stamp: "盛夏" };

    appEl.innerHTML =
      '<section class="hero-section has-tategaki">' +
        '<aside class="hero-tategaki-rail" aria-hidden="true">' +
          '<span class="tategaki-text">' + escapeHtml(cfg.verticalMotto || "夏末晴空、终电与透明的梦。") + "</span>" +
          '<span class="tategaki-issue">XIV EXHIBITION</span>' +
        "</aside>" +
        '<div class="hero-copy hero-stagger">' +
          '<div class="hero-tag">' +
            '<span class="hero-tag-dot" aria-hidden="true"></span>' +
            "<span>" + escapeHtml(cfg.stationTag || "SUMMER LINE 01") + "</span>" +
          "</div>" +
          '<h1 class="hero-title"><span class="nbuna-underline">' + escapeHtml(cfg.siteName || "小羊的小小窝") + "</span></h1>" +
          '<p class="hero-en-caption">A Transparent Summer Archive by ' + escapeHtml(cfg.author || "有毒的羊") + "</p>" +
          '<p class="hero-subtitle">' + escapeHtml(cfg.subtitle || "") + "</p>" +
          '<div class="hero-ledger">' +
            '<div class="ledger-cell"><span class="ledger-num">0' + posts.length + '</span><span class="ledger-label">站台文章</span></div>' +
            '<div class="ledger-cell"><span class="ledger-num">0' + albums.length + '</span><span class="ledger-label">实体专辑</span></div>' +
            '<div class="ledger-cell"><span class="ledger-num">' + String(exhibition.length).padStart(2, "0") + '</span><span class="ledger-label">十四幕影集</span></div>' +
            '<div class="ledger-cell"><span class="ledger-num">0' + fragments.length + '</span><span class="ledger-label">打孔车票</span></div>' +
          "</div>" +
          '<div class="hero-actions">' +
            '<a href="#/gallery" class="btn-primary">走进十四幕光影美术馆 →</a>' +
            (featured
              ? '<a href="#/post/' + encodeURIComponent(featured.id) + '" class="btn-ghost">阅读最新算法笔记</a>'
              : "") +
          "</div>" +
        "</div>" +
        renderTripleWindowsHtml() +
      "</section>" +
      '<div class="stationery-slip hero-stagger-3">' +
        '<div class="stationery-left">' +
          '<div class="postage-stamp" aria-hidden="true"><span>夏末邮局</span><strong id="whisper-stamp">' + escapeHtml(currentWhisper.stamp || "晴") + "</strong></div>" +
          "<div>" +
            '<p class="whisper-text" id="whisper-text">' + escapeHtml(currentWhisper.text) + "</p>" +
            '<span class="whisper-source" id="whisper-source">— ' + escapeHtml(currentWhisper.source) + "</span>" +
          "</div>" +
        "</div>" +
        '<button type="button" class="whisper-next-btn" id="whisper-next">换一张信签 ↻</button>' +
      "</div>" +
      '<section class="filmstrip-section" aria-labelledby="exhibition-strip-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">01</span>' +
            '<h2 id="exhibition-strip-heading" class="section-title">十四幕 · 拿不拿夏末画廊长卷</h2>' +
            '<span class="section-en">XIV Plates · 35mm Filmstrip</span>' +
          "</div>" +
          '<a href="#/gallery" class="section-sub">打开全部 ' + exhibition.length + " 幕美术馆 →</a>" +
        "</div>" +
        '<div class="filmstrip-shell">' +
          '<button type="button" class="filmstrip-nav-btn prev" id="home-strip-prev" aria-label="向左滚动胶片">‹</button>' +
          '<button type="button" class="filmstrip-nav-btn next" id="home-strip-next" aria-label="向右滚动胶片">›</button>' +
          '<div class="filmstrip-track" id="home-filmstrip-track">' + filmstripHtml + "</div>" +
          '<div class="filmstrip-controls-foot">' +
            "<span>ACT I 朝露昼青 → ACT II 无人站日暮 → ACT III 透明终电 → ACT IV 黎明萤火</span>" +
            "<span>左右拖拽或滚轮浏览 · 点击进入暗房灯箱</span>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<section id="album-shelf-section" class="album-shelf-section" aria-labelledby="albums-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">02</span>' +
            '<h2 id="albums-heading" class="section-title">拿不拿的灵感唱片架</h2>' +
            '<span class="section-en">Official Discography · 2014–2019</span>' +
          "</div>" +
          '<a href="#/discography" class="section-sub">打开全部 ' + albums.length + " 张画册 →</a>" +
        "</div>" +
        '<div class="album-shelf-grid">' + albumsHtml + "</div>" +
      "</section>" +
      '<section aria-labelledby="posts-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">03</span>' +
            '<h2 id="posts-heading" class="section-title">站台时刻表 · 我的博客文章</h2>' +
            '<span class="section-en">Algorithm & Daily Notes</span>' +
          "</div>" +
          '<span class="section-sub">' + filtered.length + " 篇文章</span>" +
        "</div>" +
        (featured
          ? '<a href="#/post/' + encodeURIComponent(featured.id) + '" class="featured-post-card reveal" data-cursor="READ">' +
              '<div class="featured-cover"><img src="' + escapeHtml(featured.cover) + '" alt="' + escapeHtml(featured.title) + '"></div>' +
              "<div>" +
                '<div class="featured-badge">● LATEST POST · 最新更新</div>' +
                '<h3 class="featured-title">' + escapeHtml(featured.title) + "</h3>" +
                '<p class="featured-excerpt">' + escapeHtml(featured.excerpt) + "</p>" +
                '<div class="featured-foot">' +
                  "<span>" + escapeHtml(featured.date) + " · " + escapeHtml(featured.weather) + " · 约 " + featuredStats.minutes + " 分钟</span>" +
                  '<span class="featured-cta">阅读全文 →</span>' +
                "</div>" +
              "</div>" +
            "</a>"
          : "") +
        '<div class="filter-bar" role="tablist" aria-label="文章分类筛选">' +
          categories.map(function (cat) {
            const cls = cat === activeCategory ? "filter-pill active" : "filter-pill";
            return '<button type="button" class="' + cls + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + "</button>";
          }).join("") +
        "</div>" +
        '<ul class="timetable-list">' + listHtml + "</ul>" +
      "</section>" +
      '<section class="fragments-preview-section" aria-labelledby="frag-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">04</span>' +
            '<h2 id="frag-heading" class="section-title">车票背面 · 站台便签</h2>' +
            '<span class="section-en">Ticket Stubs</span>' +
          "</div>" +
          '<a href="#/fragments" class="section-sub">查看全部 ' + fragments.length + " 张 →</a>" +
        "</div>" +
        '<div class="fragments-grid">' + recentFragments + "</div>" +
      "</section>" +
      (friendLinks.length > 0
        ? '<section class="home-links-section" aria-labelledby="home-links-heading">' +
            '<div class="section-head">' +
              '<div class="section-title-group">' +
                '<span class="section-num-bg" aria-hidden="true">05</span>' +
                '<h2 id="home-links-heading" class="section-title">邻站友链 · 常用站点</h2>' +
                '<span class="section-en">Neighbor Stations</span>' +
              "</div>" +
              '<a href="#/links" class="section-sub">查看全部 & 交换友链 →</a>' +
            "</div>" +
            '<div class="home-links-strip">' +
              friendLinks.slice(0, 4).map(function (link) {
                return (
                  '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer" class="mini-friend-pill reveal" data-cursor="VISIT">' +
                    renderFriendAvatarHtml(link) +
                    '<span style="min-width:0">' +
                      '<span style="display:block;font-size:0.86rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(link.name) + "</span>" +
                      '<span style="display:block;font-family:var(--font-mono);font-size:0.66rem;color:var(--text-muted)">' + escapeHtml(link.tag || "友链") + "</span>" +
                    "</span>" +
                  "</a>"
                );
              }).join("") +
            "</div>" +
          "</section>"
        : "");

    const whisperBtn = document.getElementById("whisper-next");
    if (whisperBtn && whispers.length > 1) {
      whisperBtn.addEventListener("click", function () {
        currentWhisperIdx = (currentWhisperIdx + 1) % whispers.length;
        const w = whispers[currentWhisperIdx];
        const tEl = document.getElementById("whisper-text");
        const sEl = document.getElementById("whisper-source");
        const stEl = document.getElementById("whisper-stamp");
        if (tEl) {
          tEl.style.opacity = "0";
          setTimeout(function () {
            tEl.textContent = w.text;
            if (sEl) sEl.textContent = "— " + w.source;
            if (stEl) stEl.textContent = w.stamp || "盛夏";
            tEl.style.opacity = "1";
          }, 160);
        }
      });
    }

    bindTripleWindowInteractions();
    bindFilmstripControls("home-filmstrip-track", "home-strip-prev", "home-strip-next", exhibition, "exhibition");

    const shelfEl = document.getElementById("album-shelf-section");
    appEl.querySelectorAll(".album-card[data-album-open]").forEach(function (card) {
      card.addEventListener("click", function () {
        openAlbumModal(card.getAttribute("data-album-open"));
      });
      const aura = card.getAttribute("data-aura");
      if (shelfEl && aura) {
        card.addEventListener("mouseenter", function () {
          shelfEl.style.setProperty("--shelf-aura", aura);
        });
      }
    });

    appEl.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.getAttribute("data-cat") || "全部";
        renderHome();
      });
    });

    bindCdTiltEffects();
    observeReveals();
  }

  function renderTicketCardHtml(item) {
    return (
      '<article class="ticket-card reveal">' +
        '<div class="ticket-head">' +
          '<span class="ticket-route">' + escapeHtml(item.route || "盛夏 → 晴空") + "</span>" +
          '<span class="ticket-sky">' + escapeHtml(item.sky) + "</span>" +
        "</div>" +
        '<p class="ticket-text">' + escapeHtml(item.text) + "</p>" +
        '<div class="ticket-foot">' +
          "<span>" + escapeHtml(item.serial || "TK-0001") + " · " + escapeHtml(item.tag || "随记") + "</span>" +
          "<span>" + escapeHtml(item.date + " " + item.time) + "</span>" +
        "</div>" +
      "</article>"
    );
  }

  /* ------------------------------------------------------------------------
     5. 唱片架 / 十四幕美术馆 / 友链 / 碎片 / 归档 / 关于 / 文章详情
     ------------------------------------------------------------------------ */
  function isCurrentBgmTrack(albumId, track) {
    const active = bgmTrackList[currentTrackIndex];
    return Boolean(active && active.albumId === albumId && active.title === track.title);
  }

  function selectTrackByAlbum(albumId, trackIdx) {
    const album = albums.find(function (a) { return a.id === albumId; });
    const track = album && album.tracks && album.tracks[trackIdx];
    if (!track) return;

    const flatIdx = bgmTrackList.findIndex(function (item) {
      return item.albumId === albumId && item.title === track.title;
    });
    if (flatIdx !== -1) {
      currentTrackIndex = flatIdx;
      if (bgmRenderFn) bgmRenderFn(Boolean(track.audioUrl));
      syncPlayingAlbumCards();
      showToast("已切换曲目：" + track.title);
    }

    document.querySelectorAll(".tracklist-row").forEach(function (row) {
      const same = row.getAttribute("data-album-id") === albumId &&
        Number(row.getAttribute("data-track-idx")) === trackIdx;
      row.classList.toggle("active", same);
    });
  }

  function selectTrackByTitle(albumId, title) {
    if (!title) return;
    const flatIdx = bgmTrackList.findIndex(function (item) {
      return (!albumId || item.albumId === albumId) && item.title === title;
    });
    const fallbackIdx = flatIdx !== -1 ? flatIdx : bgmTrackList.findIndex(function (item) {
      return item.title === title;
    });
    if (fallbackIdx === -1) return;
    currentTrackIndex = fallbackIdx;
    const active = bgmTrackList[currentTrackIndex];
    if (bgmRenderFn) bgmRenderFn(Boolean(active && active.audioUrl));
    syncPlayingAlbumCards();
    showToast("已联动曲目：" + title);
  }

  function renderDiscography() {
    setAmbientWash("");
    const timelineHtml = albums.map(function (a) {
      return '<button type="button" class="timeline-jump" data-jump-album="disc-' + escapeHtml(a.id) + '">' + escapeHtml(a.year.slice(0, 4)) + " · " + escapeHtml(a.titleZh) + "</button>";
    }).join("<span>→</span>");

    const spreads = albums.map(function (album) {
      const swatches = (album.palette || []).map(function (hex) {
        return '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '" title="' + escapeHtml(hex) + '"></span>';
      }).join("");
      const tracksHtml = (album.tracks || []).map(function (t, idx) {
        const activeCls = isCurrentBgmTrack(album.id, t) ? " active" : "";
        return (
          '<button type="button" class="tracklist-row' + activeCls + '" data-album-id="' + escapeHtml(album.id) + '" data-track-idx="' + idx + '">' +
            '<span class="track-no">' + escapeHtml(t.no) + "</span>" +
            '<span class="track-names">' +
              '<span class="track-jp">' + escapeHtml(t.title) + "</span>" +
              '<span class="track-zh">' + escapeHtml(t.titleZh) + "</span>" +
            "</span>" +
            '<span class="track-dur">' + escapeHtml(t.duration) + "</span>" +
          "</button>"
        );
      }).join("");

      return (
        '<article id="disc-' + escapeHtml(album.id) + '" class="disc-spread reveal">' +
          '<span class="disc-spread-no" aria-hidden="true">' + escapeHtml(album.no) + "</span>" +
          '<div class="disc-spread-visual">' +
            renderCdStageHtml(album) +
            '<div class="disc-edition-line">' +
              "<span>" + escapeHtml(album.edition) + "</span>" +
              "<span>" + escapeHtml(album.catalog) + "</span>" +
            "</div>" +
            '<div class="disc-palette-bar"><span>PALETTE</span>' + swatches + "</div>" +
          "</div>" +
          '<div class="disc-spread-body">' +
            '<div class="article-meta-row">' +
              '<span class="article-no">' + escapeHtml(album.artist) + "</span>" +
              "<span>" + escapeHtml(album.year) + "</span>" +
              '<span class="article-weather">' + escapeHtml(album.mood) + "</span>" +
            "</div>" +
            '<h2 class="disc-spread-title">' + escapeHtml(album.title) + "</h2>" +
            '<p class="disc-spread-subtitle">' + escapeHtml(album.titleZh) + "</p>" +
            '<p class="disc-spread-note">' + escapeHtml(album.note) + "</p>" +
            '<div class="tracklist">' + tracksHtml + "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">拿不拿的唱片架</h1>' +
        '<p class="page-desc">2014–2019 从早年 V 家到夜鹿初期的 6 张实体经典专辑。点击任意曲目可同步右下角听歌角标。</p>' +
      "</div>" +
      '<div class="timeline-strip">' + timelineHtml + "</div>" +
      '<div class="discography-list">' + spreads + "</div>";

    appEl.querySelectorAll("[data-jump-album]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const el = document.getElementById(btn.getAttribute("data-jump-album"));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    appEl.querySelectorAll(".tracklist-row").forEach(function (row) {
      row.addEventListener("click", function () {
        selectTrackByAlbum(row.getAttribute("data-album-id"), Number(row.getAttribute("data-track-idx")));
      });
    });

    bindCdTiltEffects();
    observeReveals();
  }

  function renderFriendAvatarHtml(link) {
    const mono = escapeHtml(link.monogram || (link.name || "友").slice(0, 1));
    if (!link.avatar) {
      return '<span class="friend-avatar-box"><span class="friend-monogram">' + mono + "</span></span>";
    }
    return (
      '<span class="friend-avatar-box">' +
        '<img src="' + escapeHtml(link.avatar) + '" alt="' + escapeHtml(link.name) + '" loading="lazy" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'inline\';">' +
        '<span class="friend-monogram" style="display:none">' + mono + "</span>" +
      "</span>"
    );
  }

  function renderLinks() {
    setAmbientWash("");
    const groups = Array.from(new Set(friendLinks.map(function (l) { return l.group || "邻站"; })));
    const groupsHtml = groups.map(function (groupName) {
      const items = friendLinks.filter(function (l) { return (l.group || "邻站") === groupName; });
      const cards = items.map(function (link) {
        let domain = link.url;
        try {
          domain = new URL(link.url).hostname;
        } catch (_) {}
        return (
          '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer" class="friend-card reveal" data-cursor="VISIT">' +
            renderFriendAvatarHtml(link) +
            '<div class="friend-body">' +
              '<div class="friend-top">' +
                '<h2 class="friend-name">' + escapeHtml(link.name) + "</h2>" +
                '<span class="friend-tag">' + escapeHtml(link.tag || "友链") + "</span>" +
              "</div>" +
              '<p class="friend-desc">' + escapeHtml(link.desc || "") + "</p>" +
              '<span class="friend-domain">' + escapeHtml(domain) + " ↗</span>" +
            "</div>" +
          "</a>"
        );
      }).join("");
      return (
        '<section class="links-group">' +
          '<h2 class="links-group-title"><span>●</span><span>' + escapeHtml(groupName) + "</span></h2>" +
          '<div class="links-grid">' + cards + "</div>" +
        "</section>"
      );
    }).join("");

    const card = cfg.siteLinkCard || {};
    const snippet =
      "名称：" + (card.name || "小羊的小小窝") + "\n" +
      "链接：" + (card.url || "https://poisonous-sheep.github.io/") + "\n" +
      "头像：" + (card.avatar || "https://poisonous-sheep.github.io/images/avatar.png") + "\n" +
      "简介：" + (card.desc || "");

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">友情链接 · 邻站与常用站点</h1>' +
        '<p class="page-desc">保留原站的洛谷与 GitHub 链接，也欢迎喜欢算法、术力口与拿不拿的朋友交换小站名片。</p>' +
      "</div>" +
      groupsHtml +
      '<section class="exchange-card reveal">' +
        "<div>" +
          '<h2 class="exchange-title">交换友链 · 本站名片</h2>' +
          '<p class="page-desc">欢迎在 GitHub 提 Issue 交换友链，或在 <code>js/config.js</code> 的 <code>friendLinks</code> 数组里直接新增。</p>' +
          '<pre class="exchange-code" id="site-link-snippet">' + escapeHtml(snippet) + "</pre>" +
        "</div>" +
        '<div class="exchange-actions">' +
          '<button type="button" class="btn-primary" id="copy-site-card">一键复制本站友链信息</button>' +
          (card.issueUrl
            ? '<a href="' + escapeHtml(card.issueUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-ghost">在 GitHub 申请交换 ↗</a>'
            : "") +
        "</div>" +
      "</section>";

    const copyBtn = document.getElementById("copy-site-card");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(snippet).then(function () {
            showToast("已复制小羊的小小窝友链名片");
          }).catch(function () {});
        }
      });
    }

    observeReveals();
  }

  function getActiveGalleryItems() {
    if (activeGalleryFilter === "official") return gallery;
    if (activeGalleryFilter === "all") return exhibition;
    return exhibition.filter(function (item) { return item.act === activeGalleryFilter; });
  }

  function getActBannerInfo() {
    if (activeGalleryFilter === "official") {
      return {
        quote: "「从 2014 晴空车厢到 2019 斯德哥尔摩书信——收录 6 张官方实体封面与 2 幅原创站台画作。」",
        time: "OFFICIAL JACKETS · 2014–2019",
        aura: "rgba(61, 154, 226, 0.14)"
      };
    }
    const act = exhibitionActs[activeGalleryFilter];
    if (act) {
      const isNight = document.documentElement.getAttribute("data-theme") === "night";
      return {
        quote: "「" + act.epigraph + "」",
        time: act.no + " · " + act.titleEn + " · " + act.timeRange,
        aura: isNight ? act.auraNight : act.auraDay
      };
    }
    return {
      quote: "「从朝露、昼青、无人站夕暮、终电花火到凌晨四点的萤火——按盛夏一天的时间线排列的十四幕光影。」",
      time: "FULL EXHIBITION · XIV PLATES · 06:00 → 05:00",
      aura: ""
    };
  }

  function renderGallery() {
    const items = getActiveGalleryItems();
    const isOfficial = activeGalleryFilter === "official";
    const listKind = isOfficial ? "official" : "exhibition";
    const actSpec = getActBannerInfo();
    setAmbientWash(actSpec.aura);

    const actButtons = [
      { id: "all", label: "全部 " + exhibition.length + " 幕" },
      { id: "morning", label: "ACT I 朝露与昼青" },
      { id: "dusk", label: "ACT II 无人站与日暮" },
      { id: "final-train", label: "ACT III 透明哀歌与终电" },
      { id: "predawn", label: "ACT IV 黎明与萤火" },
      { id: "official", label: "官方实体封面 (" + gallery.length + ")" }
    ];

    const filterHtml = actButtons.map(function (btn) {
      const cls = btn.id === activeGalleryFilter ? "act-pill active" : "act-pill";
      return (
        '<button type="button" class="' + cls + '" data-gallery-act="' + escapeHtml(btn.id) + '">' +
          '<span class="act-pill-dot" aria-hidden="true"></span>' +
          "<span>" + escapeHtml(btn.label) + "</span>" +
        "</button>"
      );
    }).join("");

    const viewSwitchHtml =
      '<div class="exhibition-view-switch" role="tablist" aria-label="画廊视图切换">' +
        '<button type="button" class="view-switch-btn' + (activeGalleryView === "wall" ? " active" : "") + '" data-gallery-view="wall">展墙视图</button>' +
        '<button type="button" class="view-switch-btn' + (activeGalleryView === "reel" ? " active" : "") + '" data-gallery-view="reel">胶片长廊</button>' +
      "</div>";

    let contentHtml = "";
    if (activeGalleryView === "reel") {
      const reelFrames = items.map(function (item, idx) {
        return renderFilmFrameHtml(item, idx, listKind);
      }).join("");
      contentHtml =
        '<div class="filmstrip-shell exhibition-reel-wrap">' +
          '<button type="button" class="filmstrip-nav-btn prev" id="gallery-reel-prev" aria-label="向左滚动">‹</button>' +
          '<button type="button" class="filmstrip-nav-btn next" id="gallery-reel-next" aria-label="向右滚动">›</button>' +
          '<div class="filmstrip-track exhibition-reel" id="gallery-reel-track">' + reelFrames + "</div>" +
          '<div class="filmstrip-controls-foot">' +
            "<span>35MM CONTACT REEL · 共 " + items.length + " 帧展品</span>" +
            "<span>点击任意画面进入策展暗房灯箱</span>" +
          "</div>" +
        "</div>";
    } else {
      let landscapeRun = 0;
      const wallCards = items.map(function (item, idx) {
        const aspect = item.aspect || (item.span === "wide" ? "landscape" : "square");
        let spanCls = "is-" + aspect;
        if (aspect === "landscape") {
          landscapeRun += 1;
          if (idx === 0 || landscapeRun % 3 === 1) spanCls += " is-hero-span";
        }
        const swatches = (item.palette || []).map(function (hex) {
          return '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '" title="' + escapeHtml(hex) + '"></span>';
        }).join("");
        const sourcePill = item.sourceUrl
          ? '<a href="' + escapeHtml(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer" class="ex-source-pill" data-ext-link="1" data-cursor="EXT">' + escapeHtml(item.sourceBadge || "原作出处") + " ↗</a>"
          : '<span class="ex-source-pill">' + escapeHtml(item.sourceBadge || item.film || "馆藏底片") + "</span>";
        const trackBtn = item.linkedTrack
          ? '<button type="button" class="ex-track-btn" data-track-album="' + escapeHtml(item.linkedTrack.albumId || "") + '" data-track-title="' + escapeHtml(item.linkedTrack.title) + '" data-cursor="PLAY">♪ ' + escapeHtml(item.linkedTrack.title) + "</button>"
          : "";

        return (
          '<article class="ex-card ' + spanCls + ' reveal" tabindex="0" role="button" data-gallery-idx="' + idx + '" data-aura="' + escapeHtml(item.aura || "") + '" data-cursor="VIEW">' +
            '<div class="ex-frame">' +
              '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
              '<span class="ex-plate-badge">' + escapeHtml(item.plateNo || item.no || "") + "</span>" +
            "</div>" +
            '<div class="ex-plaque">' +
              '<div class="ex-plaque-top">' +
                "<span>" + escapeHtml(item.actLabel || item.film || "") + "</span>" +
                "<span>" + escapeHtml(item.timeStamp || item.meta || "") + "</span>" +
              "</div>" +
              '<h2 class="ex-plaque-title">' + escapeHtml(item.title) + "</h2>" +
              (item.artist
                ? '<span class="ex-plaque-artist">画师：' + escapeHtml(item.artist) + "</span>"
                : "") +
              '<p class="ex-plaque-caption">' + escapeHtml(item.caption || "") + "</p>" +
              '<div class="ex-plaque-foot">' +
                '<div class="ex-plaque-actions">' + sourcePill + trackBtn + "</div>" +
                '<div class="album-swatches" aria-hidden="true">' + swatches + "</div>" +
              "</div>" +
            "</div>" +
          "</article>"
        );
      }).join("");
      contentHtml = '<div class="exhibition-wall">' + wallCards + "</div>";
    }

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">夏末影集 · 十四幕光影美术馆</h1>' +
        '<p class="page-desc">收录 14 幅早年 n-buna 关联画作与 8 张官方实体封面/原创画幅。按盛夏一天的时间流动策展，支持画师溯源、色板采样与右下角曲目联动。</p>' +
      "</div>" +
      '<div class="exhibition-toolbar">' +
        '<div class="exhibition-act-pills" role="tablist" aria-label="展厅幕次筛选">' + filterHtml + "</div>" +
        viewSwitchHtml +
      "</div>" +
      '<div class="exhibition-act-epigraph">' +
        '<p class="epigraph-quote">' + escapeHtml(actSpec.quote) + "</p>" +
        '<span class="epigraph-time">' + escapeHtml(actSpec.time) + "</span>" +
      "</div>" +
      contentHtml;

    appEl.querySelectorAll("[data-gallery-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeGalleryFilter = btn.getAttribute("data-gallery-act") || "all";
        renderGallery();
      });
    });

    appEl.querySelectorAll("[data-gallery-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeGalleryView = btn.getAttribute("data-gallery-view") || "wall";
        renderGallery();
      });
    });

    if (activeGalleryView === "reel") {
      bindFilmstripControls("gallery-reel-track", "gallery-reel-prev", "gallery-reel-next", items, listKind);
    } else {
      appEl.querySelectorAll(".ex-card").forEach(function (card) {
        card.addEventListener("mouseenter", function () {
          const aura = card.getAttribute("data-aura");
          if (aura) setAmbientWash(aura);
        });
        card.addEventListener("mouseleave", function () {
          setAmbientWash(actSpec.aura);
        });
        card.addEventListener("click", function (e) {
          if (e.target.closest("[data-ext-link]") || e.target.closest("[data-track-title]")) return;
          openLightboxFromList(items, Number(card.getAttribute("data-gallery-idx")), listKind);
        });
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightboxFromList(items, Number(card.getAttribute("data-gallery-idx")), listKind);
          }
        });
      });

      appEl.querySelectorAll("[data-ext-link]").forEach(function (a) {
        a.addEventListener("click", function (e) { e.stopPropagation(); });
      });

      appEl.querySelectorAll("[data-track-title]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          selectTrackByTitle(btn.getAttribute("data-track-album"), btn.getAttribute("data-track-title"));
        });
      });
    }

    observeReveals();
  }

  function renderFragments() {
    setAmbientWash("");
    const tags = ["全部"].concat(Array.from(new Set(fragments.map(function (f) { return f.tag || "随记"; }))));
    const filtered = activeFragmentTag === "全部"
      ? fragments
      : fragments.filter(function (f) { return (f.tag || "随记") === activeFragmentTag; });

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">车票碎片</h1>' +
        '<p class="page-desc">刷题笔记小贴士、日常碎念与听歌便签。</p>' +
      "</div>" +
      '<div class="filter-bar">' +
        tags.map(function (tag) {
          const cls = tag === activeFragmentTag ? "filter-pill active" : "filter-pill";
          return '<button type="button" class="' + cls + '" data-frag-tag="' + escapeHtml(tag) + '">' + escapeHtml(tag) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="fragments-grid">' + filtered.map(renderTicketCardHtml).join("") + "</div>";

    appEl.querySelectorAll("[data-frag-tag]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFragmentTag = btn.getAttribute("data-frag-tag") || "全部";
        renderFragments();
      });
    });

    observeReveals();
  }

  function renderArchives() {
    setAmbientWash("");
    let totalChars = 0;
    let totalMinutes = 0;
    posts.forEach(function (p) {
      const s = window.estimateReadingStats ? window.estimateReadingStats(p.fallbackContent) : { chars: 500, minutes: 2 };
      totalChars += s.chars;
      totalMinutes += s.minutes;
    });

    const grouped = {};
    posts.forEach(function (post) {
      const year = String(post.date || "").slice(0, 4) || "2025";
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(post);
    });

    const years = Object.keys(grouped).sort(function (a, b) { return b.localeCompare(a); });
    const html = years.map(function (year) {
      const rows = grouped[year].map(function (p) {
        return (
          '<a href="#/post/' + encodeURIComponent(p.id) + '" class="archive-row reveal" data-cursor="READ">' +
            '<span class="archive-row-left">' +
              '<span class="archive-row-date">' + escapeHtml(p.date) + "</span>" +
              "<span>" + escapeHtml(p.title) + "</span>" +
            "</span>" +
            '<span class="timetable-category">' + escapeHtml(p.category) + "</span>" +
          "</a>"
        );
      }).join("");
      return '<section class="archive-year-group"><h2 class="archive-year">' + escapeHtml(year) + "</h2>" + rows + "</section>";
    }).join("");

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">归档</h1>' +
        '<p class="page-desc">按时间顺序收好的全部文章与统计。</p>' +
      "</div>" +
      '<div class="stats-ledger">' +
        '<div class="stat-card"><div class="stat-value">' + posts.length + '</div><div class="stat-label">PUBLISHED · 文章</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + totalChars.toLocaleString() + '</div><div class="stat-label">WORDS · 总字数</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + totalMinutes + 'm</div><div class="stat-label">READING · 预计阅读</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + exhibition.length + '</div><div class="stat-label">PLATES · 十四幕影集</div></div>' +
      "</div>" +
      html;

    observeReveals();
  }

  function renderAbout() {
    setAmbientWash("");
    const about = cfg.about || {};
    const paragraphs = (about.paragraphs || []).map(function (p) { return "<p>" + escapeHtml(p) + "</p>"; }).join("");
    const nowItems = (about.nowBoard || []).map(function (item) {
      return (
        '<div class="now-item">' +
          '<span class="now-tag">' + escapeHtml(item.tag) + "</span>" +
          '<span class="now-label">' + escapeHtml(item.label) + "</span>" +
          '<p class="now-value">' + escapeHtml(item.value) + "</p>" +
        "</div>"
      );
    }).join("");
    const colorCards = (about.colophonColors || []).map(function (c) {
      return (
        '<button type="button" class="color-swatch-card" data-copy-hex="' + escapeHtml(c.hex) + '">' +
          '<span class="color-chip" style="background:' + escapeHtml(c.hex) + '"></span>' +
          "<span>" +
            '<span class="color-name">' + escapeHtml(c.name) + "</span>" +
            '<span class="color-hex">' + escapeHtml(c.hex + " · " + c.role) + "</span>" +
          "</span>" +
        "</button>"
      );
    }).join("");
    const links = (about.links || []).map(function (link) {
      return '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer" class="btn-ghost">' + escapeHtml(link.label) + " ↗</a>";
    }).join("");

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">' + escapeHtml(about.heading || "关于小站") + "</h1>" +
      "</div>" +
      '<div class="about-layout">' +
        '<section class="about-card reveal">' +
          (cfg.avatar
            ? '<div class="about-profile-row">' +
                '<img class="about-avatar" src="' + escapeHtml(cfg.avatar) + '" alt="' + escapeHtml(cfg.author || "有毒的羊") + '">' +
                "<div>" +
                  '<p class="about-lead" style="margin-bottom:0.2rem">' + escapeHtml(about.lead || "") + "</p>" +
                  '<span class="section-sub">' + escapeHtml(cfg.coordinates || "") + "</span>" +
                "</div>" +
              "</div>"
            : '<p class="about-lead">' + escapeHtml(about.lead || "") + "</p>") +
          paragraphs +
          '<div class="about-links">' + links + "</div>" +
        "</section>" +
        '<aside class="now-card reveal">' +
          '<h2 class="now-heading">PROFILE · 小羊档案</h2>' +
          nowItems +
        "</aside>" +
      "</div>" +
      '<section class="colophon-section reveal">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<h2 class="section-title">盛夏设计色卡</h2>' +
            '<span class="section-en">Site Colophon</span>' +
          "</div>" +
          '<span class="section-sub">点击色卡复制色值</span>' +
        "</div>" +
        '<div class="colophon-grid">' + colorCards + "</div>" +
      "</section>";

    appEl.querySelectorAll("[data-copy-hex]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const hex = btn.getAttribute("data-copy-hex");
        if (navigator.clipboard && hex) {
          navigator.clipboard.writeText(hex).then(function () {
            showToast("已复制色值 " + hex);
          }).catch(function () {});
        }
      });
    });

    observeReveals();
  }

  async function renderPost(postId) {
    setAmbientWash("");
    const idx = posts.findIndex(function (p) { return p.id === postId; });
    if (idx === -1) {
      appEl.innerHTML =
        '<div class="article-layout no-toc"><div>' +
          '<a href="#/" class="article-back">← 返回站台首页</a>' +
          '<h1 class="article-title">这一站似乎没有停靠的列车</h1>' +
          '<p class="page-desc">找不到对应的文章，可以回到首页重新挑选。</p>' +
        "</div></div>";
      return;
    }

    const post = posts[idx];
    const prevPost = idx > 0 ? posts[idx - 1] : null;
    const nextPost = idx < posts.length - 1 ? posts[idx + 1] : null;

    let mdText = post.fallbackContent || "";
    if (window.location.protocol !== "file:" && post.file) {
      try {
        const res = await fetch(post.file, { cache: "no-cache" });
        if (res.ok) mdText = await res.text();
      } catch (_) {}
    }

    const parsed = window.parseMarkdownWithToc
      ? window.parseMarkdownWithToc(mdText)
      : { html: window.renderMarkdown ? window.renderMarkdown(mdText) : "", toc: [] };
    const stats = window.estimateReadingStats ? window.estimateReadingStats(mdText) : { chars: 500, minutes: 2 };
    const hasToc = parsed.toc.length > 0;

    const tocHtml = hasToc
      ? '<aside class="toc-sidebar" aria-label="文章目录">' +
          '<p class="toc-title">CONTENTS · 目录</p>' +
          '<ul class="toc-list">' +
            parsed.toc.map(function (item) {
              return '<li><a href="javascript:void(0)" class="toc-link level-' + item.level + '" data-toc-target="' + escapeHtml(item.id) + '">' + escapeHtml(item.text) + "</a></li>";
            }).join("") +
          "</ul>" +
        "</aside>"
      : "";

    appEl.innerHTML =
      '<div class="article-layout' + (hasToc ? "" : " no-toc") + '">' +
        "<article>" +
          '<a href="#/" class="article-back">← 返回站台时刻表</a>' +
          '<header class="article-header">' +
            '<div class="article-meta-row">' +
              '<span class="article-no">No. ' + escapeHtml(post.no) + "</span>" +
              "<span>" + escapeHtml(post.date) + "</span>" +
              '<span class="article-weather">' + escapeHtml(post.weather) + "</span>" +
              "<span>约 " + stats.minutes + " 分钟 · " + stats.chars + " 字</span>" +
              '<span class="timetable-category">' + escapeHtml(post.category) + "</span>" +
            "</div>" +
            '<h1 class="article-title">' + escapeHtml(post.title) + "</h1>" +
          "</header>" +
          (post.cover
            ? '<figure class="article-banner"><img src="' + escapeHtml(post.cover) + '" alt="' + escapeHtml(post.title) + '"></figure>'
            : "") +
          '<div id="post-markdown-body" class="markdown-body">' + parsed.html + "</div>" +
          '<div class="article-signature">—— ' + escapeHtml(cfg.author || "有毒的羊") + " · " + escapeHtml(post.date) + "</div>" +
          '<nav class="station-nav" aria-label="上下篇文章">' +
            (prevPost
              ? '<a href="#/post/' + encodeURIComponent(prevPost.id) + '" class="station-nav-card prev">' +
                  '<span class="station-nav-label">← 上一站</span>' +
                  '<span class="station-nav-title">' + escapeHtml(prevPost.title) + "</span>" +
                "</a>"
              : "<div></div>") +
            (nextPost
              ? '<a href="#/post/' + encodeURIComponent(nextPost.id) + '" class="station-nav-card next">' +
                  '<span class="station-nav-label">下一站 →</span>' +
                  '<span class="station-nav-title">' + escapeHtml(nextPost.title) + "</span>" +
                "</a>"
              : "<div></div>") +
          "</nav>" +
        "</article>" +
        tocHtml +
      "</div>";

    const mdBody = document.getElementById("post-markdown-body");
    renderMathIfReady(mdBody);

    appEl.querySelectorAll("[data-toc-target]").forEach(function (link) {
      link.addEventListener("click", function () {
        const target = document.getElementById(link.getAttribute("data-toc-target"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    updateReadingProgress();
  }

  /* ------------------------------------------------------------------------
     6. 弹窗：歌词本 / 暗房策展灯箱 2.0 / 全站速查搜索 (Ctrl+K)
     ------------------------------------------------------------------------ */
  function openAlbumModal(albumId) {
    const album = albums.find(function (a) { return a.id === albumId; });
    if (!album || !albumModalEl) return;

    const swatches = (album.palette || []).map(function (hex) {
      return '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '" title="' + escapeHtml(hex) + '"></span>';
    }).join("");

    const tracksHtml = (album.tracks || []).map(function (t, idx) {
      const activeCls = isCurrentBgmTrack(album.id, t) ? " active" : "";
      return (
        '<button type="button" class="tracklist-row' + activeCls + '" data-album-id="' + escapeHtml(album.id) + '" data-track-idx="' + idx + '">' +
          '<span class="track-no">' + escapeHtml(t.no) + "</span>" +
          '<span class="track-names">' +
            '<span class="track-jp">' + escapeHtml(t.title) + "</span>" +
            '<span class="track-zh">' + escapeHtml(t.titleZh) + "</span>" +
          "</span>" +
          '<span class="track-dur">' + escapeHtml(t.duration) + "</span>" +
        "</button>"
      );
    }).join("");

    albumModalEl.innerHTML =
      '<div class="modal-card">' +
        '<button type="button" class="modal-close" id="album-modal-close" aria-label="关闭歌词本">×</button>' +
        '<div class="album-modal-grid">' +
          '<div class="modal-jacket-stage is-active">' +
            renderCdStageHtml(album) +
            '<div class="disc-edition-line"><span>' + escapeHtml(album.edition) + "</span><span>" + escapeHtml(album.catalog) + "</span></div>" +
            '<div class="disc-palette-bar"><span>PALETTE</span>' + swatches + "</div>" +
          "</div>" +
          "<div>" +
            '<div class="article-meta-row">' +
              '<span class="article-no">' + escapeHtml(album.artist) + "</span>" +
              "<span>" + escapeHtml(album.year) + "</span>" +
              '<span class="article-weather">' + escapeHtml(album.mood) + "</span>" +
            "</div>" +
            '<h2 class="disc-spread-title">' + escapeHtml(album.title) + "</h2>" +
            '<p class="disc-spread-subtitle">' + escapeHtml(album.titleZh) + "</p>" +
            '<p class="disc-spread-note">' + escapeHtml(album.note) + "</p>" +
            '<div class="tracklist">' + tracksHtml + "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    albumModalEl.classList.add("open");
    albumModalEl.setAttribute("aria-hidden", "false");

    const closeBtn = document.getElementById("album-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeAllModals);

    albumModalEl.querySelectorAll(".tracklist-row").forEach(function (row) {
      row.addEventListener("click", function () {
        selectTrackByAlbum(row.getAttribute("data-album-id"), Number(row.getAttribute("data-track-idx")));
      });
    });
  }

  function openExhibitionLightboxById(itemId) {
    const idx = exhibition.findIndex(function (x) { return x.id === itemId; });
    openLightboxFromList(exhibition, idx === -1 ? 0 : idx, "exhibition");
  }

  function openLightbox(index) {
    openLightboxFromList(gallery, index, "official");
  }

  function openLightboxFromList(list, index, kind) {
    if (!lightboxModalEl || !Array.isArray(list) || list.length === 0) return;
    currentLightboxList = list;
    currentLightboxKind = kind || "exhibition";
    currentLightboxIdx = (index + list.length) % list.length;
    const item = list[currentLightboxIdx];

    const counterLabel = (item.plateNo || item.no || "") + " · " +
      String(currentLightboxIdx + 1).padStart(2, "0") + " / " +
      String(list.length).padStart(2, "0");

    const paletteHtml = (item.palette || []).map(function (hex) {
      return (
        '<button type="button" class="lb-palette-chip" data-lb-copy="' + escapeHtml(hex) + '" title="点击复制色值">' +
          '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '"></span>' +
          "<span>" + escapeHtml(hex) + "</span>" +
        "</button>"
      );
    }).join("");

    const thumbsHtml = list.map(function (thumb, tIdx) {
      const activeCls = tIdx === currentLightboxIdx ? "lb-thumb-btn active" : "lb-thumb-btn";
      return (
        '<button type="button" class="' + activeCls + '" data-lb-jump="' + tIdx + '" title="' + escapeHtml(thumb.title) + '">' +
          '<img src="' + escapeHtml(thumb.image) + '" alt="' + escapeHtml(thumb.title) + '">' +
        "</button>"
      );
    }).join("");

    const extLabel = item.sourceType === "x" ? "前往 X 画师主页 ↗" : "在 Pixiv 查看原作 ↗";

    lightboxModalEl.innerHTML =
      '<div class="modal-card lightbox-dossier">' +
        '<button type="button" class="modal-close" id="lightbox-close" aria-label="关闭暗房灯箱">×</button>' +
        '<div class="lb-dossier-grid">' +
          '<div class="lb-stage-col">' +
            '<div class="lb-stage" style="--lb-aura:' + escapeHtml(item.aura || "rgba(61,154,226,0.16)") + '">' +
              '<span class="lb-counter-pill">' + escapeHtml(counterLabel) + "</span>" +
              '<button type="button" class="lb-stage-arrow prev" id="lb-prev" aria-label="上一幅">‹</button>' +
              '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
              '<button type="button" class="lb-stage-arrow next" id="lb-next" aria-label="下一幅">›</button>' +
            "</div>" +
            '<div class="lb-thumb-strip" id="lb-thumb-strip">' + thumbsHtml + "</div>" +
          "</div>" +
          '<aside class="lb-info-panel">' +
            '<div class="lb-act-meta">' +
              "<span>" + escapeHtml(item.actLabel || item.film || "EXHIBITION") + "</span>" +
              "<span>" + escapeHtml(item.timeStamp || item.meta || "") + "</span>" +
            "</div>" +
            '<h2 class="lb-title">' + escapeHtml(item.title) + "</h2>" +
            (item.artist
              ? '<div class="lb-artist">画师：' + escapeHtml(item.artist) + "</div>"
              : "") +
            '<div class="lb-source-box">' + escapeHtml(item.sourceNote || ((item.film || "") + " · " + (item.meta || ""))) + "</div>" +
            '<p class="lb-caption">' + escapeHtml(item.caption || "") + "</p>" +
            (paletteHtml
              ? '<div class="lb-palette-row">' + paletteHtml + "</div>"
              : "") +
            '<div class="lb-actions">' +
              (item.linkedTrack
                ? '<button type="button" class="btn-primary" id="lb-play-linked">♪ 联动曲目：' + escapeHtml(item.linkedTrack.title) + "</button>"
                : "") +
              (item.sourceUrl
                ? '<a href="' + escapeHtml(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-ghost">' + escapeHtml(extLabel) + "</a>"
                : "") +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</div>";

    lightboxModalEl.classList.add("open");
    lightboxModalEl.setAttribute("aria-hidden", "false");

    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lb-prev");
    const nextBtn = document.getElementById("lb-next");
    const linkedBtn = document.getElementById("lb-play-linked");

    if (closeBtn) closeBtn.addEventListener("click", closeAllModals);
    if (prevBtn) prevBtn.addEventListener("click", function () {
      openLightboxFromList(currentLightboxList, currentLightboxIdx - 1, currentLightboxKind);
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      openLightboxFromList(currentLightboxList, currentLightboxIdx + 1, currentLightboxKind);
    });
    if (linkedBtn && item.linkedTrack) {
      linkedBtn.addEventListener("click", function () {
        selectTrackByTitle(item.linkedTrack.albumId, item.linkedTrack.title);
      });
    }

    lightboxModalEl.querySelectorAll("[data-lb-jump]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightboxFromList(currentLightboxList, Number(btn.getAttribute("data-lb-jump")), currentLightboxKind);
      });
    });

    lightboxModalEl.querySelectorAll("[data-lb-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const hex = btn.getAttribute("data-lb-copy");
        if (navigator.clipboard && hex) {
          navigator.clipboard.writeText(hex).then(function () {
            showToast("已复制色值 " + hex);
          }).catch(function () {});
        }
      });
    });

    const activeThumb = lightboxModalEl.querySelector(".lb-thumb-btn.active");
    if (activeThumb && activeThumb.scrollIntoView) {
      activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  function openSearchModal() {
    if (!searchModalEl) return;
    searchModalEl.innerHTML =
      '<div class="modal-card search-card">' +
        '<div class="search-input-row">' +
          '<span style="color:var(--accent)">🔍</span>' +
          '<input type="search" id="global-search-input" class="search-input" placeholder="搜索文章、十四幕画作、画师/Pixiv ID、专辑曲目或友链…" autocomplete="off">' +
          '<button type="button" class="bgm-btn" id="search-close" aria-label="关闭搜索">×</button>' +
        "</div>" +
        '<div id="global-search-results" class="search-results"></div>' +
      "</div>";

    searchModalEl.classList.add("open");
    searchModalEl.setAttribute("aria-hidden", "false");

    const inputEl = document.getElementById("global-search-input");
    const resultsEl = document.getElementById("global-search-results");
    const closeBtn = document.getElementById("search-close");
    if (closeBtn) closeBtn.addEventListener("click", closeAllModals);

    function renderResults(keyword) {
      const q = String(keyword || "").trim().toLowerCase();
      const hits = [];

      posts.forEach(function (p) {
        if (!q || (p.title + p.excerpt + p.category + p.weather).toLowerCase().includes(q)) {
          hits.push({ kind: "文章", title: p.title, sub: p.date + " · " + p.category, action: function () { window.location.hash = "#/post/" + encodeURIComponent(p.id); } });
        }
      });
      exhibition.forEach(function (ex, idx) {
        const hay = [ex.plateNo, ex.title, ex.artist, ex.pixivId, ex.sourceNote, ex.actLabel, ex.linkedTrack ? ex.linkedTrack.title : ""].join(" ").toLowerCase();
        if (q && hay.includes(q)) {
          hits.push({ kind: "影集", title: ex.plateNo + " · " + ex.title, sub: "画师：" + ex.artist + " · " + ex.sourceBadge, action: function () { openLightboxFromList(exhibition, idx, "exhibition"); } });
        }
      });
      albums.forEach(function (a) {
        if (!q || (a.title + a.titleZh + a.artist).toLowerCase().includes(q)) {
          hits.push({ kind: "唱片", title: a.title + " / " + a.titleZh, sub: a.artist + " · " + a.year.slice(0, 4), action: function () { openAlbumModal(a.id); } });
        }
        (a.tracks || []).forEach(function (t, idx) {
          if (q && (t.title + t.titleZh + t.lyric).toLowerCase().includes(q)) {
            hits.push({ kind: "曲目", title: t.title + " — " + t.titleZh, sub: a.title, action: function () { selectTrackByAlbum(a.id, idx); } });
          }
        });
      });
      if (q) {
        fragments.forEach(function (f) {
          if ((f.text + f.route + f.tag).toLowerCase().includes(q)) {
            hits.push({ kind: "碎片", title: f.text.slice(0, 32) + "…", sub: f.date + " · " + f.route, action: function () { window.location.hash = "#/fragments"; } });
          }
        });
        friendLinks.forEach(function (l) {
          if ((l.name + l.desc + l.tag).toLowerCase().includes(q)) {
            hits.push({ kind: "友链", title: l.name, sub: (l.tag || "友链") + " · " + l.desc, action: function () { window.open(l.url, "_blank", "noopener"); } });
          }
        });
      }

      if (hits.length === 0) {
        resultsEl.innerHTML = '<p class="page-desc" style="padding:0.8rem 0.4rem">没有找到匹配的内容，试试搜「あわしま」「夜明けと蛍」「33700607」或「图论」？</p>';
        return;
      }

      resultsEl.innerHTML = hits.slice(0, 14).map(function (h, i) {
        return (
          '<button type="button" class="search-result-item" data-hit-idx="' + i + '">' +
            "<span>" +
              '<span style="display:block;font-size:0.9rem">' + escapeHtml(h.title) + "</span>" +
              '<span style="display:block;font-size:0.74rem;color:var(--text-muted)">' + escapeHtml(h.sub) + "</span>" +
            "</span>" +
            '<span class="search-result-kind">' + escapeHtml(h.kind) + "</span>" +
          "</button>"
        );
      }).join("");

      resultsEl.querySelectorAll("[data-hit-idx]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const hit = hits[Number(btn.getAttribute("data-hit-idx"))];
          closeAllModals();
          if (hit && hit.action) hit.action();
        });
      });
    }

    renderResults("");
    if (inputEl) {
      inputEl.focus();
      inputEl.addEventListener("input", function () { renderResults(inputEl.value); });
    }
  }

  function closeAllModals() {
    [albumModalEl, lightboxModalEl, searchModalEl].forEach(function (el) {
      if (el) {
        el.classList.remove("open");
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. 右下角「听歌角标」+ 轻柔吉他泛音氛围
     ------------------------------------------------------------------------ */
  function startGentleAmbientHarmonics() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    if (!ambientCtx) ambientCtx = new AudioCtx();
    if (ambientCtx.state === "suspended") ambientCtx.resume();

    const notes = [293.66, 369.99, 440.0, 554.37, 587.33, 739.99, 880.0];
    function pluckHarmonic() {
      if (!isAmbientPlaying || !ambientCtx) return;
      const now = ambientCtx.currentTime;
      const osc = ambientCtx.createOscillator();
      const gain = ambientCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.032, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
      osc.connect(gain);
      gain.connect(ambientCtx.destination);
      osc.start(now);
      osc.stop(now + 3.5);
    }

    isAmbientPlaying = true;
    pluckHarmonic();
    ambientTimer = setInterval(pluckHarmonic, 2400);
    return true;
  }

  function stopGentleAmbientHarmonics() {
    isAmbientPlaying = false;
    if (ambientTimer) {
      clearInterval(ambientTimer);
      ambientTimer = null;
    }
  }

  function buildBgmTrackList() {
    if (albums.length > 0) {
      const list = [];
      albums.forEach(function (album) {
        (album.tracks || []).forEach(function (track) {
          list.push({
            albumId: album.id,
            albumObj: album,
            album: album.title,
            artist: album.artist,
            title: track.title,
            lyric: track.lyric,
            audioUrl: track.audioUrl || ""
          });
        });
      });
      if (list.length > 0) return list;
    }
    return Array.isArray(cfg.tracks) ? cfg.tracks : [];
  }

  function initBgmWidget() {
    bgmTrackList = buildBgmTrackList();
    const tracks = bgmTrackList;
    const widget = document.getElementById("bgm-widget");
    if (!widget || tracks.length === 0) return;

    const defaultIdx = tracks.findIndex(function (t) { return t.title === "夜明けと蛍"; });
    if (defaultIdx !== -1) currentTrackIndex = defaultIdx;

    const coverEl = document.getElementById("bgm-cover");
    const titleEl = document.getElementById("bgm-title");
    const lyricEl = document.getElementById("bgm-lyric");
    const tagEl = document.getElementById("bgm-tag");
    const fillEl = document.getElementById("bgm-progress-fill");
    const prevBtn = document.getElementById("bgm-prev");
    const nextBtn = document.getElementById("bgm-next");
    const playBtn = document.getElementById("bgm-play");
    const collapseBtn = document.getElementById("bgm-collapse");

    function renderTrack(autoPlayAudio) {
      const track = tracks[currentTrackIndex];
      if (!track) return;
      if (coverEl) {
        coverEl.innerHTML = track.albumObj && track.albumObj.coverImage
          ? '<img src="' + escapeHtml(track.albumObj.coverImage) + '" alt="' + escapeHtml(track.album) + '">'
          : "";
      }
      if (titleEl) titleEl.textContent = track.title + " — " + track.artist;
      if (lyricEl) lyricEl.textContent = track.lyric || track.album || "";
      if (fillEl) fillEl.style.width = ((currentTrackIndex + 1) / tracks.length * 100).toFixed(0) + "%";
      syncPlayingAlbumCards();

      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }

      if (autoPlayAudio && track.audioUrl) {
        stopGentleAmbientHarmonics();
        audioEl = new Audio(track.audioUrl);
        audioEl.play().then(function () {
          widget.classList.add("is-playing");
          if (playBtn) playBtn.textContent = "❚❚";
          if (tagEl) tagEl.textContent = "PLAYING";
        }).catch(function () {});
      }
    }

    bgmRenderFn = renderTrack;

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        renderTrack(false);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        renderTrack(false);
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        const track = tracks[currentTrackIndex];
        if (track && track.audioUrl) {
          if (!audioEl) {
            renderTrack(true);
          } else if (audioEl.paused) {
            audioEl.play();
            widget.classList.add("is-playing");
            playBtn.textContent = "❚❚";
          } else {
            audioEl.pause();
            widget.classList.remove("is-playing");
            playBtn.textContent = "♪";
          }
          return;
        }

        if (!isAmbientPlaying) {
          if (startGentleAmbientHarmonics()) {
            widget.classList.add("is-playing");
            playBtn.textContent = "❚❚";
            if (tagEl) tagEl.textContent = "AMBIENT HARMONICS";
            showToast("已开启轻柔盛夏吉他泛音");
          }
        } else {
          stopGentleAmbientHarmonics();
          widget.classList.remove("is-playing");
          playBtn.textContent = "♪";
          if (tagEl) tagEl.textContent = "NOW LISTENING";
        }
      });
    }

    if (collapseBtn) {
      collapseBtn.addEventListener("click", function () {
        const isCollapsed = widget.classList.toggle("collapsed");
        collapseBtn.textContent = isCollapsed ? "+" : "–";
      });
    }

    renderTrack(false);
  }

  /* ------------------------------------------------------------------------
     8. 路由、滚动与交互细节
     ------------------------------------------------------------------------ */
  function updateActiveNav(routeName) {
    document.querySelectorAll(".nav-link, .rail-stop").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-route") === routeName);
    });
  }

  function updateReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (backToTopBtn) {
      backToTopBtn.classList.toggle("visible", scrollTop > 360);
    }

    if (!progressEl) return;
    const isPost = window.location.hash.startsWith("#/post/");
    progressEl.classList.toggle("visible", isPost);
    if (!isPost) {
      progressEl.style.width = "0%";
      if (bgmRingEl) bgmRingEl.style.strokeDashoffset = "132";
      return;
    }
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    progressEl.style.width = pct.toFixed(1) + "%";
    if (bgmRingEl) {
      const circumference = 132;
      bgmRingEl.style.strokeDashoffset = (circumference * (1 - pct / 100)).toFixed(1);
    }

    const tocLinks = document.querySelectorAll("[data-toc-target]");
    if (tocLinks.length > 0) {
      let currentId = "";
      tocLinks.forEach(function (link) {
        const id = link.getAttribute("data-toc-target");
        const sec = document.getElementById(id);
        if (sec && sec.getBoundingClientRect().top <= 130) currentId = id;
      });
      tocLinks.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("data-toc-target") === currentId);
      });
    }
  }

  function observeReveals() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initOpeningCurtain() {
    const curtain = document.getElementById("opening-curtain");
    if (!curtain) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("xiaoyang-curtain-seen") === "1";
    } catch (_) {}

    if (seen || reduced) {
      curtain.classList.add("is-hidden");
      return;
    }
    try {
      sessionStorage.setItem("xiaoyang-curtain-seen", "1");
    } catch (_) {}
    setTimeout(function () {
      curtain.classList.add("is-lifted");
      setTimeout(function () { curtain.classList.add("is-hidden"); }, 720);
    }, 360);
  }

  function initCursorRing() {
    const ring = document.getElementById("cursor-ring");
    const labelEl = document.getElementById("cursor-ring-label");
    if (!ring) return;
    const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let mx = -100, my = -100, rx = -100, ry = -100;
    let rafActive = false;

    function tick() {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      const w = ring.offsetWidth / 2;
      const h = ring.offsetHeight / 2;
      ring.style.transform = "translate3d(" + (rx - w).toFixed(1) + "px," + (ry - h).toFixed(1) + "px,0)";
      if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) {
        requestAnimationFrame(tick);
      } else {
        rafActive = false;
      }
    }

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      ring.classList.add("is-visible");
      if (!rafActive) {
        rafActive = true;
        requestAnimationFrame(tick);
      }
      const target = e.target.closest("[data-cursor],[data-album-open],[data-lightbox-idx],[data-gallery-idx],[data-exhibition-open],.film-frame,.featured-post-card,.timetable-link");
      if (target) {
        ring.classList.add("is-hover");
        let label = target.getAttribute("data-cursor") || "";
        if (!label) {
          if (target.hasAttribute("data-album-open")) label = "OPEN";
          else if (target.hasAttribute("data-lightbox-idx") || target.hasAttribute("data-gallery-idx") || target.hasAttribute("data-exhibition-open") || target.classList.contains("film-frame")) label = "VIEW";
          else label = "READ";
        }
        ring.classList.toggle("has-label", Boolean(label));
        if (labelEl) labelEl.textContent = label;
      } else {
        ring.classList.remove("is-hover");
        ring.classList.remove("has-label");
        if (labelEl) labelEl.textContent = "";
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      ring.classList.remove("is-visible");
    });
  }

  function bindCdTiltEffects() {
    const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    document.querySelectorAll(".cd-sleeve").forEach(function (sleeve) {
      if (sleeve.dataset.tiltBound) return;
      sleeve.dataset.tiltBound = "1";
      sleeve.addEventListener("mousemove", function (e) {
        const rect = sleeve.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotY = ((px - 0.5) * 9).toFixed(2);
        const rotX = ((0.5 - py) * 9).toFixed(2);
        sleeve.style.transform = "perspective(700px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-4px)";
        sleeve.style.setProperty("--gx", (px * 100).toFixed(0) + "%");
        sleeve.style.setProperty("--gy", (py * 100).toFixed(0) + "%");
      });
      sleeve.addEventListener("mouseleave", function () {
        sleeve.style.transform = "";
      });
    });
  }

  function renderRouteBody(hash) {
    if (hash.startsWith("#/post/")) {
      updateActiveNav("home");
      renderPost(decodeURIComponent(hash.slice("#/post/".length)));
    } else if (hash === "#/discography") {
      updateActiveNav("discography");
      renderDiscography();
    } else if (hash === "#/gallery") {
      updateActiveNav("gallery");
      renderGallery();
    } else if (hash === "#/fragments") {
      updateActiveNav("fragments");
      renderFragments();
    } else if (hash === "#/archives") {
      updateActiveNav("archives");
      renderArchives();
    } else if (hash === "#/links") {
      updateActiveNav("links");
      renderLinks();
    } else if (hash === "#/about") {
      updateActiveNav("about");
      renderAbout();
    } else {
      updateActiveNav("home");
      renderHome();
    }
    updateReadingProgress();
  }

  function handleRoute(skipTransition) {
    closeAllModals();
    const hash = window.location.hash || "#/";
    window.scrollTo(0, 0);
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!skipTransition && document.startViewTransition && !reduced) {
      document.startViewTransition(function () {
        renderRouteBody(hash);
      });
    } else {
      renderRouteBody(hash);
    }
  }

  function initSiteMeta() {
    const issueEl = document.getElementById("masthead-issue");
    const coordsEl = document.getElementById("masthead-coords");
    const sealEl = document.getElementById("header-seal");
    const nameEl = document.getElementById("header-site-name");
    const enEl = document.getElementById("header-site-en");
    const copyEl = document.getElementById("footer-copy");

    if (cfg.siteName) {
      document.title = cfg.siteName + " — " + (cfg.author || "有毒的羊");
      if (nameEl) nameEl.textContent = cfg.siteName;
    }
    if (enEl && cfg.siteNameEn) enEl.textContent = cfg.siteNameEn;
    if (sealEl && cfg.sealText) sealEl.textContent = cfg.sealText;
    if (issueEl && cfg.issueTag) issueEl.textContent = cfg.issueTag;
    if (coordsEl && cfg.coordinates) coordsEl.textContent = cfg.coordinates;
    if (copyEl) copyEl.textContent = "© 2025–2026 " + (cfg.author || "有毒的羊") + " · " + (cfg.siteName || "小羊的小小窝");
  }

  if (searchTriggerBtn) searchTriggerBtn.addEventListener("click", openSearchModal);
  if (backToTopBtn) backToTopBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  [albumModalEl, lightboxModalEl, searchModalEl].forEach(function (modal) {
    if (!modal) return;
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeAllModals();
    });
  });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearchModal();
      return;
    }
    if (e.key === "Escape") {
      closeAllModals();
      return;
    }
    if (lightboxModalEl && lightboxModalEl.classList.contains("open")) {
      if (e.key === "ArrowLeft") openLightboxFromList(currentLightboxList, currentLightboxIdx - 1, currentLightboxKind);
      if (e.key === "ArrowRight") openLightboxFromList(currentLightboxList, currentLightboxIdx + 1, currentLightboxKind);
    }
  });

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-copy-code]");
    if (!btn) return;
    const block = btn.closest(".code-block");
    const code = block && block.querySelector("pre code");
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code.textContent || "").then(function () {
      btn.textContent = "已复制";
      showToast("代码已复制到剪贴板");
      setTimeout(function () { btn.textContent = "复制代码"; }, 1600);
    }).catch(function () {});
  });

  window.addEventListener("hashchange", function () { handleRoute(false); });
  window.addEventListener("scroll", updateReadingProgress, { passive: true });

  initSiteMeta();
  initOpeningCurtain();
  initCursorRing();
  initTheme();
  initBgmWidget();
  handleRoute(true);
})();
