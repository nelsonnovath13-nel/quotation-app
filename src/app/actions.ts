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
  const customer = await db.customer.create({ data: {
    companyId: company.id, fullName, phone, whatsapp: str(formData.get("whatsapp")),
    email: str(formData.get("email")), address: str(formData.get("address")),
    city: str(formData.get("city")), projectLocation: str(formData.get("projectLocation")), notes: str(formData.get("notes")),
  }});
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const customerId = String(formData.get("customerId") || "");
  const name = String(formData.get("name") || "").trim();
  const company = await getCurrentCompany();
  if (!name || !customerId) return { error: "Customer and project name are required." };
  const customer = await db.customer.findFirst({ where: { id: customerId, companyId: company.id } });
  if (!customer) return { error: "Customer not found." };
  const project = await db.project.create({ data: {
    companyId: company.id, customerId, name, projectType: str(formData.get("projectType")) ?? "Mixed fabrication",
    location: str(formData.get("location")), description: str(formData.get("description")), status: "NEW",
  }});
  revalidatePath(`/customers/${customerId}`);
  redirect(`/projects/${project.id}`);
}

const ALLOWED_PRODUCTS: Record<string,{name:string;category:string}> = {
  ALU_SLIDING_WINDOW:{name:"Aluminium Sliding Window",category:"Aluminium"},
  ALU_CASEMENT_WINDOW:{name:"Aluminium Casement Window",category:"Aluminium"},
  ALU_DOOR:{name:"Aluminium Door",category:"Aluminium"},
  ALU_SLIDING_DOOR:{name:"Aluminium Sliding Door",category:"Aluminium"},
  ALU_SHOP_FRONT:{name:"Aluminium Shop Front",category:"Aluminium"},
  ALU_PARTITION:{name:"Aluminium Partition",category:"Aluminium"},
  PVC_WINDOW:{name:"PVC Window",category:"PVC"},
  PVC_DOOR:{name:"PVC Door",category:"PVC"},
  SHOWER_DOOR:{name:"Shower Door",category:"Shower / Glass"},
  GLASS_RAILING:{name:"Glass Railing",category:"Shower / Glass"},
};

export async function addMeasurement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const productKey = String(formData.get("productKey") || "");
  const product = ALLOWED_PRODUCTS[productKey];
  const widthMm = Number(formData.get("widthMm"));
  const heightMm = Number(formData.get("heightMm"));
  const quantity = Number(formData.get("quantity"));
  if (!product) return { error: "Select a valid product." };
  if (!Number.isFinite(widthMm) || widthMm <= 0) return { error: "Please enter the width in millimetres." };
  if (!Number.isFinite(heightMm) || heightMm <= 0) return { error: "Please enter the height in millimetres." };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Quantity must be a whole number greater than zero." };
  const project = await db.project.findFirst({ where: { id: projectId }, select: { id:true, companyId:true } });
  if (!project) return { error: "Project not found." };
  const existing = await db.measurementItem.count({ where: { projectId } });
  const prefix = product.category === "Aluminium" ? "A" : product.category === "PVC" ? "P" : "G";
  await db.measurementItem.create({ data: {
    projectId, ref: `${prefix}${String(existing + 1).padStart(2,"0")}`, productKey,
    productName: product.name, widthMm, heightMm, quantity,
    spec: { glass: str(formData.get("glass")) ?? "Standard" }, notes: str(formData.get("notes")),
  }});
  await db.project.update({ where: { id: projectId }, data: { status:"MEASUREMENT" } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMeasurement(measurementId:string, projectId:string){
  await db.measurementItem.deleteMany({ where:{ id:measurementId, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateQuotation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const marginPct = Number(formData.get("marginPct") || 25) / 100;
  const project = await db.project.findUnique({ where:{id:projectId}, include:{measurementItems:true, customer:true} });
  if (!project) return {error:"Project not found."};
  if (project.measurementItems.length === 0) return { error:"Add at least one measurement before generating a quotation." };
  const company = await getCurrentCompany();
  const rates = await getCurrentRates(company.id);
  let calc;
  try { calc = calculateQuotation(project.measurementItems.map(m=>({ref:m.ref,productKey:m.productKey,productName:m.productName,widthMm:m.widthMm,heightMm:m.heightMm,quantity:m.quantity})),rates,marginPct); }
  catch(e){ if(e instanceof PricingError) return {error:e.message}; throw e; }
  const number = await nextQuotationNumber(company.id);
  const validUntil = new Date(); validUntil.setDate(validUntil.getDate()+company.quotationValidityDays);
  const quotation = await db.quotation.create({ data:{
    companyId:company.id, customerId:project.customerId, projectId:project.id, number, status:"DRAFT", currency:company.currency,
    subtotal:calc.subtotal, total:calc.subtotal, validUntil,
    items:{create:calc.items.map(i=>({ref:i.ref,category:i.category,productKey:project.measurementItems.find(m=>m.ref===i.ref)?.productKey ?? null,description:i.productName,size:i.sizeLabel,quantity:i.quantity,unit:"piece",unitPrice:i.unitSellingPrice,amount:i.sellingPrice}))},
    snapshot:{create:{ratesUsed:rates,breakdown:calc.items,marginPct}},
  }});
  await db.project.update({where:{id:projectId},data:{status:"QUOTATION"}});
  revalidatePath(`/projects/${projectId}`); revalidatePath("/quotations");
  redirect(`/quotations/${quotation.id}`);
}

export async function markQuotationStatus(quotationId: string, status: string) {
  const allowed = ["DRAFT","SENT","FOLLOW_UP","NEGOTIATING","APPROVED","REJECTED","EXPIRED","CANCELLED"] as const;
  if(!allowed.includes(status as typeof allowed[number])) throw new Error("Invalid quotation status");
  await db.quotation.update({where:{id:quotationId},data:{status:status as never}});
  revalidatePath(`/quotations/${quotationId}`); revalidatePath("/quotations"); revalidatePath("/");
}

function str(v: FormDataEntryValue | null): string | undefined { const s=String(v??"").trim(); return s.length?s:undefined; }
