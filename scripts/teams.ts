import { defaultParams, octokit } from "./github.ts";

const filename = import.meta.url.split("/").slice(-1);

const { data: teams } = await octokit.rest.teams.listChildInOrg({
  org: "guardian",
  // https://github.com/orgs/guardian/teams/interests
  team_slug: "interests",
});

type Team = typeof teams[number];

/**
 * Some interest teams are not children of [@guardian/interests][],
 * so we need to account for them manually
 *
 * [@guardian/interests]: https://github.com/orgs/guardian/teams/interests
 */
const extras: Array<Pick<Team, "name" | "html_url">> = [
  "aws",
  "css",
  "fastly",
  "haskell",
  "js",
  "python",
  "ruby",
  "scala",
].map((slug) => {
  const name: string = slug.length <= 3
    ? slug.toUpperCase()
    : `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;

  return ({
    name,
    html_url: `https://github.com/orgs/guardian/teams/${name}`,
  });
});

const no_duplicates = (extra: typeof extras[number]) =>
  !teams.some((team) => team.html_url === extra.html_url);

const all_teams = extras.filter(no_duplicates).concat(teams).sort();

const list: string = all_teams.map((child) => {
  return `- [${child.name}](${child.html_url})`;
}).join("\n");

const body = `## Specific interest teams

Feel free to sign-up yourself, or add new ones. Any team who has [@guardian/interests][] as a parent will automatically be listed below.

[@guardian/interests]: https://github.com/orgs/guardian/teams/interests

${list}

See [\`scripts/teams.ts\`](https://github.com/guardian/playground/blob/main/scripts/${filename}) for the script keeping this up-to-date.
`;

await octokit.rest.issues.update({
  ...defaultParams,
  issue_number: 11,
  body,
});
