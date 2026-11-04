import { HEALTH_TOOLS } from "./health";
import { WELLNESS_TOOLS } from "./wellness";
import { LIFE_TOOLS } from "./life";
import { CULTURE_TOOLS } from "./culture";
import type { ToolMeta } from "./types";

// Each group file is owned by one builder; this file only aggregates.
export const TOOLS: ToolMeta[] = [...HEALTH_TOOLS, ...WELLNESS_TOOLS, ...LIFE_TOOLS, ...CULTURE_TOOLS];

export function getTool(slug: string): ToolMeta {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`unknown tool: ${slug}`);
  return t;
}

export const toolsIn = (category: ToolMeta["category"]) => TOOLS.filter((t) => t.category === category);

// Body-image tools stay reachable from /tools but are never promoted (home showcase, related links).
const NOT_PROMOTED = new Set(["cinderella-taijuu", "supe-keisan"]);
export const promotedIn = (category: ToolMeta["category"]) => toolsIn(category).filter((t) => !NOT_PROMOTED.has(t.slug));
