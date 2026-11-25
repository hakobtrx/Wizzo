const KEY = "quizmaker.v1", TK = "quizmaker.theme";
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TYPES = { mcq: "Multiple Choice", tf: "True or False", id: "Identification", multi: "Multiple Select" };
const icon = (name, size = 16) => {
  const paths = {
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    trash: '<path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
    move: '<path d="M12 2v20m-4-4 4 4 4-4M12 2 8 6l4-4 4 4M2 12h20m-4-4 4 4-4 4M2 12l4-4-4 4 4 4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
    form: '<path d="M4 5h16M4 12h16M4 19h16"/><path d="M7 3v4m10 3v4m-7 3v4"/>',
    file: '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 14h8m-8 4h8"/>',
    monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2A5 5 0 0 0 12 3.9l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5V22m4-15h8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1"/>',
    text: '<path d="M4 6V4h16v2M12 4v16m-4 0h8"/>'
  };
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.spark}</svg>`;
};
let activeStorageKey = KEY;
let hasLocalStore = (() => { try { return Boolean(localStorage.getItem(KEY)); } catch (e) { return false; } })();
let libraryView = (() => { try { return localStorage.getItem("quizmaker.libraryView") === "list" ? "list" : "grid"; } catch (e) { return "grid"; } })();
let showFavorites = false;
let activeTagId = null;
let librarySearch = "";

/* ---------- Sample data ---------- */
const sample = () => ({
  id: uid(), title: "General Knowledge Sampler",
  description: "A short mixed quiz that shows all four question types.",
  shuffle: true, count: "", timeLimit: 0,
  questions: [
    { id: uid(), type: "mcq", text: "Which planet is known as the Red Planet?", options: ["Venus","Mars","Jupiter","Mercury"], correct: [1], explanation: "Iron oxide on its surface gives Mars its reddish color." },
    { id: uid(), type: "tf", text: "The Great Wall of China is visible from the Moon with the naked eye.", options: ["True","False"], correct: [1], explanation: "This is a popular myth; the wall is far too narrow to see from that distance." },
    { id: uid(), type: "id", text: "What is the chemical symbol for gold?", answers: ["Au"], explanation: "Au comes from the Latin word “aurum”." },
    { id: uid(), type: "multi", text: "Which of these are prime numbers?", options: ["2","9","11","15"], correct: [0,2], explanation: "9 = 3×3 and 15 = 3×5, so only 2 and 11 are prime." },
    { id: uid(), type: "mcq", text: "How many continents are there on Earth (by the common seven-continent model)?", options: ["5","6","7","8"], correct: [2], explanation: "Africa, Antarctica, Asia, Australia/Oceania, Europe, North America and South America." },
    { id: uid(), type: "id", text: "Which ocean is the largest?", answers: ["Pacific","Pacific Ocean"], explanation: "The Pacific covers about a third of Earth’s surface." }
  ]
});

/* ---------- Storage ---------- */
function load() {
  try { const d = JSON.parse(localStorage.getItem(activeStorageKey)); if (d && Array.isArray(d.quizzes)) return d; } catch (e) {}
  return { quizzes: [sample()] };
}
function normalizeQuizzes() {
  store.tags = Array.isArray(store.tags) ? store.tags : [];
  const validTagIds = new Set(store.tags.map(tag => tag.id));
  store.tags.forEach(tag => { if (!/^#[0-9a-f]{6}$/i.test(tag.color || "")) tag.color = "#aa9bff"; });
  store.quizzes.forEach(quiz => { if (typeof quiz.favorite !== "boolean") quiz.favorite = false; });
  store.quizzes.forEach(quiz => { quiz.tagIds = [...new Set((Array.isArray(quiz.tagIds) ? quiz.tagIds : []).filter(id => validTagIds.has(id)))]; });
}
let cloudClient = null, cloudUser = null, cloudChannel = null, cloudTimer = null;
let quizClockInterval = null;
function storageKeyFor(userId) { return userId ? `${KEY}.account.${userId}` : KEY; }
function activateLocalStore(userId) {
  activeStorageKey = storageKeyFor(userId);
  try {
    const saved = localStorage.getItem(activeStorageKey);
    const parsed = saved && JSON.parse(saved);
    hasLocalStore = Boolean(parsed && Array.isArray(parsed.quizzes));
    store = hasLocalStore ? parsed : { quizzes: [sample()], activity: [], updatedAt: 0 };
  } catch (e) {
    hasLocalStore = false;
    store = { quizzes: [sample()], activity: [], updatedAt: 0 };
  }
  normalizeQuizzes();
}
function readSavedStore(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && Array.isArray(parsed.quizzes) ? parsed : null;
  } catch (e) { return null; }
}
function save() {
  store.updatedAt = Date.now();
  try { localStorage.setItem(activeStorageKey, JSON.stringify(store)); hasLocalStore = true; } catch (e) {}
  if (cloudClient && cloudUser) {
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => { pushCloudStore(); }, 650);
  }
}
function syncConfigured() {
  const c = window.QUIZ_SYNC_CONFIG || {};
  return Boolean(c.url && c.anonKey && !c.url.includes("YOUR_") && !c.anonKey.includes("YOUR_"));
}
function syncFeedback(text, error = false) {
  const el = document.getElementById("sync-feedback");
  if (el) { el.textContent = text; el.classList.toggle("is-error", error); }
}
function syncErrorMessage(error, fallback) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "You’re offline. Changes are saved on this device and will sync when you reconnect.";
  return error?.message || fallback;
}
function updateSyncDialog() {
  const note = document.getElementById("sync-setup-note");
  const login = document.getElementById("sync-login-form");
  const account = document.getElementById("sync-account");
  if (note) { note.hidden = syncConfigured(); note.textContent = syncConfigured() ? "" : "Cloud sync needs a Supabase project URL and public anon key. Follow the setup guide in SUPABASE_SETUP.md, then add those values to sync-config.js."; }
  if (login) login.hidden = !syncConfigured() || Boolean(cloudUser);
  if (account) account.hidden = !cloudUser;
  const email = document.getElementById("sync-user-email");
  if (email && cloudUser) email.textContent = cloudUser.email || "your account";
  const status = document.getElementById("sync-status");
  if (status && cloudUser) status.textContent = "Signed in. Changes sync automatically.";
}
function mergeStores(local, remote) {
  const localIsNewer = (local.updatedAt || 0) > (remote.updatedAt || 0);
  const newer = localIsNewer ? local : remote;
  const older = localIsNewer ? remote : local;
  const deletedQuizzes = new Set([...(local.deletedQuizIds || []), ...(remote.deletedQuizIds || [])]);
  const deletedQuestions = new Set([...(local.deletedQuestionIds || []), ...(remote.deletedQuestionIds || [])]);
  const deletedTags = new Set([...(local.deletedTagIds || []), ...(remote.deletedTagIds || [])]);
  const activityClearedAt = Math.max(local.activityClearedAt || 0, remote.activityClearedAt || 0);
  const byId = new Map((newer.quizzes || []).map(q => [q.id, { ...q, questions: [...(q.questions || [])] }]));
  for (const q of (older.quizzes || [])) {
    if (!byId.has(q.id)) byId.set(q.id, { ...q, questions: [...(q.questions || [])] });
    else {
      const current = byId.get(q.id);
      mergeFields(current, q, ["title", "description", "shuffle", "count", "timeLimit", "favorite", "tagIds"]);
      const questions = new Map((current.questions || []).map(x => [x.id, x]));
      for (const question of (q.questions || [])) {
        if (!questions.has(question.id)) { current.questions.push(question); questions.set(question.id, question); }
        else mergeFields(questions.get(question.id), question, ["type", "text", "explanation", "options", "correct", "answers"]);
      }
    }
  }
  const quizzes = [...byId.values()].filter(q => !deletedQuizzes.has(q.id)).map(q => ({ ...q, questions: (q.questions || []).filter(question => !deletedQuestions.has(question.id)) }));
  const tagMap = new Map((newer.tags || []).map(tag => [tag.id, { ...tag }]));
  for (const tag of older.tags || []) {
    const current = tagMap.get(tag.id);
    if (!current || (tag.updatedAt || 0) > (current.updatedAt || 0)) tagMap.set(tag.id, { ...tag });
  }
  for (const id of deletedTags) tagMap.delete(id);
  for (const quiz of quizzes) quiz.tagIds = [...new Set((quiz.tagIds || []).filter(id => tagMap.has(id)))];
  const activity = new Map();
  for (const a of [...(newer.activity || []), ...(older.activity || [])]) if (Date.parse(a.at) > activityClearedAt) activity.set(`${a.at}:${a.title}`, a);
  const merged = { ...newer, quizzes, tags: [...tagMap.values()], deletedTagIds: [...deletedTags], deletedQuizIds: [...deletedQuizzes], deletedQuestionIds: [...deletedQuestions], activity: [...activity.values()].sort((a,b) => Date.parse(b.at) - Date.parse(a.at)).slice(0,20), activityClearedAt, updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0) };
  return merged;
}
function mergeFields(target, other, fields) {
  const targetHasFieldTimes = Boolean(target.fieldTimes), otherHasFieldTimes = Boolean(other.fieldTimes);
  const targetTimes = target.fieldTimes || {}, otherTimes = other.fieldTimes || {};
  target.fieldTimes = { ...(target.fieldTimes || {}) };
  for (const field of fields) {
    const targetTime = targetHasFieldTimes ? (targetTimes[field] || 0) : (target.updatedAt || 0);
    const otherTime = otherHasFieldTimes ? (otherTimes[field] || 0) : (other.updatedAt || 0);
    if (other[field] !== undefined && otherTime > targetTime) {
      target[field] = other[field];
      target.fieldTimes[field] = otherTime;
    }
  }
}
async function pushCloudStore() {
  if (!cloudClient || !cloudUser) return;
  const userId = cloudUser.id;
  const status = document.getElementById("sync-status");
  if (status) status.textContent = "Saving changes to the cloud...";
  try {
    const payload = JSON.parse(JSON.stringify(store));
    const { error } = await cloudClient.from("quizmaker_data").upsert({ user_id: userId, payload, updated_at: new Date(payload.updatedAt || Date.now()).toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    if (status && cloudUser?.id === userId) status.textContent = "Synced just now. Changes sync automatically.";
  } catch (error) {
    if (status && cloudUser?.id === userId) status.textContent = "Cloud save failed. Your quizzes are still saved on this device.";
    if (cloudUser?.id === userId) syncFeedback(syncErrorMessage(error, "Network error while saving. Your quizzes are still saved on this device."), true);
  }
}
async function syncFromCloud() {
  if (!cloudClient || !cloudUser) return;
  const userId = cloudUser.id, storageKey = activeStorageKey;
  const status = document.getElementById("sync-status");
  if (status) status.textContent = "Syncing your library...";
  try {
    const { data, error } = await cloudClient.from("quizmaker_data").select("payload").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;
    if (!data) { await pushCloudStore(); return; }
    const remote = data.payload || { quizzes: [] };
    const local = hasLocalStore ? store : { quizzes: [], activity: [], updatedAt: 0 };
    const merged = mergeStores(local, remote);
    const needsUpload = JSON.stringify(merged) !== JSON.stringify(remote);
    store = merged;
    normalizeQuizzes();
    try { localStorage.setItem(activeStorageKey, JSON.stringify(store)); hasLocalStore = true; } catch (e) {}
    if (needsUpload) {
      store.updatedAt = Math.max(Date.now(), (remote.updatedAt || 0) + 1);
      try { localStorage.setItem(activeStorageKey, JSON.stringify(store)); } catch (e) {}
      await pushCloudStore();
    } else if (status) status.textContent = "Synced just now. Changes sync automatically.";
    render();
  } catch (error) {
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;
    if (status) status.textContent = "Could not load cloud data. Local quizzes are unchanged.";
    syncFeedback(syncErrorMessage(error, "Network error while syncing. Local quizzes are unchanged."), true);
  }
}
async function initializeAccountStore(userId, guestStore = null) {
  if (!cloudClient || !cloudUser || cloudUser.id !== userId) return;
  const storageKey = storageKeyFor(userId);
  const status = document.getElementById("sync-status");
  if (status) status.textContent = "Checking your cloud library...";

  try {
    const { data, error } = await cloudClient.from("quizmaker_data").select("payload").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;

    // An existing cloud library takes precedence over guest data.
    if (data) { await syncFromCloud(); return; }

    const accountLocal = hasLocalStore ? store : null;
    let candidate = accountLocal && guestStore
      ? mergeStores(accountLocal, guestStore)
      : accountLocal || guestStore || store;
    candidate = JSON.parse(JSON.stringify(candidate));
    candidate.updatedAt = Math.max(Date.now(), candidate.updatedAt || 0);

    // INSERT avoids replacing a library created by another device in a race.
    const { error: insertError } = await cloudClient.from("quizmaker_data").insert({
      user_id: userId,
      payload: candidate,
      updated_at: new Date(candidate.updatedAt).toISOString()
    });
    if (insertError?.code === "23505") { await syncFromCloud(); return; }
    if (insertError) throw insertError;
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;

    store = candidate;
    try { localStorage.setItem(storageKey, JSON.stringify(store)); hasLocalStore = true; } catch (e) {}
    if (status) status.textContent = guestStore
      ? "Your guest quizzes were successfully migrated and synced."
      : "Your library was successfully initialized.";
    syncFeedback(guestStore ? "Your existing quizzes have been transferred to your account." : "Your cloud library is ready.");
    render();
  } catch (error) {
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;
    if (status) status.textContent = "Could not initialize cloud storage. Your local quizzes are safe.";
    syncFeedback(syncErrorMessage(error, "Could not initialize your cloud library."), true);
  }
}
function subscribeCloud() {
  if (!cloudClient || !cloudUser) return;
  if (cloudChannel) cloudClient.removeChannel(cloudChannel);
  const userId = cloudUser.id, storageKey = activeStorageKey;
  cloudChannel = cloudClient.channel(`quizmaker-${userId}`).on("postgres_changes", { event: "*", schema: "public", table: "quizmaker_data", filter: `user_id=eq.${userId}` }, payload => {
    if (cloudUser?.id !== userId || activeStorageKey !== storageKey) return;
    const remote = payload.new?.payload;
    if (!remote || (remote.updatedAt || 0) <= (store.updatedAt || 0)) return;
    const merged = mergeStores(store, remote);
    const needsUpload = JSON.stringify(merged) !== JSON.stringify(remote);
    store = merged;
    try { localStorage.setItem(activeStorageKey, JSON.stringify(store)); hasLocalStore = true; } catch (e) {}
    if (needsUpload) {
      store.updatedAt = Math.max(Date.now(), (remote.updatedAt || 0) + 1);
      try { localStorage.setItem(activeStorageKey, JSON.stringify(store)); } catch (e) {}
      pushCloudStore();
    }
    render();
    syncFeedback("A newer quiz update was synced from another device.");
  }).subscribe();
}
async function initializeCloudSync() {
  if (!syncConfigured()) return;
  if (!window.supabase?.createClient) {
    syncFeedback("Could not load the Supabase client. Check your internet connection and reload.", true);
    return;
  }

  const c = window.QUIZ_SYNC_CONFIG;
  cloudClient = window.supabase.createClient(c.url, c.anonKey);

  try {
    const { data, error } = await cloudClient.auth.getSession();
    if (error) throw error;

    if (data.session) {
      // Capture guest data before activating the account-specific store.
      const guestStore = readSavedStore(KEY);
      cloudUser = data.session.user;
      activateLocalStore(cloudUser.id);
      updateSyncDialog();
      await initializeAccountStore(cloudUser.id, guestStore);
      subscribeCloud();
      render();
    }

    cloudClient.auth.onAuthStateChange((_event, session) => {
      const previousId = cloudUser?.id;
      const nextUser = session?.user || null;
      const guestStore = !previousId && nextUser ? readSavedStore(KEY) : null;
      cloudUser = nextUser;
      updateSyncDialog();

      if (cloudUser?.id !== previousId) {
        clearTimeout(cloudTimer);
        cloudTimer = null;
        if (cloudChannel) {
          cloudClient.removeChannel(cloudChannel);
          cloudChannel = null;
        }

        view = "home"; qid = null; editorSnapshot = null; draft = null; run = null;
        activateLocalStore(cloudUser?.id || null);
        render();

        if (cloudUser) {
          const userId = cloudUser.id;
          setTimeout(async () => {
            if (cloudUser?.id !== userId) return;
            await initializeAccountStore(userId, guestStore);
            if (cloudUser?.id === userId) subscribeCloud();
          }, 0);
        }
      }
    });
  } catch (error) {
    syncFeedback(error?.message || "Could not initialize cloud sync. Check your connection and reload.", true);
  }
}
function openSyncDialog() {
  const dialog = document.getElementById("sync-dialog");
  updateSyncDialog(); syncFeedback("");
  if (dialog && !dialog.open) dialog.showModal();
}

/* ---------- App state ---------- */
let store = load(),
    view = "home",      // home | edit | quiz | result
    qid = null,         // id of the quiz being edited/taken
    draft = null,       // question currently being edited
    run = null,         // current quiz attempt
    cd = null,          // id awaiting delete confirmation
    msg = "",           // message shown on home/edit
    flt = false,        // results: show mistakes only
    impMsg = null;      // import feedback
normalizeQuizzes();
let editorSnapshot = null;
const getQ = () => store.quizzes.find(q => q.id === qid);
function editorHasChanges() {
  if (view !== "edit" || !getQ()) return false;
  if (draft) return true;
  if (!editorSnapshot) {
    const q = getQ();
    return Boolean(q.title || q.description || q.questions.length || q.count || q.shuffle !== true);
  }
  return JSON.stringify(getQ()) !== JSON.stringify(editorSnapshot);
}
let noticeTimer = null;
let tagEditId = null;
let tagDeletePendingId = null;
function openTagDialog(id = null) {
  const tag = id ? store.tags.find(item => item.id === id) : null;
  if (id && !tag) return;
  tagEditId = id;
  document.getElementById("tag-edit-title").textContent = tag ? "Edit tag" : "Create tag";
  document.getElementById("tag-name-input").value = tag?.name || "";
  document.getElementById("tag-color-input").value = tag?.color || "#aa9bff";
  document.getElementById("tag-name-error").textContent = "";
  document.getElementById("tag-delete-open").hidden = !tag;
  document.getElementById("tag-edit-dialog").showModal();
  requestAnimationFrame(() => document.getElementById("tag-name-input").focus());
}
function flashMessage(text) {
  msg = text;
  render();
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    msg = "";
    if (view === "home" || view === "edit") render();
  }, 2000);
}
let quizDeletePendingId = null;

/* ---------- Theme ---------- */
function setTheme(t) { try { localStorage.setItem(TK, t); } catch (e) {} document.documentElement.dataset.theme = t; }
(function () { let t = null; try { t = localStorage.getItem(TK); } catch (e) {} if (t) document.documentElement.dataset.theme = t; })();


/* ---------- Grading ---------- */
const norm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
function grade(it) {
  const q = it.q;
  if (q.type === "id") return norm(it.text) !== "" && q.answers.some(a => norm(a) === norm(it.text));
  return it.sel.length > 0 && [...it.sel].sort().join() === [...q.correct].sort().join();
}
const optText = (q, idx) => idx.map(i => q.options[i]).join(", ");
const yours = it => it.q.type === "id" ? (it.text.trim() || "(no answer)") : (it.sel.length ? optText(it.q, [...it.sel].sort()) : "(no answer)");
const right = q => q.type === "id" ? q.answers.join(" / ") : optText(q, q.correct);

/* ---------- Starting an attempt ---------- */
function startRun(qz, pool, retry) {
  stopQuizClock();
  let qs = pool.slice();
  if (qz.shuffle) qs = shuf(qs);
  const n = parseInt(qz.count);
  if (!retry && n > 0 && n < qs.length) qs = qs.slice(0, n);
  run = {
    mode: retry ? "retry" : "full",
    items: qs.map(q => {
      let o = (q.options || []).map((_, i) => i);
      if (qz.shuffle && q.type !== "tf") o = shuf(o);   // order = display order of option indexes
      return { q, order: o, sel: [], text: "", done: false, ok: false };
    }),
    i: 0, score: 0, deadline: Number(qz.timeLimit) > 0 ? Date.now() + Number(qz.timeLimit) * 60000 : null
  };
  flt = false; view = "quiz"; render();
}

function stopQuizClock() {
  if (quizClockInterval) clearInterval(quizClockInterval);
  quizClockInterval = null;
}
function startQuizClock() {
  stopQuizClock();
  if (view !== "quiz" || !run?.deadline) return;
  const tick = () => {
    const seconds = Math.max(0, Math.ceil((run.deadline - Date.now()) / 1000));
    const clock = document.getElementById("quiz-clock");
    if (clock) { clock.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; clock.classList.toggle("is-urgent", seconds <= 60); }
    if (seconds <= 0) {
      stopQuizClock();
      for (const item of run.items) if (!item.done) { item.done = true; item.ok = false; }
      completeRun(true);
    }
  };
  tick();
  if (view === "quiz") quizClockInterval = setInterval(tick, 1000);
}
function completeRun(expired = false) {
  stopQuizClock();
  run.expired = expired;
  view = "result";
  flt = false;
  const total = run.items.length;
  store.activity = [{ title: getQ()?.title || "Quiz", score: run.score, total, percent: total ? Math.round(run.score / total * 100) : 0, at: new Date().toISOString() }, ...(store.activity || [])].slice(0, 20);
  save();
  render();
}

/* ---------- Text import parser ---------- */
function parseText(t) {
  const out = []; let bad = 0, c = null;
  const fin = () => {
    if (!c) return;
    const q = c; c = null;
    q.text = q.text.trim();
    if (!q.text || !q.ans) { bad++; return; }
    const ex = (q.exp || "").trim();
    if (q.opts.length) {
      if (q.opts.length !== 4) { bad++; return; }
      const idx = [...new Set(q.ans.toUpperCase().replace(/[^A-D]/g, "").split("").map(l => "ABCD".indexOf(l)))];
      if (!idx.length) { bad++; return; }
      out.push({ id: uid(), type: idx.length > 1 ? "multi" : "mcq", text: q.text, options: q.opts, correct: idx, explanation: ex });
    } else if (/^(true|false)$/i.test(q.ans.trim())) {
      out.push({ id: uid(), type: "tf", text: q.text, options: ["True","False"], correct: [/true/i.test(q.ans) ? 0 : 1], explanation: ex });
    } else {
      out.push({ id: uid(), type: "id", text: q.text, answers: q.ans.split("|").map(s => s.trim()).filter(Boolean), explanation: ex });
    }
  };
  let last = "text";
  for (const raw of t.split(/\r?\n/)) {
    const l = raw.trim(); if (!l) continue; let m;
    if (m = l.match(/^(?:Q\s*\d*\s*[:.)]|\d+\s*[.)])\s*(.*)$/i)) { fin(); c = { text: m[1], opts: [], ans: "", exp: "" }; last = "text"; }
    else if (!c) continue;
    else if ((m = l.match(/^([A-D])\s*[.)]\s*(.+)$/i)) && !/^(ans|exp)/i.test(l)) { c.opts.push(m[2].trim()); last = "opt"; }
    else if (m = l.match(/^(?:answers?|ans)\s*[:=]\s*(.+)$/i)) { c.ans = m[1]; last = "ans"; }
    else if (m = l.match(/^(?:explanation|exp)\s*[:=]\s*(.*)$/i)) { c.exp = m[1]; last = "exp"; }
    else if (last === "text") c.text += " " + l;
    else if (last === "exp") c.exp += " " + l;
    else if (last === "opt" && c.opts.length) c.opts[c.opts.length - 1] += " " + l;
  }
  fin();
  return { out, bad };
}

/* =========================================================
   Views (each returns an HTML string)
   ========================================================= */
function tagBadge(tag) {
  return `<span class="tag-badge" style="--tag-color:${esc(tag.color)}">${esc(tag.name)}</span>`;
}
function homeV() {
  const quizzes = store.quizzes;
  const activeTag = activeTagId && store.tags.find(tag => tag.id === activeTagId);
  const scopedQuizzes = quizzes.filter(quiz => showFavorites ? quiz.favorite : activeTag ? (quiz.tagIds || []).includes(activeTag.id) : true);
  const searchTerm = librarySearch.trim().toLocaleLowerCase();
  const shownQuizzes = scopedQuizzes.filter(quiz => !searchTerm || `${quiz.title || ""} ${quiz.description || ""}`.toLocaleLowerCase().includes(searchTerm));
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);
  const attempts = store.activity || [];
  const avg = attempts.length ? Math.round(attempts.reduce((sum, x) => sum + x.percent, 0) / attempts.length) : null;
  const list = shownQuizzes.map(q => `
    <article class="library-card">
      <div class="library-card-top"><span class="library-icon">${icon("book", 17)}</span><span class="library-card-meta"><button class="quiz-favorite-button ${q.favorite ? "is-favorite" : ""}" type="button" data-act="toggle-favorite" data-id="${esc(q.id)}" aria-label="${q.favorite ? "Remove from favorites" : "Add to favorites"}: ${esc(q.title || "Untitled quiz")}" aria-pressed="${Boolean(q.favorite)}" title="${q.favorite ? "Remove from favorites" : "Add to favorites"}">${icon("star", 18)}</button><span class="pill">${q.questions.length} question${q.questions.length === 1 ? "" : "s"}</span></span></div>
      <h2 class="library-card-title">${esc(q.title || "Untitled quiz")}</h2><p class="mu library-card-description">${esc(q.description || "No description yet")}</p>
      ${(q.tagIds || []).length ? `<div class="quiz-tag-badges">${(q.tagIds || []).slice(0, 3).map(id => store.tags.find(tag => tag.id === id)).filter(Boolean).map(tagBadge).join("")}${q.tagIds.length > 3 ? `<span class="tag-overflow">+${q.tagIds.length - 3}</span>` : ""}</div>` : ""}
      <div class="library-card-actions"><button class="pri" data-act="start" data-id="${q.id}" ${q.questions.length ? "" : "disabled"}>Take quiz</button><button data-act="edit" data-id="${q.id}">Edit quiz</button><button class="icon-button dng" title="Delete quiz" aria-label="Delete ${esc(q.title || "quiz")}" data-act="delquiz" data-id="${q.id}">${icon("trash")}</button></div>
      ${q.questions.length ? "" : '<div class="mu empty-hint">Add a question before taking this quiz.</div>'}
    </article>`).join("");
  const recent = attempts.slice(0, 4).map(x => `<div class="activity-row"><span class="activity-dot"></span><span><b>${esc(x.title)}</b><small>${new Date(x.at).toLocaleDateString()} · ${x.score}/${x.total} correct</small></span><strong>${x.percent}%</strong></div>`).join("");
  return `
    <header class="app-header"><a class="app-brand" href="#" data-act="home"><span class="brand-mark">W</span></a><nav class="main-nav"><button class="active" data-act="home">Dashboard</button></nav><button class="mobile-menu-toggle" aria-expanded="false" aria-controls="mobile-nav" data-act="toggle-nav">Menu</button><nav class="mobile-nav" id="mobile-nav" hidden><button data-act="home">Dashboard</button><button data-act="newquiz">Create a quiz</button></nav><div class="header-actions"><button class="sync-open" type="button" data-act="sync">Sync</button><button class="icon-button theme-toggle" id="theme" aria-label="Toggle light or dark mode" title="Toggle theme">${icon("sun")}</button></div></header>
    <main class="app-shell dashboard-shell">
      <section class="welcome-block"><div><span class="eyebrow">YOUR LEARNING SPACE</span><h1>Wizzo</h1><p>Pick up where you left off or create something new.</p></div></section>
      ${msg && !cd ? `<div class="notice" role="status">${esc(msg)}</div>` : ""}
      <section class="overview-grid" aria-label="Quiz overview">
        <article class="overview-card"><span class="overview-label">LIBRARY</span><strong>${quizzes.length}</strong><span class="overview-foot">${quizzes.length === 1 ? "quiz" : "quizzes"} created</span></article>
        <article class="overview-card"><span class="overview-label">QUESTION BANK</span><strong>${totalQuestions}</strong><span class="overview-foot">questions ready to practice</span></article>
        <article class="overview-card"><span class="overview-label">AVERAGE SCORE</span><strong>${avg === null ? "—" : `${avg}%`}</strong><span class="overview-foot">${attempts.length ? `across ${attempts.length} attempts` : "Complete a quiz to see progress"}</span></article>
      </section>
      <div class="dashboard-columns"><section class="library-section"><div class="section-heading"><div><span class="eyebrow">YOUR COLLECTION</span><h2>Library</h2></div><div class="library-heading-actions"><span class="section-count">${quizzes.length} total</span><button class="pri library-create-button" data-act="newquiz">+ Create a quiz</button><div class="library-view-switch" role="group" aria-label="Library layout"><button type="button" class="${libraryView === "grid" ? "active" : ""}" data-act="library-view" data-layout="grid" aria-label="Grid layout" aria-pressed="${libraryView === "grid"}">${icon("grid", 15)}</button><button type="button" class="${libraryView === "list" ? "active" : ""}" data-act="library-view" data-layout="list" aria-label="List layout" aria-pressed="${libraryView === "list"}">${icon("list", 15)}</button></div></div></div>
      <div class="library-search-bar"><label class="library-search-field">${icon("search", 17)}<input id="library-search" type="search" value="${esc(librarySearch)}" placeholder="Search quizzes" aria-label="Search quizzes in this view"></label><span class="library-search-count">${searchTerm ? `${shownQuizzes.length} of ${scopedQuizzes.length} quizzes` : `${scopedQuizzes.length} quizzes`}</span>${searchTerm ? '<button type="button" class="library-search-clear" data-act="clear-search">Clear search</button>' : ""}</div>
      <div class="library-filter-row"><div class="library-collections" role="group" aria-label="Quiz collections"><button class="collection-tab ${!showFavorites && !activeTag ? "active" : ""}" data-act="show-all">${icon("book", 15)} All <span>${quizzes.length}</span></button><button class="collection-tab ${showFavorites ? "active" : ""}" data-act="show-favorites">${icon("star", 15)} Favorites <span>${quizzes.filter(quiz => quiz.favorite).length}</span></button>${store.tags.map(tag => { const count = quizzes.filter(quiz => (quiz.tagIds || []).includes(tag.id)).length; return `<span class="tag-filter-item"><button class="collection-tab tag-filter ${activeTagId === tag.id ? "active" : ""}" data-act="filter-tag" data-id="${esc(tag.id)}" style="--tag-color:${esc(tag.color)}" aria-pressed="${activeTagId === tag.id}">${esc(tag.name)} <span>${count}</span></button><button class="tag-edit-button" data-act="edit-tag" data-id="${esc(tag.id)}" aria-label="Edit ${esc(tag.name)}" title="Edit tag">${icon("edit", 13)}</button></span>`; }).join("")}</div><button type="button" class="create-tag-button" data-act="create-tag">+ Create Tag</button></div>
        ${shownQuizzes.length ? `<div class="library-grid ${libraryView === "list" ? "is-list" : "is-grid"}">${list}</div>` : searchTerm ? `<div class="empty-state"><span class="empty-state-icon">${icon("search", 18)}</span><h3>No quizzes found</h3><p>Try another title or description.</p><button data-act="clear-search">Clear search</button></div>` : showFavorites ? `<div class="empty-state"><span class="empty-state-icon">${icon("star", 18)}</span><h3>No favorites yet</h3><p>Tap the star on a quiz to add it to your favorites.</p><button data-act="show-all">Browse all quizzes</button></div>` : activeTag ? `<div class="empty-state"><span class="empty-state-icon">${icon("tag", 18)}</span><h3>No quizzes with this tag</h3><p>Assign this tag to a quiz from its editor.</p><button data-act="show-all">Browse all quizzes</button></div>` : `<div class="empty-state"><span class="empty-state-icon">${icon("book", 18)}</span><h3>No quizzes yet</h3><p>Create a quiz to get started.</p><button class="pri" data-act="newquiz">Create a quiz</button></div>`}
      </section><aside class="activity-section"><div class="section-heading"><div><span class="eyebrow">KEEP YOUR MOMENTUM</span><h2>Recent activity</h2></div><button class="activity-clear" type="button" data-act="clear-activity" ${attempts.length ? "" : "disabled"}>Clear</button></div>${recent || '<div class="activity-empty">Your completed quizzes and scores will appear here.</div>'}<div class="activity-tip"><b>Study tip</b><p>Short, regular practice sessions help you remember more. Try a quiz today.</p></div></aside></div>
    </main>`;
}

function quizV() {
  const it = run.items[run.i], q = it.q, N = run.items.length, type = q.type;
  const pct = ((run.i + (it.done ? 1 : 0)) / N) * 100, qz = getQ();
  let body = "";
  if (type === "id") {
    body = `<textarea id="ans" class="quiz-identification-answer" data-run="text" aria-label="Your answer" placeholder="Enter your answer" autocomplete="off" ${it.done ? "disabled" : ""}>${esc(it.text)}</textarea>`;
  } else {
    body = it.order.map((oi, k) => {
      const s = it.sel.includes(oi);
      let c = "opt" + (s ? " sel" : "");
      if (it.done) { if (q.correct.includes(oi)) c += " good"; else if (s) c += " bad"; }
      return `<button class="${c}" data-act="pick" data-oi="${oi}" aria-pressed="${s}" ${it.done ? "disabled" : ""}><span>${esc(q.options[oi])}</span></button>`;
    }).join("");
  }
  const can = type === "id" ? it.text.trim() !== "" : it.sel.length > 0;
  const fb = it.done ? `
    <div class="fb ${it.ok ? "good" : "bad"}" role="status">
      <div class="tag">${it.ok ? "Correct · well done" : "Not quite · review the correct answer"}</div>
      ${it.ok ? "" : `<div>Correct answer: <b>${esc(right(q))}</b></div>`}
      <div style="margin-top:4px">${esc(q.explanation || "No explanation provided.")}</div>
    </div>` : "";
  return `
  <div class="card">
    <div class="row sp">
      <div><h2>${esc(qz ? qz.title : "")}</h2><div class="mu">${esc(qz ? qz.description : "")}${run.mode === "retry" ? " (Retrying missed questions)" : ""}</div></div>
    </div>
    <div class="quiz-status-row"><div class="quiz-progress-copy"><b>Question ${run.i + 1} of ${N}</b><span>Score: <b>${run.score}</b>/${N}</span></div>${run.deadline ? `<div class="quiz-timer"><span>Time remaining</span><b id="quiz-clock" aria-live="off"></b></div>` : ""}</div>
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct}%"></i></div>
    <p class="q">${esc(q.text)}</p>
    <div class="mu">${type === "multi" ? "Select all that apply." : type === "id" ? "Type your answer." : "Select one answer."}</div>
    ${body}${fb}
    <div class="quiz-actions">
      <div class="quiz-actions-primary">${it.done ? `<button class="pri" data-act="next">${run.i === N - 1 ? "Finish" : "Next Question"}</button>` : `<button class="pri" data-act="submit" ${!can ? "disabled" : ""}>Submit Answer</button>`}</div>
      <button class="quiz-quit" data-act="quit">Quit</button>
    </div>
  </div>`;
}

function resultV() {
  const N = run.items.length, c = run.score, w = N - c, p = N ? Math.round(c / N * 1000) / 10 : 0;
  const as = p >= 90 ? "Excellent! Outstanding mastery." : p >= 75 ? "Good job! Solid understanding." : p >= 60 ? "Fair. A bit more practice will help." : "Needs improvement. Review the explanations and try again.";
  const items = run.items.map((it, i) => ({ it, i })).filter(x => !flt || !x.it.ok);
  const rv = items.map(({ it, i }) => `
    <div class="item result-item">
      <div class="result-item-content">
        <div class="mu result-question-type">Question ${i + 1} · ${TYPES[it.q.type]}</div>
        <div class="result-question-text"><b>${esc(it.q.text)}</b></div>
        <div class="result-answer"><span>Your answer</span><span class="tag ${it.ok ? "good" : "bad"}">${esc(yours(it))}</span></div>
        ${it.ok ? "" : `<div class="result-answer"><span>Correct answer</span><b>${esc(right(it.q))}</b></div>`}
        <div class="mu result-explanation">${esc(it.q.explanation || "No explanation provided.")}</div>
      </div>
      <span class="tag ${it.ok ? "good" : "bad"}">${it.ok ? "Correct" : "Incorrect"}</span>
    </div>`).join("");
  return `
  <div class="card result-summary">
    <h1>${run.expired ? "Time is up" : "Quiz complete"}</h1><div class="mu">${esc(getQ()?.title || "")}</div>
    <div class="stats">
      <div class="stat"><b>${N}</b>Total questions</div>
      <div class="stat"><b style="color:var(--ok)">${c}</b>Correct</div>
      <div class="stat"><b style="color:var(--bad)">${w}</b>Incorrect</div>
      <div class="stat"><b>${c} / ${N}</b>Final score</div>
      <div class="stat"><b>${p}%</b>Percentage</div>
    </div>
    <p><b>${as}</b></p>
    <div class="row">
      <button class="pri" data-act="restart">Restart quiz</button>
      <button data-act="retry" ${w ? "" : "disabled"}>Retry mistakes</button>
      <button data-act="flt">${flt ? "Show all answers" : "Review mistakes"}</button>
      <button data-act="home">Back to quizzes</button>
    </div>
  </div>
  <div class="card result-review"><h2>Answer review${flt ? " (mistakes only)" : ""}</h2><div class="result-review-list">${rv || '<div class="mu result-perfect">No mistakes to review. Perfect!</div>'}</div></div>`;
}

function editV() {
  const q = getQ();
  const ql = q.questions.map((x, i) => `
    <div class="builder-question">
      <span class="builder-number">${i + 1}</span>
      <div class="builder-question-main"><span class="builder-kind">${TYPES[x.type]}</span><span class="builder-question-text">${esc(x.text)}</span></div>
      <div class="builder-tools"><button aria-label="Edit question" title="Edit" data-act="editq" data-id="${x.id}">${icon("edit", 14)}</button><button aria-label="Delete question" title="Delete" class="dng" data-act="delq" data-id="${x.id}">${cd === x.id ? icon("check", 14) : icon("trash", 14)}</button><span aria-hidden="true" title="Drag to reorder">${icon("move", 15)}</span></div>
    </div>`).join("");
  return `
  <header class="builder-topbar"><button class="mobile-menu-toggle builder-menu-toggle" aria-expanded="false" aria-controls="builder-mobile-nav" data-act="toggle-nav">Menu</button><div class="builder-brand"><span class="builder-mark">W</span></div><span class="builder-top-spacer"></span><button class="sync-open" type="button" data-act="sync">Sync</button><button id="theme" class="icon-button theme-toggle" aria-label="Toggle light or dark mode" title="Toggle theme">${icon("sun")}</button><nav class="mobile-nav builder-mobile-nav" id="builder-mobile-nav" hidden><button data-act="home">Dashboard</button><button data-act="newquiz">Create a quiz</button><button data-act="addq">Add a question</button><button data-act="show-import">Import questions</button><button data-act="done">Done editing</button><button data-act="quit-builder">Quit builder</button></nav></header>
  ${msg ? `<div class="builder-message err" role="status">${esc(msg)}</div>` : ""}
  <div class="builder-layout">
    <aside class="builder-sidebar">
      <div class="builder-welcome"><h2>Welcome to Content Builder</h2><p>Drag and drop content elements to create your content.</p></div>
      <div class="builder-tools-section"><h3>Title ${icon("info", 13)}</h3><div class="builder-tile builder-start-tile"><span class="builder-tile-icon">${icon("book", 16)}</span><span>Quiz title</span></div></div>
      <div class="builder-tools-section"><h3>Content Elements ${icon("info", 13)}</h3><div class="builder-tile-grid"><button class="builder-tile" data-act="addq"><span class="builder-tile-icon">${icon("text", 16)}</span><span>Text Questions</span></button><button class="builder-tile" data-act="addq"><span class="builder-tile-icon">${icon("image", 16)}</span><span>Image Questions</span></button><button class="builder-tile" data-act="addq"><span class="builder-tile-icon">${icon("form", 16)}</span><span>Form Fields</span></button><button class="builder-tile" data-act="addq"><span class="builder-tile-icon">A</span><span>Text</span></button><button class="builder-tile" data-act="addq"><span class="builder-tile-icon">${icon("image", 16)}</span><span>Image or Video</span></button></div></div>
      <div class="builder-tools-section"><h3>Results ${icon("info", 13)}</h3><div class="builder-tile-grid"><button class="builder-tile" data-act="show-import"><span class="builder-tile-icon lavender">${icon("file", 16)}</span><span>Results Builder</span></button><button class="builder-tile" data-act="show-import"><span class="builder-tile-icon lavender">${icon("link", 16)}</span><span>URL Redirect</span></button></div></div>
      <div class="builder-exit-actions"><button class="builder-done pri" data-act="done">Done</button><button class="builder-quit" data-act="quit-builder">Quit</button></div>
    </aside>
    <main class="builder-main">
      <label class="builder-description-label" for="qd">Description</label><textarea class="builder-description" id="qd" data-qf="description" placeholder="Add a short description">${esc(q.description)}</textarea>
      <section class="quiz-tag-editor" aria-label="Quiz tags"><div class="quiz-tag-editor-heading"><b>Tags</b><button type="button" class="tag-manage-create" data-act="create-tag">+ Create Tag</button></div>${store.tags.length ? `<div class="quiz-tag-picker">${store.tags.map(tag => `<button type="button" class="tag-choice ${(q.tagIds || []).includes(tag.id) ? "selected" : ""}" data-act="toggle-quiz-tag" data-id="${esc(tag.id)}" style="--tag-color:${esc(tag.color)}" aria-pressed="${(q.tagIds || []).includes(tag.id)}">${esc(tag.name)}</button>`).join("")}</div>` : '<p class="tag-picker-empty">No tags yet. Create one to organize this quiz.</p>'}</section>
      <section class="builder-stage start-stage"><h2>Title</h2><div class="builder-start-card"><span class="builder-row-grip">${icon("book", 16)}</span><input class="builder-title builder-start-title" aria-label="Quiz title" id="qt" data-qf="title" value="${esc(q.title)}" placeholder="Untitled Quiz"></div></section>
      <section class="builder-stage content-stage"><div class="builder-stage-heading"><h2>Content Elements</h2><div class="builder-settings-inline"><div class="builder-setting-control"><label for="qc">Questions per attempt</label><input type="number" id="qc" min="1" max="${Math.max(1, q.questions.length)}" data-qf="count" value="${esc(q.count)}" placeholder="All"></div><div class="builder-setting-control"><label for="qtime">Timer</label><select id="qtime" data-qf="timeLimit"><option value="0" ${Number(q.timeLimit) ? "" : "selected"}>No timer</option>${[5,10,15,20,30,45,60,90,120].map(m => `<option value="${m}" ${Number(q.timeLimit) === m ? "selected" : ""}>${m} minutes</option>`).join("")}</select></div></div></div>
        <label class="builder-shuffle"><input type="checkbox" data-qf="shuffle" ${q.shuffle ? "checked" : ""}> Randomize questions and answer choices</label>
        ${draft ? draftV() : ""}${ql || (draft ? "" : '<div class="builder-empty">Add your first question using the content tools.</div>')}
        ${draft ? "" : '<button class="builder-add-question" data-act="addq">+ Add question</button>'}
        ${draft ? "" : '<button class="builder-preview-button" data-act="preview">Preview quiz</button>'}
      </section>
      <details class="builder-import"><summary class="builder-import-summary"><span class="import-summary-icon" aria-hidden="true">${icon("file", 18)}</span><span class="import-summary-copy"><b>Import questions from a text file</b><small>Upload a file or paste formatted questions</small></span><span class="import-summary-caret" aria-hidden="true">${icon("chevron", 16)}</span></summary><div class="builder-import-content">
        <div class="import-file-picker"><span class="import-file-icon" aria-hidden="true">${icon("upload", 19)}</span><div class="import-file-copy"><b>Choose a question file</b><span>Plain text files, .txt or .md</span></div><label class="import-file-button" for="file">Browse files</label><input type="file" id="file" accept=".txt,.md,text/plain"></div>
        <div class="import-divider"><span>or paste questions</span></div>
        <label class="import-paste-label" for="imp">Question text</label><textarea id="imp" placeholder="Paste your formatted questions here…"></textarea>
        <div class="import-submit-row"><button class="pri" data-act="import">Import questions</button></div>${impMsg ? `<div class="${impMsg.ok ? "okm" : "err"}" role="status">${esc(impMsg.t)}</div>` : ""}<details class="import-format"><summary>View supported question format</summary>
<pre>Q: Which planet is the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Mercury
Answer: B
Explanation: Iron oxide gives it a red color.

Q: The Sun is a star.
Answer: True

Q: What is the symbol for gold?
Answer: Au | AU

Q: Which are prime?
A) 2
B) 9
C) 11
D) 15
Answer: A, C</pre><p class="import-format-note">Four choices with one answer letter make a multiple-choice question; multiple letters make a multiple-select question. True or False without choices makes a True/False question. Otherwise the question is identification; use <code>|</code> between accepted answers.</p></details>
      </div></details>
    </main>
  </div>`;
}

function draftV() {
  const d = draft; let f = "";
  if (d.type === "mcq" || d.type === "multi") {
    const m = d.type === "multi";
    f = [0,1,2,3].map(i => `
      <div class="orow">
        <input type="${m ? "checkbox" : "radio"}" name="cor" data-df="correct" data-i="${i}" aria-label="Option ${"ABCD"[i]} is correct" ${d.correct.includes(i) ? "checked" : ""}><span class="answer-marker">${m ? "Correct" : "Set as correct"}</span>
        <input type="text" data-df="opt" data-i="${i}" placeholder="Option ${"ABCD"[i]}" value="${esc(d.options[i])}">
      </div>`).join("") + `<div class="mu" style="margin-top:6px">${m ? "Tick every correct option (at least two)." : "Select the correct option."}</div>`;
  } else if (d.type === "tf") {
    f = ["True","False"].map((t, i) => `
      <div class="orow"><input type="radio" name="cor" data-df="correct" data-i="${i}" ${d.correct.includes(i) ? "checked" : ""} id="tf${i}"><label for="tf${i}" style="margin:0;font-weight:400">${t}</label></div>`).join("");
  } else {
    f = `<label for="da">Accepted answer(s)</label><textarea id="da" data-df="answers" placeholder="Separate alternatives with |">${esc(d.answers)}</textarea><div class="mu">Matching ignores case, punctuation and extra spaces.</div>`;
  }
  return `
  <section class="question-editor-panel" aria-label="Question editor">
    <header class="question-editor-heading"><div><span class="eyebrow">QUESTION EDITOR</span><h2>${d.id ? "Edit question" : "New question"}</h2></div></header>
    <div class="question-editor-scroll">
    <label for="dt">Question type</label>
    <select id="dt" data-df="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${d.type === k ? "selected" : ""}>${v}</option>`).join("")}</select>
    <label for="dx">Question *</label><textarea id="dx" data-df="text">${esc(d.text)}</textarea>
    ${d.type === "id" ? "" : "<label>Answer choices</label>"}${f}
    <label for="de">Explanation</label><textarea id="de" data-df="explanation">${esc(d.explanation)}</textarea>
    ${d.err ? `<div class="err">${esc(d.err)}</div>` : ""}
    </div>
    <div class="question-editor-actions"><button class="pri" data-act="saveq">Save question</button><button data-act="cancelq">Cancel</button></div>
  </section>`;
}

function render() {
  const a = document.getElementById("app");
  const resetScroll = a.dataset.view !== view;
  const previousScrollY = window.scrollY;
  const importWasOpen = Boolean(a.querySelector(".builder-import")?.open);
  a.innerHTML = view === "home" ? homeV() : view === "edit" ? editV() : view === "quiz" ? quizV() : resultV();
  a.dataset.view = view;
  const importPanel = a.querySelector(".builder-import");
  if (importPanel && importWasOpen) importPanel.open = true;
  let theme = document.getElementById("theme");
  if (view === "quiz") {
    theme = null;
  } else if (!theme) {
    const header = document.createElement("header");
    header.className = "app-header quiz-header";
    header.innerHTML = `<a class="app-brand" href="#" data-act="home"><span class="brand-mark">W</span></a><span class="header-spacer"></span><div class="header-actions"><button class="sync-open" type="button" data-act="sync">Sync</button><button class="icon-button theme-toggle" id="theme" aria-label="Toggle light or dark mode" title="Toggle theme">${icon("sun")}</button></div>`;
    a.prepend(header);
    theme = header.querySelector("#theme");
  }
  if (theme) theme.onclick = () => {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(cur === "dark" ? "light" : "dark");
  };
  if (view === "quiz") startQuizClock(); else stopQuizClock();
  window.scrollTo(0, resetScroll ? 0 : previousScrollY);
}

document.getElementById("sync-login-form").addEventListener("submit", async e => {
  e.preventDefault();
  if (!cloudClient) { syncFeedback("Add the Supabase project URL and public anon key to sync-config.js first.", true); return; }
  const email = document.getElementById("sync-email").value.trim();
  try {
    const { error } = await cloudClient.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split("#")[0] } });
    syncFeedback(error ? error.message : "Check your email for the sign-in link.", Boolean(error));
  } catch (error) { syncFeedback(error?.message || "Network error while requesting a sign-in link.", true); }
});
document.getElementById("sync-now").addEventListener("click", () => { syncFromCloud(); });
document.getElementById("sync-sign-out").addEventListener("click", async () => {
  if (!cloudClient) return;
  try { const { error } = await cloudClient.auth.signOut(); if (error) throw error; }
  catch (error) { syncFeedback(error?.message || "Could not sign out. Check your connection and try again.", true); }
});
document.getElementById("builder-save-quit").addEventListener("click", () => { document.getElementById("builder-exit-dialog").close(); A.done(); });
document.getElementById("builder-discard-quit").addEventListener("click", () => { document.getElementById("builder-exit-dialog").close(); A["discard-builder"](); });
document.getElementById("builder-stay").addEventListener("click", () => document.getElementById("builder-exit-dialog").close());

/* =========================================================
   Actions (triggered by data-act="name" on buttons)
   ========================================================= */
const A = {
  sync() { openSyncDialog(); },
  "clear-search"() { librarySearch = ""; render(); document.getElementById("library-search")?.focus(); },
  "show-all"() { showFavorites = false; activeTagId = null; render(); },
  "show-favorites"() { showFavorites = true; activeTagId = null; render(); },
  "filter-tag"(id) { activeTagId = id; showFavorites = false; render(); },
  "create-tag"() { openTagDialog(); },
  "edit-tag"(id) { openTagDialog(id); },
  "toggle-quiz-tag"(id) {
    const quiz = getQ(), tag = store.tags.find(item => item.id === id); if (!quiz || !tag) return;
    const assigned = new Set(quiz.tagIds || []);
    assigned.has(id) ? assigned.delete(id) : assigned.add(id);
    quiz.tagIds = [...assigned]; quiz.updatedAt = Date.now(); quiz.fieldTimes = { ...(quiz.fieldTimes || {}), tagIds: quiz.updatedAt }; save(); render();
  },
  "toggle-favorite"(id) {
    const quiz = store.quizzes.find(item => item.id === id); if (!quiz) return;
    quiz.favorite = !quiz.favorite; quiz.updatedAt = Date.now(); quiz.fieldTimes = { ...(quiz.fieldTimes || {}), favorite: quiz.updatedAt }; save(); render();
  },
  "clear-activity"() { if ((store.activity || []).length) document.getElementById("activity-clear-dialog").showModal(); },
  "library-view"(el) { libraryView = el.dataset.layout === "list" ? "list" : "grid"; try { localStorage.setItem("quizmaker.libraryView", libraryView); } catch (e) {} render(); },
  newquiz() { showFavorites = false; activeTagId = null; const q = { id: uid(), title: "", description: "", shuffle: true, count: "", timeLimit: 0, favorite: false, tagIds: [], fieldTimes: { favorite: Date.now(), tagIds: Date.now() }, questions: [] }; store.quizzes.push(q); save(); qid = q.id; editorSnapshot = null; draft = null; impMsg = null; msg = ""; view = "edit"; render(); },
  edit(id) { qid = id; editorSnapshot = JSON.parse(JSON.stringify(getQ())); draft = null; impMsg = null; msg = ""; view = "edit"; render(); },
  delquiz(id) {
    const quiz = store.quizzes.find(item => item.id === id); if (!quiz) return;
    quizDeletePendingId = id;
    document.getElementById("quiz-delete-title").textContent = `Delete “${quiz.title || "Untitled quiz"}”?`;
    document.getElementById("quiz-delete-message").textContent = "This will permanently delete this quiz and all of its questions. This action can’t be undone.";
    document.getElementById("quiz-delete-dialog").showModal();
  },
  start(id) { qid = id; const q = getQ(); if (!q.questions.length) { msg = "This quiz has no questions."; render(); return; } msg = ""; startRun(q, q.questions, false); },
  home() { if (view === "edit" && editorHasChanges()) { A["quit-builder"](); return; } view = "home"; editorSnapshot = null; cd = null; msg = ""; render(); },
  "quit-builder"() { if (!editorHasChanges()) { A["discard-builder"](); return; } document.getElementById("builder-exit-dialog")?.showModal(); },
  "discard-builder"() {
    const q = getQ();
    if (q && editorSnapshot) {
      const i = store.quizzes.findIndex(x => x.id === q.id);
      if (i >= 0) store.quizzes[i] = editorSnapshot;
      const restoredQuestionIds = new Set(editorSnapshot.questions.map(x => x.id));
      store.deletedQuestionIds = (store.deletedQuestionIds || []).filter(id => !restoredQuestionIds.has(id));
    } else if (q) {
      store.quizzes = store.quizzes.filter(x => x.id !== q.id);
      store.deletedQuizIds = [...new Set([...(store.deletedQuizIds || []), q.id])];
    }
    save(); editorSnapshot = null; draft = null; qid = null; msg = ""; view = "home"; render();
  },
  quit() { stopQuizClock(); view = "home"; run = null; render(); },

  pick(el) {
    const it = run.items[run.i]; if (it.done) return;
    const oi = +el.dataset.oi;
    if (it.q.type === "multi") it.sel = it.sel.includes(oi) ? it.sel.filter(x => x !== oi) : [...it.sel, oi];
    else it.sel = [oi];
    render();
  },
  submit() {
    const it = run.items[run.i]; if (it.done) return;
    if (it.q.type === "id" && !it.text.trim()) return;
    if (it.q.type !== "id" && !it.sel.length) return;
    it.done = true; it.ok = grade(it); if (it.ok) run.score++;
    render();
  },
  next() {
    if (!run.items[run.i].done) return;
    if (run.i < run.items.length - 1) { run.i++; render(); }
    else completeRun();
  },
  restart() { const q = getQ(); if (q) startRun(q, q.questions, false); },
  retry() { const q = getQ(); const miss = run.items.filter(x => !x.ok).map(x => x.q); if (q && miss.length) startRun(q, miss, true); },
  flt() { flt = !flt; render(); },

  addq() { draft = { type: "mcq", text: "", options: ["","","",""], correct: [], answers: "", explanation: "", err: "" }; render(); },
  "show-import"() { document.querySelector(".builder-import")?.scrollIntoView({ behavior: "smooth", block: "start" }); },
  "edit-settings"() { document.getElementById("qt")?.focus(); },
  "toggle-nav"(el) { const nav = document.getElementById(el.getAttribute("aria-controls")); if (!nav) return; const open = el.getAttribute("aria-expanded") !== "true"; el.setAttribute("aria-expanded", String(open)); nav.hidden = !open; },
  preview() { const q = getQ(); if (!q.title.trim()) { msg = "Add a quiz title before previewing."; render(); return; } if (!q.questions.length) { msg = "Add at least one question before previewing."; render(); return; } startRun(q, q.questions, false); },
  editq(id) {
    const x = getQ().questions.find(q => q.id === id);
    draft = { id, type: x.type, text: x.text, options: (x.type === "mcq" || x.type === "multi") ? x.options.slice() : ["","","",""], correct: (x.correct || []).slice(), answers: (x.answers || []).join(" | "), explanation: x.explanation || "", err: "" };
    render();
  },
  cancelq() { draft = null; render(); },
  delq(id) { if (cd !== id) { cd = id; msg = "This action permanently removes the question. Select Confirm to continue."; render(); return; } const q = getQ(); q.questions = q.questions.filter(x => x.id !== id); store.deletedQuestionIds = [...new Set([...(store.deletedQuestionIds || []), id])]; cd = null; save(); flashMessage("Question deleted."); },
  saveq() {
    const d = draft, q = getQ(); let e = ""; const o = d.options.map(s => s.trim());
    if (!d.text.trim()) e = "Please enter the question text.";
    else if (d.type === "mcq" || d.type === "multi") {
      if (o.some(s => !s)) e = "All four answer choices must be filled in.";
      else if (new Set(o.map(s => s.toLowerCase())).size < 4) e = "Answer choices must be different from each other.";
      else if (d.type === "mcq" && d.correct.length !== 1) e = "Select exactly one correct answer.";
      else if (d.type === "multi" && d.correct.length < 2) e = "Select at least two correct answers for a multiple select question.";
    }
    else if (d.type === "tf") { if (d.correct.length !== 1) e = "Select True or False as the correct answer."; }
    else if (!d.answers.split("|").some(s => s.trim())) e = "Enter at least one accepted answer.";
    if (e) { d.err = e; render(); return; }
    const n = { id: d.id || uid(), type: d.type, text: d.text.trim(), explanation: d.explanation.trim() };
    if (d.type === "mcq" || d.type === "multi") { n.options = o; n.correct = d.correct.slice().sort(); }
    else if (d.type === "tf") { n.options = ["True","False"]; n.correct = d.correct.slice(); }
    else n.answers = d.answers.split("|").map(s => s.trim()).filter(Boolean);
    const i = q.questions.findIndex(x => x.id === n.id);
    const now = Date.now();
    if (i >= 0) {
      const previous = q.questions[i];
      const fields = ["type", "text", "explanation", "options", "correct", "answers"];
      const baseline = previous.updatedAt || 0;
      n.fieldTimes = previous.fieldTimes ? { ...previous.fieldTimes } : Object.fromEntries(fields.map(field => [field, baseline]));
      for (const field of fields) {
        if (JSON.stringify(previous[field]) !== JSON.stringify(n[field])) n.fieldTimes[field] = now;
      }
      n.updatedAt = now;
      q.questions[i] = n;
    } else {
      n.updatedAt = now;
      n.fieldTimes = Object.fromEntries(["type", "text", "explanation", "options", "correct", "answers"].map(field => [field, now]));
      q.questions.push(n);
    }
    draft = null; save(); render();
  },
  import() {
    const t = document.getElementById("imp").value;
    if (!t.trim()) { impMsg = { ok: false, t: "Paste text or choose a file first." }; render(); return; }
    const r = parseText(t);
    if (!r.out.length) { impMsg = { ok: false, t: "No valid questions found" + (r.bad ? ` (${r.bad} skipped). Check the format below.` : ". Check the format below.") }; render(); return; }
    getQ().questions.push(...r.out); save();
    impMsg = { ok: true, t: `Imported ${r.out.length} question${r.out.length === 1 ? "" : "s"}${r.bad ? `, skipped ${r.bad} incomplete` : ""}.` };
    render();
  },
  done() {
    const q = getQ();
    if (!q.title.trim()) { msg = "Please enter a quiz title."; render(); return; }
    if (draft) { msg = "Save or cancel the open question first."; render(); return; }
    const n = parseInt(q.count);
    if (q.count !== "" && (!(n > 0) || n > q.questions.length)) { msg = `Number of questions must be between 1 and ${q.questions.length}, or blank.`; render(); return; }
    msg = q.questions.length ? "" : "Tip: this quiz has no questions yet, so it can’t be started.";
    save(); editorSnapshot = null; view = "home"; cd = null; render();
  }
};

document.getElementById("tag-edit-form").addEventListener("submit", e => {
  e.preventDefault();
  const nameInput = document.getElementById("tag-name-input"), error = document.getElementById("tag-name-error");
  const name = nameInput.value.trim(), color = document.getElementById("tag-color-input").value;
  if (!name) { error.textContent = "Enter a tag name."; nameInput.focus(); return; }
  if (store.tags.some(tag => tag.id !== tagEditId && tag.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) { error.textContent = "A tag with that name already exists."; nameInput.focus(); return; }
  const now = Date.now();
  if (tagEditId) {
    const tag = store.tags.find(item => item.id === tagEditId);
    if (!tag) { document.getElementById("tag-edit-dialog").close(); return; }
    tag.name = name; tag.color = color; tag.updatedAt = now;
  } else store.tags.push({ id: uid(), name, color, updatedAt: now });
  save(); document.getElementById("tag-edit-dialog").close(); render();
});
document.getElementById("tag-edit-cancel").addEventListener("click", () => document.getElementById("tag-edit-dialog").close());
document.getElementById("tag-edit-dialog").addEventListener("close", () => { tagEditId = null; });
document.getElementById("tag-delete-open").addEventListener("click", () => {
  const tag = store.tags.find(item => item.id === tagEditId); if (!tag) return;
  tagDeletePendingId = tag.id;
  document.getElementById("tag-delete-title").textContent = `Delete “${tag.name}”?`;
  document.getElementById("tag-delete-dialog").showModal();
});
document.getElementById("tag-delete-confirm").addEventListener("click", () => {
  const id = tagDeletePendingId;
  if (!store.tags.some(tag => tag.id === id)) { document.getElementById("tag-delete-dialog").close(); return; }
  store.tags = store.tags.filter(tag => tag.id !== id);
  store.deletedTagIds = [...new Set([...(store.deletedTagIds || []), id])];
  const now = Date.now();
  store.quizzes.forEach(quiz => {
    const next = (quiz.tagIds || []).filter(tagId => tagId !== id);
    if (next.length !== (quiz.tagIds || []).length) { quiz.tagIds = next; quiz.updatedAt = now; quiz.fieldTimes = { ...(quiz.fieldTimes || {}), tagIds: now }; }
  });
  if (activeTagId === id) activeTagId = null;
  save(); document.getElementById("tag-delete-dialog").close(); document.getElementById("tag-edit-dialog").close(); render();
  tagDeletePendingId = null;
});
document.getElementById("tag-delete-cancel").addEventListener("click", () => document.getElementById("tag-delete-dialog").close());
document.getElementById("tag-delete-dialog").addEventListener("close", () => { tagDeletePendingId = null; });
document.getElementById("quiz-delete-confirm").addEventListener("click", () => {
  const id = quizDeletePendingId;
  if (!store.quizzes.some(quiz => quiz.id === id)) { document.getElementById("quiz-delete-dialog").close(); return; }
  store.quizzes = store.quizzes.filter(quiz => quiz.id !== id);
  store.deletedQuizIds = [...new Set([...(store.deletedQuizIds || []), id])];
  cd = null; save();
  document.getElementById("quiz-delete-dialog").close();
  quizDeletePendingId = null;
  render();
});
document.getElementById("quiz-delete-cancel").addEventListener("click", () => document.getElementById("quiz-delete-dialog").close());
document.getElementById("quiz-delete-dialog").addEventListener("close", () => { quizDeletePendingId = null; });
document.getElementById("activity-clear-confirm").addEventListener("click", () => {
  store.activity = [];
  store.activityClearedAt = Date.now();
  save();
  document.getElementById("activity-clear-dialog").close();
  render();
});
document.getElementById("activity-clear-cancel").addEventListener("click", () => document.getElementById("activity-clear-dialog").close());

/* =========================================================
   Event wiring (delegated, so re-rendering is safe)
   ========================================================= */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const f = A[el.dataset.act];
  if (f) { if (!["delquiz","delq"].includes(el.dataset.act)) cd = null; f(el.dataset.id || el); if (el.closest(".mobile-nav") && !["toggle-nav"].includes(el.dataset.act)) { const nav = el.closest(".mobile-nav"), toggle = document.querySelector(`[aria-controls="${nav.id}"]`); nav.hidden = true; if (toggle) toggle.setAttribute("aria-expanded", "false"); } }
});

function onField(e) {
  const t = e.target;
  if (t.id === "library-search") {
    const start = t.selectionStart, end = t.selectionEnd;
    librarySearch = t.value;
    render();
    const input = document.getElementById("library-search");
    if (input) { input.focus(); input.setSelectionRange(start, end); }
    return;
  }
  // Quiz settings (autosaved)
  if (t.dataset.qf) { const q = getQ(), k = t.dataset.qf; q[k] = k === "shuffle" ? t.checked : t.value; q.updatedAt = Date.now(); const fields = ["title", "description", "shuffle", "count", "timeLimit"]; const baseline = store.updatedAt || 0; q.fieldTimes = { ...Object.fromEntries(fields.map(field => [field, baseline])), ...(q.fieldTimes || {}), [k]: q.updatedAt }; save(); const title = document.querySelector(".builder-title"); if (title && k === "title") title.setAttribute("aria-label", q.title ? `Quiz title: ${q.title}` : "Quiz title"); return; }
  // Question editor fields
  if (t.dataset.df && draft) {
    const k = t.dataset.df;
    if (k === "type") { draft.type = t.value; draft.correct = []; draft.err = ""; render(); return; }
    if (k === "opt") draft.options[+t.dataset.i] = t.value;
    else if (k === "correct") draft.correct = [...document.querySelectorAll('[data-df="correct"]:checked')].map(x => +x.dataset.i);
    else draft[k] = t.value;
    return;
  }
  // Identification answer while taking a quiz
  if (t.dataset.run === "text") {
    run.items[run.i].text = t.value;
    const b = document.querySelector('[data-act="submit"]'); if (b) b.disabled = !t.value.trim();
  }
}
document.addEventListener("input", onField);
document.addEventListener("change", e => {
  if (e.target.id === "file") {   // load a text file into the import box
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      document.getElementById("imp").value = String(r.result);
      impMsg = { ok: true, t: `Loaded “${f.name}”. Click “Import questions” to add them.` };
      const v = document.getElementById("imp").value;
      render(); document.getElementById("imp").value = v;
    };
    r.onerror = () => { impMsg = { ok: false, t: "Could not read that file." }; render(); };
    r.readAsText(f);
    return;
  }
  onField(e);
});
document.addEventListener("keydown", e => {   // Enter submits; Shift+Enter inserts a newline
  if (e.key === "Enter" && e.target.id === "ans" && !e.shiftKey) {
    e.preventDefault();
    const it = run.items[run.i];
    it.done ? A.next() : A.submit();
  }
});

render();
initializeCloudSync();
