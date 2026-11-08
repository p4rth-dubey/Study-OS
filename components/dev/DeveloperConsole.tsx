/** Interactive Developer Console Subsystem.
 * Terminal-style CLI with command history, autocomplete, clear, and server-side execution. */
"use client";

import { useEffect, useRef, useState } from "react";

const AUTOCOMPLETE_LIST = [
  "dev.help",
  "dev.status",
  "dev.modules",
  "dev.flags",
  "dev.enable ",
  "dev.disable ",
  "dev.users",
  "dev.logs",
  "dev.maintenance on",
  "dev.maintenance off",
  "dev.reset-demo",
  "clear",
];

interface LogEntry {
  type: "input" | "output" | "error";
  text: string;
  time: string;
}

export default function DeveloperConsole() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      type: "output",
      text: "StudyOS God Mode Kernel v2.6.0 [Root Authenticated]\nType 'dev.help' to inspect command directory.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === "clear") {
      setLogs([]);
      setInput("");
      return;
    }

    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIdx(-1);
    setLogs((prev) => [
      ...prev,
      { type: "input", text: `root@studyos-kernel:~# ${trimmed}`, time: new Date().toLocaleTimeString() },
    ]);
    setInput("");
    setIsExecuting(true);

    try {
      const res = await fetch("/api/dev/console", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        setLogs((prev) => [
          ...prev,
          { type: "error", text: data.output || "Command error", time: new Date().toLocaleTimeString() },
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          { type: "output", text: data.output, time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        { type: "error", text: `Network error: ${(err as Error).message}`, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = AUTOCOMPLETE_LIST.find((item) => item.startsWith(input));
      if (match) {
        setInput(match);
      }
    }
  };

  return (
    <div className="flex flex-col h-[650px] rounded-2xl border border-[#3b1d60] bg-[#07040f] overflow-hidden shadow-[0_0_50px_rgba(88,28,135,0.25)]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#2d164d] bg-[#120a22] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]/80 inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#f59e0b]/80 inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]/80 inline-block" />
          <span className="ml-3 font-mono text-xs text-[#c084fc] font-semibold">
            StudyOS Kernel Root Shell [bash-restricted]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#6b7280]">Tab Autocomplete | ↑/↓ History</span>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#9ca3af] hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed space-y-2 select-text"
      >
        {logs.map((log, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              log.type === "input"
                ? "text-[#a855f7] font-semibold"
                : log.type === "error"
                ? "text-[#f87171]"
                : "text-[#e2e8f0]"
            }`}
          >
            {log.text}
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-[#a855f7] animate-pulse">
            <span>Executing command...</span>
          </div>
        )}
      </div>

      {/* Terminal Input Row */}
      <div className="border-t border-[#2d164d] bg-[#0c0617] p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#a855f7] font-bold">root@studyos-kernel:~#</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'dev.help' or 'dev.status'..."
            className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-[#4b5563]"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
