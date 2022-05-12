import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Octokit } from "https://cdn.skypack.dev/octokit";
import type { RestEndpointMethodTypes } from "https://cdn.skypack.dev/@octokit/plugin-rest-endpoint-methods?dts";
import type { Endpoints } from "https://cdn.skypack.dev/@octokit/types?dts";

console.log(config({ safe: true, export: true }));

/** Github token for Authentication */
const token = Deno.env.get("GITHUB_TOKEN");
if (!token) throw new Error("Missing GITHUB_TOKEN");

type OctokitWithRest = {
  rest: {
    [Section in keyof RestEndpointMethodTypes]: {
      [Method in keyof RestEndpointMethodTypes[Section]]:
        RestEndpointMethodTypes[Section][Method] extends
          { parameters: infer Parameters; response: infer Response } ? (
          arg: Parameters,
        ) => Promise<Response>
          : never;
    };
  };
  request: <Url extends keyof Endpoints>(
    url: Url,
    arg: Endpoints[Url]["parameters"],
  ) => Promise<Endpoints[Url]["parameters"]>;
};

/**
 * A hydrated Octokit with types for the rest API.
 */
// @ts-expect-error -- Octokit’s own types are not as good as ours
const octokit = new Octokit({ auth: token }) as OctokitWithRest;

const defaultParams = {
  owner: "guardian",
  repo: "playground",
} as const;

export { defaultParams, octokit };
