"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Pick a bot",
    body: "Choose the bot that matches your role. TPM Bot for program managers, PM Bot for product managers. Each bot is tuned for that specific role.",
  },
  {
    n: "02",
    title: "Answer focused questions",
    body: "Five to seven short questions about your work. Plain language, in your own words. The bot infers professional structure from light input.",
  },
  {
    n: "03",
    title: "Get polished deliverables",
    body: "Pick the deliverables you want. The bot generates them in seconds. Copy, edit, or download as Word, Excel, CSV, or Markdown.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 px-6 bg-cream-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium text-peach-400 bg-peach-100 px-3 py-1 rounded-full mb-4">
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-900">
            Three steps. Real outputs.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl border-2 border-plum-100 p-8 shadow-soft"
            >
              <div className="text-5xl font-display font-bold gradient-text mb-3">
                {step.n}
              </div>
              <h3 className="text-xl font-display font-bold text-ink-900 mb-2">
                {step.title}
              </h3>
              <p className="text-ink-600 leading-relaxed text-sm">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
