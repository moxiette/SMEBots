import { BotPage } from "@/components/bot/BotPage";
import { getBotConfig } from "@/lib/bot-configs";

export const metadata = {
  title: "PM Bot. Product Manager Automation | SMEBots",
  description:
    "Turn your product idea into a PRD outline, prioritized user stories, OKRs, launch plan, and stakeholder update. AI-assisted intake. Built for any Product Manager or Founder.",
};

export default function PMBotPage() {
  const config = getBotConfig("pm")!;
  return <BotPage config={config} programLabel="product_name" />;
}
