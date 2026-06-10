"use client";

import { AnalyzeResponse } from "@/libs/types";
import { ReactNode } from "react";

interface AnalysisCardProps {
  data: AnalyzeResponse | null;
}

export function AnalysisCard({ data }: AnalysisCardProps) {
  if (!data) return null;

  return (
    <div className="border rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold">{data.companyName}</h2>

      <Section label="Summary">
        <p>{data.summary}</p>
      </Section>

      <Section label="Target Customers">
        <TagList items={data.targetCustomers} />
      </Section>

      <Section label="Business Model">
        <p>{data.businessModel}</p>
      </Section>

      <Section label="Key Features">
        <TagList items={data.keyFeatures} />
      </Section>

      <Section label="Likely Competitors">
        <TagList items={data.likelyCompetitors} />
      </Section>

      <p className="text-sm text-gray-400 italic">{data.confidenceNotes}</p>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </h3>
      {children}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="bg-gray-100 rounded-full px-3 py-1 text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
