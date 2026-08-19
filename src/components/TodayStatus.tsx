"use client";

type DailyStatus = {
  mood: string | null;
  energy: number | null;
  focus: number | null;
  bodyFatigue: number | null;
  morningSpirit: number | null;
  highPoint: string | null;
  lowPoint: string | null;
};

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-ink/50">{label}</span>
      {value !== null && value !== undefined ? (
        <>
          <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all"
              style={{ width: `${(value / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-ink/60 w-5 text-right">{value}</span>
        </>
      ) : (
        <span className="text-xs text-ink/25">未记录</span>
      )}
    </div>
  );
}

export default function TodayStatus({ data }: { data: DailyStatus | null }) {
  if (!data) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-ink/40">尚未进行日终记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 情绪 */}
      {data.mood && (
        <p className="text-sm text-ink/70 leading-relaxed">
          <span className="text-xs text-ink/40">情绪 · </span>
          {data.mood}
        </p>
      )}

      {/* 评分条 */}
      <div className="space-y-2">
        <ScoreBar label="精力" value={data.energy} />
        <ScoreBar label="专注力" value={data.focus} />
        <ScoreBar label="身体疲劳" value={data.bodyFatigue} />
        <ScoreBar label="起床精神" value={data.morningSpirit} />
      </div>

      {/* 高光/低谷 */}
      {(data.highPoint || data.lowPoint) && (
        <div className="pt-1 space-y-1.5">
          {data.highPoint && (
            <p className="text-xs text-ink/50 leading-relaxed">
              <span className="text-sage">＋</span> {data.highPoint}
            </p>
          )}
          {data.lowPoint && (
            <p className="text-xs text-ink/50 leading-relaxed">
              <span className="text-clay">−</span> {data.lowPoint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}