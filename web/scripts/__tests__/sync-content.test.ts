// @vitest-environment node
//
// Snapshot shape written by `pnpm sync` (contract with web/src/lib/content):
//   <CONTENT_DIR>/<lng>.json = {
//     profile: PublicProfile | null,          // null when the API answers 404
//     posts: PublicPostDetail[],              // detail objects, including `body`
//     projects: PublicProjectDetail[],        // detail objects, including `body`
//     tags: PublicTag[], skills: PublicSkillGroup[],
//     experience: PublicExperience[], education: PublicEducation[],
//   }
//   <CONTENT_DIR>/meta.json = { generatedAt: ISO string, counts: { <lng>: { posts, projects, tags,
//     skills, experience, education } } }
// Images go to <MEDIA_DIR>/<hash>.<ext>; URLs are rewritten to `<NEXT_PUBLIC_BASE_PATH>/media/<file>`.
// Env contract: CONTENT_DIR (default `.content`), MEDIA_DIR (default `public/media`).
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const WEB_DIR = path.resolve(import.meta.dirname, "../..");
const BASE_PATH = "/site";
const SLUG = "hello-sync";
const PROJECT_SLUG = "sync-project";

// Distinct bytes per image so each gets its own hash.
const png = (n: number) =>
  Buffer.concat([
    Buffer.from("89504e470d0a1a0a0000000d49484452", "hex"),
    Buffer.from(`image-${n}`),
  ]);
const IMAGES: Record<string, Buffer> = {
  "/media/images/cover.png": png(1),
  "/media/images/inline.png": png(2),
  "/media/images/avatar.png": png(3),
  "/media/images/project.png": png(4),
};

interface Stub {
  url: string;
  hits: string[];
  close: () => Promise<void>;
}

function startStub(opts: { fail?: string; noProfile?: boolean } = {}): Promise<Stub> {
  const hits: string[] = [];
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const { port } = server.address() as AddressInfo;
      const origin = `http://127.0.0.1:${port}`;
      const url = req.url ?? "";
      hits.push(url);
      const image = (file: string, alt: string) => ({
        url: `${origin}/media/images/${file}`,
        width: 10,
        height: 10,
        alt,
      });
      if (IMAGES[url]) {
        res.writeHead(200, { "content-type": "image/png" }).end(IMAGES[url]);
        return;
      }
      const m = url.match(/^\/api\/public\/(en|fa)\/(.+)$/);
      if (!m) {
        res.writeHead(404).end();
        return;
      }
      const [, lng, rest] = m;
      if (opts.fail && url === opts.fail) {
        res.writeHead(500).end("boom");
        return;
      }
      const post = {
        slug: SLUG,
        title: `Post ${lng}`,
        summary: "Summary",
        published_at: "2026-03-10T09:00:00Z",
        cover_image: image("cover.png", "Cover"),
        tags: [{ slug: "django", name: "Django" }],
      };
      const project = {
        slug: PROJECT_SLUG,
        title: `Project ${lng}`,
        summary: "Summary",
        repo_url: "https://github.com/example/repo",
        live_url: "",
        featured: true,
        skills: ["Django"],
        cover_image: image("project.png", "Project"),
      };
      let result: unknown;
      switch (rest) {
        case "posts/":
          result = [post];
          break;
        case `posts/${SLUG}/`:
          result = {
            ...post,
            body: `Intro\n\n![Inline](${origin}/media/images/inline.png)\n\nEnd`,
          };
          break;
        case "tags/":
          result = [{ slug: "django", name: "Django" }];
          break;
        case "projects/":
          result = [project];
          break;
        case `projects/${PROJECT_SLUG}/`:
          result = { ...project, body: "Project body" };
          break;
        case "profile/":
          if (opts.noProfile && lng === "fa") {
            res.writeHead(404, { "content-type": "application/json" }).end("{}");
            return;
          }
          result = {
            name: "Hossein Habibi",
            headline: "Engineer",
            summary: "Summary",
            location: "Tehran",
            email: "hello@example.com",
            avatar: image("avatar.png", "Me"),
            links: [{ kind: "github", url: "https://github.com/example" }],
          };
          break;
        case "skills/":
          result = [{ title: "Backend", skills: [{ name: "Django" }] }];
          break;
        case "experience/":
          result = [
            {
              company: "Acme",
              company_url: "",
              role: "Engineer",
              location: "Tehran",
              description: "Work",
              start_date: "2022-01-01",
              end_date: null,
            },
          ];
          break;
        case "education/":
          result = [
            {
              institution: "Uni",
              degree: "BSc",
              description: "",
              start_date: "2015-09-01",
              end_date: "2019-06-30",
            },
          ];
          break;
        default:
          res.writeHead(404).end();
          return;
      }
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify({ success: true, message: "ok", result }));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        hits,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

function runSync(backend: string, contentDir: string, mediaDir: string) {
  return new Promise<{ code: number | null; output: string }>((resolve) => {
    const child = spawn("pnpm", ["sync"], {
      cwd: WEB_DIR,
      env: {
        ...process.env,
        BACKEND_API_URL: backend,
        NEXT_PUBLIC_SITE_URL: "https://example.github.io",
        NEXT_PUBLIC_BASE_PATH: BASE_PATH,
        CONTENT_DIR: contentDir,
        MEDIA_DIR: mediaDir,
      },
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", (code) => resolve({ code, output }));
  });
}

const cleanups: Array<() => Promise<void> | void> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

async function setup(opts: Parameters<typeof startStub>[0] = {}) {
  const stub = await startStub(opts);
  const root = mkdtempSync(path.join(tmpdir(), "sync-content-"));
  const contentDir = path.join(root, "content");
  const mediaDir = path.join(root, "media");
  cleanups.push(() => stub.close(), () => rmSync(root, { recursive: true, force: true }));
  return { stub, contentDir, mediaDir };
}

const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8"));

describe("pnpm sync", () => {
  it("writes a snapshot per locale with details, local images and no API URLs", async () => {
    const { stub, contentDir, mediaDir } = await setup();
    const { code, output } = await runSync(stub.url, contentDir, mediaDir);
    expect(code, output).toBe(0);

    for (const file of ["en.json", "fa.json", "meta.json"]) {
      expect(existsSync(path.join(contentDir, file)), file).toBe(true);
    }
    const en = readJson(path.join(contentDir, "en.json"));
    const fa = readJson(path.join(contentDir, "fa.json"));
    expect(Object.keys(en).sort()).toEqual(
      ["education", "experience", "posts", "profile", "projects", "skills", "tags"].sort(),
    );

    // Details were fetched: bodies are present.
    expect(en.posts).toHaveLength(1);
    expect(en.posts[0].title).toBe("Post en");
    expect(fa.posts[0].title).toBe("Post fa");
    expect(en.posts[0].body).toContain("Intro");
    expect(en.projects[0].body).toBe("Project body");
    expect(en.tags).toEqual([{ slug: "django", name: "Django" }]);

    // Cover and in-body images are local files under <base path>/media/.
    const mediaUrl = /^\/site\/media\/[\w-]+\.png$/;
    expect(en.posts[0].cover_image.url).toMatch(mediaUrl);
    expect(en.projects[0].cover_image.url).toMatch(mediaUrl);
    expect(en.profile.avatar.url).toMatch(mediaUrl);
    const inline = en.posts[0].body.match(/!\[Inline\]\((\/site\/media\/[\w-]+\.png)\)/);
    expect(inline, en.posts[0].body).not.toBeNull();
    for (const url of [en.posts[0].cover_image.url, inline![1]]) {
      expect(existsSync(path.join(mediaDir, path.basename(url))), url).toBe(true);
    }
    expect(readdirSync(mediaDir).length).toBeGreaterThanOrEqual(4);

    // Nothing points back at the API.
    for (const file of ["en.json", "fa.json", "meta.json"]) {
      const text = readFileSync(path.join(contentDir, file), "utf8");
      expect(text, file).not.toMatch(/127\.0\.0\.1|localhost/);
    }

    const meta = readJson(path.join(contentDir, "meta.json"));
    expect(Number.isNaN(Date.parse(meta.generatedAt))).toBe(false);
    expect(meta.counts.en).toMatchObject({
      posts: 1,
      projects: 1,
      tags: 1,
      skills: 1,
      experience: 1,
      education: 1,
    });
  }, 90_000);

  it("allows a missing profile (404) and writes null", async () => {
    const { stub, contentDir, mediaDir } = await setup({ noProfile: true });
    const { code, output } = await runSync(stub.url, contentDir, mediaDir);
    expect(code, output).toBe(0);
    expect(readJson(path.join(contentDir, "fa.json")).profile).toBeNull();
    expect(readJson(path.join(contentDir, "en.json")).profile).not.toBeNull();
  }, 90_000);

  it("exits non-zero when an endpoint answers 500", async () => {
    const { stub, contentDir, mediaDir } = await setup({ fail: "/api/public/en/skills/" });
    const { code, output } = await runSync(stub.url, contentDir, mediaDir);
    // The script must have talked to the API (not merely be missing).
    expect(stub.hits, output).toContain("/api/public/en/posts/");
    expect(code).not.toBe(0);
  }, 90_000);
});
