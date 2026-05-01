"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-plum-200 rounded-full blur-3xl opacity-25 animate-float" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-peach-200 rounded-full blur-3xl opacity-25 animate-float-delay" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-plum-200 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-plum-700 shadow-soft"
        >
          <span className="w-2 h-2 bg-mint-400 rounded-full animate-pulse" />
          Subject Matter Expert bots for knowledge workers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tight text-ink-900 mb-6 leading-[1.05]"
        >
          Spend less time on busy work.
          <br />
          More time on{" "}
          <span className="relative inline-block">
            <span className="gradient-text">work that matters</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 10"
              fill="none"
            >
              <path
                d="M2 8 Q 100 -2, 198 8"
                stroke="#FF8862"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xl md:text-2xl text-plum-700 max-w-2xl mx-auto mb-8 italic font-medium"
        >
          Do the work only you can do. We&apos;ll handle the rest.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-ink-600 max-w-2xl mx-auto mb-4"
        >
          A suite of focused AI bots, one per role, that produce the documents,
          plans, and reports your work demands. You bring the context. The bot
          brings structure and speed.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base text-ink-600 max-w-xl mx-auto mb-10"
        >
          You will not be replaced by AI. You will be elevated by it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/tpm-bot"
            className="bg-plum-600 hover:bg-plum-700 text-white px-7 py-3.5 rounded-full text-base font-medium shadow-soft transition-all hover:shadow-pop hover:-translate-y-0.5"
          >
            Try TPM Bot
          </Link>
          <Link
            href="/pm-bot"
            className="bg-peach-300 hover:bg-peach-400 text-white px-7 py-3.5 rounded-full text-base font-medium shadow-soft transition-all hover:shadow-pop hover:-translate-y-0.5"
          >
            Try PM Bot
          </Link>
          <Link
            href="#bots"
            className="bg-white hover:bg-cream-100 text-ink-900 px-7 py-3.5 rounded-full text-base font-medium border border-ink-100 transition-all hover:-translate-y-0.5"
          >
            See all bots
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-400"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-mint-400">●</span>
            Runs in your browser
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-peach-300">●</span>
            Your API key, your data
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-plum-400">●</span>
            Outputs in seconds
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-mint-400">●</span>
            Built for knowledge workers
          </span>
        </motion.div>
      </div>
    </section>
  );
}
