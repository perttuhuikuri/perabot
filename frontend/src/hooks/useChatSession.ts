import { useCallback, useMemo, useState } from "react";
import { resetSession, sendMessage as sendChatMessage } from "../services/apiClient";

export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

const createMessageId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `msg-${Math.random().toString(36).slice(2, 10)}`;

const createWelcomeMessage = (): Message => ({
  id: createMessageId(),
  role: "assistant",
  content: "Hi! I'm PeraBot. Ask me anything about Perttu's experience or availability."
});

const useChatSession = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback((message: Message) => {
    setMessages((history: Message[]) => [...history, message]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      setError(null);
      appendMessage({ id: createMessageId(), role: "user", content: trimmed });
      setIsLoading(true);

      try {
        const reply = await sendChatMessage(sessionId, trimmed);
        appendMessage({ id: createMessageId(), role: "assistant", content: reply });
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, sessionId]
  );

  const resetConversation = useCallback(async () => {
    try {
      await resetSession(sessionId);
    } catch (err) {
      console.error(err);
    } finally {
  setMessages(() => [createWelcomeMessage()]);
      setError(null);
    }
  }, [sessionId]);

  return useMemo(
    () => ({ messages, isLoading, error, sendMessage, resetConversation }),
    [messages, isLoading, error, sendMessage, resetConversation]
  );
};

export default useChatSession;
