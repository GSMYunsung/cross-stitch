// 기능명세

// 1. 깃허브 로그인 v
// 2. 깃허브 커밋수 가져올 수 있게 v
// 3. 커밋수에 따라 해당 사용자가 십자수 박을 수 있게 - 커밋수 관련 개수 어떻게 적용시킬것인가? (고민중)
// 4. 박은 십자수를 svg 형식으로 바꾼 후 링크 부여 v
// 5. 해당 링크를 리드미에 박으면 내가 쓴 십자수가 만들어짐 v

// if 십자수를 이전에 박은적 있다면 그걸 가져오게 만들어야함
// 전체 디자인 새로 v
// 로그인했을때 뒤로가기 막기 / 이미 사용자 정보가 있다면 로그인페이지가도 메인페이지로
// 사용자 십자수 아무것도 안눌렀을때 버튼 비활성화 v
// 각종 모달 설명 추가

//Cloud Functions 사용해 배치서버 만들기

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="">
        <div></div>
      </main>
    </div>
  );
}
