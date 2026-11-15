// Frontera única: el backend habla fracción / atm / K; la UI habla % vol / kPa / °C.
// Nada cruza sin pasar por aquí. El flujo NO se convierte: el campo del backend
// ya está en cm/s (flow_cm_s), igual que el motor local.

export const KPA_PER_ATM = 101.325;

export const kpaToAtm = (kpa: number) => kpa / KPA_PER_ATM;
export const atmToKpa = (atm: number) => atm * KPA_PER_ATM;
export const pctToFraction = (pct: number) => pct / 100;
export const fractionToPct = (f: number) => f * 100;
export const celsiusToKelvin = (c: number) => c + 273.15;
export const kelvinToCelsius = (k: number) => k - 273.15;

/** ppO2 en kPa. Se manda junto a presión y fracción: el backend deriva el suyo y se compara. */
export const ppO2Kpa = (pressureKpa: number, o2Pct: number) => pressureKpa * pctToFraction(o2Pct);
