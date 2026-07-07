import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-16 px-6">
      <div className="space-y-6">
        <h2 className="text-[#1B1B1C] text-4xl text-center font-semibold">
          Ready to start?
        </h2>
        <Link
          href={"/analysis"}
          className="py-4 bg-[#6B7280] px-10 rounded-lg m-auto w-fit block text-white text-sm uppercase"
        >
          Launch Analyzer
        </Link>
      </div>
    </footer>
  );
}
