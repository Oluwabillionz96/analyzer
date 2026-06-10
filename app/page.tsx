"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        setUrl("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <section className="h-screen grid place-items-center px-6">
      <div className="w-full space-y-6">
        <form
          className="flex w-full justify-center gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
          }}
        >
          <input
            type="url"
            placeholder="Enter Url"
            className="border px-6 py-2 rounded-lg w-3/10 disabled:opacity-50 disabled:cursor-not-allowed"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="border px-4 rounded-lg cursor-pointer bg-gray-500 text-white hover:bg-transparent disabled:hover:cursor-not-allowed disabled:opacity-50 hover:text-black transition-all duration-500"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
        <div className=" w-4/10 mx-auto max-h-60 p-4"></div>
      </div>
    </section>
  );
}
