import { adminDb, adminStorage } from "@/app/lib/firebase-admin";
import { generateGridImage, generateResetImage } from "@/app/src/utils/generateGridImage";
import { applyRandomRemovalCells, shouldFullReset } from "@/app/src/utils/gridLogic";
import { NextRequest, NextResponse } from "next/server";
import { GAME_MODE } from "@/app/src/types/crossTitch";

// 개발 환경 전용 — 프로덕션에서는 401 반환
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 401 });
  }

  const { uid, simulatedCurrentCount } = await req.json() as {
    uid: string;
    simulatedCurrentCount: number;
  };

  if (!uid || simulatedCurrentCount === undefined) {
    return NextResponse.json(
      { error: "uid and simulatedCurrentCount are required" },
      { status: 400 },
    );
  }

  const docSnap = await adminDb.collection("grids").doc(uid).get();
  if (!docSnap.exists) {
    return NextResponse.json({ error: `No document found for uid: ${uid}` }, { status: 404 });
  }

  const data = docSnap.data()!;

  if (data.mode !== GAME_MODE.CHALLENGE) {
    return NextResponse.json({ status: "skipped: not challenge mode" });
  }

  const savedCount: number = data.commitCount ?? 0;
  const currentCount = simulatedCurrentCount;
  const diff = savedCount - currentCount;

  interface CheckedCell { r: number; c: number; color: string; }
  let checkedCells: CheckedCell[] = (data.checkedCells ?? []) as CheckedCell[];
  let imageBuffer: Buffer;
  let wasReset = false;

  if (shouldFullReset(savedCount, currentCount)) {
    checkedCells = [];
    imageBuffer = await generateResetImage();
    wasReset = true;
  } else {
    if (diff > 0) {
      checkedCells = applyRandomRemovalCells(checkedCells, diff);
    }
    imageBuffer = await generateGridImage(checkedCells);
  }

  const bucket = adminStorage.bucket();
  const file = bucket.file(`images/${uid}.png`);
  await file.save(imageBuffer, { contentType: "image/png" });

  await adminDb.collection("grids").doc(uid).set(
    {
      checkedCells,
      commitCount: currentCount,
      updatedAt: new Date().toISOString(),
      wasReset,
    },
    { merge: true },
  );

  return NextResponse.json({
    status: wasReset ? "reset" : diff > 0 ? "removed" : "no_change",
    savedCount,
    simulatedCurrentCount: currentCount,
    diff: Math.max(0, diff),
    remainingCells: checkedCells.length,
  });
}
