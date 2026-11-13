(() => {
  "use strict";

  const CFG = Object.assign(
    {
      platformId: "jee",
      brandName: "JEETube",
      brandSymbol: "∑",
      tagline: "IIT-JEE · State CETs · BITSAT",
      storagePrefix: "jeetube",
      searchPlaceholder:
        "Type or 🎤 speak: Samakalan, Bijli, Ch 1, Om Sharma…",
      quickProblems: [],
      subjectMeta: {},
      acronyms: {},
      ecosystem: [],
    },
    window.TUBE_CONFIG || {}
  );

  // Align UPBoard shifted chapter acronym indices (17..48) to actual syllabus chapter_no
  if (CFG.platformId === "upboard") {
    CFG.acronyms = {
      1: "sambandh phalan relations functions",
      3: "aavyuh matrices",
      4: "sarnik determinants",
      5: "avkalan continuity differentiability",
      7: "samakalan integration",
      11: "coulomb gauss vidyut aavesh",
      13: "vidyut dhara ohm kirchhoff",
      17: "kiran prakashiki ray optics",
      19: "dwait prakriti parmanu dual nature atoms",
      21: "vilayan solutions",
      22: "vaidyut rasayan electrochemistry",
      23: "rasayanik balgatiki chemical kinetics",
      37: "hindi vyakaran ras chhand alankar nibandh",
      39: "vastavik sankhya bahupad real numbers polynomials",
      40: "dwighat samikaran quadratic",
      42: "trikonmiti trigonometry",
      44: "rasayanik abhikriya aml kshar dhatu chemical reactions",
      45: "jaiv prakram life processes prakash paravartan apvartan light",
      47: "hindi vyakaran ras chhand alankar nibandh",
      48: "english first flight footprints grammar",
    };
  }

  const PEDAGOGY = Object.assign(
    { synonyms: [], chapters: {} },
    window.TUBE_PEDAGOGY || {}
  );

  const BASE_TITLE = document.title;
  const SAVED_KEY = `${CFG.storagePrefix}_saved_v2`;
  const DONE_KEY = `${CFG.storagePrefix}_done_v2`;
  const DONE_VIDEOS_KEY = `${CFG.storagePrefix}_done_videos_v4`;
  const ROLE_KEY = `${CFG.storagePrefix}_role_v4`;
  const LAST_LECTURE_KEY = `${CFG.storagePrefix}_last_lecture_v5`;
  const STREAK_KEY = `${CFG.storagePrefix}_streak_v5`;
  const SELF_CHECK_KEY = `${CFG.storagePrefix}_selfcheck_v5`;
  const NOTES_KEY = `${CFG.storagePrefix}_notes_v5`;
  const HW_PACK_KEY = `${CFG.storagePrefix}_hw_pack_v5`;
  const CARDS_PER_CHAPTER_COLLAPSED = 4;
  const FLAT_PAGE_SIZE = 48;

  const COMPASS_LANG_ORDER = [
    "Hinglish",
    "Hindi",
    "Hindi Medium",
    "Hindi / Hinglish",
    "English",
    "Tamil",
    "Telugu",
    "Marathi",
    "Bengali",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Odia",
    "Punjabi",
    "Assamese",
  ];

  const LANGUAGE_META = {
    Hinglish: {
      pill: "Hinglish",
      badge: "Hinglish",
      option: "Hinglish (Hindi + Eng)",
      aliases: "hinglish hindi english mix",
      regional: false,
      speech: "hi-IN",
    },
    English: {
      pill: "English",
      badge: "English",
      option: "English Medium",
      aliases: "english medium pure english",
      regional: false,
      speech: "en-IN",
    },
    Hindi: {
      pill: "हिंदी",
      badge: "हिंदी · Hindi",
      option: "हिंदी · Hindi",
      aliases: "hindi medium हिंदी माध्यम हिन्दी bseb upmsp rbse mp board",
      regional: true,
      speech: "hi-IN",
    },
    "Hindi Medium": {
      pill: "हिंदी",
      badge: "हिंदी · Hindi",
      option: "हिंदी माध्यम · Hindi Medium",
      aliases: "hindi medium हिंदी माध्यम हिन्दी up board upmsp",
      regional: true,
      speech: "hi-IN",
    },
    "Hindi / Hinglish": {
      pill: "हिंदी · Hinglish",
      badge: "हिंदी · Hinglish",
      option: "हिंदी · Hindi / Hinglish",
      aliases: "hindi hinglish हिंदी माध्यम हिन्दी",
      regional: true,
      speech: "hi-IN",
    },
    Tamil: {
      pill: "தமிழ்",
      badge: "தமிழ் · Tamil",
      option: "தமிழ் · Tamil",
      aliases: "tamil தமிழ் tn state board tamilnadu",
      regional: true,
      speech: "ta-IN",
    },
    Telugu: {
      pill: "తెలుగు",
      badge: "తెలుగు · Telugu",
      option: "తెలుగు · Telugu",
      aliases: "telugu తెలుగు ap ts eapcet eamcet ipe andhra telangana",
      regional: true,
      speech: "te-IN",
    },
    Marathi: {
      pill: "मराठी",
      badge: "मराठी · Marathi",
      option: "मराठी · Marathi",
      aliases: "marathi मराठी maharashtra mht cet mhtcet hsc ssc",
      regional: true,
      speech: "mr-IN",
    },
    Bengali: {
      pill: "বাংলা",
      badge: "বাংলা · Bengali",
      option: "বাংলা · Bengali",
      aliases: "bengali bangla বাংলা wbjee wbchse madhyamik west bengal",
      regional: true,
      speech: "bn-IN",
    },
    Gujarati: {
      pill: "ગુજરાતી",
      badge: "ગુજરાતી · Gujarati",
      option: "ગુજરાતી · Gujarati",
      aliases: "gujarati ગુજરાતી gujcet gseb gujarat",
      regional: true,
      speech: "gu-IN",
    },
    Kannada: {
      pill: "ಕನ್ನಡ",
      badge: "ಕನ್ನಡ · Kannada",
      option: "ಕನ್ನಡ · Kannada",
      aliases: "kannada ಕನ್ನಡ karnataka kcet puc",
      regional: true,
      speech: "kn-IN",
    },
    Malayalam: {
      pill: "മലയാളം",
      badge: "മലയാളം · Malayalam",
      option: "മലയാളം · Malayalam",
      aliases: "malayalam മലയാളം kerala keam plus two sslc",
      regional: true,
      speech: "ml-IN",
    },
    Odia: {
      pill: "ଓଡ଼ିଆ",
      badge: "ଓଡ଼ିଆ · Odia",
      option: "ଓଡ଼ିଆ · Odia",
      aliases: "odia oriya ଓଡ଼ିଆ ojee chse odisha",
      regional: true,
      speech: "or-IN",
    },
    Punjabi: {
      pill: "ਪੰਜਾਬੀ",
      badge: "ਪੰਜਾਬੀ · Punjabi",
      option: "ਪੰਜਾਬੀ · Punjabi",
      aliases: "punjabi ਪੰਜਾਬੀ pseb punjab",
      regional: true,
      speech: "pa-IN",
    },
    Assamese: {
      pill: "অসমীয়া",
      badge: "অসমীয়া · Assamese",
      option: "অসমীয়া · Assamese",
      aliases: "assamese অসমীয়া ahsec seba assam",
      regional: true,
      speech: "en-IN",
    },
  };

  const STUDENT_SITUATIONS = [
    {
      key: "zero_to_hero",
      title: "🌱 Start From Zero (Basic to Full)",
      desc: "I missed classes or didn't understand this chapter. Teach me from scratch.",
    },
    {
      key: "exam_tomorrow",
      title: "⚡ Exam Tomorrow (1-Shot Revision)",
      desc: "Give me the best complete chapter revision in 1 video.",
    },
    {
      key: "solve_pyqs",
      title: "🎯 Solve Exam Questions (PYQs)",
      desc: "I know the theory, show me how to solve past exam questions.",
    },
    {
      key: "easy_scoring",
      title: "🏆 Easy High-Scoring Chapters First",
      desc: "Show me the chapters that give the most marks with the least effort.",
    },
  ];

  function getLangMeta(lang) {
    const key = String(lang || "").trim();
    return (
      LANGUAGE_META[key] || {
        pill: key || "Hinglish",
        badge: key || "Hinglish",
        option: key || "Hinglish",
        aliases: key.toLowerCase(),
        regional: false,
        speech: "en-IN",
      }
    );
  }

  // Studio v5.0: authoritative pedagogy.js (v5.0) with optional legacy fallback layer
  let cachedSynonyms = null;
  const chapterPedCache = new Map();

  function getPedagogyLayers() {
    const current = window.TUBE_PEDAGOGY || PEDAGOGY || {};
    const legacy = window.TUBE_PEDAGOGY_LEGACY;
    return legacy && legacy !== current ? [legacy, current] : [current];
  }

  function getMergedSynonyms() {
    if (cachedSynonyms) return cachedSynonyms;
    const layers = getPedagogyLayers();
    if (layers.length === 1 && Array.isArray(layers[0].synonyms)) {
      cachedSynonyms = layers[0].synonyms;
      return cachedSynonyms;
    }
    const out = [];
    const seen = new Set();
    for (const layer of layers) {
      if (!Array.isArray(layer.synonyms)) continue;
      for (const rule of layer.synonyms) {
        const sig = JSON.stringify(rule?.triggers || []);
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push(rule);
      }
    }
    cachedSynonyms = out;
    return out;
  }

  function getChapterPedagogy(chNo) {
    const numKey = Number(chNo) || 0;
    if (chapterPedCache.has(numKey)) {
      return chapterPedCache.get(numKey);
    }
    const entry = {};
    for (const layer of getPedagogyLayers()) {
      const platMap = (layer.chapters || {})[CFG.platformId] || {};
      const e = platMap[String(numKey)] || platMap[numKey];
      if (e && typeof e === "object") Object.assign(entry, e);
    }
    const chMeta = state?.syllabusByNo?.get(numKey);
    const chTitle = chMeta?.chapter || `Chapter ${String(numKey).padStart(2, "0")}`;
    const chPrefix = CFG.platformId === "olympiad" ? "Mod" : "Ch";

    const rawMustKnow =
      entry.must_know || entry.mustKnow || entry.concepts || entry.formulas;
    const mustKnow =
      Array.isArray(rawMustKnow) && rawMustKnow.length
        ? rawMustKnow.map(String)
        : [
            `Core definitions, standard forms & sign conventions in ${chTitle}`,
            `High-yield theorems, boundary conditions & standard results for ${chTitle}`,
            `Multi-concept problem patterns & elimination checks on ${chTitle}`,
          ];

    const rawChecks =
      entry.check || entry.checks || entry.self_check || entry.selfCheck;
    const checkItems =
      Array.isArray(rawChecks) && rawChecks.length
        ? rawChecks.map(String)
        : [
            `I can recall and apply the core formulas & definitions of ${chTitle} without hints.`,
            `I have solved standard & previous-year exam questions on ${chTitle} accurately.`,
            `I can spot and avoid the #1 exam trap & sign/unit mistakes in ${chTitle}.`,
          ];

    const result = {
      hi: entry.hi || "",
      ref: entry.ref || `${chPrefix} ${String(numKey).padStart(2, "0")}`,
      roi: entry.roi || "core_high",
      prereq: Number(entry.prereq) || 0,
      tip:
        entry.tip ||
        "Start with Step 1 for foundational clarity, then revise and practice exam questions.",
      sub_idx: Number(entry.sub_idx) || numKey || 1,
      est_hours:
        Number(entry.est_hours ?? entry.estHours ?? entry.hours) || 6,
      must_know: mustKnow,
      trap:
        entry.trap ||
        entry.exam_trap ||
        entry.examTrap ||
        `Verify domain restrictions, sign conventions, and SI units before final substitution in ${chTitle}.`,
      check: checkItems,
    };
    if (state?.syllabusByNo?.size > 0) {
      chapterPedCache.set(numKey, result);
    }
    return result;
  }

  function getRoiMeta(roi) {
    if (roi === "easy_high") {
      return {
        label: "🟢 Easy Scoring Chapter · 🎯 High Weightage",
        shortTag: "🟢 Easy Scoring",
        cls: "is-easy",
        rank: 4,
        isEasy: true,
      };
    }
    if (roi === "quick_marks") {
      return {
        label: "🟢 Easy Scoring Chapter",
        shortTag: "🟢 Easy Marks",
        cls: "is-easy",
        rank: 3,
        isEasy: true,
      };
    }
    if (roi === "practice_heavy") {
      return {
        label: "🔴 High Practice Required · 🎯 High Weightage",
        shortTag: "🔴 High Practice",
        cls: "is-heavy",
        rank: 1,
        isEasy: false,
      };
    }
    return {
      label: "🎯 High Weightage Chapter",
      shortTag: "🎯 High Weightage",
      cls: "is-core",
      rank: 2,
      isEasy: false,
    };
  }

  function classifyTeachingVibe(v) {
    const title = String(v.title || "");
    const titleFmt = `${title} ${v.format || ""}`;
    const sec = Number(v.duration_sec) || 0;
    const lessons = Number(v.lesson_count) || 0;
    const isPlaylist =
      v.provider === "playlist" || v.format === "Full Course" || lessons >= 3;
    const isExplicitOneShot =
      /\bone\s*-?\s*shot\b|\b1\s*-?\s*shot\b|complete\s+chapter\s+in\s+one|full\s+chapter\s+in\s+1/i.test(
        title
      );

    if (
      isPlaylist ||
      (!isExplicitOneShot &&
        /zero\s+to\s+hero|basic\s+to\s+(?:advanced|full|pro)|from\s+zero|from\s+scratch|full\s+playlist|complete\s+playlist|complete\s+course|foundation\s+course|\blecture\s*0?1\b|\blec\s*0?1\b/i.test(
          titleFmt
        ))
    ) {
      return {
        key: "beginner",
        cls: "is-beginner",
        label: "🌱 Beginner Friendly (Zero to Hero)",
      };
    }

    if (
      !isExplicitOneShot &&
      (v.format === "PYQ & Mock" ||
        /\bpyqs?\b|previous\s+year|numericals?|question\s+bank|top\s+\d+\s+questions|most\s+expected\s+questions|sample\s+paper|model\s+paper|paper\s+solution|walkthrough|mock\s+test|olympiad\s+problems|problem\s+solving|\bimo\s+problem\b|\bolympiad\s+problem\b/i.test(
          titleFmt
        ))
    ) {
      return {
        key: "pyq",
        cls: "is-pyq",
        label: "📝 Past Year Questions (PYQs)",
      };
    }

    if (
      (sec > 0 && sec <= 3600) ||
      /formula\s+(?:sheet|revision|marathon|recap)|all\s+formulas|mind\s*-?\s*map|short\s+notes|cheat\s+sheet|quick\s+recap|in\s+(?:15|20|30|40|45|50)\s*min/i.test(
        titleFmt
      )
    ) {
      return {
        key: "recap",
        cls: "is-recap",
        label: "🚀 Quick Formula Recap",
      };
    }

    return {
      key: "oneshot",
      cls: "is-oneshot",
      label: "⚡ Complete 1-Shot Revision",
    };
  }

  function loadSet(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function saveSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
    } catch {}
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      if (val === null || val === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    } catch {}
  }

  function localDayStamp(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadInitialRole() {
    try {
      const saved = localStorage.getItem(ROLE_KEY);
      if (saved === "student" || saved === "teacher") return saved;
    } catch {}
    return "student";
  }

  const initialRole = loadInitialRole();
  const rawPack = loadJson(HW_PACK_KEY, []);

  const state = {
    meta: null,
    syllabus: [],
    syllabusByNo: new Map(),
    subjects: [],
    allLanguages: [],
    allExams: [],
    allEducators: [],
    videos: [],
    userRole: initialRole,
    compassCollapsed: initialRole === "teacher",
    subject: "All",
    classLevel: "all",
    chapterNo: 0,
    query: "",
    lang: "all",
    exam: "all",
    educator: "",
    sort: "trending",
    expandedChapters: new Set(),
    flatLimit: FLAT_PAGE_SIZE,
    saved: loadSet(SAVED_KEY),
    doneChapters: loadSet(DONE_KEY),
    doneVideos: loadSet(DONE_VIDEOS_KEY),
    lastLecture: loadJson(LAST_LECTURE_KEY, null),
    continueDismissed: false,
    streakDays: Array.isArray(loadJson(STREAK_KEY, []))
      ? loadJson(STREAK_KEY, []).map(String)
      : [],
    selfCheck: loadJson(SELF_CHECK_KEY, {}) || {},
    cheatsheetOpen: true,
    lectureNotes: loadJson(NOTES_KEY, {}) || {},
    homeworkPack: Array.isArray(rawPack) ? rawPack.map(String).filter(Boolean) : [],
    homeworkTrayOpen: false,
    pickIds: [],
    pickerKind: "lang",
    activePlayerVideo: null,
    isListening: false,
    voiceFallbackOpen: false,
  };

  const el = {
    brandGlyph: document.getElementById("brand-glyph"),
    brandName: document.getElementById("brand-name"),
    heroStats: document.getElementById("hero-stats"),
    ecosystemNav: document.getElementById("ecosystem-nav"),
    roleTeacherBtn: document.getElementById("role-teacher-btn"),
    roleStudentBtn: document.getElementById("role-student-btn"),
    shareWhatsappBtn: document.getElementById("share-whatsapp-btn"),
    shareCopyBtn: document.getElementById("share-copy-btn"),
    savedDeckBtn: document.getElementById("saved-deck-btn"),
    cntSaved: document.getElementById("cnt-saved"),
    homeworkPackBtn: document.getElementById("homework-pack-btn"),
    cntPack: document.getElementById("cnt-pack"),
    themeToggle: document.getElementById("theme-toggle"),
    subline: document.getElementById("subline"),
    subjectTabs: document.getElementById("subject-tabs"),
    classPills: document.getElementById("class-pills"),
    q: document.getElementById("q"),
    keyHint: document.getElementById("key-hint"),
    clearQ: document.getElementById("clear-q"),
    voiceSearchBtn: document.getElementById("voice-search-btn"),
    langSelect: document.getElementById("lang-select"),
    examSelect: document.getElementById("exam-select"),
    educatorSelect: document.getElementById("educator-select"),
    sortSelect: document.getElementById("sort-select"),
    railChTotal: document.getElementById("rail-ch-total"),
    clearChapterBtn: document.getElementById("clear-chapter-btn"),
    studentProgressBox: document.getElementById("student-progress-box"),
    statProgress: document.getElementById("stat-progress"),
    syllabusProgress: document.getElementById("syllabus-progress"),
    chFilter: document.getElementById("ch-filter"),
    syllabusTree: document.getElementById("syllabus-tree"),
    liveStatus: document.getElementById("live-status"),
    count: document.getElementById("count"),
    continueStudyBar: document.getElementById("continue-study-bar"),
    continueStudyBtn: document.getElementById("continue-study-btn"),
    continueStudyText: document.getElementById("continue-study-text"),
    continueChBtn: document.getElementById("continue-ch-btn"),
    continueChText: document.getElementById("continue-ch-text"),
    studyStreakPill: document.getElementById("study-streak-pill"),
    continueDismissBtn: document.getElementById("continue-dismiss-btn"),
    assignedPackSection: document.getElementById("assigned-pack-section"),
    visualCompass: document.getElementById("visual-compass"),
    compassToggleBtn: document.getElementById("compass-toggle-btn"),
    compassBody: document.getElementById("compass-body"),
    compassLangs: document.getElementById("compass-langs"),
    compassExamBadge: document.getElementById("compass-exam-badge"),
    compassExams: document.getElementById("compass-exams"),
    compassSituations: document.getElementById("compass-situations"),
    compassChapterSelect: document.getElementById("compass-chapter-select"),
    compassChapters: document.getElementById("compass-chapters"),
    phoneticBanner: document.getElementById("phonetic-banner"),
    activeFiltersBar: document.getElementById("active-filters-bar"),
    activeSummary: document.getElementById("active-summary"),
    activeFilters: document.getElementById("active-filters"),
    chapterRoadmap: document.getElementById("chapter-roadmap"),
    list: document.getElementById("list"),
    mobChaptersBtn: document.getElementById("mob-chapters-btn"),
    mobChLabel: document.getElementById("mob-ch-label"),
    mobLangBtn: document.getElementById("mob-lang-btn"),
    mobLangLabel: document.getElementById("mob-lang-label"),
    mobEducatorBtn: document.getElementById("mob-educator-btn"),
    mobEduLabel: document.getElementById("mob-edu-label"),
    mobShareBtn: document.getElementById("mob-share-btn"),
    syllabusDialog: document.getElementById("syllabus-dialog"),
    drawerTitle: document.getElementById("drawer-title"),
    drawerAllChBtn: document.getElementById("drawer-all-ch-btn"),
    drawerStatProgress: document.getElementById("drawer-stat-progress"),
    drawerChFilter: document.getElementById("drawer-ch-filter"),
    drawerSyllabusTree: document.getElementById("drawer-syllabus-tree"),
    pickerDialog: document.getElementById("picker-dialog"),
    pickerTitle: document.getElementById("picker-title"),
    pickerSearchWrap: document.getElementById("picker-search-wrap"),
    pickerSearch: document.getElementById("picker-search"),
    pickerList: document.getElementById("picker-list"),
    shareDialog: document.getElementById("share-dialog"),
    shareSheetPreview: document.getElementById("share-sheet-preview"),
    shareSheetWa: document.getElementById("share-sheet-wa"),
    shareSheetCopy: document.getElementById("share-sheet-copy"),
    playerDialog: document.getElementById("player-dialog"),
    playerBadge: document.getElementById("player-badge"),
    playerChannel: document.getElementById("player-channel"),
    playerDoneBtn: document.getElementById("player-done-btn"),
    playerShareBtn: document.getElementById("player-share-btn"),
    playerExt: document.getElementById("player-ext"),
    playerTitle: document.getElementById("player-title"),
    playerStage: document.getElementById("player-stage"),
    playerSamples: document.getElementById("player-samples"),
    playerUpnext: document.getElementById("player-upnext"),
    playerNotesPanel: document.getElementById("player-notes-panel"),
    playerNotesStatus: document.getElementById("player-notes-status"),
    playerNotesInput: document.getElementById("player-notes-input"),
    playerNotesStampBtn: document.getElementById("player-notes-stamp-btn"),
    playerNotesCopyBtn: document.getElementById("player-notes-copy-btn"),
    playerNotesWaBtn: document.getElementById("player-notes-wa-btn"),
    homeworkTray: document.getElementById("homework-tray"),
    hwTrayTitle: document.getElementById("hw-tray-title"),
    hwTrayHint: document.getElementById("hw-tray-hint"),
    hwTrayCloseBtn: document.getElementById("hw-tray-close-btn"),
    hwTrayChips: document.getElementById("hw-tray-chips"),
    hwWhatsappBtn: document.getElementById("hw-whatsapp-btn"),
    hwCopyBtn: document.getElementById("hw-copy-btn"),
    hwPreviewBtn: document.getElementById("hw-preview-btn"),
    hwClearBtn: document.getElementById("hw-clear-btn"),
    shareToast: document.getElementById("share-toast"),
    toastMsg: document.getElementById("toast-msg"),
    toastWaLink: document.getElementById("toast-wa-link"),
    toastCloseBtn: document.getElementById("toast-close-btn"),
  };

  const IS_OLYMPIAD = CFG.platformId === "olympiad";
  const RAIL_MQ = window.matchMedia("(min-width: 1024px)");
  let railTreeDirty = true;
  let drawerTreeDirty = true;
  let streamRenderToken = 0;
  const UNIT_SHORT = IS_OLYMPIAD ? "Mod" : "Ch";
  const UNIT_SINGULAR = IS_OLYMPIAD ? "Module" : "Chapter";
  const UNIT_PLURAL = IS_OLYMPIAD ? "Modules" : "Chapters";

  let toastTimer = null;
  let speechRecognizer = null;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function compactNum(n) {
    const val = Number(n) || 0;
    if (val >= 1_000_000) {
      const m = val / 1_000_000;
      return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (val >= 1_000) {
      const k = val / 1_000;
      return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
    }
    return String(val);
  }

  function itemKey(v) {
    return `${v.chapter_no}:${v.provider}:${v.video_id}`;
  }

  function shortRef(v) {
    const clean = String(v.video_id || "").replace(/[^a-zA-Z0-9]/g, "");
    return `C${pad2(v.chapter_no)}-${clean.slice(-6) || "yt"}`;
  }

  function creatorInitials(name) {
    const words = String(name || "YT")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return "YT";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function shortHindiLabel(hiText) {
    if (!hiText) return "";
    return String(hiText).split("·")[0].trim();
  }

  function getDurationBadge(v) {
    if (v.provider === "playlist") {
      const n = Number(v.lesson_count) || 0;
      return n > 0 ? `📚 ${n} Lectures` : "📚 Full Playlist";
    }
    if (v.duration) {
      return `⏱ ${v.duration}`;
    }
    const sec = Number(v.duration_sec) || 0;
    if (sec > 0) {
      const h = Math.floor(sec / 3600);
      const m = Math.round((sec % 3600) / 60);
      return h > 0 ? `⏱ ${h}h ${m}m` : `⏱ ${m}m`;
    }
    return "▶ Lecture";
  }

  function getTractionPill(v) {
    const vpm = Number(v._velocity ?? v.views_per_month) || 0;
    const views = Number(v.view_count) || 0;
    if (vpm >= 22000) {
      return { text: `🔥 ${compactNum(vpm)}/mo`, cls: "is-hot" };
    }
    if (views >= 600000) {
      return { text: `⭐ ${compactNum(views)}`, cls: "" };
    }
    if (vpm >= 4500) {
      return { text: `📈 ${compactNum(vpm)}/mo`, cls: "" };
    }
    if (views > 0) {
      return { text: `▶ ${compactNum(views)}`, cls: "" };
    }
    if (v.provider === "playlist") {
      return { text: "Full Course", cls: "" };
    }
    return { text: "Verified", cls: "" };
  }

  /* Pure YouTube Trend Comparator — ZERO Coaching/Institute Bias */
  function comparePureTrend(a, b) {
    const rDiff = (Number(b._rankTrend) || 0) - (Number(a._rankTrend) || 0);
    if (Math.abs(rDiff) > 0.001) return rDiff;
    const vpmDiff = (Number(b._velocity) || 0) - (Number(a._velocity) || 0);
    if (vpmDiff !== 0) return vpmDiff;
    return (Number(b.view_count) || 0) - (Number(a.view_count) || 0);
  }

  function compareItems(a, b, sortKey) {
    if (sortKey === "views") {
      const vDiff = (Number(b.view_count) || 0) - (Number(a.view_count) || 0);
      if (vDiff !== 0) return vDiff;
      return comparePureTrend(a, b);
    }
    if (sortKey === "zero_to_hero") {
      const aPl = a.provider === "playlist" ? 1 : 0;
      const bPl = b.provider === "playlist" ? 1 : 0;
      if (bPl !== aPl) return bPl - aPl;
      return comparePureTrend(a, b);
    }
    return comparePureTrend(a, b);
  }

  function getPlatformClassDefs() {
    if (CFG.platformId === "board" || CFG.platformId === "upboard") {
      return [
        { key: "all", label: "All" },
        { key: "Class 12", label: "Class 12" },
        { key: "Class 10", label: "Class 10" },
      ];
    }
    if (CFG.platformId === "olympiad") {
      return [
        { key: "all", label: "All" },
        { key: "jr", label: "Jr (8–10)" },
        { key: "sr", label: "Sr (11–12)" },
      ];
    }
    return [
      { key: "all", label: "All" },
      { key: "Class 11", label: "Class 11" },
      { key: "Class 12", label: "Class 12" },
      { key: "dropper", label: "Dropper" },
    ];
  }

  function matchesClassLevel(v, classKey) {
    if (!classKey || classKey === "all") return true;
    if (classKey === "dropper") {
      return (
        v.class_level === "Dropper" ||
        v.format === "One-Shot" ||
        v.format === "PYQ & Mock" ||
        Boolean(v._isDropperReady)
      );
    }
    if (classKey === "jr") {
      return ["Class 8–10", "Class 8–12", "Class 9–12", "Class 10–12"].includes(
        v.class_level
      );
    }
    if (classKey === "sr") {
      return [
        "Class 11–12",
        "Class 12",
        "Class 10–12",
        "Class 8–12",
        "Class 9–12",
      ].includes(v.class_level);
    }
    return v.class_level === classKey;
  }

  function matchesSortScope(v, sortKey, activeChapterNo) {
    if (sortKey === "zero_to_hero") {
      return (
        v._vibe.key === "beginner" ||
        v.provider === "playlist" ||
        (Number(v.duration_sec) || 0) >= 5400
      );
    }
    if (sortKey === "exam_tomorrow") {
      return (
        v._vibe.key === "oneshot" ||
        v._vibe.key === "recap" ||
        Boolean(v._isQuickRevision)
      );
    }
    if (sortKey === "solve_pyqs" || sortKey === "pyq") {
      return v._vibe.key === "pyq" || Boolean(v._isPyq);
    }
    if (sortKey === "easy_scoring") {
      if (activeChapterNo > 0) return true;
      return Boolean(v._roiMeta?.isEasy);
    }
    if (sortKey === "quick_revision") {
      return Boolean(v._isQuickRevision) || v._vibe.key === "recap";
    }
    if (sortKey === "playlists") {
      return v.provider === "playlist" || v.format === "Full Course";
    }
    return true;
  }

  function indexRecord(v) {
    const chExtra = CFG.acronyms[v.chapter_no] || "";
    const langMeta = getLangMeta(v.language);
    const ped = getChapterPedagogy(v.chapter_no);
    const roiMeta = getRoiMeta(ped.roi);
    v._ped = ped;
    v._roiMeta = roiMeta;
    v._vibe = classifyTeachingVibe(v);

    const tx = String(v.target_exam || "").toLowerCase();
    let examExtra = "";
    if (tx.includes("cet") || tx.includes("bitsat")) {
      examExtra +=
        " engineering cet mht cet mhtcet kcet eapcet eamcet wbjee keam gujcet ojee comedk bitsat";
    }
    if (tx.includes("board") || tx.includes("class 12") || tx.includes("class 10")) {
      examExtra += " board boards cbse isc ncert state board hsc puc ipe";
    }
    if (tx.includes("aiims") || tx.includes("medical") || tx.includes("nursing")) {
      examExtra += " medical aiims jipmer bsc nursing paramedical";
    }

    const titleAndFmt = `${v.title || ""} ${v.format || ""}`;
    v._isQuickRevision =
      v.format === "One-Shot" ||
      v._vibe.key === "oneshot" ||
      v._vibe.key === "recap" ||
      (v.provider === "youtube" &&
        (/one\s*-?\s*shot|complete\s+chapter|full\s+chapter|marathon|mahamarathon|rapid\s+revision|quick\s+revision|in\s+\d+\s*hours?/i.test(
          titleAndFmt
        ) ||
          (Number(v.duration_sec) >= 900 && Number(v.duration_sec) <= 10800)));

    v._isPyq =
      v._vibe.key === "pyq" ||
      v.format === "PYQ & Mock" ||
      /pyq|previous\s+year|problem|questions?|mock|booster|ranker|challenge|paper|olympiad\s+problems|numericals?|ncert\s+solutions?|important\s+questions/i.test(
        titleAndFmt
      );

    v._isDropperReady =
      v._isQuickRevision ||
      v._isPyq ||
      /dropper|prayas|yakeen|bounceback|manzil|leader|achiever|target/i.test(
        titleAndFmt
      );

    v._key = itemKey(v);
    const views = Number(v.view_count) || 0;
    const ageM = Math.max(Number(v.age_months) || 12, 0.5);
    if (v.provider === "youtube" && views > 0) {
      v._velocity = Math.round(views / Math.max(ageM + 1.5, 2.5));
      v._rankTrend =
        Math.log10(v._velocity + 10) * 30 + Math.log10(views + 10) * 0.25;
    } else {
      v._velocity = Number(v.views_per_month) || 0;
      v._rankTrend = Number(v.trend_score) || 0;
    }

    const formatTokens = [];
    if (v._isPyq || v._vibe.key === "pyq") {
      formatTokens.push(
        "pyq pyqs previous year question questions solved paper numerical numericals problem problems practice dpp mcq mock"
      );
    }
    if (
      v._isQuickRevision ||
      v._vibe.key === "oneshot" ||
      v._vibe.key === "recap"
    ) {
      formatTokens.push(
        "one shot oneshot 1 shot 1-shot quick revision rapid formula formulas recap marathon crash summary derivations derivation"
      );
    }
    if (v.provider === "playlist" || v._vibe.key === "beginner") {
      formatTokens.push(
        "playlist playlists full course series complete zero to hero basics foundational scratch"
      );
    }

    v._search = [
      v.title,
      v.chapter,
      `ch ${v.chapter_no}`,
      `ch ${pad2(v.chapter_no)}`,
      `chapter ${v.chapter_no}`,
      `mod ${v.chapter_no}`,
      `module ${v.chapter_no}`,
      ped.hi,
      ped.ref,
      `ncert ch ${ped.sub_idx}`,
      v._vibe.label,
      formatTokens.join(" "),
      v.unit,
      v.subject,
      v.educator,
      v.channel,
      v.format,
      v.language,
      langMeta.badge,
      langMeta.aliases,
      v.class_level,
      v.target_exam,
      examExtra,
      chExtra,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  /* ==========================================================================
     PHONETIC HINGLISH / DESI KEYWORD & CHAPTER NUMBER ANALYZER
     ========================================================================== */
  function matchSubjectKeyword(normText) {
    const rules = [
      {
        re: /\b(?:maths?|mathematics|ganit)\b|गणित/i,
        match: (s) => /math|गणित/i.test(s),
      },
      {
        re: /\b(?:physics|phy|bhautik|bhautiki)\b|भौतिक/i,
        match: (s) => /phys|भौतिक/i.test(s),
      },
      {
        re: /\b(?:chemistry|chem|rasayan)\b|रसायन/i,
        match: (s) => /chem|रसायन/i.test(s),
      },
      {
        re: /\b(?:botany|padap)\b|वनस्पति/i,
        match: (s) => /botany|bio|जीव/i.test(s),
      },
      {
        re: /\b(?:zoology|jantu)\b|प्राणी/i,
        match: (s) => /zoology|bio|जीव/i.test(s),
      },
      {
        re: /\b(?:biology|bio|jeev\s*vigyan)\b|जीव\s*विज्ञान|जीवविज्ञान/i,
        match: (s) => /bio|botany|zoology|जीव/i.test(s),
      },
      {
        re: /\b(?:science|vigyan|ijso|nsejs)\b|विज्ञान/i,
        match: (s) => /science|विज्ञान/i.test(s),
        fallbackMatch: (s) => /phys|chem|bio|botany|zoology|astron/i.test(s),
      },
      {
        re: /\b(?:informatics|coding|cs|ioi|zco|inoi)\b/i,
        match: (s) => /inform|comp/i.test(s),
      },
      {
        re: /\b(?:astronomy|astro|ioaa)\b/i,
        match: (s) => /astron/i.test(s),
      },
      {
        re: /\b(?:social\s*science|sst|samajik)\b|सामाजिक/i,
        match: (s) => /social|सामाजिक/i.test(s),
      },
    ];
    for (const r of rules) {
      if (r.re.test(normText)) {
        let matchedSubjects = state.subjects.filter(r.match);
        if (!matchedSubjects.length && r.fallbackMatch) {
          matchedSubjects = state.subjects.filter(r.fallbackMatch);
        }
        if (matchedSubjects.length) {
          return { regex: r.re, subjects: matchedSubjects };
        }
      }
    }
    return null;
  }

  function videoMatchesParsedClassNum(v, classNum) {
    if (!classNum) return true;
    const raw = String(v.class_level || "");
    if (raw === `Class ${classNum}`) return true;
    const rangeMatch = raw.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
    if (rangeMatch) {
      const lo = Number(rangeMatch[1]);
      const hi = Number(rangeMatch[2]);
      return classNum >= lo && classNum <= hi;
    }
    return false;
  }

  function triggerMatchesText(normText, trigger) {
    const t = String(trigger || "").toLowerCase().trim();
    if (!t) return false;
    if (/[^\x00-\x7F]/.test(t) || /[\s/]/.test(t)) {
      return normText.includes(t);
    }
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundaryRe = new RegExp(
      `(?:^|\\s|[,.;:!?()\\-])${escaped}(?:$|\\s|[,.;:!?()\\-])`,
      "i"
    );
    return boundaryRe.test(normText);
  }

  function stripTriggerFromText(normText, trigger) {
    const t = String(trigger || "").toLowerCase().trim();
    if (!t) return normText;
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (/[^\x00-\x7F]/.test(t) || /[\s/]/.test(t)) {
      return normText.replace(new RegExp(escaped, "gi"), " ");
    }
    return normText.replace(
      new RegExp(`(^|\\s|[,.;:!?()\\-])${escaped}(?=$|\\s|[,.;:!?()\\-])`, "gi"),
      " "
    );
  }

  let cachedQueryKey = null;
  let cachedQueryPlan = null;

  function analyzeStudentQuery(rawQuery) {
    const raw = String(rawQuery || "").trim();
    const cacheKey = `${raw}||${state.subject}||${state.classLevel}||${state.syllabus.length}`;
    if (cacheKey === cachedQueryKey && cachedQueryPlan) {
      return cachedQueryPlan;
    }

    const cleaned = raw
      .toLowerCase()
      .replace(/[।?!,;:"'“”‘’()[\]{}]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) {
      const emptyPlan = {
        raw: "",
        hasQuery: false,
        parsedClassNum: 0,
        parsedSubjects: [],
        chapterMatchSet: null,
        expandGroups: [],
        formatIntents: [],
        leftoverTokens: [],
        bannerTitle: "",
        suggestedChapters: [],
      };
      cachedQueryKey = cacheKey;
      cachedQueryPlan = emptyPlan;
      return emptyPlan;
    }

    let working = cleaned;
    let parsedClassNum = 0;
    const clsMatch = working.match(
      /(?:^|\s)(?:(?:class|cls|kaksha|कक्षा)\s*(8|9|10|11|12)\s*(?:th|वीं)?|(8|9|10|11|12)\s*(?:th|वीं))(?=\s|$)/i
    );
    if (clsMatch) {
      parsedClassNum = Number(clsMatch[1] || clsMatch[2]) || 0;
      working = working.replace(clsMatch[0], " ");
    }

    const subjInfo = matchSubjectKeyword(working);
    const parsedSubjects = subjInfo ? subjInfo.subjects : [];
    if (subjInfo) {
      working = working.replace(
        new RegExp(subjInfo.regex.source, "gi"),
        " "
      );
    }

    const chNumMatch = working.match(
      /(?:^|\s)(?:ch|chap|chapter|mod|module|adhyay|अध्याय|पाठ)\s*[-:.#]?\s*0*(\d{1,2})(?=\s|$)/i
    );

    let chapterMatchSet = null;
    let bannerTitle = "";
    const suggestedNos = [];

    if (chNumMatch) {
      const targetNum = Number(chNumMatch[1]);
      chapterMatchSet = new Set();
      working = working.replace(chNumMatch[0], " ");

      const stateClsNum = state.classLevel.startsWith("Class ")
        ? Number(state.classLevel.replace(/\D+/g, "")) || 0
        : state.classLevel === "jr"
          ? 10
          : state.classLevel === "sr"
            ? 12
            : 0;
      const effectiveClassNum = parsedClassNum || stateClsNum;
      const effectiveSubjects = parsedSubjects.length
        ? parsedSubjects
        : state.subject !== "All" && state.subject !== "Saved"
          ? [state.subject]
          : [];

      // 1. Match textbook sub_idx within matched subject & class/range
      if (effectiveSubjects.length || effectiveClassNum) {
        for (const ch of state.syllabus) {
          const ped = getChapterPedagogy(ch.chapter_no);
          const subjOk =
            !effectiveSubjects.length || effectiveSubjects.includes(ch.subject);
          const chVideos = state.videos.filter(
            (v) => v.chapter_no === ch.chapter_no
          );
          const clsOk =
            !effectiveClassNum ||
            chVideos.some((v) =>
              videoMatchesParsedClassNum(v, effectiveClassNum)
            );
          if (subjOk && clsOk && ped.sub_idx === targetNum) {
            chapterMatchSet.add(ch.chapter_no);
          }
        }
      }

      // 2. If class range missed (e.g. Olympiad Physics only in Sr 11-12), match sub_idx within effectiveSubjects
      if (chapterMatchSet.size === 0 && effectiveSubjects.length) {
        for (const ch of state.syllabus) {
          if (!effectiveSubjects.includes(ch.subject)) continue;
          const ped = getChapterPedagogy(ch.chapter_no);
          if (ped.sub_idx === targetNum || ch.chapter_no === targetNum) {
            chapterMatchSet.add(ch.chapter_no);
          }
        }
      }

      // 3. Direct chapter_no match ONLY if compatible with effectiveSubjects
      if (chapterMatchSet.size === 0 && state.syllabusByNo.has(targetNum)) {
        const directCh = state.syllabusByNo.get(targetNum);
        if (
          !effectiveSubjects.length ||
          effectiveSubjects.includes(directCh.subject)
        ) {
          chapterMatchSet.add(targetNum);
        }
      }

      for (const no of chapterMatchSet) {
        if (!suggestedNos.includes(no)) suggestedNos.push(no);
      }
      if (suggestedNos.length) {
        const firstCh = state.syllabusByNo.get(suggestedNos[0]);
        const chWord = CFG.platformId === "olympiad" ? "Module" : "Chapter";
        bannerTitle = firstCh
          ? `Matched ${firstCh.subject} ${chWord} ${pad2(firstCh.chapter_no)}: ${firstCh.chapter}`
          : "";
      }
    }

    // Synonym & Phonetic Hinglish Dictionary Lookup (strips ALL matching triggers per rule)
    const expandGroups = [];
    const synonymSource = getMergedSynonyms();
    const rules = Array.isArray(synonymSource) ? synonymSource : [];
    for (const rule of rules) {
      if (!Array.isArray(rule.triggers)) continue;
      const matchedTrigs = rule.triggers.filter((trig) =>
        triggerMatchesText(working, trig)
      );
      if (matchedTrigs.length) {
        expandGroups.push({
          trigger: matchedTrigs[0],
          label: rule.label,
          expand: (rule.expand || []).map((x) => x.toLowerCase()),
        });
        for (const trig of matchedTrigs) {
          working = stripTriggerFromText(working, trig);
        }
      }
    }

    if (expandGroups.length) {
      bannerTitle = expandGroups.map((g) => g.label).join(" + ");
      for (const ch of state.syllabus) {
        if (parsedSubjects.length && !parsedSubjects.includes(ch.subject)) {
          continue;
        }
        const ped = getChapterPedagogy(ch.chapter_no);
        const chHay =
          `${ch.chapter} ${ch.unit} ${ped.hi} ${CFG.acronyms[ch.chapter_no] || ""}`.toLowerCase();
        if (
          expandGroups.some((g) =>
            g.expand.some((phrase) => chHay.includes(phrase))
          )
        ) {
          if (!suggestedNos.includes(ch.chapter_no)) {
            suggestedNos.push(ch.chapter_no);
          }
        }
      }
    }

    // Extract Format / Study Intent Modifiers cleanly so titles using "Solved Problems" vs "Numericals" or "1-Shot" vs "One Shot" match
    const formatIntents = [];
    const oneShotRe =
      /(?:^|\s)(?:one\s*-?\s*shots?|1\s*-?\s*shots?|oneshots?|mahamarathon|marathon|quick\s+revision|rapid\s+revision|formula\s+recap|mind\s*map)(?=\s|$)/gi;
    if (oneShotRe.test(working)) {
      formatIntents.push("oneshot");
      working = working.replace(oneShotRe, " ");
    }
    const pyqNumRe =
      /(?:^|\s)(?:pyqs?|previous\s+year(?:\s+questions?)?|numericals?|numerical|derivations?|derivation|mock\s+tests?)(?=\s|$)/gi;
    if (pyqNumRe.test(working)) {
      formatIntents.push("pyq");
      working = working.replace(pyqNumRe, " ");
    }
    const playlistRe =
      /(?:^|\s)(?:playlists?|full\s+course|complete\s+course)(?=\s|$)/gi;
    if (playlistRe.test(working)) {
      formatIntents.push("playlist");
      working = working.replace(playlistRe, " ");
    }

    const stopWords = new Set([
      "class",
      "cls",
      "kaksha",
      "कक्षा",
      "chapter",
      "chap",
      "ch",
      "mod",
      "module",
      "adhyay",
      "अध्याय",
      "पाठ",
      "ncert",
      "in",
      "on",
      "of",
      "for",
      "to",
      "the",
      "with",
      "by",
      "from",
      "ka",
      "ke",
      "ki",
      "ko",
      "se",
      "me",
      "mein",
      "par",
      "wala",
      "wali",
      "aur",
      "and",
      "or",
      "video",
      "videos",
      "lecture",
      "lectures",
      "session",
      "sessions",
      "full",
      "complete",
      "best",
      "top",
    ]);

    const leftoverTokens = working
      .trim()
      .split(/\s+/)
      .filter((tok) => tok && !stopWords.has(tok));

    const plan = {
      raw,
      hasQuery: true,
      parsedClassNum,
      parsedSubjects,
      chapterMatchSet,
      expandGroups,
      formatIntents,
      leftoverTokens,
      bannerTitle,
      suggestedChapters: suggestedNos
        .slice(0, 5)
        .map((no) => state.syllabusByNo.get(no))
        .filter(Boolean),
    };
    cachedQueryKey = cacheKey;
    cachedQueryPlan = plan;
    return plan;
  }

  function matchesFormatIntents(v, intents) {
    for (const intent of intents) {
      if (intent === "oneshot") {
        if (
          !v._isQuickRevision &&
          v._vibe.key !== "oneshot" &&
          v._vibe.key !== "recap"
        ) {
          return false;
        }
      } else if (intent === "pyq") {
        if (!v._isPyq && v._vibe.key !== "pyq") return false;
      } else if (intent === "playlist") {
        if (v.provider !== "playlist" && v._vibe.key !== "beginner") {
          return false;
        }
      }
    }
    return true;
  }

  // Zero-Lag Engine: a single renderAll() previously ran ~15 full-corpus scans
  // (facets, compass, trees, subject tabs). Results are memoized per filter tuple
  // and invalidated only when the dataset or the Saved set changes.
  // Returned arrays are shared — callers must .slice() before sorting.
  const FILTER_CACHE_MAX = 96;
  const filterCache = new Map();
  let filterEpoch = 0;

  function invalidateFilterCache() {
    filterEpoch += 1;
    filterCache.clear();
  }

  function filterVideosCustom(overrides = {}) {
    const subj = overrides.subject ?? state.subject;
    const cacheKey = [
      filterEpoch,
      subj,
      overrides.classLevel ?? state.classLevel,
      overrides.chapterNo ?? state.chapterNo,
      overrides.query ?? state.query,
      overrides.lang ?? state.lang,
      overrides.exam ?? state.exam,
      overrides.educator ?? state.educator,
      overrides.sort ?? state.sort,
      state.videos.length,
    ].join("\u241f");
    const hit = filterCache.get(cacheKey);
    if (hit) return hit;
    const result = filterVideosUncached(overrides);
    if (filterCache.size >= FILTER_CACHE_MAX) {
      filterCache.delete(filterCache.keys().next().value);
    }
    filterCache.set(cacheKey, result);
    return result;
  }

  function filterVideosUncached(overrides = {}) {
    const subj = overrides.subject ?? state.subject;
    const cls = overrides.classLevel ?? state.classLevel;
    const chNo = overrides.chapterNo ?? state.chapterNo;
    const qText = overrides.query ?? state.query;
    const lang = overrides.lang ?? state.lang;
    const exam = overrides.exam ?? state.exam;
    const edu = overrides.educator ?? state.educator;
    const sortKey = overrides.sort ?? state.sort;

    const qPlan = qText ? analyzeStudentQuery(qText) : null;

    const baseCandidates = state.videos.filter((v) => {
      if (subj === "Saved") {
        if (!state.saved.has(v._key)) return false;
      } else if (subj !== "All" && v.subject !== subj) {
        return false;
      }
      if (!matchesClassLevel(v, cls)) return false;
      if (chNo && v.chapter_no !== chNo) return false;
      if (lang !== "all" && v.language !== lang) return false;
      if (exam !== "all" && v.target_exam !== exam) return false;
      if (edu && v.educator !== edu && v.channel !== edu) return false;
      if (!matchesSortScope(v, sortKey, chNo)) return false;

      if (qPlan && qPlan.hasQuery) {
        if (
          subj === "All" &&
          qPlan.parsedSubjects.length > 0 &&
          !qPlan.parsedSubjects.includes(v.subject)
        ) {
          return false;
        }
        if (
          qPlan.chapterMatchSet &&
          qPlan.chapterMatchSet.size > 0 &&
          !qPlan.chapterMatchSet.has(v.chapter_no)
        ) {
          return false;
        }
        if (qPlan.leftoverTokens.length > 0) {
          for (const tok of qPlan.leftoverTokens) {
            if (!v._search.includes(tok)) return false;
          }
        }
      }
      return true;
    });

    if (!qPlan || !qPlan.hasQuery) return baseCandidates;

    // Apply expandGroups (require ALL groups if any video satisfies all; otherwise union OR across groups)
    let topicMatched = baseCandidates;
    if (qPlan.expandGroups.length > 0) {
      const allGroupHits = baseCandidates.filter((v) =>
        qPlan.expandGroups.every((grp) =>
          grp.expand.some((p) => v._search.includes(p))
        )
      );
      if (allGroupHits.length > 0) {
        topicMatched = allGroupHits;
      } else if (qPlan.expandGroups.length >= 2) {
        topicMatched = baseCandidates.filter((v) =>
          qPlan.expandGroups.some((grp) =>
            grp.expand.some((p) => v._search.includes(p))
          )
        );
      } else {
        topicMatched = [];
      }
    }

    // Apply parsedClassNum constraint when user typed class without chapter number (graceful fallback if 0)
    if (
      topicMatched.length > 0 &&
      cls === "all" &&
      qPlan.parsedClassNum > 0 &&
      !qPlan.chapterMatchSet
    ) {
      const clsFiltered = topicMatched.filter((v) =>
        videoMatchesParsedClassNum(v, qPlan.parsedClassNum)
      );
      if (clsFiltered.length > 0) {
        topicMatched = clsFiltered;
      }
    }

    // Apply formatIntents (e.g. "pyq", "numericals", "one shot", "playlist") with graceful topic fallback
    if (topicMatched.length > 0 && qPlan.formatIntents.length > 0) {
      const strictFmt = topicMatched.filter((v) =>
        matchesFormatIntents(v, qPlan.formatIntents)
      );
      if (strictFmt.length > 0) {
        return strictFmt;
      }
    }

    return topicMatched;
  }

  function getFilteredVideos() {
    return filterVideosCustom();
  }

  /* ==========================================================================
     STUDY TRACKER HELPERS (localStorage Persistence for Chapters & Videos)
     ========================================================================== */
  function recordStudyActivity() {
    const today = localDayStamp();
    if (!state.streakDays.includes(today)) {
      state.streakDays.push(today);
      state.streakDays.sort();
      if (state.streakDays.length > 90) {
        state.streakDays = state.streakDays.slice(-90);
      }
      saveJson(STREAK_KEY, state.streakDays);
    }
  }

  function computeStudyStreak() {
    if (!Array.isArray(state.streakDays) || !state.streakDays.length) return 0;
    const unique = Array.from(new Set(state.streakDays)).sort();
    const today = localDayStamp();
    const yestDate = new Date();
    yestDate.setDate(yestDate.getDate() - 1);
    const yesterday = localDayStamp(yestDate);
    const latest = unique[unique.length - 1];
    if (latest !== today && latest !== yesterday) return 0;

    let streak = 1;
    let cursor = new Date(`${latest}T12:00:00`);
    for (let i = unique.length - 2; i >= 0; i -= 1) {
      cursor.setDate(cursor.getDate() - 1);
      if (unique[i] === localDayStamp(cursor)) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  function recordLastLecture(v) {
    if (!v) return;
    const entry = {
      key: v._key,
      video_id: v.video_id,
      provider: v.provider,
      chapter_no: v.chapter_no,
      chapter: v.chapter,
      title: v.title,
      educator: v.educator || v.channel || "",
      ts: Date.now(),
    };
    state.lastLecture = entry;
    state.continueDismissed = false;
    saveJson(LAST_LECTURE_KEY, entry);
    recordStudyActivity();
  }

  function toggleChapterDone(chNo) {
    const k = String(chNo);
    const nowDone = !state.doneChapters.has(k);
    if (nowDone) {
      state.doneChapters.add(k);
      recordStudyActivity();
    } else {
      state.doneChapters.delete(k);
    }
    saveSet(DONE_KEY, state.doneChapters);
    return nowDone;
  }

  function toggleVideoDone(v) {
    const vKey = v._key;
    const chKey = String(v.chapter_no);
    const nowDone = !state.doneVideos.has(vKey);
    if (nowDone) {
      state.doneVideos.add(vKey);
      state.doneChapters.add(chKey);
      recordStudyActivity();
    } else {
      state.doneVideos.delete(vKey);
      const anyOtherDoneInCh = state.videos.some(
        (item) =>
          item.chapter_no === v.chapter_no && state.doneVideos.has(item._key)
      );
      if (!anyOtherDoneInCh) {
        state.doneChapters.delete(chKey);
      }
    }
    saveSet(DONE_VIDEOS_KEY, state.doneVideos);
    saveSet(DONE_KEY, state.doneChapters);
    return nowDone;
  }

  function toggleSavedVideo(v) {
    const k = v._key;
    if (state.saved.has(k)) state.saved.delete(k);
    else state.saved.add(k);
    invalidateFilterCache();
    saveSet(SAVED_KEY, state.saved);
    return state.saved.has(k);
  }

  function getVideoPickId(v) {
    return String(v.video_id || "").trim();
  }

  function isVideoInPack(v) {
    const pid = getVideoPickId(v);
    return Boolean(pid) && state.homeworkPack.includes(pid);
  }

  function toggleHomeworkPack(v) {
    const pid = getVideoPickId(v);
    if (!pid) return false;
    const idx = state.homeworkPack.indexOf(pid);
    if (idx !== -1) {
      state.homeworkPack.splice(idx, 1);
      saveJson(HW_PACK_KEY, state.homeworkPack);
      return false;
    }
    if (state.homeworkPack.length >= 12) {
      showShareToast(
        "📋 Up to 12 lectures can be added to one Homework Pack.",
        "",
        true
      );
      return false;
    }
    state.homeworkPack.push(pid);
    state.homeworkTrayOpen = true;
    saveJson(HW_PACK_KEY, state.homeworkPack);
    return true;
  }

  function resolvePickIdsToVideos(ids) {
    if (!Array.isArray(ids) || !ids.length) return [];
    const seen = new Set();
    const out = [];
    for (const rawId of ids) {
      const token = String(rawId || "").trim();
      if (!token) continue;
      const low = token.toLowerCase();
      const found = state.videos.find(
        (v) =>
          String(v.video_id) === token ||
          v._key === token ||
          shortRef(v).toLowerCase() === low
      );
      if (found && !seen.has(found._key)) {
        seen.add(found._key);
        out.push(found);
      }
    }
    return out;
  }

  function jumpToChapter(chNo) {
    const target = Number(chNo) || 0;
    state.chapterNo = target;
    state.pickIds = [];
    if (target > 0) {
      const ch = state.syllabusByNo.get(target);
      if (
        ch &&
        state.subject !== "All" &&
        state.subject !== "Saved" &&
        state.subject !== ch.subject
      ) {
        state.subject = ch.subject;
      }
      if (state.classLevel !== "all") {
        const chCheck = filterVideosCustom({
          chapterNo: target,
          classLevel: state.classLevel,
        });
        if (chCheck.length === 0) state.classLevel = "all";
      }
    }
    state.flatLimit = FLAT_PAGE_SIZE;
    // Zero-Lag: read scroll position BEFORE mutating the DOM (reading it after
    // forced a synchronous full-document layout, ~150ms at 4x CPU), and defer
    // the smooth scroll to the next frame.
    const wasScrolled = window.scrollY > 0;
    renderAll({ announce: true });
    if (wasScrolled) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
      );
    }
  }

  /* ==========================================================================
     URL DEEP-LINKING (URLSearchParams <-> history.replaceState)
     ========================================================================== */
  function resolveSubjectParam(raw) {
    if (!raw) return "All";
    const clean = raw.trim();
    if (clean.toLowerCase() === "all") return "All";
    if (clean.toLowerCase() === "saved") return "Saved";
    const exact = state.subjects.find(
      (s) => s.toLowerCase() === clean.toLowerCase()
    );
    if (exact) return exact;

    const low = clean.toLowerCase();
    for (const s of state.subjects) {
      const short = (CFG.subjectMeta[s]?.short || "").toLowerCase();
      if (short && short === low) return s;
    }
    if (low === "maths" || low === "math") {
      const m = state.subjects.find((s) => /math|गणित/i.test(s));
      if (m) return m;
    }
    if (low === "phy" || low === "physics") {
      const p = state.subjects.find((s) => /phys|भौतिकी/i.test(s));
      if (p) return p;
    }
    if (low === "chem" || low === "chemistry") {
      const c = state.subjects.find((s) => /chem|रसायन/i.test(s));
      if (c) return c;
    }
    if (low === "bio" || low === "biology") {
      const b = state.subjects.find((s) => /bio|botany|जीव/i.test(s));
      if (b) return b;
    }
    const partial = state.subjects.find((s) => s.toLowerCase().includes(low));
    return partial || "All";
  }

  function resolveChapterParam(raw) {
    if (!raw) return 0;
    const trimmed = raw.trim();
    const leadNum = trimmed.match(/^(\d{1,3})\b/);
    if (leadNum) {
      const n = Number(leadNum[1]);
      if (state.syllabusByNo.has(n)) return n;
    }
    const low = trimmed.toLowerCase();
    for (const ch of state.syllabus) {
      if (ch.chapter.toLowerCase() === low) return ch.chapter_no;
    }
    for (const ch of state.syllabus) {
      if (ch.chapter.toLowerCase().includes(low)) return ch.chapter_no;
    }
    return 0;
  }

  function normalizeListToken(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[+·•\-–—]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function resolveFromList(raw, list) {
    if (!raw || !Array.isArray(list)) return "";
    const low = raw.trim().toLowerCase();
    const exact = list.find((item) => item.toLowerCase() === low);
    if (exact) return exact;
    const normRaw = normalizeListToken(raw);
    if (normRaw) {
      const normExact = list.find(
        (item) => normalizeListToken(item) === normRaw
      );
      if (normExact) return normExact;
      const normPartial = list.find((item) =>
        normalizeListToken(item).includes(normRaw)
      );
      if (normPartial) return normPartial;
    }
    const partial = list.find((item) => item.toLowerCase().includes(low));
    return partial || "";
  }

  function hydrateStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) {
      if (el.q) el.q.value = state.query;
      return;
    }

    const subjParam = params.get("subject");
    if (subjParam) state.subject = resolveSubjectParam(subjParam);

    const clsParam = params.get("class");
    if (clsParam) {
      const defs = getPlatformClassDefs();
      const low = clsParam.trim().toLowerCase();
      const found = defs.find(
        (d) =>
          d.key.toLowerCase() === low ||
          d.label.toLowerCase() === low ||
          (low === "11" && d.key === "Class 11") ||
          (low === "12" && d.key === "Class 12") ||
          (low === "10" && d.key === "Class 10")
      );
      if (found) state.classLevel = found.key;
    }

    const chParam = params.get("chapter");
    if (chParam) {
      state.chapterNo = resolveChapterParam(chParam);
      if (state.chapterNo > 0) {
        const ch = state.syllabusByNo.get(state.chapterNo);
        if (
          ch &&
          state.subject !== "All" &&
          state.subject !== "Saved" &&
          state.subject !== ch.subject
        ) {
          state.subject = ch.subject;
        }
        if (state.classLevel !== "all") {
          const check = filterVideosCustom({
            chapterNo: state.chapterNo,
            classLevel: state.classLevel,
          });
          if (check.length === 0) state.classLevel = "all";
        }
      }
    }

    const langParam = params.get("lang");
    if (langParam && langParam.toLowerCase() !== "all") {
      const matched = resolveFromList(langParam, state.allLanguages);
      state.lang = matched || langParam.trim();
    }

    const streamParam = params.get("exam") || params.get("stream");
    if (streamParam && streamParam.toLowerCase() !== "all") {
      const matched = resolveFromList(streamParam, state.allExams);
      state.exam = matched || streamParam.trim();
    }

    const eduParam = params.get("edu") || params.get("educator");
    if (eduParam) {
      const matched = resolveFromList(eduParam, state.allEducators);
      state.educator = matched || eduParam.trim();
    }

    const sortParam = params.get("sort");
    const validSorts = [
      "trending",
      "zero_to_hero",
      "exam_tomorrow",
      "solve_pyqs",
      "easy_scoring",
      "chapterwise",
      "views",
      "quick_revision",
      "playlists",
      "pyq",
    ];
    if (sortParam && validSorts.includes(sortParam)) {
      state.sort = sortParam;
    }

    const qParam = params.get("q");
    state.query = qParam !== null ? qParam.trim() : "";
    if (el.q) el.q.value = state.query;

    const roleParam = params.get("role");
    if (roleParam === "student" || roleParam === "teacher") {
      state.userRole = roleParam;
      state.compassCollapsed = roleParam === "teacher";
    }

    const pickParam = params.get("pick");
    if (pickParam) {
      state.pickIds = pickParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    } else {
      state.pickIds = [];
    }
  }

  function buildDeepLinkUrl(overrides = {}) {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    const pickIds = overrides.pickIds ?? state.pickIds;

    if (Array.isArray(pickIds) && pickIds.length > 0) {
      params.set("pick", pickIds.join(","));
      const roleVal = overrides.role ?? state.userRole;
      if (roleVal === "teacher") params.set("role", "teacher");
      return `${base}?${params.toString()}`;
    }

    const subj = overrides.subject ?? state.subject;
    const cls = overrides.classLevel ?? state.classLevel;
    const chNo = overrides.chapterNo ?? state.chapterNo;
    const lang = overrides.lang ?? state.lang;
    const exam = overrides.exam ?? state.exam;
    const edu = overrides.educator ?? state.educator;
    const sortKey = overrides.sort ?? state.sort;
    const qText = overrides.query ?? state.query;
    const roleVal = overrides.role ?? state.userRole;

    if (subj && subj !== "All" && subj !== "Saved") params.set("subject", subj);
    if (cls && cls !== "all") params.set("class", cls);
    if (chNo > 0) params.set("chapter", String(chNo));
    if (lang && lang !== "all") params.set("lang", lang);
    if (exam && exam !== "all") params.set("exam", exam);
    if (edu) params.set("edu", edu);
    if (sortKey && sortKey !== "trending") params.set("sort", sortKey);
    if (qText) params.set("q", qText);
    if (roleVal === "teacher") params.set("role", "teacher");

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function syncUrlAndTitle() {
    const params = new URLSearchParams();
    if (state.pickIds.length > 0) {
      params.set("pick", state.pickIds.join(","));
    } else {
      if (state.subject !== "All") params.set("subject", state.subject);
      if (state.classLevel !== "all") params.set("class", state.classLevel);
      if (state.chapterNo > 0) params.set("chapter", String(state.chapterNo));
      if (state.lang !== "all") params.set("lang", state.lang);
      if (state.exam !== "all") params.set("exam", state.exam);
      if (state.educator) params.set("edu", state.educator);
      if (state.sort !== "trending") params.set("sort", state.sort);
      if (state.query) params.set("q", state.query);
    }
    if (state.userRole === "teacher") params.set("role", "teacher");

    const qs = params.toString();
    const nextRel = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash || ""}`;
    try {
      window.history.replaceState(null, "", nextRel);
    } catch {}

    const titleParts = [];
    const chWord = CFG.platformId === "olympiad" ? "Mod" : "Ch";
    if (state.pickIds.length > 0) {
      titleParts.push(`Classroom Assignment (${state.pickIds.length} Lectures)`);
    } else if (state.chapterNo) {
      const ch = state.syllabusByNo.get(state.chapterNo);
      if (ch) titleParts.push(`${chWord} ${pad2(ch.chapter_no)} ${ch.chapter}`);
    } else if (state.subject !== "All") {
      titleParts.push(state.subject);
    }
    if (state.educator && !state.pickIds.length) titleParts.push(state.educator);
    if (state.lang !== "all" && !state.pickIds.length) titleParts.push(state.lang);

    document.title = titleParts.length
      ? `${titleParts.join(" · ")} | ${CFG.brandName}`
      : BASE_TITLE;
  }

  /* ==========================================================================
     WHATSAPP HOMEWORK & STUDY TARGET DEEP-LINK SHARE
     ========================================================================== */
  function buildHomeworkPackSharePayload(customIds = null) {
    const ids = Array.isArray(customIds) && customIds.length
      ? customIds
      : state.pickIds.length
        ? state.pickIds
        : state.homeworkPack;
    const videos = resolvePickIdsToVideos(ids);
    const shareUrl = buildDeepLinkUrl({
      pickIds: videos.map(getVideoPickId),
      role: "student",
    });
    const chPrefix = CFG.platformId === "olympiad" ? "Mod" : "Ch";
    const lines = videos.map((v, i) => {
      const creator = v.educator || v.channel || CFG.brandName;
      return `${i + 1}. [${chPrefix} ${pad2(v.chapter_no)}] ${v.title} — ${creator}`;
    });
    const text = `📋 *${CFG.brandName} Classroom Homework Assignment (${videos.length} Lectures)*\n${lines.join("\n")}\n\n🔗 Open Curated Pack (1-Tap): ${shareUrl}`;
    return { text, url: shareUrl, count: videos.length };
  }

  function buildCurrentViewSharePayload(overrideChapterNo = 0) {
    if (!overrideChapterNo && state.pickIds.length > 0) {
      return buildHomeworkPackSharePayload(state.pickIds);
    }

    const targetChNo = overrideChapterNo || state.chapterNo;
    const chObj = targetChNo > 0 ? state.syllabusByNo.get(targetChNo) : null;
    const shareOverrides = overrideChapterNo
      ? {
          subject: chObj ? chObj.subject : state.subject,
          classLevel: "all",
          chapterNo: overrideChapterNo,
          lang: state.lang,
          exam: state.exam,
          educator: "",
          sort: state.sort,
          query: "",
          pickIds: [],
        }
      : {
          subject: state.subject,
          classLevel: state.classLevel,
          chapterNo: state.chapterNo,
          lang: state.lang,
          exam: state.exam,
          educator: state.educator,
          sort: state.sort,
          query: state.query,
          role: state.userRole,
          pickIds: [],
        };
    const shareUrl = buildDeepLinkUrl(shareOverrides);

    const chPrefix = CFG.platformId === "olympiad" ? "Mod" : "Ch";
    const parts = [CFG.brandName];
    if (chObj) {
      const ped = getChapterPedagogy(chObj.chapter_no);
      const hiShort = shortHindiLabel(ped.hi);
      parts.push(
        `${chPrefix} ${pad2(chObj.chapter_no)} ${chObj.chapter}${hiShort ? ` (${hiShort})` : ""}`
      );
    } else {
      if (state.subject !== "All") parts.push(state.subject);
      if (state.classLevel !== "all") parts.push(state.classLevel);
    }
    if (shareOverrides.exam && shareOverrides.exam !== "all") {
      parts.push(shareOverrides.exam);
    }
    if (shareOverrides.educator) parts.push(`by ${shareOverrides.educator}`);
    if (state.lang !== "all") parts.push(getLangMeta(state.lang).badge);

    const count = overrideChapterNo
      ? filterVideosCustom({
          subject: chObj ? chObj.subject : state.subject,
          classLevel: "all",
          chapterNo: overrideChapterNo,
          educator: "",
          query: "",
        }).length
      : getFilteredVideos().length;

    const text = `📚 ${parts.join(" · ")} (${count.toLocaleString()} Verified Lectures)\n🔗 Study Roadmap: ${shareUrl}`;
    return { text, url: shareUrl };
  }

  function buildVideoShareText(v) {
    const creator = v.educator || v.channel || CFG.brandName;
    const lang = v.language ? getLangMeta(v.language).badge : "Hinglish";
    const chPrefix = CFG.platformId === "olympiad" ? "Mod" : "Ch";
    const deepUrl = buildDeepLinkUrl({
      subject: v.subject,
      chapterNo: v.chapter_no,
      lang: v.language || state.lang,
      classLevel: "all",
      educator: "",
      query: "",
      sort: "trending",
      role: "student",
      pickIds: [],
    });
    return `📚 [${chPrefix} ${pad2(v.chapter_no)} · ${v.chapter}] ${v._vibe.label}\n▶ ${v.title} — ${creator} (${lang})\n🎬 Watch: ${v.url}\n🧭 Chapter Roadmap: ${deepUrl}`;
  }

  async function copyToClipboard(str) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(str);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = str;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }

  function showShareToast(label, fullShareText, hideWhatsApp = false) {
    if (!el.shareToast) return;
    if (el.toastMsg) el.toastMsg.textContent = label;
    if (el.toastWaLink) {
      el.toastWaLink.hidden = Boolean(hideWhatsApp);
      if (fullShareText) {
        el.toastWaLink.href = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
      }
    }
    el.shareToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (el.shareToast) el.shareToast.hidden = true;
    }, 6000);
  }

  async function shareVideoCard(v) {
    const msg = buildVideoShareText(v);
    await copyToClipboard(msg);
    showShareToast("✓ Study link copied! Tap WhatsApp to send:", msg);
  }

  /* ==========================================================================
     ZERO-TYPING "3-TAP VISUAL COMPASS" (Language -> Situation -> Chapter)
     ========================================================================== */
  function renderVisualCompass() {
    if (!el.visualCompass) return;

    if (state.userRole === "teacher" || state.pickIds.length > 0) {
      el.visualCompass.hidden = true;
      return;
    }
    el.visualCompass.hidden = false;

    if (el.compassBody) {
      el.compassBody.hidden = state.compassCollapsed;
    }
    if (el.compassToggleBtn) {
      el.compassToggleBtn.setAttribute(
        "aria-expanded",
        state.compassCollapsed ? "false" : "true"
      );
      el.compassToggleBtn.textContent = state.compassCollapsed
        ? "🧭 Show 3-Tap Compass ▾"
        : "Hide Compass ▴";
    }

    if (state.compassCollapsed) return;

    // TAP 1: Comfort Language (Visible Native Script Pills)
    if (el.compassLangs) {
      el.compassLangs.replaceChildren();
      const pool = filterVideosCustom({ lang: "all" });
      const counts = new Map();
      for (const v of pool) {
        if (v.language) {
          counts.set(v.language, (counts.get(v.language) || 0) + 1);
        }
      }

      const orderedLangs = state.allLanguages.slice().sort((a, b) => {
        const ia = COMPASS_LANG_ORDER.indexOf(a);
        const ib = COMPASS_LANG_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return (counts.get(b) || 0) - (counts.get(a) || 0);
      });

      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "compass-lang-pill";
      allBtn.setAttribute("aria-pressed", state.lang === "all" ? "true" : "false");
      allBtn.textContent = "🌐 All ";
      const allCnt = document.createElement("span");
      allCnt.className = "compass-lang-cnt";
      allCnt.textContent = String(pool.length);
      allBtn.appendChild(allCnt);
      allBtn.addEventListener("click", () => {
        state.lang = "all";
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      });
      el.compassLangs.appendChild(allBtn);

      for (const lg of orderedLangs) {
        const meta = getLangMeta(lg);
        const c = counts.get(lg) || 0;
        const btn = document.createElement("button");
        btn.type = "button";
        const active = state.lang === lg;
        btn.className = `compass-lang-pill${c === 0 && !active ? " is-zero" : ""}`;
        btn.dataset.lang = lg;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        if (c === 0) {
          btn.title = `0 direct matches for current filter — tap to browse available ${lg} chapters`;
        }

        const lbl = document.createElement("span");
        lbl.textContent = meta.pill;

        const cnt = document.createElement("span");
        cnt.className = "compass-lang-cnt";
        cnt.textContent = String(c);

        btn.append(lbl, cnt);
        btn.addEventListener("click", () => {
          state.lang = state.lang === lg ? "all" : lg;
          state.flatLimit = FLAT_PAGE_SIZE;
          renderAll({ announce: true });
        });
        el.compassLangs.appendChild(btn);
      }
    }

    // TAP 1B: 1-Tap Exam / Contest / Board Stream Pills
    if (el.compassExams) {
      el.compassExams.replaceChildren();
      if (el.compassExamBadge) {
        el.compassExamBadge.textContent =
          CFG.platformId === "olympiad"
            ? "Contest Track"
            : CFG.platformId === "board" || CFG.platformId === "upboard"
              ? "Board Stream"
              : "Exam Track";
      }
      const exPool = filterVideosCustom({ exam: "all" });
      const exCounts = new Map();
      for (const v of exPool) {
        if (v.target_exam) {
          exCounts.set(v.target_exam, (exCounts.get(v.target_exam) || 0) + 1);
        }
      }

      const allExBtn = document.createElement("button");
      allExBtn.type = "button";
      allExBtn.className = "compass-lang-pill";
      allExBtn.setAttribute("aria-pressed", state.exam === "all" ? "true" : "false");
      allExBtn.textContent = "🎓 All ";
      const allExCnt = document.createElement("span");
      allExCnt.className = "compass-lang-cnt";
      allExCnt.textContent = String(exPool.length);
      allExBtn.appendChild(allExCnt);
      allExBtn.addEventListener("click", () => {
        state.exam = "all";
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      });
      el.compassExams.appendChild(allExBtn);

      for (const ex of state.allExams) {
        const ec = exCounts.get(ex) || 0;
        const active = state.exam === ex;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `compass-lang-pill${ec === 0 && !active ? " is-zero" : ""}`;
        btn.dataset.exam = ex;
        btn.setAttribute("aria-pressed", active ? "true" : "false");

        const lbl = document.createElement("span");
        lbl.textContent = ex;

        const cnt = document.createElement("span");
        cnt.className = "compass-lang-cnt";
        cnt.textContent = String(ec);

        btn.append(lbl, cnt);
        btn.addEventListener("click", () => {
          state.exam = state.exam === ex ? "all" : ex;
          state.flatLimit = FLAT_PAGE_SIZE;
          renderAll({ announce: true });
        });
        el.compassExams.appendChild(btn);
      }
    }

    // TAP 2: 4 Honest Student Situation Cards
    if (el.compassSituations) {
      el.compassSituations.replaceChildren();
      for (const sit of STUDENT_SITUATIONS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "situation-card";
        btn.dataset.situation = sit.key;
        const active = state.sort === sit.key;
        btn.setAttribute("aria-pressed", active ? "true" : "false");

        const title = document.createElement("span");
        title.className = "situation-title";
        title.textContent = sit.title;

        const desc = document.createElement("span");
        desc.className = "situation-desc";
        desc.textContent = sit.desc;

        btn.append(title, desc);
        btn.addEventListener("click", () => {
          state.sort = state.sort === sit.key ? "trending" : sit.key;
          state.flatLimit = FLAT_PAGE_SIZE;
          renderAll({ announce: true });
        });
        el.compassSituations.appendChild(btn);
      }
    }

    // TAP 3: Pick Subject & Textbook Chapter (NCERT Numbers + English + Native Script)
    const chPool = filterVideosCustom({ chapterNo: 0 });
    const chCounts = new Map();
    for (const v of chPool) {
      chCounts.set(v.chapter_no, (chCounts.get(v.chapter_no) || 0) + 1);
    }

    const candidateChapters = state.syllabus.filter((ch) => {
      if (
        state.subject !== "All" &&
        state.subject !== "Saved" &&
        ch.subject !== state.subject
      ) {
        return false;
      }
      if (
        state.classLevel !== "all" &&
        state.classLevel !== "dropper" &&
        state.chapterNo !== ch.chapter_no &&
        (chCounts.get(ch.chapter_no) || 0) === 0
      ) {
        return false;
      }
      return true;
    });

    const step3Badge = el.visualCompass?.querySelector(
      ".compass-step3-bar .compass-step-badge"
    );
    if (step3Badge) {
      step3Badge.textContent = IS_OLYMPIAD
        ? "Tap 3 · Pick Contest Module"
        : "Tap 3 · Pick Textbook Chapter";
    }

    if (el.compassChapterSelect) {
      const chRows = [
        [
          "0",
          IS_OLYMPIAD
            ? `📖 All ${candidateChapters.length} Modules — Pick Mod 01, Mod 02 (English + हिंदी)`
            : `📖 All ${candidateChapters.length} Chapters — Pick Ch 01, Ch 02 (English + हिंदी)`,
        ],
      ];
      for (const ch of candidateChapters) {
        const ped = getChapterPedagogy(ch.chapter_no);
        const roi = getRoiMeta(ped.roi);
        const hiShort = shortHindiLabel(ped.hi);
        const doneMark = state.doneChapters.has(String(ch.chapter_no))
          ? "✓ "
          : roi.isEasy
            ? "🟢 "
            : "";
        const cnt = chCounts.get(ch.chapter_no) || 0;
        chRows.push([
          String(ch.chapter_no),
          `${doneMark}${UNIT_SHORT} ${pad2(ch.chapter_no)} · ${ch.chapter}${hiShort && hiShort !== ch.chapter ? ` — ${hiShort}` : ""} (${cnt})`,
        ]);
      }
      setSelectOptions(el.compassChapterSelect, chRows, state.chapterNo || 0);
      el.compassChapterSelect.classList.toggle(
        "is-filtered",
        state.chapterNo > 0
      );
    }

    if (el.compassChapters) {
      el.compassChapters.replaceChildren();
      // Curate quick chips: active chapter first (if any), then starter / high-ROI chapters across subjects
      const quickList = [];
      if (state.chapterNo > 0) {
        const activeCh = state.syllabusByNo.get(state.chapterNo);
        if (activeCh) quickList.push(activeCh);
      }
      const sortedCandidates = candidateChapters.slice().sort((a, b) => {
        const pa = getChapterPedagogy(a.chapter_no);
        const pb = getChapterPedagogy(b.chapter_no);
        if (state.sort === "easy_scoring") {
          const rDiff = getRoiMeta(pb.roi).rank - getRoiMeta(pa.roi).rank;
          if (rDiff !== 0) return rDiff;
        }
        // Prefer starter chapters (prereq === 0) & early textbook chapters
        const aStarter = pa.prereq === 0 ? 1 : 0;
        const bStarter = pb.prereq === 0 ? 1 : 0;
        if (bStarter !== aStarter) return bStarter - aStarter;
        return a.chapter_no - b.chapter_no;
      });
      for (const ch of sortedCandidates) {
        if (quickList.length >= 8) break;
        if (!quickList.some((x) => x.chapter_no === ch.chapter_no)) {
          quickList.push(ch);
        }
      }

      for (const ch of quickList) {
        const ped = getChapterPedagogy(ch.chapter_no);
        const hiShort = shortHindiLabel(ped.hi);
        const chip = document.createElement("button");
        chip.type = "button";
        const isCurrent = state.chapterNo === ch.chapter_no;
        chip.className = `compass-ch-pill${isCurrent ? " is-active" : ""}`;
        const shortEng =
          ch.chapter.length > 24 ? `${ch.chapter.slice(0, 22)}…` : ch.chapter;
        chip.textContent =
          hiShort && hiShort !== ch.chapter
            ? `${UNIT_SHORT} ${pad2(ch.chapter_no)} · ${shortEng} (${hiShort})`
            : `${UNIT_SHORT} ${pad2(ch.chapter_no)} · ${shortEng}`;
        chip.addEventListener("click", () => {
          jumpToChapter(isCurrent ? 0 : ch.chapter_no);
        });
        el.compassChapters.appendChild(chip);
      }
    }
  }

  /* ==========================================================================
     PHONETIC HINGLISH & VOICE MATCH HELPER BANNER
     ========================================================================== */
  function renderPhoneticBanner() {
    if (!el.phoneticBanner) return;
    el.phoneticBanner.replaceChildren();

    if (state.voiceFallbackOpen && !state.query) {
      el.phoneticBanner.hidden = false;
      const msg = document.createElement("span");
      msg.innerHTML =
        "<strong>🎤 Quick Hinglish Topics:</strong> Tap a spoken keyword or type in the search box:";
      el.phoneticBanner.appendChild(msg);

      const sampleChips =
        CFG.platformId === "neet"
          ? ["Anuvanshikta", "DNA", "Koshika", "Bijli", "Prakash", "Carbon", "12th Physics Ch 1"]
          : CFG.platformId === "olympiad"
            ? ["Number Theory", "Combinatorics", "IOQM", "Trikonmiti", "Mod 1", "NSEP"]
            : CFG.platformId === "upboard"
              ? ["समाकलन", "विद्युत धारा", "कार्बनिक रसायन", "त्रिकोणमिति", "12वीं भौतिकी अध्याय 1"]
              : ["Samakalan", "Avkalan", "Trikonmiti", "Bijli", "Prakash", "Carbon", "12th Physics Ch 1"];

      for (const word of sampleChips) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "phonetic-jump-btn";
        b.textContent = word;
        b.addEventListener("click", () => {
          state.voiceFallbackOpen = false;
          state.query = word;
          if (el.q) el.q.value = word;
          syncSearchClear();
          renderAll({ announce: true });
        });
        el.phoneticBanner.appendChild(b);
      }
      return;
    }

    if (!state.query) {
      el.phoneticBanner.hidden = true;
      return;
    }

    const plan = analyzeStudentQuery(state.query);
    if (!plan.bannerTitle && !plan.suggestedChapters.length) {
      el.phoneticBanner.hidden = true;
      return;
    }

    el.phoneticBanner.hidden = false;
    const lead = document.createElement("span");
    const st = document.createElement("strong");
    st.textContent = `💡 Smart Match: ${plan.bannerTitle || state.query}`;
    lead.append(
      st,
      document.createTextNode(
        plan.suggestedChapters.length
          ? ` — Open 1 → 2 → 3 ${UNIT_SINGULAR} Roadmap:`
          : ""
      )
    );
    el.phoneticBanner.appendChild(lead);

    for (const ch of plan.suggestedChapters) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "phonetic-jump-btn";
      btn.textContent = `📖 ${UNIT_SHORT} ${pad2(ch.chapter_no)}: ${ch.chapter}`;
      btn.addEventListener("click", () => {
        state.query = "";
        if (el.q) el.q.value = "";
        syncSearchClear();
        jumpToChapter(ch.chapter_no);
      });
      el.phoneticBanner.appendChild(btn);
    }
  }

  /* ==========================================================================
     STUDIO v5.0: RESUME LAST LECTURE BAR, ASSIGNED PACK & HOMEWORK TRAY
     ========================================================================== */
  function resolveLastLectureVideo() {
    const last = state.lastLecture;
    if (!last || typeof last !== "object") return null;
    return (
      state.videos.find(
        (v) =>
          (last.key && v._key === last.key) ||
          (last.video_id && String(v.video_id) === String(last.video_id))
      ) || null
    );
  }

  function renderContinueStudyBar() {
    if (!el.continueStudyBar) return;
    const lastVideo = resolveLastLectureVideo();
    if (
      !lastVideo ||
      state.continueDismissed ||
      state.userRole !== "student" ||
      state.pickIds.length > 0
    ) {
      el.continueStudyBar.hidden = true;
      return;
    }

    el.continueStudyBar.hidden = false;
    if (el.continueStudyText) {
      el.continueStudyText.textContent = `Continue: ${UNIT_SHORT} ${pad2(lastVideo.chapter_no)} · ${lastVideo.title}`;
    }
    if (el.continueChText) {
      el.continueChText.textContent = `🧭 ${UNIT_SHORT} ${pad2(lastVideo.chapter_no)} Roadmap`;
    }

    if (el.studyStreakPill) {
      const streak = computeStudyStreak();
      const doneCnt = state.doneVideos.size;
      if (streak >= 1 || doneCnt >= 1) {
        el.studyStreakPill.hidden = false;
        el.studyStreakPill.textContent =
          streak >= 1
            ? `🔥 ${streak}d Streak · ${doneCnt} Done`
            : `✅ ${doneCnt} Done`;
      } else {
        el.studyStreakPill.hidden = true;
      }
    }
  }

  function renderAssignedPackSection() {
    if (!el.assignedPackSection) return false;
    if (!state.pickIds.length) {
      el.assignedPackSection.hidden = true;
      el.assignedPackSection.replaceChildren();
      return false;
    }

    el.assignedPackSection.hidden = false;
    el.assignedPackSection.replaceChildren();

    const packVideos = resolvePickIdsToVideos(state.pickIds);
    const head = document.createElement("div");
    head.className = "assigned-pack-head";

    const titleCol = document.createElement("div");
    titleCol.className = "assigned-pack-title-col";

    const kicker = document.createElement("span");
    kicker.className = "assigned-pack-kicker";
    kicker.textContent = "📋 Classroom Homework Assignment";

    const h2 = document.createElement("h2");
    h2.id = "assigned-pack-heading";
    h2.className = "assigned-pack-h2";

    const sub = document.createElement("p");
    sub.className = "assigned-pack-sub";

    if (!packVideos.length) {
      h2.textContent = "Assigned Pack Not Found in This Catalog";
      sub.textContent =
        "None of the lecture IDs in this ?pick= link matched this platform's verified video dataset.";
      titleCol.append(kicker, h2, sub);

      const exitBtn = document.createElement("button");
      exitBtn.type = "button";
      exitBtn.className = "hw-btn is-primary";
      exitBtn.textContent = "Browse All Verified Lectures";
      exitBtn.addEventListener("click", () => {
        state.pickIds = [];
        renderAll({ announce: true });
      });

      const actCol = document.createElement("div");
      actCol.className = "assigned-pack-actions";
      actCol.appendChild(exitBtn);
      head.append(titleCol, actCol);
      el.assignedPackSection.appendChild(head);
      return false;
    }

    const chNames = Array.from(
      new Set(
        packVideos.map((v) => `${UNIT_SHORT} ${pad2(v.chapter_no)} ${v.chapter}`)
      )
    );
    h2.textContent = `Assigned Study Pack (${packVideos.length} Curated Lecture${packVideos.length === 1 ? "" : "s"})`;
    sub.textContent = `Work through these lectures in numbered order · Covers: ${chNames.slice(0, 4).join(" · ")}${chNames.length > 4 ? ` +${chNames.length - 4} more` : ""}`;
    titleCol.append(kicker, h2, sub);

    const actions = document.createElement("div");
    actions.className = "assigned-pack-actions";

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "hw-btn is-primary";
    startBtn.textContent = "▶ Start Lecture #1";
    startBtn.addEventListener("click", () => openPlayer(packVideos[0]));

    const waBtn = document.createElement("button");
    waBtn.type = "button";
    waBtn.className = "hw-btn is-wa";
    waBtn.textContent = "📲 Share Pack on WhatsApp";
    waBtn.addEventListener("click", async () => {
      const payload = buildHomeworkPackSharePayload(state.pickIds);
      await copyToClipboard(payload.text);
      showShareToast("✓ Classroom Assignment copied! Opening WhatsApp…", payload.text);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(payload.text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "hw-btn";
    copyBtn.textContent = "🔗 Copy Pack Link";
    copyBtn.addEventListener("click", async () => {
      const payload = buildHomeworkPackSharePayload(state.pickIds);
      await copyToClipboard(payload.url);
      showShareToast("✓ Direct assignment link (?pick=…) copied!", payload.text);
    });

    const exitBtn = document.createElement("button");
    exitBtn.type = "button";
    exitBtn.className = "hw-btn";
    exitBtn.textContent = "✕ Exit Pack · All Lectures";
    exitBtn.addEventListener("click", () => {
      state.pickIds = [];
      renderAll({ announce: true });
    });

    actions.append(startBtn, waBtn, copyBtn, exitBtn);
    head.append(titleCol, actions);
    el.assignedPackSection.appendChild(head);

    const doneInPack = packVideos.filter((v) =>
      state.doneVideos.has(v._key)
    ).length;
    const progRow = document.createElement("div");
    progRow.className = "assigned-pack-progress-row";
    const progTxt = document.createElement("span");
    progTxt.textContent = `✅ ${doneInPack} / ${packVideos.length} Assigned Lectures Completed`;
    const progBar = document.createElement("progress");
    progBar.max = packVideos.length;
    progBar.value = doneInPack;
    progBar.setAttribute(
      "aria-label",
      `${doneInPack} of ${packVideos.length} assigned lectures completed`
    );
    progRow.append(progTxt, progBar);
    el.assignedPackSection.appendChild(progRow);

    const grid = document.createElement("div");
    grid.className = "cards-grid";
    packVideos.forEach((v, idx) => {
      grid.appendChild(
        createVideoCard(v, {
          assignIndex: idx + 1,
          highPriority: idx < 2,
          lazyImage: idx >= 6,
        })
      );
    });
    el.assignedPackSection.appendChild(grid);
    return true;
  }

  function renderHomeworkTray() {
    const packVideos = resolvePickIdsToVideos(state.homeworkPack);
    if (el.cntPack) el.cntPack.textContent = String(packVideos.length);
    if (el.homeworkPackBtn) {
      el.homeworkPackBtn.setAttribute(
        "aria-pressed",
        state.homeworkTrayOpen ? "true" : "false"
      );
      el.homeworkPackBtn.classList.toggle("has-items", packVideos.length > 0);
    }

    if (!el.homeworkTray) return;
    if (!state.homeworkTrayOpen) {
      el.homeworkTray.hidden = true;
      return;
    }

    el.homeworkTray.hidden = false;
    if (el.hwTrayTitle) {
      el.hwTrayTitle.textContent = `📋 Classroom Homework Pack (${packVideos.length})`;
    }
    if (el.hwTrayHint) {
      el.hwTrayHint.textContent = packVideos.length
        ? "Share 1 custom ?pick= link or formatted WhatsApp assignment with your students:"
        : "Tap “📋 Assign” on 2–8 lecture cards across chapters to build a custom Classroom Pack.";
    }

    if (el.hwTrayChips) {
      el.hwTrayChips.replaceChildren();
      packVideos.forEach((v, idx) => {
        const chip = document.createElement("span");
        chip.className = "hw-chip";

        const txt = document.createElement("span");
        txt.className = "hw-chip-txt";
        txt.textContent = `${idx + 1}. ${UNIT_SHORT} ${pad2(v.chapter_no)} · ${v.title}`;

        const rm = document.createElement("button");
        rm.type = "button";
        rm.className = "hw-chip-rm";
        rm.textContent = "✕";
        rm.setAttribute(
          "aria-label",
          `Remove from Homework Pack: ${v.title}`
        );
        rm.addEventListener("click", () => {
          toggleHomeworkPack(v);
          renderAll({ announce: false });
        });

        chip.append(txt, rm);
        el.hwTrayChips.appendChild(chip);
      });
    }

    const empty = packVideos.length === 0;
    if (el.hwWhatsappBtn) el.hwWhatsappBtn.disabled = empty;
    if (el.hwCopyBtn) el.hwCopyBtn.disabled = empty;
    if (el.hwPreviewBtn) el.hwPreviewBtn.disabled = empty;
    if (el.hwClearBtn) el.hwClearBtn.disabled = empty;
  }

  /* ==========================================================================
     THE "1 -> 2 -> 3 CHAPTER ROADMAP", CHEAT-SHEET & PREREQUISITE BRIDGE
     ========================================================================== */
  function renderChapterRoadmap() {
    if (!el.chapterRoadmap) return;
    if (
      state.pickIds.length > 0 ||
      !state.chapterNo ||
      !state.syllabusByNo.has(state.chapterNo)
    ) {
      el.chapterRoadmap.hidden = true;
      el.chapterRoadmap.replaceChildren();
      return;
    }

    const chMeta = state.syllabusByNo.get(state.chapterNo);
    const ped = getChapterPedagogy(state.chapterNo);
    const roi = getRoiMeta(ped.roi);
    const isDone = state.doneChapters.has(String(chMeta.chapter_no));

    el.chapterRoadmap.hidden = false;
    el.chapterRoadmap.replaceChildren();

    // 1. Top Header: Chapter Tag + NCERT Ref + ROI Badge + Est Hours + Done & WhatsApp Actions
    const top = document.createElement("div");
    top.className = "roadmap-top";

    const titleBlock = document.createElement("div");
    titleBlock.className = "roadmap-title-block";

    const badgesRow = document.createElement("div");
    badgesRow.className = "roadmap-badges-row";

    const chTag = document.createElement("span");
    chTag.className = "roadmap-ch-tag";
    const shortSubj = CFG.subjectMeta[chMeta.subject]?.short || chMeta.subject;
    chTag.textContent = `${UNIT_SHORT} ${pad2(chMeta.chapter_no)} · ${shortSubj} · ${ped.ref}`;

    const roiSpan = document.createElement("span");
    roiSpan.className = `roi-badge ${roi.cls}`;
    roiSpan.textContent = roi.label;

    const hrsSpan = document.createElement("span");
    hrsSpan.className = "est-hours-badge";
    hrsSpan.textContent = `⏱ ~${ped.est_hours}h Mastery`;

    badgesRow.append(chTag, roiSpan, hrsSpan);

    const h2 = document.createElement("h2");
    h2.className = "roadmap-h2";
    h2.textContent = chMeta.chapter;

    titleBlock.append(badgesRow, h2);
    if (ped.hi && ped.hi !== chMeta.chapter) {
      const subHi = document.createElement("p");
      subHi.className = "roadmap-sub-hi";
      subHi.textContent = `📘 ${ped.hi}`;
      titleBlock.appendChild(subHi);
    }

    const actions = document.createElement("div");
    actions.className = "roadmap-actions";

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "roadmap-done-btn";
    doneBtn.setAttribute("aria-pressed", isDone ? "true" : "false");
    doneBtn.textContent = isDone
      ? "✅ Understood & Completed"
      : "☐ Mark Understood & Completed";
    doneBtn.addEventListener("click", () => {
      toggleChapterDone(chMeta.chapter_no);
      renderAll({ announce: true });
    });

    const waBtn = document.createElement("button");
    waBtn.type = "button";
    waBtn.className = "roadmap-wa-btn";
    waBtn.textContent = `📲 WhatsApp ${UNIT_SINGULAR}`;
    waBtn.addEventListener("click", async () => {
      const payload = buildCurrentViewSharePayload(chMeta.chapter_no);
      await copyToClipboard(payload.text);
      showShareToast(
        `✓ ${UNIT_SHORT} ${pad2(chMeta.chapter_no)} study roadmap link copied!`,
        payload.text
      );
    });

    actions.append(doneBtn, waBtn);
    top.append(titleBlock, actions);
    el.chapterRoadmap.appendChild(top);

    // 2. Prerequisite Bridge ("Know This First")
    const prereqCh =
      ped.prereq > 0 ? state.syllabusByNo.get(ped.prereq) : null;
    const bridge = document.createElement("div");
    bridge.className = `prereq-bridge${prereqCh ? "" : " is-starter"}`;

    const bridgeTxt = document.createElement("span");
    bridgeTxt.className = "prereq-text";
    if (prereqCh) {
      const bStrong = document.createElement("strong");
      bStrong.textContent = "💡 Prerequisite Tip (Know This First): ";
      bridgeTxt.append(bStrong, document.createTextNode(ped.tip));
      bridge.appendChild(bridgeTxt);

      const jumpBtn = document.createElement("button");
      jumpBtn.type = "button";
      jumpBtn.className = "roadmap-prereq-btn";
      jumpBtn.textContent = `🔗 Review ${UNIT_SHORT} ${pad2(prereqCh.chapter_no)}: ${prereqCh.chapter} →`;
      jumpBtn.addEventListener("click", () => {
        jumpToChapter(prereqCh.chapter_no);
      });
      bridge.appendChild(jumpBtn);
    } else {
      const bStrong = document.createElement("strong");
      bStrong.textContent = `🌱 Starter ${UNIT_SINGULAR} (Zero Prerequisites): `;
      bridgeTxt.append(bStrong, document.createTextNode(ped.tip));
      bridge.appendChild(bridgeTxt);
    }
    el.chapterRoadmap.appendChild(bridge);

    // 2B. Interactive Quick Concept Sheet, #1 Exam Trap & 3-Point Mastery Self-Check
    const chKey = String(chMeta.chapter_no);
    const savedChecks = Array.isArray(state.selfCheck[chKey])
      ? state.selfCheck[chKey]
      : [];
    const checkItems = Array.isArray(ped.check) ? ped.check.slice(0, 3) : [];
    const checkedCount = checkItems.filter((_, idx) =>
      Boolean(savedChecks[idx])
    ).length;

    const sheet = document.createElement("details");
    sheet.className = "roadmap-cheatsheet";
    sheet.open = state.cheatsheetOpen !== false;
    sheet.addEventListener("toggle", () => {
      state.cheatsheetOpen = sheet.open;
    });

    const summary = document.createElement("summary");
    summary.className = "roadmap-cheatsheet-summary";

    const sumTitle = document.createElement("span");
    sumTitle.textContent =
      "📘 Quick Concept Sheet, #1 Exam Trap & 3-Point Mastery Self-Check";

    const sumMeta = document.createElement("span");
    sumMeta.className = "cheatsheet-summary-meta";
    sumMeta.textContent = `✅ ${checkedCount}/${checkItems.length} Checkpoints · ~${ped.est_hours}h`;

    summary.append(sumTitle, sumMeta);
    sheet.appendChild(summary);

    const sheetBody = document.createElement("div");
    sheetBody.className = "roadmap-cheatsheet-body";

    // Card 1: Must-Know Concepts & Formulas
    const mustCard = document.createElement("div");
    mustCard.className = "cheatsheet-card";
    const mustLbl = document.createElement("span");
    mustLbl.className = "cheatsheet-card-label";
    mustLbl.textContent = "🔑 Must-Know Concepts & Formulas";
    const mustUl = document.createElement("ul");
    mustUl.className = "must-know-list";
    for (const item of ped.must_know) {
      const li = document.createElement("li");
      li.textContent = item;
      mustUl.appendChild(li);
    }
    mustCard.append(mustLbl, mustUl);

    // Card 2: #1 Exam Trap Alert
    const trapCard = document.createElement("div");
    trapCard.className = "cheatsheet-card trap-callout";
    const trapLbl = document.createElement("span");
    trapLbl.className = "cheatsheet-card-label";
    trapLbl.textContent = "⚠️ #1 Exam Trap Alert";
    const trapP = document.createElement("p");
    trapP.className = "trap-text";
    trapP.textContent = ped.trap;
    trapCard.append(trapLbl, trapP);

    // Card 3: 3-Point Mastery Self-Check (<fieldset> + <legend>)
    const checkFieldset = document.createElement("fieldset");
    checkFieldset.className = "self-check-fieldset";
    const legend = document.createElement("legend");
    legend.className = "self-check-legend";
    legend.textContent = `✅ 3-Point Mastery Self-Check (${checkedCount}/${checkItems.length})`;
    checkFieldset.appendChild(legend);

    checkItems.forEach((promptTxt, idx) => {
      const cbId = `sc-${chMeta.chapter_no}-${idx}`;
      const isChecked = Boolean(savedChecks[idx]);
      const lbl = document.createElement("label");
      lbl.className = `self-check-item${isChecked ? " is-checked" : ""}`;
      lbl.htmlFor = cbId;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = cbId;
      cb.checked = isChecked;

      const txtSpan = document.createElement("span");
      txtSpan.textContent = promptTxt;

      cb.addEventListener("change", () => {
        const currentArr = Array.isArray(state.selfCheck[chKey])
          ? state.selfCheck[chKey].slice(0, checkItems.length)
          : new Array(checkItems.length).fill(false);
        while (currentArr.length < checkItems.length) currentArr.push(false);
        currentArr[idx] = cb.checked;
        state.selfCheck[chKey] = currentArr;
        saveJson(SELF_CHECK_KEY, state.selfCheck);

        const nowTotal = currentArr.filter(Boolean).length;
        if (cb.checked) recordStudyActivity();
        if (nowTotal === checkItems.length && !state.doneChapters.has(chKey)) {
          state.doneChapters.add(chKey);
          saveSet(DONE_KEY, state.doneChapters);
          showShareToast(
            `🎉 All 3 checkpoints mastered! ${UNIT_SHORT} ${pad2(chMeta.chapter_no)} marked Completed.`,
            "",
            true
          );
        }
        renderAll({ announce: false });
      });

      lbl.append(cb, txtSpan);
      checkFieldset.appendChild(lbl);
    });

    if (checkedCount === checkItems.length && checkItems.length > 0) {
      const completeNote = document.createElement("p");
      completeNote.className = "self-check-complete-note";
      completeNote.textContent = "🎉 All 3 mastery checkpoints verified!";
      checkFieldset.appendChild(completeNote);
    }

    sheetBody.append(mustCard, trapCard, checkFieldset);
    sheet.appendChild(sheetBody);
    el.chapterRoadmap.appendChild(sheet);

    // 3. Guided 3-Step Video Sequence ("Where Should I Click First?")
    const langPool = state.videos
      .filter(
        (v) =>
          v.chapter_no === chMeta.chapter_no &&
          (state.lang === "all" || v.language === state.lang)
      )
      .sort(comparePureTrend);
    const fullChPool = state.videos
      .filter((v) => v.chapter_no === chMeta.chapter_no)
      .sort(comparePureTrend);
    const sourcePool = langPool.length >= 2 ? langPool : fullChPool;

    if (sourcePool.length > 0) {
      const usedKeys = new Set();
      const pickStep = (predicate) => {
        let hit = langPool.find((v) => !usedKeys.has(v._key) && predicate(v));
        if (!hit) {
          hit = fullChPool.find((v) => !usedKeys.has(v._key) && predicate(v));
        }
        if (!hit) {
          hit = sourcePool.find((v) => !usedKeys.has(v._key));
        }
        if (hit) usedKeys.add(hit._key);
        return hit || null;
      };

      const step1 = pickStep(
        (v) => v._vibe.key === "beginner" || v.provider === "playlist"
      );
      const step2 = pickStep(
        (v) => v._vibe.key === "oneshot" || v._vibe.key === "recap"
      );
      const step3 = pickStep((v) => v._vibe.key === "pyq" || v._isPyq);

      const steps = [
        {
          kicker: "🥇 Step 1: Understand From Scratch",
          sub: "Best Foundational / Full Course",
          video: step1,
        },
        {
          kicker: "🥈 Step 2: Master Fast Revision",
          sub: "Best Complete 1-Shot Lecture",
          video: step2,
        },
        {
          kicker: "🥉 Step 3: Crack Exam Questions",
          sub: "Best PYQ & Numericals Session",
          video: step3,
        },
      ].filter((s) => Boolean(s.video));

      if (steps.length) {
        const seqHead = document.createElement("p");
        seqHead.className = "roadmap-seq-head";
        seqHead.textContent =
          "🧭 Where Should I Click First? Follow this 1 → 2 → 3 study order:";
        el.chapterRoadmap.appendChild(seqHead);

        const grid = document.createElement("div");
        grid.className = "roadmap-steps-grid";

        steps.forEach((st, idx) => {
          const v = st.video;
          const card = document.createElement("div");
          card.className = "roadmap-step-card";

          const kicker = document.createElement("span");
          kicker.className = "step-kicker";
          kicker.textContent = st.kicker;

          const title = document.createElement("h3");
          title.className = "step-title";
          title.textContent = v.title;

          const meta = document.createElement("span");
          meta.className = "step-meta";
          const lBadge = getLangMeta(v.language || "Hinglish").pill;
          meta.textContent = `${v.educator || v.channel} · ${lBadge} · ${getDurationBadge(v)}`;

          const act = document.createElement("div");
          act.className = "step-actions";

          const watchBtn = document.createElement("button");
          watchBtn.type = "button";
          watchBtn.className = "step-watch-btn";
          watchBtn.textContent = `▶ Start Step ${idx + 1}`;
          watchBtn.addEventListener("click", () => openPlayer(v));

          const saveBtn = document.createElement("button");
          saveBtn.type = "button";
          saveBtn.className = "step-save-btn";
          const isSaved = state.saved.has(v._key);
          saveBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
          saveBtn.setAttribute(
            "aria-label",
            `Save Step ${idx + 1} lecture for revision: ${v.title}`
          );
          saveBtn.textContent = isSaved ? "🔖✓" : "🔖";
          saveBtn.addEventListener("click", () => {
            toggleSavedVideo(v);
            renderAll({ announce: false });
          });

          const ytLink = document.createElement("a");
          ytLink.className = "step-yt-btn";
          ytLink.href = v.url;
          ytLink.target = "_blank";
          ytLink.rel = "noopener noreferrer";
          ytLink.textContent = "↗ YT";
          ytLink.setAttribute("aria-label", `Open Step ${idx + 1} on YouTube`);

          act.append(watchBtn, saveBtn, ytLink);
          card.append(kicker, title, meta, act);
          grid.appendChild(card);
        });

        el.chapterRoadmap.appendChild(grid);
      }
    }
  }

  /* ==========================================================================
     RENDERING: TABS, INLINE PILLS, DYNAMIC DROPDOWNS & BILINGUAL TREES
     ========================================================================== */
  function applyStaticBrandConfig() {
    document.documentElement.dataset.platform = CFG.platformId;
    if (el.brandGlyph) el.brandGlyph.textContent = CFG.brandSymbol;
    if (el.brandName) el.brandName.textContent = CFG.brandName;
    if (el.q) {
      el.q.placeholder =
        CFG.searchPlaceholder ||
        "Type or 🎤 speak chapter, topic, language, or educator…";
    }

    const chFilterPlaceholder =
      CFG.platformId === "olympiad"
        ? "Find Mod 01, Number Theory, Combinatorics, IOQM…"
        : CFG.platformId === "neet"
          ? "Find Ch 01, Genetics, DNA, Anuvanshikta, Koshika…"
          : CFG.platformId === "board"
            ? "Find Ch 01, Calculus, Electricity, Life Processes…"
            : CFG.platformId === "upboard"
              ? "अध्याय खोजें: Ch 01, समाकलन, विद्युत, कार्बन…"
              : "Find Ch 01, Samakalan, Bijli, GOC…";

    if (el.chFilter) el.chFilter.placeholder = chFilterPlaceholder;
    if (el.drawerChFilter) el.drawerChFilter.placeholder = chFilterPlaceholder;
    if (el.clearChapterBtn) {
      el.clearChapterBtn.textContent = `All ${UNIT_PLURAL.toLowerCase()}`;
    }
    if (el.drawerAllChBtn) {
      el.drawerAllChBtn.textContent = `All ${UNIT_PLURAL}`;
    }
    if (el.drawerTitle) {
      el.drawerTitle.textContent = IS_OLYMPIAD
        ? "📚 Pick Olympiad Module"
        : "📚 Pick Textbook Chapter";
    }
    if (el.syllabusTree && IS_OLYMPIAD) {
      el.syllabusTree.setAttribute(
        "aria-label",
        "Olympiad modules grouped by subject and unit"
      );
    }

    if (el.ecosystemNav && Array.isArray(CFG.ecosystem) && CFG.ecosystem.length) {
      el.ecosystemNav.replaceChildren();
      for (const item of CFG.ecosystem) {
        const a = document.createElement("a");
        const isCurrent = item.id === CFG.platformId;
        a.className = `eco-pill${isCurrent ? " is-active" : ""}`;
        a.href = isCurrent ? "./" : item.url;
        if (isCurrent) a.setAttribute("aria-current", "page");

        const dot = document.createElement("span");
        dot.className = `eco-dot is-${item.id}`;
        dot.setAttribute("aria-hidden", "true");
        a.append(dot, document.createTextNode(item.name));
        el.ecosystemNav.appendChild(a);
      }
    }
  }

  function renderSubjectTabs() {
    if (!el.subjectTabs) return;
    el.subjectTabs.replaceChildren();

    const poolForSubj = filterVideosCustom({ subject: "All", chapterNo: 0 });
    const subjCounts = new Map();
    for (const v of poolForSubj) {
      subjCounts.set(v.subject, (subjCounts.get(v.subject) || 0) + 1);
    }

    const items = [
      { key: "All", label: "All", icon: "✦", count: poolForSubj.length },
      ...state.subjects.map((s) => {
        const meta = CFG.subjectMeta[s] || {};
        return {
          key: s,
          label: meta.short || s,
          icon: meta.icon || "•",
          count: subjCounts.get(s) || 0,
        };
      }),
    ];

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.className = "subj-pill-btn";
      btn.dataset.subject = item.key;
      const checked = state.subject === item.key;
      btn.setAttribute("aria-checked", checked ? "true" : "false");
      btn.tabIndex =
        checked || (state.subject === "Saved" && item.key === "All") ? 0 : -1;

      const glyph = document.createElement("span");
      glyph.className = "subj-glyph";
      glyph.setAttribute("aria-hidden", "true");
      glyph.textContent = item.icon;

      const txt = document.createElement("span");
      txt.textContent = item.label;

      const cnt = document.createElement("span");
      cnt.className = "subj-mini-cnt";
      cnt.textContent = String(item.count);

      btn.append(glyph, txt, cnt);
      btn.addEventListener("click", () => {
        state.pickIds = [];
        state.subject = item.key;
        if (state.chapterNo) {
          const ch = state.syllabusByNo.get(state.chapterNo);
          if (ch && item.key !== "All" && ch.subject !== item.key) {
            state.chapterNo = 0;
          }
        }
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      });
      el.subjectTabs.appendChild(btn);
    });
  }

  function renderClassPills() {
    if (!el.classPills) return;
    el.classPills.replaceChildren();
    const defs = getPlatformClassDefs();

    defs.forEach((def) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.className = "class-pill-btn";
      btn.dataset.classLevel = def.key;
      const checked = state.classLevel === def.key;
      btn.setAttribute("aria-checked", checked ? "true" : "false");
      btn.tabIndex = checked ? 0 : -1;
      btn.textContent = def.label;

      btn.addEventListener("click", () => {
        state.pickIds = [];
        state.classLevel = def.key;
        if (state.subject !== "All" && state.subject !== "Saved") {
          const check = filterVideosCustom({
            subject: state.subject,
            classLevel: def.key,
            chapterNo: 0,
          });
          if (check.length === 0) state.subject = "All";
        }
        if (state.chapterNo) {
          const chCheck = filterVideosCustom({
            chapterNo: state.chapterNo,
            classLevel: def.key,
          });
          if (chCheck.length === 0) state.chapterNo = 0;
        }
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      });

      el.classPills.appendChild(btn);
    });
  }

  function bindRadiogroupArrowKeys(container) {
    if (!container) return;
    container.addEventListener("keydown", (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      const radios = Array.from(container.querySelectorAll('[role="radio"]'));
      if (!radios.length) return;
      const idx = Math.max(0, radios.indexOf(document.activeElement));
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % radios.length;
      if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + radios.length) % radios.length;
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = radios.length - 1;
      e.preventDefault();
      radios[nextIdx].focus();
      radios[nextIdx].click();
    });
  }

  // Zero-Lag: rebuilding ~300 <option>s across 4 selects on every render caused
  // needless DOM churn + style recalc. Only rebuild when the option list changed.
  function setSelectOptions(select, rows, value) {
    const sig = rows.map((r) => `${r[0]}\u241e${r[1]}`).join("\u241f");
    if (select.__optSig !== sig) {
      const frag = document.createDocumentFragment();
      for (const [val, label] of rows) {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = label;
        frag.appendChild(opt);
      }
      select.replaceChildren(frag);
      select.__optSig = sig;
    }
    if (select.value !== String(value)) select.value = String(value);
  }

  function updateFacetedSelects() {
    // 1. Language Select
    if (el.langSelect) {
      const baseLangPool = filterVideosCustom({ lang: "all" });
      const counts = new Map();
      for (const v of baseLangPool) {
        if (v.language) counts.set(v.language, (counts.get(v.language) || 0) + 1);
      }
      const langs = Array.from(
        new Set([
          ...state.allLanguages,
          ...(state.lang !== "all" ? [state.lang] : []),
        ])
      ).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b));

      setSelectOptions(
        el.langSelect,
        [
          ["all", `🌐 All Languages (${baseLangPool.length.toLocaleString()})`],
          ...langs.map((lg) => [
            lg,
            `🌐 ${getLangMeta(lg).option} (${(counts.get(lg) || 0).toLocaleString()})`,
          ]),
        ],
        state.lang
      );
      el.langSelect.classList.toggle("is-filtered", state.lang !== "all");
    }

    // 2. Exam / Board Stream Select
    if (el.examSelect) {
      const baseExamPool = filterVideosCustom({ exam: "all" });
      const counts = new Map();
      for (const v of baseExamPool) {
        if (v.target_exam) {
          counts.set(v.target_exam, (counts.get(v.target_exam) || 0) + 1);
        }
      }
      const exams = Array.from(
        new Set([
          ...state.allExams,
          ...(state.exam !== "all" ? [state.exam] : []),
        ])
      ).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b));

      setSelectOptions(
        el.examSelect,
        [
          ["all", `🎓 All Streams (${baseExamPool.length.toLocaleString()})`],
          ...exams.map((ex) => [
            ex,
            `🎓 ${ex} (${(counts.get(ex) || 0).toLocaleString()})`,
          ]),
        ],
        state.exam
      );
      el.examSelect.classList.toggle("is-filtered", state.exam !== "all");
    }

    // 3. Educator / Channel Select
    if (el.educatorSelect) {
      const baseEduPool = filterVideosCustom({ educator: "" });
      const counts = new Map();
      for (const v of baseEduPool) {
        const name = v.educator || v.channel;
        if (name) counts.set(name, (counts.get(name) || 0) + 1);
      }
      const educators = Array.from(
        new Set([
          ...state.allEducators,
          ...(state.educator ? [state.educator] : []),
        ])
      ).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b));

      setSelectOptions(
        el.educatorSelect,
        [
          ["", `👨‍🏫 All Educators (${counts.size})`],
          ...educators.map((name) => [
            name,
            `👨‍🏫 ${name} (${counts.get(name) || 0})`,
          ]),
        ],
        state.educator
      );
      el.educatorSelect.classList.toggle("is-filtered", Boolean(state.educator));
    }

    // 4. Sort / Study Goal Select
    if (el.sortSelect) {
      el.sortSelect.value = state.sort;
      el.sortSelect.classList.toggle("is-filtered", state.sort !== "trending");
    }
  }

  function renderSyllabusTrees() {
    const chPool = filterVideosCustom({ chapterNo: 0 });
    const chCounts = new Map();
    for (const v of chPool) {
      chCounts.set(v.chapter_no, (chCounts.get(v.chapter_no) || 0) + 1);
    }

    const buildInto = (container, filterQuery, closeDrawerOnPick) => {
      if (!container) return;
      const q = (filterQuery || "").toLowerCase().trim();
      const qPlan = q ? analyzeStudentQuery(q) : null;

      const visibleChapters = state.syllabus.filter((ch) => {
        if (
          state.subject !== "All" &&
          state.subject !== "Saved" &&
          ch.subject !== state.subject
        ) {
          return false;
        }
        if (
          state.classLevel !== "all" &&
          state.classLevel !== "dropper" &&
          state.chapterNo !== ch.chapter_no &&
          (chCounts.get(ch.chapter_no) || 0) === 0
        ) {
          return false;
        }
        if (!q) return true;
        if (
          qPlan?.chapterMatchSet &&
          qPlan.chapterMatchSet.has(ch.chapter_no)
        ) {
          return true;
        }
        const ped = getChapterPedagogy(ch.chapter_no);
        const extra = CFG.acronyms[ch.chapter_no] || "";
        const hay =
          `${ch.chapter_no} ${pad2(ch.chapter_no)} ${ch.chapter} ${ped.hi} ${ped.ref} ${ch.unit} ${ch.subject} ${extra}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (qPlan?.expandGroups?.length) {
          return qPlan.expandGroups.some((g) =>
            g.expand.some((p) => hay.includes(p))
          );
        }
        return false;
      });

      if (el.railChTotal && !closeDrawerOnPick) {
        el.railChTotal.textContent = String(visibleChapters.length);
      }

      // Zero-Lag: the tree only changes when its membership, counts, done-state or
      // filter text change. Picking a chapter only moves aria-current, so patch that
      // in place instead of re-shaping ~80 bilingual rows of text (the dominant
      // Layout cost of a chapter tap).
      const treeSig = [
        state.subject,
        q,
        ...visibleChapters.map(
          (ch) =>
            `${ch.chapter_no}:${chCounts.get(ch.chapter_no) || 0}:${state.doneChapters.has(String(ch.chapter_no)) ? 1 : 0}`
        ),
      ].join("|");
      if (container.__treeSig === treeSig) {
        for (const btn of container.querySelectorAll(".ch-nav-btn[data-ch]")) {
          if (Number(btn.dataset.ch) === state.chapterNo) {
            btn.setAttribute("aria-current", "true");
          } else {
            btn.removeAttribute("aria-current");
          }
        }
        return;
      }
      container.__treeSig = treeSig;
      container.replaceChildren();

      const byUnit = new Map();
      for (const ch of visibleChapters) {
        const uKey =
          state.subject === "All" || state.subject === "Saved"
            ? `${CFG.subjectMeta[ch.subject]?.short || ch.subject} · ${ch.unit}`
            : ch.unit;
        if (!byUnit.has(uKey)) byUnit.set(uKey, []);
        byUnit.get(uKey).push(ch);
      }

      if (!byUnit.size) {
        const empty = document.createElement("p");
        empty.style.padding = "0.75rem";
        empty.style.color = "var(--muted)";
        empty.style.fontSize = "0.82rem";
        empty.textContent = `No matching ${UNIT_PLURAL.toLowerCase()}.`;
        container.appendChild(empty);
        return;
      }

      for (const [unitLabel, chapters] of byUnit.entries()) {
        const group = document.createElement("div");
        group.className = "unit-group";

        const heading = document.createElement("p");
        heading.className = "unit-heading";
        heading.textContent = unitLabel;
        group.appendChild(heading);

        const ul = document.createElement("ul");
        ul.className = "ch-nav-list";
        ul.setAttribute("role", "list");

        for (const ch of chapters) {
          const ped = getChapterPedagogy(ch.chapter_no);
          const roi = getRoiMeta(ped.roi);
          const hiShort = shortHindiLabel(ped.hi);

          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          const isCurrent = state.chapterNo === ch.chapter_no;
          const isDone = state.doneChapters.has(String(ch.chapter_no));
          btn.className = `ch-nav-btn${isDone ? " is-done" : ""}`;
          btn.dataset.ch = String(ch.chapter_no);
          if (isCurrent) btn.setAttribute("aria-current", "true");

          const noSpan = document.createElement("span");
          noSpan.className = "ch-no";
          noSpan.textContent = isDone ? "✓" : pad2(ch.chapter_no);

          const stack = document.createElement("span");
          stack.className = "ch-name-stack";

          const nameSpan = document.createElement("span");
          nameSpan.className = "ch-name";
          if (roi.isEasy && !isDone) {
            const dot = document.createElement("span");
            dot.className = "ch-roi-dot";
            dot.setAttribute("aria-hidden", "true");
            nameSpan.appendChild(dot);
          }
          nameSpan.appendChild(document.createTextNode(ch.chapter));
          stack.appendChild(nameSpan);

          if (hiShort && hiShort !== ch.chapter) {
            const subSpan = document.createElement("span");
            subSpan.className = "ch-sub-hi";
            subSpan.textContent = `${hiShort} · ${ped.ref}`;
            stack.appendChild(subSpan);
          }

          const cntSpan = document.createElement("span");
          cntSpan.className = "ch-cnt";
          cntSpan.textContent = String(chCounts.get(ch.chapter_no) || 0);

          btn.append(noSpan, stack, cntSpan);
          btn.addEventListener("click", () => {
            const nextNo =
              state.chapterNo === ch.chapter_no ? 0 : ch.chapter_no;
            if (closeDrawerOnPick && el.syllabusDialog?.open) {
              el.syllabusDialog.close();
            }
            jumpToChapter(nextNo);
          });

          li.appendChild(btn);
          ul.appendChild(li);
        }

        group.appendChild(ul);
        container.appendChild(group);
      }
    };

    // Zero-Lag Engine: only build trees that are actually on screen. The desktop rail
    // is display:none below 1024px and the mobile drawer only exists while its
    // <dialog> is open — rebuilding 80-chapter trees for hidden containers was pure jank.
    const railVisible = RAIL_MQ.matches;
    const drawerVisible = Boolean(el.syllabusDialog?.open);
    if (railVisible) {
      buildInto(el.syllabusTree, el.chFilter?.value || "", false);
      railTreeDirty = false;
    } else {
      railTreeDirty = true;
    }
    if (drawerVisible) {
      buildInto(el.drawerSyllabusTree, el.drawerChFilter?.value || "", true);
      drawerTreeDirty = false;
    } else {
      drawerTreeDirty = true;
    }
  }

  function openSyllabusDrawer() {
    if (!el.syllabusDialog) return;
    if (!el.syllabusDialog.open) el.syllabusDialog.showModal();
    if (drawerTreeDirty) renderSyllabusTrees();
  }

  function updateChromeAndCounters(filtered) {
    const isStudent = state.userRole === "student";
    el.roleTeacherBtn?.setAttribute("aria-pressed", isStudent ? "false" : "true");
    el.roleStudentBtn?.setAttribute("aria-pressed", isStudent ? "true" : "false");

    if (el.studentProgressBox) el.studentProgressBox.hidden = false;

    const totalChapters = state.syllabus.length || 1;
    const doneCount = state.syllabus.filter((s) =>
      state.doneChapters.has(String(s.chapter_no))
    ).length;

    if (el.statProgress) {
      el.statProgress.textContent = `${doneCount} / ${state.syllabus.length}`;
    }
    if (el.syllabusProgress) {
      el.syllabusProgress.max = totalChapters;
      el.syllabusProgress.value = doneCount;
    }
    if (el.drawerStatProgress) {
      el.drawerStatProgress.textContent = `✅ ${doneCount} / ${state.syllabus.length} ${UNIT_PLURAL} Understood & Completed`;
    }

    if (el.cntSaved) el.cntSaved.textContent = String(state.saved.size);
    el.savedDeckBtn?.setAttribute(
      "aria-pressed",
      state.subject === "Saved" ? "true" : "false"
    );

    if (el.clearChapterBtn) el.clearChapterBtn.hidden = !state.chapterNo;
    if (el.drawerAllChBtn) el.drawerAllChBtn.hidden = !state.chapterNo;

    // Mobile Bottom Nav Dynamic Labels & Active States
    if (el.mobChLabel) {
      if (state.chapterNo) {
        const ch = state.syllabusByNo.get(state.chapterNo);
        el.mobChLabel.textContent = ch
          ? `${UNIT_SHORT} ${pad2(ch.chapter_no)}`
          : UNIT_PLURAL;
      } else {
        el.mobChLabel.textContent = `${UNIT_PLURAL} (${state.syllabus.length})`;
      }
    }
    el.mobChaptersBtn?.classList.toggle("is-active", state.chapterNo > 0);

    if (el.mobLangLabel) {
      el.mobLangLabel.textContent =
        state.lang === "all" ? "Language" : getLangMeta(state.lang).pill;
    }
    el.mobLangBtn?.classList.toggle("is-active", state.lang !== "all");

    if (el.mobEduLabel) {
      el.mobEduLabel.textContent = state.educator
        ? state.educator.split(/\s+/)[0]
        : "Educators";
    }
    el.mobEducatorBtn?.classList.toggle("is-active", Boolean(state.educator));

    if (el.heroStats && state.syllabus.length) {
      el.heroStats.textContent = `${state.syllabus.length} ${UNIT_SHORT} · ${state.videos.length.toLocaleString()} Verified Lectures`;
    }

    const chaptersRepresented = new Set(filtered.map((v) => v.chapter_no)).size;
    const chLabel =
      chaptersRepresented === 1
        ? UNIT_SINGULAR.toLowerCase()
        : UNIT_PLURAL.toLowerCase();
    const summaryText = `${filtered.length.toLocaleString()} matching lectures across ${chaptersRepresented} ${chLabel}`;
    if (el.count) el.count.textContent = summaryText;
  }

  function renderActiveFilterPills(filtered) {
    if (!el.activeFiltersBar || !el.activeFilters) return;
    el.activeFilters.replaceChildren();

    if (state.pickIds.length > 0) {
      el.activeFiltersBar.hidden = true;
      return;
    }

    const chips = [];
    if (state.subject === "Saved") {
      chips.push({
        label: "📌 My Revision List",
        clear: () => {
          state.subject = "All";
        },
      });
    } else if (state.subject !== "All") {
      chips.push({
        label: state.subject,
        clear: () => {
          state.subject = "All";
        },
      });
    }
    if (state.classLevel !== "all") {
      const lbl =
        getPlatformClassDefs().find((d) => d.key === state.classLevel)?.label ||
        state.classLevel;
      chips.push({
        label: lbl,
        clear: () => {
          state.classLevel = "all";
        },
      });
    }
    if (state.chapterNo) {
      const ch = state.syllabusByNo.get(state.chapterNo);
      chips.push({
        label: ch
          ? `${UNIT_SHORT} ${pad2(ch.chapter_no)}: ${ch.chapter}`
          : `${UNIT_SHORT} ${state.chapterNo}`,
        clear: () => {
          state.chapterNo = 0;
        },
      });
    }
    if (state.lang !== "all") {
      chips.push({
        label: `🌐 ${getLangMeta(state.lang).badge}`,
        clear: () => {
          state.lang = "all";
        },
      });
    }
    if (state.exam !== "all") {
      chips.push({
        label: `🎓 ${state.exam}`,
        clear: () => {
          state.exam = "all";
        },
      });
    }
    if (state.educator) {
      chips.push({
        label: `👨‍🏫 ${state.educator}`,
        clear: () => {
          state.educator = "";
        },
      });
    }
    if (state.sort !== "trending") {
      const sortLbl =
        el.sortSelect?.selectedOptions?.[0]?.textContent || state.sort;
      chips.push({
        label: sortLbl,
        clear: () => {
          state.sort = "trending";
        },
      });
    }
    if (state.query) {
      chips.push({
        label: `“${state.query}”`,
        clear: () => {
          state.query = "";
          if (el.q) el.q.value = "";
          syncSearchClear();
        },
      });
    }

    if (!chips.length) {
      el.activeFiltersBar.hidden = true;
      return;
    }

    el.activeFiltersBar.hidden = false;
    if (el.activeSummary) {
      el.activeSummary.textContent = `${filtered.length.toLocaleString()} matching lecture${filtered.length === 1 ? "" : "s"}`;
    }

    for (const c of chips) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-pill";
      btn.setAttribute("aria-label", `Remove filter ${c.label}`);
      btn.textContent = `${c.label} ✕`;
      btn.addEventListener("click", () => {
        c.clear();
        renderAll({ announce: true });
      });
      el.activeFilters.appendChild(btn);
    }

    if (chips.length >= 2) {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "clear-all-pill";
      reset.textContent = "Reset All";
      reset.addEventListener("click", resetAllFilters);
      el.activeFilters.appendChild(reset);
    }
  }

  /* ==========================================================================
     HIGH-RES THUMBNAILS (hqdefault.jpg + Grey Placeholder Guard)
     ========================================================================== */
  function resolveThumbUrls(v) {
    const vid =
      v.embed_video_id || (v.provider === "youtube" ? v.video_id : "");
    const raw = String(v.thumbnail || "").trim();
    const list = [];
    if (vid && /^[A-Za-z0-9_-]{11}$/.test(vid)) {
      list.push(`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`);
      list.push(`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`);
    }
    if (raw && /^https?:\/\//i.test(raw) && !list.includes(raw)) {
      list.push(raw);
    }
    return list;
  }

  function buildPosterFallback(v) {
    const fb = document.createElement("div");
    fb.className = "thumb-fallback";
    const st = document.createElement("strong");
    st.textContent = `${UNIT_SHORT} ${pad2(v.chapter_no)} · ${v.chapter}`;
    const sp = document.createElement("span");
    sp.textContent = v.educator || v.channel || CFG.brandName;
    fb.append(st, sp);
    return fb;
  }

  function createThumbnailImage(v, opts = {}) {
    const urls = resolveThumbUrls(v);
    if (!urls.length) {
      return buildPosterFallback(v);
    }
    let idx = 0;
    const img = document.createElement("img");
    img.src = urls[0];
    img.alt = "";
    img.width = 480;
    img.height = 270;
    img.decoding = "async";
    if (opts.highPriority) {
      img.fetchPriority = "high";
      img.loading = "eager";
    } else if (opts.lazy) {
      img.loading = "lazy";
    }

    const advanceOrFallback = () => {
      idx += 1;
      if (idx < urls.length) {
        img.src = urls[idx];
        return;
      }
      img.replaceWith(buildPosterFallback(v));
    };

    img.addEventListener("error", advanceOrFallback);
    img.addEventListener("load", () => {
      if (img.naturalWidth > 0 && img.naturalWidth <= 120) {
        advanceOrFallback();
      }
    });
    return img;
  }

  /* ==========================================================================
     STUDENT & CLASSROOM VIDEO CARD (Teaching Vibe + Tracker + Homework + WA)
     ========================================================================== */
  function createVideoCard(v, opts = {}) {
    const card = document.createElement("article");
    card.className = "card";

    // 1. Top 16:9 Thumbnail Bar
    const media = document.createElement("div");
    media.className = "card-media";

    const creatorName = v.educator || v.channel || "Educator";
    const thumbBtn = document.createElement("button");
    thumbBtn.type = "button";
    thumbBtn.className = "thumb-btn";
    thumbBtn.setAttribute(
      "aria-label",
      `Watch inline: ${v.title} by ${creatorName} (${shortRef(v)})`
    );
    thumbBtn.appendChild(
      createThumbnailImage(v, {
        highPriority: opts.highPriority,
        lazy: opts.lazyImage,
      })
    );

    const veil = document.createElement("span");
    veil.className = "play-veil";
    veil.setAttribute("aria-hidden", "true");
    const circle = document.createElement("span");
    circle.className = "play-circle";
    circle.textContent = "▶";
    veil.appendChild(circle);
    thumbBtn.appendChild(veil);

    const topBar = document.createElement("span");
    topBar.className = "thumb-bar-top";
    if (opts.assignIndex) {
      const ordBadge = document.createElement("span");
      ordBadge.className = "assign-order-badge";
      ordBadge.textContent = `#${opts.assignIndex}`;
      topBar.appendChild(ordBadge);
    }
    const lMeta = getLangMeta(v.language || "Hinglish");
    const langPill = document.createElement("span");
    langPill.className = `thumb-lang-pill${lMeta.regional ? " is-regional" : ""}`;
    langPill.textContent = lMeta.badge;
    topBar.appendChild(langPill);
    thumbBtn.appendChild(topBar);

    const bottomBar = document.createElement("span");
    bottomBar.className = "thumb-bar-bottom";

    const traction = getTractionPill(v);
    const trPill = document.createElement("span");
    trPill.className = `thumb-traction-pill${traction.cls ? ` ${traction.cls}` : ""}`;
    trPill.textContent = traction.text;

    const durPill = document.createElement("span");
    durPill.className = "thumb-dur-pill";
    durPill.textContent = getDurationBadge(v);

    bottomBar.append(trPill, durPill);
    thumbBtn.appendChild(bottomBar);

    thumbBtn.addEventListener("click", () => openPlayer(v));
    media.appendChild(thumbBtn);

    // 2. Card Body
    const body = document.createElement("div");
    body.className = "card-body";

    const metaTop = document.createElement("div");
    metaTop.className = "card-meta-top";

    const chBtn = document.createElement("button");
    chBtn.type = "button";
    chBtn.className = "card-chapter-pill";
    const shortSubj = CFG.subjectMeta[v.subject]?.short || v.subject;
    const streamTxt = v.target_exam ? ` · ${v.target_exam}` : "";
    chBtn.textContent = `${shortSubj} · ${UNIT_SHORT} ${pad2(v.chapter_no)} ${v.chapter}${streamTxt}`;
    chBtn.setAttribute(
      "aria-label",
      `Open 1-2-3 ${UNIT_SINGULAR} Roadmap for ${UNIT_SINGULAR} ${pad2(v.chapter_no)} ${v.chapter} (${shortRef(v)})`
    );
    chBtn.addEventListener("click", () => {
      jumpToChapter(state.chapterNo === v.chapter_no ? 0 : v.chapter_no);
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "bookmark-icon-btn";
    const isSaved = state.saved.has(v._key);
    saveBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    saveBtn.setAttribute(
      "aria-label",
      `${isSaved ? "Remove from Revision List" : "Save to Revision List"}: ${v.title} (${shortRef(v)})`
    );
    saveBtn.textContent = isSaved ? "★" : "☆";

    metaTop.append(chBtn, saveBtn);

    // Human-Friendly "Teaching Vibe" Badge Row
    const vibeRow = document.createElement("div");
    vibeRow.className = "vibe-row";
    const vibeBadge = document.createElement("span");
    vibeBadge.className = `vibe-badge ${v._vibe.cls}`;
    vibeBadge.textContent = v._vibe.label;
    vibeRow.appendChild(vibeBadge);

    // Full 2-Line Readable Title
    const h3 = document.createElement("h3");
    h3.className = "card-title";
    h3.textContent = v.title;

    // Clickable Educator Badge Row
    const eduRow = document.createElement("div");
    eduRow.className = "card-educator-row";

    const eduBtn = document.createElement("button");
    eduBtn.type = "button";
    eduBtn.className = "educator-pill";
    eduBtn.setAttribute(
      "aria-label",
      `Filter all lectures by educator ${creatorName} (${shortRef(v)})`
    );

    const av = document.createElement("span");
    av.className = "creator-avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = creatorInitials(creatorName);

    const eduTxt = document.createElement("span");
    eduTxt.className = "educator-name-txt";
    eduTxt.textContent = creatorName;

    eduBtn.append(av, eduTxt);
    eduBtn.addEventListener("click", () => {
      state.pickIds = [];
      state.educator = state.educator === creatorName ? "" : creatorName;
      renderAll({ announce: true });
    });

    eduRow.appendChild(eduBtn);
    if (v.view_count > 0) {
      const viewsHint = document.createElement("span");
      viewsHint.className = "card-views-hint";
      viewsHint.textContent = `${compactNum(v.view_count)} views`;
      eduRow.appendChild(viewsHint);
    }

    // Distraction-Free Study Tracker Strip (Understood + Revision + Assign Homework)
    const trackerRow = document.createElement("div");
    trackerRow.className = "card-tracker-row";

    const doneCardBtn = document.createElement("button");
    doneCardBtn.type = "button";
    doneCardBtn.className = "card-done-btn";
    const isVidDone = state.doneVideos.has(v._key);
    doneCardBtn.setAttribute("aria-pressed", isVidDone ? "true" : "false");
    doneCardBtn.setAttribute(
      "aria-label",
      `Mark lecture understood and completed: ${v.title} (${shortRef(v)})`
    );
    doneCardBtn.textContent = isVidDone ? "✅ Done" : "✅ Understood";
    doneCardBtn.addEventListener("click", () => {
      toggleVideoDone(v);
      renderAll({ announce: false });
    });

    const reviseBtn = document.createElement("button");
    reviseBtn.type = "button";
    reviseBtn.className = "card-revise-btn";
    reviseBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    reviseBtn.setAttribute(
      "aria-label",
      `Save lecture for revision before exam: ${v.title} (${shortRef(v)})`
    );
    reviseBtn.textContent = isSaved ? "🔖 Saved" : "🔖 Revise";

    const handleSaveToggle = () => {
      const nowSaved = toggleSavedVideo(v);
      saveBtn.setAttribute("aria-pressed", nowSaved ? "true" : "false");
      saveBtn.setAttribute(
        "aria-label",
        `${nowSaved ? "Remove from Revision List" : "Save to Revision List"}: ${v.title} (${shortRef(v)})`
      );
      saveBtn.textContent = nowSaved ? "★" : "☆";
      reviseBtn.setAttribute("aria-pressed", nowSaved ? "true" : "false");
      reviseBtn.textContent = nowSaved ? "🔖 Saved" : "🔖 Revise";
      if (el.cntSaved) el.cntSaved.textContent = String(state.saved.size);
      if (state.subject === "Saved" || state.chapterNo > 0) {
        renderAll({ announce: false });
      }
    };
    saveBtn.addEventListener("click", handleSaveToggle);
    reviseBtn.addEventListener("click", handleSaveToggle);

    const packBtn = document.createElement("button");
    packBtn.type = "button";
    packBtn.className = "card-pack-btn";
    const inPack = isVideoInPack(v);
    packBtn.setAttribute("aria-pressed", inPack ? "true" : "false");
    packBtn.setAttribute(
      "aria-label",
      `${inPack ? "Remove from Classroom Homework Pack" : "Add to Classroom Homework Pack"}: ${v.title} (${shortRef(v)})`
    );
    packBtn.textContent = inPack ? "📋 Assigned" : "📋 Assign";
    packBtn.addEventListener("click", () => {
      toggleHomeworkPack(v);
      renderAll({ announce: false });
    });

    trackerRow.append(doneCardBtn, reviseBtn, packBtn);

    // Dual Action Footer + 1-Tap WhatsApp Share
    const footer = document.createElement("div");
    footer.className = "card-actions-footer";

    const watchBtn = document.createElement("button");
    watchBtn.type = "button";
    watchBtn.className = "action-watch-btn";
    watchBtn.textContent = "▶ Watch Inline";
    watchBtn.setAttribute(
      "aria-label",
      `Watch inline: ${v.title} (${shortRef(v)})`
    );
    watchBtn.addEventListener("click", () => openPlayer(v));

    const ytLink = document.createElement("a");
    ytLink.className = "action-yt-btn";
    ytLink.href = v.url;
    ytLink.target = "_blank";
    ytLink.rel = "noopener noreferrer";
    ytLink.textContent = "↗ YouTube App";
    ytLink.setAttribute(
      "aria-label",
      `Open in YouTube App: ${v.title} (${shortRef(v)})`
    );

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "action-share-btn";
    shareBtn.textContent = "📲";
    shareBtn.setAttribute(
      "aria-label",
      `Send lecture on WhatsApp or copy link: ${v.title} (${shortRef(v)})`
    );
    shareBtn.addEventListener("click", () => shareVideoCard(v));

    footer.append(watchBtn, ytLink, shareBtn);

    body.append(metaTop, vibeRow, h3, eduRow, trackerRow, footer);
    card.append(media, body);
    return card;
  }

  /* ==========================================================================
     SMART EMPTY-STATE RECOVERY (1-Click Alternative Suggestions)
     ========================================================================== */
  function renderSmartEmptyState() {
    el.list.replaceChildren();
    const box = document.createElement("div");
    box.className = "empty-state";

    const h2 = document.createElement("h2");
    const p = document.createElement("p");
    const actions = document.createElement("div");
    actions.className = "recovery-actions";

    if (state.subject === "Saved") {
      h2.textContent = "📌 Your Exam Revision List is currently empty";
      p.textContent =
        "Tap “🔖 Revise” on any lecture card or 1-2-3 Chapter Roadmap step to build your personal exam-week playlist offline — zero login needed.";
      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "primary-btn";
      allBtn.textContent = "Browse All Verified Lectures";
      allBtn.addEventListener("click", () => {
        state.subject = "All";
        renderAll({ announce: true });
      });
      actions.appendChild(allBtn);
      box.append(h2, p, actions);
      el.list.appendChild(box);
      return;
    }

    h2.textContent = "No lectures matched all active filters simultaneously";

    const withoutLang =
      state.lang !== "all" ? filterVideosCustom({ lang: "all" }) : [];
    const withoutEducator = state.educator
      ? filterVideosCustom({ educator: "" })
      : [];
    const withoutExam =
      state.exam !== "all" ? filterVideosCustom({ exam: "all" }) : [];
    const withoutSort =
      state.sort !== "trending" ? filterVideosCustom({ sort: "trending" }) : [];
    const withoutQuery = state.query ? filterVideosCustom({ query: "" }) : [];

    if (withoutLang.length > 0) {
      const topLangs = Array.from(
        new Set(withoutLang.map((v) => v.language).filter(Boolean))
      )
        .slice(0, 2)
        .join("/");
      const chDesc = state.chapterNo
        ? `${UNIT_SHORT} ${pad2(state.chapterNo)}`
        : "this selection";
      p.textContent = `No videos in ${state.lang} for ${chDesc} yet — ${withoutLang.length} verified lectures are ready in ${topLangs || "other languages"}.`;

      const langFixBtn = document.createElement("button");
      langFixBtn.type = "button";
      langFixBtn.className = "primary-btn";
      langFixBtn.textContent = `🌐 View ${withoutLang.length} ${topLangs || "All-Language"} Lectures`;
      langFixBtn.addEventListener("click", () => {
        state.lang = "all";
        renderAll({ announce: true });
      });
      actions.appendChild(langFixBtn);
    } else {
      p.textContent =
        "Pick one of the 1-tap recovery buttons below to immediately view available lectures:";
    }

    if (withoutEducator.length > 0) {
      const eduBtn = document.createElement("button");
      eduBtn.type = "button";
      eduBtn.className = actions.children.length ? "secondary-btn" : "primary-btn";
      eduBtn.textContent = `👨‍🏫 Show All Educators (${withoutEducator.length} Lectures)`;
      eduBtn.addEventListener("click", () => {
        state.educator = "";
        renderAll({ announce: true });
      });
      actions.appendChild(eduBtn);
    }

    if (withoutExam.length > 0) {
      const exBtn = document.createElement("button");
      exBtn.type = "button";
      exBtn.className = actions.children.length ? "secondary-btn" : "primary-btn";
      exBtn.textContent = `🎓 All Exam Streams (${withoutExam.length} Lectures)`;
      exBtn.addEventListener("click", () => {
        state.exam = "all";
        renderAll({ announce: true });
      });
      actions.appendChild(exBtn);
    }

    if (withoutSort.length > 0) {
      const sBtn = document.createElement("button");
      sBtn.type = "button";
      sBtn.className = actions.children.length ? "secondary-btn" : "primary-btn";
      sBtn.textContent = `🔥 Show All Lecture Formats (${withoutSort.length})`;
      sBtn.addEventListener("click", () => {
        state.sort = "trending";
        renderAll({ announce: true });
      });
      actions.appendChild(sBtn);
    }

    if (withoutQuery.length > 0) {
      const qBtn = document.createElement("button");
      qBtn.type = "button";
      qBtn.className = "secondary-btn";
      qBtn.textContent = `Clear Search “${state.query}” (${withoutQuery.length})`;
      qBtn.addEventListener("click", () => {
        state.query = "";
        if (el.q) el.q.value = "";
        syncSearchClear();
        renderAll({ announce: true });
      });
      actions.appendChild(qBtn);
    }

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = actions.children.length ? "secondary-btn" : "primary-btn";
    resetBtn.textContent = "↺ Reset All Filters";
    resetBtn.addEventListener("click", resetAllFilters);
    actions.appendChild(resetBtn);

    box.append(h2, p, actions);

    // 1-Tap Available Chapters Strip in Chosen Language / Exam / Educator
    if (state.chapterNo > 0) {
      const otherChPool = filterVideosCustom({ chapterNo: 0, query: "" });
      if (otherChPool.length > 0) {
        const chMap = new Map();
        for (const v of otherChPool) {
          chMap.set(v.chapter_no, (chMap.get(v.chapter_no) || 0) + 1);
        }
        const availChs = Array.from(chMap.entries())
          .sort((a, b) => b[1] - a[1] || a[0] - b[0])
          .slice(0, 6);
        if (availChs.length > 0) {
          const chWrap = document.createElement("div");
          chWrap.className = "fallback-ch-wrap";
          const chLbl = document.createElement("span");
          chLbl.className = "fallback-ch-label";
          const filterLabel =
            state.lang !== "all"
              ? getLangMeta(state.lang).pill
              : state.exam !== "all"
                ? state.exam
                : state.educator || "active filter";
          chLbl.textContent = `📖 Available ${UNIT_PLURAL.toLowerCase()} in ${filterLabel} (1-tap jump):`;
          const chStrip = document.createElement("div");
          chStrip.className = "fallback-ch-strip";
          for (const [cNo, cnt] of availChs) {
            const chMeta = state.syllabusByNo.get(cNo);
            if (!chMeta) continue;
            const cBtn = document.createElement("button");
            cBtn.type = "button";
            cBtn.className = "compass-ch-pill";
            cBtn.textContent = `${UNIT_SHORT} ${pad2(cNo)} · ${chMeta.chapter} (${cnt})`;
            cBtn.addEventListener("click", () => jumpToChapter(cNo));
            chStrip.appendChild(cBtn);
          }
          chWrap.append(chLbl, chStrip);
          box.appendChild(chWrap);
        }
      }
    }

    el.list.appendChild(box);

    // Zero-Dead-End Bilingual Fallback Video Shelf (Top 4 Lectures for Current Selection)
    const fallbackPool = withoutLang.length
      ? withoutLang
      : withoutEducator.length
        ? withoutEducator
        : withoutExam.length
          ? withoutExam
          : withoutSort.length
            ? withoutSort
            : withoutQuery;
    if (fallbackPool && fallbackPool.length > 0) {
      const topFallback = fallbackPool
        .slice()
        .sort((a, b) => compareItems(a, b, "trending"))
        .slice(0, 4);
      const shelfWrap = document.createElement("section");
      shelfWrap.className = "fallback-shelf-wrap";
      const shelfTitle = document.createElement("h3");
      shelfTitle.className = "fallback-shelf-title";
      const chDesc = state.chapterNo
        ? `${UNIT_SHORT} ${pad2(state.chapterNo)} · ${state.syllabusByNo.get(state.chapterNo)?.chapter || ""}`
        : "this topic";
      shelfTitle.textContent = `⚡ Instant Bilingual Fallback — Top Verified Lectures for ${chDesc}:`;
      const grid = document.createElement("div");
      grid.className = "cards-grid";
      for (const v of topFallback) {
        grid.appendChild(createVideoCard(v, { lazyImage: true }));
      }
      shelfWrap.append(shelfTitle, grid);
      el.list.appendChild(shelfWrap);
    }
  }

  /* ==========================================================================
     MAIN VIDEO STREAM (Chapterwise & Goal-Sorted Shelves)
     ========================================================================== */
  function renderMainStream(filtered) {
    if (!el.list) return;
    streamRenderToken += 1; // cancel any in-flight chunked render
    if (!filtered.length) {
      renderSmartEmptyState();
      return;
    }

    if (state.sort === "views") {
      el.list.replaceChildren();
      const sorted = filtered
        .slice()
        .sort((a, b) => compareItems(a, b, "views"));
      const slice = sorted.slice(0, state.flatLimit);

      const grid = document.createElement("div");
      grid.className = "cards-grid";
      el.list.appendChild(grid);

      if (sorted.length > state.flatLimit) {
        const moreWrap = document.createElement("div");
        moreWrap.style.textAlign = "center";
        moreWrap.style.paddingTop = "0.5rem";
        const moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.className = "secondary-btn";
        moreBtn.textContent = `Show more (${sorted.length - state.flatLimit} remaining) →`;
        moreBtn.addEventListener("click", () => {
          state.flatLimit += FLAT_PAGE_SIZE;
          renderMainStream(filtered);
        });
        moreWrap.appendChild(moreBtn);
        el.list.appendChild(moreWrap);
      }

      const nextOpts = makeCardPriorityCounter();
      function* flatJobs() {
        for (let i = 0; i < slice.length; i += CARD_CHUNK) {
          const frag = document.createDocumentFragment();
          const batch = slice.slice(i, i + CARD_CHUNK);
          for (const v of batch) frag.appendChild(createVideoCard(v, nextOpts()));
          grid.appendChild(frag);
          yield { cards: batch.length };
        }
      }
      runChunkedRender(flatJobs(), (_job, cardsSoFar) => cardsSoFar >= SYNC_CARD_BUDGET);
      return;
    }

    const grouped = new Map();
    for (const v of filtered) {
      if (!grouped.has(v.chapter_no)) grouped.set(v.chapter_no, []);
      grouped.get(v.chapter_no).push(v);
    }

    const chapterEntries = [];
    for (const [chNo, items] of grouped.entries()) {
      items.sort((a, b) => compareItems(a, b, state.sort));
      const chMeta = state.syllabusByNo.get(chNo) || {
        chapter_no: chNo,
        chapter: items[0].chapter,
        subject: items[0].subject,
        unit: items[0].unit,
        weightage: items[0].weightage,
      };
      const ped = getChapterPedagogy(chNo);
      const roi = getRoiMeta(ped.roi);
      const peakTrend =
        Number(items[0]?._rankTrend ?? items[0]?.trend_score) || 0;
      chapterEntries.push({ chNo, chMeta, ped, roi, items, peakTrend });
    }

    if (state.sort === "chapterwise") {
      chapterEntries.sort((a, b) => a.chNo - b.chNo);
    } else if (state.sort === "easy_scoring") {
      chapterEntries.sort(
        (a, b) =>
          b.roi.rank - a.roi.rank ||
          b.peakTrend - a.peakTrend ||
          a.chNo - b.chNo
      );
    } else {
      chapterEntries.sort(
        (a, b) => b.peakTrend - a.peakTrend || a.chNo - b.chNo
      );
    }

    const buildSectionShell = ({ chNo, chMeta, ped, roi, items }, secIdx) => {
      const section = document.createElement("section");
      section.className = `chapter-section${secIdx >= 3 ? " is-deferred" : ""}`;
      section.id = `chapter-${chNo}`;

      const header = document.createElement("div");
      header.className = "chapter-header";

      const titleCluster = document.createElement("div");
      titleCluster.className = "chapter-title-cluster";

      const chPill = document.createElement("span");
      chPill.className = "ch-pill";
      const shortSubj =
        CFG.subjectMeta[chMeta.subject]?.short || chMeta.subject;
      chPill.textContent = `${UNIT_SHORT} ${pad2(chNo)} · ${shortSubj}`;

      const h2 = document.createElement("h2");
      h2.className = "chapter-heading";
      h2.textContent = chMeta.chapter;

      titleCluster.append(chPill, h2);

      const hiShort = shortHindiLabel(ped.hi);
      if (hiShort && hiShort !== chMeta.chapter) {
        const subHi = document.createElement("span");
        subHi.className = "chapter-sub-hi";
        subHi.textContent = `(${hiShort})`;
        titleCluster.appendChild(subHi);
      }

      const roiChip = document.createElement("span");
      roiChip.className = `roi-badge ${roi.cls}`;
      roiChip.textContent = roi.shortTag;
      titleCluster.appendChild(roiChip);

      const actionsCluster = document.createElement("div");
      actionsCluster.className = "chapter-actions-cluster";

      // 1-Tap Open Roadmap Button when viewing multi-chapter stream
      if (!state.chapterNo) {
        const roadmapBtn = document.createElement("button");
        roadmapBtn.type = "button";
        roadmapBtn.className = "expand-ch-btn";
        roadmapBtn.textContent = "🧭 1-2-3 Guide";
        roadmapBtn.setAttribute(
          "aria-label",
          `Open 1-2-3 ${UNIT_SINGULAR} Roadmap for ${UNIT_SINGULAR} ${pad2(chNo)} ${chMeta.chapter}`
        );
        roadmapBtn.addEventListener("click", () => jumpToChapter(chNo));
        actionsCluster.appendChild(roadmapBtn);
      }

      // Always-available Chapter Completed Toggle
      const doneBtn = document.createElement("button");
      doneBtn.type = "button";
      doneBtn.className = "done-chip";
      const isDone = state.doneChapters.has(String(chNo));
      doneBtn.setAttribute("aria-pressed", isDone ? "true" : "false");
      doneBtn.setAttribute(
        "aria-label",
        `${isDone ? `Mark ${UNIT_SINGULAR.toLowerCase()} incomplete` : `Mark ${UNIT_SINGULAR.toLowerCase()} understood and completed`}: ${UNIT_SINGULAR} ${pad2(chNo)} ${chMeta.chapter}`
      );
      doneBtn.textContent = isDone ? "✅ Completed" : "✅ Understood";
      doneBtn.addEventListener("click", () => {
        toggleChapterDone(chNo);
        renderAll({ announce: false });
      });
      actionsCluster.appendChild(doneBtn);

      // 1-Tap WhatsApp Chapter Deep-Link
      const chShareBtn = document.createElement("button");
      chShareBtn.type = "button";
      chShareBtn.className = "ch-share-btn";
      chShareBtn.textContent = "📲 WhatsApp";
      chShareBtn.setAttribute(
        "aria-label",
        `Share ${UNIT_SINGULAR} ${pad2(chNo)} ${chMeta.chapter} study link on WhatsApp`
      );
      chShareBtn.addEventListener("click", async () => {
        const payload = buildCurrentViewSharePayload(chNo);
        await copyToClipboard(payload.text);
        showShareToast(
          `✓ ${UNIT_SHORT} ${pad2(chNo)} WhatsApp study link copied!`,
          payload.text
        );
      });
      actionsCluster.appendChild(chShareBtn);

      const isIsolated =
        state.chapterNo === chNo ||
        Boolean(state.query) ||
        Boolean(state.educator) ||
        state.expandedChapters.has(chNo);
      const visibleItems = isIsolated
        ? items
        : items.slice(0, CARDS_PER_CHAPTER_COLLAPSED);

      if (
        !state.chapterNo &&
        !state.query &&
        !state.educator &&
        items.length > CARDS_PER_CHAPTER_COLLAPSED
      ) {
        const expBtn = document.createElement("button");
        expBtn.type = "button";
        expBtn.className = "expand-ch-btn";
        const expanded = state.expandedChapters.has(chNo);
        expBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
        expBtn.textContent = expanded ? "Top 4" : `All ${items.length} →`;
        expBtn.setAttribute(
          "aria-label",
          expanded
            ? `Show top 4 lectures for ${UNIT_SINGULAR} ${pad2(chNo)} ${chMeta.chapter}`
            : `View all ${items.length} lectures for ${UNIT_SINGULAR} ${pad2(chNo)} ${chMeta.chapter}`
        );
        expBtn.addEventListener("click", () => {
          if (state.expandedChapters.has(chNo)) state.expandedChapters.delete(chNo);
          else state.expandedChapters.add(chNo);
          renderMainStream(filtered);
        });
        actionsCluster.appendChild(expBtn);
      }

      header.append(titleCluster, actionsCluster);

      const grid = document.createElement("div");
      grid.className = "cards-grid";
      section.append(header, grid);
      return { section, grid, visibleItems };
    };

    const nextCardOpts = makeCardPriorityCounter();
    const SYNC_SECTIONS = 3;

    function* streamJobs() {
      for (let secIdx = 0; secIdx < chapterEntries.length; secIdx += 1) {
        yield { sectionStart: secIdx };
        const { section, grid, visibleItems } = buildSectionShell(
          chapterEntries[secIdx],
          secIdx
        );
        el.list.appendChild(section);
        for (let i = 0; i < visibleItems.length; i += CARD_CHUNK) {
          const frag = document.createDocumentFragment();
          const batch = visibleItems.slice(i, i + CARD_CHUNK);
          for (const v of batch) frag.appendChild(createVideoCard(v, nextCardOpts()));
          grid.appendChild(frag);
          yield { cards: batch.length };
        }
      }
    }

    // With a chapter roadmap open, the roadmap fills the first viewport, so only
    // one row of cards needs to exist in frame 1.
    const cardBudget = state.chapterNo ? CARD_CHUNK : SYNC_CARD_BUDGET;
    el.list.replaceChildren();
    runChunkedRender(streamJobs(), (job, cardsSoFar) =>
      (job.sectionStart !== undefined && job.sectionStart >= SYNC_SECTIONS) ||
      cardsSoFar >= cardBudget
    );
  }

  /* ==========================================================================
     ZERO-LAG ENGINE: Frame-1 Sync Budget + rAF-Chunked Off-Screen Rendering
     ========================================================================== */
  const SYNC_CARD_BUDGET = 12;
  const CARD_CHUNK = 4;
  const FRAME_BUDGET_MS = 8;

  // Image priority per modern-web-guidance `optimize-image-priority`:
  // fetchpriority="high" on at most the first 2 (LCP candidates), default eager
  // loading for the rest of the first viewport (cards 3–8), loading="lazy" after.
  function makeCardPriorityCounter() {
    let seq = 0;
    return () => {
      const i = seq;
      seq += 1;
      return { highPriority: i < 2, lazyImage: i >= 8 };
    };
  }

  // Drains `gen` synchronously until `stopSync(job, cardsSoFar)` is true, then
  // continues in requestAnimationFrame slices of <= FRAME_BUDGET_MS. Any newer
  // render bumps `streamRenderToken`, cancelling the in-flight chunk loop.
  function runChunkedRender(gen, stopSync) {
    const token = ++streamRenderToken;
    let cards = 0;
    for (;;) {
      const r = gen.next();
      if (r.done) return;
      if (r.value?.cards) cards += r.value.cards;
      if (stopSync(r.value || {}, cards)) break;
    }
    const pump = () => {
      if (token !== streamRenderToken) return;
      const deadline = performance.now() + FRAME_BUDGET_MS;
      while (performance.now() < deadline) {
        const r = gen.next();
        if (r.done) return;
      }
      requestAnimationFrame(pump);
    };
    requestAnimationFrame(pump);
  }

  // Zero-Lag Engine (modern-web-guidance `break-up-long-tasks`): an interaction
  // paints the user's focus area first (tabs, pills, roadmap, first cards), then
  // off-focus chrome (facet <select>s, compass contents, syllabus rail) is
  // rebuilt right after that paint. Boot & popstate render fully synchronously.
  let secondaryRenderToken = 0;

  function renderSecondaryChrome() {
    updateFacetedSelects();
    renderVisualCompass();
    renderSyllabusTrees();
  }

  function renderAll({ announce = false, syncUrl = true, deferSecondary = true } = {}) {
    const filtered = getFilteredVideos();
    renderSubjectTabs();
    renderClassPills();
    renderContinueStudyBar();
    const showingPack = renderAssignedPackSection();
    renderHomeworkTray();
    if (el.visualCompass) {
      el.visualCompass.hidden =
        state.userRole === "teacher" || state.pickIds.length > 0;
    }
    renderPhoneticBanner();
    updateChromeAndCounters(filtered);
    renderActiveFilterPills(filtered);
    renderChapterRoadmap();

    const secTok = ++secondaryRenderToken;
    if (deferSecondary) {
      requestAnimationFrame(() =>
        setTimeout(() => {
          if (secTok === secondaryRenderToken) renderSecondaryChrome();
        }, 0)
      );
    } else {
      renderSecondaryChrome();
    }

    if (showingPack) {
      streamRenderToken += 1;
      if (el.list) {
        el.list.hidden = true;
        el.list.replaceChildren();
      }
    } else {
      if (el.list) el.list.hidden = false;
      renderMainStream(filtered);
    }

    if (syncUrl) syncUrlAndTitle();

    if (announce && el.liveStatus) {
      const chCount = new Set(filtered.map((v) => v.chapter_no)).size;
      const chLbl =
        chCount === 1
          ? UNIT_SINGULAR.toLowerCase()
          : UNIT_PLURAL.toLowerCase();
      el.liveStatus.textContent = `${filtered.length.toLocaleString()} lectures across ${chCount} ${chLbl}`;
    }
  }

  function resetAllFilters() {
    state.pickIds = [];
    state.subject = "All";
    state.classLevel = "all";
    state.chapterNo = 0;
    state.query = "";
    state.lang = "all";
    state.exam = "all";
    state.educator = "";
    state.sort = "trending";
    state.voiceFallbackOpen = false;
    state.flatLimit = FLAT_PAGE_SIZE;
    if (el.q) el.q.value = "";
    if (el.chFilter) el.chFilter.value = "";
    if (el.drawerChFilter) el.drawerChFilter.value = "";
    syncSearchClear();
    renderAll({ announce: true });
  }

  /* ==========================================================================
     UPGRADED CINEMA STUDY PLAYER (Synchronous Teardown + Up-Next + Notes)
     ========================================================================== */
  const YT_VID_RE = /^[A-Za-z0-9_-]{11}$/;
  const YT_LIST_RE = /^(?:PL|OL|UU|FL|RD)[A-Za-z0-9_-]{6,}$/;

  function teardownPlayer() {
    if (el.playerStage) {
      for (const frame of el.playerStage.querySelectorAll("iframe")) {
        try {
          frame.src = "about:blank";
        } catch {}
      }
      el.playerStage.replaceChildren();
    }
    if (el.playerSamples) {
      el.playerSamples.hidden = true;
      el.playerSamples.replaceChildren();
    }
    if (el.playerUpnext) {
      el.playerUpnext.hidden = true;
      el.playerUpnext.replaceChildren();
    }
    state.activePlayerVideo = null;
  }

  function resolvePlayableEmbed(v, preferredVideoId = "") {
    const sampleId = Array.isArray(v.sample_lectures)
      ? v.sample_lectures.find((s) =>
          YT_VID_RE.test(String(s?.video_id || "").trim())
        )?.video_id || ""
      : "";
    const thumbId =
      /\/vi\/([A-Za-z0-9_-]{11})\//.exec(String(v.thumbnail || ""))?.[1] || "";
    const urlVid =
      /[?&]v=([A-Za-z0-9_-]{11})/.exec(String(v.url || ""))?.[1] || "";

    const candidates = [
      preferredVideoId,
      v.embed_video_id,
      v.provider === "youtube" ? v.video_id : "",
      sampleId,
      thumbId,
      urlVid,
    ]
      .map((x) => String(x || "").trim())
      .filter((x) => YT_VID_RE.test(x));

    const vid = candidates[0] || "";

    const rawList =
      v.provider === "playlist"
        ? String(v.video_id || "").trim()
        : /[?&]list=([A-Za-z0-9_-]{8,})/.exec(String(v.url || ""))?.[1] || "";
    const listId = YT_LIST_RE.test(rawList) ? rawList : "";

    if (vid && listId) {
      return {
        src: `https://www.youtube.com/embed/${encodeURIComponent(vid)}?list=${encodeURIComponent(listId)}&autoplay=1&rel=0`,
        videoId: vid,
        listId,
      };
    }
    if (vid) {
      return {
        src: `https://www.youtube.com/embed/${encodeURIComponent(vid)}?autoplay=1&rel=0`,
        videoId: vid,
        listId: "",
      };
    }
    if (listId) {
      return {
        src: `https://www.youtube.com/embed/videoseries?listType=playlist&list=${encodeURIComponent(listId)}&autoplay=1&rel=0`,
        videoId: "",
        listId,
      };
    }
    return { src: "", videoId: "", listId: "" };
  }

  function syncPlayerDoneButton() {
    if (!el.playerDoneBtn || !state.activePlayerVideo) return;
    const isDone = state.doneVideos.has(state.activePlayerVideo._key);
    el.playerDoneBtn.setAttribute("aria-pressed", isDone ? "true" : "false");
    el.playerDoneBtn.textContent = isDone ? "✅ Completed!" : "✅ Mark Done";
  }

  function syncPlayerNotesForVideo(v) {
    if (!el.playerNotesInput || !v) return;
    const note = String(state.lectureNotes[v._key] || "");
    el.playerNotesInput.value = note;
    if (el.playerNotesStatus) {
      el.playerNotesStatus.textContent = note.trim()
        ? "✓ Saved offline for this lecture"
        : "Saved offline on this device";
    }
  }

  function buildLectureNotesShareText(v) {
    if (!v) return "";
    const note = (el.playerNotesInput?.value || "").trim();
    const creator = v.educator || v.channel || CFG.brandName;
    const header = `📝 *Revision Notes — ${UNIT_SHORT} ${pad2(v.chapter_no)} ${v.chapter}*\n▶ ${v.title} (${creator})`;
    const body = note ? `\n\n${note}` : "";
    return `${header}${body}\n\n🎬 Lecture: ${v.url}`;
  }

  function renderPlayerUpNext(v) {
    if (!el.playerUpnext) return;
    const peers = state.videos
      .filter(
        (item) => item.chapter_no === v.chapter_no && item._key !== v._key
      )
      .sort((a, b) => compareItems(a, b, state.sort))
      .slice(0, 5);

    if (!peers.length) {
      el.playerUpnext.hidden = true;
      el.playerUpnext.replaceChildren();
      return;
    }

    el.playerUpnext.hidden = false;
    el.playerUpnext.replaceChildren();

    const lbl = document.createElement("span");
    lbl.className = "player-upnext-label";
    lbl.textContent = `⏭ Up Next in ${UNIT_SHORT} ${pad2(v.chapter_no)} (${v.chapter}):`;

    const strip = document.createElement("div");
    strip.className = "player-upnext-strip";

    for (const nextVid of peers) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "player-upnext-btn";
      const creator = nextVid.educator || nextVid.channel || "";
      btn.textContent = `▶ ${creator ? `${creator}: ` : ""}${nextVid.title}`;
      btn.title = `${nextVid.title} (${creator})`;
      btn.addEventListener("click", () => openPlayer(nextVid));
      strip.appendChild(btn);
    }

    el.playerUpnext.append(lbl, strip);
  }

  function openPlayer(v) {
    if (!el.playerDialog) {
      window.open(v.url, "_blank", "noopener,noreferrer");
      return;
    }

    const embedInfo = resolvePlayableEmbed(v);
    if (!embedInfo.src) {
      window.open(v.url, "_blank", "noopener,noreferrer");
      return;
    }

    recordLastLecture(v);
    state.activePlayerVideo = v;
    syncPlayerDoneButton();
    syncPlayerNotesForVideo(v);
    renderContinueStudyBar();
    mountIframe(embedInfo, v);
    renderPlayerUpNext(v);
  }

  function mountIframe(embedInfo, v) {
    if (el.playerBadge) el.playerBadge.textContent = v._vibe.label;
    if (el.playerChannel) {
      el.playerChannel.textContent = `${v.educator || v.channel} · ${UNIT_SHORT} ${pad2(v.chapter_no)} ${v.chapter}`;
    }
    if (el.playerTitle) el.playerTitle.textContent = v.title;
    if (el.playerExt) {
      el.playerExt.href = v.url;
      el.playerExt.setAttribute(
        "aria-label",
        `Open ${v.title} in YouTube App`
      );
    }

    if (el.playerStage) {
      for (const old of el.playerStage.querySelectorAll("iframe")) {
        try {
          old.src = "about:blank";
        } catch {}
      }
      el.playerStage.replaceChildren();
      const iframe = document.createElement("iframe");
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.src = embedInfo.src;
      iframe.title = v.title;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      el.playerStage.appendChild(iframe);
    }

    if (el.playerSamples) {
      const samples = Array.isArray(v.sample_lectures)
        ? v.sample_lectures.filter((s) =>
            YT_VID_RE.test(String(s?.video_id || "").trim())
          )
        : [];
      if (samples.length) {
        el.playerSamples.hidden = false;
        el.playerSamples.replaceChildren();
        const sampleBtns = [];
        for (const s of samples.slice(0, 6)) {
          const b = document.createElement("button");
          b.type = "button";
          const isCurrent = s.video_id === embedInfo.videoId;
          b.className = `player-sample-btn${isCurrent ? " is-active" : ""}`;
          if (isCurrent) b.setAttribute("aria-current", "true");
          b.textContent = `▶ ${s.title}`;
          b.addEventListener("click", () => {
            const nextEmbed = resolvePlayableEmbed(v, s.video_id);
            const iframe = el.playerStage?.querySelector("iframe");
            if (iframe && nextEmbed.src) {
              iframe.src = nextEmbed.src;
              for (const other of sampleBtns) {
                other.classList.remove("is-active");
                other.removeAttribute("aria-current");
              }
              b.classList.add("is-active");
              b.setAttribute("aria-current", "true");
            }
          });
          sampleBtns.push(b);
          el.playerSamples.appendChild(b);
        }
      } else {
        el.playerSamples.hidden = true;
        el.playerSamples.replaceChildren();
      }
    }

    if (!el.playerDialog.open) {
      el.playerDialog.showModal();
    }
  }

  /* ==========================================================================
     MOBILE BOTTOM-SHEET PICKER (Language & Educator 1-Thumb Picker)
     ========================================================================== */
  function openMobilePicker(kind) {
    if (!el.pickerDialog || !el.pickerList) return;
    state.pickerKind = kind;
    if (el.pickerSearch) el.pickerSearch.value = "";

    if (kind === "lang") {
      if (el.pickerTitle) el.pickerTitle.textContent = "🌐 Select Comfort Language";
      if (el.pickerSearchWrap) {
        el.pickerSearchWrap.hidden = state.allLanguages.length <= 5;
      }
      if (el.pickerSearch) {
        el.pickerSearch.placeholder = "Search language (Hindi, Tamil, Telugu)…";
      }
    } else {
      if (el.pickerTitle) el.pickerTitle.textContent = "👨‍🏫 Select Educator / Channel";
      if (el.pickerSearchWrap) el.pickerSearchWrap.hidden = false;
      if (el.pickerSearch) {
        const topTwo = state.allEducators.slice(0, 2);
        el.pickerSearch.placeholder = topTwo.length
          ? `Search educator (${topTwo.join(", ")})…`
          : "Search educator or channel…";
      }
    }

    renderMobilePickerOptions();
    if (!el.pickerDialog.open) el.pickerDialog.showModal();
  }

  function renderMobilePickerOptions() {
    if (!el.pickerList) return;
    el.pickerList.replaceChildren();
    const q = (el.pickerSearch?.value || "").toLowerCase().trim();

    if (state.pickerKind === "lang") {
      const basePool = filterVideosCustom({ lang: "all" });
      const counts = new Map();
      for (const v of basePool) {
        if (v.language) counts.set(v.language, (counts.get(v.language) || 0) + 1);
      }

      const rows = [
        {
          value: "all",
          label: "🌐 All Languages",
          search: "all any",
          count: basePool.length,
        },
        ...state.allLanguages
          .slice()
          .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
          .map((lg) => {
            const m = getLangMeta(lg);
            return {
              value: lg,
              label: `🌐 ${m.option}`,
              search: `${lg} ${m.option} ${m.aliases}`.toLowerCase(),
              count: counts.get(lg) || 0,
            };
          }),
      ];

      for (const r of rows) {
        if (q && r.value !== "all" && !r.search.includes(q)) continue;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `picker-option-btn${state.lang === r.value ? " is-selected" : ""}`;
        const span = document.createElement("span");
        span.textContent = r.label;
        const cnt = document.createElement("span");
        cnt.className = "picker-opt-cnt";
        cnt.textContent = r.count.toLocaleString();
        btn.append(span, cnt);
        btn.addEventListener("click", () => {
          state.pickIds = [];
          state.lang = r.value;
          el.pickerDialog?.close();
          renderAll({ announce: true });
        });
        el.pickerList.appendChild(btn);
      }
      return;
    }

    const basePool = filterVideosCustom({ educator: "" });
    const counts = new Map();
    for (const v of basePool) {
      const n = v.educator || v.channel;
      if (n) counts.set(n, (counts.get(n) || 0) + 1);
    }

    const sortedEdu = state.allEducators
      .slice()
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b));

    const rows = [
      {
        value: "",
        label: "👨‍🏫 All Educators & Channels",
        count: basePool.length,
      },
      ...sortedEdu.map((name) => ({
        value: name,
        label: `👨‍🏫 ${name}`,
        count: counts.get(name) || 0,
      })),
    ];

    for (const r of rows) {
      if (q && r.value !== "" && !r.label.toLowerCase().includes(q)) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `picker-option-btn${state.educator === r.value ? " is-selected" : ""}`;
      const span = document.createElement("span");
      span.textContent = r.label;
      const cnt = document.createElement("span");
      cnt.className = "picker-opt-cnt";
      cnt.textContent = r.count.toLocaleString();
      btn.append(span, cnt);
      btn.addEventListener("click", () => {
        state.pickIds = [];
        state.educator = r.value;
        el.pickerDialog?.close();
        renderAll({ announce: true });
      });
      el.pickerList.appendChild(btn);
    }
  }

  /* ==========================================================================
     1-TAP MICROPHONE VOICE SEARCH (hi-IN / en-IN / Regional SpeechRecognition)
     ========================================================================== */
  function setVoiceUiState(listening) {
    state.isListening = listening;
    if (!el.voiceSearchBtn) return;
    el.voiceSearchBtn.classList.toggle("is-listening", listening);
    el.voiceSearchBtn.setAttribute("aria-pressed", listening ? "true" : "false");
    const txt = el.voiceSearchBtn.querySelector(".voice-btn-txt");
    if (txt) txt.textContent = listening ? "Listening…" : "Speak";
  }

  function initVoiceSearch() {
    if (!el.voiceSearchBtn) return;
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    el.voiceSearchBtn.addEventListener("click", () => {
      if (!SpeechRec) {
        state.voiceFallbackOpen = !state.voiceFallbackOpen;
        renderPhoneticBanner();
        el.q?.focus();
        showShareToast(
          "🎤 Voice input isn't active in this browser — tap any Hinglish topic chip or type directly!",
          "",
          true
        );
        return;
      }

      if (state.isListening && speechRecognizer) {
        try {
          speechRecognizer.stop();
        } catch {}
        setVoiceUiState(false);
        return;
      }

      try {
        const rec = new SpeechRec();
        speechRecognizer = rec;
        const speechLocale =
          state.lang !== "all"
            ? getLangMeta(state.lang).speech
            : CFG.platformId === "upboard"
              ? "hi-IN"
              : "en-IN";
        rec.lang = speechLocale || "hi-IN";
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setVoiceUiState(true);
          showShareToast(
            `🎤 Listening (${rec.lang})… Say e.g. “Class 12 Physics Chapter 1” or “Samakalan”`,
            "",
            true
          );
        };

        rec.onresult = (event) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i += 1) {
            transcript += event.results[i][0].transcript;
          }
          const cleanSpeech = transcript.replace(/[.।?!]+$/g, "").trim();
          if (cleanSpeech) {
            state.pickIds = [];
            state.voiceFallbackOpen = false;
            state.query = cleanSpeech;
            if (el.q) el.q.value = cleanSpeech;
            syncSearchClear();
            state.flatLimit = FLAT_PAGE_SIZE;
            renderAll({ announce: true });
          }
        };

        rec.onerror = () => {
          setVoiceUiState(false);
          state.voiceFallbackOpen = true;
          renderPhoneticBanner();
        };

        rec.onend = () => {
          setVoiceUiState(false);
        };

        rec.start();
      } catch {
        setVoiceUiState(false);
        state.voiceFallbackOpen = true;
        renderPhoneticBanner();
      }
    });
  }

  /* ==========================================================================
     THEME TOGGLE, MODAL LIGHT-DISMISS & IME-SAFE EVENT BINDINGS
     ========================================================================== */
  function initThemeToggle() {
    const syncMetaFromStorage = () => {
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) return;
      try {
        meta.content = localStorage.getItem("color-scheme") ?? "light dark";
      } catch {}
    };
    window.addEventListener("storage", (e) => {
      if (e.key === "color-scheme") syncMetaFromStorage();
    });
    el.themeToggle?.addEventListener("click", () => {
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) return;
      const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const sysScheme = prefersDark ? "dark" : "light";
      let stored = null;
      try {
        stored = localStorage.getItem("color-scheme");
      } catch {}
      const rendered =
        stored === "dark" || stored === "light" ? stored : sysScheme;
      const target = rendered === "dark" ? "light" : "dark";
      if (target === sysScheme) {
        try {
          localStorage.removeItem("color-scheme");
        } catch {}
        meta.content = "light dark";
      } else {
        try {
          localStorage.setItem("color-scheme", target);
        } catch {}
        meta.content = target;
      }
    });
  }

  function isPointOutsideDialog(event, dialog) {
    const r = dialog.getBoundingClientRect();
    return (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    );
  }

  function initLightDismissFallback() {
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let downOutside = false;
      let pointerActive = false;

      dialog.addEventListener("pointerdown", (e) => {
        pointerActive = true;
        downOutside =
          dialog.open && e.target === dialog && isPointOutsideDialog(e, dialog);
      });

      dialog.addEventListener("pointerup", (e) => {
        if (
          downOutside &&
          dialog.open &&
          e.target === dialog &&
          isPointOutsideDialog(e, dialog)
        ) {
          if (dialog === el.playerDialog) teardownPlayer();
          dialog.close();
        }
        downOutside = false;
        setTimeout(() => {
          pointerActive = false;
        }, 0);
      });

      dialog.addEventListener("click", (e) => {
        if (pointerActive || !dialog.open || e.target !== dialog) return;
        if (
          (e.clientX === 0 && e.clientY === 0) ||
          !isPointOutsideDialog(e, dialog)
        ) {
          return;
        }
        if (dialog === el.playerDialog) teardownPlayer();
        dialog.close();
      });

      dialog.addEventListener("close", () => {
        dialog.returnValue = "";
      });
    }
  }

  function syncSearchClear() {
    const hasText = Boolean(el.q?.value);
    if (el.clearQ) el.clearQ.hidden = !hasText;
    if (el.keyHint) el.keyHint.hidden = hasText;
  }

  function setRole(role) {
    state.userRole = role === "student" ? "student" : "teacher";
    state.compassCollapsed = state.userRole === "teacher";
    try {
      localStorage.setItem(ROLE_KEY, state.userRole);
    } catch {}
    renderAll({ announce: true });
  }

  function bindEvents() {
    el.roleTeacherBtn?.addEventListener("click", () => setRole("teacher"));
    el.roleStudentBtn?.addEventListener("click", () => setRole("student"));

    // Studio v5.0: Resume Last Lecture & Smart Study Streak Bar
    el.continueStudyBtn?.addEventListener("click", () => {
      const lastVideo = resolveLastLectureVideo();
      if (lastVideo) openPlayer(lastVideo);
    });

    el.continueChBtn?.addEventListener("click", () => {
      const lastVideo = resolveLastLectureVideo();
      if (lastVideo) jumpToChapter(lastVideo.chapter_no);
    });

    el.continueDismissBtn?.addEventListener("click", () => {
      state.continueDismissed = true;
      renderContinueStudyBar();
    });

    // Studio v5.0: Teacher Homework Pack Builder (?pick=id1,id2,...)
    el.homeworkPackBtn?.addEventListener("click", () => {
      state.homeworkTrayOpen = !state.homeworkTrayOpen;
      renderHomeworkTray();
    });

    el.hwTrayCloseBtn?.addEventListener("click", () => {
      state.homeworkTrayOpen = false;
      renderHomeworkTray();
    });

    el.hwWhatsappBtn?.addEventListener("click", async () => {
      if (!state.homeworkPack.length) return;
      const payload = buildHomeworkPackSharePayload(state.homeworkPack);
      await copyToClipboard(payload.text);
      showShareToast(
        `✓ Homework Assignment (${payload.count} lectures) copied! Opening WhatsApp…`,
        payload.text
      );
      window.open(
        `https://wa.me/?text=${encodeURIComponent(payload.text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });

    el.hwCopyBtn?.addEventListener("click", async () => {
      if (!state.homeworkPack.length) return;
      const payload = buildHomeworkPackSharePayload(state.homeworkPack);
      await copyToClipboard(payload.url);
      showShareToast(
        `✓ Assignment link (?pick=… · ${payload.count} lectures) copied!`,
        payload.text
      );
    });

    el.hwPreviewBtn?.addEventListener("click", () => {
      if (!state.homeworkPack.length) return;
      state.pickIds = state.homeworkPack.slice();
      state.homeworkTrayOpen = false;
      renderAll({ announce: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    el.hwClearBtn?.addEventListener("click", () => {
      state.homeworkPack = [];
      saveJson(HW_PACK_KEY, []);
      renderAll({ announce: true });
    });

    // 3-Tap Visual Compass Collapse/Expand + Tap 3 Chapter Select
    el.compassToggleBtn?.addEventListener("click", () => {
      state.compassCollapsed = !state.compassCollapsed;
      renderVisualCompass();
    });

    el.compassChapterSelect?.addEventListener("change", () => {
      const chVal = Number(el.compassChapterSelect.value) || 0;
      jumpToChapter(chVal);
    });

    // 1-Click Share Current Filtered View (Desktop Topbar)
    el.shareCopyBtn?.addEventListener("click", async () => {
      const payload = buildCurrentViewSharePayload();
      await copyToClipboard(payload.text);
      showShareToast("✓ Filtered study link copied!", payload.text);
    });

    el.shareWhatsappBtn?.addEventListener("click", async () => {
      const payload = buildCurrentViewSharePayload();
      await copyToClipboard(payload.text);
      showShareToast("✓ Opening WhatsApp share…", payload.text);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(payload.text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });

    // My Revision List Tab
    el.savedDeckBtn?.addEventListener("click", () => {
      state.pickIds = [];
      state.subject = state.subject === "Saved" ? "All" : "Saved";
      renderAll({ announce: true });
    });

    // Instant Search (#q) + IME-Safe Enter Handling
    let searchTimer = null;
    el.q?.addEventListener("input", () => {
      syncSearchClear();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.pickIds = [];
        state.voiceFallbackOpen = false;
        state.query = el.q.value.trim();
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      }, 80);
    });

    el.q?.addEventListener("keydown", (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(searchTimer);
        state.pickIds = [];
        state.voiceFallbackOpen = false;
        state.query = el.q.value.trim();
        state.flatLimit = FLAT_PAGE_SIZE;
        renderAll({ announce: true });
      }
    });

    el.clearQ?.addEventListener("click", () => {
      if (el.q) el.q.value = "";
      state.query = "";
      state.voiceFallbackOpen = false;
      syncSearchClear();
      renderAll({ announce: true });
      el.q?.focus();
    });

    // Global Keyboard Shortcuts: Cmd+K / Ctrl+K Quick Jump & Modal-Safe "/"
    document.addEventListener("keydown", (e) => {
      if (e.isComposing || e.keyCode === 229) return;

      if (
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        if (el.syllabusDialog?.open) {
          el.drawerChFilter?.focus();
          el.drawerChFilter?.select();
          return;
        }
        if (el.pickerDialog?.open && !el.pickerSearchWrap?.hidden) {
          el.pickerSearch?.focus();
          el.pickerSearch?.select();
          return;
        }
        if (document.querySelector("dialog[open]")) return;
        el.q?.focus();
        el.q?.select();
        return;
      }

      const activeEl = document.activeElement;
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !document.querySelector("dialog[open]") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(activeEl?.tagName || "") &&
        !activeEl?.isContentEditable
      ) {
        e.preventDefault();
        el.q?.focus();
      }
    });

    // Row 2 Native Dropdowns
    el.langSelect?.addEventListener("change", () => {
      state.pickIds = [];
      state.lang = el.langSelect.value || "all";
      state.flatLimit = FLAT_PAGE_SIZE;
      renderAll({ announce: true });
    });

    el.examSelect?.addEventListener("change", () => {
      state.pickIds = [];
      state.exam = el.examSelect.value || "all";
      state.flatLimit = FLAT_PAGE_SIZE;
      renderAll({ announce: true });
    });

    el.educatorSelect?.addEventListener("change", () => {
      state.pickIds = [];
      state.educator = el.educatorSelect.value || "";
      state.flatLimit = FLAT_PAGE_SIZE;
      renderAll({ announce: true });
    });

    el.sortSelect?.addEventListener("change", () => {
      state.pickIds = [];
      state.sort = el.sortSelect.value || "trending";
      state.flatLimit = FLAT_PAGE_SIZE;
      renderAll({ announce: true });
    });

    // Syllabus Search & Reset
    el.clearChapterBtn?.addEventListener("click", () => {
      state.chapterNo = 0;
      renderAll({ announce: true });
    });

    el.drawerAllChBtn?.addEventListener("click", () => {
      state.chapterNo = 0;
      el.syllabusDialog?.close();
      renderAll({ announce: true });
    });

    el.chFilter?.addEventListener("input", () => renderSyllabusTrees());
    el.drawerChFilter?.addEventListener("input", () => renderSyllabusTrees());

    // Mobile Sticky Bottom Nav (4 Thumb-Friendly Actions)
    el.mobChaptersBtn?.addEventListener("click", () => {
      openSyllabusDrawer();
    });

    RAIL_MQ.addEventListener?.("change", () => {
      if (RAIL_MQ.matches && railTreeDirty) renderSyllabusTrees();
    });

    el.mobLangBtn?.addEventListener("click", () => {
      openMobilePicker("lang");
    });

    el.mobEducatorBtn?.addEventListener("click", () => {
      openMobilePicker("educator");
    });

    el.mobShareBtn?.addEventListener("click", () => {
      const payload = buildCurrentViewSharePayload();
      if (el.shareSheetPreview) el.shareSheetPreview.textContent = payload.text;
      if (el.shareSheetWa) {
        el.shareSheetWa.href = `https://wa.me/?text=${encodeURIComponent(payload.text)}`;
      }
      el.shareDialog?.showModal();
    });

    el.shareSheetCopy?.addEventListener("click", async () => {
      const payload = buildCurrentViewSharePayload();
      await copyToClipboard(payload.text);
      el.shareDialog?.close();
      showShareToast("✓ Filtered study link copied!", payload.text);
    });

    el.pickerSearch?.addEventListener("input", () => {
      renderMobilePickerOptions();
    });

    // Player Modal Completed Toggle, Personal Notes, Share & Synchronous Audio Cleanup
    el.playerDoneBtn?.addEventListener("click", () => {
      if (!state.activePlayerVideo) return;
      toggleVideoDone(state.activePlayerVideo);
      syncPlayerDoneButton();
      renderAll({ announce: false });
    });

    el.playerShareBtn?.addEventListener("click", () => {
      if (state.activePlayerVideo) shareVideoCard(state.activePlayerVideo);
    });

    el.playerNotesInput?.addEventListener("input", () => {
      const v = state.activePlayerVideo;
      if (!v) return;
      const val = el.playerNotesInput.value;
      if (val.trim()) {
        state.lectureNotes[v._key] = val;
        recordStudyActivity();
      } else {
        delete state.lectureNotes[v._key];
      }
      saveJson(NOTES_KEY, state.lectureNotes);
      if (el.playerNotesStatus) {
        el.playerNotesStatus.textContent = val.trim()
          ? "✓ Saved offline for this lecture"
          : "Saved offline on this device";
      }
    });

    el.playerNotesStampBtn?.addEventListener("click", () => {
      const v = state.activePlayerVideo;
      if (!el.playerNotesInput || !v) return;
      const cur = el.playerNotesInput.value;
      const prefix = cur && !cur.endsWith("\n") ? "\n" : "";
      const insert = `${prefix}• [Key Formula / Exam Trap]: `;
      el.playerNotesInput.value = `${cur}${insert}`;
      el.playerNotesInput.focus();
      el.playerNotesInput.setSelectionRange(
        el.playerNotesInput.value.length,
        el.playerNotesInput.value.length
      );
      el.playerNotesInput.dispatchEvent(new Event("input"));
    });

    el.playerNotesCopyBtn?.addEventListener("click", async () => {
      const v = state.activePlayerVideo;
      if (!v) return;
      const text = buildLectureNotesShareText(v);
      await copyToClipboard(text);
      if (el.playerNotesStatus) {
        el.playerNotesStatus.textContent = "✓ Notes & lecture link copied!";
      }
      showShareToast("✓ Lecture notes copied to clipboard!", text);
    });

    el.playerNotesWaBtn?.addEventListener("click", async () => {
      const v = state.activePlayerVideo;
      if (!v) return;
      const text = buildLectureNotesShareText(v);
      await copyToClipboard(text);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });

    // Synchronous Escape ('cancel') AND 'close' teardown so YouTube audio stops at 0ms
    el.playerDialog?.addEventListener("cancel", teardownPlayer);
    el.playerDialog?.addEventListener("close", teardownPlayer);

    el.toastCloseBtn?.addEventListener("click", () => {
      if (el.shareToast) el.shareToast.hidden = true;
    });

    window.addEventListener("popstate", () => {
      const fallbackRole = loadInitialRole();
      state.userRole = fallbackRole;
      state.compassCollapsed = fallbackRole === "teacher";
      state.pickIds = [];
      state.subject = "All";
      state.classLevel = "all";
      state.chapterNo = 0;
      state.query = "";
      state.lang = "all";
      state.exam = "all";
      state.educator = "";
      state.sort = "trending";
      hydrateStateFromUrl();
      syncSearchClear();
      renderAll({ announce: false, syncUrl: false, deferSecondary: false });
    });

    bindRadiogroupArrowKeys(el.subjectTabs);
    bindRadiogroupArrowKeys(el.classPills);
  }

  async function boot() {
    applyStaticBrandConfig();
    initThemeToggle();
    initLightDismissFallback();
    initVoiceSearch();
    bindEvents();

    try {
      const res = await fetch("data/videos.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      state.meta = payload.meta || {};
      state.syllabus = Array.isArray(payload.syllabus) ? payload.syllabus : [];
      state.syllabusByNo = new Map(
        state.syllabus.map((s) => [Number(s.chapter_no), s])
      );
      state.subjects = Array.from(
        new Set(state.syllabus.map((s) => s.subject).filter(Boolean))
      );
      state.videos = Array.isArray(payload.videos) ? payload.videos : [];
      state.videos.forEach(indexRecord);

      // Prune orphaned saved keys and homework pack IDs against current catalog
      const validKeys = new Set(state.videos.map((v) => v._key));
      const validPickIds = new Set(state.videos.map(getVideoPickId));
      let savedPruned = false;
      for (const k of Array.from(state.saved)) {
        if (!validKeys.has(k)) {
          state.saved.delete(k);
          savedPruned = true;
        }
      }
      if (savedPruned) saveSet(SAVED_KEY, state.saved);
      invalidateFilterCache();

      const cleanedPack = state.homeworkPack.filter((id) =>
        validPickIds.has(id)
      );
      if (cleanedPack.length !== state.homeworkPack.length) {
        state.homeworkPack = cleanedPack;
        saveJson(HW_PACK_KEY, state.homeworkPack);
      }

      const langTotals = new Map();
      const examTotals = new Map();
      const eduTotals = new Map();
      for (const v of state.videos) {
        if (v.language) {
          langTotals.set(v.language, (langTotals.get(v.language) || 0) + 1);
        }
        if (v.target_exam) {
          examTotals.set(
            v.target_exam,
            (examTotals.get(v.target_exam) || 0) + 1
          );
        }
        const ed = v.educator || v.channel;
        if (ed) eduTotals.set(ed, (eduTotals.get(ed) || 0) + 1);
      }

      state.allLanguages = Array.from(langTotals.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([k]) => k);
      state.allExams = Array.from(examTotals.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([k]) => k);
      state.allEducators = Array.from(eduTotals.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([k]) => k);

      hydrateStateFromUrl();
      syncSearchClear();
      renderAll({ announce: false, syncUrl: true, deferSecondary: false });
    } catch (err) {
      if (el.subline) {
        el.subline.hidden = false;
        el.subline.textContent = `Could not load data/videos.json (${err.message}). Serve this folder over HTTP or GitHub Pages.`;
      }
    }
  }

  boot();
})();
