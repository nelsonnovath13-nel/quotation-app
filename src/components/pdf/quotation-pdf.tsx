import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/format";

// Uses the built-in Helvetica family so the PDF renders without needing to
// fetch a font file at build time. Swap in Inter via Font.register() with a
// local .ttf if you want exact brand-font parity.
Font.registerHyphenationCallback((word) => [word]);

const COLOR = {
  primary: "#3730a3",
  text: "#1c1917",
  muted: "#78716c",
  border: "#e7e5e4",
  bg: "#fafaf9",
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: COLOR.text, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  companyName: { fontSize: 14, fontWeight: 700, color: COLOR.primary },
  muted: { color: COLOR.muted, fontSize: 9 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 20, fontWeight: 700, color: COLOR.primary, letterSpacing: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, color: COLOR.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { flexDirection: "row", gap: 24, marginBottom: 16 },
  cardCol: { flex: 1 },
  label: { fontSize: 8, color: COLOR.muted, marginBottom: 2 },
  value: { fontSize: 10, marginBottom: 8, fontWeight: 500 },
  table: { borderWidth: 1, borderColor: COLOR.border, borderRadius: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLOR.primary, paddingVertical: 6, paddingHorizontal: 6 },
  tableHeaderCell: { color: "white", fontSize: 8, fontWeight: 700, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: COLOR.border },
  colRef: { width: "8%" },
  colDesc: { width: "34%" },
  colSize: { width: "18%" },
  colQty: { width: "10%", textAlign: "right" },
  colUnitPrice: { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  summaryBox: { marginTop: 12, alignSelf: "flex-end", width: "45%" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  summaryTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, marginTop: 4, borderTopWidth: 2, borderTopColor: COLOR.primary },
  summaryTotalLabel: { fontSize: 11, fontWeight: 700 },
  summaryTotalValue: { fontSize: 13, fontWeight: 700, color: COLOR.primary },
  termsText: { fontSize: 9, color: COLOR.text, lineHeight: 1.5, marginBottom: 4 },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, borderTopWidth: 1, borderTopColor: COLOR.border, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: COLOR.muted },
});

export type QuotationPdfProps = {
  company: {
    name: string;
    brandName: string | null;
    tagline: string | null;
    phone: string;
    whatsapp: string | null;
    email: string;
    address: string;
    website: string | null;
    taxNumber: string | null;
    paymentTerms: string | null;
    warrantyTerms: string | null;
    deliveryTerms: string | null;
  };
  quotation: {
    number: string;
    createdAt: Date;
    validUntil: Date;
    currency: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  customer: { fullName: string; phone: string; address: string | null };
  project: { name: string; location: string | null };
  items: {
    ref: string;
    description: string;
    size: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];
};

function money(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

export function QuotationPdf({ company, quotation, customer, project, items }: QuotationPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow} fixed>
          <View>
            <Text style={styles.companyName}>{company.brandName ?? company.name}</Text>
            {company.tagline && <Text style={styles.muted}>{company.tagline}</Text>}
            <Text style={styles.muted}>{company.address}</Text>
            <Text style={styles.muted}>
              {[company.phone, company.email].filter(Boolean).join("  ·  ")}
            </Text>
            {company.taxNumber && <Text style={styles.muted}>VAT/Tax No: {company.taxNumber}</Text>}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>QUOTATION</Text>
            <Text style={styles.muted}>{quotation.number}</Text>
            <Text style={styles.muted}>Date: {formatDate(quotation.createdAt)}</Text>
            <Text style={styles.muted}>Valid until: {formatDate(quotation.validUntil)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.termsText}>
            Thank you for considering our services. We are pleased to provide this quotation based on the
            requirements and measurements discussed.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardCol}>
            <Text style={styles.sectionTitle}>Prepared For</Text>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customer.fullName}</Text>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{customer.phone}</Text>
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.sectionTitle}>Project</Text>
            <Text style={styles.label}>Project Name</Text>
            <Text style={styles.value}>{project.name}</Text>
            {project.location && (
              <>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{project.location}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quotation Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.tableHeaderCell, styles.colRef]}>Ref</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colSize]}>Size</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>
            {items.map((item) => (
              <View style={styles.tableRow} key={item.ref} wrap={false}>
                <Text style={styles.colRef}>{item.ref}</Text>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colSize}>{item.size}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colUnitPrice}>{money(item.unitPrice, quotation.currency)}</Text>
                <Text style={styles.colAmount}>{money(item.amount, quotation.currency)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text>{money(quotation.subtotal, quotation.currency)}</Text>
            </View>
            {quotation.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Discount</Text>
                <Text>-{money(quotation.discount, quotation.currency)}</Text>
              </View>
            )}
            {quotation.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Tax</Text>
                <Text>{money(quotation.tax, quotation.currency)}</Text>
              </View>
            )}
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>TOTAL</Text>
              <Text style={styles.summaryTotalValue}>{money(quotation.total, quotation.currency)}</Text>
            </View>
          </View>
        </View>

        {(company.paymentTerms || company.warrantyTerms || company.deliveryTerms) && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            {company.paymentTerms && <Text style={styles.termsText}>Payment: {company.paymentTerms}</Text>}
            {company.deliveryTerms && <Text style={styles.termsText}>Delivery: {company.deliveryTerms}</Text>}
            {company.warrantyTerms && <Text style={styles.termsText}>Warranty: {company.warrantyTerms}</Text>}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {[company.brandName ?? company.name, company.phone, company.whatsapp, company.email]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
