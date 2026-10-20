import { useEffect, useState } from "react";
import type { PassPrediction } from "../types";

interface Query {
  latitude: number;
  longitude: number;
  heightKm: number;
  startMs: number;
  endMs: number;
  minElevation: number;
  satelliteIds?: string[];
}

export function usePasses(query: Query) {
  const [passes, setPasses] = useState<PassPrediction[]>([]);
  const [pending, setPending] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const ids = query.satelliteIds?.join(",") ?? "";

  useEffect(() => {
    const worker = new Worker(new URL("../workers/passes.worker.ts", import.meta.url), { type: "module" });
    setPending(true);
    setPasses([]);
    setCompleted(0);
    setTotal(0);
    worker.onmessage = (event: MessageEvent<{ passes: PassPrediction[]; pending: boolean; completed: number; total: number }>) => {
      setPending(event.data.pending);
      setCompleted(event.data.completed);
      setTotal(event.data.total);
      if (!event.data.pending) setPasses(event.data.passes);
    };
    worker.onerror = () => setPending(false);
    worker.postMessage({ ...query, satelliteIds: ids ? ids.split(",") : undefined });
    return () => worker.terminate();
    // The query object is rebuilt by callers; depend on its fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.latitude, query.longitude, query.heightKm, query.startMs, query.endMs, query.minElevation, ids]);

  return { passes, pending, completed, total };
}
