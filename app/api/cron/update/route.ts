import { adminDb, adminStorage } from "@/app/lib/firebase-admin";
import { generateGridImage, generateResetImage } from "@/app/src/utils/generateGridImage";
import { applyRandomRemovalCells, shouldFullReset } from "@/app/src/utils/gridLogic";
import { NextRequest, NextResponse } from "next/server";
import { GAME_MODE } from "@/app/src/types/crossTitch";

const COMMIT_RANGE = 30;
const GITHUB_API = "https://api.github.com";

interface CheckedCell {
  r: number;
  c: number;
  color: string;
}

async function getCommitCount(username: string): Promise<number> {
  const since = new Date(Date.now() - COMMIT_RANGE * 24 * 60 * 60 * 1000).toISOString();
  const url = `${GITHUB_API}/search/commits?q=author:${username}+author-date:>${since}&per_page=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.cloak-preview+json",
    },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total_count ?? 0;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb.collection("grids").get();
  const results: { uid: string; status: string; removed?: number }[] = [];

  for (const docSnap of snapshot.docs) {
    const uid = docSnap.id;
    const data = docSnap.data();
    const githubUsername: string | undefined = data.githubUsername;

    if (!githubUsername) {
      results.push({ uid, status: "skipped: no username" });
      continue;
    }

    if (data.mode !== GAME_MODE.CHALLENGE) {
      results.push({ uid, status: "skipped: not challenge mode" });
      continue;
    }

    try {
      const currentCount = await getCommitCount(githubUsername);
      const savedCount: number = data.commitCount ?? 0;
      const diff = savedCount - currentCount;

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

      results.push({
        uid,
        status: wasReset ? "reset" : "updated",
        removed: wasReset ? savedCount : Math.max(0, diff),
      });
    } catch (err) {
      console.error(`Failed to update uid=${uid}:`, err);
      results.push({ uid, status: "error" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
