import { getAuth, signOut } from "firebase/auth";

export const useAuth = () => {
  const auth = getAuth();

  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        console.log("잘됨?");
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return { logout, user: auth.currentUser };
};
