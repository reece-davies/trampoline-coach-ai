// /lib/skills.ts
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync"; // For safe CSV parsing

// Type for a trampoline skill
export interface Skill {
  skill: string;
  notation: string;
  difficulty: number;
  description: string;
}

// Caching 
// Store loaded skills in memory so we don't read/parse CSV on every request
let cachedSkills: Skill[] | null = null;

// Load all skills from the CSV file
export function loadSkills(): Skill[] {
  if (cachedSkills) return cachedSkills; // Return cached skills if already loaded

  const filePath = path.join(process.cwd(), "data", "skills.csv");
  const csvData = fs.readFileSync(filePath, "utf-8");

  // Parse CSV safely (handles commas inside quoted fields)
  const records: any[] = parse(csvData, {
    columns: true,       // Use first row as header
    skip_empty_lines: true,
    trim: true,          // Remove extra whitespace
  });

  cachedSkills = records.map((r) => ({
    skill: r.skill,
    notation: r.notation,
    difficulty: parseFloat(r.difficulty), // Ensure numeric difficulty
    description: r.description,
  }));

  return cachedSkills;
}

// Text normalization
// Lowercase, remove punctuation and parentheses for matching
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // Remove parenthetical text
    .replace(/[^a-z0-9\s]/g, "") // Remove other punctuation
    .trim();
}

// Find relevant skills for a user question
// Handles:
// - Aliases separated by "/"
// - Parenthetical aliases "(Triff Pike)"
export function findRelevantSkills(question: string): Skill[] {
  const skills = loadSkills();
  const q = normalize(question);

  return skills.filter((s) => {
    // Split aliases by "/" and extract parenthetical aliases
    const aliases = [
      ...s.skill.split("/").map((a) => normalize(a)),
      ...(s.skill.match(/\((.*?)\)/g)?.map((a) => normalize(a.replace(/[()]/g, ""))) ?? []),
    ];

    // Match if any alias is included in the user question
    return aliases.some((alias) => q.includes(alias));
  });
}