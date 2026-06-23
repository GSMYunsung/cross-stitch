"use client";
import { auth, db } from "@/app/lib/firebase";
import {
  initFirstLogin,
  loadGrid,
  SavedGridData,
} from "@/app/src/hooks/useGridPersistence";
import { GitHubCommitSearchResponse } from "@/app/src/types/github";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const FIRST_WEEK_BONUS = 10;
const BONUS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function calcEffectiveCommitCount(
  commitCount: number,
  firstLoginAt: string,
): { effectiveCommitCount: number; isFirstWeekBonus: boolean } {
  if (commitCount > 0) {
    return { effectiveCommitCount: commitCount, isFirstWeekBonus: false };
  }
  const elapsed = Date.now() - new Date(firstLoginAt).getTime();
  const bonusActive = elapsed < BONUS_DURATION_MS;
  return {
    effectiveCommitCount: bonusActive ? FIRST_WEEK_BONUS : 0,
    isFirstWeekBonus: bonusActive,
  };
}

const AuthContext = createContext<{
  user: User | null;
  commitInfo: GitHubCommitSearchResponse | null;
  savedGridData: SavedGridData | null;
  isGridLoaded: boolean;
  effectiveCommitCount: number;
  isFirstWeekBonus: boolean;
  authInfoReset: () => void;
}>({
  user: null,
  commitInfo: null,
  savedGridData: null,
  isGridLoaded: false,
  effectiveCommitCount: 0,
  isFirstWeekBonus: false,
  authInfoReset() {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gitHubCommitInfo, setGitHubCommitInfo] =
    useState<GitHubCommitSearchResponse | null>(null);
  const [savedGridData, setSavedGridData] = useState<SavedGridData | null>(
    null,
  );
  const [isGridLoaded, setIsGridLoaded] = useState(false);
  const [effectiveCommitCount, setEffectiveCommitCount] = useState(0);
  const [isFirstWeekBonus, setIsFirstWeekBonus] = useState(false);
  const router = useRouter();

  const authInfoReset = () => {
    setUser(null);
    setGitHubCommitInfo(null);
    setSavedGridData(null);
    setIsGridLoaded(false);
    setEffectiveCommitCount(0);
    setIsFirstWeekBonus(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(auth.currentUser);

        const initialize = async (retries = 5) => {
          try {
            const userRes = await fetch("/api/github/user");

            if (userRes.status === 401) {
              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 600));
                return initialize(retries - 1);
              }
              authInfoReset();
              router.push("/login");
              return;
            }

            const userLoginInfo = await userRes.json();

            if (!userLoginInfo.login) {
              authInfoReset();
              router.push("/login");
              return;
            }

            const [commitRes, rawGridData] = await Promise.all([
              fetch(`/api/github/commits?username=${userLoginInfo.login}`),
              loadGrid(currentUser.uid),
              setDoc(
                doc(db, "grids", currentUser.uid),
                { githubUsername: userLoginInfo.login },
                { merge: true },
              ),
            ]);

            // 최초 로그인 → firstLoginAt 기록
            let gridData = rawGridData;
            if (!gridData) {
              const firstLoginAt = await initFirstLogin(currentUser.uid);
              gridData = {
                gridState: [],
                commitCount: 0,
                updatedAt: firstLoginAt,
                firstLoginAt,
              };
            }

            const commitData: GitHubCommitSearchResponse =
              await commitRes.json();
            const { effectiveCommitCount, isFirstWeekBonus } =
              calcEffectiveCommitCount(
                commitData.total_count,
                gridData.firstLoginAt,
              );

            setGitHubCommitInfo(commitData);
            setSavedGridData(gridData);
            setEffectiveCommitCount(effectiveCommitCount);
            setIsFirstWeekBonus(isFirstWeekBonus);
            setIsGridLoaded(true);
          } catch (error) {
            console.error("데이터 로드 중 에러 발생:", error);
          }
        };

        initialize();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        commitInfo: gitHubCommitInfo,
        savedGridData,
        isGridLoaded,
        effectiveCommitCount,
        isFirstWeekBonus,
        authInfoReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthInfo = () => useContext(AuthContext);
