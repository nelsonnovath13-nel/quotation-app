import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotationPdf } from "@/components/pdf/quotation-pdf";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const quotation = await db.quotation.findUnique({
    where: { id: params.id },
    include: { company: true, customer: true, project: true, items: { orderBy: { ref: "asc" } } },
  });

  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <QuotationPdf
      company={quotation.company}
      quotation={quotation}
      customer={quotation.customer}
      project={quotation.project}
      items={quotation.items}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.number}.pdf"`,
    },
  });
}
