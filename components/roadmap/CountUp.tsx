"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, to, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => c.stop();
  }, [to]);
  return <>{v}</>;
}