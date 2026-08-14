import { db } from "./db";
import type { RateMap } from "./pricing";

// Returns the most recent effective rate for every material belonging to a
// company, keyed by materialKey. Used to price NEW quotations. Historical
// quotations never call this again — they read their own frozen snapshot.
export async function getCurrentRates(companyId: string): Promise<RateMap> {
  const materials = await db.material.findMany({
    where: { companyId, archived: false },
    include: {
      rates: {
        orderBy: { effectiveDate: "desc" },
        take: 1,
      },
    },
  });

  const map: RateMap = {};
  for (const material of materials) {
    const latest = material.rates[0];
    if (!latest) continue;
    map[material.materialKey] = {
      rate: latest.rate,
      effectiveDate: latest.effectiveDate.toISOString(),
      unit: material.unit,
    };
  }
  return map;
}

export async function nextQuotationNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.quotation.count({
    where: { companyId, number: { startsWith: `QT-${year}-` } },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `QT-${year}-${seq}`;
}
