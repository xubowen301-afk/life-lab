"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RECORD_TYPES = [
  { key: "daily", label: "每日状态", icon: "📊" },
  { key: "sleep", label: "睡眠", icon: "😴" },
  { key: "coffee", label: "咖啡", icon: "☕" },
  { key: "social", label: "社交", icon: "👥" },
  { key: "work", label: "工作/学习", icon: "💻" },
  { key: "location", label: "地点", icon: "📍" },
  { key: "content", label: "内容消费", icon: "🎬" },
  { key: "event", label: "重要事件", icon: "📌" },
  { key: "dream", label: "做梦", icon: "💭" },
  { key: "physiology", label: "经期", icon: "🩸" },
  { key: "weather", label: "天气", icon: "🌤" }
] as const;

type RecordType = (typeof RECORD_TYPES)[number]["key"];

function toLocalDatetime(iso: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function nowLocal() {
  return toLocalDatetime(new Date().toISOString());
}

function todayLocal() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<RecordType>("daily");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, unknown>>({
    date: todayLocal(),
    time: nowLocal(),
    amountMl: 300,
    socialType: "",
    startTime: "",
    endTime: "",
    workType: "work",
    contentType: "song",
    isImportant: false,
    isPeriod: false,
    hadDream: true,
    energy: null,
    focus: null,
    bodyFatigue: null,
    morningSpirit: null,
    painLevel: null,
    temperature: null,
    humidity: null,
    rainfall: null
  });

  function setField(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // 基本表单验证
    const validations: Record<string, () => string | null> = {
      daily: () => !form.date ? "请选择日期" : null,
      sleep: () => !form.sleepStart || !form.sleepEnd ? "请填写入睡和起床时间" : new Date(form.sleepEnd as string) <= new Date(form.sleepStart as string) ? "起床时间必须晚于入睡时间" : null,
      coffee: () => !form.time ? "请选择时间" : (form.amountMl as number) <= 0 ? "摄入量必须大于0" : null,
      social: () => !form.socialType ? "请填写社交类型" : !form.startTime || !form.endTime ? "请填写开始和结束时间" : null,
      work: () => !form.startTime || !form.endTime ? "请填写开始和结束时间" : new Date(form.endTime as string) <= new Date(form.startTime as string) ? "结束时间必须晚于开始时间" : null,
      location: () => !form.name ? "请填写地点名称" : null,
      content: () => !form.title ? "请填写名称" : null,
      event: () => !form.content ? "请填写内容" : null
    };

    const validate = validations[activeType];
    if (validate) {
      const error = validate();
      if (error) {
        setMessage({ type: "error", text: error });
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeType, ...form })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "记录成功" });
        router.refresh();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "记录失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 py-8">
      <h2 className="text-3xl font-semibold tracking-normal mb-6">快速记录</h2>

      {/* 类型选择器 */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {RECORD_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveType(t.key);
              setMessage(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeType === t.key
                ? "bg-ink text-paper"
                : "bg-white/40 border border-line text-ink/60 hover:bg-white"
            }`}
          >
            <span className="text-xs">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {activeType === "daily" && <DailyForm form={form} setField={setField} />}
        {activeType === "sleep" && <SleepForm form={form} setField={setField} />}
        {activeType === "coffee" && <CoffeeForm form={form} setField={setField} />}
        {activeType === "social" && <SocialForm form={form} setField={setField} />}
        {activeType === "work" && <WorkForm form={form} setField={setField} />}
        {activeType === "location" && <LocationForm form={form} setField={setField} />}
        {activeType === "content" && <ContentForm form={form} setField={setField} />}
        {activeType === "event" && <EventForm form={form} setField={setField} />}
        {activeType === "dream" && <DreamForm form={form} setField={setField} />}
        {activeType === "physiology" && <PhysiologyForm form={form} setField={setField} />}
        {activeType === "weather" && <WeatherForm form={form} setField={setField} />}

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-sage" : "text-clay"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {submitting ? "保存中…" : "保存记录"}
        </button>
      </form>
    </div>
  );
}

// ─── 表单组件 ────────────────────────────────────────

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink/50 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:ring-1 focus:ring-sage resize-none"
    />
  );
}

function ScoreInput({
  value,
  onChange,
  label
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={10}
          value={value ?? 0}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            onChange(v === 0 ? null : v);
          }}
          className="flex-1 accent-sage"
        />
        <span className="text-xs font-mono text-ink/60 w-5 text-right">
          {value ?? "-"}
        </span>
      </div>
    </Field>
  );
}

// ─── 每日状态 ────────────────────────────────────────

function DailyForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="日期">
        <Input
          type="date"
          value={form.date as string}
          onChange={(v) => setField("date", v)}
        />
      </Field>
      <Field label="情绪">
        <Input
          value={(form.mood as string) || ""}
          onChange={(v) => setField("mood", v)}
          placeholder="今天整体感觉如何？"
        />
      </Field>
      <ScoreInput
        label="精力 (0–10)"
        value={form.energy as number | null}
        onChange={(v) => setField("energy", v)}
      />
      <ScoreInput
        label="专注力 (0–10)"
        value={form.focus as number | null}
        onChange={(v) => setField("focus", v)}
      />
      <ScoreInput
        label="身体疲劳 (0–10)"
        value={form.bodyFatigue as number | null}
        onChange={(v) => setField("bodyFatigue", v)}
      />
      <ScoreInput
        label="起床精神程度 (0–10)"
        value={form.morningSpirit as number | null}
        onChange={(v) => setField("morningSpirit", v)}
      />
      <Field label="今天什么让我感觉特别好？">
        <Textarea
          value={(form.highPoint as string) || ""}
          onChange={(v) => setField("highPoint", v)}
          placeholder="例如：和朋友聊天..."
        />
      </Field>
      <Field label="今天什么让我感觉特别消耗？">
        <Textarea
          value={(form.lowPoint as string) || ""}
          onChange={(v) => setField("lowPoint", v)}
          placeholder="例如：开了很长的会..."
        />
      </Field>
    </>
  );
}

// ─── 睡眠 ────────────────────────────────────────────

function SleepForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="日期（入睡日期）">
        <Input
          type="date"
          value={form.date as string}
          onChange={(v) => setField("date", v)}
        />
      </Field>
      <Field label="入睡时间">
        <Input
          type="datetime-local"
          value={form.sleepStart as string}
          onChange={(v) => setField("sleepStart", v)}
        />
      </Field>
      <Field label="起床时间">
        <Input
          type="datetime-local"
          value={form.sleepEnd as string}
          onChange={(v) => setField("sleepEnd", v)}
        />
      </Field>
      <p className="text-xs text-ink/35">
        睡眠时长由系统自动计算
      </p>
    </>
  );
}

// ─── 咖啡 ────────────────────────────────────────────

function CoffeeForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="喝咖啡时间">
        <Input
          type="datetime-local"
          value={form.time as string}
          onChange={(v) => setField("time", v)}
        />
      </Field>
      <Field label="摄入量 (ml)">
        <input
          type="number"
          value={form.amountMl as number}
          onChange={(e) => setField("amountMl", parseInt(e.target.value) || 0)}
          min={0}
          className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
        />
      </Field>
    </>
  );
}

// ─── 社交 ────────────────────────────────────────────

function SocialForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="社交类型">
        <Input
          value={(form.socialType as string) || ""}
          onChange={(v) => setField("socialType", v)}
          placeholder="例如：朋友1对1、聚会、同事"
        />
      </Field>
      <Field label="描述">
        <Textarea
          value={(form.description as string) || ""}
          onChange={(v) => setField("description", v)}
          placeholder="例如：和朋友吃饭"
        />
      </Field>
      <Field label="开始时间">
        <Input
          type="datetime-local"
          value={form.startTime as string}
          onChange={(v) => setField("startTime", v)}
        />
      </Field>
      <Field label="结束时间">
        <Input
          type="datetime-local"
          value={form.endTime as string}
          onChange={(v) => setField("endTime", v)}
        />
      </Field>
      <Field label="这次社交让我感觉如何？">
        <Textarea
          value={(form.feeling as string) || ""}
          onChange={(v) => setField("feeling", v)}
          placeholder="例如：很放松，感觉重新获得了能量"
        />
      </Field>
    </>
  );
}

// ─── 工作/学习 ───────────────────────────────────────

function WorkForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="类型">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setField("workType", "work")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              form.workType === "work" ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            💻 工作
          </button>
          <button
            type="button"
            onClick={() => setField("workType", "study")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              form.workType === "study" ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            📖 学习
          </button>
        </div>
      </Field>
      <Field label="开始时间">
        <Input
          type="datetime-local"
          value={form.startTime as string}
          onChange={(v) => setField("startTime", v)}
        />
      </Field>
      <Field label="结束时间">
        <Input
          type="datetime-local"
          value={form.endTime as string}
          onChange={(v) => setField("endTime", v)}
        />
      </Field>
      <p className="text-xs text-ink/35">时长由系统自动计算</p>
    </>
  );
}

// ─── 地点 ────────────────────────────────────────────

function LocationForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="地点名称">
        <Input
          value={(form.name as string) || ""}
          onChange={(v) => setField("name", v)}
          placeholder="例如：家、公司、咖啡馆"
        />
      </Field>
      <Field label="时间">
        <Input
          type="datetime-local"
          value={form.time as string}
          onChange={(v) => setField("time", v)}
        />
      </Field>
    </>
  );
}

// ─── 内容消费 ────────────────────────────────────────

function ContentForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="类型">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setField("contentType", "song")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              form.contentType === "song" ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            🎵 歌曲
          </button>
          <button
            type="button"
            onClick={() => setField("contentType", "movie")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              form.contentType === "movie" ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            🎬 电影
          </button>
        </div>
      </Field>
      <Field label={form.contentType === "song" ? "歌曲名称" : "电影名称"}>
        <Input
          value={(form.title as string) || ""}
          onChange={(v) => setField("title", v)}
          placeholder={form.contentType === "song" ? "歌曲名" : "电影名"}
        />
      </Field>
      <Field label="时间">
        <Input
          type="datetime-local"
          value={form.time as string}
          onChange={(v) => setField("time", v)}
        />
      </Field>
    </>
  );
}

// ─── 重要事件 ────────────────────────────────────────

function EventForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="时间">
        <Input
          type="datetime-local"
          value={form.time as string}
          onChange={(v) => setField("time", v)}
        />
      </Field>
      <Field label="内容">
        <Textarea
          value={(form.content as string) || ""}
          onChange={(v) => setField("content", v)}
          placeholder="今天发生了什么？"
        />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isImportant as boolean}
          onChange={(e) => setField("isImportant", e.target.checked)}
          className="accent-sage"
        />
        <span className="text-sm text-ink/60">标记为重要事件</span>
      </label>
    </>
  );
}

// ─── 做梦 ────────────────────────────────────────────

function DreamForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="日期">
        <Input
          type="date"
          value={form.date as string}
          onChange={(v) => setField("date", v)}
        />
      </Field>
      <Field label="今天做梦了吗？">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setField("hadDream", true)}
            className={`rounded-md px-4 py-2 text-sm ${
              form.hadDream ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            是
          </button>
          <button
            type="button"
            onClick={() => setField("hadDream", false)}
            className={`rounded-md px-4 py-2 text-sm ${
              form.hadDream === false ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            否
          </button>
        </div>
      </Field>
    </>
  );
}

// ─── 经期 ────────────────────────────────────────────

function PhysiologyForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="是否来月经">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setField("isPeriod", true)}
            className={`rounded-md px-4 py-2 text-sm ${
              form.isPeriod ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            是
          </button>
          <button
            type="button"
            onClick={() => setField("isPeriod", false)}
            className={`rounded-md px-4 py-2 text-sm ${
              form.isPeriod === false ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            否
          </button>
        </div>
      </Field>
      <Field label="经期开始日期">
        <Input
          type="date"
          value={(form.startDate as string) || ""}
          onChange={(v) => setField("startDate", v || null)}
        />
      </Field>
      <Field label="经期结束日期">
        <Input
          type="date"
          value={(form.endDate as string) || ""}
          onChange={(v) => setField("endDate", v || null)}
        />
      </Field>
      <Field label="当天状态">
        <Input
          value={(form.dayStatus as string) || ""}
          onChange={(v) => setField("dayStatus", v)}
          placeholder="身体感受"
        />
      </Field>
      <Field label="情绪状态">
        <Input
          value={(form.moodState as string) || ""}
          onChange={(v) => setField("moodState", v)}
          placeholder="情绪感受"
        />
      </Field>
      <ScoreInput
        label="疼痛程度 (0–10)"
        value={form.painLevel as number | null}
        onChange={(v) => setField("painLevel", v)}
      />
    </>
  );
}

// ─── 天气 ────────────────────────────────────────────

function WeatherForm({
  form,
  setField
}: {
  form: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <Field label="日期">
        <Input
          type="date"
          value={form.date as string}
          onChange={(v) => setField("date", v)}
        />
      </Field>
      <Field label="温度 (°C)">
        <input
          type="number"
          value={(form.temperature as number) ?? ""}
          onChange={(e) => setField("temperature", e.target.value ? parseFloat(e.target.value) : null)}
          step="0.1"
          className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
        />
      </Field>
      <Field label="天气状况">
        <Input
          value={(form.condition as string) || ""}
          onChange={(v) => setField("condition", v)}
          placeholder="例如：晴、多云、雨"
        />
      </Field>
      <Field label="湿度 (%)">
        <input
          type="number"
          value={(form.humidity as number) ?? ""}
          onChange={(e) => setField("humidity", e.target.value ? parseFloat(e.target.value) : null)}
          step="0.1"
          className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
        />
      </Field>
      <Field label="降水 (mm)">
        <input
          type="number"
          value={(form.rainfall as number) ?? ""}
          onChange={(e) => setField("rainfall", e.target.value ? parseFloat(e.target.value) : null)}
          step="0.1"
          className="w-full rounded-md border border-line bg-white/60 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-sage"
        />
      </Field>
    </>
  );
}