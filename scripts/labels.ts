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
    console.warn("invalid prefix: ", prefix);

    const {
      data: { name, color },
    } = await octokit.rest.issues.updateLabel({
      owner: "guardian",
      repo: "playground",
      name: label.name,
      new_name: `fixme: ${label.name}`,
      color: prefixes["fixme"].slice(1),
    });

    console.info("new name & colour: ", [name, color]);

    continue;
  }

  const expectedColour = prefixes[prefix].slice(1);

  if (expectedColour !== label.color) {
    const {
      data: { color },
    } = await octokit.rest.issues.updateLabel({
      owner: "guardian",
      repo: "playground",
      name: label.name,
      color: expectedColour,
    });

    console.info(
      `fixed colour for ${label.name}: `,
      `#${label.color} -> ${color}`,
    );
  }
}
