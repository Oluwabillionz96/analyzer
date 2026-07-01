"use client";
import useAppContext from "@/libs/hooks/use-app-context";
import { ArrowRight, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const {
    handleSubmit,
    state: { url },
    stateSetters: { setUrl },
  } = useAppContext();
  const router = useRouter();

  return (
    <section className="min-h-screen grid place-items-center px-9">
      <div className="space-y-6">
        {" "}
        <h1 className="font-semibold md:text-5xl text-4xl  text-accent text-center">
          Deep website analysis, powered by AI
        </h1>
        <p className="text-center text-accent-light text-base">
          Paste any URL to get instant, structured insights on business model,
          competitors, and more.
        </p>
        <form
          className="flex flex-col md:flex-row gap-4 items-center justify-center"
          onSubmit={(e) => {
            router.push("/analysis");
            handleSubmit(e);
          }}
        >
          <div className="flex-4 relative w-full">
            <Link2 className="absolute bottom-4 left-3 text-accent-light" />
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full text-base py-3.5 pr-4 pl-12 border border-[#C6C6CD] rounded-lg focus:outline-[#C6C6CD] color-accent"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 justify-center bg-accent-mid w-fit flex-1 py-4 px-8 text-sm text-white rounded-lg">
            Analyze this site <ArrowRight />{" "}
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
