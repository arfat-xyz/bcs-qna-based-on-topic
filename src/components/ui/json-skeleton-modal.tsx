import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileJson,
  Code2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  FileCode,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { getAllRawTopicJSONs } from '../../lib/topics';
import { validateTopicData } from '../../lib/topic-schema';

interface JsonSkeletonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_TEMPLATE = `{
  "heading": "New Study Module",
  "subheading": "Essential concepts and practice question cards with Markdown support",
  "items": [
    {
      "id": "module-1",
      "question": "What is the difference between \`let\` and \`const\` in **JavaScript**?",
      "answer": "**\`const\`** creates a block-scoped constant reference, whereas **\`let\`** allows variable reassignment.\\n\\n- **\`const\`**: Cannot be reassigned (though internal object properties can be mutated)\\n- **\`let\`**: Reassignable block-scoped variable\\n\\n\`\`\`javascript\\nconst user = { name: 'Alex' };\\nuser.name = 'Sam'; // Allowed property mutation\\n\`\`\`"
    },
    {
      "id": "module-2",
      "question": "What is an **idempotent** HTTP method?",
      "answer": "An idempotent method can be called multiple times without producing different side effects:\\n\\n- **Idempotent**: \`GET\`, \`PUT\`, \`DELETE\`, \`HEAD\`\\n- **Non-idempotent**: \`POST\` (creates new resources on every call)"
    }
  ],
  "content": "## Revision Notes & Deep Dive\\n\\nComprehensive notes rendered below the interactive question cards.\\n\\n### Key Rules & Syntax\\n\\n- **Rule 1**: State the foundational rule clearly.\\n- **Rule 2**: Highlight common patterns and indicators.\\n\\n| Category | Usage Context | Example |\\n|---|---|---|\\n| Standard | Everyday formal usage | Clear representative sample |\\n| Advanced | Specialized context | Nuanced edge case |\\n\\n> Pro-Tip: Both questions and answers support full GitHub-flavored Markdown (bold, italics, inline code, lists, and code blocks)!"
}`;

const MINIMAL_TEMPLATE = `{
  "heading": "Quick Practice Module",
  "items": [
    {
      "id": "q-1",
      "question": "What is the definition of this term?",
      "answer": "A clear, concise definition of the term."
    },
    {
      "id": "q-2",
      "question": "How is it applied in practice?",
      "answer": "Step-by-step application guidance."
    }
  ]
}`;

export function JsonSkeletonModal({ isOpen, onClose }: JsonSkeletonModalProps) {
  const [activeTab, setActiveTab] = useState<'skeletons' | 'validator' | 'schema'>('skeletons');
  const [selectedKey, setSelectedKey] = useState<string>('starter');
  const [copied, setCopied] = useState(false);

  // Raw topics discovered in src/data/topics/
  const rawTopics = useMemo(() => {
    return getAllRawTopicJSONs();
  }, []);

  // Compute current JSON string based on selected key
  const currentJsonString = useMemo(() => {
    if (selectedKey === 'starter') return STARTER_TEMPLATE;
    if (selectedKey === 'minimal') return MINIMAL_TEMPLATE;

    const matched = rawTopics.find((t) => t.slug === selectedKey);
    return matched ? matched.jsonString : STARTER_TEMPLATE;
  }, [selectedKey, rawTopics]);

  // Validator state
  const [validatorInput, setValidatorInput] = useState<string>(STARTER_TEMPLATE);
  const [validatorCopied, setValidatorCopied] = useState(false);

  const validationResult = useMemo(() => {
    if (!validatorInput.trim()) {
      return { status: 'empty', message: 'Enter or paste JSON above to test against the Cognition schema.' };
    }
    try {
      const parsed = JSON.parse(validatorInput);
      const res = validateTopicData(parsed);
      if (res.success && res.topic) {
        return {
          status: 'valid',
          topic: res.topic,
          message: `Valid Topic Schema! Found ${res.topic.items.length} question items${
            res.topic.content ? ' and markdown revision notes' : ''
          }.`,
        };
      }
      return {
        status: 'invalid',
        message: res.error || 'Failed schema validation',
      };
    } catch (err) {
      return {
        status: 'syntax-error',
        message: err instanceof Error ? err.message : 'Invalid JSON syntax',
      };
    }
  }, [validatorInput]);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Handle Copy current skeleton
  const handleCopy = useCallback(async (textToCopy: string, setCopiedState: (v: boolean) => void) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, []);

  // Handle Download JSON
  const handleDownload = useCallback((jsonContent: string, fileName: string) => {
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  if (!isOpen) return null;

  const currentFileName =
    selectedKey === 'starter'
      ? 'starter-topic.json'
      : selectedKey === 'minimal'
      ? 'minimal-topic.json'
      : `${selectedKey}.json`;

  const lines = currentJsonString.split('\n');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-skeleton-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
              <FileJson className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="json-skeleton-modal-title"
                className="text-sm sm:text-base md:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 sm:gap-2 truncate"
              >
                <span>JSON Topic Skeletons & Schema</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 uppercase">
                  Modular Engine
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate sm:whitespace-normal">
                Inspect, copy, download, and test valid JSON topic schemas for the Cognition platform.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-3 sm:px-6 pt-2 sm:pt-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('skeletons')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'skeletons'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Skeletons ({2 + rawTopics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('validator')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'validator'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Validator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Schema Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* TAB 1: SKELETONS VIEW */}
          {activeTab === 'skeletons' && (
            <div className="space-y-4">
              {/* Controls bar: Selector & Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                  <label htmlFor="skeleton-select" className="text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                    Template:
                  </label>
                  <select
                    id="skeleton-select"
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full sm:w-auto text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <optgroup label="Starter Templates">
                      <option value="starter">⭐ Starter Template (Recommended)</option>
                      <option value="minimal">Minimal Skeleton (Q&A Only)</option>
                    </optgroup>
                    <optgroup label="Discovered Platform Topics">
                      {rawTopics.map((topic) => (
                        <option key={topic.slug} value={topic.slug}>
                          {topic.heading} ({topic.slug}.json)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Copy & Download Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="text-[11px] font-mono text-neutral-400 hidden lg:inline">
                    {lines.length} lines • {new Blob([currentJsonString]).size} bytes
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentJsonString, setCopied)}
                    className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(currentJsonString, currentFileName)}
                    className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer shadow-xs"
                    title={`Download ${currentFileName}`}
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Code Display Area */}
              <div className="relative rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-inner font-mono text-xs text-neutral-200">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-neutral-800 bg-neutral-900 text-neutral-400 text-[10px] sm:text-[11px]">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-neutral-300 truncate">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">src/data/topics/{currentFileName}</span>
                  </span>
                  <span className="shrink-0 ml-2">JSON (UTF-8)</span>
                </div>

                <div className="max-h-[260px] sm:max-h-[380px] overflow-y-auto p-3 sm:p-4 flex gap-2.5 sm:gap-4 select-text">
                  {/* Line Numbers */}
                  <div className="select-none text-neutral-600 text-right font-mono pr-2 border-r border-neutral-800 text-[10px] sm:text-xs shrink-0">
                    {lines.map((_, i) => (
                      <div key={i} className="leading-relaxed">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Code Text */}
                  <pre className="flex-1 overflow-x-auto leading-relaxed text-indigo-200 font-mono text-[11px] sm:text-xs">
                    <code>{currentJsonString}</code>
                  </pre>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    How to add a new topic to Cognition:
                  </p>
                  <p>
                    Save your JSON file inside <code className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-indigo-600 dark:text-indigo-400 font-bold">src/data/topics/&lt;slug&gt;.json</code>.
                    The platform auto-discovers and registers the topic dynamically with <strong>zero code modifications</strong>!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE VALIDATOR */}
          {activeTab === 'validator' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Test & Validate Custom Topic JSON
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500">
                    Paste your custom JSON below to test it against the strict Zod topic schema.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setValidatorInput(currentJsonString)}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Load Selected Skeleton</span>
                </button>
              </div>

              {/* Validation Status Banner */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-start gap-3 transition-colors ${
                  validationResult.status === 'valid'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : validationResult.status === 'empty'
                    ? 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {validationResult.status === 'valid' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : validationResult.status === 'empty' ? (
                  <FileCode className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider block text-[10px]">
                    {validationResult.status === 'valid'
                      ? '✓ Schema Verification Passed'
                      : validationResult.status === 'empty'
                      ? 'Awaiting Input'
                      : 'Schema Verification Failed'}
                  </span>
                  <p>{validationResult.message}</p>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <label htmlFor="json-validator-textarea" className="font-semibold">
                    Paste JSON Code:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(validatorInput, setValidatorCopied)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {validatorCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <textarea
                  id="json-validator-textarea"
                  rows={10}
                  value={validatorInput}
                  onChange={(e) => setValidatorInput(e.target.value)}
                  className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-indigo-200 font-mono text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  placeholder="Paste your JSON here..."
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA REFERENCE */}
          {activeTab === 'schema' && (
            <div className="space-y-5 sm:space-y-6 text-xs text-neutral-600 dark:text-neutral-300">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Topic Schema Specification
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                  Every JSON file must satisfy this TypeScript interface and Zod schema:
                </p>
              </div>

              {/* Field Reference Table */}
              <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 -mx-1 sm:mx-0">
                <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        heading
                      </td>
                      <td className="py-2.5 px-3 font-mono">string</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                          Yes
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        The primary topic title displayed in navigation, header heroes, and topic cards. Cannot be empty.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        subheading
                      </td>
                      <td className="py-2.5 px-3 font-mono">string</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        A supporting subtitle or topic summary explaining the subject scope.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        items
                      </td>
                      <td className="py-2.5 px-3 font-mono">Array&lt;Item&gt;</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                          Yes
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        An array of study cards. Each object must have a non-empty <code className="font-mono text-indigo-500">question</code> and <code className="font-mono text-indigo-500">answer</code> string. Both questions and answers support full Markdown formatting (bold, italics, inline code, lists, code blocks).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        content
                      </td>
                      <td className="py-2.5 px-3 font-mono">string (markdown)</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        In-depth revision notes formatted with GitHub-flavored Markdown (headers, lists, tables, blockquotes, code blocks). Rendered below the Q&A cards.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Best Practices */}
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
                  Best Practices
                </h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>Keep file names URL-friendly (e.g. <code className="font-mono text-indigo-500">quantum-computing.json</code> becomes <code className="font-mono text-indigo-500">/topics/quantum-computing</code>).</li>
                  <li>In JSON strings, escape newlines with <code className="font-mono text-indigo-500">\n</code> and quotes with <code className="font-mono text-indigo-500">\"</code>.</li>
                  <li>Ensure question answers provide actionable reasoning rather than just single-word responses.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Path: src/data/topics/*.json</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}