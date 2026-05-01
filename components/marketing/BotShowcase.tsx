"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BOT_CONFIGS } from "@/lib/bot-configs";

// Future bots planned but not yet implemented — surfaced as "coming soon" so
// visitors see the broader vision.
const COMING_SOON = [
  { emoji: "👷", name: "EM Bot", role: "Engineering Manager" },
  { emoji: "🎨", name: "Design Bot", role: "Designer" },
  { emoji: "📣", name: "Marketing Bot", role: "Marketing" },
  { emoji: "💼", name: "Sales Bot", role: "Sales" },
];

export function BotShowcase() {
  const liveBots = Object.values(BOT_CONFIGS);

  return (
    <section id="bots" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium text-plum-600 bg-plum-100 px-3 py-1 rounded-full mb-4">
            The bots
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-900 mb-3">
            One bot per role. Each tuned for the work.
          </h2>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Specialization beats generalization. Pick the bot for your role.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {liveBots.map((bot, i) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={`/${bot.id}-bot`}
                className="block bg-white rounded-3xl border-2 border-plum-100 hover:border-plum-300 p-8 shadow-soft hover:shadow-pop transition-all hover:-translate-y-1 group h-full"
              >
                <div className="text-4xl mb-3">{bot.emoji}</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-display font-bold text-ink-900">
                    {bot.name}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-widest bg-mint-100 text-mint-400 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-xs uppercase tracking-widest text-plum-600 font-medium mb-3">
                  {bot.acronymExpansion}
                </p>
                <p className="text-ink-600 leading-relaxed mb-4">
                  {bot.shortDescription}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.outputTabs.slice(0, 5).map((t) => (
                    <span
                      key={t.id}
                      className="text-xs bg-plum-50 text-plum-700 px-2 py-0.5 rounded-full border border-plum-100"
                    >
                      {t.emoji} {t.label}
                    </span>
                  ))}
                </div>
                <div className="mt-5 text-sm text-plum-600 font-medium group-hover:underline">
                  Try {bot.name} →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="text-center mb-6">
          <h3 className="text-sm font-bold text-ink-400 uppercase tracking-widest">
            More bots coming
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COMING_SOON.map((bot) => (
            <div
              key={bot.name}
              className="bg-white/60 border border-plum-100 rounded-2xl p-4 text-center opacity-70"
            >
              <div className="text-2xl mb-1">{bot.emoji}</div>
              <div className="font-display font-bold text-ink-900 text-sm">
                {bot.name}
              </div>
              <div className="text-xs text-ink-400">{bot.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
