import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { Message } from "../hooks/useChatSession";

type ConversationPanelProps = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

const ConversationPanel = ({ messages, isLoading, error }: ConversationPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages, isLoading]);

  const showEmptyState = messages.length === 0 && !isLoading && !error;

  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-4 min-h-[320px] lg:min-h-0"
      >
        {showEmptyState && (
          <p className="text-sm text-slate-500">
            Start by asking about recent projects, preferred technologies, or availability.
          </p>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className={clsx(
              "mb-3 max-w-[80%] rounded-md px-3 py-2 text-sm leading-relaxed",
              message.role === "user"
                ? "ml-auto bg-primary-100 text-primary-900"
                : "mr-auto bg-slate-100 text-slate-800"
            )}
          >
            <span
              className={clsx(
                "mb-1 block text-xs font-semibold uppercase tracking-wide",
                message.role === "user" ? "text-primary-500" : "text-slate-500"
              )}
            >
              {message.role === "user" ? "You" : "PeraBot"}
            </span>
            <p className="whitespace-pre-line">{message.content}</p>
          </article>
        ))}

        {isLoading && (
          <article className="mr-auto rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
            PeraBot is thinking…
          </article>
        )}

        {error && (
          <article className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </article>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;
