"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("密码错误");
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <p className="text-sm text-sage mb-2">Life Lab</p>
          <h1 className="text-2xl font-semibold text-ink">我的生活实验室</h1>
          <p className="text-sm text-ink/35 mt-3">请输入密码以继续</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            autoFocus
            className="w-full rounded-md border border-line bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage text-center"
          />
          {error && (
            <p className="text-sm text-clay text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            {loading ? "验证中…" : "进入"}
          </button>
        </form>

        <p className="text-xs text-ink/25 text-center mt-8">
          密码由网站管理员设置
        </p>
      </div>
    </div>
  );
}