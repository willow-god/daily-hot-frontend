import { readFileSync } from "node:fs";

const homeSource = readFileSync(new URL("../src/views/Home.vue", import.meta.url), "utf8");
const hotListSource = readFileSync(
  new URL("../src/components/HotList.vue", import.meta.url),
  "utf8"
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  hotListSource.includes("defineEmits") &&
    hotListSource.includes("load-failed") &&
    hotListSource.includes("hideFailedCardTimer"),
  "HotList should emit load-failed after a timed error state"
);

assert(
  homeSource.includes("@load-failed=\"hideFailedCard\""),
  "Home should listen for failed cards"
);

assert(
  homeSource.includes("hiddenFailedNames") &&
    homeSource.includes("visibleNewsArr") &&
    homeSource.includes("!hiddenFailedNames.value.has(item.name)"),
  "Home should filter failed cards from the rendered grid"
);

console.log("card failure behavior verification passed");
