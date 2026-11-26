const API_BASE = window.MD_CHAT_API_BASE || "";
const apiUrl = path => `${API_BASE}${path}`;

const daysEl = document.getElementById("days");
const messagesEl = document.getElementById("messages");
const selectedDateEl = document.getElementById("selectedDate");
const form = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");
const sendBtn = document.getElementById("sendBtn");
const sendText = sendBtn.querySelector(".send-text");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const copySelectedBtn = document.getElementById("copySelectedBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const cancelSelectBtn = document.getElementById("cancelSelectBtn");

const loginOpenBtn = document.getElementById("loginOpenBtn");
const adminLinkBtn = document.getElementById("adminLinkBtn");
const addFriendBtn = document.getElementById("addFriendBtn");
const profileOpenBtn = document.getElementById("profileOpenBtn");
const settingsOpenBtn = document.getElementById("settingsOpenBtn");
const friendsListEl = document.getElementById("friendsList");
const chatTitleEl = document.getElementById("chatTitle");
const roomBadgeEl = document.getElementById("roomBadge");
const addFriendModal = document.getElementById("addFriendModal");
const addFriendForm = document.getElementById("addFriendForm");
const registeredUsersList = document.getElementById("registeredUsersList");
const friendNameInput = document.getElementById("friendNameInput");
const friendEmailInput = document.getElementById("friendEmailInput");
const addFriendError = document.getElementById("addFriendError");
const profileAvatarSmall = document.getElementById("profileAvatarSmall");
const profileNameLabel = document.getElementById("profileNameLabel");

const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginEmail = document.getElementById("loginEmail");
const loginError = document.getElementById("loginError");

const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const profileAvatarLarge = document.getElementById("profileAvatarLarge");
const profileHeroName = document.getElementById("profileHeroName");
const profileHeroEmail = document.getElementById("profileHeroEmail");
const profileHeroBio = document.getElementById("profileHeroBio");
const profileImageInput = document.getElementById("profileImageInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const profileAbout = document.getElementById("profileAbout");
const profileError = document.getElementById("profileError");
const logoutBtn = document.getElementById("logoutBtn");

const settingsModal = document.getElementById("settingsModal");
const settingDarkToggle = document.getElementById("settingDarkToggle");
const settingPatternToggle = document.getElementById("settingPatternToggle");
const settingFontSize = document.getElementById("settingFontSize");

let selectedDay = new Date().toLocaleDateString("en-CA");
let activeRoom = "everyone";
let activeRoomTitle = "Everyone's chat";
let friendsList = [];
let currentItems = [];
let selectMode = false;
let selectedIds = new Set();
let openMenuId = null;
let editingId = null;

let currentUser = {
  name: localStorage.getItem("txtchat_name") || "",
  email: localStorage.getItem("txtchat_email") || "",
  about: localStorage.getItem("txtchat_about") || "Hey there! I am using MD Chat v7.",
  avatar: localStorage.getItem("txtchat_avatar") || ""
};

const MOON_SVG = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SUN_SVG = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
const CLIP_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;

document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("selectstart", e => {
  const tag = e.target && e.target.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA") e.preventDefault();
});
document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  const ctrlOrCmd = e.ctrlKey || e.metaKey;
  if (
    e.key === "F12" ||
    (ctrlOrCmd && key === "u") ||
    (ctrlOrCmd && key === "s") ||
    (ctrlOrCmd && e.shiftKey && ["i", "j", "c"].includes(key)) ||
    (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(key))
  ) {
    e.preventDefault();
  }
  if (e.key === "Escape") {
    loginModal.hidden = true;
    profileModal.hidden = true;
    settingsModal.hidden = true;
    addFriendModal.hidden = true;
    emojiPicker.hidden = true;
  }
});

document.addEventListener("click", event => {
  if (openMenuId && !event.target.closest(".msg-menu") && !event.target.closest(".msg-more")) {
    openMenuId = null;
    renderMessages();
  }
  if (!emojiPicker.hidden && !event.target.closest("#emojiPicker") && !event.target.closest("#emojiBtn")) {
    emojiPicker.hidden = true;
  }
});

const EMOJIS = [
  "😀","😂","😍","😎","😢","😡","🥳","🤔","🙏",
  "👍","👎","👋","✋","👌","✌️","🤞","👏","🤝",
  "❤️","💔","🔥","✨","🎉","💯","⭐","✅","❌",
  "🌳","🌲","🌴","🌱","🌵","🍀","🌸","🌺","🌻",
  "🍎","🍌","🍇","🍉","🍓","🥭","🍍","🍒","🍊",
  "🚗","🚕","🚙","🏎️","🚌","🏍️","🛵","🚲","🚀"
];

EMOJIS.forEach(em => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "emoji-item";
  btn.textContent = em;
  btn.addEventListener("click", () => {
    const start = messageInput.selectionStart ?? messageInput.value.length;
    const end = messageInput.selectionEnd ?? messageInput.value.length;
    messageInput.value = messageInput.value.slice(0, start) + em + messageInput.value.slice(end);
    const pos = start + em.length;
    messageInput.setSelectionRange(pos, pos);
    messageInput.focus();
  });
  emojiPicker.appendChild(btn);
});

emojiBtn.addEventListener("click", e => {
  e.stopPropagation();
  emojiPicker.hidden = !emojiPicker.hidden;
});

function validateUserFields(name, email) {
  if (name.length < 3) return "Username must be at least 3 letters.";
  if (!/^[^\s@]+@gmail\.com$/i.test(email)) return "Email must end with @gmail.com.";
  return "";
}

function isLoggedIn() {
  return currentUser.name.length >= 3 && /^[^\s@]+@gmail\.com$/i.test(currentUser.email);
}

function isAdmin() {
  return currentUser.name.toLowerCase() === "admin" && currentUser.email.toLowerCase() === "admin@gmail.com";
}

function renderAvatar(el, initial, avatarUrl) {
  el.innerHTML = "";
  if (avatarUrl) {
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.alt = "Profile";
    el.appendChild(img);
  } else {
    el.textContent = initial;
  }
}

function syncUserUI() {
  const logged = isLoggedIn();
  loginOpenBtn.hidden = logged;
  profileOpenBtn.hidden = !logged;
  adminLinkBtn.hidden = !isAdmin();
  if (logged) {
    const initial = currentUser.name.charAt(0).toUpperCase();
    renderAvatar(profileAvatarSmall, initial, currentUser.avatar);
    profileNameLabel.textContent = currentUser.name;
    renderAvatar(profileAvatarLarge, initial, currentUser.avatar);
    profileHeroName.textContent = currentUser.name;
    profileHeroEmail.textContent = currentUser.email;
    profileHeroBio.textContent = currentUser.about;
    removePhotoBtn.hidden = !currentUser.avatar;
  }
}

function openModal(modal) {
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
}

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.getAttribute("data-close"));
    if (target) closeModal(target);
  });
});

[loginModal, profileModal, settingsModal, addFriendModal].forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal(modal);
  });
});

function friendRoomId(friendName) {
  const pair = [currentUser.name.trim().toLowerCase(), friendName.trim().toLowerCase()].sort();
  return `dm_${pair[0]}__${pair[1]}`;
}

function selectRoom(room, title, badgeText) {
  activeRoom = room;
  activeRoomTitle = title;
  chatTitleEl.textContent = title;
  roomBadgeEl.textContent = badgeText;
  exitSelectMode();
  renderFriends();
  loadDays();
  loadMessages();
}

function renderFriends() {
  friendsListEl.innerHTML = "";
  const everyoneBtn = document.createElement("button");
  everyoneBtn.type = "button";
  everyoneBtn.className = "friend-item" + (activeRoom === "everyone" ? " active" : "");
  everyoneBtn.innerHTML = `<span class="friend-avatar">E</span><span class="friend-info"><div class="friend-name">Everyone's chat</div><div class="friend-sub">Group room</div></span>`;
  everyoneBtn.addEventListener("click", () => selectRoom("everyone", "Everyone's chat", "Daily TXT storage"));
  friendsListEl.appendChild(everyoneBtn);

  friendsList.forEach(f => {
    const rId = friendRoomId(f.name);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "friend-item" + (activeRoom === rId ? " active" : "");
    const avatar = document.createElement("span");
    avatar.className = "friend-avatar";
    avatar.textContent = f.name.charAt(0).toUpperCase();
    const info = document.createElement("span");
    info.className = "friend-info";
    const fname = document.createElement("div");
    fname.className = "friend-name";
    fname.textContent = f.name;
    const fsub = document.createElement("div");
    fsub.className = "friend-sub";
    fsub.textContent = f.email || "Direct chat";
    info.append(fname, fsub);
    btn.append(avatar, info);
    btn.addEventListener("click", () => selectRoom(rId, `Chat with ${f.name}`, "Friend chat"));
    friendsListEl.appendChild(btn);
  });
}

async function loadFriends() {
  if (!isLoggedIn()) {
    friendsList = [];
    renderFriends();
    return;
  }
  const res = await fetch(apiUrl(`/api/friends?user=${encodeURIComponent(currentUser.name)}`));
  friendsList = await res.json();
  renderFriends();
}

async function submitAddFriend(fname, femail = "") {
  addFriendError.hidden = true;
  try {
    const res = await fetch(apiUrl("/api/friends"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentUser.name, name: fname, email: femail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not add friend");
    friendsList = data;
    closeModal(addFriendModal);
    selectRoom(friendRoomId(fname), `Chat with ${fname}`, "Friend chat");
    showToast(`Added ${fname}`);
  } catch (err) {
    addFriendError.textContent = err.message;
    addFriendError.hidden = false;
  }
}

async function loadRegisteredUsers() {
  registeredUsersList.innerHTML = `<div class="registered-empty">Loading…</div>`;
  const res = await fetch(apiUrl(`/api/users?exclude=${encodeURIComponent(currentUser.name)}`));
  const users = await res.json();
  registeredUsersList.innerHTML = "";
  if (!users.length) {
    registeredUsersList.innerHTML = `<div class="registered-empty">No other logged-in users yet.</div>`;
    return;
  }
  users.forEach(u => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "friend-item";
    const avatar = document.createElement("span");
    avatar.className = "friend-avatar";
    avatar.textContent = u.name.charAt(0).toUpperCase();
    const info = document.createElement("span");
    info.className = "friend-info";
    const uname = document.createElement("div");
    uname.className = "friend-name";
    uname.textContent = u.name;
    const uemail = document.createElement("div");
    uemail.className = "friend-sub";
    uemail.textContent = u.email;
    info.append(uname, uemail);
    btn.append(avatar, info);
    btn.addEventListener("click", () => submitAddFriend(u.name, u.email));
    registeredUsersList.appendChild(btn);
  });
}

addFriendBtn.addEventListener("click", () => {
  if (!isLoggedIn()) {
    loginError.textContent = "Please login first to add a friend.";
    loginError.hidden = false;
    openModal(loginModal);
    return;
  }
  addFriendError.hidden = true;
  friendNameInput.value = "";
  friendEmailInput.value = "";
  openModal(addFriendModal);
  loadRegisteredUsers();
  setTimeout(() => friendNameInput.focus(), 0);
});

addFriendForm.addEventListener("submit", async e => {
  e.preventDefault();
  const fname = friendNameInput.value.trim();
  const femail = friendEmailInput.value.trim();
  if (fname.length < 3) {
    addFriendError.textContent = "Friend name must be at least 3 letters.";
    addFriendError.hidden = false;
    return;
  }
  if (femail && !/^[^\s@]+@gmail\.com$/i.test(femail)) {
    addFriendError.textContent = "Friend email must end with @gmail.com.";
    addFriendError.hidden = false;
    return;
  }
  await submitAddFriend(fname, femail);
});

loginOpenBtn.addEventListener("click", () => {
  loginError.hidden = true;
  loginUsername.value = currentUser.name;
  loginEmail.value = currentUser.email;
  openModal(loginModal);
  setTimeout(() => loginUsername.focus(), 0);
});

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = loginUsername.value.trim();
  const email = loginEmail.value.trim();
  const err = validateUserFields(name, email);
  if (err) {
    loginError.textContent = err;
    loginError.hidden = false;
    return;
  }
  try {
    const res = await fetch(apiUrl("/api/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    currentUser.name = data.name;
    currentUser.email = data.email;
    localStorage.setItem("txtchat_name", data.name);
    localStorage.setItem("txtchat_email", data.email);
    loginError.hidden = true;
    closeModal(loginModal);
    syncUserUI();
loadFriends();
    await loadFriends();
    renderMessages();
    if (data.is_admin) {
      window.location.href = "/admin";
      return;
    }
    showToast(`Welcome, ${data.name}!`);
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
  }
});

profileOpenBtn.addEventListener("click", () => {
  profileError.hidden = true;
  profileUsername.value = currentUser.name;
  profileEmail.value = currentUser.email;
  profileAbout.value = currentUser.about;
  syncUserUI();
loadFriends();
  openModal(profileModal);
});

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 180;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      currentUser.avatar = canvas.toDataURL("image/jpeg", 0.85);
      localStorage.setItem("txtchat_avatar", currentUser.avatar);
      syncUserUI();
loadFriends();
      showToast("Profile photo updated");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  profileImageInput.value = "";
});

removePhotoBtn.addEventListener("click", () => {
  currentUser.avatar = "";
  localStorage.removeItem("txtchat_avatar");
  syncUserUI();
loadFriends();
  showToast("Profile photo removed");
});

profileForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = profileUsername.value.trim();
  const email = profileEmail.value.trim();
  const about = profileAbout.value.trim() || "Hey there! I am using MD Chat v7.";
  const err = validateUserFields(name, email);
  if (err) {
    profileError.textContent = err;
    profileError.hidden = false;
    return;
  }
  currentUser = { ...currentUser, name, email, about };
  localStorage.setItem("txtchat_name", name);
  localStorage.setItem("txtchat_email", email);
  localStorage.setItem("txtchat_about", about);
  profileError.hidden = true;
  closeModal(profileModal);
  syncUserUI();
loadFriends();
  renderMessages();
  showToast("Profile updated");
});

logoutBtn.addEventListener("click", () => {
  currentUser.name = "";
  currentUser.email = "";
  localStorage.removeItem("txtchat_name");
  localStorage.removeItem("txtchat_email");
  closeModal(profileModal);
  syncUserUI();
loadFriends();
  activeRoom = "everyone";
  chatTitleEl.textContent = "Everyone's chat";
  roomBadgeEl.textContent = "Daily TXT storage";
  loadFriends();
  loadDays();
  loadMessages();
  showToast("Logged out");
});

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  themeIcon.innerHTML = isDark ? SUN_SVG : MOON_SVG;
  themeLabel.textContent = isDark ? "Light" : "Dark";
  settingDarkToggle.checked = isDark;
  localStorage.setItem("txtchat_theme", isDark ? "dark" : "light");
}

function applyPattern(enabled) {
  document.body.classList.toggle("no-pattern", !enabled);
  settingPatternToggle.checked = enabled;
  localStorage.setItem("txtchat_pattern", enabled ? "on" : "off");
}

function applyFontSize(size) {
  document.body.classList.remove("font-sm", "font-md", "font-lg");
  const valid = ["sm", "md", "lg"].includes(size) ? size : "md";
  document.body.classList.add(`font-${valid}`);
  settingFontSize.value = valid;
  localStorage.setItem("txtchat_fontsize", valid);
}

applyTheme(localStorage.getItem("txtchat_theme") || "light");
applyPattern((localStorage.getItem("txtchat_pattern") || "on") === "on");
applyFontSize(localStorage.getItem("txtchat_fontsize") || "md");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

settingsOpenBtn.addEventListener("click", () => openModal(settingsModal));
settingDarkToggle.addEventListener("change", () => applyTheme(settingDarkToggle.checked ? "dark" : "light"));
settingPatternToggle.addEventListener("change", () => applyPattern(settingPatternToggle.checked));
settingFontSize.addEventListener("change", () => applyFontSize(settingFontSize.value));

syncUserUI();
loadFriends();

fileInput.addEventListener("change", () => {
  filePreview.textContent = fileInput.files[0] ? `Attached: ${fileInput.files[0].name}` : "";
});

function showToast(text) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast("Copied to clipboard");
}

function canEditSeconds(item) {
  if (item.sender !== currentUser.name || !item.message) return 0;
  const elapsed = (Date.now() - new Date(item.time).getTime()) / 1000;
  const left = Math.ceil(15 - elapsed);
  return left > 0 ? left : 0;
}

function updateSelectionBar() {
  selectionBar.hidden = !selectMode;
  messagesEl.classList.toggle("select-mode", selectMode);
  selectionCount.textContent = `${selectedIds.size} selected`;
}

function exitSelectMode() {
  selectMode = false;
  selectedIds.clear();
  updateSelectionBar();
  renderMessages();
}

cancelSelectBtn.addEventListener("click", exitSelectMode);

copySelectedBtn.addEventListener("click", () => {
  const texts = currentItems
    .filter(m => selectedIds.has(m.id) && m.message)
    .map(m => `${m.sender}: ${m.message}`);
  if (texts.length) copyText(texts.join("\n"));
  exitSelectMode();
});

deleteSelectedBtn.addEventListener("click", async () => {
  if (!selectedIds.size) return;
  await deleteIds([...selectedIds]);
  exitSelectMode();
});

async function deleteIds(ids) {
  try {
    const res = await fetch(apiUrl("/api/delete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: selectedDay, room: activeRoom, ids })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not delete message");
    await loadDays();
    await loadMessages();
  } catch (err) {
    alert(err.message);
  }
}

async function saveEdit(id, newMessage) {
  try {
    const res = await fetch(apiUrl("/api/edit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: selectedDay,
        room: activeRoom,
        id,
        sender: currentUser.name,
        message: newMessage
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not edit message");
    editingId = null;
    await loadMessages();
  } catch (err) {
    alert(err.message);
    editingId = null;
    await loadMessages();
  }
}

function dateLabel(day) {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" });
}
function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
async function loadDays() {
  const response = await fetch(apiUrl(`/api/days?room=${encodeURIComponent(activeRoom)}`));
  const days = await response.json();
  if (!days.includes(selectedDay)) days.push(selectedDay);
  days.sort().reverse();
  daysEl.innerHTML = "";
  days.forEach(day => {
    const button = document.createElement("button");
    button.className = "day" + (day === selectedDay ? " active" : "");
    button.textContent = dateLabel(day);
    button.addEventListener("click", () => {
      selectedDay = day;
      exitSelectMode();
      loadDays();
      loadMessages();
    });
    daysEl.appendChild(button);
  });
}

function addMessage(item) {
  const isMine = item.sender === currentUser.name;
  const wrap = document.createElement("article");
  wrap.className = "message" + (isMine ? " mine" : "") + (selectedIds.has(item.id) ? " selected" : "");

  if (selectMode) {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "msg-select-box";
    cb.checked = selectedIds.has(item.id);
    cb.addEventListener("click", e => e.stopPropagation());
    cb.addEventListener("change", () => {
      if (cb.checked) selectedIds.add(item.id);
      else selectedIds.delete(item.id);
      wrap.classList.toggle("selected", cb.checked);
      updateSelectionBar();
    });
    wrap.appendChild(cb);
    wrap.addEventListener("click", () => {
      if (selectedIds.has(item.id)) selectedIds.delete(item.id);
      else selectedIds.add(item.id);
      renderMessages();
      updateSelectionBar();
    });
  }

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  const sender = document.createElement("span");
  sender.className = "sender";
  sender.textContent = item.sender;

  const metaRight = document.createElement("span");
  metaRight.className = "msg-meta-right";

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = timeLabel(item.time);
  if (item.edited) {
    const ed = document.createElement("span");
    ed.className = "edited-tag";
    ed.textContent = "(edited)";
    time.appendChild(ed);
  }
  if (isMine) {
    const ticks = document.createElement("span");
    ticks.className = "ticks";
    ticks.textContent = "✓✓";
    time.appendChild(ticks);
  }
  metaRight.appendChild(time);

  if (!selectMode) {
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "msg-more";
    moreBtn.title = "Message options";
    moreBtn.textContent = "▾";
    moreBtn.addEventListener("click", e => {
      e.stopPropagation();
      openMenuId = openMenuId === item.id ? null : item.id;
      renderMessages();
    });
    metaRight.appendChild(moreBtn);
  }

  meta.append(sender, metaRight);
  wrap.appendChild(meta);

  if (editingId === item.id) {
    const box = document.createElement("div");
    box.className = "edit-box";
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.message || "";
    input.maxLength = 5000;
    const actions = document.createElement("div");
    actions.className = "edit-actions";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "edit-save";
    saveBtn.textContent = "Save";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "edit-cancel";
    cancelBtn.textContent = "Cancel";
    saveBtn.addEventListener("click", () => saveEdit(item.id, input.value));
    cancelBtn.addEventListener("click", () => { editingId = null; renderMessages(); });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); saveEdit(item.id, input.value); }
      if (e.key === "Escape") { editingId = null; renderMessages(); }
    });
    actions.append(cancelBtn, saveBtn);
    box.append(input, actions);
    wrap.appendChild(box);
    setTimeout(() => input.focus(), 0);
  } else if (item.message) {
    const body = document.createElement("div");
    body.className = "msg-text";
    body.textContent = item.message;
    wrap.appendChild(body);
  }

  if (item.attachment) {
    const link = document.createElement("a");
    link.className = "attachment";
    link.href = apiUrl(item.attachment.url);
    link.target = "_blank";
    link.rel = "noopener";
    link.download = item.attachment.name;
    if (item.attachment.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = apiUrl(item.attachment.url);
      img.alt = item.attachment.name;
      link.append(img);
    }
    const name = document.createElement("span");
    name.className = "attachment-label";
    name.innerHTML = CLIP_SVG;
    name.appendChild(document.createTextNode(item.attachment.name));
    link.append(name);
    wrap.appendChild(link);
  }

  if (openMenuId === item.id && !selectMode) {
    const menu = document.createElement("div");
    menu.className = "msg-menu";
    menu.addEventListener("click", e => e.stopPropagation());

    const editLeft = canEditSeconds(item);
    if (editLeft > 0) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.innerHTML = `<span>Edit</span><span>${editLeft}s</span>`;
      editBtn.addEventListener("click", () => {
        openMenuId = null;
        editingId = item.id;
        renderMessages();
      });
      menu.appendChild(editBtn);
    }

    if (item.message) {
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        openMenuId = null;
        renderMessages();
        copyText(item.message);
      });
      menu.appendChild(copyBtn);
    }

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.textContent = "Select";
    selectBtn.addEventListener("click", () => {
      openMenuId = null;
      selectMode = true;
      selectedIds.add(item.id);
      updateSelectionBar();
      renderMessages();
    });
    menu.appendChild(selectBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      openMenuId = null;
      deleteIds([item.id]);
    });
    menu.appendChild(delBtn);

    wrap.appendChild(menu);
  }

  messagesEl.appendChild(wrap);
}

function renderMessages() {
  const scrollBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 60;
  messagesEl.innerHTML = "";
  if (!currentItems.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No messages on this date. Start the conversation!";
    messagesEl.appendChild(empty);
    return;
  }
  currentItems.forEach(addMessage);
  if (scrollBottom && !editingId && !openMenuId) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

async function loadMessages() {
  selectedDateEl.textContent = dateLabel(selectedDay);
  const response = await fetch(apiUrl(`/api/messages?day=${encodeURIComponent(selectedDay)}&room=${encodeURIComponent(activeRoom)}`));
  currentItems = await response.json();
  renderMessages();
  if (!editingId && !openMenuId && !selectMode) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!isLoggedIn()) {
    loginError.textContent = "Please login with your username (min 3 letters) and @gmail.com email first.";
    loginError.hidden = false;
    openModal(loginModal);
    return;
  }
  if (!messageInput.value.trim() && !fileInput.files.length) return;
  const data = new FormData();
  data.append("sender", currentUser.name);
  data.append("email", currentUser.email);
  data.append("room", activeRoom);
  data.append("message", messageInput.value);
  if (fileInput.files[0]) data.append("file", fileInput.files[0]);
  sendBtn.disabled = true; sendText.textContent = "Sending…";
  try {
    const response = await fetch(apiUrl("/api/send"), {method:"POST", body:data});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send message");
    messageInput.value = ""; fileInput.value = ""; filePreview.textContent = "";
    selectedDay = new Date().toLocaleDateString("en-CA");
    await loadDays(); await loadMessages();
  } catch (error) { alert(error.message); }
  finally { sendBtn.disabled = false; sendText.textContent = "Send"; messageInput.focus(); }
});
document.getElementById("todayBtn").addEventListener("click", () => {
  selectedDay = new Date().toLocaleDateString("en-CA");
  exitSelectMode();
  loadDays();
  loadMessages();
});
loadDays(); loadMessages();
// Refresh the open day periodically so other users' new messages appear.
setInterval(() => {
  if (selectedDay === new Date().toLocaleDateString("en-CA") && !editingId && !selectMode && !openMenuId) {
    loadMessages();
  }
}, 3000);
