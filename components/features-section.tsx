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
      "Identifies the company or product name from the website content.",
    icon: Building2,
    className: "md:col-span-4",
  },
  {
    title: "summary",
    description:
      "A brief overview of what the company does and their main value proposition.",
    icon: FileText,
    className: "md:col-span-8",
  },
  {
    title: "target customers",
    description: "Who the product or service is designed for based on the site's messaging.",
    icon: UsersRound,
    className: "md:col-span-4",
  },
  {
    title: "business model",
    description:
      "How the company makes money—subscription, marketplace, SaaS, etc.",
    icon: CircleDollarSign,
    className: "md:col-span-4",
  },
  {
    title: "key features",
    description:
      "Main product capabilities and features highlighted on the site.",
    icon: Star,
    className: "md:col-span-4",
  },
  {
    title: "likely competitors",
    description:
      "Similar products or services in the same market space.",
    icon: ArrowLeftRight,
    className: "md:col-span-6",
  },
  {
    title: "confidence note",
    description:
      "What the AI inferred vs. what was explicitly stated on the page.",
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
          Structured insights extracted from any landing page.
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
