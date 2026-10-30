import { mockRoadmap } from "@/lib/mocks/roadmap";

export default function DevPage() {
  const r = mockRoadmap;
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{r.roleTitle}</h1>
      <p>
        {r.progress.verified} verified, {r.progress.known} known of {r.progress.total} · {r.weeksLeft} weeks left
      </p>
      <ul>
        {r.nodes.map((n) => (
          <li key={n.id}>
            [{n.phase}] {n.locked ? "🔒" : "•"} {n.title}: {n.status}
            {n.locked ? ` (needs ${n.blockedBy.join(", ")})` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}