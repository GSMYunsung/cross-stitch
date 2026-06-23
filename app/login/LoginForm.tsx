"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/hooks/useAuth";

export default function GithubButton() {
  const { githubLogin } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100
        active:bg-slate-200 text-[#0d0d12] font-medium text-sm rounded-xl px-4 py-3
        transition-all cursor-pointer shadow-lg shadow-black/20"
      onClick={async (e) => {
        e.preventDefault();
        const isLogin = await githubLogin();
        if (isLogin) router.replace("/home");
      }}
    >
      <Image
        src="/github.svg"
        alt="GitHub Logo"
        width={18}
        height={18}
        className="invert"
      />
      GitHub으로 시작하기
    </button>
  );
}
