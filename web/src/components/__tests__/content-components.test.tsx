// Contract (plan B5): all are plain components, imported by name from `@/components/<Name>`,
// rendered as elements (no i18n hook needed, so no provider). Data is the fixture snapshot.
//   PostCard({ lng, post })              links to /{lng}/posts/{slug}/, title, summary,
//                                        <time dateTime>, tag chips -> /{lng}/tags/{slug}/
//   ProjectCard({ lng, project, index }) zero-padded number, title, skills; repo/live links only
//                                        when the URLs are non-empty
//   CoverImage({ image })                <img alt width height> from the API; null renders nothing
//   ExperienceItem({ lng, item })        company, role, location, description, <time> dates
//   SkillGroup({ group })                group title and its skill names
//   TagChip({ lng, tag })                link to /{lng}/tags/{slug}/ with the tag name
//   EmptyState({ title })                the title text
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoverImage } from "@/components/CoverImage";
import { EmptyState } from "@/components/EmptyState";
import { ExperienceItem } from "@/components/ExperienceItem";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";
import { SkillGroup } from "@/components/SkillGroup";
import { TagChip } from "@/components/TagChip";
import en from "@/lib/content/__fixtures__/en.json";
import fa from "@/lib/content/__fixtures__/fa.json";
import type {
  PublicExperience,
  PublicPostDetail,
  PublicProjectDetail,
  PublicSkillGroup,
} from "@/lib/content/types";

const post = en.posts.find((p) => p.slug === "notes-on-drf-envelopes") as unknown as PublicPostDetail;
const project = en.projects[0] as unknown as PublicProjectDetail;
const experience = en.experience[0] as unknown as PublicExperience;
const skillGroup = en.skills[0] as unknown as PublicSkillGroup;
const faPost = fa.posts[0] as unknown as PublicPostDetail;

function hrefEnding(container: HTMLElement, suffix: string) {
  return Array.from(container.querySelectorAll("a")).filter((a) =>
    a.getAttribute("href")?.endsWith(suffix),
  );
}

describe("PostCard", () => {
  it("links to the post and shows title, summary, date and tags", () => {
    const { container } = render(<PostCard lng="en" post={post} />);
    expect(hrefEnding(container, "/en/posts/notes-on-drf-envelopes/").length).toBeGreaterThan(0);
    expect(screen.getByText("Notes on DRF response envelopes")).toBeInTheDocument();
    expect(screen.getByText(post.summary)).toBeInTheDocument();
    const time = container.querySelector("time");
    expect(time?.getAttribute("datetime")).toMatch(/^2026-05-02/);
    expect(time?.textContent?.trim()).toBeTruthy();
    const chip = hrefEnding(container, "/en/tags/django/");
    expect(chip).toHaveLength(1);
    expect(chip[0]).toHaveTextContent("Django");
  });

  it("uses the locale in the links and the cover image when there is one", () => {
    const { container } = render(<PostCard lng="fa" post={faPost} />);
    expect(hrefEnding(container, "/fa/posts/building-a-static-portfolio/").length).toBeGreaterThan(0);
    expect(container.querySelector("a[href$='/en/posts/building-a-static-portfolio/']")).toBeNull();
    expect(container.querySelector("time")).not.toBeNull();
  });
});

describe("ProjectCard", () => {
  it("shows the zero-padded number, title, skills and both external links", () => {
    const { container } = render(<ProjectCard lng="en" project={project} index={0} />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Portfolio site")).toBeInTheDocument();
    for (const skill of project.skills) expect(screen.getByText(skill)).toBeInTheDocument();
    expect(hrefEnding(container, "/en/projects/habibi-portfolio/").length).toBeGreaterThan(0);
    const external = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(external).toContain(project.repo_url);
    expect(external).toContain(project.live_url);
  });

  it("pads the index to two digits", () => {
    render(<ProjectCard lng="en" project={project} index={8} />);
    expect(screen.getByText("09")).toBeInTheDocument();
  });

  it("omits repo and live links when their URLs are empty", () => {
    const bare = { ...project, repo_url: "", live_url: "" };
    const { container } = render(<ProjectCard lng="en" project={bare} index={1} />);
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(container.querySelectorAll("a[href^='http']")).toHaveLength(0);
    expect(container.querySelector("a[href='']")).toBeNull();
  });

  it("omits only the live link when just the repo is set", () => {
    const repoOnly = { ...project, live_url: "" };
    const { container } = render(<ProjectCard lng="en" project={repoOnly} index={0} />);
    const external = Array.from(container.querySelectorAll("a[href^='http']")).map((a) =>
      a.getAttribute("href"),
    );
    expect(external).toEqual([project.repo_url]);
  });
});

describe("CoverImage", () => {
  it("renders the image with alt, width and height from the API", () => {
    const image = project.cover_image!;
    render(<CoverImage image={image} />);
    const img = screen.getByRole("img", { name: image.alt });
    expect(img).toHaveAttribute("width", String(image.width));
    expect(img).toHaveAttribute("height", String(image.height));
    expect(img.getAttribute("src")).toContain("project0001");
  });

  it("renders nothing for null", () => {
    const { container } = render(<CoverImage image={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ExperienceItem, SkillGroup, TagChip, EmptyState", () => {
  it("ExperienceItem shows company, role, location, description and the start date", () => {
    const { container } = render(<ExperienceItem lng="en" item={experience} />);
    expect(screen.getByText(/Acme Software/)).toBeInTheDocument();
    expect(screen.getByText("Senior software engineer")).toBeInTheDocument();
    expect(screen.getByText(/Tehran/)).toBeInTheDocument();
    expect(screen.getByText(/Led the API platform/)).toBeInTheDocument();
    expect(container.querySelector("time[datetime^='2022-04']")).not.toBeNull();
  });

  it("SkillGroup shows the title and every skill", () => {
    render(<SkillGroup group={skillGroup} />);
    expect(screen.getByText("Backend")).toBeInTheDocument();
    for (const skill of ["Python", "Django", "PostgreSQL"]) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it("TagChip links to the tag page", () => {
    render(<TagChip lng="en" tag={{ slug: "django", name: "Django" }} />);
    const link = screen.getByRole("link", { name: "Django" });
    expect(link.getAttribute("href")).toMatch(/\/en\/tags\/django\/$/);
  });

  it("EmptyState shows its title", () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
