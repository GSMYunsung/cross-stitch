"use client";
import { auth } from "@/app/lib/firebase";
import { GitHubCommitSearchResponse } from "@/app/src/types/github";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  commitInfo: GitHubCommitSearchResponse | null;
  authInfoReset: () => void;
}>({
  user: null,
  commitInfo: null,
  authInfoReset() {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gitHubCommitInfo, SetGitHubCommitInfo] =
    useState<GitHubCommitSearchResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const currentUser = auth.currentUser;

        setUser(currentUser);

        const getCommitCount = async (retries = 2) => {
          try {
            const userRes = await fetch("/api/github/user");
            const userLoginInfo = await userRes.json();

            if (userRes.status === 401 && retries > 0) {
              console.log(`쿠키 대기 중... 남은 재시도 횟수: ${retries}`);
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
              return getCommitCount(retries - 1); // 재귀 호출
            }

            // 3번시도끝에 쿠키가 없다면 유저의 토큰이 만료되었다는뜻이므로 유저정보 리셋후 로그인화면으로 이동시킴
            if (!userLoginInfo.login) {
              authInfoReset();
              router.push("/login");
              throw new Error("User not found");
            }

            const commitRes = await fetch(
              `/api/github/commits?username=${userLoginInfo.login}`,
            );
            const commitData = await commitRes.json();

            SetGitHubCommitInfo(commitData);
          } catch (error) {
            console.error("데이터 로드 중 에러 발생:", error);
          }
        };

        getCommitCount();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const authInfoReset = () => {
    setUser(null);
    SetGitHubCommitInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user,
        commitInfo: gitHubCommitInfo,
        authInfoReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthInfo = () => useContext(AuthContext);
