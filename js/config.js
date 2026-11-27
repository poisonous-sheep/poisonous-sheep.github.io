/**
 * 小羊的小小窝 - 站点配置文件（有毒的羊 · 盛夏终电十四幕美术馆版）
 * --------------------------------------------------
 * 100% 保留原站真实档案（游戏 + 学习 + 术力口 / 算法竞赛 C++ / 第五人格 / 春卷饭 & 重音 Teto）、
 * 6 张官方实体唱片与全部友链，并新增「十四幕 · 盛夏光影美术馆」策展数据与双模式电车车窗。
 */
window.BLOG_CONFIG = {
  siteName: "小羊的小小窝",
  siteNameEn: "POISONOUS SHEEP",
  issueTag: "VOL. 02 · SUMMER EXHIBITION ARCHIVE",
  coordinates: "游戏 + 学习 + 术力口 · 盛夏终电晴空线",
  author: "有毒的羊",
  avatar: "images/avatar.png",
  sealText: "羊",
  stationTag: "SUMMER LINE 01 · 游戏 + 学习 + 术力口！",
  subtitle: "这里是有毒的羊的小小窝——放着算法笔记、C++ 题解、第五人格与神秘春卷饭，也收着早年拿不拿的盛夏晴空、六张珍藏唱片与十四幕夏日画作。",
  verticalMotto: "夏末晴空、终电与透明的梦。",

  // 首页标志性「三连电车车窗」展示（保留 classic 参照）
  heroWindows: [
    {
      albumId: "curtain-call",
      no: "01",
      year: "2014",
      title: "カーテンコールが止む前に",
      label: "落幕之前 · 晴空云海",
      image: "images/album-curtain-call.jpg"
    },
    {
      albumId: "hana",
      no: "02",
      year: "2015",
      title: "花と水飴、最終電車",
      label: "花与水饴 · 终电花火",
      image: "images/album-hana.jpg",
      featured: true
    },
    {
      albumId: "tsuki",
      no: "03",
      year: "2016",
      title: "月を歩いている",
      label: "漫步于月 · 群青夏夜",
      image: "images/album-tsuki.jpg"
    }
  ],

  // 首页三连电车车窗双模式切换（「官方封面」<->「十四幕精选」）
  heroWindowModes: {
    official: {
      id: "official",
      label: "官方封面 · 2014–2016",
      badge: "n-buna 2014–2016",
      hint: "悬停放大 · 点击翻开歌词本",
      items: [
        {
          actionType: "album",
          targetId: "curtain-call",
          no: "01",
          year: "2014",
          title: "カーテンコールが止む前に",
          label: "落幕之前 · 晴空云海",
          image: "images/album-curtain-call.jpg"
        },
        {
          actionType: "album",
          targetId: "hana",
          no: "02",
          year: "2015",
          title: "花と水飴、最終電車",
          label: "花与水饴 · 终电花火",
          image: "images/album-hana.jpg",
          featured: true
        },
        {
          actionType: "album",
          targetId: "tsuki",
          no: "03",
          year: "2016",
          title: "月を歩いている",
          label: "漫步于月 · 群青夏夜",
          image: "images/album-tsuki.jpg"
        }
      ]
    },
    exhibition: {
      id: "exhibition",
      label: "十四幕精选 · P01 / P05 / P14",
      badge: "XIV EXHIBITION",
      hint: "悬停放大 · 点击直入暗房灯箱",
      items: [
        {
          actionType: "exhibition",
          targetId: "ex-p05",
          no: "P05",
          year: "昼青",
          title: "昼青",
          label: "昼青 · 绀屋鸦江",
          image: "images/exhibition/p05-hiruao.jpg"
        },
        {
          actionType: "exhibition",
          targetId: "ex-p01",
          no: "P01",
          year: "終電",
          title: "花と水飴、最終電車。",
          label: "花与水饴 · エリッサ",
          image: "images/exhibition/p01-hana-train.jpg",
          featured: true
        },
        {
          actionType: "exhibition",
          targetId: "ex-p14",
          no: "P14",
          year: "黎明",
          title: "夜明けと蛍",
          label: "黎明与萤火 · No.734",
          image: "images/exhibition/p14-yoake-no734.jpg"
        }
      ]
    }
  },

  // 四幕盛夏时刻策展章节
  exhibitionActs: {
    morning: {
      id: "morning",
      no: "ACT I",
      title: "朝露与昼青",
      titleEn: "Morning & Noon Azure",
      timeRange: "06:00 – 13:59",
      epigraph: "在阳光白得发亮的午后，一头扎进苏打色的夏空。",
      auraDay: "rgba(61, 154, 226, 0.16)",
      auraNight: "rgba(74, 146, 208, 0.22)"
    },
    dusk: {
      id: "dusk",
      no: "ACT II",
      title: "无人站与日暮",
      titleEn: "Unmanned Station & Dusk",
      timeRange: "14:00 – 18:59",
      epigraph: "蝉鸣渐弱的五点半，铁轨余温把影子拉得很长。",
      auraDay: "rgba(238, 130, 126, 0.17)",
      auraNight: "rgba(232, 142, 114, 0.20)"
    },
    "final-train": {
      id: "final-train",
      no: "ACT III",
      title: "透明哀歌与终电",
      titleEn: "Transparent Elegy & Final Train",
      timeRange: "19:00 – 23:59",
      epigraph: "错过最后一班电车之后，整座站台只剩清脆吉他声。",
      auraDay: "rgba(17, 65, 154, 0.16)",
      auraNight: "rgba(116, 168, 240, 0.22)"
    },
    predawn: {
      id: "predawn",
      no: "ACT IV",
      title: "黎明与萤火",
      titleEn: "Dawn & Fireflies",
      timeRange: "00:00 – 05:30",
      epigraph: "天际线刚刚透出一线淡青，萤火在草叶上安静呼吸。",
      auraDay: "rgba(74, 168, 125, 0.16)",
      auraNight: "rgba(229, 234, 141, 0.18)"
    }
  },

  // 「十四幕 · 盛夏光影美术馆」完整 14 幅策展清单（按清晨 -> 昼青 -> 日暮 -> 终电 -> 黎明串联）
  exhibition: [
    {
      id: "ex-p13",
      plateNo: "P13",
      act: "morning",
      actLabel: "ACT I · 朝露与昼青",
      timeStamp: "06:12 · 始発踏切",
      title: "morning",
      artist: "mmAir",
      sourceType: "pixiv",
      pixivId: "122244716",
      sourceUrl: "https://www.pixiv.net/artworks/122244716",
      sourceBadge: "Pixiv #122244716",
      sourceNote: "pixiv 名称：morning · 画师：mmAir · pixiv id=122244716",
      image: "images/exhibition/p13-morning.jpg",
      aspect: "landscape",
      width: 1800,
      height: 1012,
      palette: ["#5C6D9E", "#F0A8A8", "#1F2438"],
      aura: "rgba(240, 168, 168, 0.17)",
      linkedTrack: { albumId: "tsuki", title: "始発とカフカ" },
      caption: "天色刚被朝霞染透成柔粉色，铁路道口旁的少年剪影站在入道云与紫蓝晴空下，等待今天的第一班电车。"
    },
    {
      id: "ex-p05",
      plateNo: "P05",
      act: "morning",
      actLabel: "ACT I · 朝露与昼青",
      timeStamp: "11:20 · 海辺鳥居",
      title: "昼青",
      artist: "绀屋鸦江",
      sourceType: "pixiv",
      pixivId: "108576323",
      sourceUrl: "https://www.pixiv.net/artworks/108576323",
      sourceBadge: "Pixiv #108576323",
      sourceNote: "pixiv 名称：昼青 · 画师：绀屋鸦江 · pixiv id=108576323",
      image: "images/exhibition/p05-hiruao.jpg",
      aspect: "square",
      width: 1800,
      height: 1611,
      palette: ["#2A6EB5", "#56BEE6", "#EFF7FD"],
      aura: "rgba(86, 190, 230, 0.18)",
      linkedTrack: { albumId: "dakara", title: "藍二乗" },
      caption: "白昼最炽烈的蓝将天地洗得透明，海浪与海上鸟居在白裙裙摆旁舒展开来，连风都有冰镇苏打的温度。"
    },
    {
      id: "ex-p06",
      plateNo: "P06",
      act: "morning",
      actLabel: "ACT I · 朝露与昼青",
      timeStamp: "13:05 · 白昼眩光",
      title: "背景、夏に溺れる",
      artist: "白露/浅葱",
      sourceType: "pixiv",
      pixivId: "37946377",
      sourceUrl: "https://www.pixiv.net/artworks/37946377",
      sourceBadge: "Pixiv #37946377",
      sourceNote: "pixiv 名称：背景、夏に溺れる · 画师：白露/浅葱 · pixiv id=37946377",
      image: "images/exhibition/p06-haikei-natsu.jpg",
      aspect: "landscape",
      width: 1280,
      height: 720,
      palette: ["#F9E4A4", "#E97B4C", "#4A5965"],
      aura: "rgba(233, 123, 76, 0.17)",
      linkedTrack: { albumId: "curtain-call", title: "背景、夏に溺れる" },
      caption: "水彩泼洒出滚烫的蝉鸣与朱夏，白色鸟居、金鱼、向日葵与红伞一同融进一池晃眼的阳光里。"
    },
    {
      id: "ex-p04",
      plateNo: "P04",
      act: "morning",
      actLabel: "ACT I · 朝露与昼青",
      timeStamp: "13:45 · 水色云海",
      title: "ウミユリみりおん！",
      artist: "あわしま",
      sourceType: "pixiv",
      pixivId: "49470843",
      sourceUrl: "https://www.pixiv.net/artworks/49470843",
      sourceBadge: "Pixiv #49470843",
      sourceNote: "pixiv 名称：ウミユリみりおん！ · 画师：あわしま · pixiv id=49470843",
      image: "images/exhibition/p04-umiyuri.jpg",
      aspect: "landscape",
      width: 1800,
      height: 1012,
      palette: ["#FFFFFF", "#B7D0E4", "#243549"],
      aura: "rgba(142, 188, 224, 0.18)",
      linkedTrack: { albumId: "hana", title: "ウミユリ海底譚" },
      caption: "淡青水彩晕开成漫无边际的盛夏云海，掌心捧着的那颗小星星，正是「海百合海底谭」神话入殿的温柔纪念。"
    },
    {
      id: "ex-p02",
      plateNo: "P02",
      act: "dusk",
      actLabel: "ACT II · 无人站与日暮",
      timeStamp: "16:40 · 海岸月台",
      title: "「無人駅」PV 志",
      artist: "あわしま",
      sourceType: "pv",
      pixivId: "",
      sourceUrl: "",
      sourceBadge: "PV 志 · 可替换原图",
      sourceNote: "「無人駅」pv 截图 · 画师：あわしま（预留原图替换槽位：images/exhibition/p02-mujin-eki.svg）",
      image: "images/exhibition/p02-mujin-eki.svg",
      aspect: "landscape",
      width: 1200,
      height: 800,
      palette: ["#193A78", "#E79C8E", "#F7D59C"],
      aura: "rgba(231, 156, 142, 0.17)",
      linkedTrack: { albumId: "hana", title: "無人駅" },
      caption: "海边的无人小站被夕照渡成琥珀色，木椅空着，远处海面碎开一层细碎金箔，只剩风穿过架空电线。"
    },
    {
      id: "ex-p07",
      plateNo: "P07",
      act: "dusk",
      actLabel: "ACT II · 无人站与日暮",
      timeStamp: "17:28 · 夕暮朱空",
      title: "ヒグレギ",
      artist: "伊藤 戒",
      sourceType: "pixiv",
      pixivId: "59028492",
      sourceUrl: "https://www.pixiv.net/artworks/59028492",
      sourceBadge: "Pixiv #59028492",
      sourceNote: "pixiv 名称：ヒグレギ · 画师：伊藤 戒 · pixiv id=59028492",
      image: "images/exhibition/p07-higuregi.jpg",
      aspect: "landscape",
      width: 1280,
      height: 720,
      palette: ["#F59342", "#C9483B", "#2F223A"],
      aura: "rgba(232, 108, 72, 0.17)",
      linkedTrack: { albumId: "curtain-call", title: "ヒグレギ" },
      caption: "漫天绯红夕烧与游弋在暮色里的金鱼，赤足轻点水面时掀起的凉意，让整段黄昏都定格在水手服少女回眸的瞬间。"
    },
    {
      id: "ex-p03",
      plateNo: "P03",
      act: "dusk",
      actLabel: "ACT II · 无人站与日暮",
      timeStamp: "18:05 · 车窗纸鹤",
      title: "Illustration by トミサカ",
      artist: "トミサカ",
      sourceType: "illustration",
      pixivId: "",
      sourceUrl: "",
      sourceBadge: "トミサカ致敬画作",
      sourceNote: "Illustration by トミサカ（致敬《始発とカフカ》车窗美学 · 预留原图替换槽位：images/exhibition/p03-tomisaka.svg）",
      image: "images/exhibition/p03-tomisaka.svg",
      aspect: "portrait",
      width: 900,
      height: 1125,
      palette: ["#1E54B5", "#58A8EC", "#FAF6E8"],
      aura: "rgba(88, 168, 236, 0.17)",
      linkedTrack: { albumId: "tsuki", title: "始発とカフカ" },
      caption: "竖构图的电车窗框隔开了车厢与远空，几只折纸飞鸟贴着高架电线掠过入道云，仿佛把整首歌的清澈少年气装进玻璃框。"
    },
    {
      id: "ex-p12",
      plateNo: "P12",
      act: "dusk",
      actLabel: "ACT II · 无人站与日暮",
      timeStamp: "18:45 · 佚名胶片",
      title: "夏末佚名底片",
      artist: "忘了哪里扒的图（",
      sourceType: "mystery",
      pixivId: "",
      sourceUrl: "",
      sourceBadge: "LOST & FOUND",
      sourceNote: "忘了哪里扒的图（ — 如有缘找回画师署名，可直接覆盖替换 images/exhibition/p12-uncredited.svg",
      image: "images/exhibition/p12-uncredited.svg",
      aspect: "square",
      width: 900,
      height: 900,
      palette: ["#FBF8EE", "#1E5CB8", "#EE827E"],
      aura: "rgba(96, 178, 236, 0.16)",
      linkedTrack: { albumId: "curtain-call", title: "さよならワンダーノイズ" },
      caption: "失物招领处收着的一张 35mm 夏末底片，虽然一时想不起是从哪儿存下来的，但晴空、云影和那句括号吐槽一样让人会心一笑。"
    },
    {
      id: "ex-p08",
      plateNo: "P08",
      act: "final-train",
      actLabel: "ACT III · 透明哀歌与终电",
      timeStamp: "20:15 · 扩音回响",
      title: "透明エレジー",
      artist: "あわしま",
      sourceType: "pixiv",
      pixivId: "33700607",
      sourceUrl: "https://www.pixiv.net/artworks/33700607",
      sourceBadge: "Pixiv #33700607",
      sourceNote: "pixiv 名称：透明エレジー · 画师：あわしま · pixiv id=33700607",
      image: "images/exhibition/p08-toumei-elegy.jpg",
      aspect: "landscape",
      width: 1024,
      height: 576,
      palette: ["#FFFFFF", "#46C6EE", "#1F2233"],
      aura: "rgba(70, 198, 238, 0.16)",
      linkedTrack: { albumId: "curtain-call", title: "透明エレジー" },
      caption: "留白极深的白昼舞台上，扩音器、黑影与浅蓝色波纹圆环静止对峙，是早年 V 家时期最具辨识度的凌厉透明感。"
    },
    {
      id: "ex-p01",
      plateNo: "P01",
      act: "final-train",
      actLabel: "ACT III · 透明哀歌与终电",
      timeStamp: "22:50 · 终电花火",
      title: "花と水飴、最終電車。",
      artist: "エリッサ🐌",
      sourceType: "pixiv",
      pixivId: "73775341",
      sourceUrl: "https://www.pixiv.net/artworks/73775341",
      sourceBadge: "Pixiv #73775341",
      sourceNote: "pixiv 名称：花と水飴、最終電車。 · 画师：エリッサ🐌 · pixiv id=73775341",
      image: "images/exhibition/p01-hana-train.jpg",
      aspect: "landscape",
      width: 1800,
      height: 900,
      palette: ["#283E63", "#5F7EA6", "#E8B65A"],
      aura: "rgba(232, 182, 90, 0.16)",
      linkedTrack: { albumId: "hana", title: "花と水飴、最終電車" },
      caption: "墨绿绒布长椅上放着未送出的花束与红丝带，车窗外夜空正在盛放整片金红焰火——全展馆最切题的终电夜巡礼。"
    },
    {
      id: "ex-p11",
      plateNo: "P11",
      act: "final-train",
      actLabel: "ACT III · 透明哀歌与终电",
      timeStamp: "23:18 · 落日平交道",
      title: "再等不来的列车",
      artist: "Inosakura",
      sourceType: "pixiv",
      pixivId: "124841638",
      sourceUrl: "https://www.pixiv.net/artworks/124841638",
      sourceBadge: "Pixiv #124841638",
      sourceNote: "pixiv 名称：再等不来的列车 · 画师：Inosakura · pixiv id=124841638",
      image: "images/exhibition/p11-last-train.jpg",
      aspect: "landscape",
      width: 1800,
      height: 1200,
      palette: ["#F58B55", "#6D6B70", "#2D211E"],
      aura: "rgba(245, 139, 85, 0.17)",
      linkedTrack: { albumId: "hana", title: "もうじき夏が終わるから" },
      caption: "巨大到占据整片地平线的暖橘落日前，孤零零的长椅与平交道标牌剪影静立在海岸线上，仿佛再也等不来那一班车。"
    },
    {
      id: "ex-p10",
      plateNo: "P10",
      act: "final-train",
      actLabel: "ACT III · 透明哀歌与终电",
      timeStamp: "23:52 · 8/14 贺图志",
      title: "「メリュー」PV & 8·14 贺图志",
      artist: "あわしま / にし (@ness3_0427)",
      sourceType: "x",
      pixivId: "",
      sourceUrl: "https://x.com/ness3_0427",
      sourceBadge: "X @ness3_0427 ↗",
      sourceNote: "「メリュー」PV 截图（画师：あわしま）· 8/14 改为 X 画师 にし (@ness3_0427) 的贺图（可替换为本地原图）",
      image: "images/exhibition/p10-meryu.svg",
      aspect: "landscape",
      width: 1200,
      height: 800,
      palette: ["#0B1E48", "#F6E59F", "#D7E9FF"],
      aura: "rgba(246, 229, 159, 0.16)",
      linkedTrack: { albumId: "hana", title: "メリュー" },
      caption: "在街灯晕开的淡金色光锥下，雪球花随风飘散在群青夜空里——纪念あわしま的经典 PV 与 8/14 换上的 にし 贺图。"
    },
    {
      id: "ex-p09",
      plateNo: "P09",
      act: "predawn",
      actLabel: "ACT IV · 黎明与萤火",
      timeStamp: "04:08 · 浅滩微光",
      title: "夜明けと蛍",
      artist: "Halihlalco",
      sourceType: "pixiv",
      pixivId: "102145684",
      sourceUrl: "https://www.pixiv.net/artworks/102145684",
      sourceBadge: "Pixiv #102145684",
      sourceNote: "pixiv 名称：夜明けと蛍 · 画师：Halihlalco · pixiv id=102145684",
      image: "images/exhibition/p09-yoake-halihlalco.jpg",
      aspect: "landscape",
      width: 1800,
      height: 1137,
      palette: ["#5D85A8", "#F7AEC0", "#FBD87D"],
      aura: "rgba(247, 174, 192, 0.18)",
      linkedTrack: { albumId: "hana", title: "夜明けと蛍" },
      caption: "粉橘色朝霞与青蓝积雨云在海面交汇，天际还悬着一弯未落的残月，赤脚走进微凉潮水的背影把长夜交还给清晨。"
    },
    {
      id: "ex-p14",
      plateNo: "P14",
      act: "predawn",
      actLabel: "ACT IV · 黎明与萤火",
      timeStamp: "04:42 · 池畔吉他",
      title: "夜明けと蛍",
      artist: "No.734",
      sourceType: "pixiv",
      pixivId: "54468793",
      sourceUrl: "https://www.pixiv.net/artworks/54468793",
      sourceBadge: "Pixiv #54468793",
      sourceNote: "pixiv 名称：夜明けと蛍 · 画师：No.734 · pixiv id=54468793",
      image: "images/exhibition/p14-yoake-no734.jpg",
      aspect: "landscape",
      width: 1800,
      height: 1012,
      palette: ["#F7FAF2", "#58879E", "#D6DF74"],
      aura: "rgba(88, 135, 158, 0.18)",
      linkedTrack: { albumId: "hana", title: "夜明けと蛍" },
      caption: "淡米青瓷白砖铺就的泳池边，青蓝长发垂落地面，双脚浸在清凉水面轻轻拨响木吉他——无数人心里《夜明けと蛍》最纯粹的早晨。"
    }
  ],

  // 日系信纸诗句条（点击「换一张信签」可优雅切换）
  whispers: [
    { text: "「在落幕掌声停止之前，把没来得及说完的夏天再大声唱一遍。」", source: "カーテンコールが止む前に", stamp: "2014" },
    { text: "「三扇车窗之外，夏夜的烟火与融化的水饴一同沉入透明的群青。」", source: "花と水飴、最終電車", stamp: "终电" },
    { text: "「赤脚踩在月光与云影里往前走，连风都带着一点微凉的汽水味。」", source: "月を歩いている", stamp: "月夜" },
    { text: "「夏草长到没过脚踝，阳光白得晃眼，只想把这一整个晴空留给你。」", source: "夏草が邪魔をする / ただ君に晴れ", stamp: "盛夏" },
    { text: "「天快亮了，水面的萤火与木吉他泛音一起融进淡青色的清晨。」", source: "夜明けと蛍 · 十四幕影集", stamp: "黎明" }
  ],

  tracks: [
    {
      title: "夜明けと蛍",
      artist: "n-buna",
      album: "花と水飴、最終電車",
      lyric: "黎明将至，海风与萤火一同沉入群青。",
      audioUrl: ""
    }
  ],

  // 6 张完整实体封面专辑（3×2 对称画册展柜）
  albums: [
    {
      id: "curtain-call",
      no: "01",
      title: "カーテンコールが止む前に",
      titleZh: "在落幕掌声停止之前",
      artist: "n-buna",
      year: "2014.04.26",
      edition: "1st Indie Album",
      catalog: "NBNA-0001",
      mood: "晴空 · 车厢",
      accent: "#2B64B8",
      aura: "rgba(59, 130, 214, 0.16)",
      palette: ["#FBF9E8", "#2255A6", "#E8A2AE"],
      coverImage: "images/album-curtain-call.jpg",
      obiText: "窓の外、夏空へ飛ぶロケット。",
      note: "最纯粹的早期 V 家少年气。米黄色电车门内抱膝坐着的少女，窗外是白得发亮的入道云与冲向钴蓝晴空的火箭——这是整个拿不拿夏日青春宇宙最初的起点。",
      tracks: [
        { no: "01", title: "一人きり", titleZh: "独自一人", duration: "01:42", lyric: "空荡的车厢轻轻晃动，只听见铁轨接缝的清脆节奏。", audioUrl: "" },
        { no: "02", title: "透明エレジー", titleZh: "透明哀歌", duration: "03:37", lyric: "如果连悲伤都能变成透明的，是不是就不会这么重了。", audioUrl: "" },
        { no: "03", title: "背景、夏に溺れる", titleZh: "背景，溺于夏中", duration: "04:19", lyric: "蝉鸣铺满整片天空，整个人像是溺进了一池白花花的阳光里。", audioUrl: "" },
        { no: "04", title: "ウミユリ海底譚", titleZh: "海百合海底谭", duration: "03:54", lyric: "抬头望向车窗外的云海，仿佛随时可以跃入夏空。", audioUrl: "" },
        { no: "05", title: "さよならワンダーノイズ", titleZh: "再见奇妙杂音", duration: "04:11", lyric: "在掌声彻底落下之前，用力记住这阵清脆的吉他杂音。", audioUrl: "" },
        { no: "06", title: "ヒグレギ", titleZh: "日暮木", duration: "04:08", lyric: "暮色沿着树梢慢慢沉下来，夏天的轮廓变得发烫又透明。", audioUrl: "" }
      ]
    },
    {
      id: "hana",
      no: "02",
      title: "花と水飴、最終電車",
      titleZh: "花与水饴、最终电车",
      artist: "n-buna",
      year: "2015.07.22",
      edition: "1st Major Album",
      catalog: "DGUR-10005",
      mood: "花火 · 终电",
      accent: "#1C3B82",
      aura: "rgba(232, 130, 126, 0.16)",
      palette: ["#FAF8EF", "#142657", "#E57F78"],
      coverImage: "images/album-hana.jpg",
      obiText: "最終電車、夏の記憶を連れて。",
      note: "草帽、珊瑚红长裙、三扇映出夏夜花火的电车车窗，以及写在钴蓝细线上的歌名。整张专辑像把盛夏倒进玻璃瓶里摇晃出的声音，清澈又微微发酸。",
      tracks: [
        { no: "01", title: "もうじき夏が終わるから", titleZh: "因为夏天很快就要结束了", duration: "02:34", lyric: "在季节彻底转身之前，连呼吸都像在追赶那一班车。", audioUrl: "" },
        { no: "02", title: "ウミユリ海底譚", titleZh: "海百合海底谭", duration: "03:54", lyric: "即便沉入海底，也要向着透光的水面伸出手。", audioUrl: "" },
        { no: "03", title: "夜明けと蛍", titleZh: "黎明与萤火", duration: "05:08", lyric: "黎明将至，海风与萤火一同沉入群青。", audioUrl: "" },
        { no: "04", title: "メリュー", titleZh: "Meryu", duration: "03:49", lyric: "街灯熄灭的瞬间，所有没寄出的信都在风里醒来。", audioUrl: "" },
        { no: "05", title: "アイラ", titleZh: "Aira", duration: "04:01", lyric: "越是想留住某个夏天的轮廓，它越像水饴般在掌心化开。", audioUrl: "" },
        { no: "06", title: "花と水飴、最終電車", titleZh: "花与水饴、最终电车", duration: "04:42", lyric: "站在无人月台尽头，目送最后一束车灯融进夜色。", audioUrl: "" },
        { no: "07", title: "無人駅", titleZh: "无人车站", duration: "03:44", lyric: "蝉鸣停驻在锈色铁轨尽头，下一班车仍未抵达。", audioUrl: "" }
      ]
    },
    {
      id: "tsuki",
      no: "03",
      title: "月を歩いている",
      titleZh: "漫步于月",
      artist: "n-buna",
      year: "2016.07.06",
      edition: "2nd Major Album",
      catalog: "DUED-1174",
      mood: "群青 · 童话",
      accent: "#0D3594",
      aura: "rgba(13, 53, 148, 0.18)",
      palette: ["#082C86", "#FAF5DE", "#9BB4DF"],
      coverImage: "images/album-tsuki.jpg",
      obiText: "月の夜、童話の頁をめくる。",
      note: "整片极致纯粹的钴蓝群青底色，赤脚迈步的剪影里藏着浮云与晴空。把古老童话拆碎再重写，在微凉月色下寄出一封少年书信。",
      tracks: [
        { no: "01", title: "始発とカフカ", titleZh: "始发车与卡夫卡", duration: "04:31", lyric: "坐上天亮前的第一班电车，往故事还没有结局的地方去。", audioUrl: "" },
        { no: "02", title: "ラプンツェル", titleZh: "长发公主", duration: "03:42", lyric: "高塔之外的夏夜很安静，只有蝉声和月亮落进窗台。", audioUrl: "" },
        { no: "03", title: "白ゆき", titleZh: "白雪", duration: "04:05", lyric: "明明在听夏天的吉他，却像看见一场不会融化的雪。", audioUrl: "" },
        { no: "04", title: "花降らし", titleZh: "花雨", duration: "03:58", lyric: "雨点落在屋檐与花瓣上，把来不及说的话全都冲淡了。", audioUrl: "" }
      ]
    },
    {
      id: "natsukusa",
      no: "04",
      title: "夏草が邪魔をする",
      titleZh: "夏草阻碍了我",
      artist: "ヨルシカ",
      year: "2017.06.28",
      edition: "1st Mini Album",
      catalog: "DUED-1223",
      mood: "花束 · 疾走",
      accent: "#4AA87D",
      aura: "rgba(74, 168, 125, 0.17)",
      palette: ["#F6F8F9", "#55A67B", "#F2CA52"],
      coverImage: "images/album-natsukusa.jpg",
      obiText: "夏草をかき分け、あの日の駅へ。",
      note: "过曝白雾里的百合、向日葵与水手服领口——夜鹿最初的声音。干净利落的吉他扫弦和略带钝痛的清透人声撞在一起，像顶着盛夏烈日奔跑的放学路。",
      tracks: [
        { no: "01", title: "夏陰、ピアノを弾く", titleZh: "夏阴，弹奏钢琴", duration: "01:34", lyric: "午后树荫下的旧钢琴，轻轻敲开一整个夏天的序章。", audioUrl: "" },
        { no: "02", title: "カトレア", titleZh: "卡特兰", duration: "03:08", lyric: "连呼吸都带着一点灼热的青春疾走感。", audioUrl: "" },
        { no: "03", title: "言って。", titleZh: "说吧。", duration: "04:02", lyric: "云层之后，连再见都来不及说出口的夏天。", audioUrl: "" },
        { no: "04", title: "あの夏に咲け", titleZh: "绽放于那个夏天", duration: "04:18", lyric: "就算记忆会褪色，也想在那个夏天尽情盛开一次。", audioUrl: "" },
        { no: "05", title: "靴の花火", titleZh: "鞋底的花火", duration: "05:03", lyric: "抬头看见夜空绽放的时候，心里某块地方也跟着安静下来。", audioUrl: "" }
      ]
    },
    {
      id: "makeinu",
      no: "05",
      title: "負け犬にアンコールはいらない",
      titleZh: "败犬不需要安可",
      artist: "ヨルシカ",
      year: "2018.05.09",
      edition: "2nd Mini Album",
      catalog: "DUED-1242",
      mood: "晴空 · 蝉鸣",
      accent: "#A8663B",
      aura: "rgba(186, 120, 74, 0.16)",
      palette: ["#0E182B", "#A8663B", "#EAE8E4"],
      coverImage: "images/album-makeinu.jpg",
      obiText: "ただ君に晴れ、夏の記憶を。",
      note: "瞳孔深处凝视着夏天的文字。刺眼的白昼阳光、拍手声、海岸护栏和没写完的草稿——哪怕自嘲是落败者，抬头望向的那片晴空依然亮得让人动容。",
      tracks: [
        { no: "01", title: "準透明少年", titleZh: "准透明少年", duration: "04:41", lyric: "既不想彻底消失，又还没学会怎样和喧闹的世界相处。", audioUrl: "" },
        { no: "02", title: "ただ君に晴れ", titleZh: "只予你晴空", duration: "03:18", lyric: "夏草没过脚踝，只愿将晴空留给你。", audioUrl: "" },
        { no: "03", title: "ヒッチコック", titleZh: "希区柯克", duration: "03:42", lyric: "老师，比起考试的答案，我更想知道为什么天空这么蓝。", audioUrl: "" },
        { no: "04", title: "落下", titleZh: "落下", duration: "01:14", lyric: "海风吹过指尖的间隙，时间突然慢了下来。", audioUrl: "" },
        { no: "05", title: "冬眠", titleZh: "冬眠", duration: "05:01", lyric: "把漫长的夏天折好收进枕头底下，等待下一个春天。", audioUrl: "" }
      ]
    },
    {
      id: "dakara",
      no: "06",
      title: "だから僕は音楽を辞めた",
      titleZh: "所以我放弃了音乐",
      artist: "ヨルシカ",
      year: "2019.04.10",
      edition: "1st Full Album",
      catalog: "DUED-1266",
      mood: "午后 · 书信",
      accent: "#C96A42",
      aura: "rgba(201, 106, 66, 0.17)",
      palette: ["#F2DEC6", "#C96A42", "#2D3947"],
      coverImage: "images/album-dakara.jpg",
      obiText: "エルマへ、あの八月の手紙。",
      note: "斯德哥尔摩老城鹅卵石小巷里的暖橘色阳光，以及被白色粉笔涂抹掉面容的艾米。这是写给艾尔玛、也写给青春告别的最后一批炽热书信。",
      tracks: [
        { no: "01", title: "藍二乗", titleZh: "蓝二乘", duration: "04:05", lyric: "把连绵不绝的夏日忧郁，全部染成加倍浓烈的透明靛蓝。", audioUrl: "" },
        { no: "02", title: "八月、某、月明かり", titleZh: "八月、某地、月明", duration: "04:36", lyric: "如果能抛下所有顾虑坐上列车，至少今夜的月光属于我们。", audioUrl: "" },
        { no: "03", title: "パレード", titleZh: "游行", duration: "04:59", lyric: "记忆像安静经过长街的游行队伍，挥手时已走到夏天尽头。", audioUrl: "" },
        { no: "04", title: "エルマ", titleZh: "Elma", duration: "03:39", lyric: "你的背影让整条街道都亮了起来。", audioUrl: "" },
        { no: "05", title: "だから僕は音楽を辞めた", titleZh: "所以我放弃了音乐", duration: "04:02", lyric: "就算嘴上说着放弃，钢琴和吉他还是诚实地记住了你的夏天。", audioUrl: "" }
      ]
    }
  ],

  // 官方实体封面 & 原创站台画作典藏（8 张）
  gallery: [
    {
      id: "plate-01",
      no: "COVER 01",
      title: "カーテンコールが止む前に",
      caption: "米白色电车门外翻涌的入道云，与直冲钴蓝晴空的白色火箭。",
      image: "images/album-curtain-call.jpg",
      film: "JACKET · 2014",
      meta: "15:10 · 盛夏车厢",
      palette: ["#FBF9E8", "#2255A6", "#E8A2AE"],
      aura: "rgba(59, 130, 214, 0.16)",
      linkedTrack: { albumId: "curtain-call", title: "背景、夏に溺れる" },
      span: "square"
    },
    {
      id: "plate-02",
      no: "COVER 02",
      title: "花と水飴、最終電車",
      caption: "三扇深蓝车窗外的夏夜烟火，与靠着扶手静静仰望的少女。",
      image: "images/album-hana.jpg",
      film: "JACKET · 2015",
      meta: "23:45 · 终电花火",
      palette: ["#FAF8EF", "#142657", "#E57F78"],
      aura: "rgba(232, 130, 126, 0.16)",
      linkedTrack: { albumId: "hana", title: "花と水飴、最終電車" },
      span: "square"
    },
    {
      id: "plate-03",
      no: "ORIGINAL 01",
      title: "五点半的临海无人站",
      caption: "列车进站之前，只有风吹过铁轨、木椅与远处亮得发光的海面。",
      image: "images/hero-summer-station.svg",
      film: "35MM · PORTRA 400",
      meta: "17:30 · 晴 · 入道云",
      palette: ["#2A64B8", "#C8E6FB", "#F4EAD2"],
      aura: "rgba(61, 154, 226, 0.16)",
      linkedTrack: { albumId: "hana", title: "無人駅" },
      span: "wide"
    },
    {
      id: "plate-04",
      no: "COVER 03",
      title: "月を歩いている",
      caption: "深邃纯粹的钴蓝夜色，与迈向月亮和流云的赤脚剪影。",
      image: "images/album-tsuki.jpg",
      film: "JACKET · 2016",
      meta: "22:30 · 群青月夜",
      palette: ["#082C86", "#FAF5DE", "#9BB4DF"],
      aura: "rgba(13, 53, 148, 0.18)",
      linkedTrack: { albumId: "tsuki", title: "始発とカフカ" },
      span: "square"
    },
    {
      id: "plate-05",
      no: "COVER 04",
      title: "夏草が邪魔をする",
      caption: "柔和过曝白光下的百合与向日葵，像是盛夏午后一捧晃眼的青春。",
      image: "images/album-natsukusa.jpg",
      film: "JACKET · 2017",
      meta: "14:20 · 盛夏花束",
      palette: ["#F6F8F9", "#55A67B", "#F2CA52"],
      aura: "rgba(74, 168, 125, 0.17)",
      linkedTrack: { albumId: "natsukusa", title: "言って。" },
      span: "square"
    },
    {
      id: "plate-06",
      no: "COVER 05",
      title: "負け犬にアンコールはいらない",
      caption: "琥珀色瞳孔里映出的安静文字，凝视着漫长又刺眼的夏天。",
      image: "images/album-makeinu.jpg",
      film: "JACKET · 2018",
      meta: "16:15 · 晴空凝视",
      palette: ["#0E182B", "#A8663B", "#EAE8E4"],
      aura: "rgba(186, 120, 74, 0.16)",
      linkedTrack: { albumId: "makeinu", title: "ただ君に晴れ" },
      span: "square"
    },
    {
      id: "plate-07",
      no: "COVER 06",
      title: "だから僕は音楽を辞めた",
      caption: "鹅卵石老街尽头的暖橘夕照，写满八月与告别的长信。",
      image: "images/album-dakara.jpg",
      film: "JACKET · 2019",
      meta: "17:55 · 老街夕照",
      palette: ["#F2DEC6", "#C96A42", "#2D3947"],
      aura: "rgba(201, 106, 66, 0.17)",
      linkedTrack: { albumId: "dakara", title: "だから僕は音楽を辞めた" },
      span: "square"
    },
    {
      id: "plate-08",
      no: "ORIGINAL 02",
      title: "凌晨四点的黎明与萤火",
      caption: "天际线刚刚透出一线淡青，几星萤火在草叶上安静地呼吸。",
      image: "images/gallery-dawn-fireflies.svg",
      film: "35MM · PRE-DAWN",
      meta: "04:12 · 黎明前",
      palette: ["#0B1B40", "#5C9ED9", "#E5EA8D"],
      aura: "rgba(229, 234, 141, 0.16)",
      linkedTrack: { albumId: "hana", title: "夜明けと蛍" },
      span: "wide"
    }
  ],

  // 「关于」页面（100% 还原并承接原站真实介绍与链接）
  about: {
    heading: "关于有毒的羊",
    lead: "你好！这里是 有毒的羊 的小小窝 🐑",
    paragraphs: [
      "主攻方向是「游戏 + 学习 + 术力口！」——平时会在这里记下自己刷洛谷、学算法竞赛和写 C++ 时整理出来的模板与思路，也会顺手记录一些日常碎碎念。",
      "超级喜欢早年 n-buna（拿不拿 / V 家时期）与早期 Yorushika 那种充满夏日青春透明感的美学，所以给小窝换上了「三连电车车窗 × 十四幕光影美术馆」这套夏日企划皮肤。",
      "偶尔也会放点神秘春卷饭、聊聊重音 Teto 🥖，或者直接喊一句：第五人格启动！"
    ],
    nowBoard: [
      { tag: "STUDY", label: "学习", value: "算法竞赛 / C++ / 数据结构与图论" },
      { tag: "GAME", label: "游戏", value: "第五人格启动！" },
      { tag: "VOCALOID", label: "术力口", value: "n-buna（拿不拿）/ 春卷饭 / 重音 Teto 推 🥖" },
      { tag: "EASTER EGG", label: "神秘彩蛋", value: "这里藏着一份神秘春卷饭 🌯" }
    ],
    colophonColors: [
      { name: "车厢米白", hex: "#FBFAF4", role: "盛夏画纸底" },
      { name: "月夜钴蓝", hex: "#11419A", role: "主标题与细线" },
      { name: "透明苏打", hex: "#3D9AE2", role: "夏空晴蓝渐层" },
      { name: "樱粉裙摆", hex: "#EE827E", role: "印章与黄昏点缀" },
      { name: "夏草花绿", hex: "#4AA87D", role: "盛夏生机点缀" },
      { name: "终电群青", hex: "#09183B", role: "入夜车窗夜空" }
    ],
    links: [
      { label: "Bilibili", url: "https://space.bilibili.com/344309611" },
      { label: "QQ 空间", url: "https://user.qzone.qq.com/3533382348/main" },
      { label: "GitHub", url: "https://github.com/poisonous-sheep" }
    ]
  },

  // 友情链接（保留原站洛谷与 GitHub 友链，并包含 mohao 与同好邻站）
  friendLinks: [
    {
      name: "洛谷 Luogu",
      desc: "计算机科学教育新生态，刷算法题与模板题的主站台。",
      url: "https://www.luogu.com.cn",
      avatar: "https://www.luogu.com.cn/favicon.ico",
      monogram: "洛",
      tag: "算法刷题",
      group: "学习站台"
    },
    {
      name: "GitHub",
      desc: "全球最大的开源代码托管平台，本站的静态源码也停靠在这里。",
      url: "https://github.com",
      avatar: "https://github.githubassets.com/favicons/favicon.svg",
      monogram: "GH",
      tag: "开源仓库",
      group: "学习站台"
    },
    {
      name: "mohao",
      desc: "mohao宝宝",
      url: "https://blog.mohao.me/",
      avatar: "https://blog.mohao.me/avatar.png",
      monogram: "M",
      tag: "友邻",
      group: "音乐与同好"
    },
    {
      name: "OI Wiki",
      desc: "开源信息学竞赛知识库，数据结构、图论与动态规划随查手册。",
      url: "https://oi-wiki.org",
      avatar: "https://oi-wiki.org/favicon.ico",
      monogram: "OI",
      tag: "竞赛百科",
      group: "学习站台"
    },
    {
      name: "ヨルシカ Official",
      desc: "n-buna 与 suis 的官方主页，文学、书信与透明感夏日的灵感源头。",
      url: "https://yorushika.com",
      avatar: "images/album-hana.jpg",
      monogram: "夜",
      tag: "音乐灵感",
      group: "音乐与同好"
    }
  ],

  // 申请交换友链时展示的「本站名片」
  siteLinkCard: {
    name: "小羊的小小窝",
    author: "有毒的羊",
    url: "https://poisonous-sheep.github.io/",
    avatar: "https://poisonous-sheep.github.io/images/avatar.png",
    desc: "游戏 + 学习 + 术力口！盛夏晴空、拿不拿十四幕影集与算法笔记。",
    issueUrl: "https://github.com/poisonous-sheep/poisonous-sheep.github.io/issues/new?title=申请交换友链&body=站点名称：%0A站点链接：%0A一句话简介：%0A头像链接："
  }
};
