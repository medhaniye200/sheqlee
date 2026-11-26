import { useEffect, useState } from "react";
import { records } from "../services/recordService";
import { storageKey } from "../services/storageService";

export function useCollection(key) {
  const [snapshot, setSnapshot] = useState(() => records[key].read());
  const refresh = () => setSnapshot(records[key].read());

  useEffect(() => {
    function onStorage(event) {
      if (!event.key || event.key.startsWith(storageKey(""))) setSnapshot(records[key].read());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return { ...snapshot, refresh };
}
