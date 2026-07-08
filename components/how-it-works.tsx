import { BrainCircuit, ChartNetwork, Link2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-[#F6F3F4] space-y-16">
      <header className="space-y-2">
        {" "}
        <h2 className="text-3xl md:text-4xl font-semibold text-[#1B1B1C] text-center">
          How it works
        </h2>
        <p className="text-[#4a474c] text-center text-sm">Three simple steps</p>
      </header>
      <ul className="flex flex-col gap-10 md:flex-row">
        {[
          {
            icon: Link2,
            title: "Paste URL",
            desc: "Enter any landing page URL",
          },
          {
            icon: BrainCircuit,
            title: "AI analyzes",
            desc: "AI extracts and structures the content",
          },
          {
            icon: ChartNetwork,
            title: "Get insights",
            desc: "View organized business intelligence",
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={index} className="flex-1">
              <article className="space-y-6 border border-[#C5C6CC] rounded-xl p-4">
                <div className="p-6 bg-white w-fit rounded-full border mx-auto  border-[#C5C6CC]">
                  <Icon size={20} color="#C5C6CC" />
                </div>
                <div className="text-center">
                  <h3 className="text-[#1B1B1C] font-semibold text-xl">
                    {item.title}
                  </h3>
                  <p className="text-[#45474C] text-sm">{item.desc}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
