import type { Metadata } from "next";
import KnowledgeBaseHub from "@/app/components/sections/KnowledgeBaseHub";

export const metadata: Metadata = {
  title: "Knowledge Base | BalloAds",
  description:
    "Short, practical guides to the BalloAds features that make your campaigns work harder: personalising every message with the @ function, growing your audience, scheduling, and reading your results.",
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseHub />;
}
