import {
  getAuth,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);

  const githubogout = async () => {
    try {
      await signOut(auth).then(() => {
        console.log("잘됨?");
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const githubLogin = async (): Promise<boolean> => {
    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);

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
          return true;
        }
      }

      return false;
    } catch (error) {
      // TODO: 에러처리
      return false;
      // ...
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return { githubLogin, githubogout, user };
};
