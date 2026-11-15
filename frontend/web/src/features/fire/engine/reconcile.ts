"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { assess, type Assessment, type Scenario } from "./analysis";
import { labFromScenario, reconciliar, type LabOutBody } from "@/shared/lib/backend/adapt";
import type { ApiEnvelope } from "@/shared/types/api";

const RETARDO_MS = 400;
const UMBRAL_DELTA = 2;

export type EstadoReconciliacion = "inactivo" | "cargando" | "listo" | "fallo";

export interface Reconciliacion {
  estado: EstadoReconciliacion;
  /** Evaluación del motor local: siempre presente y siempre inmediata. */
  local: Assessment;
  /** Resultado del kernel, o null mientras no llegue. */
  remoto: Assessment | null;
  delta: number | null;
  kernel: string | null;
  /** El desacuerdo supera la banda de precaución. */
  discrepancia: boolean;
}

/**
 * Evalúa en local y reconcilia contra el backend con retardo.
 *
 * El motor local manda para la escena; el backend solo añade una segunda
 * lectura. Nunca se descarta el valor local por uno remoto: se muestran ambos.
 */
export function useReconciliacion(escenario: Scenario, activo = true): Reconciliacion {
  const local = assess(escenario);
  const [remoto, setRemoto] = useState<Assessment | null>(null);
  const [kernel, setKernel] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoReconciliacion>("inactivo");
  const aborto = useRef<AbortController | null>(null);

  const clave = JSON.stringify(escenario);

  useEffect(() => {
    if (!activo) {
      setEstado("inactivo");
      return;
    }
    const t = setTimeout(async () => {
      aborto.current?.abort();
      const ac = new AbortController();
      aborto.current = ac;
      setEstado("cargando");
      try {
        const r = await fetch("/api/lab/simulate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(labFromScenario(escenario)),
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(String(r.status));
        const sobre = (await r.json()) as ApiEnvelope<LabOutBody>;
        const rec = reconciliar(sobre, assess(escenario));
        setRemoto(rec.assessment);
        setKernel(rec.kernel);
        setEstado(sobre.value ? "listo" : "fallo");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setEstado("fallo");
        setRemoto(null);
      }
    }, RETARDO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo]);

  const delta =
    remoto?.margin != null && local.margin != null ? remoto.margin - local.margin : null;

  return {
    estado,
    local,
    remoto,
    delta,
    kernel,
    discrepancia: delta != null && Math.abs(delta) > UMBRAL_DELTA,
  };
}
