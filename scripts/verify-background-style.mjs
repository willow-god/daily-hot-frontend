import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.vue", import.meta.url), "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  appSource.includes("theme-light") && appSource.includes("theme-dark"),
  "App layout should expose light and dark theme classes"
);

assert(
  appSource.includes('class="site-background"') &&
    appSource.includes('class="site-content"'),
  "App should use explicit background and content layers instead of relying on layout pseudo-elements"
);

assert(
  appSource.includes("https://bing.liushen.fun/api/daily") &&
    appSource.includes("background-image: url("),
  "App should use the Bing daily image as the site background"
);

assert(
  appSource.includes("--site-bg-overlay: rgba(255, 255, 255, 0.82)") &&
    appSource.includes("--site-bg-overlay: rgba(0, 0, 0"),
  "App should use a strong white translucent overlay in light mode and black translucent overlay in dark mode"
);

assert(
  appSource.includes("filter: blur") &&
    !appSource.includes("backdrop-filter: blur") &&
    !appSource.includes("&::before") &&
    !appSource.includes("&::after"),
  "Background image should be blurred directly so the overlay cannot blur cards"
);

console.log("background style verification passed");
