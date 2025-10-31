import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import ChatHeader from "./components/ChatHeader";
import ConversationPanel from "./components/ConversationPanel";
import MessageComposer from "./components/MessageComposer";
import ResumeHighlights from "./components/ResumeHighlights";
import { checkHealth } from "./services/apiClient";
import useChatSession from "./hooks/useChatSession";

const sessionStorageKey = "perabot-session-id";

type HealthStatus = "loading" | "online" | "offline";

const App = () => {
  const sessionId = useMemo(() => {
    const stored = window.localStorage.getItem(sessionStorageKey);
    if (stored) {
      return stored;
    }
    const fresh = uuid();
    window.localStorage.setItem(sessionStorageKey, fresh);
    return fresh;
  }, []);

  const { messages, isLoading, error, sendMessage, resetConversation } = useChatSession(
    sessionId
  );

  const [healthStatus, setHealthStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    let isCancelled = false;

    const evaluateHealth = async () => {
      try {
        const healthy = await checkHealth();
        if (!isCancelled) {
          setHealthStatus(healthy ? "online" : "offline");
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setHealthStatus("offline");
        }
      }
    };

    evaluateHealth();
    const id = window.setInterval(evaluateHealth, 60_000);

    return () => {
      isCancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface py-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 lg:flex-row lg:items-stretch">
        <section className="flex flex-1 flex-col gap-4">
          <ChatHeader onReset={resetConversation} status={healthStatus} />
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:min-h-[540px] lg:max-h-[680px] lg:overflow-hidden">
            <ConversationPanel messages={messages} isLoading={isLoading} error={error} />
            <MessageComposer onSend={sendMessage} disabled={isLoading} />
          </div>
        </section>
        <aside className="w-full lg:w-72">
          <ResumeHighlights />
        </aside>
      </main>
    </div>
  );
};

export default App;
