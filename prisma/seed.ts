import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const company = await db.company.create({
    data: {
      name: "Demo Aluminium & Gates Ltd",
      brandName: "Demo Aluminium & Gates",
      phone: "+255 700 000 000",
      whatsapp: "+255 700 000 000",
      email: "info@demoaluminium.test",
      address: "Plot 12, Nyerere Road",
      city: "Dar es Salaam",
      country: "Tanzania",
      currency: "TZS",
      description: "Aluminium, PVC and steel fabrication and installation.",
      tagline: "Precision fabrication, professional finish.",
      quotationValidityDays: 14,
      paymentTerms: "50% deposit to confirm order, balance on completion.",
      warrantyTerms: "12 months warranty on workmanship and hardware.",
      deliveryTerms: "Installation scheduled within 10 working days of deposit.",
    },
  });

  await db.user.createMany({
    data: [
      {
        companyId: company.id,
        name: "Amina Hassan",
        email: "admin@demoaluminium.test",
        role: "ADMIN",
        canSeePricingConfig: true,
      },
      {
        companyId: company.id,
        name: "John Michael",
        email: "employee@demoaluminium.test",
        role: "EMPLOYEE",
        canSeePricingConfig: false,
      },
    ],
  });

  const product = await db.product.create({
    data: {
      companyId: company.id,
      category: "Aluminium",
      name: "Aluminium Sliding Window",
      productKey: "ALU_SLIDING_WINDOW",
      unit: "sqm",
    },
  });

  const materialDefs: { name: string; key: string; unit: string; rate: number }[] = [
    { name: "Aluminium Profile", key: "ALU_PROFILE", unit: "sqm", rate: 85000 },
    { name: "5mm Clear Glass", key: "GLASS_5MM", unit: "sqm", rate: 42000 },
    { name: "Window Accessories Set", key: "ACCESSORIES_WINDOW", unit: "piece", rate: 18000 },
    { name: "Labour", key: "LABOUR", unit: "piece", rate: 15000 },
    { name: "Installation", key: "INSTALLATION", unit: "piece", rate: 20000 },
  ];

  for (const m of materialDefs) {
    await db.material.create({
      data: {
        companyId: company.id,
        name: m.name,
        materialKey: m.key,
        unit: m.unit,
        rates: { create: { rate: m.rate, notes: "Seed rate" } },
      },
    });
  }

  const customer = await db.customer.create({
    data: {
      companyId: company.id,
      fullName: "Grace Mushi",
      phone: "+255 712 345 678",
      whatsapp: "+255 712 345 678",
      email: "grace.mushi@example.test",
      address: "Mikocheni B",
      city: "Dar es Salaam",
      projectLocation: "Mikocheni B, Ground floor residence",
    },
  });

  const project = await db.project.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      name: "Mikocheni Residence Windows",
      projectType: "Aluminium",
      location: "Mikocheni B, Dar es Salaam",
      description: "Sliding windows for 3 rooms, ground floor.",
      status: "MEASUREMENT",
    },
  });

  await db.measurementItem.createMany({
    data: [
      {
        projectId: project.id,
        ref: "W01",
        productKey: "ALU_SLIDING_WINDOW",
        productName: "Aluminium Sliding Window",
        widthMm: 1200,
        heightMm: 1500,
        quantity: 4,
        spec: { glass: "5mm Clear", frame: "Aluminium" },
        notes: "Ground floor",
      },
      {
        projectId: project.id,
        ref: "W02",
        productKey: "ALU_SLIDING_WINDOW",
        productName: "Aluminium Sliding Window",
        widthMm: 900,
        heightMm: 1200,
        quantity: 2,
        spec: { glass: "5mm Clear", frame: "Aluminium" },
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`Company: ${company.name} (${company.id})`);
  console.log(`Project: ${project.name} (${project.id})`);
  console.log("Demo credentials (dev only — do not use in production):");
  console.log("  admin@demoaluminium.test / employee@demoaluminium.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
