"use client";
import { auth } from "@/app/lib/firebase";
import { GitHubCommitSearchResponse } from "@/app/src/types/github";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  commitInfo: GitHubCommitSearchResponse | null;
}>({
  user: null,
  commitInfo: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gitHubCommitInfo, SetGitHubCommitInfo] =
    useState<GitHubCommitSearchResponse | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const currentUser = auth.currentUser;

        setUser(currentUser);

        const getCommitCount = async () => {
          try {
            const userRes = await fetch("/api/github/user");
            const userLoginInfo = await userRes.json();

            if (!userLoginInfo.login) throw new Error("User not found");

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
        // 로그아웃 상태면 로그인 페이지로 튕겨내기 (선택사항)
        console.log("로그인이 필요합니다.");
      }
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 해제
  }, []);

  return (
    <AuthContext.Provider value={{ user: user, commitInfo: gitHubCommitInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
