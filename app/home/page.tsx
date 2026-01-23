import Link from "next/link";
import { auth } from "../lib/firebase";
import UserProfile from "./userProfile";

export default async function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <UserProfile />
    </div>
  );
}
