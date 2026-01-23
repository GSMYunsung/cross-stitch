import GithubButton from "./LoginForm";

export default async function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="">
        <GithubButton />
      </main>
    </div>
  );
}
