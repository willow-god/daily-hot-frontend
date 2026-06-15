import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.vue", import.meta.url), "utf8");
const headerSource = readFileSync(
  new URL("../src/components/Header.vue", import.meta.url),
  "utf8"
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  headerSource.includes("section {") &&
    !headerSource.includes("padding: 0 18px;") &&
    !headerSource.includes("border: 1px solid rgba(24, 24, 24, 0.08);") &&
    !headerSource.includes("border-radius: 8px;") &&
    !headerSource.includes("box-shadow: 0 18px 50px"),
  "Top header section should not use a card container that breaks edge symmetry"
);

assert(
  !headerSource.includes("box-shadow: 0 10px 24px") &&
    !headerSource.includes("img {\n        width: 50px;\n        height: 50px;\n        margin-right: 16px;\n        border-radius: 8px;"),
  "Header logo image should not have a frame, radius, or shadow"
);

assert(
  appSource.includes("&.show") &&
    appSource.includes("background-color: var(--n-color);") &&
    appSource.includes("border-bottom: 1px solid var(--n-border-color);") &&
    !appSource.includes("box-shadow: 0 12px 36px"),
  "Fixed header should be a simple original-style bar without heavy transition effects"
);

console.log("header fixed style verification passed");
