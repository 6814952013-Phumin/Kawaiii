import { createContext, useContext, useEffect, useRef, useState } from "react";
const PlayerContext = createContext(null);
export function PlayerProvider({ children }) {
  const audio = useRef(null); const [currentTrack, setCurrentTrack] = useState(null); const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0); const [volume, setVolume] = useState(.7); const [shuffle, setShuffle] = useState(false); const [repeat, setRepeat] = useState("off");
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  useEffect(() => { if (!currentTrack?.previewUrl) return; playing ? audio.current?.play().catch(() => setPlaying(false)) : audio.current?.pause(); }, [playing, currentTrack]);
  const playTrack = (track, list = [track]) => { setQueue(list); setCurrentTrack(track); setProgress(0); setPlaying(Boolean(track.previewUrl)); };
  const next = () => { if (!queue.length) return; const index = queue.findIndex((x) => x.id === currentTrack?.id); const nextIndex = shuffle ? Math.floor(Math.random() * queue.length) : index + 1; const track = queue[nextIndex] || (repeat === "all" ? queue[0] : null); if (track) playTrack(track, queue); else setPlaying(false); };
  const previous = () => { const index = Math.max(0, queue.findIndex((x) => x.id === currentTrack?.id) - 1); if (queue[index]) playTrack(queue[index], queue); };
  return <PlayerContext.Provider value={{ currentTrack, queue, playing, progress, volume, shuffle, repeat, setPlaying, setProgress, setVolume, setShuffle, setRepeat, playTrack, next, previous }}><audio ref={audio} src={currentTrack?.previewUrl} onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)} onEnded={next}/>{children}</PlayerContext.Provider>;
}
export const usePlayer = () => useContext(PlayerContext);
