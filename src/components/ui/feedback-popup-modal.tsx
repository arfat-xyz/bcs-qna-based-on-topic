import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  Check,
} from "lucide-react";

const STORAGE_DISMISSED_KEY = "cognition_feedback_dismissed_until";
const STORAGE_USER_NAME_KEY = "cognition_user_name";
const STORAGE_USER_EMAIL_KEY = "cognition_user_email";

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Client-side quick check for disposable domains
const QUICK_DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "sharklasers.com",
  "getairmail.com",
  "dispostable.com",
  "fakeinbox.com",
  "trashmail.com",
  "maildrop.cc",
  "getnada.com",
  "mohmal.com",
  "burnermail.io",
  "generator.email",
  "fakemailgenerator.com",
];

interface FeedbackPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackPopupModal({
  isOpen,
  onClose,
}: FeedbackPopupModalProps) {
  // Pre-fill from localStorage if previously entered
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_USER_NAME_KEY) || "";
    } catch {
      return "";
    }
  });

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_USER_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });

  const [subject, setSubject] = useState("");
  // Honeypot field for bot detection (must remain empty for human users)
  const [honeypot, setHoneypot] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [clientWarning, setClientWarning] = useState<string | null>(null);

  // Time tracker for bot timing trap (<1.5s submission detection)
  const openTimeRef = useRef<number>(Date.now());
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate live character count
  const charCount = subject.trim().length;
  const isTooShort = charCount > 0 && charCount < 30;
  const isTooLong = charCount > 1000;
  const isCharCountValid = charCount >= 30 && charCount <= 1000;

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
      setStatusMessage(null);
      setClientWarning(null);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Real-time client email validation for disposable domains and typos
  const handleEmailChange = (val: string) => {
    setEmail(val);
    const domain = val.trim().split("@")[1]?.toLowerCase();
    if (domain && QUICK_DISPOSABLE_DOMAINS.includes(domain)) {
      setClientWarning(
        "Temporary/disposable email domains are not accepted. Please use your real email.",
      );
    } else {
      setClientWarning(null);
    }
  };

  const handleDismiss = () => {
    // Save 1-hour cooldown in localStorage so auto-popup does not badger the user
    try {
      localStorage.setItem(
        STORAGE_DISMISSED_KEY,
        String(Date.now() + ONE_HOUR_MS),
      );
    } catch {
      // ignore storage quota/security error
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setStatusMessage({
        type: "error",
        text: "Please enter your email address.",
      });
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid email format.",
      });
      return;
    }

    // 30 - 1000 character requirement
    if (charCount < 30) {
      setStatusMessage({
        type: "error",
        text: `Message is too short (${charCount} characters). Please write at least 30 characters.`,
      });
      return;
    }

    if (charCount > 1000) {
      setStatusMessage({
        type: "error",
        text: `Message exceeds the 1,000-character limit (${charCount} characters). Please shorten your message.`,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          honeypot: honeypot,
          formStartTime: openTimeRef.current,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setStatusMessage({
          type: "success",
          text:
            data.message || "Thank you! Your message has been sent to Arfat.",
        });

        // Remember user credentials & cooldown for 24 hours after successful send
        try {
          if (trimmedName)
            localStorage.setItem(STORAGE_USER_NAME_KEY, trimmedName);
          if (trimmedEmail)
            localStorage.setItem(STORAGE_USER_EMAIL_KEY, trimmedEmail);
          localStorage.setItem(
            STORAGE_DISMISSED_KEY,
            String(Date.now() + TWENTY_FOUR_HOURS_MS),
          );
        } catch {
          // ignore
        }

        setSubject("");
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Network error or server unreachable. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          handleDismiss();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden transition-all transform scale-100 max-h-[90vh] flex flex-col"
      >
        {/* Decorative Top Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="contact-modal-title"
                className="text-lg font-bold text-neutral-950 dark:text-white flex items-center gap-2"
              >
                Get in Touch
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  Arfat Rahman
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Have feedback, questions, or ideas? Send a direct email.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal and mute for 1 hour"
            title="Close (reminds again in 1 hour)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Honeypot field (hidden from humans, catches bots) */}
          <div
            style={{ display: "none", position: "absolute", left: "-9999px" }}
            aria-hidden="true"
          >
            <label htmlFor="company-field">Leave this empty</label>
            <input
              id="company-field"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* User Name & Email Grid (Autofill enabled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-name"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  Your Name
                </span>
                <span className="text-[10px] text-neutral-400">Autofill</span>
              </label>
              <input
                id="feedback-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arfat Rahman"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm transition-all outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-email"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  Your Email
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold">
                  Required
                </span>
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 ${
                  clientWarning
                    ? "border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>
          </div>

          {clientWarning && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {clientWarning}
            </p>
          )}

          {/* Subject / Message Textarea Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="feedback-subject"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Subject / Message
              </label>

              {/* Live Character Count Indicator */}
              <div className="text-[11px]">
                {charCount === 0 && (
                  <span className="text-neutral-400">
                    30 – 1,000 characters required
                  </span>
                )}
                {isTooShort && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {charCount} / 30 chars ({30 - charCount} more needed)
                  </span>
                )}
                {isCharCountValid && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {charCount} / 1,000 chars (Ready)
                  </span>
                )}
                {isTooLong && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    {charCount} / 1,000 chars ({charCount - 1000} over limit)
                  </span>
                )}
              </div>
            </div>

            <textarea
              id="feedback-subject"
              required
              rows={5}
              minLength={30}
              maxLength={1000}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Write your feedback, questions, or ideas here (minimum 30 characters, up to 1,000 characters)..."
              disabled={isLoading}
              className={`w-full p-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm leading-relaxed transition-all outline-none resize-y min-h-[120px] max-h-[300px] ${
                isTooLong
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                  : isCharCountValid
                    ? "border-emerald-400/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />
            {/* <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Tip: Writing a detailed message (between 30 and 1,000 characters)
              helps us assist you better.
            </p> */}
          </div>

          {/* Feedback & Status Messages */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Anti-spam & Privacy Notice */}
          {/* <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Anti-spam & 1-click browser autofill protected
            </span>
            <span>1h cooldown on close</span>
          </div> */}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !isCharCountValid ||
                !email.trim() ||
                Boolean(clientWarning)
              }
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit ({charCount}/30 min)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
