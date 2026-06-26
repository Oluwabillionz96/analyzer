"use client";

import { AnalysisResponse, CachedAnalysis } from "@/libs/types";
import HistoryCard from "./history-card";
import { Dispatch, SetStateAction } from "react";

const dummyHistory: CachedAnalysis[] = [
  {
    id: "1",
    companyName: "Acme Corp",
    summary:
      "Acme Corp provides enterprise SaaS solutions for supply chain management using AI-driven predictive analytics.",
    targetCustomers: ["Logistics managers", "Warehouse operators"],
    businessModel: "Subscription-based SaaS with tiered pricing",
    keyFeatures: [
      "Real-time tracking",
      "Predictive analytics",
      "Inventory optimization",
    ],
    likelyCompetitors: ["Flexport", "Project44", "FourKites"],
    confidenceNotes: "Core business model is clear from the website",
    url: "https://acme-corp.com",
    searchcount: 3,
    created_at: "2026-06-24T10:30:00Z",
    updated_at: "2026-06-24T10:30:00Z",
  },
  {
    id: "2",
    companyName: "Nova Health",
    summary:
      "Nova Health is a digital health platform connecting patients with mental health professionals via video consultations.",
    targetCustomers: [
      "Individuals seeking therapy",
      "Employers",
      "Insurance providers",
    ],
    businessModel: "Pay-per-session and enterprise contracts",
    keyFeatures: ["Video therapy", "Messaging", "Progress tracking"],
    likelyCompetitors: ["BetterHelp", "Talkspace", "Ginger"],
    confidenceNotes: "Straightforward B2B2C model clearly described",
    url: "https://nova-health.example.com",
    searchcount: 1,
    created_at: "2026-06-22T14:15:00Z",
    updated_at: "2026-06-22T14:15:00Z",
  },
  {
    id: "3",
    companyName: "Quantum Dev Tools",
    summary:
      "Quantum Dev Tools builds IDE plugins and CLI tools for quantum computing development.",
    targetCustomers: ["Quantum researchers", "DevOps engineers"],
    businessModel: "Freemium with paid pro tier and enterprise licenses",
    keyFeatures: [
      "Quantum simulator",
      "Circuit visualizer",
      "Cloud integration",
    ],
    likelyCompetitors: ["IBM Qiskit", "Google Cirq", "Amazon Braket"],
    confidenceNotes: "Niche market but product focus is very clear",
    url: "https://quantum-dev-tools.io",
    searchcount: 7,
    created_at: "2026-06-20T09:00:00Z",
    updated_at: "2026-06-21T16:45:00Z",
  },
];

export default function HistorySection({
  setAnalysis,
}: {
  setAnalysis: Dispatch<SetStateAction<AnalysisResponse | null>>;
}) {
  const history = dummyHistory;

  return (
    <section className="border-t pt-8 mt-8">
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">History</h2>
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No past analyses yet</p>
            <p className="text-sm">Your analyzed URLs will appear here</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  className="text-left hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const {
                      id,
                      created_at,
                      updated_at,
                      url,
                      searchcount,
                      ...analysis
                    } = item;
                    void id;
                    void created_at;
                    void updated_at;
                    void url;
                    void searchcount;
                    setAnalysis(analysis);
                  }}
                >
                  <HistoryCard data={item} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
