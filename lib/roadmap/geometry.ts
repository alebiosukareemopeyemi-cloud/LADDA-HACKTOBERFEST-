export type Point = { x: number; y: number };

const WIDTH = 1200;
const PER_ROW = 4;
const ROW_H = 300;
const PAD_X = 150;
const PAD_Y = 130;

// Stops snake left to right, then right to left, with a gentle wave.
function stopPoints(count: number): Point[] {
  const step = (WIDTH - PAD_X * 2) / (PER_ROW - 1);
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const x = PAD_X + (row % 2 === 0 ? col : PER_ROW - 1 - col) * step;
    pts.push({ x, y: PAD_Y + row * ROW_H + (col % 2 === 0 ? 40 : -40) });
  }
  return pts;
}

// Road points = stops plus a wide turn point at the end of each row.
function roadPoints(stops: Point[]) {
  const pts: Point[] = [];
  const stopIndex: number[] = [];
  stops.forEach((p, i) => {
    stopIndex.push(pts.length);
    pts.push(p);
    const next = stops[i + 1];
    if (next && Math.floor((i + 1) / PER_ROW) !== Math.floor(i / PER_ROW)) {
      const dir = Math.floor(i / PER_ROW) % 2 === 0 ? 1 : -1;
      pts.push({ x: p.x + dir * 100, y: (p.y + next.y) / 2 });
    }
  });
  return { pts, stopIndex };
}

// Smooth curve through the points (Catmull-Rom turned into Bezier curves).
function toPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function roadGeometry(count: number) {
  const stops = stopPoints(count);
  const { pts, stopIndex } = roadPoints(stops);

  // How far along the road each stop sits (0 to 1), used to light the road.
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = cum[cum.length - 1] || 1;
  const fractions = stopIndex.map((k) => cum[k] / total);

  const rows = Math.max(1, Math.ceil(count / PER_ROW));
  return {
    width: WIDTH,
    height: PAD_Y * 2 + (rows - 1) * ROW_H,
    d: toPath(pts),
    stops,
    fractions,
  };
}