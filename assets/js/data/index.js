import { beginnerChallenges } from "./challenges.beginner.js";
import { intermediateChallenges } from "./challenges.intermediate.js";
import { advancedChallenges } from "./challenges.advanced.js";

export const allChallenges = [...beginnerChallenges, ...intermediateChallenges, ...advancedChallenges];
export const challengesById = Object.fromEntries(allChallenges.map((c) => [c.id, c]));
