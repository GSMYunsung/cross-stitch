import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Token not found" }, { status: 401 });
  }

  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ message: "username is required" }, { status: 400 });
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [prRes, issueRes] = await Promise.all([
      fetch(
        `https://api.github.com/search/issues?q=type:pr+author:${username}&per_page=1`,
        { headers },
      ),
      fetch(
        `https://api.github.com/search/issues?q=type:issue+author:${username}&per_page=1`,
        { headers },
      ),
    ]);

    const [prData, issueData] = await Promise.all([prRes.json(), issueRes.json()]);

    return NextResponse.json(
      {
        prs: prData.total_count ?? 0,
        issues: issueData.total_count ?? 0,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json({ error: `server error / ${e}` }, { status: 500 });
  }
}
