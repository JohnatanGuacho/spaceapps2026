"use client";
import { l } from "@/content/i18n";
import type { Reconciliacion as R } from "@/features/fire/engine/reconcile";

const NIVEL = {
  high: { es: "alto", en: "high", clase: "text-red-300" },
  caution: { es: "precaución", en: "caution", clase: "text-amber-300" },
  low: { es: "bajo", en: "low", clase: "text-emerald-300" },
  none: { es: "sin dato", en: "no data", clase: "text-zinc-400" },
} as const;

const f1 = (x: number | null) => (x == null ? "—" : x.toFixed(1));

export function PanelReconciliacion({ r }: { r: R }) {
  const nl = NIVEL[r.local.level];
  const nr = r.remoto ? NIVEL[r.remoto.level] : null;
  return (
    <section className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 p-4 text-sm">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-medium text-zinc-200">{l("Reconciliación con el corpus", "Reconciliation against the corpus")}</h3>
        {r.kernel && <span className="text-xs text-zinc-500">kernel {r.kernel}</span>}
      </header>

      <dl className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt className="text-zinc-500">{l("Margen local", "Local margin")}</dt>
          <dd className={`font-mono text-base ${nl.clase}`}>{f1(r.local.margin)} pts</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{l("Margen del kernel", "Kernel margin")}</dt>
          <dd className={`font-mono text-base ${nr ? nr.clase : "text-zinc-600"}`}>
            {r.estado === "cargando" ? "…" : r.remoto ? `${f1(r.remoto.margin)} pts` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{l("Diferencia", "Difference")}</dt>
          <dd className="font-mono text-base text-zinc-300">
            {r.delta == null ? "—" : `${r.delta > 0 ? "+" : ""}${f1(r.delta)}`}
          </dd>
        </div>
      </dl>

      {r.discrepancia && (
        <p className="mt-3 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {l(
            "Los dos modelos no coinciden más allá de la banda de precaución. Se muestra el intervalo local y no se elige ganador.",
            "The two models disagree beyond the caution band. The local interval is shown and no winner is picked.",
          )}
        </p>
      )}

      {r.estado === "fallo" && (
        <p className="mt-3 text-xs text-zinc-500">
          {l("Backend no disponible; solo motor local.", "Backend unavailable; local engine only.")}
        </p>
      )}
    </section>
  );
}
