type QuickPromptsProps = {
  onSelect: (prompt: string) => Promise<void>;
  disabled?: boolean;
};

const prompts = [
  "What Azure projects has Perttu delivered recently?",
  "How does Perttu approach collaboration in Scrum teams?",
  "Which technologies is Perttu most excited to use next?",
  "Is Perttu available for thesis-driven product work?"
];

const QuickPrompts = ({ onSelect, disabled = false }: QuickPromptsProps) => (
  <div className="mt-4">
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      Suggested prompts
    </div>
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary-300 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);

export default QuickPrompts;
