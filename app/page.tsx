import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { BotShowcase } from "@/components/marketing/BotShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BotShowcase />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
