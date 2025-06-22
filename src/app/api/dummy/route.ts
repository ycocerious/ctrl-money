import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { incomeSources } from "~/server/db/schema";

export const POST = async () => {
  await db.insert(incomeSources).values({
    name: "Dummy",
  });

  return new NextResponse("Active", { status: 200 });
};
