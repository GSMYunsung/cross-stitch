// 기능명세

// 1. 깃허브 로그인
// 2. 깃허브 커밋수 가져올 수 있게
// 3. 커밋수에 따라 해당 사용자가 십자수 박을 수 있게
// 4. 박은 십자수를 svg 형식으로 바꾼 후 링크 부여
// 5. 해당 링크를 리드미에 박으면 내가 쓴 십자수가 만들어짐

// if 십자수를 이전에 박은적 있다면 그걸 가져오게 만들어야함

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="">
        <div></div>
      </main>
    </div>
  );
}
