/**
 * ML Classifier page.
 *
 * Calls POST /api/predict with a user-supplied explanation/suggestion
 * pair and renders the predicted class, confidence score, and full
 * class probability breakdown returned by the backend's TF-IDF +
 * Logistic Regression model.
 */

import { type FormEvent, useState } from "react";
import { Brain, Sparkles, Target, Info, Send, RotateCcw } from "lucide-react";
import { Button, GlassCard, SectionHeader, ErrorState, Badge } from "../components/ui";
import { ProbabilityBars } from "../components/charts";
import { usePredict } from "../hooks/useApi";
import { formatPercent, toTitleCase } from "../lib/utils";

const EXPLANATION_PLACEHOLDER =
  "e.g. This PR introduces a race condition in the payment retry logic because the lock is released before the balance check completes.";

const SUGGESTION_PLACEHOLDER =
  "e.g. Acquire the lock for the full duration of the balance check and retry, or use an atomic compare-and-swap operation.";

export default function ClassifierPage() {
  const [explanation, setExplanation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const { data, loading, error, predict, reset } = usePredict();

  const canSubmit = explanation.trim().length > 0 && suggestion.trim().length > 0 && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await predict({ explanation: explanation.trim(), suggestion: suggestion.trim() });
  }

  function handleReset() {
    setExplanation("");
    setSuggestion("");
    reset();
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="ML Classifier"
        description="Run the issue-classification model live. Provide an explanation and suggested fix to see the predicted issue class and confidence."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Prediction form */}
        <GlassCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
              <Brain className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Prediction Playground</h3>
              <p className="text-xs text-slate-500">Live inference against the deployed classifier</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="explanation" className="text-xs font-medium text-slate-400">
                Explanation
              </label>
              <textarea
                id="explanation"
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={EXPLANATION_PLACEHOLDER}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="suggestion" className="text-xs font-medium text-slate-400">
                Suggestion
              </label>
              <textarea
                id="suggestion"
                rows={4}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder={SUGGESTION_PLACEHOLDER}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={!canSubmit} isLoading={loading} className="flex-1">
                <Send className="h-4 w-4" />
                Run Prediction
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Results */}
        <div className="flex flex-col gap-6">
          {error && <ErrorState message={error} />}

          {!error && !data && (
            <GlassCard className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Awaiting input</h3>
                <p className="max-w-sm text-sm text-slate-400">
                  Fill in an explanation and suggestion, then run a prediction to see live model output here.
                </p>
              </div>
            </GlassCard>
          )}

          {data && (
            <>
              <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Prediction Result</h3>
                  <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                    <Target className="mr-1 h-3 w-3" />
                    {formatPercent(data.confidence)} confidence
                  </Badge>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 p-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Predicted Class</p>
                    <p className="text-xl font-semibold text-white">{toTitleCase(data.predicted_class)}</p>
                  </div>
                </div>

                <ConfidenceGauge confidence={data.confidence} />
              </GlassCard>

              <GlassCard className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-white">Class Probability Breakdown</h3>
                <ProbabilityBars probabilities={data.class_probs} predictedClass={data.predicted_class} />
              </GlassCard>
            </>
          )}

          <ModelExplanationPanel />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ConfidenceGauge                                                             */
/* -------------------------------------------------------------------------- */

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const percent = Math.max(0, Math.min(1, confidence)) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">Model Confidence</span>
        <span className="font-mono text-slate-300">{formatPercent(confidence)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ModelExplanationPanel                                                       */
/* -------------------------------------------------------------------------- */

function ModelExplanationPanel() {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">How this model works</h3>
      </div>
      <p className="text-sm text-slate-400">
        The classifier vectorizes the explanation and suggestion text using TF-IDF, then applies a
        Logistic Regression model trained on previously labeled pull request issues to predict the most
        likely issue category. The confidence score reflects the model's probability estimate for the
        top-ranked class, and the breakdown above shows the full distribution across all known classes.
      </p>
    </GlassCard>
  );
}
