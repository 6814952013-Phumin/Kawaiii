import { useEffect, useState } from "react";
import {
  BarChart3, Bell, CalendarDays, ChevronRight, Clock3, Disc3, Heart,
  House, ListPlus, Menu, Moon, Music2, Pencil, Play, Plus, Search,
  Settings, Sparkles, Sun, UserRound, X, Zap
} from "lucide-react";

const starterShortcuts = [
  { name: "Workspace", url: "https://workspace.google.com", color: "#00c6e6", icon: "W" },
  { name: "Notion", url: "https://www.notion.so", color: "#ffffff", icon: "N" },
  { name: "GitHub", url: "https://github.com", color: "#bfc0d1", icon: "G" },
  { name: "Spotify", url: "https://spotify.com", color: "#3ddc84", icon: "S" },
  { name: "Figma", url: "https://figma.com", color: "#f36c8a", icon: "F" },
  { name: "Drive", url: "https://drive.google.com", color: "#f8c65d", icon: "D" },
  { name: "Linear", url: "https://linear.app", color: "#8f9bff", icon: "L" },
  { name: "Mail", url: "mailto:", color: "#ea7f6d", icon: "M" },
];

const navItems = [
  { label: "Home", Icon: House, page: "dashboard" }, { label: "Music", Icon: Music2, page: "music" },
  { label: "Profile", Icon: UserRound, page: "profile" },
  { label: "Calendar", Icon: CalendarDays, page: "calendar" }, { label: "Settings", Icon: Settings, page: "settings" },
];

const frequentTracks = [
  { id: "paper-rings", title: "Paper Rings", artist: "Luna Hart", plays: 92, duration: "3:34", cover: "linear-gradient(135deg, #f8a8bd 0%, #8758d6 100%)" },
  { id: "slow-motion", title: "Slow Motion", artist: "Yuna", plays: 78, duration: "4:12", cover: "linear-gradient(135deg, #f9c779 0%, #ec6f91 100%)" },
  { id: "neon-sky", title: "Neon Sky", artist: "The Midnight Club", plays: 66, duration: "3:48", cover: "linear-gradient(135deg, #43d7e8 0%, #3157a8 100%)" },
  { id: "golden-hour", title: "Golden Hour", artist: "Mira Vale", plays: 54, duration: "3:22", cover: "linear-gradient(135deg, #fad981 0%, #e98368 100%)" },
  { id: "afterglow", title: "Afterglow", artist: "Kai Bloom", plays: 41, duration: "4:06", cover: "linear-gradient(135deg, #7b8dfa 0%, #d679ce 100%)" },
];

const starterPlaylists = [
  { id: "late-night", name: "Late night drives", color: "#8d7bf6", tracks: ["slow-motion", "neon-sky"] },
  { id: "soft-mornings", name: "Soft mornings", color: "#f3ae70", tracks: ["paper-rings", "golden-hour"] },
  { id: "favourites", name: "All-time favourites", color: "#36c3dd", tracks: ["paper-rings", "afterglow"] },
];

const readPlaylists = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("kawaiii-music-playlists"));
    return Array.isArray(saved) && saved.length ? saved : starterPlaylists;
  } catch { return starterPlaylists; }
};

const formatTime = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true
  }).formatToParts(date);

  return {
    time: parts.filter(({ type }) => type !== "dayPeriod").map(({ value }) => value).join("").trim(),
    period: parts.find(({ type }) => type === "dayPeriod")?.value || ""
  };
};
const formatDate = (date) => new Intl.DateTimeFormat("en-US", {
  weekday: "long", day: "numeric", month: "long"
}).format(date);
const apiBase = import.meta.env.VITE_API_URL || "/api";

function MusicPage({ playlists, selectedPlaylistId, onSelectPlaylist, onOpenCreate, onSaveTrack }) {
  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) || playlists[0];
  const playlistTracks = selectedPlaylist ? selectedPlaylist.tracks.map((id) => frequentTracks.find((track) => track.id === id)).filter(Boolean) : [];

  return <section className="music-page">
    <section className="music-hero">
      <div className="music-hero-copy">
        <span className="music-kicker"><Disc3 size={15}/> YOUR LISTENING SPACE</span>
        <h2>Music for every<br/><em>little moment.</em></h2>
        <p>Keep your most-played songs close and build a collection that sounds like you.</p>
        <button className="music-play-button" type="button"><Play size={17} fill="currentColor"/> Resume listening</button>
      </div>
      <div className="now-playing-card">
        <div className="album-disc"><span className="album-cover album-cover-current"><Music2 size={29}/></span></div>
        <div><span className="playing-label">NOW PLAYING</span><strong>Paper Rings</strong><small>Luna Hart</small></div>
        <span className="sound-waves" aria-hidden="true"><i/><i/><i/><i/></span>
      </div>
    </section>

    <section className="music-content-grid">
      <article className="music-panel listening-chart">
        <div className="music-panel-heading"><div><p className="eyebrow">YOUR CHART</p><h3>Frequently played</h3></div><span className="chart-badge"><BarChart3 size={15}/> This month</span></div>
        <div className="track-list">
          {frequentTracks.map((track, index) => {
            const saved = selectedPlaylist?.tracks.includes(track.id);
            return <div className="track-row" key={track.id}>
              <span className="track-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="track-cover" style={{ "--cover": track.cover }}><Music2 size={17}/></span>
              <div className="track-meta"><strong>{track.title}</strong><small>{track.artist}</small></div>
              <div className="play-meter" aria-label={`${track.plays} plays`}><span style={{ "--play-width": `${track.plays}%` }}/></div>
              <span className="play-count">{track.plays}</span>
              <span className="track-duration">{track.duration}</span>
              <button className={`save-track ${saved ? "saved" : ""}`} type="button" aria-label={`Save ${track.title} to ${selectedPlaylist?.name || "playlist"}`} title={saved ? "Saved to playlist" : "Save to playlist"} onClick={() => onSaveTrack(track.id)}><Heart size={17} fill={saved ? "currentColor" : "none"}/></button>
            </div>;
          })}
        </div>
      </article>

      <article className="music-panel playlist-panel">
        <div className="music-panel-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h3>Playlists</h3></div><button className="create-playlist-button" type="button" onClick={onOpenCreate}><ListPlus size={16}/> Create</button></div>
        <div className="playlist-grid">
          {playlists.map((playlist) => <button className={`playlist-card ${selectedPlaylist?.id === playlist.id ? "selected" : ""}`} type="button" key={playlist.id} onClick={() => onSelectPlaylist(playlist.id)}>
            <span className="playlist-art" style={{ "--playlist-color": playlist.color }}><Disc3 size={25}/></span>
            <strong>{playlist.name}</strong><small>{playlist.tracks.length} songs</small>
          </button>)}
          <button className="playlist-card playlist-add-card" type="button" onClick={onOpenCreate}><span className="playlist-art"><Plus size={22}/></span><strong>New playlist</strong><small>Save your favourites</small></button>
        </div>
      </article>
    </section>

    <section className="selected-playlist-section">
      <div className="selected-playlist-title"><span className="selected-playlist-icon" style={{ "--playlist-color": selectedPlaylist?.color }}><Disc3 size={22}/></span><div><p className="eyebrow">SELECTED PLAYLIST</p><h3>{selectedPlaylist?.name}</h3></div></div>
      <div className="saved-song-list">
        {playlistTracks.length ? playlistTracks.map((track, index) => <div className="saved-song" key={track.id}><span>{String(index + 1).padStart(2, "0")}</span><span className="track-cover mini" style={{ "--cover": track.cover }}><Music2 size={14}/></span><strong>{track.title}</strong><small>{track.artist}</small><span>{track.duration}</span><button type="button" aria-label={`Play ${track.title}`}><Play size={16} fill="currentColor"/></button></div>) : <p className="empty-playlist">ยังไม่มีเพลงในเพลย์ลิสต์นี้ — กดรูปหัวใจจากชาร์ตเพื่อบันทึกเพลง</p>}
      </div>
    </section>
  </section>;
}

function CalendarPage() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dates = Array.from({ length: 30 }, (_, index) => index + 1);
  const schedule = [
    { time: "10:30", title: "Design review", group: "Product team", color: "cyan" },
    { time: "13:00", title: "Deep work", group: "Project Kawaiii", color: "yellow" },
    { time: "16:30", title: "Weekly reset", group: "Personal", color: "pink" },
  ];
  return <section className="utility-page">
    <section className="utility-hero calendar-hero"><span className="utility-icon"><CalendarDays size={25}/></span><div><p className="eyebrow">SEPTEMBER 2026</p><h2>Plan a little space<br/>for what matters.</h2><p>Keep your day light, clear, and in one place.</p></div></section>
    <section className="utility-grid calendar-layout">
      <article className="utility-panel calendar-card"><div className="utility-heading"><h3>September</h3><span>2026</span></div><div className="calendar-weekdays">{days.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-days">{dates.map((date) => <button className={date === 17 ? "today" : ""} type="button" key={date}>{date}</button>)}</div></article>
      <article className="utility-panel schedule-card"><div className="utility-heading"><div><p className="eyebrow">THURSDAY, SEPTEMBER 17</p><h3>Today&apos;s plan</h3></div><button type="button" className="small-action"><Plus size={15}/> Add</button></div><div className="schedule-list">{schedule.map((item) => <div className="schedule-entry" key={item.time}><span>{item.time}</span><i className={item.color}/><div><strong>{item.title}</strong><small>{item.group}</small></div></div>)}</div></article>
    </section>
  </section>;
}

function ProfilePage({ user, onSignIn }) {
  return <section className="utility-page">
    <section className="utility-hero profile-hero"><span className="utility-icon"><UserRound size={25}/></span><div><p className="eyebrow">YOUR SPACE</p><h2>{user ? `Hi, ${user.name}.` : "A space made for you."}</h2><p>{user ? "Your shortcuts, playlists, and daily rhythm all belong here." : "Sign in to make your dashboard and music library truly yours."}</p>{!user && <button type="button" className="utility-primary" onClick={onSignIn}>Sign in to continue</button>}</div></section>
    <section className="utility-grid profile-grid">
      <article className="utility-panel account-summary"><span className="profile-avatar-large">{user ? user.name.slice(0, 2).toUpperCase() : "KM"}</span><div><p className="eyebrow">{user ? "SIGNED IN" : "GUEST MODE"}</p><h3>{user?.name || "Kawaiii member"}</h3><p>{user?.email || "Your personal dashboard is ready when you are."}</p></div></article>
      <article className="utility-panel profile-stats"><div><strong>8</strong><span>Shortcuts</span></div><div><strong>3</strong><span>Playlists</span></div><div><strong>12h</strong><span>Focus time</span></div></article>
    </section>
  </section>;
}

function SettingsPage({ dark, onToggleDark }) {
  return <section className="utility-page">
    <section className="utility-hero settings-hero"><span className="utility-icon"><Settings size={25}/></span><div><p className="eyebrow">PREFERENCES</p><h2>Set up your day<br/>your way.</h2><p>Small choices that make Kawaiii feel more like your own.</p></div></section>
    <section className="utility-panel settings-list">
      <div className="settings-row"><div><strong>Appearance</strong><small>Choose the colour mode that feels most comfortable.</small></div><button className={`settings-toggle ${dark ? "on" : ""}`} type="button" onClick={onToggleDark} aria-pressed={dark}><span/>{dark ? "Dark" : "Light"}</button></div>
      <div className="settings-row"><div><strong>Daily focus reminder</strong><small>A gentle nudge to return to your most important task.</small></div><button className="settings-toggle on" type="button" aria-pressed="true"><span/>On</button></div>
      <div className="settings-row"><div><strong>Music recommendations</strong><small>Use your saved tracks to make the Music page more personal.</small></div><button className="settings-toggle on" type="button" aria-pressed="true"><span/>On</button></div>
    </section>
  </section>;
}

function App() {
  const [now, setNow] = useState(new Date());
  const time = formatTime(now);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [form, setForm] = useState({ name: "", url: "", color: "#00c6e6", imageUrl: "" });
  const [shortcutImageError, setShortcutImageError] = useState("");
  const [shortcutImageUploading, setShortcutImageUploading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kawaiii-user")) || null; }
    catch { return null; }
  });
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem("kawaiii-shortcuts");
    return saved ? JSON.parse(saved) : starterShortcuts;
  });
  const [playlists, setPlaylists] = useState(readPlaylists);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(() => readPlaylists()[0].id);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => localStorage.setItem("kawaiii-shortcuts", JSON.stringify(shortcuts)), [shortcuts]);
  useEffect(() => localStorage.setItem("kawaiii-music-playlists", JSON.stringify(playlists)), [playlists]);
  useEffect(() => {
    const loadShortcuts = async () => {
      try {
        const response = await fetch(`${apiBase}/shortcuts`);
        const data = await response.json();
        if (response.ok && data.length) setShortcuts(data);
      } catch {
        // Keep the local collection available when the API is offline.
      }
    };
    loadShortcuts();
  }, []);

  const openAdd = () => { setForm({ name: "", url: "", color: "#00c6e6", imageUrl: "" }); setEditingShortcut(null); setShortcutImageError(""); setModalOpen(true); };
  const openEditShortcut = (event, shortcut, index) => {
    event.preventDefault();
    setForm({ name: shortcut.name || "", url: shortcut.url || "", color: shortcut.color || "#00c6e6", imageUrl: shortcut.imageUrl || "" });
    setEditingShortcut({ id: shortcut._id, index });
    setShortcutImageError("");
    setModalOpen(true);
  };
  const selectShortcutImage = async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp|gif)$/)) { setShortcutImageError("Please choose a PNG, JPG, WEBP, or GIF image."); return; }
    if (file.size > 600 * 1024) { setShortcutImageError("Please use an image smaller than 600 KB."); return; }
    setShortcutImageUploading(true);
    setShortcutImageError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`${apiBase}/uploads/image`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Image upload failed");
      setForm((value) => ({ ...value, imageUrl: data.url }));
    } catch (error) {
      setShortcutImageError(error.message || "Image upload failed");
    } finally {
      setShortcutImageUploading(false);
    }
  };
  const openAuth = (mode = "login") => {
    setAuthMode(mode); setAuthError(""); setAuthForm({ name: "", email: "", password: "" }); setAuthOpen(true);
  };
  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthLoading(true); setAuthError("");
    try {
      const response = await fetch(`${apiBase}/auth/${authMode === "login" ? "login" : "register"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue");
      localStorage.setItem("kawaiii-token", data.token);
      localStorage.setItem("kawaiii-user", JSON.stringify(data.user));
      setUser(data.user); setAuthOpen(false);
    } catch (error) { setAuthError(error.message || "Cannot reach the server"); }
    finally { setAuthLoading(false); }
  };
  const logout = () => { localStorage.removeItem("kawaiii-token"); localStorage.removeItem("kawaiii-user"); setUser(null); };
  const saveShortcut = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const newShortcut = { ...form, icon: form.name[0].toUpperCase() };
    let savedShortcut = newShortcut;
    try {
      const response = await fetch(editingShortcut?.id ? `${apiBase}/shortcuts/${editingShortcut.id}` : `${apiBase}/shortcuts`, {
        method: editingShortcut?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShortcut),
      });
      const data = response.status === 204 ? newShortcut : await response.json();
      if (!response.ok) throw new Error(data.message);
      savedShortcut = data;
    } catch {
      // The local collection remains editable while the API is unavailable.
    }
    setShortcuts((items) => editingShortcut ? items.map((item, index) => index === editingShortcut.index ? { ...item, ...savedShortcut } : item) : [...items, savedShortcut]);
    setEditingShortcut(null);
    setModalOpen(false);
  };
  const removeShortcut = async (event, shortcut, index) => {
    event.preventDefault();
    event.stopPropagation();
    setShortcuts((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (!shortcut._id) return;
    try { await fetch(`${apiBase}/shortcuts/${shortcut._id}`, { method: "DELETE" }); }
    catch { /* Local state remains usable if the server is unavailable. */ }
  };
  const openPlaylistModal = () => { setPlaylistName(""); setPlaylistModalOpen(true); };
  const createPlaylist = (event) => {
    event.preventDefault();
    const name = playlistName.trim();
    if (!name) return;
    const colors = ["#db7b9a", "#6bb8de", "#a98cdd", "#e9ad68"];
    const playlist = { id: `playlist-${Date.now()}`, name, color: colors[playlists.length % colors.length], tracks: [] };
    setPlaylists((items) => [...items, playlist]);
    setSelectedPlaylistId(playlist.id);
    setPlaylistModalOpen(false);
  };
  const saveTrackToPlaylist = (trackId) => {
    setPlaylists((items) => items.map((playlist) => playlist.id !== selectedPlaylistId || playlist.tracks.includes(trackId) ? playlist : { ...playlist, tracks: [...playlist.tracks, trackId] }));
  };
  const handleNavigation = (item) => {
    setActivePage(item.page);
    setMenuOpen(false);
  };
  const pageHeadings = {
    dashboard: ["Good evening,", "Make today count."],
    music: ["YOUR PERSONAL LIBRARY", "Find your next favourite."],
    profile: ["YOUR PROFILE", "Make this space yours."],
    calendar: ["YOUR CALENDAR", "Keep your day in view."],
    settings: ["YOUR PREFERENCES", "Fine-tune your space."],
  };
  const [headingLabel, headingTitle] = pageHeadings[activePage];

  return (
    <div className={dark ? "app dark" : "app"}>
      <div className="site-identity"><span className="brand-dot"><Sparkles size={25} fill="currentColor" /></span><span>Kawaiii</span></div>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`} aria-expanded={menuOpen}>
        <div className="nav-rail">
          <nav className="nav-list">
            {navItems.map((item, index) => <button className={`nav-button ${item.page === activePage ? "active" : ""}`} key={item.label} aria-label={item.label} data-tooltip={item.label} style={{ "--item-delay": `${100 + index * 55}ms` }} onClick={() => handleNavigation(item)}><item.Icon size={21}/></button>)}
            <button className="theme-switch" onClick={() => setDark(!dark)} aria-label="Toggle dark mode" data-tooltip="Toggle theme" style={{ "--item-delay": `${100 + navItems.length * 55}ms` }}><span className="theme-icon">{dark ? <Moon size={20}/> : <Sun size={20}/>}</span></button>
          </nav>
          <div className="sidebar-bottom">
            <button className="menu-button" onClick={() => setMenuOpen((isOpen) => !isOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              <Menu className="menu-glyph menu-glyph-menu" size={25}/>
              <X className="menu-glyph menu-glyph-close" size={23}/>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="greeting"><p>{headingLabel}</p><h1>{headingTitle}</h1></div>
          <div className="top-actions"><button title="Search"><Search size={20}/></button><button className="notify" title="Notifications"><Bell size={20}/><i /></button><button className="avatar" title="Profile" onClick={() => openAuth(user ? "profile" : "login")}>{user ? user.name.slice(0, 2).toUpperCase() : "KM"}</button></div>
        </header>

        {activePage === "music" ? <MusicPage playlists={playlists} selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} onOpenCreate={openPlaylistModal} onSaveTrack={saveTrackToPlaylist} /> : activePage === "calendar" ? <CalendarPage/> : activePage === "profile" ? <ProfilePage user={user} onSignIn={() => openAuth("login")}/> : activePage === "settings" ? <SettingsPage dark={dark} onToggleDark={() => setDark((isDark) => !isDark)}/> : <>
        <section className="clock-section">
          <div className="clock"><span>{time.time}</span><span className="clock-period">{time.period}</span></div>
          <p className="date">{formatDate(now)}</p>
        </section>

        <section className="dashboard-grid">
          <article className="panel focus-panel">
            <div className="panel-heading"><div><p className="eyebrow">TODAY'S FOCUS</p><h2>Keep it simple.</h2></div><button className="icon-control" title="Focus settings"><Settings size={17}/></button></div>
            <div className="focus-orbit"><span className="orbit-core"><Zap size={22} fill="currentColor" /></span></div>
            <p className="focus-copy">Pick one meaningful thing and give it your full attention.</p>
            <button className="outline-button"><Clock3 size={16}/> Start focus</button>
          </article>

          <article className="panel quick-panel">
            <div className="panel-heading"><div><p className="eyebrow">YOUR FAVOURITES</p><h2>Quick Access</h2></div><button className={`edit-button ${editing ? "selected" : ""}`} onClick={() => setEditing(!editing)}>{editing ? "Done" : "Edit"}</button></div>
            <div className="shortcut-grid">
              {shortcuts.map((shortcut, index) => <a className={`shortcut ${editing ? "shortcut-editing" : ""}`} href={shortcut.url || "#"} target="_blank" rel="noreferrer" key={shortcut._id || `${shortcut.name}-${index}`} onClick={(event) => editing && openEditShortcut(event, shortcut, index)}>
                <span className="shortcut-icon" style={{ "--shortcut-color": shortcut.color }}>{shortcut.imageUrl ? <img src={shortcut.imageUrl} alt="" /> : shortcut.icon}</span><span>{shortcut.name}</span>{editing && <><span className="edit-shortcut" aria-hidden="true"><Pencil size={12}/></span><button className="remove-shortcut" onClick={(event) => removeShortcut(event, shortcut, index)} aria-label={`Remove ${shortcut.name}`}><X size={12}/></button></>}
              </a>)}
              <button className="shortcut add-shortcut" onClick={openAdd}><span className="shortcut-icon"><Plus size={24}/></span><span>Add</span></button>
            </div>
          </article>

          <article className="panel agenda-panel">
            <div className="panel-heading"><div><p className="eyebrow">UP NEXT</p><h2>Today's agenda</h2></div><button className="icon-control" title="Open calendar"><CalendarDays size={17}/></button></div>
            <div className="agenda-list">
              <div className="agenda-item"><span className="agenda-time">10:30</span><span className="agenda-line cyan"/><div><strong>Design review</strong><small>Product team</small></div></div>
              <div className="agenda-item"><span className="agenda-time">13:00</span><span className="agenda-line yellow"/><div><strong>Deep work</strong><small>Project Kawaiii</small></div></div>
              <div className="agenda-item"><span className="agenda-time">16:30</span><span className="agenda-line pink"/><div><strong>Weekly reset</strong><small>Personal</small></div></div>
            </div>
            <button className="text-button">View calendar <ChevronRight size={16}/></button>
          </article>
        </section>
        </>}
        <footer><span><span className="footer-dot"/> All systems calm</span><span>Made for your day</span></footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><form className="shortcut-modal shortcut-editor-modal" onSubmit={saveShortcut} onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setModalOpen(false)}><X size={18}/></button><p className="eyebrow">{editingShortcut ? "EDIT SHORTCUT" : "NEW SHORTCUT"}</p><h2>{editingShortcut ? "Update favourite" : "Add a favourite"}</h2><label>Name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Figma" /></label><label>Link<input required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://" /></label><label>Accent colour<input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label><label>Icon image URL <small>Optional — use a direct image link</small><input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://example.com/icon.png" /></label><label className="image-upload-label">Upload icon image <small>{shortcutImageUploading ? "Uploading to Vercel Blob..." : "PNG, JPG, WEBP, or GIF · max 600 KB"}</small><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selectShortcutImage} disabled={shortcutImageUploading} /></label>{shortcutImageError && <p className="shortcut-image-error">{shortcutImageError}</p>}{form.imageUrl && <div className="shortcut-image-preview"><img src={form.imageUrl} alt="Icon preview" /><button type="button" onClick={() => setForm({ ...form, imageUrl: "" })}>Remove image</button></div>}<button className="save-button" type="submit" disabled={shortcutImageUploading}>{editingShortcut ? "Save changes" : "Add shortcut"} <Plus size={17}/></button></form></div>}
      {playlistModalOpen && <div className="modal-backdrop" onMouseDown={() => setPlaylistModalOpen(false)}><form className="shortcut-modal music-modal" onSubmit={createPlaylist} onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setPlaylistModalOpen(false)}><X size={18}/></button><span className="modal-music-icon"><ListPlus size={22}/></span><p className="eyebrow">NEW PLAYLIST</p><h2>Make it yours</h2><p className="music-modal-copy">Give your collection a name, then save songs from your frequently played chart.</p><label>Playlist name<input required autoFocus value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="e.g. Sunday soundtrack" /></label><button className="save-button" type="submit">Create playlist <Plus size={17}/></button></form></div>}
      {authOpen && <div className="modal-backdrop" onMouseDown={() => setAuthOpen(false)}>
        {authMode === "profile" && user ? <section className="shortcut-modal account-panel" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setAuthOpen(false)}><X size={18}/></button><span className="account-avatar">{user.name.slice(0, 2).toUpperCase()}</span><p className="eyebrow">SIGNED IN</p><h2>{user.name}</h2><p className="account-email">{user.email}</p><button className="logout-button" onClick={() => { logout(); setAuthOpen(false); }}>Sign out</button></section> :
        <form className="shortcut-modal auth-modal" onSubmit={submitAuth} onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setAuthOpen(false)}><X size={18}/></button><p className="eyebrow">KAWAIII ACCOUNT</p><h2>{authMode === "login" ? "Welcome back" : "Create account"}</h2>{authMode === "register" && <label>Name<input required autoFocus value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your name" /></label>}<label>Email<input required autoFocus={authMode === "login"} type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label><label>Password<input required minLength="8" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="At least 8 characters" /></label>{authError && <p className="auth-error">{authError}</p>}<button className="save-button" type="submit" disabled={authLoading}>{authLoading ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}</button><p className="auth-switch">{authMode === "login" ? "New here?" : "Already have an account?"} <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? "Create account" : "Sign in"}</button></p></form>}
      </div>}
    </div>
  );
}

export default App;
