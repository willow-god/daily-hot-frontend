import { readFileSync } from "node:fs";

const hotListSource = readFileSync(
  new URL("../src/components/HotList.vue", import.meta.url),
  "utf8"
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  hotListSource.includes("<Teleport to=\"body\">") &&
    hotListSource.includes("ref=\"titleTooltipRef\"") &&
    hotListSource.includes("class=\"title-tooltip\""),
  "Full news titles should render in a body-level tooltip so scroll containers do not clip them"
);

assert(
  hotListSource.includes("@mouseenter=\"showTitleTooltip(item.title, $event)\"") &&
    hotListSource.includes("@mousemove=\"moveTitleTooltip\"") &&
    hotListSource.includes("@mouseleave=\"hideTitleTooltip\""),
  "News items should track mouse enter, move, and leave events for a following title tooltip"
);

assert(
  hotListSource.includes("white-space: nowrap;") &&
    hotListSource.includes("overflow: hidden;") &&
    hotListSource.includes("text-overflow: ellipsis;") &&
    hotListSource.includes("min-width: 0;") &&
    hotListSource.includes("@media (max-width: 1024px), (hover: none), (pointer: coarse)") &&
    hotListSource.includes("white-space: normal;") &&
    hotListSource.includes("overflow: visible;") &&
    hotListSource.includes("text-overflow: clip;"),
  "News titles should truncate only on desktop and show full multiline text on narrow or touch screens"
);

assert(
  hotListSource.includes("position: fixed;") &&
    hotListSource.includes("pointer-events: none;") &&
    hotListSource.includes("transform: `translate3d(") &&
    hotListSource.includes("titleTooltipRef.value?.offsetWidth") &&
    hotListSource.includes("titleTooltipRef.value?.offsetHeight") &&
    hotListSource.includes("TITLE_TOOLTIP_GAP = 10"),
  "The full-title tooltip should be fixed, non-interactive, measured, and closely mouse-positioned"
);

assert(
  hotListSource.includes("canShowTitleTooltip") &&
    hotListSource.includes("(hover: hover) and (pointer: fine)") &&
    hotListSource.includes("TITLE_TOOLTIP_DISABLE_WIDTH = 1024"),
  "Title tooltip should be disabled on touch devices and narrow screens"
);

console.log("title tooltip behavior verification passed");
