import { octokit } from "./github.ts";

import {
  culture,
  labs,
  lifestyle,
  neutral,
  news,
  opinion,
  sport,
} from "https://cdn.skypack.dev/@guardian/source-foundations?dts";

const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
  owner: "guardian",
  repo: "playground",
});

const prefixes = {
  tech: labs[400],
  type: sport[400],
  started: culture[500],
  community: lifestyle[500],
  opinion: opinion[500],
  news: news[500],
  fixme: neutral[0],
} as const;

const isPrefix = (prefix: string): prefix is keyof typeof prefixes =>
  prefix in prefixes;

for (const label of labels) {
  const [prefix] = label.name.split(": ");

  if (!isPrefix(prefix)) {
    const {
      data: { name, color },
    } = await octokit.rest.issues.updateLabel({
      owner: "guardian",
      repo: "playground",
      name: label.name,
      new_name: `fixme: ${label.name}`,
      color: prefixes["fixme"].slice(1),
    });
    console.log(name, color);
    continue;
  }

  const expectedColour = prefixes[prefix];

  if (expectedColour !== `#${label.color}`) {
    const {
      data: { color },
    } = await octokit.rest.issues.updateLabel({
      owner: "guardian",
      repo: "playground",
      name: label.name,
      color: expectedColour.slice(1),
    });
    console.log("new colour:", color);
  }
}
