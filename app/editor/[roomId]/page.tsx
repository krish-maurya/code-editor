"use client";

import ACTIONS from "@/server/Actions";
import { initSocket } from "@/server/socket";
import { syncSpaceHighlight, syncSpaceTheme } from "@/theme";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";


// ─── Types ──────────────────────────────────────────────
type FileNode = { name: string; type: "file" | "folder"; ext?: string; children?: FileNode[] };
type User = { id: string; name: string; color: string; avatar: string; active: boolean };
type ChatMsg = { id: string; user: string; color: string; text: string; time: string };
type Tab = { id: string; name: string; ext: string; dirty: boolean };

// ─── Constants ──────────────────────────────────────────
const PLATFORM = "SyncSpace";

const colors = ["#34d399", "#f472b6", "#60a5fa", "#fbbf24", "#a78bfa", "#67e8f9", "#f87171", "#6ee7b7"];

// const USERS: User[] = [
//   { id: "u1", name: "You", color: "#34d399", avatar: "Y", active: true },
//   { id: "u2", name: "Priya M", color: "#f472b6", avatar: "PM", active: true },
//   { id: "u3", name: "Carlos V", color: "#60a5fa", avatar: "CV", active: true },
//   { id: "u4", name: "Yuki T", color: "#fbbf24", avatar: "YT", active: false },
// ];

const INITIAL_FILE_TREE: FileNode[] = [];

const INIT_TABS: Tab[] = [];

const INIT_CHAT: ChatMsg[] = [];


const TERMINAL_LINES = [
  { t: "cmd", v: "$ npm run dev" },
  { t: "info", v: "▸ Next.js 15.2.0" },
  { t: "info", v: "▸ Local:   http://localhost:3000" },
  { t: "info", v: "▸ Network: http://192.168.1.5:3000" },
  { t: "ok", v: "✓ Ready in 847ms" },
  { t: "log", v: "[socket] client u2 joined room XKCD-9A3F-B71E" },
  { t: "log", v: "[socket] client u3 joined room XKCD-9A3F-B71E" },
  { t: "warn", v: "⚠ cursor broadcast debounce: 120ms → consider 60ms" },
];

// ─── Helpers ────────────────────────────────────────────
const EXT_COLOR: Record<string, string> = {
  tsx: "text-sky-400", ts: "text-blue-400", css: "text-pink-400",
  js: "text-yellow-400", jsx: "text-yellow-400", json: "text-yellow-400", ico: "text-gray-500",
};
const extColor = (ext = "") => EXT_COLOR[ext] ?? "text-gray-400";

const EXT_DOT: Record<string, string> = {
  tsx: "bg-sky-400", ts: "bg-blue-400", css: "bg-pink-400",
  js: "bg-yellow-400", jsx: "bg-yellow-400", json: "bg-yellow-400",
};
const extDot = (ext = "") => EXT_DOT[ext] ?? "bg-gray-500";

function FileIcon({ ext }: { ext?: string }) {
  const c = extColor(ext);
  return <span className={`text-xs font-bold font-mono ${c}`}>{(ext ?? "?").slice(0, 3)}</span>;
}

// ─── Sub-components ─────────────────────────────────────
function FileTree({ nodes, depth = 0, onOpen }: { nodes: FileNode[]; depth?: number; onOpen: (n: FileNode) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set(["src", "components"]));
  return (
    <ul className="text-xs leading-none">
      {nodes.map((n) => (
        <li key={n.name}>
          {n.type === "folder" ? (
            <>
              <button
                onClick={() => setOpen((p) => {
                  const s = new Set(p);
                  if (s.has(n.name)) {
                    s.delete(n.name);
                  } else {
                    s.add(n.name);
                  }
                  return s;
                })}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                className="flex items-center gap-1.5 w-full py-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 rounded transition"
              >
                <span className="text-gray-600">{open.has(n.name) ? "▾" : "▸"}</span>
                <span className="text-gray-500">📁</span>
                <span>{n.name}</span>
              </button>
              {open.has(n.name) && n.children && (
                <FileTree nodes={n.children} depth={depth + 1} onOpen={onOpen} />
              )}
            </>
          ) : (
            <button
              onClick={() => onOpen(n)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className="flex items-center gap-1.5 w-full py-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 rounded transition"
            >
              <span className="w-3" />
              <FileIcon ext={n.ext} />
              <span className="truncate">{n.name}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function CollabEditorPage() {
  const [tabs, setTabs] = useState<Tab[]>(INIT_TABS);
  const [activeTab, setActiveTab] = useState("t2");
  const [code, setCode] = useState('');
  const [tabCodeMap, setTabCodeMap] = useState<Record<string, string>>({});
  const [fileTree, setFileTree] = useState<FileNode[]>(INITIAL_FILE_TREE);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState<string>("");
  const [renamingOriginalName, setRenamingOriginalName] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(INIT_CHAT);
  const [termOpen, setTermOpen] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [sidePanel, setSidePanel] = useState<"files" | "users" | "chat">("files");
  const [leftWidth] = useState(220);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [USERS, setUSERS] = useState<User[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const activeTabRef = useRef<string>(activeTab);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomId as string;
  const user = searchParams.get("user");

  if (!roomId || !user) {
    router.push('/');
    return null;
  }

  const socketRef = useRef<any>(null);

  function getAvatar(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return name.trim().slice(0, 2).toUpperCase();
  }

  useEffect(() => {
    const init = async () => {

      const handleErrors = (err: any) => {
        console.log("socket connect failed , try aging", err);
        router.push('/'); // redirect to home page to join again
      }

      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err: any) => { handleErrors(err) });
      socketRef.current.on('connect_failed', (err: any) => { handleErrors(err) });

      // Listen for the "JOINED" event from the server

      socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId }: { clients: any[], userName: string, socketId: string }) => {
        console.log("JOINED EVENT:", clients);
        if (userName !== user) {
          toast.success(`${userName} joined the room!`, {
            icon: "👋",
          });
        }
        setUSERS(clients.map((c) => {
          return {
            id: c.socketId,
            name: c.userName,
            color: colors[Math.floor(Math.random() * colors.length)],
            avatar: getAvatar(c.userName),
            active: true,
          }
        }));
      });

      // Listen for the "DISCONNECTED" event from the server

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }: { socketId: string, userName: string }) => {
        setUSERS((prev) =>
          prev.map((u) =>
            u.id === socketId ? { ...u, active: false } : u
          )
        );
      });

      // code sync and cursor updates will be handled in separate useEffects

      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }: { code: string }) => {
        if (!editorRef.current) return;
        const currentCode = editorRef.current?.state.doc.toString();

        if (code !== currentCode) {
          setCode(code);
          const currentTabId = activeTabRef.current;
          if (currentTabId) {
            setTabCodeMap((prev) => ({ ...prev, [currentTabId]: code }));
          }
        }
      })

      socketRef.current.on(ACTIONS.CHAT_MESSAGE, ({ message }: { message: ChatMsg }) => {
        setChatMsgs((p) => [...p, message]);
      })

      socketRef.current.emit(ACTIONS.JOIN, { roomId: roomId, userName: user ?? "Anonymous" });
    }


    init();

    return () => {
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.off(ACTIONS.SYNC_CODE);
      socketRef.current?.off(ACTIONS.CHAT_MESSAGE);
      socketRef.current?.disconnect();
    }

  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) {
      setCode("");
      return;
    }
    setCode(tabCodeMap[activeTab] ?? "");
  }, [activeTab, tabCodeMap]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;

    const msg = {
      id: `c${Date.now()}`,
      user: user || "Anonymous",
      color: USERS.find(u => u.name === user)?.color || "#34d399",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }


    socketRef.current.emit(ACTIONS.CHAT_MESSAGE, {
      roomId,
      message: msg
    })

    setChatMsgs((p) => [...p, msg]);
    setChatInput("");
  }, [chatInput]);

  const openFile = (n: FileNode) => {
    if (tabs.find((t) => t.name === n.name)) {
      setActiveTab(tabs.find((t) => t.name === n.name)!.id);
      return;
    }
    const id = `t${Date.now()}`;
    setTabs((p) => [...p, { id, name: n.name, ext: n.ext ?? "", dirty: false }]);
    setTabCodeMap((p) => ({ ...p, [id]: p[id] ?? "" }));
    setActiveTab(id);
  };

  const handleCreateFile = () => {
    // create a new untitled file with incremental suffix, no prompt
    const base = "untitled";
    let idx = 1;
    const existingNames = new Set([...fileTree.map(f => f.name), ...tabs.map(t => t.name)]);
    let name = "";
    while (true) {
      name = `${base}${idx}.tsx`;
      if (!existingNames.has(name)) break;
      idx += 1;
    }
    const ext = "tsx";
    const newNode: FileNode = { name, type: 'file', ext };
    setFileTree((p) => [...p, newNode]);
    const id = `t${Date.now()}`;
    setTabs((p) => [...p, { id, name: newNode.name, ext: newNode.ext ?? "", dirty: false }]);
    setTabCodeMap((p) => ({ ...p, [id]: "" }));
    setActiveTab(id);
    // start inline rename like VS Code
    setRenamingTabId(id);
    setRenamingValue(newNode.name);
    setRenamingOriginalName(newNode.name);
  };

  const commitRename = (tabId: string) => {
    const newName = renamingValue.trim() || `untitled.tsx`;
    const ext = newName.split('.').pop() ?? "";

    setTabs((prev) => prev.map((t) => t.id === tabId ? { ...t, name: newName, ext } : t));
    setFileTree((prev) => prev.map((f) => {
      if (f.name === (renamingOriginalName ?? renamingValue)) {
        return { ...f, name: newName, ext };
      }
      return f;
    }));
    setRenamingTabId(null);
    setRenamingValue("");
    setRenamingOriginalName(null);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    setTabCodeMap((p) => {
      const nextMap = { ...p };
      delete nextMap[id];
      return nextMap;
    });
    if (activeTab === id) setActiveTab(next[next.length - 1]?.id ?? "");
  };

  const activeTabData = tabs.find((t) => t.id === activeTab);

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(roomId).then(() => {
        toast.success("Room URL copied to clipboard!", {
          icon: "🔗",
        });
      });
    } catch (error) {
      toast.error("Failed to copy room URL.", {
        icon: "❌",
      });
    }
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.LEAVE, { roomId, userName: user });
      socketRef.current.disconnect();
      router.push('/');
      toast.success("You left the room.", {
        icon: "👋"
      });
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-gray-300 overflow-hidden font-['JetBrains_Mono',monospace] select-none">

      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-4 h-11 bg-[#161b22] border-b border-gray-800 shrink-0 z-10">
        {/* Left: logo + room */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">{PLATFORM}</span>
          </div>
          <span className="text-gray-700">|</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded font-mono">{roomId}</span>
        </div>

        {/* Center: user avatars */}
        <div className="flex items-center gap-1">
          {USERS.map((u) => (
            <div key={u.id} title={u.name} className="relative">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-900"
                style={{ backgroundColor: u.active ? u.color : "#374151" }}
              >
                {u.avatar}
              </div>
              {u.active && (
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#161b22]" />
              )}
            </div>
          ))}
          <span className="text-xs text-gray-600 ml-1">{USERS.filter((u) => u.active).length} online</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleLeave} className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition">Leave</button>
          <button onClick={handleShare} className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition">Share</button>
          <button className="text-xs text-emerald-900 bg-emerald-500 hover:bg-emerald-400 px-3 py-1 rounded-md font-bold transition">
            Run ▶
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── ICON RAIL ── */}
        <div className="flex flex-col items-center gap-1 w-10 bg-[#161b22] border-r border-gray-800 py-2 shrink-0">
          {(["files", "users", "chat"] as const).map((p) => {
            const icons = { files: "🗂", users: "👥", chat: "💬" };
            return (
              <button
                key={p}
                onClick={() => {
                  setSidePanel(p);
                  setLeftPanelOpen(true);
                }}
                title={p}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition
                  ${sidePanel === p ? "bg-gray-700 text-white" : "text-gray-600 hover:text-gray-300 hover:bg-gray-800"}`}
              >
                {icons[p]}
              </button>
            );
          })}
        </div>

        {/* ── LEFT SIDEBAR ── */}
        <div
          className="bg-[#161b22] border-r border-gray-800 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
          style={{ width: leftPanelOpen ? leftWidth : 0 }}
        >
          <div
            className="px-3 py-2 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 transition"
            onClick={() => setLeftPanelOpen((p) => !p)}
            title={leftPanelOpen ? "Collapse panel" : "Expand panel"}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap">{sidePanel}</span>
            </div>
            <div className="flex items-center gap-2">
              {sidePanel === "files" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCreateFile(); }}
                  title="Create file"
                  className="text-xs text-gray-700 hover:bg-gray-800/40 px-2 py-0.5 rounded transition"
                >
                  +
                </button>
              )}
              <span className="text-xs text-gray-700">{leftPanelOpen ? "◂" : "▸"}</span>
            </div>
          </div>

          {leftPanelOpen && <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
            {sidePanel === "files" && (
              <FileTree nodes={fileTree} onOpen={openFile} />
            )}

            {sidePanel === "users" && (
              <div className="p-2 flex flex-col gap-1">
                {USERS.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-800/40">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-900 shrink-0"
                      style={{ backgroundColor: u.active ? u.color : "#374151" }}
                    >
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-600">{u.active ? "editing" : "away"}</p>
                    </div>
                    {u.active && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: u.color }} />}
                  </div>
                ))}
              </div>
            )}

            {sidePanel === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                  {chatMsgs.map((m) => (
                    <div key={m.id}>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.user}</span>
                        <span className="text-[9px] text-gray-700">{m.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-2 border-t border-gray-800">
                  <div className="flex gap-1">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat()}
                      placeholder="Message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-gray-200 placeholder-gray-600 outline-none focus:border-emerald-600 transition min-w-0"
                    />
                    <button
                      onClick={sendChat}
                      className="px-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[11px] font-bold text-gray-950 transition"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>}
        </div>

        {/* ── EDITOR AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-end bg-[#161b22] border-b border-gray-800 shrink-0 overflow-x-auto">
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border-r border-gray-800 cursor-pointer text-xs shrink-0 transition
                  ${activeTab === t.id
                    ? "bg-[#0d1117] text-gray-200 border-t-2 border-t-emerald-500"
                    : "text-gray-600 hover:text-gray-400 hover:bg-[#0d1117]/60"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${extDot(t.ext)}`} />
                {t.id === renamingTabId ? (
                  <input
                    value={renamingValue}
                    onChange={(e) => setRenamingValue(e.target.value)}
                    onBlur={() => commitRename(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(t.id);
                      if (e.key === 'Escape') {
                        setRenamingTabId(null);
                        setRenamingValue("");
                        setRenamingOriginalName(null);
                      }
                    }}
                    autoFocus
                    className="bg-[#0d1117] border border-gray-700 px-1 py-0.5 rounded text-xs font-mono w-36"
                  />
                ) : (
                  <span className="font-mono">{t.name}</span>
                )}
                {t.dirty && <span className="text-orange-400 text-[10px]">●</span>}
                <button
                  onClick={(e) => closeTab(t.id, e)}
                  className="ml-1 text-gray-700 hover:text-gray-300 text-[10px] leading-none"
                >✕</button>
              </div>
            ))}
            {/* create-file button removed from tab bar (kept in left panel header) */}
            <div className="flex-1" />
            {/* Breadcrumb */}
            {activeTabData && (
              <div className="px-4 text-[10px] text-gray-700 shrink-0 whitespace-nowrap">
                src / components / <span className={extColor(activeTabData.ext)}>{activeTabData.name}</span>
              </div>
            )}
          </div>

          {/* Code + Terminal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Code view */}
            <div className="flex-1 overflow-hidden relative">
              {/* Remote cursor badge */}
              <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                {USERS.filter((u) => u.active && u.name !== user).map((u) => (
                  <span
                    key={u.id}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded text-gray-900"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.name}
                  </span>
                ))}
              </div>

              <CodeMirror
                value={code}
                height="100%"
                extensions={[javascript({ jsx: true, typescript: true }), syncSpaceTheme,
                  syncSpaceHighlight]}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  highlightActiveLineGutter: true,
                }}
                onCreateEditor={(editor) => {
                  editorRef.current = editor;
                }}
                onChange={(value) => {
                  setCode(value);
                  if (activeTab) {
                    setTabCodeMap((prev) => ({ ...prev, [activeTab]: value }));
                  }
                  socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code: value,
                  })
                }}
                onUpdate={(viewUpdate) => {
                  if (!viewUpdate.selectionSet && !viewUpdate.docChanged) return;
                  const head = viewUpdate.state.selection.main.head;
                  const line = viewUpdate.state.doc.lineAt(head);
                  setCursor({ line: line.number, col: head - line.from + 1 });
                }}
                className="h-full text-xs"
              />
            </div>

            {/* Terminal */}
            <div className={`shrink-0 border-t border-gray-800 bg-[#0a0f14] transition-all ${termOpen ? "h-44" : "h-8"}`}>
              <div
                className="flex items-center gap-3 px-4 h-8 border-b border-gray-800 cursor-pointer hover:bg-gray-800/40 transition"
                onClick={() => setTermOpen((p) => !p)}
              >
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Terminal</span>
                <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">npm run dev</span>
                <div className="flex-1" />
                <span className="text-gray-700 text-xs">{termOpen ? "▾" : "▴"}</span>
              </div>
              {termOpen && (
                <div className="p-3 overflow-y-auto h-36 text-[11px] leading-5 font-mono">
                  {TERMINAL_LINES.map((l, i) => (
                    <div key={i} className={
                      l.t === "cmd" ? "text-white" :
                        l.t === "info" ? "text-gray-500" :
                          l.t === "ok" ? "text-emerald-400" :
                            l.t === "warn" ? "text-yellow-400" :
                              "text-gray-600"
                    }>{l.v}</div>
                  ))}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-emerald-400">$</span>
                    <span className="w-1.5 h-3.5 bg-emerald-400 animate-pulse inline-block ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: live chat always visible ── */}
        <div
          className="bg-[#161b22] border-l border-gray-800 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
          style={{ width: rightPanelOpen ? 240 : 36 }}
        >
          <div
            className="px-3 py-2 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 transition"
            onClick={() => setRightPanelOpen((p) => !p)}
            title={rightPanelOpen ? "Collapse chat" : "Expand chat"}
          >
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap">
              {rightPanelOpen ? "Live Chat" : "LC"}
            </span>
            <span className="text-xs text-gray-700">{rightPanelOpen ? "▸" : "◂"}</span>
          </div>
          {rightPanelOpen && <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {chatMsgs.map((m) => (
              <div key={m.id}>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.user}</span>
                  <span className="text-[9px] text-gray-700">{m.time}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{m.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>}
          {rightPanelOpen && <div className="p-3 border-t border-gray-800">
            <div className="flex gap-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Send a message…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-[11px] text-gray-200 placeholder-gray-600 outline-none focus:border-emerald-600 transition min-w-0"
              />
              <button
                onClick={sendChat}
                className="px-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-gray-950 transition"
              >→</button>
            </div>
          </div>}
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <footer className="h-6 bg-emerald-600 flex items-center px-4 gap-4 shrink-0">
        <span className="text-[10px] font-bold text-emerald-950">⎇ main</span>
        <span className="text-[10px] text-emerald-800">|</span>
        <span className="text-[10px] text-emerald-900">TypeScript · TSX</span>
        <span className="text-[10px] text-emerald-800">|</span>
        <span className="text-[10px] text-emerald-900">Ln {cursor.line}, Col {cursor.col}</span>
        <div className="flex-1" />
        <span className="text-[10px] text-emerald-900">
          {USERS.filter((u) => u.active).length} collaborators · {PLATFORM}
        </span>
        <span className="text-[10px] text-emerald-800">|</span>
        <span className="text-[10px] text-emerald-950 font-bold">● Live</span>
      </footer>
    </div>
  );
}