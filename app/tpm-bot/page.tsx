import { BotPage } from "@/components/bot/BotPage";
import { getBotConfig } from "@/lib/bot-configs";

export const metadata = {
  title: "TPM Bot. Technical Program Manager Automation | SMEBots",
  description:
    "Turn your program brief into a complete set of deliverables: roadmap, detailed plan, ticket CSV, status report, and email draft. AI-assisted intake. Built for any TPM, PM, or Engineering Manager.",
};

export default function TPMBotPage() {
  const config = getBotConfig("tpm")!;
  return <BotPage config={config} programLabel="program_name" ragLabel="overall_rag" />;
}
