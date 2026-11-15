import { NextResponse } from "next/server";
import { z } from "zod";
import { pedir } from "@/shared/lib/backend/client";
import type { LabOutBody } from "@/shared/lib/backend/adapt";

export const maxDuration = 15;

const cuerpo = z.object({
  material: z.string().max(24),
  o2_fraction: z.number().min(0.05).max(1),
  pressure_atm: z.number().gt(0.05).max(3),
  gravity_g: z.number().min(0).max(1.8),
  flow_cm_s: z.number().min(0).max(200).nullable(),
  ignition_w: z.number().min(0).max(500).default(0),
  co2_pct: z.number().min(0).max(60).default(0),
  he_pct: z.number().min(0).max(60).default(0),
  diluent: z.enum(["N2", "CO2", "He"]).default("N2"),
  mode: z.enum(["concurrent", "opposed"]).default("opposed"),
});

export async function POST(req: Request) {
  const crudo = await req.json().catch(() => null);
  const datos = cuerpo.safeParse(crudo);
  if (!datos.success) {
    return NextResponse.json({ error: "cuerpo inválido", detalle: datos.error.issues }, { status: 400 });
  }
  // Siempre 200: un fallo del backend llega como sobre con alerta NET-01.
  const sobre = await pedir<LabOutBody>("/api/lab/simulate", {
    method: "POST",
    body: JSON.stringify(datos.data),
  });
  return NextResponse.json(sobre);
}
