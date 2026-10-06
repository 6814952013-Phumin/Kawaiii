import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getFavoriteFaviconUrl, getFavoriteIcon } from "./siteIcons";

const MAX_FAVORITES = 12;

function FavoriteArtwork({ favorite }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const preset = getFavoriteIcon(favorite.url);

  useEffect(() => {
    setFaviconFailed(false);
    setIconFailed(false);
  }, [favorite.url]);

  if (preset) {
    if (preset.Icon) {
      const { Icon } = preset;
      return <Icon className="favorite-brand-icon" style={{ color: preset.color }} aria-hidden="true" />;
    }
    if (!iconFailed) {
      return <img className="favorite-brand-icon" src={preset.imageUrl} alt="" onError={() => setIconFailed(true)} />;
    }
  }

  if (faviconFailed) {
    return <span className="favorite-fallback">{favorite.name.slice(0, 1).toUpperCase() || "?"}</span>;
  }

  return <span className={`favorite-favicon ${preset?.imageUrl ? "favorite-favicon-brand-fallback" : ""}`}><img src={getFavoriteFaviconUrl(favorite.url)} alt="" onError={() => setFaviconFailed(true)} /></span>;
}

function favoriteNameFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    return hostname.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "";
  }
}

export default function FavoriteSites({ favorites, onSave }) {
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftIndex, setDraftIndex] = useState(null);
  const [formValues, setFormValues] = useState({ name: "", url: "" });
  const [errors, setErrors] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);

  const openForm = (index = null) => {
    const favorite = index === null ? null : favorites[index];
    setModalOpen(true);
    setDraftIndex(index);
    setFormValues(favorite ? { name: favorite.name, url: favorite.url } : { name: "", url: "" });
    setErrors({});
  };

  const closeForm = () => {
    setModalOpen(false);
    setDraftIndex(null);
    setErrors({});
  };

  const saveFavorite = (event) => {
    event.preventDefault();
    let url = formValues.url.trim();
    const nextErrors = {};

    if (!url) {
      nextErrors.url = "Enter a website URL.";
    } else {
      const explicitScheme = url.match(/^([a-z][a-z\d+.-]*):\/\//i);
      const hasHttpScheme = /^https?:\/\//i.test(url);
      const unsupportedBareScheme = /^(javascript|data|file|mailto|ftp|blob|about):/i.test(url);
      if ((explicitScheme && !hasHttpScheme) || unsupportedBareScheme) {
        nextErrors.url = "Only http and https URLs are allowed.";
      } else {
        if (!hasHttpScheme) url = `https://${url}`;
        try {
          const parsed = new URL(url);
          if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
            nextErrors.url = "Only http and https URLs are allowed.";
          }
        } catch {
          nextErrors.url = "Enter a valid website URL.";
        }
      }
    }

    const name = formValues.name.trim() || favoriteNameFromUrl(url);
    if (!name) nextErrors.name = "Enter a name or a valid URL to use as the name.";
    if (draftIndex === null && favorites.length >= MAX_FAVORITES) {
      nextErrors.limit = "You can save up to 12 websites.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const nextFavorites = [...favorites];
    const favorite = { name, url };
    if (draftIndex === null) nextFavorites.push(favorite);
    else nextFavorites[draftIndex] = favorite;
    onSave(nextFavorites);
    closeForm();
  };

  const reorderFavorites = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const nextFavorites = [...favorites];
    const [favorite] = nextFavorites.splice(draggedIndex, 1);
    nextFavorites.splice(targetIndex, 0, favorite);
    onSave(nextFavorites);
    setDraggedIndex(null);
  };

  const removeFavorite = (index) => {
    onSave(favorites.filter((_, itemIndex) => itemIndex !== index));
  };

  return <section className="favorites">
    <h2>Website Favorites</h2>
    <article className="profile-panel favorite-panel">
      <button className={`favorite-edit ${editing ? "done" : ""}`} type="button" onClick={() => { setEditing((value) => !value); closeForm(); }}>
        {editing ? "Done" : "Edit"}
      </button>
      <div className="favorite-grid">
        {favorites.map((favorite, index) => {
          const Tile = editing ? "button" : "a";
          return <div
            className={`favorite-card ${editing ? "is-editing" : ""} ${draggedIndex === index ? "is-dragged" : ""}`}
            key={`${favorite.url}-${index}`}
            draggable={editing}
            onDragStart={(event) => {
              setDraggedIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
            }}
            onDragOver={(event) => { if (editing) event.preventDefault(); }}
            onDrop={(event) => { event.preventDefault(); reorderFavorites(index); }}
            onDragEnd={() => setDraggedIndex(null)}
          >
            <Tile
              className="favorite-tile"
              type={editing ? "button" : undefined}
              href={editing ? undefined : favorite.url}
              target={editing ? undefined : "_blank"}
              rel={editing ? undefined : "noopener noreferrer"}
              onClick={editing ? () => openForm(index) : undefined}
              aria-label={editing ? `Edit ${favorite.name}` : `Open ${favorite.name} in a new tab`}
            >
              <span className="favorite-art"><FavoriteArtwork favorite={favorite} /></span>
              <span className="favorite-name">{favorite.name}</span>
            </Tile>
            {editing && <button className="favorite-remove" type="button" onClick={() => removeFavorite(index)} aria-label={`Remove ${favorite.name}`}>×</button>}
          </div>;
        })}
        {favorites.length < MAX_FAVORITES && <div className="favorite-card">
          <button className="favorite-tile empty" type="button" onClick={() => openForm()}>
            <span className="favorite-art"><Plus aria-hidden="true" /></span>
            <span className="favorite-name">Add</span>
          </button>
        </div>}
      </div>
    </article>
    {modalOpen && <div className="favorite-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
      <form className="favorite-modal" role="dialog" aria-modal="true" aria-labelledby="favorite-modal-title" onSubmit={saveFavorite} onKeyDown={(event) => { if (event.key === "Escape") closeForm(); }}>
        <h3 id="favorite-modal-title">{draftIndex === null ? "Add website" : "Edit website"}</h3>
        <label htmlFor="favorite-name">Name</label>
        <input id="favorite-name" name="name" autoFocus value={formValues.name} onChange={(event) => setFormValues((value) => ({ ...value, name: event.target.value }))} placeholder="e.g. YouTube" aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="favorite-error" role="alert">{errors.name}</p>}
        <label htmlFor="favorite-url">URL</label>
        <input id="favorite-url" name="url" value={formValues.url} onChange={(event) => setFormValues((value) => ({ ...value, url: event.target.value }))} placeholder="https://example.com" aria-invalid={Boolean(errors.url)} />
        {errors.url && <p className="favorite-error" role="alert">{errors.url}</p>}
        {errors.limit && <p className="favorite-error" role="alert">{errors.limit}</p>}
        <div className="favorite-modal-actions">
          <button type="button" onClick={closeForm}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>}
  </section>;
}
