"use client";

import { useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<"FULL" | "CUSTOM">("FULL");
  const [error, setError] = useState<string | null>(null);
  const [shouldStartVoiceChat, setShouldStartVoiceChat] = useState(false);

  const handleStart = async (
    customAvatarId?: string,
    customVoiceId?: string,
    customContextId?: string,
  ) => {
    try {
      setError(null);
      setShouldStartVoiceChat(true);
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_id: customAvatarId || undefined,
          voice_id: customVoiceId || undefined,
          context_id: customContextId || undefined,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        setError(error.error);
        setShouldStartVoiceChat(false);
        return;
      }
      const { session_token } = await res.json();
      setSessionToken(session_token);
      setMode("FULL");
    } catch (error: unknown) {
      setError((error as Error).message);
      setShouldStartVoiceChat(false);
    }
  };

  const onSessionStopped = () => {
    // Reset the FE state
    setSessionToken("");
    setShouldStartVoiceChat(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {error && !sessionToken && (
        <div className="text-red-500">
          {"Error getting session token: " + error}
        </div>
      )}
      {sessionToken ? (
        <LiveAvatarSession
          mode={mode}
          sessionAccessToken={sessionToken}
          onSessionStopped={onSessionStopped}
          shouldStartVoiceChat={shouldStartVoiceChat}
          onVoiceChatStarted={() => setShouldStartVoiceChat(false)}
        />
      ) : (
        <LiveAvatarSession
          mode={mode}
          sessionAccessToken=""
          onSessionStopped={onSessionStopped}
          onGetSessionToken={handleStart}
        />
      )}
    </div>
  );
};
