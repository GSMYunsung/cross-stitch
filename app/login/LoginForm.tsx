"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../src/hooks/useAuth";
import Image from "next/image";
export default function GithubButton() {
  const { githubLogin } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-white bg-[#0f1419] rounded-lg hover:bg-[#0f1419]/90 focus:ring-4 focus:outline-none focus:ring-[#0f1419]/50 box-border border border-transparent font-medium leading-5 rounded-base text-sm px-4 py-2.5 text-center inline-flex items-center dark:hover:bg-[#24292F] dark:focus:ring-[#24292F]/55"
      onClick={async (e) => {
        const isLogin = await githubLogin();

        if (isLogin) router.push("/home");

        e.preventDefault();
      }}
    >
      <Image
        src="/github.svg"
        className="mr-2"
        alt="GitHub Logo"
        width={24}
        height={24}
      />
      Sign in with Github
    </button>
  );
}
