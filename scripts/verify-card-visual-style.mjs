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
  hotListSource.includes("box-shadow:") &&
    hotListSource.includes("inset 0 1px 0") &&
    hotListSource.includes("background:"),
  "HotList card should use full-surface depth instead of one-sided color"
);

assert(
  hotListSource.includes("&::after") &&
    hotListSource.includes("&:hover .num"),
  "HotList card should have structured header and row-level interaction details"
);

console.log("card visual style verification passed");
