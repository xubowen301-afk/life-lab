"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Experiment = {
  id: string;
  question: string;
  variables: string;
  metrics: string;
  period: string;
  startDate: string;
  endDate: string | null;
  status: string;
  conclusion: string | null;
  createdAt: string;
};

export default function AiPage() {
  const [tab, setTab] = useState<"chat" | "experiments">("chat");

  return (
    <div className="flex-1 py-8">
      <h2 className="text-3xl font-semibold tracking-normal mb-2">我的数据助手</h2>
      <p className="text-sm text-ink/40 mb-6">你想了解自己的什么？</p>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 rounded-md border border-line bg-white/40 p-1 w-fit">
        <button
          onClick={() => setTab("chat")}
          className={`rounded px-4 py-1.5 text-sm ${
            tab === "chat" ? "bg-ink text-paper" : "text-ink/60"
          }`}
        >
          💬 对话
        </button>
        <button
          onClick={() => setTab("experiments")}
          className={`rounded px-4 py-1.5 text-sm ${
            tab === "experiments" ? "bg-ink text-paper" : "text-ink/60"
          }`}
        >
          🧪 实验
        </button>
      </div>

      {tab === "chat" ? <ChatPanel /> : <ExperimentsPanel />}
    </div>
  );
}

// ─── 对话面板 ────────────────────────────────────────

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好，我是你的数据助手。\n\n你可以问我任何关于你生活数据的问题，比如：\n\n• 我最近睡眠怎么样？\n• 什么情况下我最有精力？\n• 咖啡什么时候喝最合适？\n\n如果想研究某个假设，可以告诉我，我会帮你创建观察实验。"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId })
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "抱歉，出了点问题。" }
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "网络错误，请重试。" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-4 mb-6 min-h-[300px] max-h-[50vh] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "bg-ink text-paper" : "border border-line bg-white/40 text-ink/80"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-line bg-white/40 px-4 py-3 text-sm text-ink/30">思考中…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="例如：我最近睡眠怎么样？"
          disabled={loading}
          className="flex-1 rounded-md border border-line bg-white/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-85 disabled:opacity-30"
        >
          发送
        </button>
      </div>
    </div>
  );
}

// ─── 实验面板 ────────────────────────────────────────

function ExperimentsPanel() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    question: "",
    period: "30天",
    variables: "",
    metrics: "",
    startDate: new Date().toISOString().slice(0, 10)
  });

  const fetchExperiments = useCallback(async () => {
    const res = await fetch("/api/experiments");
    const data = await res.json();
    setExperiments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  async function createExperiment() {
    if (!form.question.trim()) return;
    await fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: form.question,
        variables: form.variables ? form.variables.split(",").map((s) => s.trim()) : [],
        metrics: form.metrics ? form.metrics.split(",").map((s) => s.trim()) : [],
        period: form.period,
        startDate: form.startDate
      })
    });
    setShowForm(false);
    setForm({ question: "", period: "30天", variables: "", metrics: "", startDate: new Date().toISOString().slice(0, 10) });
    fetchExperiments();
  }

  async function completeExperiment(id: string) {
    const conclusion = prompt("实验结论（可选）：");
    await fetch("/api/experiments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "completed", conclusion: conclusion || null })
    });
    fetchExperiments();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide">个人实验</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:opacity-85"
        >
          ＋ 新建实验
        </button>
      </div>

      {/* 新建表单 */}
      {showForm && (
        <div className="mb-6 p-4 rounded-lg border border-line bg-white/40 space-y-3">
          <div>
            <label className="text-xs text-ink/40 block mb-1">研究问题</label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="例如：下午喝咖啡是否影响我的睡眠？"
              className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink/40 block mb-1">观察周期</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="text-xs text-ink/40 block mb-1">开始日期</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink/40 block mb-1">研究变量（逗号分隔）</label>
            <input
              type="text"
              value={form.variables}
              onChange={(e) => setForm((f) => ({ ...f, variables: e.target.value }))}
              placeholder="例如：咖啡摄入量, 入睡时间"
              className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label className="text-xs text-ink/40 block mb-1">核心指标（逗号分隔）</label>
            <input
              type="text"
              value={form.metrics}
              onChange={(e) => setForm((f) => ({ ...f, metrics: e.target.value }))}
              placeholder="例如：睡眠时长, 精力"
              className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={createExperiment}
              disabled={!form.question.trim()}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-85 disabled:opacity-30"
            >
              创建实验
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-line px-4 py-2 text-sm text-ink/60 hover:bg-white"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 实验列表 */}
      {loading ? (
        <p className="text-sm text-ink/30">加载中…</p>
      ) : experiments.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">🧪</p>
          <p className="text-sm text-ink/40">还没有实验</p>
          <p className="text-xs text-ink/25 mt-1">创建实验来验证你的生活假设</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {experiments.map((exp) => (
            <li key={exp.id} className="rounded-lg border border-line bg-white/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink/80">{exp.question}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink/40">
                      {exp.period}
                    </span>
                    <span className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink/40">
                      {new Date(exp.startDate).toLocaleDateString("zh-CN")}
                      {exp.endDate ? ` – ${new Date(exp.endDate).toLocaleDateString("zh-CN")}` : " – 至今"}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        exp.status === "active"
                          ? "bg-sage/10 text-sage"
                          : exp.status === "completed"
                          ? "bg-ink/5 text-ink/40"
                          : "bg-ink/5 text-ink/30 line-through"
                      }`}
                    >
                      {exp.status === "active" ? "进行中" : exp.status === "completed" ? "已完成" : "已取消"}
                    </span>
                  </div>
                  {exp.conclusion && (
                    <p className="mt-2 text-xs text-ink/50 leading-relaxed">{exp.conclusion}</p>
                  )}
                </div>
                {exp.status === "active" && (
                  <button
                    onClick={() => completeExperiment(exp.id)}
                    className="shrink-0 rounded border border-line px-2 py-1 text-xs text-ink/40 hover:bg-white"
                  >
                    结束
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}