import axios from "axios";

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  window.location.origin;

const jsonHeaders = { "Content-Type": "application/json" } as const;

export const sendMessage = async (sessionId: string, message: string): Promise<string> => {
  const response = await axios.post(
    `${apiBase}/chat`,
    { session_id: sessionId, message },
    { headers: jsonHeaders }
  );

  const payload = response.data as { response?: string } | undefined;
  if (!payload?.response) {
    throw new Error("Chat service returned an empty response.");
  }

  return payload.response;
};

export const resetSession = async (sessionId: string): Promise<void> => {
  await axios.post(
    `${apiBase}/reset`,
    { session_id: sessionId },
    { headers: jsonHeaders }
  );
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    await axios.get(`${apiBase}/health`);
    return true;
  } catch {
    return false;
  }
};
