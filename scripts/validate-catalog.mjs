import { readFileSync } from "node:fs";

const file = new URL("../content/catalog/backend.json", import.meta.url);
const data = JSON.parse(readFileSync(file, "utf8"));
const skills = data.skills;
const byId = new Map(skills.map((s) => [s.id, s]));
const PHASES = ["foundations", "core", "build", "proof"];
const errors = [];

// Unique ids and basic shape
const seen = new Set();
for (const s of skills) {
  if (seen.has(s.id)) errors.push(`Duplicate id: ${s.id}`);
  seen.add(s.id);
  if (!PHASES.includes(s.phase)) errors.push(`${s.id}: bad phase "${s.phase}"`);
  if (!s.project || s.project.criteria.length < 2) errors.push(`${s.id}: needs a project with 2+ criteria`);
}

// Prerequisites exist, respect phase order, and must-haves never wait on stretch nodes
for (const s of skills) {
  for (const p of s.prereqs) {
    const pre = byId.get(p);
    if (!pre) { errors.push(`${s.id}: unknown prereq "${p}"`); continue; }
    if (p === s.id) errors.push(`${s.id}: depends on itself`);
    if (PHASES.indexOf(pre.phase) > PHASES.indexOf(s.phase)) errors.push(`${s.id}: prereq "${p}" is in a later phase`);
    if (pre.stretch && !s.stretch) errors.push(`${s.id}: must-have depends on stretch node "${p}"`);
  }
}

// Cycles
const state = new Map();
function visit(id, path) {
  if (state.get(id) === 1) { errors.push(`Cycle: ${[...path, id].join(" -> ")}`); return; }
  if (state.get(id) === 2) return;
  state.set(id, 1);
  for (const p of byId.get(id)?.prereqs ?? []) visit(p, [...path, id]);
  state.set(id, 2);
}
for (const s of skills) visit(s.id, []);

// Exactly one proof node, it cannot be marked Known from a CV, and every must-have leads to it
const proofs = skills.filter((s) => s.phase === "proof");
if (proofs.length !== 1) errors.push(`Expected exactly 1 proof node, found ${proofs.length}`);
const proof = proofs[0];
if (proof && proof.synonyms.length > 0) errors.push(`Proof node must have no CV synonyms`);

const dependants = new Map(skills.map((s) => [s.id, []]));
for (const s of skills) for (const p of s.prereqs) dependants.get(p)?.push(s.id);
function reachesProof(id, seenIds = new Set()) {
  if (proof && id === proof.id) return true;
  if (seenIds.has(id)) return false;
  seenIds.add(id);
  return (dependants.get(id) ?? []).some((d) => reachesProof(d, seenIds));
}
for (const s of skills) {
  if (!s.stretch && !reachesProof(s.id)) errors.push(`${s.id}: must-have node never leads to the proof node (orphan)`);
}

if (errors.length) {
  console.error("Catalog has problems:\n- " + errors.join("\n- "));
  process.exit(1);
}

const total = skills.reduce((n, s) => n + s.hours, 0);
const must = skills.filter((s) => !s.stretch).reduce((n, s) => n + s.hours, 0);
console.log(
  `Catalog OK: ${skills.length} skills (${skills.filter((s) => s.stretch).length} stretch), ${total}h total, ${must}h must-have (about ${Math.ceil(must / 10)} weeks at 10h/week).`
);