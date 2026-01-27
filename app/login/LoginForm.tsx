"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../src/hooks/useAuth";

export default function GithubButton() {
  const { githubLogin } = useAuth();
  const router = useRouter();

  return (
    <button
      onClick={async (e) => {
        const isLogin = await githubLogin();

        if (isLogin) router.push("/home");

        e.preventDefault();
      }}
      className="bg-zinc-800 text-white p-2"
    >
      Github 로그인
    </button>
  );
}
