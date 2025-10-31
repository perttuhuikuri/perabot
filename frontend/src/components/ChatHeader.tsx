import { Bot, RotateCcw } from "lucide-react";

type ChatHeaderProps = {
  onReset: () => Promise<void>;
  status: "loading" | "online" | "offline";
};

const ChatHeader = ({ onReset, status }: ChatHeaderProps) => {
  const badgeColor =
    status === "online" ? "bg-emerald-500" : status === "offline" ? "bg-red-500" : "bg-slate-300";
  const badgeLabel =
    status === "online" ? "Online" : status === "offline" ? "Offline" : "Connecting";

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Resume assistant</p>
            <h1 className="text-xl font-semibold text-slate-900">PeraBot</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${badgeColor}`} />
            {badgeLabel}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
