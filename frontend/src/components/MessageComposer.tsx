import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";
import { Send } from "lucide-react";

type MessageComposerProps = {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
};

const MessageComposer = ({ onSend, disabled = false }: MessageComposerProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    await onSend(trimmed);
    setValue("");
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) {
        return;
      }
      await onSend(trimmed);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 flex-shrink-0">
      <label className="block">
        <span className="sr-only">Message</span>
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about key achievements, tech stack choices, or availability…"
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          disabled={disabled}
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Press Enter to send. Use Shift + Enter for a new line.</p>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageComposer;
