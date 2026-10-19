import { LIMITS } from "./config";

/** Split free text such as "Python, SQL; Docker" into skill names. */
export function parseSkillInput(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Trim, drop duplicates (case-insensitive) and apply backend limits. */
export function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of skills) {
    const skill = raw.replace(/\s+/g, " ").trim().slice(0, LIMITS.maxSkillLength);
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    result.push(skill);
    if (result.length === LIMITS.maxSkills) break;
  }

  return result;
}

export function sameSkillSet(a: string[], b: string[]): boolean {
  const normalize = (list: string[]) =>
    list
      .map((skill) => skill.trim().toLowerCase())
      .sort()
      .join("\n");
  return normalize(a) === normalize(b);
}
