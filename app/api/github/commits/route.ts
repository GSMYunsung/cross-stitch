import { COMMIT_RANGE } from "@/app/src/constant";
import { getRelativeDate } from "@/app/src/utils/date";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  const committerDate = getRelativeDate(new Date(), -COMMIT_RANGE)
    .toISOString()
    .split("T")[0];

  if (!username) {
    return NextResponse.json({ error: "username missing" }, { status: 400 });
  }

  try {
    const userData = await fetch(
      `https://api.github.com/search/commits?q=author:${username}+committer-date:>${committerDate}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      },
    );
    const responeData = await userData.json();

    return NextResponse.json(responeData, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: `sever error / ${e}` }, { status: 500 });
  }
}
