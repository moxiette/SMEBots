"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BotConfig, GuidedQuestion, OutputTab } from "@/lib/bot-configs";
import {
  extractFileText,
  summarizeExtractedFiles,
  type ExtractedFile,
} from "@/lib/file-extractors";

export type DetailLevel = "high_level" | "balanced" | "super_detailed";
export type StyleChoice = "minimalist" | "professional" | "creative";

export interface IntakeData {
  bot: string;
  programName: string;
  goal: string;
  guidedAnswers: Record<string, string>;
  optionalContext?: string;
  detailLevel: DetailLevel;
  styleChoice: StyleChoice;
  selectedOutputs: string[];
}

interface Props {
  config: BotConfig;
  onComplete: (data: IntakeData) => void;
  initialData?: Partial<IntakeData>;
}

const STEP_LABELS = [
  "Project setup",
  "Quick questions",
  "Optional context",
  "Choose outputs",
];

export function IntakeWizard({ config, onComplete, initialData }: Props) {
  const [step, setStep] = useState(0);
  const [programName, setProgramName] = useState(initialData?.programName || "");
  const [goal, setGoal] = useState(initialData?.goal || "");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(
    initialData?.detailLevel || "balanced"
  );
  const [styleChoice, setStyleChoice] = useState<StyleChoice>(
    initialData?.styleChoice || "professional"
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialData?.guidedAnswers || {}
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [optionalContext, setOptionalContext] = useState(
    initialData?.optionalContext || ""
  );
  const [uploadedFiles, setUploadedFiles] = useState<ExtractedFile[]>([]);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(
    initialData?.selectedOutputs || config.outputTabs.map((t) => t.id)
  );

  const totalSteps = STEP_LABELS.length;
  const progressPct = Math.round(((step + 1) / totalSteps) * 100);

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }
  function handleNext() {
    setStep((s) => s + 1);
  }
  function handleQuestionNext() {
    if (questionIndex < config.guidedQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep((s) => s + 1);
    }
  }
  function handleQuestionBack() {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      setStep((s) => s - 1);
    }
  }
  function handleAnswer(qid: string, value: string) {
    setAnswers((a) => ({ ...a, [qid]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadProcessing(true);
    const extracted: ExtractedFile[] = [];
    for (const f of files) {
      const result = await extractFileText(f);
      extracted.push(result);
    }
    setUploadedFiles((prev) => [...prev, ...extracted]);
    setUploadProcessing(false);
    e.target.value = "";
  }

  function removeUploadedFile(filename: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.filename !== filename));
  }

  function toggleOutput(tabId: string) {
    setSelectedOutputs((prev) =>
      prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId]
    );
  }

  function handleSubmit() {
    const fileText = summarizeExtractedFiles(uploadedFiles);
    const combinedContext = [optionalContext.trim(), fileText.trim()]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    onComplete({
      bot: config.id,
      programName,
      goal,
      guidedAnswers: answers,
      optionalContext: combinedContext || undefined,
      detailLevel,
      styleChoice,
      selectedOutputs,
    });
  }

  const guidedQ = config.guidedQuestions[questionIndex];
  const guidedAnswerValue = answers[guidedQ?.id || ""] || "";

  return (
    <div className="bg-white rounded-3xl border-2 border-plum-200 shadow-soft overflow-hidden">
      <div className="bg-cream-50 border-b border-plum-100 px-6 md:px-10 py-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 text-xs uppercase tracking-widest font-medium",
                i === step
                  ? "text-plum-600"
                  : i < step
                  ? "text-ink-400"
                  : "text-ink-100"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  i === step
                    ? "bg-plum-600 text-white"
                    : i < step
                    ? "bg-mint-100 text-mint-400"
                    : "bg-ink-100 text-ink-400"
                )}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className="hidden md:inline">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-cream-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-plum-600 to-peach-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="px-6 md:px-10 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-3">
                Project setup
              </h2>
              <p className="text-ink-600 mb-8 leading-relaxed">
                {config.intakeIntro}
              </p>

              <label className="block mb-5">
                <span className="block text-sm font-medium text-ink-900 mb-2">
                  What is your project called?
                </span>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="A working title is fine. You can change it later."
                  className="w-full px-4 py-3 rounded-xl border-2 border-ink-100 focus:border-plum-400 focus:outline-none text-ink-900"
                />
              </label>

              <label className="block mb-8">
                <span className="block text-sm font-medium text-ink-900 mb-2">
                  In one or two sentences, what is the goal?
                </span>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe in your own words what you are trying to accomplish."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-ink-100 focus:border-plum-400 focus:outline-none text-ink-900 resize-none"
                />
              </label>

              <div className="border-t border-ink-100 pt-8 mb-8">
                <h3 className="text-sm font-bold text-ink-900 mb-2 uppercase tracking-widest">
                  Output preferences
                </h3>
                <p className="text-sm text-ink-600 mb-6">
                  Tune how the deliverables read.
                </p>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-ink-400 mb-3 uppercase tracking-widest">
                    Level of detail
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <CardButton
                      selected={detailLevel === "high_level"}
                      onClick={() => setDetailLevel("high_level")}
                      label="High-level"
                      body="Concise, scannable, executive-ready."
                    />
                    <CardButton
                      selected={detailLevel === "balanced"}
                      onClick={() => setDetailLevel("balanced")}
                      label="Balanced"
                      body="Detailed enough for action, light enough to read."
                    />
                    <CardButton
                      selected={detailLevel === "super_detailed"}
                      onClick={() => setDetailLevel("super_detailed")}
                      label="Super detailed"
                      body="Full granularity, comprehensive coverage."
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-ink-400 mb-3 uppercase tracking-widest">
                    Output style
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <CardButton
                      selected={styleChoice === "minimalist"}
                      onClick={() => setStyleChoice("minimalist")}
                      label="Minimalist"
                      body="Clean, sparse, modern."
                    />
                    <CardButton
                      selected={styleChoice === "professional"}
                      onClick={() => setStyleChoice("professional")}
                      label="Professional"
                      body="Standard business tone, structured."
                    />
                    <CardButton
                      selected={styleChoice === "creative"}
                      onClick={() => setStyleChoice("creative")}
                      label="Creative"
                      body="Storytelling cadence, more personality."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <NextButton
                  disabled={!programName.trim() || !goal.trim()}
                  onClick={handleNext}
                />
              </div>
            </motion.div>
          )}

          {step === 1 && guidedQ && (
            <motion.div
              key={`q-${questionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-xs text-ink-400 mb-3 uppercase tracking-widest font-medium">
                Question {questionIndex + 1} of {config.guidedQuestions.length}
              </div>
              <QuestionInput
                question={guidedQ}
                value={guidedAnswerValue}
                onChange={(v) => handleAnswer(guidedQ.id, v)}
              />
              <div className="mt-8 flex justify-between">
                <BackButton onClick={handleQuestionBack} />
                <NextButton
                  disabled={guidedQ.required && !guidedAnswerValue.trim()}
                  onClick={handleQuestionNext}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="inline-flex items-center gap-1.5 bg-ink-50 text-ink-600 px-3 py-1 rounded-full text-xs font-medium mb-4 uppercase tracking-widest">
                Optional
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-3">
                Anything else worth adding?
              </h2>
              <p className="text-ink-600 mb-6 leading-relaxed">
                If you have additional context (notes, an outline, a few
                paragraphs), paste it below or upload files. Skip if not relevant.
              </p>

              <div className="bg-plum-50 border border-plum-200 rounded-xl p-4 mb-6 flex gap-3">
                <ShieldCheck className="text-plum-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-ink-600 leading-relaxed">
                  <strong className="text-ink-900">A note on data.</strong>{" "}
                  Anything you paste or upload is sent directly from your
                  browser to Anthropic for processing using your own API key.
                  This site has no backend — the call never goes through any
                  server we control. If your organization restricts sharing
                  internal documents, paraphrase in your own words instead.
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-ink-400 mb-2 uppercase tracking-widest">
                  Upload files (optional)
                </h4>
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json,.tsv"
                    onChange={handleFileUpload}
                    disabled={uploadProcessing}
                    className="hidden"
                  />
                  <div className="cursor-pointer flex flex-col items-center justify-center gap-2 px-6 py-6 border-2 border-dashed border-ink-200 rounded-xl hover:border-plum-300 hover:bg-plum-50/30 transition-colors">
                    <Upload className="text-plum-600" size={20} />
                    <div className="text-sm text-ink-900 font-medium">
                      {uploadProcessing ? "Reading files..." : "Click to upload"}
                    </div>
                    <div className="text-xs text-ink-400">
                      .txt, .md, .csv, .json (up to 200KB each)
                    </div>
                    <div className="text-xs text-ink-400 italic">
                      For PDF or Word: copy text and paste below
                    </div>
                  </div>
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((f) => (
                      <div
                        key={f.filename}
                        className="bg-cream-50 border border-ink-100 rounded-lg px-3 py-2 flex items-start gap-2 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink-900 truncate">
                            {f.filename}
                          </div>
                          <div className="text-xs text-ink-400">
                            {f.text
                              ? `${f.text.length.toLocaleString()} chars extracted`
                              : "No text extracted"}
                          </div>
                          {f.warnings.length > 0 && (
                            <div className="mt-1 text-xs text-peach-400 flex items-start gap-1">
                              <AlertCircle size={12} className="shrink-0 mt-0.5" />
                              <span>{f.warnings[0]}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeUploadedFile(f.filename)}
                          className="text-ink-400 hover:text-red-500 transition-colors shrink-0"
                          aria-label={`Remove ${f.filename}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-ink-400 mb-2 uppercase tracking-widest">
                  Paste additional context (optional)
                </h4>
                <div className="bg-white rounded-2xl border-2 border-ink-100 focus-within:border-plum-300 transition-colors overflow-hidden">
                  <textarea
                    value={optionalContext}
                    onChange={(e) => setOptionalContext(e.target.value)}
                    placeholder="Notes, outline, additional context. Leave blank to skip."
                    rows={8}
                    className="w-full p-4 text-sm text-ink-900 bg-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <BackButton onClick={handleBack} />
                <NextButton onClick={handleNext} />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-3">
                Choose what to generate
              </h2>
              <p className="text-ink-600 mb-6 leading-relaxed">
                Pick the deliverables you want. Generating fewer outputs is
                faster. All are selected by default.
              </p>

              <div className="space-y-3 mb-8">
                {config.outputTabs.map((tab) => (
                  <OutputCheckbox
                    key={tab.id}
                    tab={tab}
                    checked={selectedOutputs.includes(tab.id)}
                    onChange={() => toggleOutput(tab.id)}
                  />
                ))}
              </div>

              {selectedOutputs.length === 0 && (
                <p className="mb-4 text-sm text-peach-400">
                  Select at least one deliverable to continue.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <BackButton onClick={handleBack} />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-400">
                    {selectedOutputs.length} of {config.outputTabs.length}{" "}
                    selected
                  </span>
                  <FinishButton
                    onClick={handleSubmit}
                    label="Generate"
                    disabled={selectedOutputs.length === 0}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OutputCheckbox({
  tab,
  checked,
  onChange,
}: {
  tab: OutputTab;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all bg-white text-left",
        checked
          ? "border-plum-500 shadow-soft"
          : "border-ink-100 hover:border-plum-200 hover:-translate-y-0.5"
      )}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors",
          checked
            ? "bg-plum-600 border-plum-600 text-white"
            : "bg-white border-ink-200"
        )}
      >
        {checked && <Check size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-lg">{tab.emoji}</span>
          <span className="font-display font-bold text-ink-900">{tab.label}</span>
        </div>
        <div className="text-xs text-ink-600 leading-relaxed">
          {tab.description}
        </div>
      </div>
    </button>
  );
}

function NextButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-plum-600 hover:bg-plum-700 text-white px-6 py-2.5 rounded-full font-medium shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 inline-flex items-center gap-1.5"
    >
      Next <ChevronRight size={16} />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-ink-600 hover:text-plum-600 px-4 py-2.5 rounded-full font-medium transition-colors inline-flex items-center gap-1.5"
    >
      <ChevronLeft size={16} /> Back
    </button>
  );
}

function FinishButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-gradient-to-r from-plum-600 to-peach-400 hover:from-plum-700 hover:to-peach-300 text-white px-7 py-3 rounded-full font-display font-bold shadow-pop hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 disabled:opacity-40 disabled:translate-y-0"
    >
      {label}
    </button>
  );
}

function CardButton({
  selected,
  onClick,
  label,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left p-4 rounded-2xl border-2 transition-all bg-white",
        selected
          ? "border-plum-500 shadow-pop"
          : "border-ink-100 hover:border-plum-200 hover:-translate-y-0.5 hover:shadow-soft"
      )}
    >
      <div className="font-display font-bold text-ink-900 mb-1.5">{label}</div>
      <div className="text-xs text-ink-600 leading-snug">{body}</div>
    </button>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: GuidedQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-2">
        {question.label}
      </h2>
      {question.helper && (
        <p className="text-ink-600 mb-6 leading-relaxed">{question.helper}</p>
      )}

      {question.type === "buttons" && question.options && (
        <div className="grid sm:grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all bg-white inline-flex items-center justify-between",
                value === opt.value
                  ? "border-plum-500 shadow-pop"
                  : "border-ink-100 hover:border-plum-200 hover:-translate-y-0.5 hover:shadow-soft"
              )}
            >
              <span className="font-medium text-ink-900">{opt.label}</span>
              {value === opt.value && (
                <Check size={16} className="text-plum-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {question.type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-xl border-2 border-ink-100 focus:border-plum-400 focus:outline-none text-ink-900"
        />
      )}

      {question.type === "textarea" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-ink-100 focus:border-plum-400 focus:outline-none text-ink-900 resize-none"
        />
      )}

      {!question.required && (
        <p className="mt-3 text-xs text-ink-400">
          Optional. Skip if not relevant.
        </p>
      )}
    </>
  );
}
