// /lib/skills.ts
import fs from "fs";
import path from "path";

export type Skill = {
  skill: string;
  notation: string;
  difficulty: number;
  description: string;
};

let cachedSkills: Skill[] | null = null;

// Load skills from CSV file once and cache them.
export function loadSkills(): Skill[] {
  if (cachedSkills) return cachedSkills;

  const filePath = path.join(process.cwd(), "data", "skills.csv");
  const csv = fs.readFileSync(filePath, "utf-8");

  const lines = csv.split("\n").slice(1); // skip header

  cachedSkills = lines
    .map((line) => {
      const [skill, notation, difficulty, description] = line.split(",");
      if (!skill) return null;

      const parsedDifficulty = parseFloat(difficulty);
      return {
        skill: skill.trim(),
        notation: notation?.trim() ?? "",
        difficulty: isNaN(parsedDifficulty) ? 0 : parsedDifficulty,
        description: description?.trim() ?? "",
      };
    })
    .filter(Boolean) as Skill[];

  return cachedSkills;
}

// Find skills mentioned in a question (case-insensitive substring match).
export function findRelevantSkills(question: string): Skill[] {
  const skills = loadSkills();
  const q = question.toLowerCase();

  return skills.filter((s) => q.includes(s.skill.toLowerCase()));
}