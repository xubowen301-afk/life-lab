import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center">
        <p className="text-6xl mb-4">404</p>
        <h2 className="text-xl font-semibold text-ink/70 mb-2">页面不存在</h2>
        <p className="text-sm text-ink/40 mb-6">你找的页面不在这里。</p>
        <Link href="/" className="text-sm text-sage underline underline-offset-4">
          ← 返回今日
        </Link>
      </div>
    </div>
  );
}