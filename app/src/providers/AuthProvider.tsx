"use client";
import { auth, db } from "@/app/lib/firebase";
import {
  initFirstLogin,
  loadGrid,
  SavedGridData,
} from "@/app/src/hooks/useGridPersistence";
import { GitHubCommitSearchResponse } from "@/app/src/types/github";
import { GameMode } from "@/app/src/types/crossTitch";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  commitInfo: GitHubCommitSearchResponse | null;
  savedGridData: SavedGridData | null;
  isGridLoaded: boolean;
  isNewUser: boolean;
  effectiveCommitCount: number;
  authInfoReset: () => void;
  updateMode: (mode: GameMode) => void;
}>({
  user: null,
  commitInfo: null,
  savedGridData: null,
  isGridLoaded: false,
  isNewUser: false,
  effectiveCommitCount: 0,
  authInfoReset() {},
  updateMode() {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gitHubCommitInfo, setGitHubCommitInfo] =
    useState<GitHubCommitSearchResponse | null>(null);
  const [savedGridData, setSavedGridData] = useState<SavedGridData | null>(null);
  const [isGridLoaded, setIsGridLoaded] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [effectiveCommitCount, setEffectiveCommitCount] = useState(0);
  const router = useRouter();

  const authInfoReset = () => {
    setUser(null);
    setGitHubCommitInfo(null);
    setSavedGridData(null);
    setIsGridLoaded(false);
    setEffectiveCommitCount(0);
  };

  const updateMode = (mode: GameMode) => {
    setSavedGridData((prev) => (prev ? { ...prev, mode } : prev));
    setEffectiveCommitCount(gitHubCommitInfo?.total_count ?? 0);
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

            let gridData = rawGridData;
            const firstLogin = !rawGridData;
            if (!gridData) {
              const firstLoginAt = await initFirstLogin(currentUser.uid);
              gridData = {
                gridState: [],
                commitCount: 0,
                updatedAt: firstLoginAt,
                firstLoginAt,
                wasReset: false,
                mode: undefined,
              };
            }

            const commitData: GitHubCommitSearchResponse = await commitRes.json();

            setGitHubCommitInfo(commitData);
            setSavedGridData(gridData);
            setIsNewUser(firstLogin);
            setEffectiveCommitCount(commitData.total_count);
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
        isNewUser,
        effectiveCommitCount,
        authInfoReset,
        updateMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthInfo = (): React.ContextType<typeof AuthContext> =>
  useContext(AuthContext);
