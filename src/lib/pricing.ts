// SERVER-SIDE PRICING ENGINE. Client input is never trusted for quotation totals.
export type RateMap = Record<string, { rate: number; effectiveDate: string; unit: string }>;
export type MeasurementInput = {
  ref: string; productKey: string; productName: string;
  widthMm: number; heightMm: number; quantity: number;
};
export type ItemBreakdown = {
  ref: string; productName: string; category: string; sizeLabel: string; quantity: number;
  areaSqmPerUnit: number; materialCost: number; glassCost: number; accessoriesCost: number;
  labourCost: number; installationCost: number; totalCost: number; marginPct: number;
  sellingPrice: number; unitSellingPrice: number;
};
export type QuotationCalculation = { items: ItemBreakdown[]; subtotal: number };

const WASTAGE = 1.05;
const FORMULAS: Record<string, (m: MeasurementInput, r: RateMap, margin: number) => ItemBreakdown> = {
  ALU_SLIDING_WINDOW: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_PROFILE","GLASS_5MM","ACCESSORIES_WINDOW",1.0),
  ALU_CASEMENT_WINDOW: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_PROFILE","GLASS_5MM","ACCESSORIES_WINDOW",1.05),
  ALU_DOOR: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_DOOR_PROFILE","GLASS_6MM","ACCESSORIES_DOOR",1.35),
  ALU_SLIDING_DOOR: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_DOOR_PROFILE","GLASS_6MM","ACCESSORIES_DOOR",1.45),
  ALU_SHOP_FRONT: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_SHOP_PROFILE","GLASS_6MM","ACCESSORIES_DOOR",1.2),
  ALU_PARTITION: (m,r,margin) => areaFormula(m,r,margin,"Aluminium","ALU_PARTITION_PROFILE","GLASS_5MM","ACCESSORIES_PARTITION",1.0),
  PVC_WINDOW: (m,r,margin) => areaFormula(m,r,margin,"PVC","PVC_PROFILE","GLASS_5MM","ACCESSORIES_WINDOW",1.0),
  PVC_DOOR: (m,r,margin) => areaFormula(m,r,margin,"PVC","PVC_DOOR_PROFILE","GLASS_5MM","ACCESSORIES_DOOR",1.2),
  SHOWER_DOOR: (m,r,margin) => areaFormula(m,r,margin,"Shower / Glass","SHOWER_PROFILE","TEMPERED_8MM","ACCESSORIES_SHOWER",1.0),
  GLASS_RAILING: (m,r,margin) => areaFormula(m,r,margin,"Shower / Glass","RAILING_PROFILE","TEMPERED_10MM","ACCESSORIES_RAILING",1.0),
};

function areaFormula(m: MeasurementInput, rates: RateMap, marginPct: number, category: string, profileKey: string, glassKey: string, accessoriesKey: string, profileFactor: number): ItemBreakdown {
  const area = (m.widthMm / 1000) * (m.heightMm / 1000);
  const profile = requireRate(rates, profileKey);
  const glass = requireRate(rates, glassKey);
  const accessories = requireRate(rates, accessoriesKey);
  const labour = requireRate(rates, "LABOUR");
  const install = requireRate(rates, "INSTALLATION");
  const materialCost = area * profile * profileFactor * WASTAGE * m.quantity;
  const glassCost = area * glass * m.quantity;
  const accessoriesCost = accessories * m.quantity;
  const labourCost = labour * m.quantity;
  const installationCost = install * m.quantity;
  const totalCost = materialCost + glassCost + accessoriesCost + labourCost + installationCost;
  const sellingPrice = totalCost / (1 - marginPct);
  return {
    ref: m.ref, productName: m.productName, category, sizeLabel: `${m.widthMm} × ${m.heightMm} mm`,
    quantity: m.quantity, areaSqmPerUnit: round(area), materialCost: round(materialCost),
    glassCost: round(glassCost), accessoriesCost: round(accessoriesCost), labourCost: round(labourCost),
    installationCost: round(installationCost), totalCost: round(totalCost), marginPct,
    sellingPrice: round(sellingPrice), unitSellingPrice: round(sellingPrice / m.quantity),
  };
}

function requireRate(rates: RateMap, key: string): number {
  const entry = rates[key];
  if (!entry) throw new PricingError(`Missing price configuration for ${key}. An administrator must add the rate before this item can be quoted.`);
  return entry.rate;
}
export class PricingError extends Error {}
function round(n:number){ return Math.round(n*100)/100; }
export function calculateQuotation(measurements: MeasurementInput[], rates: RateMap, marginPct: number): QuotationCalculation {
  if (!Number.isFinite(marginPct) || marginPct < 0 || marginPct >= 0.9) throw new PricingError("Selling margin must be between 0% and 89%.");
  const items = measurements.map(m => {
    if (!m.ref || !m.productKey || m.widthMm <= 0 || m.heightMm <= 0 || m.quantity <= 0) throw new PricingError(`Invalid measurement ${m.ref || "item"}. Check width, height and quantity.`);
    const formula = FORMULAS[m.productKey];
    if (!formula) throw new PricingError(`No pricing formula is configured for ${m.productName}.`);
    return formula(m,rates,marginPct);
  });
  return { items, subtotal: round(items.reduce((sum,i)=>sum+i.sellingPrice,0)) };
}
