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

interface GitHubStats {
  publicRepos: number;
  followers: number;
  prs: number;
  issues: number;
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };
}

async function getCommitCount(username: string): Promise<number> {
  const since = new Date(Date.now() - COMMIT_RANGE * 24 * 60 * 60 * 1000).toISOString();
  const url = `${GITHUB_API}/search/commits?q=author:${username}+author-date:>${since}&per_page=1`;
  const res = await fetch(url, {
    headers: { ...githubHeaders(), Accept: "application/vnd.github.cloak-preview+json" },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total_count ?? 0;
}

async function getGitHubStats(username: string): Promise<GitHubStats> {
  const h = githubHeaders();
  const [userRes, prRes, issueRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, { headers: h }),
    fetch(`${GITHUB_API}/search/issues?q=type:pr+author:${username}&per_page=1`, { headers: h }),
    fetch(`${GITHUB_API}/search/issues?q=type:issue+author:${username}&per_page=1`, { headers: h }),
  ]);
  const [userData, prData, issueData] = await Promise.all([
    userRes.json(), prRes.json(), issueRes.json(),
  ]);
  return {
    publicRepos: userData.public_repos ?? 0,
    followers: userData.followers ?? 0,
    prs: prData.total_count ?? 0,
    issues: issueData.total_count ?? 0,
  };
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

    try {
      // 모든 유저: GitHub stats 업데이트
      const [githubStats, currentCount] = await Promise.all([
        getGitHubStats(githubUsername),
        getCommitCount(githubUsername),
      ]);

      // 일반 모드: stats만 저장하고 그리드 변경 없음
      if (data.mode !== GAME_MODE.CHALLENGE) {
        await adminDb.collection("grids").doc(uid).set(
          { githubStats, updatedAt: new Date().toISOString() },
          { merge: true },
        );
        results.push({ uid, status: "stats-only" });
        continue;
      }

      // 챌린지 모드: 그리드 업데이트 + stats 저장
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
          githubStats,
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
