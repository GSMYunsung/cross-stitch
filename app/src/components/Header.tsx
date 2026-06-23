"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useAuthInfo } from "../providers/AuthProvider";

export default function Header() {
  const { user, commitInfo, authInfoReset, isFirstWeekBonus, effectiveCommitCount } = useAuthInfo();
  const { githubogout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const commitCount = commitInfo?.total_count ?? 0;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e2a] bg-[#0d0d12]/80 backdrop-blur-sm sticky top-0 z-50">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <span className="text-indigo-400 text-lg">✦</span>
        <span className="text-white font-semibold text-sm tracking-wide">
          CrossStitch
        </span>
      </div>

      {/* 유저 정보 */}
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt="avatar"
            width={28}
            height={28}
            className="rounded-full ring-1 ring-[#2a2a3a]"
          />
        )}
        <span className="text-slate-300 text-sm hidden sm:block">
          {user.displayName}
        </span>

        {/* 보너스 배지 (첫 주, 커밋 0개일 때만) */}
        {isFirstWeekBonus && (
          <div className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-3 py-1">
            <span className="text-indigo-300 text-xs">🎁</span>
            <span className="text-indigo-300 text-xs font-medium">
              보너스 {effectiveCommitCount}칸
            </span>
          </div>
        )}

        {/* 커밋 배지 */}
        <div className="flex items-center gap-1.5 bg-[#13131a] border border-[#1e1e2a] rounded-full px-3 py-1">
          <span className="text-indigo-400 text-xs">●</span>
          <span className="text-slate-300 text-xs font-medium">
            {commitCount}
          </span>
          <span className="text-slate-500 text-xs">커밋</span>
        </div>

        <button
          className="text-xs text-slate-500 hover:text-slate-300 border border-[#2a2a3a] hover:border-[#3a3a4a]
            rounded-lg px-3 py-1.5 transition-all cursor-pointer"
          onClick={() => {
            githubogout().then(() => {
              authInfoReset();
              router.push("/login");
            });
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
