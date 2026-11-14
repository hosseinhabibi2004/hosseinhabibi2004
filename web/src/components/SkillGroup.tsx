import type { PublicSkillGroup } from "@/lib/content/types";

interface SkillGroupProps {
  group: PublicSkillGroup;
}

export function SkillGroup({ group }: SkillGroupProps) {
  return (
    <div className="rounded-sm border-2 border-foreground p-6">
      <h3 className="text-xl font-bold tracking-tight">{group.title}</h3>
      <ul className="mt-5 flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <li
            key={skill.name}
            className="rounded-sm bg-muted px-2.5 py-1 text-sm font-semibold text-muted-foreground"
          >
            {skill.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
