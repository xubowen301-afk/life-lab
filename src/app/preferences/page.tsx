"use client";

import { useEffect, useState, useCallback } from "react";

const CATEGORIES = [
  { key: "director", label: "导演", icon: "🎬" },
  { key: "song", label: "歌曲", icon: "🎵" },
  { key: "movie", label: "电影", icon: "🍿" },
  { key: "book", label: "书籍", icon: "📚" }
] as const;

type Preference = {
  id: string;
  category: string;
  name: string;
  note: string | null;
};

export default function PreferencesPage() {
  const [items, setItems] = useState<Preference[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 新增表单
  const [newCategory, setNewCategory] = useState("director");
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("q", search);

    const res = await fetch(`/api/preferences?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [activeCategory, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function addItem() {
    if (!newName.trim()) return;
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCategory, name: newName.trim(), note: newNote.trim() || null })
    });
    setNewName("");
    setNewNote("");
    fetchItems();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/preferences?id=${id}`, { method: "DELETE" });
    fetchItems();
  }

  const categoryLabel = (key: string) =>
    CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return (
    <div className="flex-1 py-8">
      <h2 className="text-3xl font-semibold tracking-normal mb-6">我的喜好</h2>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-md px-3 py-1.5 text-sm ${
            !activeCategory ? "bg-ink text-paper" : "border border-line text-ink/60"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
              activeCategory === c.key ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* 搜索 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索..."
        className="w-full max-w-xs rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage mb-6"
      />

      {/* 新增 */}
      <div className="flex flex-wrap items-end gap-2 mb-8 p-4 rounded-lg border border-line bg-white/40">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-md border border-line bg-white/60 px-2 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="名称"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1 min-w-[120px] rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="备注（可选）"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1 min-w-[120px] rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <button
          onClick={addItem}
          disabled={!newName.trim()}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          添加
        </button>
      </div>

      {/* 列表 */}
      {loading ? (
        <p className="text-sm text-ink/30">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink/40">还没有收藏，开始添加吧</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center justify-between rounded-md border border-line bg-white/40 px-4 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-ink/30 font-mono">
                  {categoryLabel(item.category)}
                </span>
                <span className="text-sm text-ink/80 truncate">{item.name}</span>
                {item.note && (
                  <span className="text-xs text-ink/35 truncate hidden sm:inline">
                    {item.note}
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="ml-2 text-xs text-ink/20 hover:text-clay transition-colors opacity-0 group-hover:opacity-100"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}