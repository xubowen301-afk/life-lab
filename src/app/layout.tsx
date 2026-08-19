import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Lab",
  description: "我的生活实验室"
};

const navItems = [
  { label: "今日", href: "/" },
  { label: "记录", href: "/record" },
  { label: "分析", href: "/analysis" },
  { label: "AI", href: "/ai" },
  { label: "喜好", href: "/preferences" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="min-h-screen bg-paper text-ink">
          <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6">
            <header className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm text-sage">Life Lab</p>
                <h1 className="text-2xl font-semibold tracking-normal">我的生活实验室</h1>
              </div>
              <nav className="flex gap-1 rounded-md border border-line bg-white/40 p-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded px-3 py-2 text-sm text-ink/75 transition-colors hover:bg-ink hover:text-paper"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}