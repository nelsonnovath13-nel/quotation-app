// Pricing engine — SERVER-SIDE ONLY. Never trust a price computed on the
// client; this module is the single source of truth and is what gets
// snapshotted into QuotationPriceSnapshot at generation time.

export type RateMap = Record<
  string,
  { rate: number; effectiveDate: string; unit: string }
>;

export type MeasurementInput = {
  ref: string;
  productKey: string;
  productName: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
};

export type ItemBreakdown = {
  ref: string;
  productName: string;
  sizeLabel: string;
  quantity: number;
  areaSqmPerUnit: number;
  materialCost: number;
  glassCost: number;
  accessoriesCost: number;
  labourCost: number;
  installationCost: number;
  totalCost: number;
  marginPct: number;
  sellingPrice: number; // total for this line (all units)
  unitSellingPrice: number;
};

export type QuotationCalculation = {
  items: ItemBreakdown[];
  subtotal: number;
};

const WASTAGE_FACTOR = 1.05; // 5% material wastage allowance

// Registry of supported product formulas. Add new productKeys here as the
// product catalog grows — this is the extension point referenced in the
// architecture notes.
const FORMULAS: Record<
  string,
  (m: MeasurementInput, rates: RateMap, marginPct: number) => ItemBreakdown
> = {
  ALU_SLIDING_WINDOW: (m, rates, marginPct) => {
    const profileRate = requireRate(rates, "ALU_PROFILE");
    const glassRate = requireRate(rates, "GLASS_5MM");
    const accessoriesRate = requireRate(rates, "ACCESSORIES_WINDOW");
    const labourRate = requireRate(rates, "LABOUR");
    const installRate = requireRate(rates, "INSTALLATION");

    const areaSqm = (m.widthMm / 1000) * (m.heightMm / 1000);
    const materialCost = areaSqm * profileRate * WASTAGE_FACTOR * m.quantity;
    const glassCost = areaSqm * glassRate * m.quantity;
    const accessoriesCost = accessoriesRate * m.quantity;
    const labourCost = labourRate * m.quantity;
    const installationCost = installRate * m.quantity;
    const totalCost =
      materialCost + glassCost + accessoriesCost + labourCost + installationCost;
    const sellingPrice = totalCost / (1 - marginPct);

    return {
      ref: m.ref,
      productName: m.productName,
      sizeLabel: `${m.widthMm} × ${m.heightMm} mm`,
      quantity: m.quantity,
      areaSqmPerUnit: round(areaSqm),
      materialCost: round(materialCost),
      glassCost: round(glassCost),
      accessoriesCost: round(accessoriesCost),
      labourCost: round(labourCost),
      installationCost: round(installationCost),
      totalCost: round(totalCost),
      marginPct,
      sellingPrice: round(sellingPrice),
      unitSellingPrice: round(sellingPrice / m.quantity),
    };
  },
};

function requireRate(rates: RateMap, key: string): number {
  const entry = rates[key];
  if (!entry) {
    throw new PricingError(
      `We couldn't calculate this item because the "${key}" rate is missing. Please contact the administrator or update the material rate.`
    );
  }
  return entry.rate;
}

export class PricingError extends Error {}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateQuotation(
  measurements: MeasurementInput[],
  rates: RateMap,
  marginPct: number
): QuotationCalculation {
  const items = measurements.map((m) => {
    const formula = FORMULAS[m.productKey];
    if (!formula) {
      throw new PricingError(
        `We don't have a price formula configured for "${m.productName}" yet. Please contact the administrator.`
      );
    }
    return formula(m, rates, marginPct);
  });

  const subtotal = round(items.reduce((sum, i) => sum + i.sellingPrice, 0));

  return { items, subtotal };
}
