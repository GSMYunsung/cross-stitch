"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useAuthInfo } from "../providers/AuthProvider";

export default function Header() {
  const { user, commitInfo, authInfoReset } = useAuthInfo();
  const { logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <header className="flex justify-between p-4 border-b items-center">
      <h1>Git Cross Stitch</h1>
      <div>{`사용자 이름: ${user ? user.displayName : ""}`}</div>
      <div>{`사용자 커밋수: ${commitInfo ? commitInfo.total_count : 0}`}</div>
      <button
        className="flex bg-sky-500 hover:bg-sky-700 rounded-md p-2 cursor-pointer"
        onClick={() => {
          logout().then(() => {
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
