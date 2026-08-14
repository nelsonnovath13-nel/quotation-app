"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentCompany } from "@/lib/current-company";
import { calculateQuotation, PricingError } from "@/lib/pricing";
import { getCurrentRates, nextQuotationNumber } from "@/lib/rates";

export type ActionState = { error?: string } | undefined;

export async function createCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const company = await getCurrentCompany();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!fullName) return { error: "Please enter the customer's full name." };
  if (!phone) return { error: "Please enter the customer's phone number." };

  const customer = await db.customer.create({
    data: {
      companyId: company.id,
      fullName,
      phone,
      whatsapp: str(formData.get("whatsapp")),
      email: str(formData.get("email")),
      address: str(formData.get("address")),
      city: str(formData.get("city")),
      projectLocation: str(formData.get("projectLocation")),
      notes: str(formData.get("notes")),
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const customerId = String(formData.get("customerId") || "");
  const name = String(formData.get("name") || "").trim();
  const company = await getCurrentCompany();

  if (!name) return { error: "Please enter a project name." };

  const project = await db.project.create({
    data: {
      companyId: company.id,
      customerId,
      name,
      projectType: str(formData.get("projectType")) ?? "Aluminium",
      location: str(formData.get("location")),
      description: str(formData.get("description")),
      status: "NEW",
    },
  });

  revalidatePath(`/customers/${customerId}`);
  redirect(`/projects/${project.id}`);
}

export async function addMeasurement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const widthMm = Number(formData.get("widthMm"));
  const heightMm = Number(formData.get("heightMm"));
  const quantity = Number(formData.get("quantity"));

  if (!widthMm || widthMm <= 0) return { error: "Please enter the width in millimetres." };
  if (!heightMm || heightMm <= 0) return { error: "Please enter the height in millimetres." };
  if (!quantity || quantity <= 0) return { error: "Please enter how many of this item you need." };

  const existingCount = await db.measurementItem.count({ where: { projectId } });

  await db.measurementItem.create({
    data: {
      projectId,
      ref: `W${String(existingCount + 1).padStart(2, "0")}`,
      productKey: "ALU_SLIDING_WINDOW",
      productName: "Aluminium Sliding Window",
      widthMm,
      heightMm,
      quantity,
      spec: { glass: str(formData.get("glass")) ?? "5mm Clear" },
      notes: str(formData.get("notes")),
    },
  });

  await db.project.update({ where: { id: projectId }, data: { status: "MEASUREMENT" } });

  revalidatePath(`/projects/${projectId}`);
}

// Generates the quotation: recalculates server-side against CURRENT rates,
// then freezes that exact result into a QuotationPriceSnapshot so future
// rate changes can never alter an issued quotation.
export async function generateQuotation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const marginPct = Number(formData.get("marginPct") || 25) / 100;

  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { measurementItems: true },
  });

  if (project.measurementItems.length === 0) {
    return { error: "Add at least one measurement before generating a quotation." };
  }

  const company = await getCurrentCompany();
  const rates = await getCurrentRates(company.id);

  let calc;
  try {
    calc = calculateQuotation(
      project.measurementItems.map((m) => ({
        ref: m.ref,
        productKey: m.productKey,
        productName: m.productName,
        widthMm: m.widthMm,
        heightMm: m.heightMm,
        quantity: m.quantity,
      })),
      rates,
      marginPct
    );
  } catch (e) {
    if (e instanceof PricingError) return { error: e.message };
    throw e;
  }

  const number = await nextQuotationNumber(company.id);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + company.quotationValidityDays);

  const quotation = await db.quotation.create({
    data: {
      companyId: company.id,
      customerId: project.customerId,
      projectId: project.id,
      number,
      status: "DRAFT",
      currency: company.currency,
      subtotal: calc.subtotal,
      total: calc.subtotal,
      validUntil,
      items: {
        create: calc.items.map((i) => ({
          ref: i.ref,
          description: i.productName,
          size: i.sizeLabel,
          quantity: i.quantity,
          unit: "piece",
          unitPrice: i.unitSellingPrice,
          amount: i.sellingPrice,
        })),
      },
      snapshot: {
        create: {
          ratesUsed: rates,
          breakdown: calc.items as unknown as object,
          marginPct,
        },
      },
    },
  });

  await db.project.update({ where: { id: projectId }, data: { status: "QUOTATION" } });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/quotations/${quotation.id}`);
}

export async function markQuotationStatus(quotationId: string, status: string) {
  await db.quotation.update({ where: { id: quotationId }, data: { status: status as never } });
  revalidatePath(`/quotations/${quotationId}`);
}

function str(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}
