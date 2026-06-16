import { readFileSync } from "node:fs";

const hotListSource = readFileSync(
  new URL("../src/components/HotList.vue", import.meta.url),
  "utf8"
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  !hotListSource.includes("border-top:"),
  "HotList card should not use a single colored edge or top stripe"
);

assert(
  !hotListSource.includes("&::before"),
  "HotList card should not rely on an edge pseudo-element as the main visual design"
);

assert(
  hotListSource.includes("background: var(--hot-card-bg);") &&
    hotListSource.includes("box-shadow: var(--hot-card-shadow);") &&
    hotListSource.includes("color: var(--hot-card-text);"),
  "HotList card should use simple translucent white/black surfaces"
);

assert(
  !hotListSource.includes("backdrop-filter: blur"),
  "HotList card should not blur its own backdrop because it can reduce perceived text clarity"
);

assert(
  hotListSource.includes(':content-style="{ padding: 0 }"') &&
    hotListSource.includes(".n-scrollbar-rail") &&
    hotListSource.includes("right: 3px;"),
  "HotList scrollbar should sit near the card edge while inner content owns padding"
);

assert(
  !hotListSource.includes("#b7353e") &&
    !hotListSource.includes("#8f6b2d") &&
    !hotListSource.includes("#2f756b") &&
    !hotListSource.includes("#164f49"),
  "HotList card should not use decorative mixed colors"
);

assert(
  !hotListSource.includes("opacity: 0.76") &&
    !hotListSource.includes("opacity: 0.7"),
  "HotList text should stay fully opaque and clear"
);

console.log("card visual style verification passed");
