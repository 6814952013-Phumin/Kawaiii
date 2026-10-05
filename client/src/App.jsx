import { useEffect, useState } from "react";
import {
  BarChart3, Bell, CalendarDays, ChevronRight, Clock3, Disc3, Heart,
  House, ListPlus, Menu, Moon, Music2, Pencil, Play, Plus, Search,
  Settings, Sparkles, Sun, UserRound, X, Zap, SkipBack, SkipForward, Volume2, Eye, EyeOff,
  LogOut, Pause
} from "lucide-react";
import vinylRecordImage from "../image/vinyl-record.avif";
import backgroundLayer from "../image/Backgraoud1.png?inline";
import kawaiiBackLayer from "../image/kawaii1.png?inline";
import animeShadowLayer from "../image/animeBlue.png?inline";
import animeLayer from "../image/anime.png?inline";
import welcomeBackground from "../image/Welcome.png";
import CursorGrid from "./CursorGrid";
import ClickSpark from "./ClickSpark";

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
  { label: "Home", Icon: House, page: "dashboard" }, { label: "Profile", Icon: UserRound, page: "profile" },
  { label: "Music", Icon: Music2, page: "music" }, { label: "Calendar", Icon: CalendarDays, page: "calendar" },
  { label: "Setting", Icon: Settings, page: "settings" },
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
const profileOwnerId = (user) => String(user?._id || user?.id || user?.email || "").trim().toLowerCase();
const profileStorageKey = (user) => {
  const owner = profileOwnerId(user);
  return owner ? `kawaiii-profile:${encodeURIComponent(owner)}` : "kawaiii-profile:guest";
};
const readProfile = (user) => {
  const key = profileStorageKey(user);
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored) || {}; }
    catch { return {}; }
  }

  const legacy = localStorage.getItem("kawaiii-profile");
  if (!legacy) return {};
  try {
    const profile = JSON.parse(legacy) || {};
    const owner = profileOwnerId(user);
    const legacyOwner = localStorage.getItem("kawaiii-profile-owner");
    if (!owner) return profile;
    if (legacyOwner && legacyOwner !== owner) return {};
    localStorage.setItem(key, JSON.stringify(profile));
    localStorage.setItem("kawaiii-profile-owner", owner);
    localStorage.removeItem("kawaiii-profile");
    return profile;
  } catch {
    return {};
  }
};
const readApiResponse = async (response) => {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; }
  catch { throw new Error(text || `Request failed with status ${response.status}`); }
};

function AuthScreen({ mode, form, errors, loading, onChange, onSubmit, onSwitch, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [scale, setScale] = useState(() => Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
  const isLogin = mode === "login";
  useEffect(() => {
    const updateScale = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);
  const field = (name, label, type = "text", placeholder = "") => <div className={`auth-field auth-field-${name}`}>
    <label htmlFor={`auth-${name}`}>{label}</label>
    <div className={`auth-input-frame ${errors[name] ? "has-error" : ""}`}>
      <input id={`auth-${name}`} name={name} type={type === "password" && showPassword ? "text" : type} value={form[name]} onChange={onChange} placeholder={placeholder} autoComplete={name === "password" ? (isLogin ? "current-password" : "new-password") : name} aria-invalid={Boolean(errors[name])} />
      {type === "password" && <button type="button" className="password-visibility" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}</button>}
    </div>
    {errors[name] && <p className="auth-field-error" role="alert">{errors[name]}</p>}
  </div>;

  return <div className="auth-page" role="dialog" aria-modal="true" aria-label={isLogin ? "Log in" : "Create account"}>
    <div className="auth-background" style={{ backgroundImage: `url(${welcomeBackground})` }} aria-hidden="true" />
    <div className="auth-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      <form className={`auth-canvas auth-canvas-${mode}`} noValidate onSubmit={onSubmit}>
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close account page"><X size={24}/></button>
        <p className="auth-kicker">KAWAIII ACCOUNT</p>
        <h1>{isLogin ? "Welcome back" : "Create account"}</h1>
        {field("name", "USERNAME", "text", isLogin ? "email/username" : "")}
        {!isLogin && field("email", "EMAIL", "email")}
        {field("password", "PASSWORD", "password")}
        <p className="auth-page-error" role="alert">{errors.general}</p>
        <p className="auth-page-switch">{isLogin ? "New here?" : "Already have an account?"} <button type="button" onClick={onSwitch}>{isLogin ? "Create account" : "Sign in"}</button></p>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? "PLEASE WAIT..." : isLogin ? "LOG IN" : "Create account"}</button>
      </form>
    </div>
  </div>;
}

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
        <div className="album-disc"><img src={vinylRecordImage} alt="Vinyl record" className="vinyl-record-image album-record" /></div>
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

function QuickAccess({ shortcuts, editing, onToggleEditing, onEdit, onRemove, onAdd }) {
  return <article className="utility-panel quick-panel profile-quick-access">
    <div className="panel-heading"><div><p className="eyebrow">YOUR FAVOURITES</p><h2>Quick Access</h2></div><button className={`edit-button ${editing ? "selected" : ""}`} onClick={onToggleEditing}>{editing ? "Done" : "Edit"}</button></div>
    <div className="shortcut-grid">
      {shortcuts.map((shortcut, index) => <a className={`shortcut ${editing ? "shortcut-editing" : ""}`} href={shortcut.url || "#"} target="_blank" rel="noreferrer" key={shortcut._id || `${shortcut.name}-${index}`} onClick={(event) => editing && onEdit(event, shortcut, index)}>
        <span className="shortcut-icon" style={{ "--shortcut-color": shortcut.color }}>{shortcut.imageUrl ? <img src={shortcut.imageUrl} alt="" /> : shortcut.icon}</span><span>{shortcut.name}</span>{editing && <><span className="edit-shortcut" aria-hidden="true"><Pencil size={12}/></span><button className="remove-shortcut" onClick={(event) => onRemove(event, shortcut, index)} aria-label={`Remove ${shortcut.name}`}><X size={12}/></button></>}
      </a>)}
      <button className="shortcut add-shortcut" onClick={onAdd}><span className="shortcut-icon"><Plus size={24}/></span><span>Add</span></button>
    </div>
  </article>;
}

function HomeScene({ now, playing, liked, volume, onTogglePlay, onToggleLike, onVolume }) {
  const time = formatTime(now);
  return <section className="home-scene">
    <svg className="home-filter-definitions" aria-hidden="true" focusable="false">
      <defs>
        <filter id="kawaii-outline" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="2" result="eroded" />
          <feComposite in="SourceAlpha" in2="eroded" operator="out" result="outline" />
          <feFlood floodColor="#ffffff" result="outlineColor" />
          <feComposite in="outlineColor" in2="outline" operator="in" />
        </filter>
      </defs>
    </svg>
    <div className="home-art" aria-hidden="true">
      <img src={backgroundLayer} className="home-layer layer-1" alt="" />
      <CursorGrid className="home-cursor-grid" cellSize={55} color="#79b7ff" radius={240} falloff="smooth" holdTime={400} fadeDuration={800} lineWidth={1.1} maxOpacity={0.25} fillOpacity={0} gridOpacity={0} cellRadius={0} clickPulse pulseSpeed={600} />
      <img src={kawaiiBackLayer} className="home-layer layer-2" alt="" />
      <img src={animeShadowLayer} className="home-layer layer-3" alt="" />
      <img src={animeLayer} className="home-layer layer-4" alt="" />
      <img src={kawaiiBackLayer} className="home-layer layer-5" alt="" />
    </div>
    <section className="home-clock" aria-label={`Current time ${time.time} ${time.period}`}><div>{time.time}<small>{time.period}</small></div><p>{formatDate(now)}</p></section>
    <section className="mini-player" aria-label="Music player">
      <div className="mini-album" aria-label="Album art" />
      <div className="player-controls"><button className={liked ? "liked" : ""} onClick={onToggleLike} aria-label="Like track"><Heart size={15} fill={liked ? "currentColor" : "none"}/></button><button aria-label="Previous track"><SkipBack size={17} fill="currentColor"/></button><button onClick={onTogglePlay} aria-label={playing ? "Pause" : "Play"}>{playing ? <span className="pause-icon">Ⅱ</span> : <Play size={18} fill="currentColor"/>}</button><button aria-label="Next track"><SkipForward size={17} fill="currentColor"/></button><label className="volume-control" aria-label="Volume"><Volume2 size={14}/><input type="range" min="0" max="100" value={volume} onChange={(event) => onVolume(Number(event.target.value))}/></label></div>
    </section>
  </section>;
}

function ProfilePage({ user, onUserChange, onAvatarChange, onLogout }) {
  const [profile, setProfile] = useState(() => readProfile(user));
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [favoritesEditing, setFavoritesEditing] = useState(false);
  const [favoriteDraft, setFavoriteDraft] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [saved, setSaved] = useState(false);
  const name = user?.name || profile.name || "Username";
  const bio = profile.bio || "";
  const favorites = profile.favorites || [];
  const tracks = ["Music Name", "Music Name", "Music Name", "Music Name", "Music Name"];
  const saveProfile = (updates) => {
    const next = { ...profile, ...updates };
    setProfile(next); localStorage.setItem(profileStorageKey(user), JSON.stringify(next));
    if (updates.avatarImage) onAvatarChange(updates.avatarImage);
    if (updates.name && user) { const nextUser = { ...user, name: updates.name }; localStorage.setItem("kawaiii-user", JSON.stringify(nextUser)); onUserChange(nextUser); }
    setSaved(true); window.setTimeout(() => setSaved(false), 2000);
  };
  const chooseImage = (key) => (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => saveProfile({ [key]: reader.result }); reader.readAsDataURL(file);
  };
  const saveFavorite = (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const siteName = String(form.get("siteName") || "").trim(); let url = String(form.get("siteUrl") || "").trim();
    if (!siteName || !url) return; if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const list = [...favorites]; list[favoriteDraft] = { name: siteName, url }; saveProfile({ favorites: list }); setFavoriteDraft(null);
  };
  return <main className="profile-main">
      <section className="banner" style={profile.headerImage ? { backgroundImage: `url(${profile.headerImage})` } : undefined}>
        <label className="header-edit">Edit Header <Pencil size={27} fill="currentColor"/><input type="file" accept="image/*" onChange={chooseImage("headerImage")}/></label>
      </section>
      <div className="profile-grid">
      <aside className="profile-card">
        <label className={`profile-photo ${profile.avatarImage ? "has-image" : ""}`} style={profile.avatarImage ? { backgroundImage: `url(${profile.avatarImage})` } : undefined}><span>Edit Profile <Pencil size={27} fill="currentColor"/></span><input type="file" accept="image/*" onChange={chooseImage("avatarImage")}/></label>
        <div className="profile-name">{editingName ? <input autoFocus defaultValue={name} onBlur={(e) => { if (e.currentTarget.dataset.cancel !== "true") saveProfile({ name: e.target.value.trim() || name }); setEditingName(false); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { e.currentTarget.dataset.cancel = "true"; setEditingName(false); } }}/> : <><span>{name}</span><button onClick={() => setEditingName(true)} aria-label="Edit username"><Pencil size={19} fill="currentColor"/></button></>}</div>
        <p className="profile-handle">@User</p>
        <div className="profile-bio">{editingBio ? <textarea autoFocus defaultValue={bio} placeholder="Add a description" onBlur={(e) => { if (e.currentTarget.dataset.cancel !== "true") saveProfile({ bio: e.target.value }); setEditingBio(false); }} onKeyDown={(e) => { if (e.key === "Escape") { e.currentTarget.dataset.cancel = "true"; setEditingBio(false); } if (e.key === "Enter" && !e.shiftKey) e.currentTarget.blur(); }}/> : <button onClick={() => setEditingBio(true)}>{bio || "Add a description"} <Pencil size={14} fill="currentColor"/></button>}</div>
        <button className="profile-logout" onClick={onLogout}><LogOut size={23}/> Logout</button>
      </aside>
      <section className="favorites"><h2>Website Favorites</h2><article className="profile-panel favorite-panel"><button className={`favorite-edit ${favoritesEditing ? "done" : ""}`} onClick={() => { setFavoritesEditing(!favoritesEditing); setFavoriteDraft(null); }}>{favoritesEditing ? "Done" : "Edit"}</button><div className="favorite-grid">{Array.from({ length: Math.max(6, favorites.length + (favoritesEditing ? 1 : 0)) }, (_, index) => {
        const favorite = favorites[index]; if (favoriteDraft === index) return <form className="favorite-form" key={`form-${index}`} onSubmit={saveFavorite}><input name="siteName" placeholder="Name" autoFocus/><input name="siteUrl" placeholder="https://"/><button>Save</button></form>;
        return favorite ? <a className="favorite-tile" key={favorite.url + index} href={favoritesEditing ? undefined : favorite.url} target="_blank" rel="noreferrer" onClick={(e) => { if (favoritesEditing) e.preventDefault(); }}><span>{favorite.name.slice(0, 1).toUpperCase()}</span><small>{favorite.name}</small>{favoritesEditing && <button type="button" onClick={(e) => { e.preventDefault(); saveProfile({ favorites: favorites.filter((_, item) => item !== index) }); }}>×</button>}</a> : <button className="favorite-tile empty" key={`empty-${index}`} disabled={!favoritesEditing} onClick={() => setFavoriteDraft(index)}><Plus size={28}/></button>;
      })}</div></article></section>
      <section className="listen"><h2>Listen Often</h2><article className="profile-panel listen-panel"><div className="list">{tracks.map((track, index) => <div className={`listen-row ${playing === index ? "playing" : ""}`} key={index}><span className="album-placeholder">Music</span><span className="song-title">{playing === index ? <i className="equalizer"><b/><b/><b/></i> : track}</span><button onClick={() => setPlaying(playing === index ? null : index)} aria-label={`${playing === index ? "Pause" : "Play"} ${track}`}>{playing === index ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button>{playing === index && <i className="song-progress"/>}</div>)}</div></article></section>
      </div>
      {saved && <div className="profile-toast" role="status">Saved</div>}
    </main>;
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
  const [authErrors, setAuthErrors] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kawaiii-user")) || null; }
    catch { return null; }
  });
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return readProfile(user)?.avatarImage || null;
  });
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem("kawaiii-shortcuts");
    return saved ? JSON.parse(saved) : starterShortcuts;
  });
  const [playlists, setPlaylists] = useState(readPlaylists);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(() => readPlaylists()[0].id);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [playerLiked, setPlayerLiked] = useState(false);
  const [volume, setVolume] = useState(68);

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
        const data = await readApiResponse(response);
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
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Image upload failed");
      setForm((value) => ({ ...value, imageUrl: data.url }));
    } catch (error) {
      setShortcutImageError(error.message || "Image upload failed");
    } finally {
      setShortcutImageUploading(false);
    }
  };
  const openAuth = (mode = "login") => {
    setAuthMode(mode); setAuthErrors({}); setAuthForm({ name: "", email: "", password: "" }); setAuthOpen(true);
  };
  const updateAuthField = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
    setAuthErrors((current) => ({ ...current, [name]: "", general: "" }));
  };
  const switchAuthMode = () => {
    setAuthMode((current) => current === "login" ? "register" : "login");
    setAuthErrors({});
    setAuthForm({ name: "", email: "", password: "" });
  };
  const submitAuth = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!authForm.name.trim()) errors.name = "Username is required.";
    if (authMode === "register" && !/^\S+@\S+\.\S+$/.test(authForm.email.trim())) errors.email = "Enter a valid email address.";
    if (!authForm.password) errors.password = "Password is required.";
    else if (authForm.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (Object.keys(errors).length) { setAuthErrors(errors); return; }
    setAuthLoading(true); setAuthErrors({});
    try {
      const response = await fetch(`${apiBase}/auth/${authMode === "login" ? "login" : "register"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authMode === "login" ? { email: authForm.name, password: authForm.password } : authForm),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Unable to continue");
      localStorage.setItem("kawaiii-token", data.token);
      localStorage.setItem("kawaiii-user", JSON.stringify(data.user));
      setUser(data.user); setProfileAvatar(readProfile(data.user)?.avatarImage || null); setActivePage("dashboard"); setAuthOpen(false);
    } catch (error) { setAuthErrors({ general: error.message || "Cannot reach the server" }); }
    finally { setAuthLoading(false); }
  };
  const logout = () => { localStorage.removeItem("kawaiii-token"); localStorage.removeItem("kawaiii-user"); setUser(null); setProfileAvatar(null); setActivePage("dashboard"); openAuth("login"); };
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
      const data = response.status === 204 ? newShortcut : await readApiResponse(response);
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
  const latestTrack = frequentTracks[0];

  const openMusicPage = () => setActivePage("music");

  return (
    <ClickSpark sparkColor="#79b7ff" sparkSize={12} sparkRadius={15} sparkCount={6} duration={400}>
    <div className={`${dark ? "app dark" : "app"} page-${activePage} ${activePage === "dashboard" ? "home-app" : ""}`}>
      <div className="site-identity"><span className="brand-dot"><Sparkles size={25} fill="currentColor" /></span><span>Kawaiii</span></div>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`} aria-expanded={menuOpen}>
        <div className="nav-rail">
          <nav className="nav-list">
            {navItems.map((item, index) => <button className={`nav-button ${item.page === activePage ? "active" : ""}`} key={item.label} aria-label={item.label} data-tooltip={item.label} style={{ "--item-delay": `${100 + index * 55}ms` }} onClick={() => handleNavigation(item)}><item.Icon size={21}/><span>{item.label}</span></button>)}
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

      {activePage === "profile" ? <ProfilePage user={user} onUserChange={setUser} onAvatarChange={setProfileAvatar} onLogout={logout}/> : <main className="main-content">
        <header className="topbar">
          <div className="greeting"><p>{headingLabel}</p><h1>{headingTitle}</h1></div>
          <div className="top-actions"><button title="Search"><Search size={20}/></button><button className="notify" title="Notifications"><Bell size={20}/><i /></button><button className="avatar" title="Profile" onClick={() => user ? setActivePage("profile") : openAuth("login")}><span>{user ? user.name : "USER"}</span>{user && profileAvatar ? <img className="account-avatar-image" src={profileAvatar} alt="" /> : <UserRound size={24} fill="currentColor"/>}</button></div>
        </header>

        {activePage === "music" ? <MusicPage playlists={playlists} selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} onOpenCreate={openPlaylistModal} onSaveTrack={saveTrackToPlaylist} /> : activePage === "calendar" ? <CalendarPage/> : activePage === "settings" ? <SettingsPage dark={dark} onToggleDark={() => setDark((isDark) => !isDark)}/> : <HomeScene now={now} playing={playerPlaying} liked={playerLiked} volume={volume} onTogglePlay={() => setPlayerPlaying((value) => !value)} onToggleLike={() => setPlayerLiked((value) => !value)} onVolume={setVolume}/>}
        <footer><span><span className="footer-dot"/> All systems calm</span><span>Made for your day</span></footer>
      </main>}

      {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><form className="shortcut-modal shortcut-editor-modal" onSubmit={saveShortcut} onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setModalOpen(false)}><X size={18}/></button><p className="eyebrow">{editingShortcut ? "EDIT SHORTCUT" : "NEW SHORTCUT"}</p><h2>{editingShortcut ? "Update favourite" : "Add a favourite"}</h2><label>Name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Figma" /></label><label>Link<input required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://" /></label><label>Accent colour<input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label><label>Icon image URL <small>Optional — use a direct image link</small><input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://example.com/icon.png" /></label><label className="image-upload-label">Upload icon image <small>{shortcutImageUploading ? "Uploading to Vercel Blob..." : "PNG, JPG, WEBP, or GIF · max 600 KB"}</small><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selectShortcutImage} disabled={shortcutImageUploading} /></label>{shortcutImageError && <p className="shortcut-image-error">{shortcutImageError}</p>}{form.imageUrl && <div className="shortcut-image-preview"><img src={form.imageUrl} alt="Icon preview" /><button type="button" onClick={() => setForm({ ...form, imageUrl: "" })}>Remove image</button></div>}<button className="save-button" type="submit" disabled={shortcutImageUploading}>{editingShortcut ? "Save changes" : "Add shortcut"} <Plus size={17}/></button></form></div>}
      {playlistModalOpen && <div className="modal-backdrop" onMouseDown={() => setPlaylistModalOpen(false)}><form className="shortcut-modal music-modal" onSubmit={createPlaylist} onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setPlaylistModalOpen(false)}><X size={18}/></button><span className="modal-music-icon"><ListPlus size={22}/></span><p className="eyebrow">NEW PLAYLIST</p><h2>Make it yours</h2><p className="music-modal-copy">Give your collection a name, then save songs from your frequently played chart.</p><label>Playlist name<input required autoFocus value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="e.g. Sunday soundtrack" /></label><button className="save-button" type="submit">Create playlist <Plus size={17}/></button></form></div>}
      {authOpen && (authMode === "profile" && user ? <div className="modal-backdrop" onMouseDown={() => setAuthOpen(false)}><section className="shortcut-modal account-panel" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setAuthOpen(false)}><X size={18}/></button><span className="account-avatar">{user.name.slice(0, 2).toUpperCase()}</span><p className="eyebrow">SIGNED IN</p><h2>{user.name}</h2><p className="account-email">{user.email}</p><button className="logout-button" onClick={() => { logout(); setAuthOpen(false); }}>Sign out</button></section></div> : <AuthScreen mode={authMode} form={authForm} errors={authErrors} loading={authLoading} onChange={updateAuthField} onSubmit={submitAuth} onSwitch={switchAuthMode} onClose={() => setAuthOpen(false)} />)}
    </div>
    </ClickSpark>
  );
}

export default App;
