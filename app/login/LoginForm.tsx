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
      className="w-full flex items-center justify-center gap-3 cursor-pointer transition-all font-label text-[11px]"
      style={{
        background: "#1A1A1A",
        color: "#FFFFFF",
        border: "1.5px solid #1A1A1A",
        padding: "14px 20px",
        boxShadow: "3px 3px 0 #C41E3A",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#333333";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 #C41E3A";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #C41E3A";
      }}
      onClick={async (e) => {
        e.preventDefault();
        const isLogin = await githubLogin();
        if (isLogin) router.replace("/home");
      }}
    >
      <Image src="/github.svg" alt="GitHub Logo" width={16} height={16} className="invert" />
      GITHUB으로 시작하기
    </button>
  );
}
