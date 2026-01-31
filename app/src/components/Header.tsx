"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useAuthInfo } from "../providers/AuthProvider";

export default function Header() {
  const { user, commitInfo, authInfoReset } = useAuthInfo();
  const { githubogout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <header className="flex justify-between p-4 border-b items-center">
      <h1>Git Cross Stitch</h1>
      <div>{`사용자 이름: ${user ? user.displayName : ""}`}</div>
      <div>{`사용자 커밋수: ${commitInfo ? commitInfo.total_count : 0}`}</div>
      <button
        className="flex rounded-md px-8 py-2 text-white bg-indigo-600 
      hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer shadow-sm"
        onClick={() => {
          githubogout().then(() => {
            authInfoReset();
            router.push("/login");
          });
        }}
      >
        로그아웃
      </button>
    </header>
  );
}
