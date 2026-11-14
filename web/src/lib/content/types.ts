// Shape of the snapshot written by `pnpm sync` (web/scripts/sync-content.ts) and read by
// src/lib/content. Derived from the generated SDK with type-only imports, which the ESLint
// SDK boundary allows for this file alone.
import type {
  PublicEducation,
  PublicExperience,
  PublicImage,
  PublicLink,
  PublicPostDetail,
  PublicProfile,
  PublicProjectDetail,
  PublicSkill,
  PublicSkillGroup,
  PublicTag,
} from "@/sdk/generated/types.gen";

export type {
  PublicEducation,
  PublicExperience,
  PublicImage,
  PublicLink,
  PublicPostDetail,
  PublicProfile,
  PublicProjectDetail,
  PublicSkill,
  PublicSkillGroup,
  PublicTag,
};

/** `<CONTENT_DIR>/<lng>.json`. */
export interface Snapshot {
  /** null when the API answers 404 (no profile yet). */
  profile: PublicProfile | null;
  posts: PublicPostDetail[];
  projects: PublicProjectDetail[];
  tags: PublicTag[];
  skills: PublicSkillGroup[];
  experience: PublicExperience[];
  education: PublicEducation[];
}

export type SnapshotCounts = Record<
  "posts" | "projects" | "tags" | "skills" | "experience" | "education",
  number
>;

/** `<CONTENT_DIR>/meta.json`. */
export interface SnapshotMeta {
  generatedAt: string;
  counts: Record<string, SnapshotCounts>;
}
