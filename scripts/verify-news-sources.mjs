import { readFileSync } from "node:fs";

const storeSource = readFileSync(new URL("../src/store/index.js", import.meta.url), "utf8");
const arrayMatch = storeSource.match(/defaultNewsArr:\s*(\[[\s\S]*?\])\s*,\s*newsArr:/);

if (!arrayMatch) {
  throw new Error("defaultNewsArr not found");
}

const defaultNewsArr = Function(`"use strict"; return (${arrayMatch[1]});`)();
const names = defaultNewsArr.map((item) => item.name);
const excludedNames = [
  "coolapk",
  "earthquake",
  "gameres",
  "hostloc",
  "producthunt",
];
const expectedFirstNames = [
  "baidu",
  "weibo",
  "douyin",
  "toutiao",
  "zhihu",
  "bilibili",
  "kuaishou",
  "qq-news",
  "sina-news",
  "netease-news",
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(defaultNewsArr.length === 51, `Expected 51 sources, got ${defaultNewsArr.length}`);
assert(new Set(names).size === names.length, "Source names must be unique");

for (const name of excludedNames) {
  assert(!names.includes(name), `${name} should not be displayed`);
}

assert(
  expectedFirstNames.every((name, index) => names[index] === name),
  `Top source order mismatch: ${names.slice(0, expectedFirstNames.length).join(", ")}`
);

defaultNewsArr.forEach((item, index) => {
  assert(item.order === index, `${item.name} order should be ${index}, got ${item.order}`);
  assert(item.show === true, `${item.name} should be shown by default`);
});

console.log("news source verification passed");
