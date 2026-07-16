"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useAuthInfo } from "../providers/AuthProvider";
import { MODE_MAP } from "../config/modes";
import { isHeaderVisible } from "../utils/homeState";

/**
 * Renders the authenticated user's application header.
 *
 * @returns The header interface for authenticated users, or `null` on the login route or without a user.
 */
export default function Header() {
  const { user, commitInfo, savedGridData, authInfoReset, effectiveCommitCount } = useAuthInfo();
  const { githubogout } = useAuth();
  const router = useRouter();

  const pathname = usePathname();
  if (!isHeaderVisible(user, pathname)) return null;

  const currentMode = savedGridData?.mode;
  const modeCfg = (currentMode && MODE_MAP[currentMode]) ?? null;
  const commitCount = commitInfo?.total_count ?? 0;

  // 월간 커밋 도트 (10칸, 각 1커밋 = 1칸, 10개 초과 시 +N 표시)
  const DOT_COUNT = 10;
  const streakDots = Array.from({ length: DOT_COUNT }, (_, i) => i < Math.min(commitCount, DOT_COUNT));
  const extraCommits = commitCount > DOT_COUNT ? commitCount - DOT_COUNT : 0;

  return (
    <header
      className="flex items-center justify-between px-5 py-3 sticky top-0 z-50"
      style={{ background: "#F5EEE6", borderBottom: "2px solid #1A1A1A" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10"
          style={{ background: "#C41E3A", borderRadius: 4 }}
        >
          <span
            className="text-white font-black text-lg"
            style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
          >
            S
          </span>
        </div>

        <div>
          <div className="font-pixel" style={{ color: "#1A1A1A" }}>
            STITCH.COMMIT
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {modeCfg && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5"
                style={{
                  background: "#1A1A1A",
                  color: "#FFFFFF",
                  borderRadius: 3,
                  fontFamily: "var(--font-space-mono, monospace)",
                }}
              >
                {modeCfg.label.ko}
                {modeCfg.flags.hasCommitLimit && (
                  <span style={{ color: "#FF6B6B" }}>✕</span>
                )}
              </span>
            )}
            {modeCfg?.flags.hasCommitLimit && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5"
                style={{
                  background: modeCfg.label.color,
                  color: "#FFFFFF",
                  borderRadius: 3,
                  fontFamily: "var(--font-space-mono, monospace)",
                }}
              >
                {effectiveCommitCount} COMMITS
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* MONTHLY — 커밋 한도가 있는 모드에서만 표시 */}
        {modeCfg?.flags.hasCommitLimit && (
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span
              className="font-label text-[10px]"
              style={{ color: "#7A7A7A" }}
            >
              MONTHLY
            </span>
            <div className="flex items-center gap-1">
              {streakDots.map((active, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5"
                  style={{
                    background: active ? modeCfg.label.color : "#D5CFC7",
                    borderRadius: 2,
                    border: "1px solid #1A1A1A",
                  }}
                />
              ))}
              {extraCommits > 0 && (
                <span className="font-label text-[9px]" style={{ color: modeCfg.label.color }}>
                  +{extraCommits}
                </span>
              )}
            </div>
          </div>
        )}

        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full"
            style={{ border: "2px solid #1A1A1A" }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#D5CFC7", border: "2px solid #1A1A1A" }}
          >
            <span className="text-xs font-black" style={{ color: "#1A1A1A" }}>
              {user.displayName?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
        )}

        <button
          className="font-label text-[10px] px-3 py-1.5 cursor-pointer transition-all"
          style={{
            border: "1.5px solid #1A1A1A",
            background: "transparent",
            color: "#1A1A1A",
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A";
            (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#1A1A1A";
          }}
          onClick={() => {
            githubogout().then(() => {
              authInfoReset();
              router.replace("/login");
            });
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
