import { adminDb, adminStorage } from "@/app/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const TOTAL_CELLS = 400;
const W = 500;
const H = 215;
const HEADER_H = 34;
const LEFT_W = 181;
const RIGHT_X = LEFT_W + 1;
const RIGHT_W = W - RIGHT_X;
const TOP_H = 111;
const DIVIDER_Y = HEADER_H + TOP_H;
const BAR_X = RIGHT_X + 14;
const BAR_W = RIGHT_W - 28;

function fmt(v: number | string | undefined): string {
  if (v == null) return "—";
  return typeof v === "number" ? v.toLocaleString("en") : v;
}

function generateSVG({
  pixelArtBase64,
  mode,
  commitCount,
  checkedCount,
  githubStats,
  monthLabel,
}: {
  pixelArtBase64: string | null;
  mode: string | undefined;
  commitCount: number;
  checkedCount: number;
  githubStats: { publicRepos?: number; followers?: number; prs?: number; issues?: number } | null;
  monthLabel: string;
}): string {
  const isChallenge = mode === "challenge";
  const progressTotal = isChallenge ? commitCount : TOTAL_CELLS;
  const progressPct = progressTotal > 0 ? Math.min(checkedCount / progressTotal, 1) : 0;
  const barFill = Math.round(progressPct * BAR_W);

  const heroValue = isChallenge ? commitCount : checkedCount;
  const heroLabel = isChallenge ? "THIS MONTH COMMITS" : "CANVAS";
  const heroColor = isChallenge ? "#C41E3A" : "#3B9A3B";
  const heroBg = isChallenge ? "#1A1A1A" : "#FFFFFF";
  const heroTextColor = isChallenge ? "#FFFFFF" : "#1A1A1A";
  const heroSubColor = isChallenge ? "#888888" : "#7A7A7A";
  const progressBg = isChallenge ? "#333333" : "#E8E2DA";
  const headerTitle = isChallenge ? "THIS MONTH" : "MY CANVAS";

  const subText = isChallenge
    ? `${checkedCount}칸 채움 / 한도 ${commitCount}`
    : `${checkedCount}칸 채움 / 전체 ${TOTAL_CELLS}`;

  const imageEl = pixelArtBase64
    ? `<image href="data:image/png;base64,${pixelArtBase64}" x="1" y="${HEADER_H + 1}" width="${LEFT_W - 2}" height="${H - HEADER_H - 2}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  // stat grid positions
  const g1x = RIGHT_X + 14;
  const g2x = RIGHT_X + 14 + Math.floor(RIGHT_W / 2) - 4;
  const gr1y = DIVIDER_Y + 22;
  const gr2y = DIVIDER_Y + 52;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>

  <!-- header -->
  <rect width="${W}" height="${HEADER_H}" fill="#1A1A1A"/>
  <text x="14" y="22" font-family="'Courier New',Courier,monospace" font-size="12" fill="#FFFFFF" font-weight="bold">STITCH.COMMIT</text>
  <text x="${W - 14}" y="22" font-family="'Courier New',Courier,monospace" font-size="10" fill="#888888" text-anchor="end">${headerTitle} · ${monthLabel}</text>

  <!-- left: pixel art -->
  <rect x="0" y="${HEADER_H}" width="${LEFT_W}" height="${H - HEADER_H}" fill="#D5CFC7"/>
  ${imageEl}

  <!-- divider vertical -->
  <line x1="${LEFT_W}" y1="${HEADER_H}" x2="${LEFT_W}" y2="${H}" stroke="#D5CFC7" stroke-width="1"/>

  <!-- right top: main metric -->
  <rect x="${RIGHT_X}" y="${HEADER_H}" width="${RIGHT_W}" height="${TOP_H}" fill="${heroBg}"/>
  <text x="${BAR_X}" y="${HEADER_H + 20}" font-family="'Courier New',Courier,monospace" font-size="10" fill="${heroColor}">${heroLabel}</text>
  <text x="${BAR_X}" y="${HEADER_H + 62}" font-family="'Courier New',Courier,monospace" font-size="42" fill="${heroTextColor}" font-weight="bold">${heroValue}</text>
  <text x="${BAR_X}" y="${HEADER_H + 78}" font-family="'Courier New',Courier,monospace" font-size="9" fill="${heroSubColor}">${subText}</text>

  <!-- progress bar -->
  <rect x="${BAR_X}" y="${HEADER_H + TOP_H - 22}" width="${BAR_W}" height="5" fill="${progressBg}" rx="2"/>
  <rect x="${BAR_X}" y="${HEADER_H + TOP_H - 22}" width="${barFill}" height="5" fill="${heroColor}" rx="2"/>
  <text x="${BAR_X + BAR_W}" y="${HEADER_H + TOP_H - 10}" font-family="'Courier New',Courier,monospace" font-size="9" fill="${heroSubColor}" text-anchor="end">${Math.round(progressPct * 100)}%</text>

  <!-- divider horizontal -->
  <line x1="${RIGHT_X}" y1="${DIVIDER_Y}" x2="${W}" y2="${DIVIDER_Y}" stroke="#D5CFC7" stroke-width="1"/>

  <!-- github stats grid -->
  <text x="${g1x}" y="${gr1y}" font-family="'Courier New',Courier,monospace" font-size="15" fill="#1A1A1A" font-weight="bold">${fmt(githubStats?.publicRepos)}</text>
  <text x="${g1x}" y="${gr1y + 13}" font-family="'Courier New',Courier,monospace" font-size="9" fill="#7A7A7A">REPOS</text>

  <text x="${g2x}" y="${gr1y}" font-family="'Courier New',Courier,monospace" font-size="15" fill="#1A1A1A" font-weight="bold">${fmt(githubStats?.followers)}</text>
  <text x="${g2x}" y="${gr1y + 13}" font-family="'Courier New',Courier,monospace" font-size="9" fill="#7A7A7A">FOLLOWERS</text>

  <text x="${g1x}" y="${gr2y}" font-family="'Courier New',Courier,monospace" font-size="15" fill="#1A1A1A" font-weight="bold">${fmt(githubStats?.prs)}</text>
  <text x="${g1x}" y="${gr2y + 13}" font-family="'Courier New',Courier,monospace" font-size="9" fill="#7A7A7A">PRs</text>

  <text x="${g2x}" y="${gr2y}" font-family="'Courier New',Courier,monospace" font-size="15" fill="#1A1A1A" font-weight="bold">${fmt(githubStats?.issues)}</text>
  <text x="${g2x}" y="${gr2y + 13}" font-family="'Courier New',Courier,monospace" font-size="9" fill="#7A7A7A">ISSUES</text>

  <!-- border -->
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#1A1A1A" stroke-width="2"/>
</svg>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params;

  try {
    const docSnap = await adminDb.collection("grids").doc(uid).get();
    if (!docSnap.exists) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = docSnap.data()!;
    const checkedCells: { r: number; c: number }[] = data.checkedCells ?? [];
    const checkedCount = checkedCells.length;
    const commitCount: number = data.commitCount ?? 0;
    const mode: string | undefined = data.mode;
    const githubStats = data.githubStats ?? null;

    const now = new Date();
    const monthLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Fetch pixel art from Firebase Storage
    let pixelArtBase64: string | null = null;
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(`images/${uid}.png`);
      const [buffer] = await file.download();
      pixelArtBase64 = buffer.toString("base64");
    } catch {
      // No image yet — show empty panel
    }

    const svg = generateSVG({ pixelArtBase64, mode, commitCount, checkedCount, githubStats, monthLabel });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("readme-card error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
