import type { SourceRef } from "@/shared/types/api";
import { getSource } from "@/content/sources";
import type { MaterialId } from "@/features/fire/engine/materials";
import type { RefPoint } from "@/features/fire/engine/analysis";

/** Clave canónica del backend por material. `wire` se desdobla. */
export const MATERIAL_KEY: Record<MaterialId, readonly string[]> = {
  sibal: ["SIBAL"],
  pmma: ["PMMA"],
  nomex: ["Nomex"],
  wire: ["Kapton", "Teflon"],
  heptane: ["heptane"],
  methanol: ["methanol"],
};

/** Materiales que solo existen en el backend: hoy no tienen ficha en la UI. */
export const MATERIAL_ALIAS: Record<string, MaterialId | null> = {
  "cotton jersey": "sibal",
  cotton: "sibal",
  propane: null,
  butane: null,
  ethylene: null,
};

/** Identificadores estables (DOI o NTRS) → clave del catálogo. */
const POR_IDENTIFICADOR: Record<string, string> = {
  "10.60555/4qc4-de67": "PSI25",
  "psi-25": "PSI25",
  "psi-69": "PSI69",
  "10.1016/j.proci.2026.106097": "B5",
  "10.1016/j.combustflame.2024.113828": "B8",
  "10.1016/j.combustflame.2017.03.001": "OLSON17",
  "10.1016/j.firesaf.2024.104267": "OLSON24",
  "10.1016/j.firesaf.2025.104625": "LIV26",
  "10.1016/j.firesaf.2026.104719": "RIV26",
  "10.1016/j.combustflame.2018.10.012": "URB19",
  "10.1016/j.combustflame.2021.01.035": "BRE21",
  "10.1016/j.firesaf.2017.03.072": "B19",
  "10.1016/j.proci.2018.05.055": "THOM19",
  "10.1016/j.firesaf.2018.04.004": "B13",
  "20240002981": "B2",
  "20170008805": "B10",
  "20130000422": "B11",
  "20080012612": "B12",
  "20230013826": "B14",
  "20070031686": "B15",
  "20120018019": "B16",
  "20040161262": "B17",
  "20040053582": "B18",
  "20260001542": "B20",
  "20250006779": "B6",
  "20240015307": "B7",
  "20210022403": "B4",
  "20210021781": "B3",
  "20220015583": "ACME22",
  "20150023456": "FLEX15",
  "20250010653": "LUCI",
  "20240007713": "SMAC",
};

/** Normaliza cualquier referencia del backend a `SourceRef`; null si no se reconoce. */
export function toSourceRef(raw: string): SourceRef | null {
  const limpio = raw.trim();
  const directo = getSource(limpio.toUpperCase());
  if (directo) return { id: directo.id };
  const porId = POR_IDENTIFICADOR[limpio.toLowerCase()];
  if (porId) return { id: porId };
  const psi = /^psi[-_ ]?(\d{2,3})$/i.exec(limpio);
  if (psi) {
    const clave = POR_IDENTIFICADOR[`psi-${Number(psi[1])}`];
    if (clave) return { id: clave };
  }
  return null;
}

/** Descarta lo irreconocible en vez de romper el render; deja rastro en consola. */
export function toSourceRefs(raw: readonly string[]): SourceRef[] {
  const out: SourceRef[] = [];
  for (const r of raw) {
    const ref = toSourceRef(r);
    if (ref) out.push(ref);
    else if (process.env.NODE_ENV !== "production") console.warn("fuente sin mapear:", r);
  }
  return out;
}

const PANEL_G: Record<RefPoint["panel"], string> = { micro: "0", moon: "0.166", earth: "1" };

/** Consulta con la que se resuelve un punto de referencia a una medición del backend. */
export const refPointQuery = (p: RefPoint): string => {
  const materialKey = MATERIAL_KEY[p.mat]?.[0] ?? "";

  return new URLSearchParams({
    material_key: materialKey,
    gravity: PANEL_G[p.panel],
    flow_cm_s: String(p.u),
    o2_pct: String(p.o2),
    pressure_kpa: String(p.p),
  }).toString();
};
