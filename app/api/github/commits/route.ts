import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  //TODO: 날짜 로직 분리 필요
  const d = new Date();

  // 7일을 뺌 (자동으로 월/연도 계산됨)
  d.setDate(d.getDate() - 7);

  // YYYY-MM-DD 형식으로 추출
  const formattedDate = d.toISOString().split("T")[0];

  if (!username) {
    return NextResponse.json({ error: "username missing" }, { status: 400 });
  }

  try {
    const userData = await fetch(
      `https://api.github.com/search/commits?q=author:${username}+committer-date:>${formattedDate}`,
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
