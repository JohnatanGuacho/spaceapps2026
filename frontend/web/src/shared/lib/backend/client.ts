// Solo servidor: lo consumen los route handlers de src/app/api.
import { envelope, type ApiEnvelope } from "@/shared/types/api";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export async function pedir<T>(ruta: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const id = crypto.randomUUID();
  try {
    const r = await fetch(`${BASE}${ruta}`, {
      ...init,
      headers: { "content-type": "application/json", "x-request-id": id, ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as ApiEnvelope<T>;
  } catch {
    // Misma forma que una respuesta buena: la UI degrada en vez de reventar.
    return envelope(null as T, {
      data_mode: "model",
      kind: "catalog",
      sources: [],
      alerts: [
        {
          id: "NET-01",
          level: "none",
          message: { es: "Backend no disponible", en: "Backend unavailable" },
          cause: { es: `Fallo de red o HTTP · traza ${id}`, en: `Network or HTTP failure · trace ${id}` },
          sources: [],
        },
      ],
    });
  }
}
