import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./profile.css";
import App from "./App";
import { PlayerProvider } from "./PlayerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode><PlayerProvider><App /></PlayerProvider></StrictMode>
);
