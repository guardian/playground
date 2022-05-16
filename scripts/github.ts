import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Octokit as OctokitCore } from "https://cdn.skypack.dev/@octokit/core?dts";
import { restEndpointMethods } from "https://cdn.skypack.dev/@octokit/plugin-rest-endpoint-methods?dts";

console.log(config({ safe: true, export: true }));

/** Github token for Authentication */
const token = Deno.env.get("GITHUB_TOKEN");
if (!token) throw new Error("Missing GITHUB_TOKEN");

const Octokit = OctokitCore.plugin(restEndpointMethods);

/** A hydrated Octokit */
const octokit = new Octokit({ auth: token });

const defaultParams = {
  owner: "guardian",
  repo: "playground",
} as const;

export { defaultParams, octokit };
