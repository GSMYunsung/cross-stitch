import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  try {
    const userData = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/vnd.github.v3+json",
      },
    });
    const responeData = await userData.json();

    return NextResponse.json(responeData, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: `sever error / ${e}` }, { status: 500 });
  }
}
