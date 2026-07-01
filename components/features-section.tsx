import {
  ArrowLeftRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  FileText,
  LucideIcon,
  Star,
  UsersRound,
} from "lucide-react";

const features: {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}[] = [
  {
    title: "company name",
    description:
      "Accurate entity identification and formal branding names extracted from website text.",
    icon: Building2,
    className: "md:col-span-4",
  },
  {
    title: "summary",
    description:
      "A concise, high-level overview of the entire site's purpose, mission, andcurrent market positioning.",
    icon: FileText,
    className: "md:col-span-8",
  },
  {
    title: "target customers",
    description: "ICP profiling and demographic focus Identification.",
    icon: UsersRound,
    className: "md:col-span-4",
  },
  {
    title: "business model",
    description:
      "Identification of revenue streams, pricing strategies, and value proposition mechanics.",
    icon: CircleDollarSign,
    className: "md:col-span-4",
  },
  {
    title: "key features",
    description:
      "Technical and functional capabilities categorizedby priority and user impact.",
    icon: Star,
    className: "md:col-span-4",
  },
  {
    title: "Likely Competitors",
    description:
      "AI-generated market landscape analysisidentifying direct and indirect competitors.",
    icon: ArrowLeftRight,
    className: "md:col-span-6",
  },
  {
    title: "confidence note",
    description:
      "Transparency reports on data accuracy and sourcereliability for every insight.",
    icon: BadgeCheck,
    className: "md:col-span-6",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#f9f9f9] px-8 py-16 space-y-10">
      <header className="space-y-2">
        {" "}
        <h2 className="text-3xl font-semibold text-accent">What you get</h2>
        <p className="text-accent-light text-sm">
          The core metrics extracted from every URL.
        </p>
      </header>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={index}
              className={`space-y-2 bg-white/70 p-6 rounded-xl border border-[#E5E2E3] ${feature.className ?? ""}`}
            >
              <Icon size={20} color="#535A67" />
              <h3 className="font-semibold text-xl text-accent capitalize">
                {feature.title}
              </h3>
              <p className="text-sm text-[#45474C]">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
