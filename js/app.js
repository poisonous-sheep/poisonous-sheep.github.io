/**
 * 小羊的小小窝 — 主应用脚本（有毒的羊 · 盛夏青春实体唱片版）
 * 功能：三连电车车窗交互展柜、6 张实体封面 3×2 唱片架与动态光晕联动、
 *       信纸诗句条、夏末影集 8 图灯箱、打孔车票、文章自动目录(TOC)与 KaTeX 公式渲染、
 *       Ctrl+K 全站速查搜索、迷你封面 BGM 角标与轻柔吉他泛音氛围音。
 */
(function () {
  const cfg = window.BLOG_CONFIG || {};
  const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];
  const fragments = Array.isArray(window.BLOG_FRAGMENTS) ? window.BLOG_FRAGMENTS : [];
  const albums = Array.isArray(cfg.albums) ? cfg.albums : [];
  const gallery = Array.isArray(cfg.gallery) ? cfg.gallery : [];
  const whispers = Array.isArray(cfg.whispers) ? cfg.whispers : [];
  const heroWindows = Array.isArray(cfg.heroWindows) ? cfg.heroWindows : [];
  const friendLinks = Array.isArray(cfg.friendLinks) ? cfg.friendLinks : [];

  const appEl = document.getElementById("app");
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
  let currentWhisperIdx = 0;
  let currentLightboxIdx = 0;
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
      // KaTeX defer 脚本尚未加载完时，稍后再尝试一次
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
     2. 实体 CD 封套 & 三连电车车窗组件
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

  function renderTripleWindowsHtml() {
    const panes = heroWindows.map(function (win) {
      const cls = win.featured ? "train-pane is-featured" : "train-pane";
      return (
        '<button type="button" class="' + cls + '" data-album-open="' + escapeHtml(win.albumId) + '" aria-label="翻开 ' + escapeHtml(win.title) + ' 歌词本">' +
          '<div class="train-pane-glass">' +
            '<img src="' + escapeHtml(win.image) + '" alt="' + escapeHtml(win.title) + '">' +
            '<span class="pane-rails" aria-hidden="true"></span>' +
            '<div class="pane-overlay">' +
              '<span class="pane-year">' + escapeHtml(win.no + " · " + win.year) + "</span>" +
              '<span class="pane-title">' + escapeHtml(win.label) + "</span>" +
            "</div>" +
          "</div>" +
        "</button>"
      );
    }).join("");

    return (
      '<div class="triple-window-wall hero-stagger-2">' +
        '<div class="triple-window-top">' +
          "<span>WINDOW GALLERY · 三连电车车窗</span>" +
          '<span class="triple-window-top-right">n-buna 2014–2016</span>' +
        "</div>" +
        '<div class="triple-windows-row">' + panes + "</div>" +
        '<div class="triple-window-foot">' +
          '<span class="triple-motto-inline">' +
            '<span class="motto-seal" aria-hidden="true">' + escapeHtml(cfg.sealText || "羊") + "</span>" +
            "<span>" + escapeHtml(cfg.verticalMotto || "") + "</span>" +
          "</span>" +
          '<span class="triple-hint">悬停放大 · 点击翻开歌词本</span>' +
        "</div>" +
      "</div>"
    );
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
     3. 首页渲染
     ------------------------------------------------------------------------ */
  function renderHome() {
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

    const albumsHtml = albums.map(function (album) {
      const swatches = (album.palette || []).map(function (hex) {
        return '<span class="swatch-dot" style="background:' + escapeHtml(hex) + '"></span>';
      }).join("");
      const playingCls = album.id === activeAlbumId ? " is-now-playing" : "";
      return (
        '<button type="button" class="album-card reveal' + playingCls + '" data-album-open="' + escapeHtml(album.id) + '" data-aura="' + escapeHtml(album.aura || "") + '">' +
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
          '<a href="#/post/' + encodeURIComponent(post.id) + '" class="timetable-link">' +
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

    const contactPreview = gallery.slice(0, 4).map(function (item, idx) {
      return (
        '<button type="button" class="film-plate reveal" data-lightbox-idx="' + idx + '">' +
          '<div class="film-plate-media">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          "</div>" +
          '<div class="film-plate-meta">' +
            "<span>" + escapeHtml(item.no) + "</span>" +
            "<span>" + escapeHtml(item.meta) + "</span>" +
          "</div>" +
          '<h3 class="film-plate-title">' + escapeHtml(item.title) + "</h3>" +
        "</button>"
      );
    }).join("");

    const recentFragments = fragments.slice(0, 4).map(renderTicketCardHtml).join("");
    const currentWhisper = whispers[currentWhisperIdx] || { text: "", source: "", stamp: "盛夏" };

    appEl.innerHTML =
      '<section class="hero-section">' +
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
            '<div class="ledger-cell"><span class="ledger-num">0' + gallery.length + '</span><span class="ledger-label">影集底片</span></div>' +
            '<div class="ledger-cell"><span class="ledger-num">0' + fragments.length + '</span><span class="ledger-label">打孔车票</span></div>' +
          "</div>" +
          '<div class="hero-actions">' +
            (featured
              ? '<a href="#/post/' + encodeURIComponent(featured.id) + '" class="btn-primary">开始阅读最新笔记 →</a>'
              : "") +
            '<a href="#/discography" class="btn-ghost">逛一逛唱片架 ♪</a>' +
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
      '<section id="album-shelf-section" class="album-shelf-section" aria-labelledby="albums-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">01</span>' +
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
            '<span class="section-num-bg" aria-hidden="true">02</span>' +
            '<h2 id="posts-heading" class="section-title">站台时刻表 · 我的博客文章</h2>' +
            '<span class="section-en">Algorithm & Daily Notes</span>' +
          "</div>" +
          '<span class="section-sub">' + filtered.length + " 篇文章</span>" +
        "</div>" +
        (featured
          ? '<a href="#/post/' + encodeURIComponent(featured.id) + '" class="featured-post-card reveal">' +
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
      '<section class="gallery-preview-section" aria-labelledby="gallery-heading">' +
        '<div class="section-head">' +
          '<div class="section-title-group">' +
            '<span class="section-num-bg" aria-hidden="true">03</span>' +
            '<h2 id="gallery-heading" class="section-title">夏末影集 · 35mm 底片</h2>' +
            '<span class="section-en">Contact Sheet</span>' +
          "</div>" +
          '<a href="#/gallery" class="section-sub">进入全部 ' + gallery.length + " 张展板 →</a>" +
        "</div>" +
        '<div class="contact-strip">' + contactPreview + "</div>" +
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
                      '<span style="display:block;font-family:var(--font-mono);font-size:0.66rem;color:var(--text-muted)">' + escapeHtml(link.tag) + "</span>" +
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

    const shelfEl = document.getElementById("album-shelf-section");
    appEl.querySelectorAll("[data-album-open]").forEach(function (card) {
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

    appEl.querySelectorAll("[data-lightbox-idx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(Number(btn.getAttribute("data-lightbox-idx")));
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
     4. 唱片架 / 影集 / 车票碎片 / 归档 / 关于 / 文章详情
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

  function renderDiscography() {
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

  function renderGallery() {
    const plates = gallery.map(function (item, idx) {
      const spanCls = item.span === "wide" ? "film-plate wide reveal" : "film-plate reveal";
      return (
        '<button type="button" class="' + spanCls + '" data-lightbox-idx="' + idx + '">' +
          '<div class="film-plate-media">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          "</div>" +
          '<div class="film-plate-meta">' +
            "<span>" + escapeHtml(item.no + " · " + item.film) + "</span>" +
            "<span>" + escapeHtml(item.meta) + "</span>" +
          "</div>" +
          '<h2 class="film-plate-title">' + escapeHtml(item.title) + "</h2>" +
          '<p class="film-plate-caption">' + escapeHtml(item.caption) + "</p>" +
        "</button>"
      );
    }).join("");

    appEl.innerHTML =
      '<div class="page-header-block">' +
        '<h1 class="page-title">夏末影集</h1>' +
        '<p class="page-desc">6 张珍藏实体专辑封面与 2 张临海站/黎明原画展板，点击任意画面开启全屏灯箱。</p>' +
      "</div>" +
      '<div class="gallery-grid">' + plates + "</div>";

    appEl.querySelectorAll("[data-lightbox-idx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(Number(btn.getAttribute("data-lightbox-idx")));
      });
    });

    bindCdTiltEffects();
    observeReveals();
  }

  function renderFragments() {
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
          '<a href="#/post/' + encodeURIComponent(p.id) + '" class="archive-row reveal">' +
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
        '<div class="stat-card"><div class="stat-value">' + albums.length + '</div><div class="stat-label">ALBUMS · 实体唱片</div></div>' +
      "</div>" +
      html;

    observeReveals();
  }

  function renderAbout() {
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
     5. 弹窗：歌词本 / 影集灯箱 / 全站搜索 (Ctrl+K)
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

  function openLightbox(index) {
    if (!lightboxModalEl || gallery.length === 0) return;
    currentLightboxIdx = (index + gallery.length) % gallery.length;
    const item = gallery[currentLightboxIdx];

    lightboxModalEl.innerHTML =
      '<div class="modal-card lightbox-card">' +
        '<button type="button" class="modal-close" id="lightbox-close" aria-label="关闭灯箱">×</button>' +
        '<div class="lightbox-media"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '"></div>' +
        '<div class="lightbox-foot">' +
          "<div>" +
            '<div class="film-plate-meta" style="margin-top:0"><span>' + escapeHtml(item.no + " · " + item.film + " · " + item.meta) + "</span></div>" +
            '<h3 class="film-plate-title">' + escapeHtml(item.title) + "</h3>" +
            '<p class="film-plate-caption">' + escapeHtml(item.caption) + "</p>" +
          "</div>" +
          '<div class="lightbox-nav">' +
            '<button type="button" class="btn-ghost" id="lb-prev">← 上一张</button>' +
            '<button type="button" class="btn-ghost" id="lb-next">下一张 →</button>' +
          "</div>" +
        "</div>" +
      "</div>";

    lightboxModalEl.classList.add("open");
    lightboxModalEl.setAttribute("aria-hidden", "false");

    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lb-prev");
    const nextBtn = document.getElementById("lb-next");
    if (closeBtn) closeBtn.addEventListener("click", closeAllModals);
    if (prevBtn) prevBtn.addEventListener("click", function () { openLightbox(currentLightboxIdx - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { openLightbox(currentLightboxIdx + 1); });
  }

  function openSearchModal() {
    if (!searchModalEl) return;
    searchModalEl.innerHTML =
      '<div class="modal-card search-card">' +
        '<div class="search-input-row">' +
          '<span style="color:var(--accent)">🔍</span>' +
          '<input type="search" id="global-search-input" class="search-input" placeholder="搜索文章、6 张专辑、曲目或车票碎片…" autocomplete="off">' +
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
            hits.push({ kind: "友链", title: l.name, sub: l.tag + " · " + l.desc, action: function () { window.open(l.url, "_blank", "noopener"); } });
          }
        });
      }

      if (hits.length === 0) {
        resultsEl.innerHTML = '<p class="page-desc" style="padding:0.8rem 0.4rem">没有找到匹配的内容，换个关键词试试？</p>';
        return;
      }

      resultsEl.innerHTML = hits.slice(0, 12).map(function (h, i) {
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
     6. 右下角「听歌角标」+ 轻柔吉他泛音氛围
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
     7. 路由、滚动与初始化
     ------------------------------------------------------------------------ */
  function updateActiveNav(routeName) {
    document.querySelectorAll(".nav-link").forEach(function (link) {
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
    }, { threshold: 0.06 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     6.5 初次进站帷幕、桌面端跟手光环、3D 实体 CD 倾斜反光
     ------------------------------------------------------------------------ */
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
      const target = e.target.closest("[data-album-open],[data-lightbox-idx],[data-cursor],.featured-post-card,.timetable-link");
      if (target) {
        ring.classList.add("is-hover");
        let label = target.getAttribute("data-cursor") || "";
        if (!label) {
          if (target.hasAttribute("data-album-open")) label = "OPEN";
          else if (target.hasAttribute("data-lightbox-idx")) label = "VIEW";
          else label = "READ";
        }
        if (labelEl) labelEl.textContent = label;
      } else {
        ring.classList.remove("is-hover");
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
      if (e.key === "ArrowLeft") openLightbox(currentLightboxIdx - 1);
      if (e.key === "ArrowRight") openLightbox(currentLightboxIdx + 1);
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
