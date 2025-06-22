import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { incomeSources } from "~/server/db/schema";

export const GET = async () => {
  const x = await db.select().from(incomeSources);
  console.log(x);
  return new NextResponse("Active", { status: 401 });
};
