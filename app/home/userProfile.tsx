"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

// TODO: 타입 지정 및 로직 최적화 필요

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [commitCount, SetCommitCount] = useState<any | null>(null);

  useEffect(() => {
    // 유저 상태가 변경될 때마다 실행되는 리스너
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const currentUser = auth.currentUser;

        // 로그인 성공 시 유저 정보 저장
        setUser(currentUser);

        const getCommitCount = async () => {
          try {
            // 1. 유저 정보 가져오기
            const userRes = await fetch("/api/github/user");
            const userData = await userRes.json();

            if (!userData.login) throw new Error("User not found");

            // 2. 해당 유저의 커밋 정보 가져오기
            const commitRes = await fetch(
              `/api/github/commits?username=${userData.login}`,
            );
            const commitData = await commitRes.json();

            SetCommitCount(commitData);
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
    <div className="flex">
      <main className="">
        <div>{`사용자 이름: ${user ? user.displayName : ""}`}</div>
        <div>{`사용자 커밋수: ${commitCount ? commitCount.total_count : 0}`}</div>
      </main>
    </div>
  );
}
