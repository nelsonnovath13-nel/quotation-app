import { db } from "./db";

// This core slice ships without an auth flow (see README "What's not built
// yet"). Every query goes through this function so that swapping it for a
// real session lookup later is a one-line change everywhere it's used —
// the rest of the app never queries Company directly.
export async function getCurrentCompany() {
  const company = await db.company.findFirst({ orderBy: { createdAt: "asc" } });
  if (!company) {
    throw new Error(
      "No company found. Run `npm run db:seed` to create the demo company first."
    );
  }
  return company;
}
