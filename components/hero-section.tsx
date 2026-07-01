"use client";
import useAppContext from "@/libs/hooks/use-app-context";
import { ArrowRight, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

const HeroSection = () => {
  const {
    handleSubmit,
    state: { url },
    stateSetters: { setUrl },
  } = useAppContext();
  const router = useRouter();

  return (
    <section className="min-h-screen grid place-items-center ">
      <div className="space-y-5">
        {" "}
        <h1 className="font-semibold text-5xl text-accent">
          Deep website analysis, powered by AI
        </h1>
        <p className="text-center text-accent-light text-base">
          Paste any URL to get instant, structured insights on business model,
          competitors, and more.
        </p>
        <form
          className="flex gap-4 justify-center"
          onSubmit={(e) => {
            router.push("/analysis");
            handleSubmit(e);
          }}
        >
          <div className="flex-1 relative">
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
          <button className="flex items-center gap-2 bg-accent-mid py-4 px-8 text-sm text-white rounded-lg">
            Analyze this site <ArrowRight />{" "}
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
