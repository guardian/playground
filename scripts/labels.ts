import { defaultParams, octokit } from "./github.ts";

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
  context: culture[500],
  community: lifestyle[500],
  opinion: opinion[500],
  news: news[500],
  fixme: neutral[0],
} as const;

/** In case we need to change a prefix in the future,
 * this helper will take care of renaming all prefixes */
const remaps: Record<string, keyof typeof prefixes | undefined> = {
  started: "context",
};

const isPrefix = (prefix: string): prefix is keyof typeof prefixes =>
  prefix in prefixes;

for (const label of labels) {
  const [prefix, ...rest] = label.name.split(": ");

  if (!isPrefix(prefix)) {
    console.warn("invalid prefix: ", prefix);

    const remapped = remaps[prefix];

    const {
      data: { name, color },
    } = await octokit.rest.issues.updateLabel({
      ...defaultParams,
      name: label.name,
      new_name: remapped
        ? `${remapped}: ${rest.join(" ")}`
        : `fixme: ${label.name}`,
      color: remapped
        ? prefixes[remapped].slice(1)
        : prefixes["fixme"].slice(1),
    });

    console.info("new name & colour: ", [name, color]);

    continue;
  }

  const expectedColour = prefixes[prefix].slice(1);

  if (expectedColour !== label.color) {
    const {
      data: { color },
    } = await octokit.rest.issues.updateLabel({
      ...defaultParams,
      name: label.name,
      color: expectedColour,
    });

    console.info(
      `fixed colour for ${label.name}: `,
      `#${label.color} -> ${color}`,
    );
  }
}
