import catalog from "@/content/catalog/backend.json";
import type { PathSuggestion } from "@/lib/contract";

// Mock aspirant results. Only the first path exists in the catalog today.
export const mockPaths: PathSuggestion[] = [
  {
    roleId: catalog.roleId,
    title: catalog.roleTitle,
    fit: 88,
    why: "You like building things that work behind the scenes, and this path turns that into a job.",
  },
  {
    roleId: "frontend-engineer",
    title: "Frontend Engineer",
    fit: 64,
    why: "Good if you care most about how things look and feel.",
  },
  {
    roleId: "data-analyst",
    title: "Data Analyst",
    fit: 51,
    why: "Fits if you enjoy finding patterns in numbers.",
  },
];