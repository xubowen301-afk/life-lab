"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password })
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json();
      setError(data.error || "注册失败");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <p className="text-sm text-sage mb-2">Life Lab</p>
          <h1 className="text-2xl font-semibold text-ink">创建账号</h1>
          <p className="text-sm text-ink/35 mt-3">开始你的个人生活实验</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            autoFocus
            className="w-full rounded-md border border-line bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage text-center"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少4位）"
            className="w-full rounded-md border border-line bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage text-center"
          />
          {error && (
            <p className="text-sm text-clay text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email.trim() || password.length < 4}
            className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            {loading ? "注册中…" : "注册"}
          </button>
        </form>

        <p className="text-sm text-ink/35 text-center mt-6">
          已有账号？{" "}
          <Link href="/login" className="text-sage underline underline-offset-4">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}