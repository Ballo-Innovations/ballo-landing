import type { Metadata } from "next";
import KnowledgeBaseHub from "@/app/components/sections/KnowledgeBaseHub";
import { getKnowledgeBaseHub } from "@/lib/knowledgeBaseApi";

export const metadata: Metadata = {
  title: "Knowledge Base | BalloAds",
  description:
    "Short, practical guides to the BalloAds features that make your campaigns work harder: personalising every message with the @ function, growing your audience, scheduling, and reading your results.",
};

export default async function KnowledgeBasePage() {
  const { groups } = await getKnowledgeBaseHub();
  return <KnowledgeBaseHub groups={groups} />;
}
