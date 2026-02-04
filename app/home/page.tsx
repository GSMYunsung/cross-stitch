import BackPressHandler from "../src/components/BackPressHandler";
import { StitchProvider } from "../src/providers/StitchProvider";
import CrossStitchEditor from "./_components/CrossStitchEditor";

export default async function Page() {
  return (
    <StitchProvider>
      <div className="flex flex-auto items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <CrossStitchEditor />
      </div>
      <BackPressHandler />
    </StitchProvider>
  );
}
