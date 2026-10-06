import { artistSeeds, trackSeeds } from "../data/jpMusic";
const TTL = 86400000, key = (n) => `kawaiii:music:v2:${n}`, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const playCountKey = (track) => `kawaiii-plays:${track.id}`;
const normalize = (v = "") => v.toLowerCase().normalize("NFKD").replace(/[\s\-_.・]/g, "");
const cache = (n) => { try { const x = JSON.parse(localStorage.getItem(key(n))); return x && Date.now() - x.time < TTL ? x.value : null; } catch { return null; } };
const save = (n, value) => (localStorage.setItem(key(n), JSON.stringify({ time: Date.now(), value })), value);
const artwork = (url) => url?.replace("100x100bb", "600x600bb") || "";
const song = (x, seed) => ({ id: String(x.trackId || x.collectionId), title: seed?.title || x.trackName, originalTitle: x.trackName, artist: seed?.artist || x.artistName, originalArtist: x.artistName, artistId: String(x.artistId || ""), duration: Math.round((x.trackTimeMillis || 0) / 1000), cover: artwork(x.artworkUrl100), previewUrl: x.previewUrl || "" });
async function call(term, entity = "song", limit = 10, retry = 0) { const r = await fetch(`/api/itunes?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`); if ((r.status === 429 || r.status === 403) && retry < 3) { await sleep(500 * (retry + 1)); return call(term, entity, limit, retry + 1); } if (!r.ok) throw new Error(`iTunes ${r.status}`); return (await r.json()).results || []; }
async function batches(items, work) { const out = []; for (let i = 0; i < items.length; i += 3) { out.push(...await Promise.all(items.slice(i, i + 3).map(work))); if (i + 3 < items.length) await sleep(220); } return out; }
const matches = (received, artist) => [artist.name, ...artist.aliases].some((alias) => normalize(received) === normalize(alias) || normalize(received).includes(normalize(alias)));
export const getTrackPlayCount = (track) => {
  const count = Number(localStorage.getItem(playCountKey(track)));
  return Number.isFinite(count) ? count : 0;
};
export const recordTrackPlay = (track) => {
  localStorage.setItem(playCountKey(track), String(getTrackPlayCount(track) + 1));
};
export const getListenOftenTracks = (tracks, limit = 5) => [...tracks]
  .sort((a, b) => getTrackPlayCount(b) - getTrackPlayCount(a))
  .slice(0, limit);
export const getPopularTracks = async () => { const old = cache("tracks"); if (old) return old; const found = await batches(trackSeeds, async (seed) => { const artist = artistSeeds.find((x) => x.name === seed.artist) || { name: seed.artist, aliases: [seed.artist] }; const results = await call(`${seed.title} ${seed.artist}`, "song", 8); const hit = results.find((x) => matches(x.artistName, artist)) || results[0]; if (!hit) { console.warn("Music seed omitted: no iTunes result", seed); return null; } if (!matches(hit.artistName, artist)) console.warn("Music seed used fallback result", { seed, receivedArtist: hit.artistName }); return song(hit, seed); }); return save("tracks", found.filter(Boolean)); };
export const getPopularArtists = async () => { const old = cache("artists"); if (old) return old; const found = await batches(artistSeeds.slice(0, 5), async (artist) => { const results = await call(artist.name, "song", 10), hit = results.find((x) => matches(x.artistName, artist)) || results[0]; if (!hit) { console.warn("Artist omitted: no iTunes result", artist.name); return null; } return { id: String(hit.artistId), name: artist.name, cover: artwork(hit.artworkUrl100) }; }); return save("artists", found.filter(Boolean)); };
export const getArtistTracks = async (artistId) => { const r = await fetch(`/api/itunes?artistId=${encodeURIComponent(artistId)}`); if (!r.ok) throw new Error("Could not load artist"); return ((await r.json()).results || []).filter((x) => x.wrapperType === "track" && x.previewUrl).map(song); };
export const search = async (q) => { if (!q.trim()) return { songs: [], artists: [] }; const [songs, artists] = await Promise.all([call(q, "song", 8), call(q, "musicArtist", 5)]); return { songs: songs.map(song), artists: artists.filter((x) => x.artistId).map((x) => ({ id: String(x.artistId), name: x.artistName, cover: "" })) }; };
