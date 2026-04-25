"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useReducer } from "react";

const PLATFORM_NAME = "SyncSpace";

function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = [4, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("")
    )
    .join("-");
}

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleGenerate = useCallback(() => {
    setRoomId(generateRoomId());
    setCopied(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomId]);

  const handleJoin = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!roomId.trim() || !userName.trim()) return;
      alert(`Joining room "${roomId}" as "${userName}" on ${PLATFORM_NAME}`);
      router.push(`/editor/roomId=${encodeURIComponent(roomId)}?user=${encodeURIComponent(userName)}`);
    },
    [roomId, userName]
  );

  const isReady = roomId.trim().length > 0 && userName.trim().length >= 3;

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

        {/* Platform badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase font-mono">
            {PLATFORM_NAME}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
          Join a Room
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter your details or generate a Room ID to get started.
        </p>

        <div className="flex flex-col gap-5">

          {/* Room ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="roomId"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. XKCD-9A3F-B71E"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              {roomId && (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Room ID"
                  className="px-3.5 bg-gray-800 border border-gray-700 rounded-xl text-emerald-400 hover:bg-gray-700 hover:border-emerald-600 transition text-sm font-mono"
                >
                  {copied ? "✓" : "⧉"}
                </button>
              )}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 border border-dashed border-emerald-800 text-emerald-400 text-sm rounded-xl py-2.5 hover:bg-emerald-950 hover:border-emerald-500 transition font-medium"
          >
            <span className="text-base leading-none">⟳</span>
            Randomly Generate Room ID
          </button>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="userName"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Username
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. sonic_dev"
              autoComplete="off"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          {/* Join button */}
          <button
            type="button"
            onClick={handleJoin}
            disabled={!isReady}
            className="mt-1 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-gray-950 font-bold text-base rounded-xl py-3 transition shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/40"
          >
            Join Room →
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-xs mt-6">
          Powered by{" "}
          <span className="text-gray-500 font-semibold">{PLATFORM_NAME}</span>{" "}
          · Real-time collaboration
        </p>
      </div>
    </main>
  );
}