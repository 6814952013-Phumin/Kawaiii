import {
  SiGithub,
  SiGmail,
  SiGoogledrive,
  SiNotion,
  SiX,
  SiYoutube,
} from "react-icons/si";

export const starterFavorites = [
  { name: "YouTube", url: "https://youtube.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Drive", url: "https://drive.google.com" },
  { name: "Notion", url: "https://notion.so" },
  { name: "ChatGPT", url: "https://chatgpt.com" },
  { name: "X", url: "https://x.com" },
];

const siteIcons = {
  "youtube.com": { Icon: SiYoutube, color: "#FF0000" },
  "github.com": { Icon: SiGithub, color: "#ffffff" },
  "mail.google.com": { Icon: SiGmail, color: "#EA4335" },
  "drive.google.com": { Icon: SiGoogledrive, color: "#4285F4" },
  "notion.so": { Icon: SiNotion, color: "#ffffff" },
  "chatgpt.com": { imageUrl: "https://cdn.simpleicons.org/openai/ffffff", color: "#ffffff" },
  "x.com": { Icon: SiX, color: "#ffffff" },
  "twitter.com": { Icon: SiX, color: "#ffffff" },
};

export function getFavoriteIcon(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }

  const domain = Object.keys(siteIcons)
    .sort((first, second) => second.length - first.length)
    .find((candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`));

  return domain ? siteIcons[domain] : null;
}

export function getFavoriteFaviconUrl(url) {
  const hostname = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}
