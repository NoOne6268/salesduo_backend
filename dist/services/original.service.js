// original.service.ts
import { db } from "../db/index.js";
import { originalData } from "../db/schema.js";
import { eq } from "drizzle-orm";
export async function findOriginalByAsin(asin) {
    const rows = await db.select().from(originalData).where(eq(originalData.asin, asin)).limit(1);
    return rows[0] ?? null;
}
