"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import { useAvatarActions } from "../liveavatar/useAvatarActions";

const Button: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}> = ({ onClick, disabled, children, variant = "primary", className = "" }) => {
  const baseClasses = "px-6 py-2 rounded-md font-medium transition-colors";
  const variantClasses =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// UI component that doesn't require hooks - used when no token yet
const LiveAvatarSessionUI: React.FC<{
  mode: "FULL" | "CUSTOM";
  onStartVoiceChat: () => Promise<void>;
  onStartTextChat: () => Promise<void>;
  isActive?: boolean;
  isLoading?: boolean;
  textChatActive?: boolean;
  setTextChatActive?: (active: boolean) => void;
  message?: string;
  setMessage?: (msg: string) => void;
  onSendMessage?: () => void;
  onRepeat?: (msg: string) => void;
  showSettings?: boolean;
  setShowSettings?: (show: boolean) => void;
  sessionState?: SessionState;
  connectionQuality?: string;
  isUserTalking?: boolean;
  isAvatarTalking?: boolean;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  isStreamReady?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onInterrupt?: () => void;
  onKeepAlive?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  videoContainerRef?: React.RefObject<HTMLDivElement | null>;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  customAvatarId?: string;
  setCustomAvatarId?: (id: string) => void;
  customVoiceId?: string;
  setCustomVoiceId?: (id: string) => void;
  customContextId?: string;
  setCustomContextId?: (id: string) => void;
}> = ({
  mode,
  onStartVoiceChat,
  onStartTextChat,
  isActive = false,
  isLoading = false,
  textChatActive = false,
  setTextChatActive = () => {},
  message = "",
  setMessage = () => {},
  onSendMessage = () => {},
  onRepeat = () => {},
  showSettings = false,
  setShowSettings = () => {},
  sessionState = SessionState.INACTIVE,
  connectionQuality = "UNKNOWN",
  isUserTalking = false,
  isAvatarTalking = false,
  isMuted = false,
  onMuteToggle = () => {},
  isStreamReady = false,
  onStartListening = () => {},
  onStopListening = () => {},
  onInterrupt = () => {},
  onKeepAlive = () => {},
  videoRef,
  videoContainerRef,
  isFullscreen = false,
  onToggleFullscreen = () => {},
  customAvatarId = "",
  setCustomAvatarId = () => {},
  customVoiceId = "",
  setCustomVoiceId = () => {},
  customContextId = "",
  setCustomContextId = () => {},
}) => {
  const handleSendTextMessage = () => {
    if (message.trim()) {
      onSendMessage();
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold mb-2">
          CounselPrep - Live AI Avatar
        </h1>
      </header>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onStartVoiceChat}
          disabled={isLoading}
          variant="primary"
        >
          {isActive ? "Stop Voice Chat" : "Start Voice Chat"}
        </Button>
      </div>

      {/* Video Container */}
      <div
        ref={videoContainerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        {!isStreamReady && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {sessionState === SessionState.INACTIVE
              ? "Click Start Voice Chat to begin"
              : "Loading avatar..."}
          </div>
        )}
        <button
          className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-700 transition-colors z-10"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* Settings Dropdown */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex items-center justify-between text-left transition-colors"
        >
          <span className="font-medium">Settings</span>
          <span className="text-gray-400">{showSettings ? "▲" : "▼"}</span>
        </button>
        {showSettings && (
          <div className="p-4 bg-gray-800 space-y-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Session state:</span>{" "}
                <span className="text-white">{sessionState}</span>
              </div>
              <div>
                <span className="text-gray-400">Connection quality:</span>{" "}
                <span className="text-white">{connectionQuality}</span>
              </div>
              {mode === "FULL" && (
                <div>
                  <span className="text-gray-400">User talking:</span>{" "}
                  <span className="text-white">
                    {isUserTalking ? "Yes" : "No"}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Avatar talking:</span>{" "}
                <span className="text-white">
                  {isAvatarTalking ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {mode === "FULL" && isActive && (
              <div className="pt-2 border-t border-gray-700">
                <Button onClick={onMuteToggle} variant="secondary">
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>
            )}

            <div className="pt-2 border-t border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Avatar ID
                </label>
                <input
                  type="text"
                  value={customAvatarId}
                  onChange={(e) => setCustomAvatarId(e.target.value)}
                  placeholder="Enter custom avatar ID"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Voice ID
                </label>
                <input
                  type="text"
                  value={customVoiceId || ""}
                  onChange={(e) => setCustomVoiceId?.(e.target.value)}
                  placeholder="Enter custom voice ID"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Context ID
                </label>
                <input
                  type="text"
                  value={customContextId || ""}
                  onChange={(e) => setCustomContextId?.(e.target.value)}
                  placeholder="Enter custom context ID"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={onStartListening}
                  variant="secondary"
                  disabled={!isStreamReady}
                >
                  Start Listening
                </Button>
                <Button
                  onClick={onStopListening}
                  variant="secondary"
                  disabled={!isStreamReady}
                >
                  Stop Listening
                </Button>
                <Button
                  onClick={onInterrupt}
                  variant="secondary"
                  disabled={!isStreamReady}
                >
                  Interrupt
                </Button>
                <Button onClick={onKeepAlive} variant="secondary">
                  Keep Alive
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Chat Input */}
      {textChatActive && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Text Chat</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendTextMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <Button onClick={handleSendTextMessage} variant="primary">
              Send
            </Button>
            <Button
              onClick={() => {
                if (message.trim()) {
                  onRepeat(message);
                  setMessage("");
                }
              }}
              variant="secondary"
            >
              Repeat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const LiveAvatarSessionComponentInner: React.FC<{
  mode: "FULL" | "CUSTOM";
  onSessionStopped: () => void;
  onGetSessionToken?: (
    customAvatarId?: string,
    customVoiceId?: string,
    customContextId?: string,
  ) => Promise<void>;
  shouldStartVoiceChat?: boolean;
  onVoiceChatStarted?: () => void;
}> = ({
  mode,
  onSessionStopped,
  onGetSessionToken,
  shouldStartVoiceChat = false,
  onVoiceChatStarted,
}) => {
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [textChatActive, setTextChatActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pendingVoiceChat, setPendingVoiceChat] = useState(false);
  const [customAvatarId, setCustomAvatarId] = useState(
    "0930fd59-c8ad-434d-ad53-b391a1768720",
  );
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [customContextId, setCustomContextId] = useState("");
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    connectionQuality,
    keepAlive,
    attachElement,
  } = useSession();
  const {
    isAvatarTalking,
    isUserTalking,
    isMuted,
    isActive,
    isLoading,
    start,
    stop,
    mute,
    unmute,
  } = useVoiceChat();

  const { interrupt, repeat, startListening, stopListening } =
    useAvatarActions(mode);

  const { sendMessage } = useTextChat(mode);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  // Don't auto-start session - wait for user to click "Start Voice Chat"
  // Only start if user clicked Start Voice Chat or shouldStartVoiceChat is true
  useEffect(() => {
    if (
      (pendingVoiceChat || shouldStartVoiceChat) &&
      sessionState === SessionState.INACTIVE
    ) {
      startSession();
      if (shouldStartVoiceChat) {
        setPendingVoiceChat(true);
      }
    }
  }, [pendingVoiceChat, shouldStartVoiceChat, sessionState, startSession]);

  // Start voice chat once stream is ready if user clicked Start Voice Chat
  useEffect(() => {
    if (
      (pendingVoiceChat || shouldStartVoiceChat) &&
      isStreamReady &&
      !isActive &&
      sessionState !== SessionState.INACTIVE
    ) {
      start();
      setPendingVoiceChat(false);
      if (shouldStartVoiceChat && onVoiceChatStarted) {
        onVoiceChatStarted();
      }
    }
  }, [
    pendingVoiceChat,
    shouldStartVoiceChat,
    isStreamReady,
    isActive,
    sessionState,
    start,
    onVoiceChatStarted,
  ]);

  const handleStartVoiceChat = async () => {
    // If voice chat is already active, stop it and reset everything
    if (isActive) {
      await stop();
      await stopSession();
      onSessionStopped();
      setPendingVoiceChat(false);
      setTextChatActive(false);
      return;
    }

    // If we need a token, get it first
    if (onGetSessionToken) {
      try {
        await onGetSessionToken(
          customAvatarId || undefined,
          customVoiceId || undefined,
          customContextId || undefined,
        );
        setPendingVoiceChat(true);
        setTextChatActive(false);
        return;
      } catch (error) {
        console.error("Failed to get session token:", error);
        return;
      }
    }

    // Start the session if it's not already started
    if (sessionState === SessionState.INACTIVE) {
      startSession();
      setPendingVoiceChat(true);
      setTextChatActive(false);
      return;
    }

    // Start voice chat if stream is ready
    if (isStreamReady) {
      await start();
      setPendingVoiceChat(false);
    } else {
      setPendingVoiceChat(true);
    }
    setTextChatActive(false);
  };

  const handleStartTextChat = async () => {
    // If we need a token, get it first
    if (onGetSessionToken) {
      try {
        await onGetSessionToken();
        setTextChatActive(true);
        return;
      } catch (error) {
        console.error("Failed to get session token:", error);
        return;
      }
    }

    // Start the session if it's not already started
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    }
    setTextChatActive(true);
    if (isActive) {
      stop();
    }
  };

  const handleSendTextMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <LiveAvatarSessionUI
      mode={mode}
      onStartVoiceChat={handleStartVoiceChat}
      onStartTextChat={handleStartTextChat}
      isActive={isActive}
      isLoading={isLoading}
      textChatActive={textChatActive}
      setTextChatActive={setTextChatActive}
      message={message}
      setMessage={setMessage}
      onSendMessage={handleSendTextMessage}
      onRepeat={repeat}
      showSettings={showSettings}
      setShowSettings={setShowSettings}
      sessionState={sessionState}
      connectionQuality={connectionQuality}
      isUserTalking={isUserTalking}
      isAvatarTalking={isAvatarTalking}
      isMuted={isMuted}
      onMuteToggle={() => {
        if (isMuted) {
          unmute();
        } else {
          mute();
        }
      }}
      isStreamReady={isStreamReady}
      onStartListening={startListening}
      onStopListening={stopListening}
      onInterrupt={interrupt}
      onKeepAlive={keepAlive}
      videoRef={videoRef}
      videoContainerRef={videoContainerRef}
      isFullscreen={isFullscreen}
      onToggleFullscreen={toggleFullscreen}
      customAvatarId={customAvatarId}
      setCustomAvatarId={setCustomAvatarId}
      customVoiceId={customVoiceId}
      setCustomVoiceId={setCustomVoiceId}
      customContextId={customContextId}
      setCustomContextId={setCustomContextId}
    />
  );
};

export const LiveAvatarSession: React.FC<{
  mode: "FULL" | "CUSTOM";
  sessionAccessToken: string;
  onSessionStopped: () => void;
  onGetSessionToken?: (
    customAvatarId?: string,
    customVoiceId?: string,
    customContextId?: string,
  ) => Promise<void>;
  shouldStartVoiceChat?: boolean;
  onVoiceChatStarted?: () => void;
}> = ({
  mode,
  sessionAccessToken,
  onSessionStopped,
  onGetSessionToken,
  shouldStartVoiceChat,
  onVoiceChatStarted,
}) => {
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [textChatActive, setTextChatActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [customAvatarId, setCustomAvatarId] = useState(
    "0930fd59-c8ad-434d-ad53-b391a1768720",
  );
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [customContextId, setCustomContextId] = useState("");

  // Reset all local state when session token is cleared
  useEffect(() => {
    if (!sessionAccessToken) {
      setMessage("");
      setShowSettings(false);
      setTextChatActive(false);
    }
  }, [sessionAccessToken]);

  const handleStartVoiceChat = async () => {
    if (onGetSessionToken) {
      // We need a token - get default one
      try {
        await onGetSessionToken(
          customAvatarId || undefined,
          customVoiceId || undefined,
          customContextId || undefined,
        );
        return;
      } catch (error) {
        console.error("Failed to get session token:", error);
        return;
      }
    }
  };

  const handleStartTextChat = async () => {
    if (onGetSessionToken) {
      try {
        await onGetSessionToken();
        setTextChatActive(true);
        return;
      } catch (error) {
        console.error("Failed to get session token:", error);
        return;
      }
    }
    setTextChatActive(true);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!sessionAccessToken) {
    return (
      <LiveAvatarSessionUI
        mode={mode}
        onStartVoiceChat={handleStartVoiceChat}
        onStartTextChat={handleStartTextChat}
        isActive={false}
        isLoading={false}
        textChatActive={textChatActive}
        setTextChatActive={setTextChatActive}
        message={message}
        setMessage={setMessage}
        onSendMessage={() => {}}
        onRepeat={() => {}}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        sessionState={SessionState.INACTIVE}
        connectionQuality="UNKNOWN"
        isUserTalking={false}
        isAvatarTalking={false}
        isMuted={false}
        onMuteToggle={() => {}}
        isStreamReady={false}
        onStartListening={() => {}}
        onStopListening={() => {}}
        onInterrupt={() => {}}
        onKeepAlive={() => {}}
        videoRef={videoRef}
        videoContainerRef={videoContainerRef}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        customAvatarId={customAvatarId}
        setCustomAvatarId={setCustomAvatarId}
        customVoiceId={customVoiceId}
        setCustomVoiceId={setCustomVoiceId}
        customContextId={customContextId}
        setCustomContextId={setCustomContextId}
      />
    );
  }

  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <LiveAvatarSessionComponentInner
        mode={mode}
        onSessionStopped={onSessionStopped}
        onGetSessionToken={onGetSessionToken}
        shouldStartVoiceChat={shouldStartVoiceChat}
        onVoiceChatStarted={onVoiceChatStarted}
      />
    </LiveAvatarContextProvider>
  );
};
