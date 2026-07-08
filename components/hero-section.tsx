"use client";
import useAppContext from "@/libs/hooks/use-app-context";
import { loadHistory } from "@/libs/utils";
import { ArrowRight, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const {
    handleSubmit,
    state: { url },
    stateSetters: { setUrl, setError },
  } = useAppContext();
  const router = useRouter();
  const [topUrls, setTopUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory(1, "most-searched", 5)
      .then((history) => {
        const urls = history?.data?.map((item) => item.url);
        setTopUrls(urls || []);
      })
      .catch((error) =>
        setError(
          error instanceof Error ? error.message : "Failed to load examples",
        ),
      )
      .finally(() => setLoading(false));
  }, [setError]);

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(decodeURIComponent(exampleUrl));
  };

  return (
    <section className="min-h-screen grid place-items-center px-9 py-6">
      <div className="space-y-6">
        <header className="space-y-6">
          <h1 className="font-semibold md:text-5xl text-4xl  text-accent text-center">
            Analyze any landing page with AI
          </h1>
          <p className="text-center text-accent-light text-base">
            Extract company info, business model, key features, and competitors
            from any website—instantly.
          </p>
        </header>
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
              aria-label="Website URL to analyze"
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            className="flex whitespace-nowrap disabled:opacity-50 items-center gap-2 justify-center bg-accent-mid w-fit flex-1 py-4 px-8 text-sm text-white rounded-lg"
            disabled={!url}
          >
            Analyze this site <ArrowRight />{" "}
          </button>
        </form>
        <div className="flex flex-col items-center gap-3">
          <p className="text-accent-light text-sm">Try these websites:</p>
          {loading ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {topUrls.map((exampleUrl) => (
                <button
                  key={exampleUrl}
                  type="button"
                  onClick={() => handleExampleClick(exampleUrl)}
                  className="px-4 py-2 text-sm text-accent-mid border border-[#C6C6CD] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {decodeURIComponent(exampleUrl).replace("https://", "")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
