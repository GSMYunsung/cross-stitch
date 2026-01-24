"use client";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GithubButton() {
  const router = useRouter();
  return (
    <button
      onClick={(e) => {
        const provider = new GithubAuthProvider();

        // login/page.js
        signInWithPopup(auth, provider)
          .then(async (result) => {
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
              //httpOnly 쿠키를 설정
              const res = await fetch("/api/github/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });

              if (res.ok) {
                router.push("/home");
              }
            }
          })
          .catch((error) => {
            // TODO: 에러처리
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GithubAuthProvider.credentialFromError(error);
            // ...
          });

        e.preventDefault();
      }}
      className="bg-zinc-800 text-white p-2"
    >
      Github 로그인
    </button>
  );
}
